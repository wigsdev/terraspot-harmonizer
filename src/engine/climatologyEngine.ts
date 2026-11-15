/**
 * Climatology Anomaly Curves & Sensor Harmonization Audit Transformation Engine
 * Complies with specs/007-climatology-sensor-audit/contracts/climatology-engine.contract.ts
 */

import type {
  RegionCube,
  ClimatologyCurvePoint,
  SensorAuditSeriesPoint,
  BetaFactorEntry,
  HarmonizedMonthlyRecord,
} from '../types';

const DEFAULT_MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Transforms active cube data and selected year into 12 monthly climatological points.
 * Includes baseline median (M_m), IQR envelope ([P25, P75]), P90 threshold,
 * active year observations, and anomaly departures.
 */
export function generateClimatologyCurveData(
  cube?: RegionCube | null,
  selectedYear: number = 2024,
  monthNamesShort?: string[],
): ClimatologyCurvePoint[] {
  const monthLabels = monthNamesShort && monthNamesShort.length === 12
    ? monthNamesShort
    : DEFAULT_MONTH_NAMES_SHORT;

  const points: ClimatologyCurvePoint[] = [];

  // Index monthly records by month for fast lookup for the selected year
  const recordsByMonth = new Map<number, HarmonizedMonthlyRecord>();
  if (cube?.monthly_records) {
    for (const record of cube.monthly_records) {
      if (record.year === selectedYear) {
        recordsByMonth.set(record.month, record);
      }
    }
  }

  for (let m = 1; m <= 12; m++) {
    const monthKey = String(m);
    const clim = cube?.climatology_by_month?.[monthKey];

    const baselineMedian = Math.round((clim?.median ?? 0) * 10) / 10;
    const baselineP25 = Math.round((clim?.p25 ?? 0) * 10) / 10;
    const baselineP75 = Math.round((clim?.p75 ?? 0) * 10) / 10;
    const baselineP90 = Math.round((clim?.p90 ?? 0) * 10) / 10;
    const iqrRange: [number, number] = [baselineP25, baselineP75];

    // Check future month safeguard (e.g. 2026 months 11 and 12 are pending observation)
    const isFuture = selectedYear === 2026 && m > 10;

    let activeYearValue: number | null = null;
    let departurePercentage: number | null = null;
    let robustZScore: number | null = null;
    let isCritical = false;

    if (!isFuture) {
      const record = recordsByMonth.get(m);
      if (record) {
        activeYearValue = record.harmonized_hotspots;
        departurePercentage = record.departure_percentage;
        robustZScore = record.robust_z_score;
        isCritical = (record.harmonized_hotspots >= baselineP90 && baselineP90 > 0) ||
          (record.robust_z_score >= 2.0) ||
          record.anomaly_status === 'CRITICAL';
      } else if (cube) {
        // Year exists in records generally, but no specific record for this month
        activeYearValue = 0;
        departurePercentage = baselineMedian > 0 ? -100 : 0;
        robustZScore = 0;
        isCritical = false;
      }
    }

    points.push({
      month: m,
      monthName: monthLabels[m - 1],
      baselineMedian,
      baselineP25,
      baselineP75,
      baselineP90,
      iqrRange,
      activeYearValue,
      departurePercentage,
      robustZScore,
      isCritical,
      isFuture,
    });
  }

  return points;
}

/**
 * Transforms 2000-2026 historical monthly observations into a continuous
 * 322-point multi-decadal time series across all 4 sensor harmonization stages.
 */
export function generateSensorAuditSeries(
  cube?: RegionCube | null,
): SensorAuditSeriesPoint[] {
  if (!cube?.monthly_records || cube.monthly_records.length === 0) {
    return [];
  }

  // Sort chronologically (year asc, month asc)
  const sortedRecords = [...cube.monthly_records].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  return sortedRecords.map((record) => {
    const date = `${record.year}-${String(record.month).padStart(2, '0')}`;
    const isOverlapPeriod = record.year >= 2012 && record.year <= 2025;
    const isStepJumpAnchor = record.year === 2012 && record.month === 1;

    // Before 2012, VIIRS was not in orbit; represent as null so Recharts doesn't plot a zero line
    const rawViirsCount = record.year < 2012
      ? null
      : (record.raw_viirs_count ?? null);

    const rawModisCount = record.raw_modis_count ?? 0;

    // Co-registered AFCD (Stage 2 geometric grid aggregation)
    const afcdCoregistered = (record.afcd_viirs && record.afcd_viirs > 0)
      ? record.afcd_viirs
      : (record.afcd_modis ?? 0);

    const harmonizedHotspots = record.harmonized_hotspots ?? 0;

    const sensorEra = record.sensor_era ?? (
      record.year < 2012
        ? 'MODIS_SOLO'
        : record.year > 2025
          ? 'VIIRS_CONTINUITY'
          : 'DUAL_SENSOR_FUSION'
    );

    return {
      date,
      year: record.year,
      month: record.month,
      rawModisCount,
      rawViirsCount,
      afcdCoregistered,
      harmonizedHotspots,
      sensorEra,
      isOverlapPeriod,
      isStepJumpAnchor,
    };
  });
}

/**
 * Extracts the 12 monthly empirical scaling factors (beta_1 to beta_12)
 * from the active region's dual-sensor overlap baseline (2012-2025).
 */
export function extractBetaFactorEntries(
  cube?: RegionCube | null,
  monthNamesShort?: string[],
): BetaFactorEntry[] {
  const monthLabels = monthNamesShort && monthNamesShort.length === 12
    ? monthNamesShort
    : DEFAULT_MONTH_NAMES_SHORT;

  const entries: BetaFactorEntry[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthKey = String(m);
    const rawBeta = cube?.seasonal_beta?.[monthKey] ?? 1.0;
    const betaFactor = Math.round(Number(rawBeta) * 10000) / 10000;

    entries.push({
      month: m,
      monthName: monthLabels[m - 1],
      betaFactor,
      formattedBeta: `${betaFactor.toFixed(2)}x`,
      sampleCount: 14, // 14 years of dual-sensor overlap (2012-2025)
    });
  }

  return entries;
}

/**
 * TerraSpot Harmonizer - Burning Activity Calendar Matrix Engine
 * Adheres to specs/006-burning-calendar-matrix/contracts/matrix-engine.contract.ts
 * and docs/02-modis-viirs-harmonization-methodology.md.
 */

import type {
  CalendarCellData,
  CalendarColumnSummary,
  CalendarMatrixViewMode,
  CalendarRowSummary,
  ColorCellStyle,
  HarmonizedMonthlyRecord,
  MonthlyClimatology,
  PaletteType,
  RegionCube,
  SensorObservationEra,
} from '../types';
import {
  getAccessibleCellStyle,
  normalizeDivergingAnomaly,
  normalizeValue,
} from './colorRamps';

export const MATRIX_START_YEAR = 2000;
export const MATRIX_END_YEAR = 2026;
export const TOTAL_MATRIX_YEARS = MATRIX_END_YEAR - MATRIX_START_YEAR + 1; // 27 years
export const TOTAL_MONTHS_PER_YEAR = 12;

export const DEFAULT_MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Determine sensor observation era based on historical remote sensing regime.
 */
export function getSensorObservationEra(year: number): SensorObservationEra {
  if (year <= 2011) {
    return 'MODIS_SOLO';
  }
  if (year <= 2025) {
    return 'DUAL_SENSOR_FUSION';
  }
  return 'VIIRS_CONTINUITY';
}

/**
 * Format numerical cell value string according to active analytical projection.
 */
export function formatCellValue(
  record: Partial<HarmonizedMonthlyRecord>,
  viewMode: CalendarMatrixViewMode,
  isFutureMonth: boolean,
): string {
  if (isFutureMonth) {
    return 'N/A';
  }

  switch (viewMode) {
    case 'harmonized': {
      const val = record.harmonized_hotspots ?? 0;
      return Math.round(val).toLocaleString();
    }
    case 'anomaly': {
      const dep = record.departure_percentage ?? 0;
      const sign = dep > 0 ? '+' : '';
      return `${sign}${Math.round(dep)}%`;
    }
    case 'frp': {
      const frp = record.mean_frp_mw ?? 0;
      return frp.toFixed(1);
    }
    case 'raw': {
      const rawCount = (record.raw_modis_count ?? 0) + (record.raw_viirs_count ?? 0);
      return Math.round(rawCount).toLocaleString();
    }
    default:
      return '';
  }
}

/**
 * Resolves WCAG 2.1 AA compliant cell styling (hex background, text color, contrast ratio).
 * In 'anomaly' mode, strictly locks to the diverging blue-white-red palette.
 */
export function resolveCellVisual(
  record: Partial<HarmonizedMonthlyRecord>,
  viewMode: CalendarMatrixViewMode,
  palette: PaletteType,
  maxHarmonized: number,
  maxFrp: number = 80.0,
  maxRaw: number = 1000,
  isFutureMonth: boolean = false,
): ColorCellStyle {
  if (isFutureMonth) {
    return {
      backgroundHex: '#1E293B',
      textHex: '#F8FAFC',
      contrastRatio: 4.5,
      normalizedT: 0.0,
    };
  }

  let normalizedT = 0.0;
  let targetPalette: PaletteType = palette;

  switch (viewMode) {
    case 'harmonized': {
      const val = record.harmonized_hotspots ?? 0;
      normalizedT = normalizeValue(val, 0, Math.max(1, maxHarmonized));
      targetPalette = palette;
      break;
    }
    case 'anomaly': {
      const dep = record.departure_percentage ?? 0;
      normalizedT = normalizeDivergingAnomaly(dep, 100.0);
      targetPalette = 'diverging'; // Strict Diverging Lock
      break;
    }
    case 'frp': {
      const frp = record.mean_frp_mw ?? 0;
      normalizedT = normalizeValue(frp, 10.0, Math.max(25.0, maxFrp));
      targetPalette = palette;
      break;
    }
    case 'raw': {
      const rawCount = (record.raw_modis_count ?? 0) + (record.raw_viirs_count ?? 0);
      normalizedT = normalizeValue(rawCount, 0, Math.max(1, maxRaw));
      targetPalette = palette;
      break;
    }
  }

  return getAccessibleCellStyle(targetPalette, normalizedT);
}

/**
 * Transforms regional monthly records into a complete 27-row x 12-col matrix grid.
 */
export function generateMatrixGrid(
  cube?: RegionCube | null,
  viewMode: CalendarMatrixViewMode = 'harmonized',
  palette: PaletteType = 'inferno',
  monthNames: string[] = DEFAULT_MONTH_NAMES_SHORT,
): CalendarCellData[][] {
  const records = cube?.monthly_records ?? [];

  // Build lookup index: `year-month` -> HarmonizedMonthlyRecord
  const lookup = new Map<string, HarmonizedMonthlyRecord>();
  let maxHarmonized = 1;
  let maxFrp = 80.0;
  let maxRaw = 1;

  for (const rec of records) {
    const key = `${rec.year}-${rec.month}`;
    lookup.set(key, rec);

    if (rec.harmonized_hotspots > maxHarmonized) {
      maxHarmonized = rec.harmonized_hotspots;
    }
    if (rec.mean_frp_mw > maxFrp) {
      maxFrp = rec.mean_frp_mw;
    }
    const rawSum = (rec.raw_modis_count ?? 0) + (rec.raw_viirs_count ?? 0);
    if (rawSum > maxRaw) {
      maxRaw = rawSum;
    }
  }

  const grid: CalendarCellData[][] = [];

  for (let y = MATRIX_START_YEAR; y <= MATRIX_END_YEAR; y++) {
    const row: CalendarCellData[] = [];
    const sensorEra = getSensorObservationEra(y);

    for (let m = 1; m <= TOTAL_MONTHS_PER_YEAR; m++) {
      const monthName = monthNames[m - 1] ?? DEFAULT_MONTH_NAMES_SHORT[m - 1];
      const key = `${y}-${m}`;
      const rec = lookup.get(key);

      // Observation horizon constraint: 2026 data currently ends at October
      const isFutureMonth = !rec && (y === MATRIX_END_YEAR && m > 10);

      const harmonizedHotspots = rec?.harmonized_hotspots ?? 0;
      const rawModisHotspots = rec?.raw_modis_count ?? 0;
      const rawViirsHotspots = rec?.raw_viirs_count ?? 0;
      const baselineMedian = rec?.climatological_median ?? 0;
      const departurePercentage = rec?.departure_percentage ?? 0;
      const robustZScore = rec?.robust_z_score ?? 0;
      const anomalyStatus = rec?.anomaly_status ?? 'NORMAL';
      const meanFrpMw = rec?.mean_frp_mw ?? 0;
      const p90FrpMw = rec?.p90_frp_mw ?? 0;
      const nightFraction = rec?.night_fraction ?? 0;
      const fireRegimeClass = rec?.regime_class ?? 'AGRICULTURAL_BURN';

      // Critical anomaly threshold: P90 reached or Robust Z-Score >= 2.0
      const isCriticalAnomaly =
        !isFutureMonth &&
        (anomalyStatus === 'CRITICAL' ||
          robustZScore >= 2.0 ||
          (rec?.p90_threshold !== undefined && harmonizedHotspots >= rec.p90_threshold));

      const formattedValue = formatCellValue(rec ?? {}, viewMode, isFutureMonth);

      const cellStyle = resolveCellVisual(
        rec ?? {},
        viewMode,
        palette,
        maxHarmonized,
        maxFrp,
        maxRaw,
        isFutureMonth,
      );

      row.push({
        year: y,
        month: m,
        monthName,
        sensorEra,
        harmonizedHotspots,
        rawModisHotspots,
        rawViirsHotspots,
        baselineMedian,
        departurePercentage,
        robustZScore,
        anomalyStatus,
        meanFrpMw,
        p90FrpMw,
        nightFraction,
        fireRegimeClass,
        isFutureMonth,
        isCriticalAnomaly,
        formattedValue,
        cellStyle,
      });
    }

    grid.push(row);
  }

  return grid;
}

/**
 * Calculates annual aggregated totals and peak months for each of the 27 rows.
 */
export function computeRowSummaries(grid: CalendarCellData[][]): CalendarRowSummary[] {
  if (!grid.length) return [];

  // First pass: compute totals and find historical max annual sum
  const rowsRaw = grid.map((row) => {
    const year = row[0]?.year ?? MATRIX_START_YEAR;
    const sensorEra = row[0]?.sensorEra ?? 'MODIS_SOLO';

    let totalHarmonized = 0;
    let peakMonth = 1;
    let peakHarmonized = -1;
    let maxDeparture = -Infinity;

    for (const cell of row) {
      if (cell.isFutureMonth) continue;

      totalHarmonized += cell.harmonizedHotspots;

      if (cell.harmonizedHotspots > peakHarmonized) {
        peakHarmonized = cell.harmonizedHotspots;
        peakMonth = cell.month;
      }

      if (cell.departurePercentage > maxDeparture) {
        maxDeparture = cell.departurePercentage;
      }
    }

    return {
      year,
      sensorEra,
      totalHarmonized,
      peakMonth,
      peakHarmonized: Math.max(0, peakHarmonized),
      maxDeparture: maxDeparture === -Infinity ? 0 : maxDeparture,
    };
  });

  const maxHistoricalAnnualTotal = Math.max(
    ...rowsRaw.map((r) => r.totalHarmonized),
    1,
  );

  return rowsRaw.map((r) => ({
    ...r,
    relativeBarWidth: Math.min(
      100.0,
      Number(((r.totalHarmonized / maxHistoricalAnnualTotal) * 100).toFixed(1)),
    ),
  }));
}

/**
 * Calculates multi-year monthly baseline medians and critical thresholds for columns.
 */
export function computeColumnSummaries(
  grid: CalendarCellData[][],
  monthNames: string[] = DEFAULT_MONTH_NAMES_SHORT,
  climatologyByMonth?: Record<string, MonthlyClimatology>,
): CalendarColumnSummary[] {
  const summaries: CalendarColumnSummary[] = [];

  for (let m = 1; m <= TOTAL_MONTHS_PER_YEAR; m++) {
    const monthName = monthNames[m - 1] ?? DEFAULT_MONTH_NAMES_SHORT[m - 1];
    const climatology = climatologyByMonth ? climatologyByMonth[String(m)] : undefined;

    let historicalMax = -1;
    let historicalMaxYear = MATRIX_START_YEAR;
    const completedValues: number[] = [];

    for (const row of grid) {
      const cell = row[m - 1];
      if (!cell || cell.isFutureMonth) continue;

      completedValues.push(cell.harmonizedHotspots);

      if (cell.harmonizedHotspots > historicalMax) {
        historicalMax = cell.harmonizedHotspots;
        historicalMaxYear = cell.year;
      }
    }

    // Sort to compute non-parametric percentiles if climatology dictionary is omitted
    completedValues.sort((a, b) => a - b);
    const n = completedValues.length;

    let median = climatology?.median;
    let p75 = climatology?.p75;
    let p90 = climatology?.p90;

    if (median === undefined && n > 0) {
      const mid = Math.floor(n / 2);
      median = n % 2 !== 0 ? completedValues[mid] : (completedValues[mid - 1] + completedValues[mid]) / 2;
    }
    if (p75 === undefined && n > 0) {
      const idx75 = Math.floor(n * 0.75);
      p75 = completedValues[idx75] ?? completedValues[n - 1];
    }
    if (p90 === undefined && n > 0) {
      const idx90 = Math.floor(n * 0.9);
      p90 = completedValues[idx90] ?? completedValues[n - 1];
    }

    summaries.push({
      month: m,
      monthName,
      baselineMedian: Math.round(median ?? 0),
      baselineP75: Math.round(p75 ?? 0),
      baselineP90: Math.round(p90 ?? 0),
      historicalMax: Math.max(0, Math.round(historicalMax)),
      historicalMaxYear,
    });
  }

  return summaries;
}

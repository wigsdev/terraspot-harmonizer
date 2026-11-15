/**
 * Pure KPI calculation utilities deriving executive headline metrics from RegionCube.
 * Runs synchronously (< 1 ms) to maintain 60 FPS reactivity across region and locale changes.
 */

import type {
  AnomalyAlertStatus,
  BilingualDictionary,
  FireRegimeClass,
  KPIMetricsSummary,
  Language,
  RegionCube,
} from '../types';

/**
 * Determine the dominant ecosystem fire regime classification for a region cube.
 */
export function resolveDominantRegime(cube: RegionCube | null): FireRegimeClass {
  if (!cube) {
    return 'AGRICULTURAL_BURN';
  }

  const rawRegime = (cube.typical_fire_regime ?? '').trim();
  if (
    rawRegime === 'AGRICULTURAL_BURN' ||
    rawRegime === 'TRANSITIONAL' ||
    rawRegime === 'SEVERE_WILDFIRE'
  ) {
    return rawRegime;
  }

  const normalized = rawRegime.toLowerCase();
  if (normalized.includes('megafire') || normalized.includes('crown')) {
    return 'SEVERE_WILDFIRE';
  }
  if (normalized.includes('agricultural clearing') || normalized.includes('roza y quema')) {
    return 'AGRICULTURAL_BURN';
  }
  if (
    normalized.includes('slash-and-burn') ||
    normalized.includes('wetland pasture') ||
    normalized.includes('transitional')
  ) {
    return 'TRANSITIONAL';
  }

  const records = cube.monthly_records ?? [];
  if (records.length === 0) {
    return 'AGRICULTURAL_BURN';
  }

  const counts: Record<FireRegimeClass, number> = {
    AGRICULTURAL_BURN: 0,
    TRANSITIONAL: 0,
    SEVERE_WILDFIRE: 0,
  };

  for (const record of records) {
    counts[record.regime_class] = (counts[record.regime_class] ?? 0) + 1;
  }

  let dominant: FireRegimeClass = 'AGRICULTURAL_BURN';
  let maxCount = -1;
  (['AGRICULTURAL_BURN', 'TRANSITIONAL', 'SEVERE_WILDFIRE'] as FireRegimeClass[]).forEach(
    (cls) => {
      if (counts[cls] > maxCount) {
        maxCount = counts[cls];
        dominant = cls;
      }
    },
  );

  return dominant;
}

/**
 * Format peak season month numbers (1-12) into a localized range string (e.g., "Jul – Oct").
 */
export function formatPeakMonthsLabel(peakMonths: number[], monthNamesShort: string[]): string {
  if (!peakMonths || peakMonths.length === 0 || monthNamesShort.length < 12) {
    return '—';
  }

  const firstIdx = (((peakMonths[0] - 1) % 12) + 12) % 12;
  const lastIdx = (((peakMonths[peakMonths.length - 1] - 1) % 12) + 12) % 12;
  const first = monthNamesShort[firstIdx];
  const last = monthNamesShort[lastIdx];

  if (peakMonths.length === 1 || first === last) {
    return first;
  }

  return `${first} – ${last}`;
}

/**
 * Compute all 4 executive KPI summary metrics from an active RegionCube and dictionary locale.
 */
export function computeKPISummary(
  cube: RegionCube | null,
  lang: Language,
  dict: BilingualDictionary,
): KPIMetricsSummary {
  const locale = lang === 'es' ? 'es-ES' : 'en-US';
  const intFormatter = new Intl.NumberFormat(locale, { useGrouping: true });

  if (!cube || !cube.monthly_records || cube.monthly_records.length === 0) {
    return {
      totalAfcd: 0,
      formattedTotalAfcd: intFormatter.format(0),
      rSquared: 0,
      formattedRSquared: 'R² = 0.00',
      peakMonths: [],
      peakMonthsLabel: '—',
      peakSharePercentage: 0,
      formattedPeakShare: '0.0%',
      observationDate: '2026-10',
      departurePercentage: 0,
      formattedDeparture: '0.0%',
      robustZScore: 0,
      formattedZScore: 'Z = 0.00',
      alertStatus: 'NORMAL',
      alertBadgeLabel: dict.kpiCards.card3.alertStatus.NORMAL,
      regimeClass: 'AGRICULTURAL_BURN',
      regimeBadgeLabel: dict.kpiCards.card4.regimeClasses.AGRICULTURAL_BURN,
      meanFrpMw: 0,
      formattedMeanFrp: '0.0 MW',
      nightFractionPercentage: 0,
      formattedNightFraction: '0.0%',
    };
  }

  const records = cube.monthly_records;

  // Card 1: Total Harmonized Fire Activity (2000-2026) & Cross-Sensor Fit
  const totalAfcd = Math.round(
    records.reduce((acc, r) => acc + (Number(r.harmonized_hotspots) || 0), 0),
  );
  const formattedTotalAfcd = intFormatter.format(totalAfcd);
  const rSquared = Number((Number(cube.validation_metrics?.r_squared) || 0).toFixed(4));
  const formattedRSquared = `R² = ${rSquared.toFixed(2)}`;

  // Card 2: Peak Burning Season
  const peakMonths = cube.peak_season_months ?? [];
  const peakMonthsLabel = formatPeakMonthsLabel(peakMonths, dict.monthNamesShort);
  const peakSet = new Set(peakMonths);
  const peakAfcd = records.reduce(
    (acc, r) => (peakSet.has(r.month) ? acc + (Number(r.harmonized_hotspots) || 0) : acc),
    0,
  );
  const peakSharePercentage =
    totalAfcd > 0 ? Number(((peakAfcd / totalAfcd) * 100).toFixed(1)) : 0.0;
  const formattedPeakShare = `${peakSharePercentage.toFixed(1)}%`;

  // Card 3: Season Anomaly Alert (latest observation month vs historical monthly median M_m)
  const latest = records[records.length - 1];
  const observationDate = `${latest.year}-${String(latest.month).padStart(2, '0')}`;
  const rawDeparture = Number(latest.departure_percentage);
  const departurePercentage = Number((Number.isFinite(rawDeparture) ? rawDeparture : 0).toFixed(1));
  const depSign = departurePercentage > 0 ? '+' : '';
  const formattedDeparture = `${depSign}${departurePercentage.toFixed(1)}%`;

  const rawZ = Number(latest.robust_z_score);
  const robustZScore = Number((Number.isFinite(rawZ) ? rawZ : 0).toFixed(2));
  const zSign = robustZScore > 0 ? '+' : '';
  const formattedZScore = `Z = ${zSign}${robustZScore.toFixed(2)}`;

  let alertStatus: AnomalyAlertStatus;
  if (robustZScore >= 2.0) {
    alertStatus = 'CRITICAL';
  } else if (robustZScore >= 1.0) {
    alertStatus = 'ELEVATED';
  } else {
    alertStatus = latest.anomaly_status ?? 'NORMAL';
  }
  const alertBadgeLabel = dict.kpiCards.card3.alertStatus[alertStatus];

  // Card 4: Dominant Fire Regime Diagnostic
  const regimeClass = resolveDominantRegime(cube);
  const regimeBadgeLabel = dict.kpiCards.card4.regimeClasses[regimeClass];

  const avgFrp =
    records.reduce((acc, r) => acc + (Number(r.mean_frp_mw) || 0), 0) / Math.max(records.length, 1);
  const meanFrpMw = Number((Number.isFinite(avgFrp) ? avgFrp : 0).toFixed(1));
  const formattedMeanFrp = `${meanFrpMw.toFixed(1)} MW`;

  const avgNight =
    records.reduce((acc, r) => acc + (Number(r.night_fraction) || 0), 0) /
    Math.max(records.length, 1);
  const nightFractionPercentage = Number(
    ((Number.isFinite(avgNight) ? avgNight : 0) * 100).toFixed(1),
  );
  const formattedNightFraction = `${nightFractionPercentage.toFixed(1)}%`;

  return {
    totalAfcd,
    formattedTotalAfcd,
    rSquared,
    formattedRSquared,
    peakMonths,
    peakMonthsLabel,
    peakSharePercentage,
    formattedPeakShare,
    observationDate,
    departurePercentage,
    formattedDeparture,
    robustZScore,
    formattedZScore,
    alertStatus,
    alertBadgeLabel,
    regimeClass,
    regimeBadgeLabel,
    meanFrpMw,
    formattedMeanFrp,
    nightFractionPercentage,
    formattedNightFraction,
  };
}

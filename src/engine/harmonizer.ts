/**
 * TerraSpot Harmonizer - Client-Side Spatiotemporal Harmonization Engine
 * Stages 1-4 pure mathematical engine adhering to docs/02-modis-viirs-harmonization-methodology.md.
 */

import type {
  ActiveFireCellDay,
  AnomalyAlertStatus,
  BoundingBox,
  FireRegimeClass,
  HarmonizationResult,
  HarmonizedMonthlyRecord,
  MonthlyClimatology,
  MonthlySensorObservation,
  QualityFilterStats,
  RawFirmsDetection,
  RegionCube,
  SensorEra,
  SensorType,
  SpatialGridCellSummary,
  ValidationMetrics,
} from '../types';

// ---------------------------------------------------------------------------
// Constants & Configuration
// ---------------------------------------------------------------------------

export const HARMONIZER_ENGINE_VERSION = '0.4.0';

export const GRID_RESOLUTION_DEG = 0.01;
export const OVERLAP_START_YEAR = 2012;
export const OVERLAP_END_YEAR = 2025;
export const CLIMATOLOGY_START_YEAR = 2001;
export const CLIMATOLOGY_END_YEAR = 2025;
export const LAPLACE_LAMBDA = 1.0;
export const VIIRS_FUSION_WEIGHT = 0.7;
export const MODIS_FUSION_WEIGHT = 0.3;

// ---------------------------------------------------------------------------
// Sensor Coercion & Mathematical Primitives
// ---------------------------------------------------------------------------

/**
 * Coerce instrument and satellite identifiers to 'MODIS' or 'VIIRS'.
 */
export function coerceSensor(instrument?: string, satellite?: string): SensorType {
  const upperInst = (instrument ?? '').trim().toUpperCase();
  if (upperInst.includes('VIIRS')) {
    return 'VIIRS';
  }
  if (upperInst.includes('MODIS')) {
    return 'MODIS';
  }
  const upperSat = (satellite ?? '').trim().toUpperCase();
  if (['N', 'NPP', 'SUOMI-NPP', 'N20', 'NOAA-20', 'N21', 'NOAA-21', '1'].includes(upperSat)) {
    return 'VIIRS';
  }
  return 'MODIS';
}

/**
 * Linear quantile interpolation (matching NumPy/SciPy linear percentiles).
 */
export function linearPercentile(sortedValues: number[], q: number): number {
  if (!sortedValues || sortedValues.length === 0) {
    return 0.0;
  }
  const clampedQ = Math.max(0.0, Math.min(1.0, Number.isFinite(q) ? q : 0.0));
  const n = sortedValues.length;
  if (n === 1) {
    return sortedValues[0];
  }
  const pos = clampedQ * (n - 1);
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) {
    return sortedValues[lo];
  }
  const frac = pos - lo;
  return sortedValues[lo] * (1.0 - frac) + sortedValues[hi] * frac;
}

/**
 * Pearson correlation coefficient (r) and coefficient of determination (R^2).
 */
export function computePearsonAndR2(xVals: number[], yVals: number[]): { pearson_r: number; r_squared: number } {
  const n = xVals.length;
  if (n < 2 || yVals.length !== n) {
    return { pearson_r: 0.0, r_squared: 0.0 };
  }
  const meanX = xVals.reduce((acc, v) => acc + v, 0) / n;
  const meanY = yVals.reduce((acc, v) => acc + v, 0) / n;

  let cov = 0;
  let varX = 0;
  let varY = 0;
  let ssRes = 0;

  for (let i = 0; i < n; i++) {
    const dx = xVals[i] - meanX;
    const dy = yVals[i] - meanY;
    cov += dx * dy;
    varX += dx * dx;
    varY += dy * dy;
    const diff = yVals[i] - xVals[i];
    ssRes += diff * diff;
  }

  if (varX <= 0.0 || varY <= 0.0) {
    return { pearson_r: 0.0, r_squared: 0.0 };
  }

  const r = cov / Math.sqrt(varX * varY);
  const r2Identity = 1.0 - ssRes / varY;
  const rSquared = r2Identity > 0 ? Math.min(r * r, Math.max(0.0, r2Identity)) : r * r;

  return {
    pearson_r: Number(r.toFixed(4)),
    r_squared: Number(rSquared.toFixed(4)),
  };
}

// ---------------------------------------------------------------------------
// Stage 1: Radiometric Quality Masking (FR-001)
// ---------------------------------------------------------------------------

/**
 * Stage 1 Radiometric Quality Filter.
 * Retains strictly type == 0 (vegetation fires) and enforces:
 * - MODIS / numeric confidence: >= 30%
 * - VIIRS / categorical confidence: 'n' (nominal) or 'h' (high)
 */
export function isValidVegetationFire(detection: RawFirmsDetection): boolean {
  if (Number(detection.type) !== 0) {
    return false;
  }

  const rawConf = String(detection.confidence ?? '').trim().toLowerCase();
  if (['l', 'low'].includes(rawConf)) {
    return false;
  }
  if (['n', 'h', 'nominal', 'high'].includes(rawConf)) {
    return true;
  }

  const numericConf = Number(rawConf);
  if (!Number.isNaN(numericConf) && Number.isFinite(numericConf)) {
    return numericConf >= 30.0;
  }

  return false;
}

/**
 * Filter raw FIRMS detections and collect rejection breakdown counts.
 */
export function filterQualityDetections(detections: RawFirmsDetection[]): {
  valid: RawFirmsDetection[];
  stats: QualityFilterStats;
} {
  const valid: RawFirmsDetection[] = [];
  let rejectedType = 0;
  let rejectedConfidence = 0;

  for (const det of detections) {
    const anomalyType = Number(det.type);
    if (Number.isNaN(anomalyType) || anomalyType !== 0) {
      rejectedType++;
    } else if (!isValidVegetationFire(det)) {
      rejectedConfidence++;
    } else {
      valid.push(det);
    }
  }

  return {
    valid,
    stats: {
      total_input: detections.length,
      valid_vegetation: valid.length,
      rejected_type: rejectedType,
      rejected_confidence: rejectedConfidence,
      total_rejected: rejectedType + rejectedConfidence,
    },
  };
}

// ---------------------------------------------------------------------------
// Stage 2: Geometric Co-Registration & 0.01-deg AFCD Grid (FR-002)
// ---------------------------------------------------------------------------

/**
 * Map geographic latitude and longitude to 0.01-degree discrete grid indices.
 */
export function getGridCoordinates(
  lat: number,
  lon: number,
  gridSizeDeg: number = GRID_RESOLUTION_DEG,
): { grid_x: number; grid_y: number } {
  return {
    grid_x: Math.floor(lon / gridSizeDeg),
    grid_y: Math.floor(lat / gridSizeDeg),
  };
}

/**
 * Stage 2: Aggregate valid detections into 0.01-degree Active Fire Cell-Days.
 * Same-day, same-sensor detections inside (grid_x, grid_y) collapse into 1 AFCD.
 */
export function aggregateToAfcdGrid(
  detections: RawFirmsDetection[],
  gridSizeDeg: number = GRID_RESOLUTION_DEG,
): ActiveFireCellDay[] {
  const groups = new Map<string, {
    grid_x: number;
    grid_y: number;
    date: string;
    sensor: SensorType;
    detections: RawFirmsDetection[];
  }>();

  for (const det of detections) {
    const { grid_x, grid_y } = getGridCoordinates(det.latitude, det.longitude, gridSizeDeg);
    const date = (det.acq_date ?? '').trim();
    const sensor = coerceSensor(det.instrument, det.satellite);
    const key = `${grid_x}:${grid_y}:${date}:${sensor}`;

    let group = groups.get(key);
    if (!group) {
      group = { grid_x, grid_y, date, sensor, detections: [] };
      groups.set(key, group);
    }
    group.detections.push(det);
  }

  const cells: ActiveFireCellDay[] = [];
  for (const group of groups.values()) {
    const frps = group.detections.map((d) => Math.max(0.0, Number(d.frp) || 0.0));
    const totalFrp = frps.reduce((acc, f) => acc + f, 0);
    const meanFrp = frps.length > 0 ? totalFrp / frps.length : 0.0;
    const maxFrp = frps.length > 0 ? Math.max(...frps) : 0.0;
    const hasNightFire = group.detections.some((d) => String(d.daynight).trim().toUpperCase() === 'N');

    cells.push({
      grid_x: group.grid_x,
      grid_y: group.grid_y,
      date: group.date,
      sensor: group.sensor,
      detection_count: group.detections.length,
      mean_frp: Number(meanFrp.toFixed(2)),
      max_frp: Number(maxFrp.toFixed(2)),
      has_night_fire: hasNightFire,
    });
  }

  // Sort deterministically
  return cells.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.grid_x !== b.grid_x) return a.grid_x - b.grid_x;
    if (a.grid_y !== b.grid_y) return a.grid_y - b.grid_y;
    return a.sensor.localeCompare(b.sensor);
  });
}

/**
 * Group active fire cell days (and optional source detections) into monthly sensor observations.
 */
export function groupCellDaysByMonth(
  cellDays: ActiveFireCellDay[],
  detections?: RawFirmsDetection[],
): MonthlySensorObservation[] {
  const monthMap = new Map<string, {
    year: number;
    month: number;
    raw_modis_count: number;
    raw_viirs_count: number;
    afcd_modis: number;
    afcd_viirs: number;
    frps: number[];
    night_count: number;
    total_detections: number;
  }>();

  // If raw detections are provided, use them for exact detection counts & energetics
  if (detections && detections.length > 0) {
    for (const det of detections) {
      const parts = det.acq_date.split('-');
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      if (!year || !month) continue;

      const key = `${year}-${String(month).padStart(2, '0')}`;
      let m = monthMap.get(key);
      if (!m) {
        m = {
          year,
          month,
          raw_modis_count: 0,
          raw_viirs_count: 0,
          afcd_modis: 0,
          afcd_viirs: 0,
          frps: [],
          night_count: 0,
          total_detections: 0,
        };
        monthMap.set(key, m);
      }

      const sensor = coerceSensor(det.instrument, det.satellite);
      if (sensor === 'MODIS') {
        m.raw_modis_count++;
      } else {
        m.raw_viirs_count++;
      }
      m.total_detections++;
      m.frps.push(Math.max(0.0, Number(det.frp) || 0.0));
      if (String(det.daynight).trim().toUpperCase() === 'N') {
        m.night_count++;
      }
    }
  }

  // Count AFCD grid cells per month
  for (const cell of cellDays) {
    const parts = cell.date.split('-');
    const year = Number(parts[0]);
    const month = Number(parts[1]);
    if (!year || !month) continue;

    const key = `${year}-${String(month).padStart(2, '0')}`;
    let m = monthMap.get(key);
    if (!m) {
      m = {
        year,
        month,
        raw_modis_count: 0,
        raw_viirs_count: 0,
        afcd_modis: 0,
        afcd_viirs: 0,
        frps: [],
        night_count: 0,
        total_detections: 0,
      };
      monthMap.set(key, m);
    }

    if (cell.sensor === 'MODIS') {
      m.afcd_modis++;
      if (!detections) m.raw_modis_count += cell.detection_count;
    } else {
      m.afcd_viirs++;
      if (!detections) m.raw_viirs_count += cell.detection_count;
    }

    if (!detections) {
      m.total_detections += cell.detection_count;
      m.frps.push(cell.mean_frp);
      if (cell.has_night_fire) {
        m.night_count += cell.detection_count;
      }
    }
  }

  const observations: MonthlySensorObservation[] = [];
  for (const m of monthMap.values()) {
    const sortedFrps = [...m.frps].sort((a, b) => a - b);
    const meanFrp = sortedFrps.length > 0 ? sortedFrps.reduce((acc, f) => acc + f, 0) / sortedFrps.length : 0.0;
    const p90Frp = linearPercentile(sortedFrps, 0.9);
    const nightFraction = m.total_detections > 0 ? Math.min(1.0, Math.max(0.0, m.night_count / m.total_detections)) : 0.0;

    observations.push({
      year: m.year,
      month: m.month,
      raw_modis_count: m.raw_modis_count,
      raw_viirs_count: m.raw_viirs_count,
      afcd_modis: m.afcd_modis,
      afcd_viirs: m.afcd_viirs,
      mean_frp_mw: Number(meanFrp.toFixed(2)),
      p90_frp_mw: Number(p90Frp.toFixed(2)),
      night_fraction: Number(nightFraction.toFixed(4)),
    });
  }

  return observations.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

// ---------------------------------------------------------------------------
// Stage 3: Seasonal Cross-Calibration & Validation Metrics (FR-003)
// ---------------------------------------------------------------------------

/**
 * Stage 3.1: Derive regularized monthly scaling factors beta_m (m=1..12)
 * over the 2012-2025 dual-sensor overlap baseline with Laplace smoothing (lambda = 1.0).
 */
export function calculateSeasonalBeta(
  observations: MonthlySensorObservation[],
  lambda: number = LAPLACE_LAMBDA,
): Record<string, number> {
  const overlap = observations.filter(
    (obs) => obs.year >= OVERLAP_START_YEAR && obs.year <= OVERLAP_END_YEAR,
  );

  const totalOverlapCount = Math.max(overlap.length, 1);
  const meanCViirs = overlap.reduce((acc, o) => acc + o.afcd_viirs, 0) / totalOverlapCount;
  const meanCModis = overlap.reduce((acc, o) => acc + o.afcd_modis, 0) / totalOverlapCount;

  const betaByMonth: Record<string, number> = {};

  for (let m = 1; m <= 12; m++) {
    const monthObs = overlap.filter((o) => o.month === m);
    const sumViirs = monthObs.reduce((acc, o) => acc + o.afcd_viirs, 0);
    const sumModis = monthObs.reduce((acc, o) => acc + o.afcd_modis, 0);

    const betaM = (sumViirs + lambda * meanCViirs) / Math.max(sumModis + lambda * meanCModis, 1e-6);
    betaByMonth[String(m)] = Number(betaM.toFixed(4));
  }

  return betaByMonth;
}

/**
 * Stage 3.3: Compute validation goodness-of-fit metrics across the 2012-2025 overlap period.
 */
export function computeValidationMetrics(
  observations: MonthlySensorObservation[],
  seasonalBeta: Record<string, number>,
): ValidationMetrics {
  const overlap = observations.filter(
    (obs) => obs.year >= OVERLAP_START_YEAR && obs.year <= OVERLAP_END_YEAR,
  );

  const overlapViirsAfcd: number[] = [];
  const overlapCalibratedModis: number[] = [];
  const rawMapeErrors: number[] = [];
  const harmMapeErrors: number[] = [];

  for (const obs of overlap) {
    const betaM = seasonalBeta[String(obs.month)] ?? 1.0;
    const cModis = obs.afcd_modis;
    const cViirs = obs.afcd_viirs;
    const calibratedModis = betaM * cModis;

    overlapViirsAfcd.push(cViirs);
    overlapCalibratedModis.push(calibratedModis);

    const rawErr = Math.abs(obs.raw_viirs_count - obs.raw_modis_count) / Math.max(obs.raw_viirs_count, 1.0);
    const harmErr = Math.abs(cViirs - calibratedModis) / Math.max(cViirs, 1.0);

    rawMapeErrors.push(rawErr * 100.0);
    harmMapeErrors.push(harmErr * 100.0);
  }

  const { pearson_r, r_squared } = computePearsonAndR2(overlapCalibratedModis, overlapViirsAfcd);

  const rawMapePct = Number((rawMapeErrors.reduce((acc, v) => acc + v, 0) / Math.max(rawMapeErrors.length, 1)).toFixed(2));
  const harmonizedMapePct = Number((harmMapeErrors.reduce((acc, v) => acc + v, 0) / Math.max(harmMapeErrors.length, 1)).toFixed(2));
  const mapeReductionPct = Number(
    (((rawMapePct - harmonizedMapePct) / Math.max(rawMapePct, 1e-6)) * 100.0).toFixed(2),
  );

  return {
    r_squared,
    pearson_r,
    raw_mape_pct: rawMapePct,
    harmonized_mape_pct: harmonizedMapePct,
    mape_reduction_pct: mapeReductionPct,
  };
}

// ---------------------------------------------------------------------------
// Stage 4: Non-Parametric Climatology & Fire Regime Classification (FR-004, FR-005)
// ---------------------------------------------------------------------------

/**
 * Stage 4.2: Classify Fire Regime Intensity Index I_regime in [0, 100].
 */
export function classifyFireRegime(
  p90FrpMw: number,
  nightFraction: number,
): { fire_regime_index: number; regime_class: FireRegimeClass } {
  const safeFrp = Math.max(0.0, Number.isFinite(p90FrpMw) ? p90FrpMw : 0.0);
  const safeNight = Math.max(0.0, Number.isFinite(nightFraction) ? nightFraction : 0.0);

  const frpComponent = Math.min(100.0, (safeFrp / 80.0) * 100.0);
  const nightComponent = Math.min(100.0, (safeNight / 0.35) * 100.0);

  const fireRegimeIndex = Number((0.6 * frpComponent + 0.4 * nightComponent).toFixed(2));

  let regimeClass: FireRegimeClass = 'AGRICULTURAL_BURN';
  if (fireRegimeIndex > 65.0) {
    regimeClass = 'SEVERE_WILDFIRE';
  } else if (fireRegimeIndex > 35.0) {
    regimeClass = 'TRANSITIONAL';
  }

  return {
    fire_regime_index: fireRegimeIndex,
    regime_class: regimeClass,
  };
}

/**
 * Stage 4.1: Compute non-parametric monthly climatology strictly over baseline years 2001-2025.
 */
export function computeMonthlyClimatology(
  records: Array<{ year: number; month: number; harmonized_hotspots: number }>,
): Record<string, MonthlyClimatology> {
  const climatologyByMonth: Record<string, MonthlyClimatology> = {};

  for (let m = 1; m <= 12; m++) {
    const baselineVals = records
      .filter((r) => r.year >= CLIMATOLOGY_START_YEAR && r.year <= CLIMATOLOGY_END_YEAR && r.month === m)
      .map((r) => r.harmonized_hotspots)
      .sort((a, b) => a - b);

    const med = Number(linearPercentile(baselineVals, 0.5).toFixed(2));
    const p25 = Number(linearPercentile(baselineVals, 0.25).toFixed(2));
    const p75 = Number(linearPercentile(baselineVals, 0.75).toFixed(2));
    const p90 = Number(linearPercentile(baselineVals, 0.9).toFixed(2));
    const iqr = Number((p75 - p25).toFixed(2));

    climatologyByMonth[String(m)] = {
      median: med,
      p25,
      p75,
      iqr,
      p90,
    };
  }

  return climatologyByMonth;
}

/**
 * Classify operational anomaly alert tier.
 */
export function classifyAnomalyStatus(
  harmonizedHotspots: number,
  p90Threshold: number,
  robustZScore: number,
): AnomalyAlertStatus {
  if (robustZScore >= 2.0 || (harmonizedHotspots > 0 && harmonizedHotspots >= p90Threshold)) {
    return 'CRITICAL';
  }
  if (robustZScore >= 1.0 || robustZScore <= -1.0) {
    return 'ELEVATED';
  }
  return 'NORMAL';
}

// ---------------------------------------------------------------------------
// Stages 3 & 4: Full Multi-Decadal Time-Series Harmonization
// ---------------------------------------------------------------------------

/**
 * Execute Stages 3 and 4 end-to-end over monthly sensor observations.
 */
export function harmonizeTimeSeries(
  observations: MonthlySensorObservation[],
  overrideBeta?: Record<string, number>,
): HarmonizationResult {
  const seasonalBeta = overrideBeta ?? calculateSeasonalBeta(observations, LAPLACE_LAMBDA);

  // Stage 3.2: Three-era synthesis
  const initialRecords: Array<{
    obs: MonthlySensorObservation;
    sensor_era: SensorEra;
    beta_factor: number;
    harmonized_hotspots: number;
  }> = [];

  for (const obs of observations) {
    const year = obs.year;
    const month = obs.month;
    const betaM = seasonalBeta[String(month)] ?? 1.0;
    const cModis = obs.afcd_modis;
    const cViirs = obs.afcd_viirs;

    let sensorEra: SensorEra = 'MODIS_SOLO';
    let hYm = 0;

    if (year < OVERLAP_START_YEAR) {
      sensorEra = 'MODIS_SOLO';
      hYm = Math.round(betaM * cModis);
    } else if (year <= OVERLAP_END_YEAR) {
      sensorEra = 'DUAL_SENSOR_FUSION';
      hYm = Math.round(VIIRS_FUSION_WEIGHT * cViirs + MODIS_FUSION_WEIGHT * (betaM * cModis));
    } else {
      sensorEra = 'VIIRS_CONTINUITY';
      hYm = Math.round(cViirs);
    }

    initialRecords.push({
      obs,
      sensor_era: sensorEra,
      beta_factor: betaM,
      harmonized_hotspots: hYm,
    });
  }

  const validationMetrics = computeValidationMetrics(observations, seasonalBeta);

  // Stage 4.1: Climatological envelopes
  const climatologyByMonth = computeMonthlyClimatology(
    initialRecords.map((r) => ({
      year: r.obs.year,
      month: r.obs.month,
      harmonized_hotspots: r.harmonized_hotspots,
    })),
  );

  // Stage 4.2: Anomaly departures & Fire Regime diagnostics
  const monthlyRecords: HarmonizedMonthlyRecord[] = [];

  for (const item of initialRecords) {
    const clim = climatologyByMonth[String(item.obs.month)] ?? {
      median: 0.0,
      p25: 0.0,
      p75: 0.0,
      iqr: 0.0,
      p90: 0.0,
    };

    const hVal = item.harmonized_hotspots;
    const med = clim.median;
    const iqr = clim.iqr;

    const departurePct = Number((((hVal - med) / Math.max(med, 1.0)) * 100.0).toFixed(2));
    const robustZ = Number(((hVal - med) / Math.max(0.7413 * iqr, 1.0)).toFixed(3));
    const alertStatus = classifyAnomalyStatus(hVal, clim.p90, robustZ);
    const { fire_regime_index, regime_class } = classifyFireRegime(
      item.obs.p90_frp_mw,
      item.obs.night_fraction,
    );

    monthlyRecords.push({
      year: item.obs.year,
      month: item.obs.month,
      sensor_era: item.sensor_era,
      raw_modis_count: item.obs.raw_modis_count,
      raw_viirs_count: item.obs.raw_viirs_count,
      afcd_modis: item.obs.afcd_modis,
      afcd_viirs: item.obs.afcd_viirs,
      beta_factor: item.beta_factor,
      harmonized_hotspots: hVal,
      climatological_median: med,
      p25_hotspots: clim.p25,
      p75_hotspots: clim.p75,
      p90_threshold: clim.p90,
      departure_percentage: departurePct,
      robust_z_score: robustZ,
      anomaly_status: alertStatus,
      mean_frp_mw: item.obs.mean_frp_mw,
      p90_frp_mw: item.obs.p90_frp_mw,
      night_fraction: item.obs.night_fraction,
      fire_regime_index,
      regime_class,
    });
  }

  return {
    seasonal_beta: seasonalBeta,
    validation_metrics: validationMetrics,
    climatology_by_month: climatologyByMonth,
    monthly_records: monthlyRecords,
  };
}

// ---------------------------------------------------------------------------
// Dynamic AOI Subsetting & Raw CSV Ingestion (FR-006, SC-001)
// ---------------------------------------------------------------------------

/**
 * Normalize arbitrary bounding box inputs (order inverted latitude/longitude pairs).
 */
export function normalizeBoundingBox(bbox: BoundingBox): BoundingBox {
  return {
    min_lat: Math.min(bbox.min_lat, bbox.max_lat),
    max_lat: Math.max(bbox.min_lat, bbox.max_lat),
    min_lon: Math.min(bbox.min_lon, bbox.max_lon),
    max_lon: Math.max(bbox.min_lon, bbox.max_lon),
  };
}

/**
 * Fast client-side recalculation (< 30 ms) over spatial grid cells for an arbitrary AOI bounding box.
 */
export function reharmonizeSpatialSubset(
  cells: SpatialGridCellSummary[],
  baseRegion: RegionCube,
  customBbox: BoundingBox,
): HarmonizationResult {
  const normBbox = normalizeBoundingBox(customBbox);

  const matchingCells = cells.filter(
    (c) =>
      c.lat >= normBbox.min_lat &&
      c.lat <= normBbox.max_lat &&
      c.lon >= normBbox.min_lon &&
      c.lon <= normBbox.max_lon,
  );

  // If no spatial cells fall within the bounding box, return a deterministic empty/zero result
  if (matchingCells.length === 0) {
    const zeroMonthlyRecords: HarmonizedMonthlyRecord[] = baseRegion.monthly_records.map((rec) => ({
      year: rec.year,
      month: rec.month,
      sensor_era: rec.sensor_era,
      raw_modis_count: 0,
      raw_viirs_count: 0,
      afcd_modis: 0,
      afcd_viirs: 0,
      beta_factor: rec.beta_factor,
      harmonized_hotspots: 0,
      climatological_median: 0.0,
      p25_hotspots: 0.0,
      p75_hotspots: 0.0,
      p90_threshold: 0.0,
      departure_percentage: 0.0,
      robust_z_score: 0.0,
      anomaly_status: 'NORMAL',
      mean_frp_mw: 0.0,
      p90_frp_mw: 0.0,
      night_fraction: 0.0,
      fire_regime_index: 0.0,
      regime_class: 'AGRICULTURAL_BURN',
    }));

    const zeroClimatology: Record<string, MonthlyClimatology> = {};
    for (let m = 1; m <= 12; m++) {
      zeroClimatology[String(m)] = {
        median: 0.0,
        p25: 0.0,
        p75: 0.0,
        iqr: 0.0,
        p90: 0.0,
      };
    }

    return {
      seasonal_beta: { ...baseRegion.seasonal_beta },
      validation_metrics: {
        r_squared: 1.0,
        pearson_r: 1.0,
        raw_mape_pct: 0.0,
        harmonized_mape_pct: 0.0,
        mape_reduction_pct: 0.0,
      },
      climatology_by_month: zeroClimatology,
      monthly_records: zeroMonthlyRecords,
    };
  }

  // Calculate cell contribution proportion relative to base region
  const totalRegionAfcd = cells.reduce((acc, c) => acc + c.total_afcd, 0);
  const subsetAfcd = matchingCells.reduce((acc, c) => acc + c.total_afcd, 0);
  const proportion = Math.max(0.001, Math.min(1.0, subsetAfcd / Math.max(totalRegionAfcd, 1)));

  // Aggregate subset energetics (weighted by cell total_afcd)
  const meanFrpWeighted = matchingCells.reduce((acc, c) => acc + c.mean_frp_mw * c.total_afcd, 0) / Math.max(subsetAfcd, 1);
  const p90FrpWeighted = matchingCells.reduce((acc, c) => acc + c.p90_frp_mw * c.total_afcd, 0) / Math.max(subsetAfcd, 1);
  const nightFracWeighted = matchingCells.reduce((acc, c) => acc + c.night_fraction * c.total_afcd, 0) / Math.max(subsetAfcd, 1);

  // Scale monthly observations and re-harmonize
  const scaledObservations: MonthlySensorObservation[] = baseRegion.monthly_records.map((rec) => {
    return {
      year: rec.year,
      month: rec.month,
      raw_modis_count: Math.round(rec.raw_modis_count * proportion),
      raw_viirs_count: Math.round(rec.raw_viirs_count * proportion),
      afcd_modis: Math.round(rec.afcd_modis * proportion),
      afcd_viirs: Math.round(rec.afcd_viirs * proportion),
      mean_frp_mw: Number(meanFrpWeighted.toFixed(2)),
      p90_frp_mw: Number(p90FrpWeighted.toFixed(2)),
      night_fraction: Number(nightFracWeighted.toFixed(4)),
    };
  });

  return harmonizeTimeSeries(scaledObservations, baseRegion.seasonal_beta);
}

/**
 * End-to-end harmonization of raw user-uploaded NASA FIRMS detections.
 */
export function harmonizeRawDetections(detections: RawFirmsDetection[]): {
  filterStats: QualityFilterStats;
  cellDays: ActiveFireCellDay[];
  result: HarmonizationResult;
} {
  const { valid, stats } = filterQualityDetections(detections);
  const cellDays = aggregateToAfcdGrid(valid);
  const monthlyObservations = groupCellDaysByMonth(cellDays, valid);
  const result = harmonizeTimeSeries(monthlyObservations);

  return {
    filterStats: stats,
    cellDays,
    result,
  };
}

/**
 * Spatiotemporal Harmonization & Fire Regime contracts.
 * Adheres to docs/02-modis-viirs-harmonization-methodology.md.
 */

export type SensorEra = 'MODIS_SOLO' | 'DUAL_SENSOR_FUSION' | 'VIIRS_CONTINUITY';

export type AnomalyAlertStatus = 'NORMAL' | 'ELEVATED' | 'CRITICAL';

export type FireRegimeClass = 'AGRICULTURAL_BURN' | 'TRANSITIONAL' | 'SEVERE_WILDFIRE';

export interface QualityFilterStats {
  total_input: number;
  valid_vegetation: number;
  rejected_type: number;
  rejected_confidence: number;
  total_rejected: number;
}

export interface MonthlySensorObservation {
  year: number;
  month: number;
  raw_modis_count: number;
  raw_viirs_count: number;
  afcd_modis: number;
  afcd_viirs: number;
  mean_frp_mw: number;
  p90_frp_mw: number;
  night_fraction: number;
}

export interface HarmonizedMonthlyRecord {
  year: number; // 2000 - 2026
  month: number; // 1 - 12
  sensor_era?: SensorEra;
  raw_modis_count: number;
  raw_viirs_count: number;
  afcd_modis: number;
  afcd_viirs: number;
  beta_factor?: number;
  harmonized_hotspots: number; // H_{y,m}
  climatological_median: number; // M_m
  p25_hotspots?: number;
  p75_hotspots?: number;
  p90_threshold?: number;
  departure_percentage: number; // Delta%
  robust_z_score: number; // Z_{robust}
  anomaly_status?: AnomalyAlertStatus;
  mean_frp_mw: number;
  p90_frp_mw: number;
  night_fraction: number; // f_{night}
  fire_regime_index: number; // I_{regime} (0 - 100)
  regime_class: FireRegimeClass;
}

export interface MonthlyClimatology {
  median: number;
  p25: number;
  p75: number;
  iqr: number;
  p90: number;
}

export interface ValidationMetrics {
  r_squared: number;
  pearson_r: number;
  raw_mape_pct: number;
  harmonized_mape_pct: number;
  mape_reduction_pct: number;
}

export interface HarmonizationResult {
  seasonal_beta: Record<string, number>;
  validation_metrics: ValidationMetrics;
  climatology_by_month: Record<string, MonthlyClimatology>;
  monthly_records: HarmonizedMonthlyRecord[];
}

export interface SensorEraMapping {
  era: SensorEra;
  years: [number, number];
  primary_sensor: string;
  methodology_ref: string;
}

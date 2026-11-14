/**
 * Spatiotemporal Harmonization & Fire Regime contracts.
 * Adheres to docs/02-modis-viirs-harmonization-methodology.md.
 */

export interface HarmonizedMonthlyRecord {
  year: number; // 2000 - 2026
  month: number; // 1 - 12
  raw_modis_count: number;
  raw_viirs_count: number;
  afcd_modis: number;
  afcd_viirs: number;
  harmonized_hotspots: number; // H_{y,m}
  climatological_median: number; // M_m
  departure_percentage: number; // Delta%
  robust_z_score: number; // Z_{robust}
  mean_frp_mw: number;
  p90_frp_mw: number;
  night_fraction: number; // f_{night}
  fire_regime_index: number; // I_{regime} (0 - 100)
  regime_class: 'AGRICULTURAL_BURN' | 'TRANSITIONAL' | 'SEVERE_WILDFIRE';
}

export type SensorEra = 'MODIS_SOLO' | 'DUAL_SENSOR_FUSION' | 'VIIRS_CONTINUITY';

export interface SensorEraMapping {
  era: SensorEra;
  years: [number, number];
  primary_sensor: string;
  methodology_ref: string;
}

/**
 * Benchmark Area of Interest (AOI) and geographic contracts.
 * Adheres to docs/04-firms-data-specification.md.
 */

import type {
  HarmonizedMonthlyRecord,
  MonthlyClimatology,
  ValidationMetrics,
} from './harmonization';

export interface BoundingBox {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export interface BenchmarkRegion {
  id: string;
  name: string;
  country: string;
  bbox: BoundingBox;
  center?: [number, number];
  default_zoom?: number;
  description: string;
  typical_fire_regime: string;
  peak_season_months?: number[];
  seasonal_beta: Record<number, number>; // Month (1-12) -> beta_m factor
}

export interface RegionCube extends BenchmarkRegion {
  center: [number, number];
  default_zoom: number;
  peak_season_months: number[];
  seasonal_beta: Record<string, number>;
  validation_metrics: ValidationMetrics;
  climatology_by_month: Record<string, MonthlyClimatology>;
  monthly_records: HarmonizedMonthlyRecord[];
}

export interface RegionsCatalogDocument {
  generated_at: string;
  methodology_version: string;
  grid_resolution_deg: number;
  temporal_coverage: {
    start: string;
    end: string;
    total_months: number;
    climatology_baseline: [number, number];
    overlap_window: [number, number];
  };
  regions: RegionCube[];
}

/**
 * NASA FIRMS raw detection and gridded cell contracts.
 * Adheres to docs/04-firms-data-specification.md.
 */

export type SensorType = 'MODIS' | 'VIIRS';

export interface RawFirmsDetection {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string; // YYYY-MM-DD
  acq_time: string; // HHMM
  satellite: string;
  instrument?: string;
  confidence: number | string; // MODIS (0-100) or VIIRS ('l' | 'n' | 'h')
  version: string;
  bright_t31?: number;
  frp: number; // Megawatts (MW)
  daynight: 'D' | 'N';
  type: number; // 0: vegetation, 1: volcano, 2: static industrial, 3: offshore
}

export interface ActiveFireCellDay {
  grid_x: number; // Math.floor(lon / 0.01)
  grid_y: number; // Math.floor(lat / 0.01)
  date: string; // YYYY-MM-DD
  sensor: SensorType;
  detection_count: number;
  mean_frp: number; // Aggregated FRP in MW
  max_frp: number;
  has_night_fire: boolean;
}

export interface SpatialGridCellSummary {
  region_id: string;
  grid_x: number;
  grid_y: number;
  lat: number;
  lon: number;
  total_afcd: number;
  peak_month: number;
  mean_frp_mw: number;
  p90_frp_mw: number;
  night_fraction: number;
  regime_class: 'AGRICULTURAL_BURN' | 'TRANSITIONAL' | 'SEVERE_WILDFIRE';
  yearly_afcd: Record<string, number>;
}

export interface SpatialCellsDocument {
  generated_at: string;
  grid_resolution_deg: number;
  total_cells: number;
  cells: SpatialGridCellSummary[];
}

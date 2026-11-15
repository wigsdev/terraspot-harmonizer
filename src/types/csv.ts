/**
 * NASA Space Apps Challenge 2026 — TerraSpot Harmonizer
 * Standardized CSV Export & Custom NASA FIRMS Ingestion Contracts
 * Adheres strictly to docs/04-firms-data-specification.md and Challenge 15 Requirement R7.
 */

export const CANONICAL_CSV_HEADERS = [
  'aoi_id',
  'aoi_name',
  'bbox_min_lat',
  'bbox_max_lat',
  'bbox_min_lon',
  'bbox_max_lon',
  'year',
  'month',
  'month_name',
  'sensor_era',
  'raw_modis_hotspots',
  'raw_viirs_hotspots',
  'modis_grid_cell_days',
  'viirs_grid_cell_days',
  'seasonal_beta_factor',
  'harmonized_hotspots',
  'historical_median_2001_2025',
  'iqr_25_75',
  'p90_critical_threshold',
  'anomaly_percent',
  'robust_z_score',
  'anomaly_status',
  'mean_frp_mw',
  'p90_frp_mw',
  'night_detection_fraction',
  'fire_regime_index',
  'fire_regime_classification',
] as const;

export type CanonicalCSVHeader = (typeof CANONICAL_CSV_HEADERS)[number];

/**
 * Standardized 27-Column Analytical Record for RFC 4180 CSV export.
 * Formatted for immediate ingestion into Python (pandas), R, QGIS, or spreadsheets.
 */
export interface StandardizedHarmonizedRow {
  aoi_id: string;
  aoi_name: string;
  bbox_min_lat: number;
  bbox_max_lat: number;
  bbox_min_lon: number;
  bbox_max_lon: number;
  year: number;
  month: number;
  month_name: string;
  sensor_era: string;
  raw_modis_hotspots: number;
  raw_viirs_hotspots: number;
  modis_grid_cell_days: number;
  viirs_grid_cell_days: number;
  seasonal_beta_factor: number;
  harmonized_hotspots: number;
  historical_median_2001_2025: number;
  iqr_25_75: number;
  p90_critical_threshold: number;
  anomaly_percent: string; // Formatted with explicit sign, e.g. "+77.17%" or "-12.50%"
  robust_z_score: number;
  anomaly_status: string;
  mean_frp_mw: number;
  p90_frp_mw: number;
  night_detection_fraction: number;
  fire_regime_index: number;
  fire_regime_classification: string;
}

export interface CSVExportOptions {
  includeQuotes?: boolean;
  lineEnding?: '\r\n' | '\n';
  datePrefix?: boolean;
}

/**
 * Raw point detection parsed from NASA FIRMS CSV download (MODIS C6.1 or VIIRS 375m C2).
 */
export interface RawFIRMSPoint {
  latitude: number;
  longitude: number;
  brightness?: number;
  scan?: number;
  track?: number;
  acq_date: string; // "YYYY-MM-DD"
  acq_time?: string | number;
  satellite?: string;
  instrument?: string;
  confidence?: string | number; // MODIS 0-100 or VIIRS 'l'/'n'/'h'
  version?: string;
  bright_t31?: number;
  frp?: number;
  daynight?: 'D' | 'N';
  type?: number; // 0=vegetation, 1=volcano, 2=static flare, 3=offshore
}

/**
 * Diagnostic report of client-side FIRMS CSV parsing and quality masking.
 */
export interface FIRMSValidationReport {
  isValid: boolean;
  fileName: string;
  fileSizeBytes: number;
  totalRows: number;
  validVegetationHotspots: number; // type == 0 and nominal/high confidence
  excludedRows: {
    nonVegetationType: number; // type != 0
    lowConfidence: number; // MODIS < 30% or VIIRS 'l'
    invalidCoordinates: number;
    missingDate: number;
  };
  detectedSensors: string[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  errorMessages: string[];
  warningMessages: string[];
}

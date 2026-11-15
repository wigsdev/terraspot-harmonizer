/**
 * Technical Contract: Standardized CSV Exporter
 * NASA Space Apps Challenge 2026 — TerraSpot Harmonizer
 */

import { RegionCube } from '../../../src/types/cube';

export const CANONICAL_CSV_HEADERS: readonly string[] = [
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

export interface CSVExportOptions {
  includeQuotes?: boolean;
  lineEnding?: '\r\n' | '\n';
  datePrefix?: boolean;
}

/**
 * Transforms an active RegionCube into an RFC 4180 compliant CSV string.
 *
 * @param cube Active regional data cube
 * @param options Formatting options
 * @returns RFC 4180 CSV string with exact 27 canonical columns
 */
export type ExportHarmonizedCSVFn = (
  cube: RegionCube,
  options?: CSVExportOptions
) => string;

/**
 * Triggers an in-browser file download of the generated CSV.
 *
 * @param csvContent Formatted RFC 4180 CSV string
 * @param filename Target filename (e.g. "terraspot_harmonized_PE-HCO_2026-11-15.csv")
 */
export type TriggerBrowserDownloadFn = (
  csvContent: string,
  filename: string
) => void;

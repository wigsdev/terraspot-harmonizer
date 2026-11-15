/**
 * Map, NASA GIBS WMTS, and Cartographic Selection Type Definitions.
 * Adheres to specs/005-map-aoi-gibs/contracts/ and docs/04-firms-data-specification.md.
 */

import type { BoundingBox } from './region';
import type { SpatialGridCellSummary } from './firms';

export type MapLayerId = 'dark_matter' | 'modis_truecolor' | 'viirs_truecolor';

export interface GIBSWMTSLayerDefinition {
  id: MapLayerId;
  labelKey: 'darkMatter' | 'modisTrueColor' | 'viirsTrueColor';
  url: string;
  attribution: string;
  maxZoom: number;
  minZoom: number;
  subdomains?: string[];
  isSatellite: boolean;
}

export interface BuildGibsTileUrlOptions {
  layerId: MapLayerId;
  dateStr: string; // YYYY-MM-DD
}

export interface MapAOISelectorProps {
  className?: string;
  onCustomAOIChange?: (bbox: BoundingBox | null) => void;
  onCellSelect?: (cell: SpatialGridCellSummary | null) => void;
  height?: number | string;
  disableRemoteTiles?: boolean;
}

export interface MapCoordinateInputs {
  minLat: string;
  maxLat: string;
  minLon: string;
  maxLon: string;
}

/**
 * Curated peak fire season clear-sky reference dates per benchmark region.
 * Enables authentic visualization of real smoke plumes and fire scars without cloud cover.
 */
export const BENCHMARK_GIBS_DATES: Record<string, string> = {
  'PE-HCO': '2024-09-15', // Central Peruvian Andes peak dry season fires
  'SAM-MAP': '2024-09-15', // Southern Amazonia megafire drought window
  'AR-PAR': '2020-08-20', // Paraná Delta catastrophic wetland burn
  'US-CAL': '2020-09-09', // California August Complex historic orange skies
  'AU-NSW': '2019-12-30', // Australia Black Summer southeastern megablaze
};

export const DEFAULT_GIBS_DATE = '2024-09-15';

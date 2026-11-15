/**
 * Contract: NASA EOSDIS GIBS WMTS & Basemap Layer Configuration
 * Public endpoints, URL formatters, and layer metadata.
 */

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
  timeFormat?: string;
}

export interface BuildGibsTileUrlOptions {
  layerId: MapLayerId;
  dateStr: string; // YYYY-MM-DD
}

/**
 * Resolves the active tile URL template for a NASA GIBS layer given a target date.
 */
export type TileUrlResolver = (options: BuildGibsTileUrlOptions) => string;

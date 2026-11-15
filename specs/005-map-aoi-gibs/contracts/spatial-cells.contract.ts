/**
 * Contract: Spatial Fire Cell Density Grid & Color Resolver
 * Schema for public/data/firms_spatial_cells.json and cell styling.
 */

import type { BoundingBox, PaletteType } from '../../src/types';

export interface SpatialCellFeature {
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

export interface SpatialCellsCatalog {
  generated_at: string;
  grid_resolution_deg: number;
  total_cells: number;
  cells: SpatialCellFeature[];
}

export interface CellStyleOptions {
  cell: SpatialCellFeature;
  palette: PaletteType;
  maxFrp?: number;
}

export interface CellStyleResult {
  fillColor: string;
  color: string;
  fillOpacity: number;
  weight: number;
  radius: number;
}

/**
 * Filter spatial cells within an arbitrary bounding box envelope.
 */
export type SpatialCellFilter = (
  cells: SpatialCellFeature[],
  bbox: BoundingBox,
) => SpatialCellFeature[];

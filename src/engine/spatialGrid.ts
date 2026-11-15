/**
 * Spatial Grid Utilities & Accessible Cell Styling Engine.
 * Adheres to specs/005-map-aoi-gibs/contracts/spatial-cells.contract.ts.
 */

import { interpolatePaletteHex, normalizeValue } from './colorRamps';
import { normalizeBoundingBox } from './harmonizer';
import type { BoundingBox, PaletteType, SpatialGridCellSummary } from '../types';

export interface CellStyle {
  fillColor: string;
  color: string;
  fillOpacity: number;
  weight: number;
  radius: number;
}

/**
 * Filter a collection of spatial grid cells to those whose centroid falls within a bounding box.
 */
export function filterCellsByBBox(
  cells: SpatialGridCellSummary[],
  bbox: BoundingBox,
): SpatialGridCellSummary[] {
  const norm = normalizeBoundingBox(bbox);
  return cells.filter(
    (c) =>
      c.lat >= norm.min_lat &&
      c.lat <= norm.max_lat &&
      c.lon >= norm.min_lon &&
      c.lon <= norm.max_lon,
  );
}

/**
 * Compute rectangular LatLng bounds [[south, west], [north, east]] for a 0.01-degree grid cell.
 */
export function getCellRectangleBounds(
  cell: SpatialGridCellSummary,
  resolutionDeg = 0.01,
): [[number, number], [number, number]] {
  const half = resolutionDeg / 2;
  return [
    [cell.lat - half, cell.lon - half],
    [cell.lat + half, cell.lon + half],
  ];
}

/**
 * Derives accessible chromatic fill and outline styling for a cell using the active colorblind-safe palette.
 */
export function resolveCellStyle(
  cell: SpatialGridCellSummary,
  palette: PaletteType = 'inferno',
  maxFrpThreshold = 80,
): CellStyle {
  // Normalize cell mean FRP between 0 and maxFrpThreshold
  const t = normalizeValue(cell.mean_frp_mw, 10, maxFrpThreshold);
  const fillColor = interpolatePaletteHex(palette, t);

  // Dynamic radius based on total AFCD for circle markers
  const radius = Math.min(10, Math.max(4, Math.round(Math.log10(cell.total_afcd + 1) * 3)));

  // Regimes with higher nighttime fraction or extreme wildfire have slightly higher opacity
  const fillOpacity = cell.regime_class === 'SEVERE_WILDFIRE' ? 0.85 : 0.7;

  return {
    fillColor,
    color: '#0B0F17', // High-contrast border against dark aerospace map canvas
    weight: 1,
    fillOpacity,
    radius,
  };
}

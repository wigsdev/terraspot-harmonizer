/**
 * Contract: MapAOISelector Component Interface
 * Component props and callbacks for interactive WebGIS cartography.
 */

import type { BoundingBox, SpatialGridCellSummary } from '../../src/types';

export interface MapAOISelectorProps {
  /** Optional custom CSS class name for outer card wrapper */
  className?: string;
  /** Callback fired when user finishes drawing or editing a custom bounding box */
  onCustomAOIChange?: (bbox: BoundingBox | null) => void;
  /** Callback fired when user selects an individual 0.01-degree fire cell */
  onCellSelect?: (cell: SpatialGridCellSummary | null) => void;
  /** Override initial map height (default: 480px) */
  height?: number | string;
  /** Test override: disable remote network tile requests during JSDOM tests */
  disableRemoteTiles?: boolean;
}

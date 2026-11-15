/**
 * Burning Activity Calendar Matrix UI Component Contract.
 * Adheres to specs/006-burning-calendar-matrix/spec.md (Requirements FR-001 through FR-010).
 */

import type { PaletteType, RegionCube } from '../../../src/types';

export type CalendarMatrixViewMode = 'harmonized' | 'anomaly' | 'frp' | 'raw';

export interface SelectedCellCoordinates {
  year: number;
  month: number;
}

export interface BurningCalendarMatrixProps {
  /**
   * Complete spatiotemporal cube of the active benchmark Area of Interest.
   */
  activeCube?: RegionCube;

  /**
   * Initial analytical view projection (defaults to 'harmonized').
   */
  initialViewMode?: CalendarMatrixViewMode;

  /**
   * Active accessible color palette (derived from RegionContext if omitted).
   */
  activePalette?: PaletteType;

  /**
   * Whether to display right-margin annual sums and bottom-margin monthly medians (default: true).
   */
  enableMarginalSummaries?: boolean;

  /**
   * Callback fired when an individual cell is selected via mouse click or Enter/Space key.
   */
  onSelectRecord?: (record: {
    year: number;
    month: number;
    harmonizedHotspots: number;
    departurePercentage: number;
    robustZScore: number;
    meanFrpMw: number;
    nightFraction: number;
  }) => void;

  /**
   * Optional custom styling classes for root card container.
   */
  className?: string;
}

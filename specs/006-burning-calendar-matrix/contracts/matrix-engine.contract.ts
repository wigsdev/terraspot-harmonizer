/**
 * Calendar Matrix Computation & Chromatic Styling Contract.
 * Adheres to specs/006-burning-calendar-matrix/spec.md and docs/02-modis-viirs-harmonization-methodology.md.
 */

import type {
  ColorCellStyle,
  MonthlyRecord,
  PaletteType,
  RegionCube,
} from '../../../src/types';
import type {
  CalendarCellData,
  CalendarColumnSummary,
  CalendarMatrixViewMode,
  CalendarRowSummary,
} from '../data-model';

export interface MatrixComputationEngine {
  /**
   * Transforms raw regional monthly records into a complete 27-row x 12-col matrix grid.
   */
  generateMatrixGrid(
    cube: RegionCube,
    viewMode: CalendarMatrixViewMode,
    palette: PaletteType,
    monthNames: string[],
  ): CalendarCellData[][];

  /**
   * Calculates annual aggregated totals and peak months for each of the 27 rows.
   */
  computeRowSummaries(grid: CalendarCellData[][]): CalendarRowSummary[];

  /**
   * Calculates multi-year monthly baseline medians and critical thresholds for columns.
   */
  computeColumnSummaries(
    grid: CalendarCellData[][],
    monthNames: string[],
  ): CalendarColumnSummary[];

  /**
   * Resolves WCAG 2.1 AA compliant cell styling (hex background, text color, borders).
   */
  resolveCellVisual(
    record: MonthlyRecord,
    viewMode: CalendarMatrixViewMode,
    palette: PaletteType,
    maxHarmonized: number,
    maxFrp: number,
  ): ColorCellStyle;
}

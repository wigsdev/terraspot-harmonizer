/**
 * Component Contract: ClimatologyAnomalyChart.tsx
 * Adheres to specs/007-climatology-sensor-audit/spec.md (User Story 1 - P1 MVP)
 */

import type { RegionCube } from '../../../src/types';

export interface ClimatologyAnomalyChartProps {
  /** Active regional spatiotemporal cube from RegionContext or props */
  activeCube?: RegionCube | null;
  /** Currently selected calendar year (2000 - 2026). Defaults to 2024 or latest complete year */
  selectedYear?: number;
  /** Callback fired when user changes the active year via dropdown */
  onYearChange?: (year: number) => void;
  /** Optional month to highlight with active focus crosshair */
  highlightedMonth?: number;
  /** Optional container CSS class name */
  className?: string;
}

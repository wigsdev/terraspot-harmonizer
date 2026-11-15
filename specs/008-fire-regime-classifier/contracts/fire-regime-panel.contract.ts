/**
 * UI Component Contract for FireRegimePanel
 * Adheres to specs/008-fire-regime-classifier/spec.md
 */

import type { RegionCube } from '../../../src/types/region';

export interface FireRegimePanelProps {
  /**
   * The currently active spatiotemporal data cube.
   * If undefined, the panel renders an aerospace loading / empty state.
   */
  cube?: RegionCube;

  /**
   * Currently selected year in the global application context (2000 - 2026).
   * Points from this year are visually highlighted in the scatter plot.
   */
  selectedYear?: number;

  /**
   * Optional callback when a user clicks on an observation point in the scatter plot,
   * allowing bidirectional year/month synchronization with the rest of the dashboard.
   */
  onSelectObservation?: (year: number, month: number) => void;

  /**
   * Optional CSS className override.
   */
  className?: string;
}

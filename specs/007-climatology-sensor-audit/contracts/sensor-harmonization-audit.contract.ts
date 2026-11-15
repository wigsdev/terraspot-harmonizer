/**
 * Component Contract: SensorHarmonizationAudit.tsx
 * Adheres to specs/007-climatology-sensor-audit/spec.md (User Story 2 & 3 - P2 & P3)
 */

import type { RegionCube } from '../../../src/types';

export interface SensorHarmonizationAuditProps {
  /** Active regional spatiotemporal cube from RegionContext or props */
  activeCube?: RegionCube | null;
  /** Whether to show the statistical model fit scorecards (R^2, Pearson r, MAPE, RMSE) */
  showModelFitScorecards?: boolean;
  /** Whether to show the 12-month beta_m calibration factor bar chart */
  showBetaFactors?: boolean;
  /** Optional container CSS class name */
  className?: string;
}

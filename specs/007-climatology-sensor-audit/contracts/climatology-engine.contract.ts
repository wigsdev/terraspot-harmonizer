/**
 * Engine Contract: Climatology & Sensor Audit Data Transform Engine
 * Adheres to specs/007-climatology-sensor-audit/data-model.md
 */

import type { RegionCube } from '../../../src/types';
import type {
  ClimatologyCurvePoint,
  SensorAuditSeriesPoint,
  BetaFactorEntry,
} from '../data-model';

export interface ClimatologyEngineContract {
  /**
   * Transforms active cube data and selected year into 12 monthly climatological points.
   * Includes baseline median (M_m), IQR envelope ([P25, P75]), P90 threshold,
   * active year observations, and anomaly departures.
   */
  generateClimatologyCurveData(
    cube?: RegionCube | null,
    selectedYear?: number,
    monthNamesShort?: string[],
  ): ClimatologyCurvePoint[];

  /**
   * Transforms 2000-2026 historical monthly observations into a continuous
   * 322-point multi-decadal time series across all 4 sensor harmonization stages.
   */
  generateSensorAuditSeries(cube?: RegionCube | null): SensorAuditSeriesPoint[];

  /**
   * Extracts the 12 monthly empirical scaling factors (beta_1 to beta_12)
   * from the active region's dual-sensor overlap baseline (2012-2025).
   */
  extractBetaFactorEntries(
    cube?: RegionCube | null,
    monthNamesShort?: string[],
  ): BetaFactorEntry[];
}

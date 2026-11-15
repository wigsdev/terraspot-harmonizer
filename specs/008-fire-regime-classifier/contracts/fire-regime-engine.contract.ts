/**
 * Engine Transformation Contract for Fire Regime Diagnostics
 * Adheres to specs/008-fire-regime-classifier/spec.md
 */

import type { HarmonizedMonthlyRecord, FireRegimeClass } from '../../../src/types/harmonization';
import type {
  FireRegimePoint,
  FireRegimeScatterData,
  FireRegimeDistribution,
  FireRegimeMitigationPackage
} from '../../../src/types/regime';
import type { Language } from '../../../src/types/language';

export interface FireRegimeEngine {
  /**
   * Transforms raw monthly records into partitioned 2D scatter points for Recharts.
   * Excludes inactive months (hotspots == 0) and unobserved future months.
   */
  generateFireRegimeScatterData(
    records: HarmonizedMonthlyRecord[],
    activeYear?: number
  ): FireRegimeScatterData;

  /**
   * Computes the multi-decadal historical regime distribution for an Area of Interest.
   */
  computeFireRegimeDistribution(
    records: HarmonizedMonthlyRecord[]
  ): FireRegimeDistribution;

  /**
   * Generates targeted operational mitigation guidance for Civil Defense, Park Rangers,
   * and Agricultural Authorities based on the active year's peak regime.
   */
  generateOperationalMitigation(
    records: HarmonizedMonthlyRecord[],
    activeYear?: number,
    language?: Language
  ): FireRegimeMitigationPackage;
}

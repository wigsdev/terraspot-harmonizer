/**
 * Climatology Anomaly Curves & Sensor Harmonization Audit Types
 * Complies with specs/007-climatology-sensor-audit/data-model.md and contracts
 */

import type { RegionCube } from './region';

/**
 * Represents an individual calendar month (1-12) combining the historical
 * non-parametric baseline (2001-2025) and the active year's observation trajectory.
 */
export interface ClimatologyCurvePoint {
  month: number;                      // 1 - 12
  monthName: string;                  // Short month label ("Jan" / "Ene")
  baselineMedian: number;             // M_m (2001-2025 baseline median)
  baselineP25: number;                // P_25 lower quartile
  baselineP75: number;                // P_75 upper quartile
  baselineP90: number;                // P_90 critical disaster threshold
  iqrRange: [number, number];         // [baselineP25, baselineP75] for Recharts Area shading
  activeYearValue: number | null;     // Observed AFCD in active year (null for future months)
  departurePercentage: number | null; // Delta% vs baseline median
  robustZScore: number | null;        // Z-score calculated via IQR
  isCritical: boolean;                // True if activeYearValue >= baselineP90 or Z >= 2.0
  isFuture: boolean;                  // True for pending future months (e.g. Nov-Dec 2026)
}

/**
 * Represents a monthly timestamp in the multi-decadal time series (2000-2026, 322 points)
 * across all 4 sensor harmonization stages.
 */
export interface SensorAuditSeriesPoint {
  date: string;                       // "YYYY-MM"
  year: number;                       // 2000 - 2026
  month: number;                      // 1 - 12
  rawModisCount: number;              // Uncalibrated MODIS C6.1 (1 km)
  rawViirsCount: number | null;       // Uncalibrated VIIRS C2 (375 m, null before 2012)
  afcdCoregistered: number;           // 0.01° Active Fire Cell-Days
  harmonizedHotspots: number;         // Final bias-corrected series H_{y,m}
  sensorEra: 'MODIS_SOLO' | 'DUAL_SENSOR_FUSION' | 'VIIRS_CONTINUITY';
  isOverlapPeriod: boolean;           // True for 2012-2025 calibration baseline
  isStepJumpAnchor: boolean;          // True for 2012-01 (point of resolution transition)
}

/**
 * State model controlling interactive toggles for the 4 time series layers in SensorHarmonizationAudit.
 */
export interface AuditLayerVisibility {
  showRawModis: boolean;              // Default: true
  showRawViirs: boolean;              // Default: true
  showAfcd: boolean;                  // Default: false
  showHarmonized: boolean;            // Default: true
}

/**
 * Represents the empirical seasonal calibration scaling factor (beta_m) for a calendar month.
 */
export interface BetaFactorEntry {
  month: number;                      // 1 - 12
  monthName: string;                  // "Jan", "Feb", ...
  betaFactor: number;                 // beta_m = median(AFCD_VIIRS / AFCD_MODIS)
  formattedBeta: string;              // e.g. "1.42x"
  sampleCount: number;                // Years of overlap (14 years, 2012-2025)
}

/**
 * Component-level state model for ClimatologyAnomalyChart.
 */
export interface ClimatologyChartState {
  activeYear: number;                 // Current selected year (2000 - 2026)
  hoveredMonth: number | null;        // Month index under mouse/focus
  tooltipVisible: boolean;
}

/**
 * Props for ClimatologyAnomalyChart.tsx (US1 - MVP)
 */
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

/**
 * Props for SensorHarmonizationAudit.tsx (US2 & US3)
 */
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

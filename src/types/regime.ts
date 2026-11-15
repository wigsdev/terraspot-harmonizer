/**
 * Fire Regime Diagnostic Classifier types & contracts.
 * Adheres to docs/02-modis-viirs-harmonization-methodology.md Section 6
 * and specs/008-fire-regime-classifier/spec.md.
 */

import type { FireRegimeClass } from './harmonization';

export interface FireRegimePoint {
  x: number; // Mean FRP in Megawatts (X-axis)
  y: number; // Night Fraction f_night in [0, 1] (Y-axis)
  z: number; // Harmonized hotspots H_{y,m} (bubble radius / weighting)
  year: number; // 2000 - 2026
  month: number; // 1 - 12
  monthName: string; // e.g. "Aug", "Ago"
  mean_frp_mw: number;
  p90_frp_mw: number;
  night_fraction: number;
  fire_regime_index: number; // I_{regime} (0 - 100)
  regime_class: FireRegimeClass;
  isActiveYear: boolean;
}

export interface FireRegimeScatterData {
  agricultural: FireRegimePoint[];
  transitional: FireRegimePoint[];
  severeWildfire: FireRegimePoint[];
  activeYearPoints: FireRegimePoint[];
  maxFrp: number;
  maxNightFraction: number;
}

export interface FireRegimeDistribution {
  totalActiveMonths: number;
  agriculturalCount: number;
  agriculturalPct: number; // 0 - 100
  transitionalCount: number;
  transitionalPct: number; // 0 - 100
  severeWildfireCount: number;
  severeWildfirePct: number; // 0 - 100
  dominantRegime: FireRegimeClass;
  meanRegimeIndex: number; // 0 - 100
}

export type AgencyId = 'civil_defense' | 'park_rangers' | 'agricultural';

export type AlertLevel = 'ADVISORY' | 'WARNING' | 'EMERGENCY';

export interface OperationalAgencyAdvice {
  agencyId: AgencyId;
  agencyName: string;
  alertLevel: AlertLevel;
  headline: string;
  actionItems: string[];
}

export interface FireRegimeMitigationPackage {
  postureLevel: AlertLevel;
  activeYear: number;
  peakRegime: FireRegimeClass;
  peakRegimeIndex: number;
  agencies: OperationalAgencyAdvice[];
}

/**
 * Interface Contract: KPIMetricsSummary & Calculation Engine
 * Feature: 004-navigation-kpis-shell
 */

import type { RegionCube } from '../../../src/types/region';
import type { Language, BilingualDictionary } from './language-context.contract';
import type { AnomalyAlertStatus, FireRegimeClass } from '../../../src/types/harmonization';

export interface KPIMetricsSummary {
  // Card 1: Total Harmonized Fire Activity
  totalAfcd: number;
  formattedTotalAfcd: string;
  rSquared: number;
  formattedRSquared: string;

  // Card 2: Peak Burning Season
  peakMonths: number[];
  peakMonthsLabel: string;
  peakSharePercentage: number;
  formattedPeakShare: string;

  // Card 3: Season Anomaly Alert (evaluated on 2026-10 vs M_10)
  observationDate: string;
  departurePercentage: number;
  formattedDeparture: string;
  robustZScore: number;
  formattedZScore: string;
  alertStatus: AnomalyAlertStatus;
  alertBadgeLabel: string;

  // Card 4: Dominant Fire Regime Diagnostic
  regimeClass: FireRegimeClass;
  regimeBadgeLabel: string;
  meanFrpMw: number;
  formattedMeanFrp: string;
  nightFractionPercentage: number;
  formattedNightFraction: string;
}

export interface KPICalculator {
  computeKPISummary: (
    cube: RegionCube | null,
    lang: Language,
    dict: BilingualDictionary
  ) => KPIMetricsSummary;
}

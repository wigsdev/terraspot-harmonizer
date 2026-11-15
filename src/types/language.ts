/**
 * Bilingual localization, dictionary, and KPI summary view-model contracts.
 * Adheres to specs/004-navigation-kpis-shell/contracts/.
 */

import type { AnomalyAlertStatus, FireRegimeClass } from './harmonization';

export type Language = 'en' | 'es';

export interface BilingualDictionary {
  navbar: {
    brand: string;
    challengeBadge: string;
    versionTag: string;
    subtitle: string;
    sensorBaseline: string;
    regionSelectAria: string;
    paletteSelectAria: string;
    languageToggleAria: string;
    exportCsv: string;
  };
  regionNames: Record<string, string>;
  regionCountries: Record<string, string>;
  paletteNames: {
    inferno: string;
    viridis: string;
    cividis: string;
    diverging: string;
  };
  kpiCards: {
    card1: {
      title: string;
      unit: string;
      r2Label: string;
    };
    card2: {
      title: string;
      subtextPrefix: string;
      subtextSuffix: string;
    };
    card3: {
      title: string;
      latestObservationLabel: string;
      alertStatus: {
        NORMAL: string;
        ELEVATED: string;
        CRITICAL: string;
      };
    };
    card4: {
      title: string;
      frpLabel: string;
      nightFractionLabel: string;
      regimeClasses: {
        AGRICULTURAL_BURN: string;
        TRANSITIONAL: string;
        SEVERE_WILDFIRE: string;
      };
    };
  };
  monthNamesShort: string[];
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: BilingualDictionary;
}

export interface KPIMetricsSummary {
  // Card 1: Total Harmonized Fire Activity (2000-2026)
  totalAfcd: number;
  formattedTotalAfcd: string;
  rSquared: number;
  formattedRSquared: string;

  // Card 2: Peak Burning Season
  peakMonths: number[];
  peakMonthsLabel: string;
  peakSharePercentage: number;
  formattedPeakShare: string;

  // Card 3: Season Anomaly Alert (evaluated on latest observation vs baseline median)
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

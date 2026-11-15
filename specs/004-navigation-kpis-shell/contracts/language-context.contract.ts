/**
 * Interface Contract: LanguageContext
 * Feature: 004-navigation-kpis-shell
 */

export type Language = 'en' | 'es';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: BilingualDictionary;
}

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

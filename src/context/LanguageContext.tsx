/**
 * Reactive Bilingual Localization Context (English default + Spanish).
 * Complies with TerraSpot Harmonizer Constitution Principle I.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { BilingualDictionary, Language, LanguageContextType } from '../types';

export const DICTIONARIES: Record<Language, BilingualDictionary> = {
  en: {
    navbar: {
      brand: 'TerraSpot Harmonizer',
      challengeBadge: 'Challenge 15',
      versionTag: 'v0.5.0',
      subtitle:
        'Unified Multi-Decadal Burning Activity Calendar & Fire Regime Diagnostic Engine (2000–2026)',
      sensorBaseline: 'MODIS (2000–2026) + VIIRS (2012–2026)',
      regionSelectAria: 'Select Benchmark Region',
      paletteSelectAria: 'Select Accessible Color Palette',
      languageToggleAria: 'Switch Application Language',
      exportCsv: 'Export CSV',
    },
    regionNames: {
      'PE-HCO': 'Huánuco & Central Peruvian Andes',
      'SAM-MAP': 'Southern Amazon Basin (MAP Frontier)',
      'AR-PAR': 'Paraná River Delta & Gran Chaco',
      'US-CAL': 'California Sierra & Coastal Ranges',
      'AU-NSW': 'New South Wales Eucalyptus Forest Belt',
    },
    regionCountries: {
      'PE-HCO': 'Peru',
      'SAM-MAP': 'Peru / Brazil / Bolivia',
      'AR-PAR': 'Argentina / Paraguay',
      'US-CAL': 'United States',
      'AU-NSW': 'Australia',
    },
    paletteNames: {
      inferno: 'Inferno (Thermal Default)',
      viridis: 'Viridis (High Contrast)',
      cividis: 'Cividis (Colorblind Safe)',
      diverging: 'Diverging (Anomaly Δ%)',
    },
    kpiCards: {
      card1: {
        title: 'Harmonized Fire Activity (2000–2026)',
        unit: 'AFCD',
        r2Label: 'Calibrated Sensor Fit',
      },
      card2: {
        title: 'Peak Burning Season',
        subtextPrefix: '',
        subtextSuffix: 'of annual fire activity',
      },
      card3: {
        title: 'Season Anomaly Alert',
        latestObservationLabel: '2026-10 vs M₁₀',
        alertStatus: {
          NORMAL: 'NORMAL BASELINE',
          ELEVATED: 'ELEVATED ANOMALY',
          CRITICAL: 'CRITICAL ALERT',
        },
      },
      card4: {
        title: 'Dominant Fire Regime',
        frpLabel: 'Mean FRP',
        nightFractionLabel: 'Night',
        regimeClasses: {
          AGRICULTURAL_BURN: 'Seasonal Agricultural Burn',
          TRANSITIONAL: 'Mixed / Transitional Regime',
          SEVERE_WILDFIRE: 'Severe Landscape Wildfire',
        },
      },
    },
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  es: {
    navbar: {
      brand: 'TerraSpot Harmonizer',
      challengeBadge: 'Challenge 15',
      versionTag: 'v0.5.0',
      subtitle:
        'Calendario Multidecadal Unificado de Actividad de Quemas y Diagnóstico de Régimen de Fuego (2000–2026)',
      sensorBaseline: 'MODIS (2000–2026) + VIIRS (2012–2026)',
      regionSelectAria: 'Seleccionar Región de Referencia',
      paletteSelectAria: 'Seleccionar Paleta de Color Accesible',
      languageToggleAria: 'Cambiar Idioma de la Aplicación',
      exportCsv: 'Exportar CSV',
    },
    regionNames: {
      'PE-HCO': 'Huánuco y Andes Centrales del Perú',
      'SAM-MAP': 'Cuenca Amazónica Sur (Frontera MAP)',
      'AR-PAR': 'Delta del Río Paraná y Gran Chaco',
      'US-CAL': 'Sierra de California y Cordilleras Costeras',
      'AU-NSW': 'Cinturón de Eucaliptos de Nueva Gales del Sur',
    },
    regionCountries: {
      'PE-HCO': 'Perú',
      'SAM-MAP': 'Perú / Brasil / Bolivia',
      'AR-PAR': 'Argentina / Paraguay',
      'US-CAL': 'Estados Unidos',
      'AU-NSW': 'Australia',
    },
    paletteNames: {
      inferno: 'Inferno (Térmico por Defecto)',
      viridis: 'Viridis (Alto Contraste)',
      cividis: 'Cividis (Seguro para Daltonismo)',
      diverging: 'Divergente (Anomalía Δ%)',
    },
    kpiCards: {
      card1: {
        title: 'Actividad de Fuego Armonizada (2000–2026)',
        unit: 'AFCD',
        r2Label: 'Ajuste Inter-Sensor',
      },
      card2: {
        title: 'Temporada Alta de Quemas',
        subtextPrefix: '',
        subtextSuffix: 'de la actividad anual',
      },
      card3: {
        title: 'Alerta de Anomalía Estacional',
        latestObservationLabel: '2026-10 vs M₁₀',
        alertStatus: {
          NORMAL: 'BASE NORMAL',
          ELEVATED: 'ANOMALÍA ELEVADA',
          CRITICAL: 'ALERTA CRÍTICA',
        },
      },
      card4: {
        title: 'Régimen de Fuego Dominante',
        frpLabel: 'FRP Medio',
        nightFractionLabel: 'Nocturno',
        regimeClasses: {
          AGRICULTURAL_BURN: 'Quema Agrícola Estacional',
          TRANSITIONAL: 'Régimen Mixto / Transicional',
          SEVERE_WILDFIRE: 'Incendio Forestal Severo',
        },
      },
    },
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface LanguageProviderProps {
  children: React.ReactNode;
  initialLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguage = 'en',
}) => {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
  }, []);

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: DICTIONARIES[language],
    }),
    [language, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

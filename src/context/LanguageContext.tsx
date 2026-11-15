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
      versionTag: 'v0.7.0',
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
    map: {
      title: 'Geospatial AOI Canvas & Satellite Telemetry',
      subtitle:
        'NASA GIBS true-color satellite imagery, interactive bounding-box drawing, and 0.01° active fire density grid',
      layerSelectAria: 'Select Cartographic or Satellite Layer',
      layers: {
        darkMatter: 'Esri Dark Gray Canvas (Aerospace Base)',
        modisTrueColor: 'NASA GIBS MODIS Terra (True Color)',
        viirsTrueColor: 'NASA GIBS VIIRS SNPP (True Color)',
        fireCells: '0.01° Active Fire Cell Density',
      },
      drawAoiButton: 'Draw Custom AOI',
      drawingActive: 'Click & Drag to Draw AOI Rectangle',
      resetAoiButton: 'Reset to Region Bounds',
      fitBoundsButton: 'Recenter Map',
      coordinatesHeading: 'Bounding Box (WGS84)',
      minLat: 'Min Lat',
      maxLat: 'Max Lat',
      minLon: 'Min Lon',
      maxLon: 'Max Lon',
      invalidCoordsError: 'Coordinates out of bounds (-85° to 85° Lat, -180° to 180° Lon)',
      cellPopup: {
        title: 'Active Fire Cell (0.01° Grid)',
        coordinates: 'Centroid',
        totalAfcd: 'Harmonized AFCD (2000–2026)',
        peakMonth: 'Peak Month',
        meanFrp: 'Mean FRP',
        p90Frp: '90th %ile FRP',
        nightFraction: 'Night Persistence',
        regime: 'Dominant Regime',
      },
      noCellsDetected: 'No active fire cells detected within selected coordinates',
      gibsReferenceDateLabel: 'NASA GIBS Satellite Pass Date',
    },
    matrix: {
      title: 'Burning Activity Calendar Matrix (2000–2026)',
      subtitle:
        'Multi-decadal monthly fire frequency, climatological anomalies, and sensor regime synthesis across 27 observation years.',
      modes: {
        harmonized: 'Harmonized Hotspots',
        harmonizedTooltip: 'Calibrated Active Fire Cell-Days (AFCD) with inter-sensor bias correction',
        anomaly: 'Climatological Anomaly',
        anomalyTooltip: 'Percentage departure (Δ%) vs 2001–2025 non-parametric baseline median',
        frp: 'Fire Radiative Power',
        frpTooltip: 'Mean combustion energy output (MW) reflecting burn intensity',
        raw: 'Raw Sensor Counts',
        rawTooltip: 'Uncalibrated MODIS + VIIRS detections exposing the artificial 2012 step-jump',
      },
      eras: {
        modisSolo: 'MODIS Solo Era (2000–2011)',
        dualFusion: 'Dual-Sensor Fusion (2012–2025)',
        viirsContinuity: 'VIIRS Continuity (2026)',
      },
      marginalLabels: {
        annualSum: 'Annual Total',
        monthlyMedian: 'Baseline Median (2001–2025)',
        scrollHint: 'Scroll horizontally to view all 12 months & annual totals ↔',
      },
      legend: {
        low: 'Low Activity',
        high: 'Peak Fire Activity',
        negativeDeparture: 'Below Median (-Δ%)',
        baselineMedian: 'Baseline Median (0%)',
        positiveDeparture: 'Above Median (+Δ%)',
        futureMonth: 'Future / Incomplete Month',
        criticalAnomalyBadge: 'Critical Anomaly (P90 / Z ≥ 2.0)',
      },
      stepJumpNotice:
        'Sensor Audit Alert: Raw uncalibrated counts exhibit an artificial ~3x step-jump in 2012 caused by VIIRS 375m spatial resolution change. Switch to Harmonized mode to observe bias-corrected physical trends.',
      futureMonthBadge: 'Pending Observation',
      tooltip: {
        yearMonth: 'Observation Period',
        sensorEra: 'Sensor Regime',
        harmonizedCount: 'Harmonized Hotspots',
        rawModis: 'Raw MODIS C6.1',
        rawViirs: 'Raw VIIRS C2',
        baselineMedian: 'Historical Median',
        departure: 'Anomaly Departure',
        robustZ: 'Robust Z-Score',
        meanFrp: 'Mean FRP',
        nightFraction: 'Night Persistence',
        status: 'Anomaly Status',
        regime: 'Dominant Regime',
      },
      aria: {
        gridLabel: '27-year by 12-month burning activity calendar matrix',
        cellSelected: 'Selected cell',
        viewModeGroup: 'Matrix view mode selector',
      },
    },
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  es: {
    navbar: {
      brand: 'TerraSpot Harmonizer',
      challengeBadge: 'Challenge 15',
      versionTag: 'v0.7.0',
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
    map: {
      title: 'Lienzo Geoespacial de AOI y Telemetría Satelital',
      subtitle:
        'Imágenes satelitales NASA GIBS color verdadero, dibujo interactivo de área de interés y grilla de densidad de 0.01°',
      layerSelectAria: 'Seleccionar Capa Cartográfica o Satelital',
      layers: {
        darkMatter: 'Esri Dark Gray Canvas (Base Aeroespacial)',
        modisTrueColor: 'NASA GIBS MODIS Terra (Color Verdadero)',
        viirsTrueColor: 'NASA GIBS VIIRS SNPP (Color Verdadero)',
        fireCells: 'Densidad de Celdas de Fuego Activo 0.01°',
      },
      drawAoiButton: 'Dibujar AOI Personalizado',
      drawingActive: 'Haz clic y arrastra para dibujar el rectángulo de AOI',
      resetAoiButton: 'Restablecer Límite Regional',
      fitBoundsButton: 'Recentrar Mapa',
      coordinatesHeading: 'Caja Delimitadora (WGS84)',
      minLat: 'Lat Mín',
      maxLat: 'Lat Máx',
      minLon: 'Lon Mín',
      maxLon: 'Lon Máx',
      invalidCoordsError: 'Coordenadas fuera de rango (-85° a 85° Lat, -180° a 180° Lon)',
      cellPopup: {
        title: 'Celda de Fuego Activo (Grilla 0.01°)',
        coordinates: 'Centroide',
        totalAfcd: 'AFCD Armonizado (2000–2026)',
        peakMonth: 'Mes Pico',
        meanFrp: 'FRP Medio',
        p90Frp: 'FRP Percentil 90',
        nightFraction: 'Persistencia Nocturna',
        regime: 'Régimen Dominante',
      },
      noCellsDetected: 'No se detectaron celdas de fuego activo dentro de las coordenadas seleccionadas',
      gibsReferenceDateLabel: 'Fecha de Pasada Satelital NASA GIBS',
    },
    matrix: {
      title: 'Matriz Calendario de Actividad de Quemas (2000–2026)',
      subtitle:
        'Frecuencia mensual multidecadal de incendios, anomalías climatológicas y síntesis de régimen de sensores a lo largo de 27 años de observación.',
      modes: {
        harmonized: 'Focos Armonizados',
        harmonizedTooltip: 'Celdas-Día de Fuego Activo (AFCD) calibradas con corrección de sesgo entre sensores',
        anomaly: 'Anomalía Climatológica',
        anomalyTooltip: 'Desviación porcentual (Δ%) respecto a la mediana no paramétrica de línea base 2001–2025',
        frp: 'Potencia Radiativa (FRP)',
        frpTooltip: 'Energía de combustión media (MW) que refleja la intensidad de la quema',
        raw: 'Conteos Crudos de Sensores',
        rawTooltip: 'Detecciones no calibradas de MODIS + VIIRS que exponen el salto artificial de 2012',
      },
      eras: {
        modisSolo: 'Era MODIS Exclusiva (2000–2011)',
        dualFusion: 'Fusión Dual de Sensores (2012–2025)',
        viirsContinuity: 'Continuidad VIIRS (2026)',
      },
      marginalLabels: {
        annualSum: 'Total Anual',
        monthlyMedian: 'Mediana Base (2001–2025)',
        scrollHint: 'Deslizar horizontalmente para ver los 12 meses y totales anuales ↔',
      },
      legend: {
        low: 'Baja Actividad',
        high: 'Pico de Actividad de Fuego',
        negativeDeparture: 'Bajo la Mediana (-Δ%)',
        baselineMedian: 'Mediana Base (0%)',
        positiveDeparture: 'Sobre la Mediana (+Δ%)',
        futureMonth: 'Mes Futuro / Incompleto',
        criticalAnomalyBadge: 'Alerta Crítica (P90 / Z ≥ 2.0)',
      },
      stepJumpNotice:
        'Alerta de Auditoría de Sensores: Los conteos crudos sin calibrar exhiben un salto artificial de ~3x en 2012 por la mayor resolución espacial de VIIRS (375 m). Cambie a modo Armonizado para observar la tendencia física corregida.',
      futureMonthBadge: 'Observación Pendiente',
      tooltip: {
        yearMonth: 'Período de Observación',
        sensorEra: 'Régimen de Sensores',
        harmonizedCount: 'Focos Armonizados',
        rawModis: 'MODIS C6.1 Crudo',
        rawViirs: 'VIIRS C2 Crudo',
        baselineMedian: 'Mediana Histórica',
        departure: 'Desviación de Anomalía',
        robustZ: 'Puntaje Z Robusto',
        meanFrp: 'FRP Medio',
        nightFraction: 'Persistencia Nocturna',
        status: 'Estado de Anomalía',
        regime: 'Régimen Dominante',
      },
      aria: {
        gridLabel: 'Matriz calendario de actividad de quemas de 27 años por 12 meses',
        cellSelected: 'Celda seleccionada',
        viewModeGroup: 'Selector de proyección analítica de la matriz',
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

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
      versionTag: 'v0.11.0',
      subtitle:
        'Unified Multi-Decadal Burning Activity Calendar & Fire Regime Diagnostic Engine (2000–2026)',
      sensorBaseline: 'MODIS (2000–2026) + VIIRS (2012–2026)',
      regionSelectAria: 'Select Benchmark Region',
      paletteSelectAria: 'Select Accessible Color Palette',
      languageToggleAria: 'Switch Application Language',
      exportCsv: 'Export CSV',
      uploadCsv: 'Upload FIRMS CSV',
      customDataBadge: 'Custom Data Active',
      resetBenchmark: 'Reset Benchmark',
      exportCsvTooltip: 'Download standardized 27-column RFC 4180 CSV dataset',
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
    climatology: {
      title: 'Climatological Seasonal Curves & Anomaly Envelope',
      subtitle:
        '12-month active fire trajectory vs 2001–2025 non-parametric median, shaded IQR normal envelope, and P90 critical threshold.',
      yearSelectAria: 'Select observation year for climatological anomaly curve',
      activeYearLabel: 'Active Year',
      baselineMedian: 'Baseline Median (2001–2025)',
      iqrEnvelope: 'Normal Seasonal Envelope (P25–P75 IQR)',
      p90Threshold: 'Critical Alert Threshold (P90)',
      anomalyTrajectory: 'Observed Trajectory',
      selectYearPlaceholder: 'Select Year',
      tooltip: {
        month: 'Calendar Month',
        observed: 'Observed Hotspots',
        baseline: 'Baseline Median (Mm)',
        iqr: 'Normal Envelope (IQR)',
        departure: 'Anomaly Departure (Δ%)',
        zScore: 'Robust Z-Score',
        alert: 'Alert Status',
        futurePending: 'Pending satellite pass observation',
      },
      alerts: {
        normal: 'Normal Baseline (Within IQR)',
        elevated: 'Elevated Anomaly (Above P75)',
        critical: 'Critical Alert (≥ P90 / Z ≥ 2.0)',
        pending: 'Pending Observation',
      },
    },
    sensorAudit: {
      title: 'Sensor Harmonization Audit & Multi-Decadal Discontinuity Analysis',
      subtitle:
        'Continuous 27-year time series (2000–2026) demonstrating artificial step-jump elimination and cross-sensor convergence.',
      layerGroupAria: 'Toggle sensor harmonization audit layers',
      layers: {
        rawModis: 'Raw MODIS C6.1 (1 km)',
        rawViirs: 'Raw VIIRS C2 (375 m)',
        afcd: '0.01° AFCD Coregistered',
        harmonized: 'Harmonized Series (Hy,m)',
      },
      stepJumpCallout: {
        badge: 'Artificial 2012 Step-Jump',
        title: 'Sensor Resolution Artifact Disclosed',
        description:
          'Raw uncalibrated counts jump ~3x in 2012 due to VIIRS 375m spatial resolution change (vs MODIS 1km). Stage 2 AFCD gridding and Stage 3 seasonal calibration restore physical continuity across the 2011–2012 boundary.',
      },
      scorecards: {
        title: 'Cross-Sensor Calibration Performance (2012–2025 Overlap)',
        r2: 'Determination (R²)',
        r2Desc: 'Post-calibration convergence (≥ 0.90 target)',
        pearson: 'Pearson Correlation (r)',
        pearsonDesc: 'Co-registered linear association',
        mape: 'MAPE Reduction',
        mapeDesc: 'Inter-sensor bias reduction (≥ 65% target)',
        rmse: 'RMSE Fit',
        rmseDesc: 'Root mean square error in AFCD units',
      },
      betaFactors: {
        title: 'Regional Monthly Calibration Factors (β₁ to β₁₂)',
        subtitle:
          'Empirical scaling ratios median(AFCD_VIIRS / AFCD_MODIS) computed over the 14-year dual-sensor overlap baseline.',
        factorLabel: 'Scaling Ratio',
        overlapYears: '14-Year Overlap (2012–2025)',
      },
      tooltip: {
        period: 'Observation Period',
        rawModis: 'Raw MODIS',
        rawViirs: 'Raw VIIRS',
        afcd: '0.01° AFCD',
        harmonized: 'Harmonized Hotspots',
        era: 'Sensor Regime',
      },
    },
    fireRegime: {
      title: 'Fire Regime Diagnostic Classifier: Agricultural Burning vs. Landscape Wildfires',
      subtitle:
        '2D phase-space classification integrating Fire Radiative Power (MW) and nocturnal combustion persistence (f_night) fulfilling NASA Challenge 15 Requirement R6.',
      quadrants: {
        agricultural: 'Seasonal Agricultural Burning',
        agriculturalSub: 'Daytime low-intensity crop residue clearance (Mean FRP < 25 MW, f_night < 0.10, I_regime < 35)',
        transitional: 'Mixed / Transitional Regime',
        transitionalSub: 'Escaped field burns & secondary scrub fires (Mean FRP 25–45 MW, f_night 0.10–0.20, I_regime 35–65)',
        severeWildfire: 'Severe Landscape Wildfire',
        severeWildfireSub: 'High-intensity crown combustion with nocturnal persistence (Mean FRP > 45 MW, f_night > 0.20, I_regime ≥ 65)',
      },
      axes: {
        xAxis: 'Mean Fire Radiative Power — FRP (Megawatts)',
        yAxis: 'Nocturnal Combustion Persistence — f_night (Fraction)',
      },
      legend: {
        agricultural: 'Agricultural Burning',
        transitional: 'Transitional / Escaped Burn',
        severeWildfire: 'Severe Landscape Wildfire',
        activeYearHighlight: 'Active Year Trajectory',
      },
      distribution: {
        title: 'Historical Regime Frequency Distribution (AOI Baseline)',
        agriculturalLabel: 'Agricultural Burning',
        transitionalLabel: 'Transitional / Escaped',
        severeWildfireLabel: 'Severe Wildfires',
        dominantRegime: 'Dominant AOI Regime',
        meanIndex: 'Multi-Decadal Mean Index (I_regime)',
        totalMonths: 'Active Fire Months Analyzed',
      },
      mitigation: {
        title: 'Multi-Agency Operational Mitigation & Tactical Directives',
        subtitle:
          'Context-aware operational guidance dynamically calibrated to the active year peak fire regime severity.',
        activePosture: 'Operational Alert Posture',
        postures: {
          ADVISORY: 'Advisory: Routine Agrarian Governance',
          WARNING: 'Warning: Escape Risk & Buffer Defense',
          EMERGENCY: 'Emergency: Full Wildfire Mobilization',
        },
        agencyCivilDefense: 'Civil Defense & Emergency Response',
        agencyParkRangers: 'Park Rangers & Conservation Units',
        agencyAgricultural: 'Agricultural & Extension Authorities',
      },
      tooltip: {
        period: 'Observation Month',
        regime: 'Diagnostic Regime',
        meanFrp: 'Mean FRP',
        p90Frp: 'P90 FRP',
        nightFraction: 'Night Combustion',
        hotspots: 'Harmonized Hotspots',
        regimeIndex: 'Regime Index (I_regime)',
      },
      zeroFireNotice: 'Note: Inactive months with zero detected fire activity are excluded from the phase space.',
    },
    customCsvModal: {
      title: 'Custom NASA FIRMS Hotspot Ingestion',
      subtitle:
        'Upload raw MODIS C6.1 or VIIRS 375m C2 CSV files for in-browser geometric grid aggregation and live re-harmonization.',
      dropzoneTitle: 'Drag & Drop NASA FIRMS CSV Here',
      dropzoneSubtitle: 'or click to browse from local filesystem (.csv, .txt)',
      dropzoneActive: 'Drop CSV file to initiate client-side validation...',
      selectFileButton: 'Choose CSV File',
      loadSampleButton: 'Load Sample Dataset (Huánuco 2024–2025)',
      loadingSample: 'Fetching and validating sample FIRMS data...',
      parsingFile: 'Parsing and filtering active vegetation fire records...',
      applyButton: 'Apply to Dashboard',
      resetButton: 'Reset to Default Benchmark',
      closeButton: 'Close',
      report: {
        statusValid: 'Validated NASA FIRMS Hotspot Dataset',
        statusInvalid: 'Validation Failed: Corrupted or Unsupported Schema',
        fileName: 'Source File',
        fileSize: 'File Size',
        totalRows: 'Total Raw Records',
        validHotspots: 'Vegetation Hotspots (type=0)',
        excludedRows: 'Excluded Detections',
        detectedSensors: 'Detected Sensors',
        dateRange: 'Temporal Span',
        boundingBox: 'Spatial Bounding Box',
        fireWeatherIndicators: 'In-Situ Fire Weather Indicators (Meteomatics Global Offer)',
      },
      weatherCard: {
        fireWarningIndex: 'Forest Fire Warning Index',
        soilMoisture: 'Evapotranspiration (24h)',
        windSpeed: 'Wind Speed (10m)',
        relativeHumidity: 'Relative Humidity',
        providerNote: 'Retrieved via Meteomatics Weather API integration for active AOI',
      },
      errors: {
        emptyFile: 'The uploaded file is empty or contains no parseable rows.',
        missingColumns:
          'Mandatory NASA FIRMS columns missing: latitude, longitude, and acq_date are required.',
        invalidDates: 'No valid acquisition dates (YYYY-MM-DD) detected in records.',
        invalidCoords: 'Geographic coordinates out of valid range (lat [-90, 90], lon [-180, 180]).',
        parseError: 'Unable to parse CSV structure. Please check delimiter and header format.',
      },
    },
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  es: {
    navbar: {
      brand: 'TerraSpot Harmonizer',
      challengeBadge: 'Challenge 15',
      versionTag: 'v0.11.0',
      subtitle:
        'Calendario Multidecadal Unificado de Actividad de Quemas y Diagnóstico de Régimen de Fuego (2000–2026)',
      sensorBaseline: 'MODIS (2000–2026) + VIIRS (2012–2026)',
      regionSelectAria: 'Seleccionar Región de Referencia',
      paletteSelectAria: 'Seleccionar Paleta de Color Accesible',
      languageToggleAria: 'Cambiar Idioma de la Aplicación',
      exportCsv: 'Exportar CSV',
      uploadCsv: 'Subir CSV de FIRMS',
      customDataBadge: 'Datos Personalizados Activos',
      resetBenchmark: 'Restablecer Benchmark',
      exportCsvTooltip: 'Descargar dataset estandarizado RFC 4180 de 27 columnas',
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
    climatology: {
      title: 'Curvas Estacionales Climatológicas y Envolvente de Anomalías',
      subtitle:
        'Trayectoria mensual de incendios del año activo vs mediana no paramétrica 2001–2025, envolvente IQR normal y umbral crítico P90.',
      yearSelectAria: 'Seleccionar año de observación para la curva climatológica',
      activeYearLabel: 'Año Activo',
      baselineMedian: 'Mediana Histórica (2001–2025)',
      iqrEnvelope: 'Envolvente Estacional Normal (IQR P25–P75)',
      p90Threshold: 'Umbral de Alerta Crítica (P90)',
      anomalyTrajectory: 'Trayectoria Observada',
      selectYearPlaceholder: 'Seleccionar Año',
      tooltip: {
        month: 'Mes del Calendario',
        observed: 'Focos Observados',
        baseline: 'Mediana Histórica (Mm)',
        iqr: 'Envolvente Normal (IQR)',
        departure: 'Desviación de Anomalía (Δ%)',
        zScore: 'Puntaje Z Robusto',
        alert: 'Nivel de Alerta',
        futurePending: 'Observación satelital pendiente',
      },
      alerts: {
        normal: 'Línea Base Normal (Dentro del IQR)',
        elevated: 'Anomalía Elevada (Sobre P75)',
        critical: 'Alerta Crítica (≥ P90 / Z ≥ 2.0)',
        pending: 'Observación Pendiente',
      },
    },
    sensorAudit: {
      title: 'Auditoría de Armonización de Sensores y Análisis de Discontinuidad Multidecadal',
      subtitle:
        'Serie temporal continua de 27 años (2000–2026) demostrando la eliminación del salto artificial y convergencia entre sensores.',
      layerGroupAria: 'Alternar capas de auditoría de armonización de sensores',
      layers: {
        rawModis: 'MODIS C6.1 Crudo (1 km)',
        rawViirs: 'VIIRS C2 Crudo (375 m)',
        afcd: 'AFCD Corregistrado 0.01°',
        harmonized: 'Serie Armonizada (Hy,m)',
      },
      stepJumpCallout: {
        badge: 'Salto Artificial en 2012',
        title: 'Artefacto por Resolución de Sensores Divulgado',
        description:
          'Los conteos crudos sin calibrar se triplican en 2012 debido al cambio de resolución espacial a 375m de VIIRS (frente a 1km de MODIS). El remuestreo AFCD en Etapa 2 y la calibración estacional en Etapa 3 restablecen la continuidad física a través del límite 2011–2012.',
      },
      scorecards: {
        title: 'Desempeño de Calibración Cruzada (Solapamiento 2012–2025)',
        r2: 'Determinación (R²)',
        r2Desc: 'Convergencia post-calibración (meta ≥ 0.90)',
        pearson: 'Correlación de Pearson (r)',
        pearsonDesc: 'Asociación lineal corregistrada',
        mape: 'Reducción de MAPE',
        mapeDesc: 'Reducción de sesgo inter-sensor (meta ≥ 65%)',
        rmse: 'Ajuste RMSE',
        rmseDesc: 'Error cuadrático medio en unidades AFCD',
      },
      betaFactors: {
        title: 'Factores de Calibración Mensuales Regionales (β₁ a β₁₂)',
        subtitle:
          'Ratios empíricos de escalado mediana(AFCD_VIIRS / AFCD_MODIS) calculados sobre la línea base de 14 años de solapamiento.',
        factorLabel: 'Factor de Escala',
        overlapYears: 'Solapamiento 14 Años (2012–2025)',
      },
      tooltip: {
        period: 'Período de Observación',
        rawModis: 'MODIS Crudo',
        rawViirs: 'VIIRS Crudo',
        afcd: 'AFCD 0.01°',
        harmonized: 'Focos Armonizados',
        era: 'Régimen de Sensores',
      },
    },
    fireRegime: {
      title: 'Clasificador Diagnóstico de Régimen de Fuego: Quemas Agrícolas vs. Incendios Forestales',
      subtitle:
        'Espacio de fase 2D integrando Potencia Radiativa de Fuego (MW) y persistencia de combustión nocturna (f_night), cumpliendo el Requisito R6 del Desafío 15 de la NASA.',
      quadrants: {
        agricultural: 'Quemas Agrícolas Estacionales',
        agriculturalSub: 'Eliminación diurna de rastrojos de baja intensidad (FRP Medio < 25 MW, f_night < 0.10, I_regime < 35)',
        transitional: 'Régimen Mixto / Transicional',
        transitionalSub: 'Quemas de rastrojo escapadas y fuegos de matorral (FRP Medio 25–45 MW, f_night 0.10–0.20, I_regime 35–65)',
        severeWildfire: 'Incendio Forestal de Paisaje Severo',
        severeWildfireSub: 'Combustión de copas de alta intensidad con persistencia nocturna (FRP Medio > 45 MW, f_night > 0.20, I_regime ≥ 65)',
      },
      axes: {
        xAxis: 'Potencia Radiativa de Fuego Media — FRP (Megavatios)',
        yAxis: 'Persistencia de Combustión Nocturna — f_night (Fracción)',
      },
      legend: {
        agricultural: 'Quemas Agrícolas',
        transitional: 'Quema Transicional / Escape',
        severeWildfire: 'Incendio Forestal Severo',
        activeYearHighlight: 'Trayectoria del Año Activo',
      },
      distribution: {
        title: 'Distribución Histórica de Frecuencia de Regímenes (Línea Base del AOI)',
        agriculturalLabel: 'Quemas Agrícolas',
        transitionalLabel: 'Transicionales / Escapes',
        severeWildfireLabel: 'Incendios Severos',
        dominantRegime: 'Régimen Dominante del AOI',
        meanIndex: 'Índice Multidecadal Promedio (I_regime)',
        totalMonths: 'Meses con Actividad Analizados',
      },
      mitigation: {
        title: 'Mitigación Operativa Multiactor & Directivas Tácticas',
        subtitle:
          'Orientación operativa sensible al contexto calibrada dinámicamente según la severidad pico del año activo.',
        activePosture: 'Postura de Alerta Operativa',
        postures: {
          ADVISORY: 'Aviso: Gobernanza Agraria Preventiva',
          WARNING: 'Alerta: Riesgo de Escape & Defensa de Margen',
          EMERGENCY: 'Emergencia: Movilización Integral contra Incendios',
        },
        agencyCivilDefense: 'Defensa Civil & Respuesta de Emergencia',
        agencyParkRangers: 'Guardaparques & Unidades de Conservación',
        agencyAgricultural: 'Autoridades Agrarias & Extensión Rural',
      },
      tooltip: {
        period: 'Mes de Observación',
        regime: 'Régimen Diagnóstico',
        meanFrp: 'FRP Medio',
        p90Frp: 'FRP P90',
        nightFraction: 'Combustión Nocturna',
        hotspots: 'Focos Armonizados',
        regimeIndex: 'Índice de Régimen (I_regime)',
      },
      zeroFireNotice: 'Nota: Los meses inactivos sin focos detectados se excluyen del espacio de fase.',
    },
    customCsvModal: {
      title: 'Ingesta Personalizada de Focos de Calor NASA FIRMS',
      subtitle:
        'Sube archivos CSV crudos de MODIS C6.1 o VIIRS 375m C2 para agregación en grilla geométrica y re-armonización en el navegador.',
      dropzoneTitle: 'Arrastra y Suelta tu CSV de NASA FIRMS Aquí',
      dropzoneSubtitle: 'o haz clic para explorar tu sistema de archivos (.csv, .txt)',
      dropzoneActive: 'Suelta el archivo CSV para iniciar la validación en el cliente...',
      selectFileButton: 'Seleccionar Archivo CSV',
      loadSampleButton: 'Cargar Dataset Demo (Huánuco 2024–2025)',
      loadingSample: 'Descargando y validando datos de prueba de FIRMS...',
      parsingFile: 'Analizando y filtrando registros de vegetación...',
      applyButton: 'Aplicar al Tablero',
      resetButton: 'Restablecer Benchmark Original',
      closeButton: 'Cerrar',
      report: {
        statusValid: 'Dataset NASA FIRMS Validado con Éxito',
        statusInvalid: 'Fallo de Validación: Esquema no soportado o corrupto',
        fileName: 'Archivo Origen',
        fileSize: 'Tamaño',
        totalRows: 'Total de Registros Crudos',
        validHotspots: 'Focos de Vegetación (tipo=0)',
        excludedRows: 'Detecciones Excluidas',
        detectedSensors: 'Sensores Detectados',
        dateRange: 'Rango Temporal',
        boundingBox: 'Límites Geográficos',
        fireWeatherIndicators: 'Indicadores Climáticos de Fuego In-Situ (Meteomatics Global Offer)',
      },
      weatherCard: {
        fireWarningIndex: 'Índice de Peligro de Incendios',
        soilMoisture: 'Evapotranspiración (24h)',
        windSpeed: 'Velocidad de Viento (10m)',
        relativeHumidity: 'Humedad Relativa',
        providerNote: 'Obtenido mediante integración oficial de la API de Meteomatics para la AOI activa',
      },
      errors: {
        emptyFile: 'El archivo subido está vacío o no contiene filas interpretables.',
        missingColumns:
          'Faltan columnas obligatorias de NASA FIRMS: latitude, longitude y acq_date son requeridas.',
        invalidDates: 'No se detectaron fechas de adquisición válidas (YYYY-MM-DD) en los registros.',
        invalidCoords: 'Coordenadas geográficas fuera de rango válido (lat [-90, 90], lon [-180, 180]).',
        parseError: 'No fue posible parsear la estructura CSV. Comprueba delimitadores y encabezados.',
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

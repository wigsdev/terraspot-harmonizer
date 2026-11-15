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
  map: {
    title: string;
    subtitle: string;
    layerSelectAria: string;
    layers: {
      darkMatter: string;
      modisTrueColor: string;
      viirsTrueColor: string;
      fireCells: string;
    };
    drawAoiButton: string;
    drawingActive: string;
    resetAoiButton: string;
    fitBoundsButton: string;
    coordinatesHeading: string;
    minLat: string;
    maxLat: string;
    minLon: string;
    maxLon: string;
    invalidCoordsError: string;
    cellPopup: {
      title: string;
      coordinates: string;
      totalAfcd: string;
      peakMonth: string;
      meanFrp: string;
      p90Frp: string;
      nightFraction: string;
      regime: string;
    };
    noCellsDetected: string;
    gibsReferenceDateLabel: string;
  };
  matrix: {
    title: string;
    subtitle: string;
    modes: {
      harmonized: string;
      harmonizedTooltip: string;
      anomaly: string;
      anomalyTooltip: string;
      frp: string;
      frpTooltip: string;
      raw: string;
      rawTooltip: string;
    };
    eras: {
      modisSolo: string;
      dualFusion: string;
      viirsContinuity: string;
    };
    marginalLabels: {
      annualSum: string;
      monthlyMedian: string;
      scrollHint: string;
    };
    legend: {
      low: string;
      high: string;
      negativeDeparture: string;
      baselineMedian: string;
      positiveDeparture: string;
      futureMonth: string;
      criticalAnomalyBadge: string;
    };
    stepJumpNotice: string;
    futureMonthBadge: string;
    tooltip: {
      yearMonth: string;
      sensorEra: string;
      harmonizedCount: string;
      rawModis: string;
      rawViirs: string;
      baselineMedian: string;
      departure: string;
      robustZ: string;
      meanFrp: string;
      nightFraction: string;
      status: string;
      regime: string;
    };
    aria: {
      gridLabel: string;
      cellSelected: string;
      viewModeGroup: string;
    };
  };
  climatology: {
    title: string;
    subtitle: string;
    yearSelectAria: string;
    activeYearLabel: string;
    baselineMedian: string;
    iqrEnvelope: string;
    p90Threshold: string;
    anomalyTrajectory: string;
    selectYearPlaceholder: string;
    tooltip: {
      month: string;
      observed: string;
      baseline: string;
      iqr: string;
      departure: string;
      zScore: string;
      alert: string;
      futurePending: string;
    };
    alerts: {
      normal: string;
      elevated: string;
      critical: string;
      pending: string;
    };
  };
  sensorAudit: {
    title: string;
    subtitle: string;
    layerGroupAria: string;
    layers: {
      rawModis: string;
      rawViirs: string;
      afcd: string;
      harmonized: string;
    };
    stepJumpCallout: {
      badge: string;
      title: string;
      description: string;
    };
    scorecards: {
      title: string;
      r2: string;
      r2Desc: string;
      pearson: string;
      pearsonDesc: string;
      mape: string;
      mapeDesc: string;
      rmse: string;
      rmseDesc: string;
    };
    betaFactors: {
      title: string;
      subtitle: string;
      factorLabel: string;
      overlapYears: string;
    };
    tooltip: {
      period: string;
      rawModis: string;
      rawViirs: string;
      afcd: string;
      harmonized: string;
      era: string;
    };
  };
  fireRegime: {
    title: string;
    subtitle: string;
    quadrants: {
      agricultural: string;
      agriculturalSub: string;
      transitional: string;
      transitionalSub: string;
      severeWildfire: string;
      severeWildfireSub: string;
    };
    axes: {
      xAxis: string;
      yAxis: string;
    };
    legend: {
      agricultural: string;
      transitional: string;
      severeWildfire: string;
      activeYearHighlight: string;
    };
    distribution: {
      title: string;
      agriculturalLabel: string;
      transitionalLabel: string;
      severeWildfireLabel: string;
      dominantRegime: string;
      meanIndex: string;
      totalMonths: string;
    };
    mitigation: {
      title: string;
      subtitle: string;
      activePosture: string;
      postures: {
        ADVISORY: string;
        WARNING: string;
        EMERGENCY: string;
      };
      agencyCivilDefense: string;
      agencyParkRangers: string;
      agencyAgricultural: string;
    };
    tooltip: {
      period: string;
      regime: string;
      meanFrp: string;
      p90Frp: string;
      nightFraction: string;
      hotspots: string;
      regimeIndex: string;
    };
    zeroFireNotice: string;
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

/**
 * Global Region Cube, Benchmark Catalog & Accessible Palette Context.
 * Provides instant bundled defaults (< 1 ms) and hydrates the full 322-month catalog in browser sessions.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  FireRegimeClass,
  HarmonizedMonthlyRecord,
  PaletteType,
  RegionCube,
  RegionsCatalogDocument,
  ValidationMetrics,
} from '../types';

export interface RegionSummary {
  id: string;
  name: string;
  country: string;
  typical_fire_regime: string;
}

export interface RegionContextType {
  selectedRegionId: string;
  currentRegion: RegionCube | null;
  regionsList: RegionSummary[];
  activePalette: PaletteType;
  catalog: RegionsCatalogDocument | null;
  isLoading: boolean;
  error: string | null;
  customCube: RegionCube | null;
  isCustomActive: boolean;
  setRegionId: (id: string) => void;
  setPalette: (palette: PaletteType) => void;
  reloadCatalog: () => Promise<void>;
  setCustomCube: (cube: RegionCube) => void;
  clearCustomCube: () => void;
}

interface FallbackSeed {
  id: string;
  name: string;
  country: string;
  bbox: RegionCube['bbox'];
  center: [number, number];
  default_zoom: number;
  description: string;
  typical_fire_regime: string;
  peak_season_months: number[];
  validation_metrics: ValidationMetrics;
  nonPeakMonth: number;
  nonPeakAfcd: number;
  nonPeakFrp: number;
  nonPeakNight: number;
  peakMonth: number;
  peakAfcd: number;
  peakFrp: number;
  peakNight: number;
  latest: {
    afcd: number;
    median: number;
    p25: number;
    p75: number;
    p90: number;
    departure: number;
    z: number;
    frp: number;
    p90Frp: number;
    night: number;
    regimeIdx: number;
    regimeClass: FireRegimeClass;
  };
}

function buildFallbackRegion(seed: FallbackSeed): RegionCube {
  const mkRec = (
    year: number,
    month: number,
    hotspots: number,
    frp: number,
    night: number,
    regimeClass: FireRegimeClass,
  ): HarmonizedMonthlyRecord => ({
    year,
    month,
    sensor_era: year >= 2026 ? 'VIIRS_CONTINUITY' : 'DUAL_SENSOR_FUSION',
    raw_modis_count: hotspots,
    raw_viirs_count: hotspots * 2,
    afcd_modis: hotspots,
    afcd_viirs: hotspots,
    beta_factor: 1.8,
    harmonized_hotspots: hotspots,
    climatological_median: seed.latest.median,
    p25_hotspots: seed.latest.p25,
    p75_hotspots: seed.latest.p75,
    p90_threshold: seed.latest.p90,
    departure_percentage: 0,
    robust_z_score: 0,
    mean_frp_mw: frp,
    p90_frp_mw: frp * 1.5,
    night_fraction: night,
    fire_regime_index: 40,
    regime_class: regimeClass,
  });

  const latestRecord: HarmonizedMonthlyRecord = {
    year: 2026,
    month: 10,
    sensor_era: 'VIIRS_CONTINUITY',
    raw_modis_count: seed.latest.afcd,
    raw_viirs_count: seed.latest.afcd * 4,
    afcd_modis: seed.latest.afcd,
    afcd_viirs: seed.latest.afcd,
    beta_factor: 1.8,
    harmonized_hotspots: seed.latest.afcd,
    climatological_median: seed.latest.median,
    p25_hotspots: seed.latest.p25,
    p75_hotspots: seed.latest.p75,
    p90_threshold: seed.latest.p90,
    departure_percentage: seed.latest.departure,
    robust_z_score: seed.latest.z,
    mean_frp_mw: seed.latest.frp,
    p90_frp_mw: seed.latest.p90Frp,
    night_fraction: seed.latest.night,
    fire_regime_index: seed.latest.regimeIdx,
    regime_class: seed.latest.regimeClass,
  };

  return {
    id: seed.id,
    name: seed.name,
    country: seed.country,
    bbox: seed.bbox,
    center: seed.center,
    default_zoom: seed.default_zoom,
    description: seed.description,
    typical_fire_regime: seed.typical_fire_regime,
    peak_season_months: seed.peak_season_months,
    seasonal_beta: { '1': 1.7, '7': 1.9, '8': 2.0, '9': 1.95, '10': 1.8 },
    validation_metrics: seed.validation_metrics,
    climatology_by_month: {
      '10': {
        median: seed.latest.median,
        p25: seed.latest.p25,
        p75: seed.latest.p75,
        iqr: seed.latest.p75 - seed.latest.p25,
        p90: seed.latest.p90,
      },
    },
    monthly_records: [
      mkRec(
        2001,
        seed.nonPeakMonth,
        seed.nonPeakAfcd,
        seed.nonPeakFrp,
        seed.nonPeakNight,
        'AGRICULTURAL_BURN',
      ),
      mkRec(
        2015,
        seed.peakMonth,
        seed.peakAfcd,
        seed.peakFrp,
        seed.peakNight,
        seed.latest.regimeClass,
      ),
      latestRecord,
    ],
  };
}

export const DEFAULT_REGIONS_CATALOG: RegionsCatalogDocument = {
  generated_at: '2026-11-14T00:00:00Z',
  methodology_version: 'TerraSpot-4Stage-v1.0',
  grid_resolution_deg: 0.01,
  temporal_coverage: {
    start: '2000-01',
    end: '2026-10',
    total_months: 322,
    climatology_baseline: [2001, 2025],
    overlap_window: [2012, 2025],
  },
  regions: [
    buildFallbackRegion({
      id: 'PE-HCO',
      name: 'Huánuco & Central Peruvian Andes',
      country: 'Peru',
      bbox: { min_lat: -10.6, max_lat: -8.4, min_lon: -77.1, max_lon: -74.4 },
      center: [-9.5, -75.75],
      default_zoom: 7,
      description:
        'Inter-Andean agricultural valleys, high-altitude grassland punas, and montane cloud forests (Yungas/Rupa-Rupa) in central Peru.',
      typical_fire_regime:
        'Seasonal agricultural clearing (roza y quema) & high-altitude Andean grassland (pajonal) fires escaping during El Niño drought episodes',
      peak_season_months: [7, 8, 9, 10],
      validation_metrics: {
        r_squared: 0.9758,
        pearson_r: 0.988,
        raw_mape_pct: 83.4,
        harmonized_mape_pct: 12.04,
        mape_reduction_pct: 85.56,
      },
      nonPeakMonth: 1,
      nonPeakAfcd: 6810,
      nonPeakFrp: 19.55,
      nonPeakNight: 0.0694,
      peakMonth: 7,
      peakAfcd: 22602,
      peakFrp: 19.55,
      peakNight: 0.0694,
      latest: {
        afcd: 129,
        median: 140.0,
        p25: 106.0,
        p75: 151.0,
        p90: 195.4,
        departure: -7.86,
        z: -0.33,
        frp: 25.36,
        p90Frp: 46.91,
        night: 0.0854,
        regimeIdx: 44.94,
        regimeClass: 'TRANSITIONAL',
      },
    }),
    buildFallbackRegion({
      id: 'SAM-MAP',
      name: 'Southern Amazon Basin (MAP Frontier)',
      country: 'Peru / Brazil / Bolivia',
      bbox: { min_lat: -13.5, max_lat: -8.5, min_lon: -71.5, max_lon: -60.0 },
      center: [-11.0, -65.75],
      default_zoom: 6,
      description:
        'Madre de Dios (Peru), Acre, and Rondônia (Brazil) tri-border deforestation and tropical forest-frontier hotspot corridor.',
      typical_fire_regime:
        'Tropical deforestation slash-and-burn & drought-driven understory forest wildfires',
      peak_season_months: [8, 9, 10],
      validation_metrics: {
        r_squared: 0.9819,
        pearson_r: 0.9909,
        raw_mape_pct: 82.13,
        harmonized_mape_pct: 10.8,
        mape_reduction_pct: 86.85,
      },
      nonPeakMonth: 1,
      nonPeakAfcd: 51372,
      nonPeakFrp: 18.97,
      nonPeakNight: 0.0702,
      peakMonth: 8,
      peakAfcd: 129339,
      peakFrp: 18.96,
      peakNight: 0.0703,
      latest: {
        afcd: 632,
        median: 949.0,
        p25: 836.0,
        p75: 1078.0,
        p90: 1823.8,
        departure: -33.4,
        z: -1.767,
        frp: 32.04,
        p90Frp: 51.65,
        night: 0.1311,
        regimeIdx: 53.72,
        regimeClass: 'TRANSITIONAL',
      },
    }),
    buildFallbackRegion({
      id: 'AR-PAR',
      name: 'Paraná River Delta & Gran Chaco',
      country: 'Argentina / Paraguay',
      bbox: { min_lat: -34.2, max_lat: -25.5, min_lon: -62.0, max_lon: -57.2 },
      center: [-29.85, -59.6],
      default_zoom: 6,
      description:
        'Riparian wetlands of the Paraná River Delta and adjacent Gran Chaco dry woodlands (CONAE & Paraguayan Space Agency regional context).',
      typical_fire_regime:
        'Wetland pasture burning & severe low-water floodplain crisis fires (2020-2022)',
      peak_season_months: [7, 8, 9, 10],
      validation_metrics: {
        r_squared: 0.9677,
        pearson_r: 0.9838,
        raw_mape_pct: 84.01,
        harmonized_mape_pct: 10.22,
        mape_reduction_pct: 87.83,
      },
      nonPeakMonth: 1,
      nonPeakAfcd: 27203,
      nonPeakFrp: 22.16,
      nonPeakNight: 0.0856,
      peakMonth: 7,
      peakAfcd: 63135,
      peakFrp: 22.16,
      peakNight: 0.0857,
      latest: {
        afcd: 435,
        median: 439.0,
        p25: 345.0,
        p75: 497.0,
        p90: 690.8,
        departure: -0.91,
        z: -0.035,
        frp: 23.35,
        p90Frp: 39.54,
        night: 0.0912,
        regimeIdx: 40.08,
        regimeClass: 'TRANSITIONAL',
      },
    }),
    buildFallbackRegion({
      id: 'US-CAL',
      name: 'California Sierra & Coastal Ranges',
      country: 'United States',
      bbox: { min_lat: 36.0, max_lat: 41.5, min_lon: -123.8, max_lon: -118.5 },
      center: [38.75, -121.15],
      default_zoom: 6,
      description:
        'Coniferous Sierra Nevada montane forests and Northern California chaparral-coastal ranges subject to extreme late-summer crown megafires.',
      typical_fire_regime:
        'High-intensity crown megafires (FRP > 80 MW) with sustained nocturnal persistence',
      peak_season_months: [7, 8, 9, 10],
      validation_metrics: {
        r_squared: 0.9705,
        pearson_r: 0.986,
        raw_mape_pct: 82.29,
        harmonized_mape_pct: 10.5,
        mape_reduction_pct: 87.24,
      },
      nonPeakMonth: 1,
      nonPeakAfcd: 15058,
      nonPeakFrp: 27.69,
      nonPeakNight: 0.1244,
      peakMonth: 7,
      peakAfcd: 56342,
      peakFrp: 27.69,
      peakNight: 0.1243,
      latest: {
        afcd: 220,
        median: 346.0,
        p25: 305.0,
        p75: 409.0,
        p90: 658.6,
        departure: -36.42,
        z: -1.634,
        frp: 38.14,
        p90Frp: 70.78,
        night: 0.1784,
        regimeIdx: 73.47,
        regimeClass: 'SEVERE_WILDFIRE',
      },
    }),
    buildFallbackRegion({
      id: 'AU-NSW',
      name: 'New South Wales Eucalyptus Forest Belt',
      country: 'Australia',
      bbox: { min_lat: -37.5, max_lat: -31.5, min_lon: 147.0, max_lon: 152.5 },
      center: [-34.5, 149.75],
      default_zoom: 6,
      description:
        'Southeastern Australian sclerophyll eucalyptus forests and Blue Mountains ranges characterized by intense austral summer bushfire seasons.',
      typical_fire_regime:
        'Austral summer eucalyptus bushfires & severe canopy megafires (2019-2020 Black Summer)',
      peak_season_months: [11, 12, 1],
      validation_metrics: {
        r_squared: 0.9701,
        pearson_r: 0.985,
        raw_mape_pct: 83.09,
        harmonized_mape_pct: 12.09,
        mape_reduction_pct: 85.45,
      },
      nonPeakMonth: 2,
      nonPeakAfcd: 35927,
      nonPeakFrp: 30.98,
      nonPeakNight: 0.1441,
      peakMonth: 11,
      peakAfcd: 50463,
      peakFrp: 30.97,
      peakNight: 0.1441,
      latest: {
        afcd: 324,
        median: 347.0,
        p25: 276.0,
        p75: 402.0,
        p90: 456.2,
        departure: -6.63,
        z: -0.246,
        frp: 31.81,
        p90Frp: 56.7,
        night: 0.1349,
        regimeIdx: 57.94,
        regimeClass: 'TRANSITIONAL',
      },
    }),
  ],
};

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export interface RegionProviderProps {
  children: React.ReactNode;
  initialRegionId?: string;
  initialPalette?: PaletteType;
  initialCatalog?: RegionsCatalogDocument | null;
  initialLoading?: boolean;
  disableAutoFetch?: boolean;
}

export const RegionProvider: React.FC<RegionProviderProps> = ({
  children,
  initialRegionId = 'PE-HCO',
  initialPalette = 'inferno',
  initialCatalog,
  initialLoading = false,
  disableAutoFetch = false,
}) => {
  const [catalog, setCatalog] = useState<RegionsCatalogDocument | null>(
    initialCatalog !== undefined ? initialCatalog : DEFAULT_REGIONS_CATALOG,
  );
  const [selectedRegionId, setSelectedRegionId] = useState<string>(initialRegionId);
  const [activePalette, setActivePalette] = useState<PaletteType>(initialPalette);
  const [isLoading, setIsLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<string | null>(null);
  const [customCube, setCustomCubeState] = useState<RegionCube | null>(null);

  const reloadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/data/regions_catalog.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as RegionsCatalogDocument;
      if (data && Array.isArray(data.regions) && data.regions.length > 0) {
        setCatalog(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load regions catalog');
      setCatalog((prev) => prev ?? DEFAULT_REGIONS_CATALOG);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (disableAutoFetch || initialCatalog !== undefined) {
      return;
    }
    const isBrowserRuntime =
      typeof window !== 'undefined' &&
      window.location?.protocol?.startsWith('http') &&
      typeof navigator !== 'undefined' &&
      !/jsdom/i.test(navigator.userAgent);

    if (isBrowserRuntime) {
      void reloadCatalog();
    }
  }, [disableAutoFetch, initialCatalog, reloadCatalog]);

  const setRegionId = useCallback((id: string) => {
    setCustomCubeState(null);
    setSelectedRegionId(id);
  }, []);

  const setPalette = useCallback((palette: PaletteType) => {
    setActivePalette(palette);
  }, []);

  const setCustomCube = useCallback((cube: RegionCube) => {
    setCustomCubeState(cube);
  }, []);

  const clearCustomCube = useCallback(() => {
    setCustomCubeState(null);
  }, []);

  const currentRegion = useMemo<RegionCube | null>(() => {
    if (customCube) {
      return customCube;
    }
    if (!catalog || catalog.regions.length === 0) {
      return null;
    }
    return catalog.regions.find((r) => r.id === selectedRegionId) ?? catalog.regions[0];
  }, [catalog, customCube, selectedRegionId]);

  const regionsList = useMemo<RegionSummary[]>(() => {
    const source = catalog?.regions ?? DEFAULT_REGIONS_CATALOG.regions;
    return source.map((r) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      typical_fire_regime: r.typical_fire_regime,
    }));
  }, [catalog]);

  const isCustomActive = Boolean(customCube);

  const value = useMemo<RegionContextType>(
    () => ({
      selectedRegionId,
      currentRegion,
      regionsList,
      activePalette,
      catalog,
      isLoading,
      error,
      customCube,
      isCustomActive,
      setRegionId,
      setPalette,
      reloadCatalog,
      setCustomCube,
      clearCustomCube,
    }),
    [
      selectedRegionId,
      currentRegion,
      regionsList,
      activePalette,
      catalog,
      isLoading,
      error,
      customCube,
      isCustomActive,
      setRegionId,
      setPalette,
      reloadCatalog,
      setCustomCube,
      clearCustomCube,
    ],
  );

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
};

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
}

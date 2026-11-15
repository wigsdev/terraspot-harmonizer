import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider, RegionProvider } from '../src/context';
import { FireRegimePanel } from '../src/components/FireRegimePanel';
import {
  classifyRegime,
  isActiveFireMonth,
  generateFireRegimeScatterData,
  computeFireRegimeDistribution,
  generateOperationalMitigation
} from '../src/engine/fireRegime';
import rawCatalog from '../public/data/regions_catalog.json';
import type { RegionCube, HarmonizedMonthlyRecord } from '../src/types';

const mockCube = rawCatalog.regions[0] as unknown as RegionCube; // PE-HCO

const renderPanel = (props = {}) =>
  render(
    <LanguageProvider>
      <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
        <FireRegimePanel activeCube={mockCube} {...props} />
      </RegionProvider>
    </LanguageProvider>
  );

describe('Fire Regime Engine Unit Tests (T-09)', () => {
  it('correctly classifies observations into the three scientific quadrants', () => {
    // Q1: Agricultural Burning (< 25 MW, < 0.10 night fraction, < 35 index)
    expect(classifyRegime(18.5, 0.05, 22.0)).toBe('AGRICULTURAL_BURN');

    // Q2: Transitional Regime (25 - 45 MW, 0.10 - 0.20 night fraction, 35 - 65 index)
    expect(classifyRegime(32.0, 0.14, 45.0)).toBe('TRANSITIONAL');
    expect(classifyRegime(26.0, 0.08, 30.0)).toBe('TRANSITIONAL'); // FRP >= 25 triggers transitional
    expect(classifyRegime(20.0, 0.12, 30.0)).toBe('TRANSITIONAL'); // night_fraction >= 0.10 triggers transitional

    // Q3: Severe Landscape Wildfire (> 45 MW, > 0.20 night fraction, >= 65 index)
    expect(classifyRegime(55.0, 0.28, 78.0)).toBe('SEVERE_WILDFIRE');
    expect(classifyRegime(48.0, 0.08, 50.0)).toBe('SEVERE_WILDFIRE'); // FRP > 45 triggers severe
    expect(classifyRegime(30.0, 0.25, 60.0)).toBe('SEVERE_WILDFIRE'); // night_fraction > 0.20 triggers severe
    expect(classifyRegime(40.0, 0.15, 68.0)).toBe('SEVERE_WILDFIRE'); // index >= 65 triggers severe
  });

  it('filters out future unobserved months in 2026 and zero-fire inactive months', () => {
    const futureRecord: HarmonizedMonthlyRecord = {
      year: 2026,
      month: 11,
      raw_modis_count: 0,
      raw_viirs_count: 0,
      afcd_modis: 0,
      afcd_viirs: 0,
      harmonized_hotspots: 0,
      climatological_median: 20,
      departure_percentage: 0,
      robust_z_score: 0,
      mean_frp_mw: 0,
      p90_frp_mw: 0,
      night_fraction: 0,
      fire_regime_index: 0,
      regime_class: 'AGRICULTURAL_BURN'
    };
    expect(isActiveFireMonth(futureRecord)).toBe(false);

    const zeroFireRecord: HarmonizedMonthlyRecord = {
      ...futureRecord,
      year: 2020,
      month: 3
    };
    expect(isActiveFireMonth(zeroFireRecord)).toBe(false);

    const activeRecord: HarmonizedMonthlyRecord = {
      ...futureRecord,
      year: 2024,
      month: 8,
      harmonized_hotspots: 215,
      mean_frp_mw: 34.2,
      night_fraction: 0.15
    };
    expect(isActiveFireMonth(activeRecord)).toBe(true);
  });

  it('partitions scatter data into agricultural, transitional, severe, and activeYearPoints', () => {
    const scatter = generateFireRegimeScatterData(mockCube.monthly_records, 2024, 'en');

    expect(scatter.agricultural.length).toBeGreaterThan(0);
    expect(scatter.transitional.length).toBeGreaterThan(0);
    expect(scatter.severeWildfire.length).toBeGreaterThan(0);

    // Active year points should match records from 2024 with fire activity
    expect(scatter.activeYearPoints.length).toBeGreaterThan(0);
    expect(scatter.activeYearPoints.every((p) => p.year === 2024 && p.isActiveYear)).toBe(true);

    // Domain maximums
    expect(scatter.maxFrp).toBeGreaterThan(0);
    expect(scatter.maxNightFraction).toBeGreaterThan(0);
  });

  it('computes historical regime distribution percentages accurately summing to 100%', () => {
    const dist = computeFireRegimeDistribution(mockCube.monthly_records);

    expect(dist.totalActiveMonths).toBeGreaterThan(0);
    expect(dist.agriculturalCount + dist.transitionalCount + dist.severeWildfireCount).toBe(
      dist.totalActiveMonths
    );

    const sumPct = Math.round(dist.agriculturalPct + dist.transitionalPct + dist.severeWildfirePct);
    expect(sumPct).toBeCloseTo(100, 0);

    expect(dist.meanRegimeIndex).toBeGreaterThan(0);
    expect(['AGRICULTURAL_BURN', 'TRANSITIONAL', 'SEVERE_WILDFIRE']).toContain(dist.dominantRegime);
  });

  it('handles empty records in computeFireRegimeDistribution gracefully', () => {
    const dist = computeFireRegimeDistribution([]);
    expect(dist.totalActiveMonths).toBe(0);
    expect(dist.agriculturalPct).toBe(0);
    expect(dist.transitionalPct).toBe(0);
    expect(dist.severeWildfirePct).toBe(0);
    expect(dist.dominantRegime).toBe('AGRICULTURAL_BURN');
    expect(dist.meanRegimeIndex).toBe(0);
  });

  it('generates multi-agency operational mitigation packages in English and Spanish', () => {
    const adviceEn = generateOperationalMitigation(mockCube.monthly_records, 2024, 'en');
    expect(['ADVISORY', 'WARNING', 'EMERGENCY']).toContain(adviceEn.postureLevel);
    expect(adviceEn.agencies.length).toBe(3);

    const agencyIds = adviceEn.agencies.map((a) => a.agencyId);
    expect(agencyIds).toContain('civil_defense');
    expect(agencyIds).toContain('park_rangers');
    expect(agencyIds).toContain('agricultural');

    expect(adviceEn.agencies[0].actionItems.length).toBe(3);

    const adviceEs = generateOperationalMitigation(mockCube.monthly_records, 2024, 'es');
    expect(adviceEs.agencies[0].agencyName).toContain('Defensa Civil');
    expect(adviceEs.agencies[1].agencyName).toContain('Guardaparques');
    expect(adviceEs.agencies[2].agencyName).toContain('Autoridades Agrarias');
  });
});

describe('FireRegimePanel UI Component (T-09 User Stories 1, 2, 3)', () => {
  it('renders the complete panel with header, badge, and region code', () => {
    renderPanel();

    const panel = screen.getByTestId('fire-regime-panel');
    expect(panel).toBeInTheDocument();

    expect(screen.getByText(/NASA Challenge 15 • Req R6/i)).toBeInTheDocument();
    expect(screen.getByText(/PE-HCO — Huánuco/i)).toBeInTheDocument();
    expect(screen.getByTestId('alert-posture-badge')).toBeInTheDocument();
  });

  it('renders historical frequency distribution summary cards (User Story 2)', () => {
    renderPanel();

    expect(screen.getByTestId('distribution-card-agricultural')).toBeInTheDocument();
    expect(screen.getByTestId('distribution-card-transitional')).toBeInTheDocument();
    expect(screen.getByTestId('distribution-card-severe')).toBeInTheDocument();
  });

  it('renders 2D Recharts scatter plot container and custom legend items (User Story 1)', () => {
    renderPanel();

    expect(screen.getByTestId('scatter-chart-container')).toBeInTheDocument();
    expect(screen.getByTestId('legend-agricultural')).toBeInTheDocument();
    expect(screen.getByTestId('legend-transitional')).toBeInTheDocument();
    expect(screen.getByTestId('legend-severe')).toBeInTheDocument();
    expect(screen.getByTestId('legend-active-year')).toBeInTheDocument();
  });

  it('renders tactical mitigation advisory cards for all 3 agencies (User Story 3)', () => {
    renderPanel();

    expect(screen.getByTestId('agency-card-civil_defense')).toBeInTheDocument();
    expect(screen.getByTestId('agency-card-park_rangers')).toBeInTheDocument();
    expect(screen.getByTestId('agency-card-agricultural')).toBeInTheDocument();
  });

  it('renders fallback loading state when activeCube is undefined or null', () => {
    render(
      <LanguageProvider>
        <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
          <FireRegimePanel activeCube={null} />
        </RegionProvider>
      </LanguageProvider>
    );

    expect(screen.getByTestId('fire-regime-panel-loading')).toBeInTheDocument();
    expect(screen.getByText(/Loading Fire Regime Diagnostics/i)).toBeInTheDocument();
  });
});

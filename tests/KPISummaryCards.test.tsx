import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DEFAULT_REGIONS_CATALOG, LanguageProvider, RegionProvider } from '../src/context';
import { Navbar } from '../src/components/Navbar';
import { KPISummaryCards } from '../src/components/KPISummaryCards';
import type { RegionCube } from '../src/types';

const renderWithProviders = (initialRegionId = 'PE-HCO') =>
  render(
    <LanguageProvider>
      <RegionProvider initialRegionId={initialRegionId} disableAutoFetch>
        <Navbar />
        <KPISummaryCards />
      </RegionProvider>
    </LanguageProvider>,
  );

describe('KPISummaryCards Component (US2 & US3)', () => {
  it('renders all 4 KPI cards with exact harmonized metrics for default PE-HCO region', () => {
    renderWithProviders('PE-HCO');

    const afcdCard = screen.getByTestId('kpi-card-afcd');
    expect(afcdCard).toHaveTextContent('Harmonized Fire Activity (2000–2026)');
    expect(afcdCard).toHaveTextContent('29,541');
    expect(afcdCard).toHaveTextContent('AFCD');
    expect(afcdCard).toHaveTextContent('R² = 0.98');

    const peakCard = screen.getByTestId('kpi-card-peak');
    expect(peakCard).toHaveTextContent('Peak Burning Season');
    expect(peakCard).toHaveTextContent('Jul – Oct');
    expect(peakCard).toHaveTextContent('76.9%');

    const anomalyCard = screen.getByTestId('kpi-card-anomaly');
    expect(anomalyCard).toHaveTextContent('Season Anomaly Alert');
    expect(anomalyCard).toHaveTextContent('2026-10');
    expect(anomalyCard).toHaveTextContent('-7.9%');
    expect(anomalyCard).toHaveTextContent('Z = -0.33');
    expect(screen.getByTestId('kpi-anomaly-badge')).toHaveTextContent('NORMAL BASELINE');

    const regimeCard = screen.getByTestId('kpi-card-regime');
    expect(regimeCard).toHaveTextContent('Dominant Fire Regime');
    expect(screen.getByTestId('kpi-regime-badge')).toHaveTextContent('Seasonal Agricultural Burn');
    expect(regimeCard).toHaveTextContent('21.5 MW');
    expect(regimeCard).toHaveTextContent('7.5%');
  });

  it('recalculates all 4 KPI cards reactively when switching to US-CAL and AU-NSW', () => {
    renderWithProviders('PE-HCO');
    const select = screen.getByTestId('region-select');

    fireEvent.change(select, { target: { value: 'US-CAL' } });
    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('71,620');
    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('R² = 0.97');
    expect(screen.getByTestId('kpi-card-peak')).toHaveTextContent('Jul – Oct');
    expect(screen.getByTestId('kpi-card-peak')).toHaveTextContent('79.0%');
    expect(screen.getByTestId('kpi-regime-badge')).toHaveTextContent('Severe Landscape Wildfire');
    expect(screen.getByTestId('kpi-card-regime')).toHaveTextContent('31.2 MW');
    expect(screen.getByTestId('kpi-card-regime')).toHaveTextContent('14.2%');

    fireEvent.change(select, { target: { value: 'AU-NSW' } });
    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('86,714');
    expect(screen.getByTestId('kpi-card-peak')).toHaveTextContent('Nov – Jan');
    expect(screen.getByTestId('kpi-card-peak')).toHaveTextContent('58.2%');
  });

  it('renders CRITICAL and ELEVATED alert badges and handles zero night fires without NaN', () => {
    const baseCube = DEFAULT_REGIONS_CATALOG.regions[0];
    const syntheticCriticalCube: RegionCube = {
      ...baseCube,
      typical_fire_regime: 'TRANSITIONAL',
      monthly_records: [
        {
          ...baseCube.monthly_records[baseCube.monthly_records.length - 1],
          year: 2026,
          month: 10,
          harmonized_hotspots: 850,
          departure_percentage: 245.5,
          robust_z_score: 3.42,
          night_fraction: 0,
          anomaly_status: 'CRITICAL',
          regime_class: 'TRANSITIONAL',
        },
      ],
    };

    const { rerender } = render(
      <LanguageProvider>
        <RegionProvider disableAutoFetch>
          <KPISummaryCards overrideRegion={syntheticCriticalCube} />
        </RegionProvider>
      </LanguageProvider>,
    );

    expect(screen.getByTestId('kpi-anomaly-badge')).toHaveTextContent('CRITICAL ALERT');
    expect(screen.getByTestId('kpi-card-anomaly')).toHaveTextContent('+245.5%');
    expect(screen.getByTestId('kpi-card-anomaly')).toHaveTextContent('Z = +3.42');
    expect(screen.getByTestId('kpi-card-regime')).toHaveTextContent('0.0%');
    expect(screen.getByTestId('kpi-regime-badge')).toHaveTextContent('Mixed / Transitional Regime');

    const syntheticElevatedCube: RegionCube = {
      ...syntheticCriticalCube,
      monthly_records: [
        {
          ...syntheticCriticalCube.monthly_records[0],
          departure_percentage: 42.1,
          robust_z_score: 1.45,
          anomaly_status: 'ELEVATED',
        },
      ],
    };

    rerender(
      <LanguageProvider>
        <RegionProvider disableAutoFetch>
          <KPISummaryCards overrideRegion={syntheticElevatedCube} />
        </RegionProvider>
      </LanguageProvider>,
    );

    expect(screen.getByTestId('kpi-anomaly-badge')).toHaveTextContent('ELEVATED ANOMALY');
  });

  it('displays skeleton placeholders while loading and zeroed safe defaults when cube is null', () => {
    const { rerender } = render(
      <LanguageProvider>
        <RegionProvider disableAutoFetch>
          <KPISummaryCards isLoadingOverride />
        </RegionProvider>
      </LanguageProvider>,
    );

    expect(screen.getAllByTestId('kpi-skeleton')).toHaveLength(4);

    rerender(
      <LanguageProvider>
        <RegionProvider disableAutoFetch>
          <KPISummaryCards overrideRegion={null} isLoadingOverride={false} />
        </RegionProvider>
      </LanguageProvider>,
    );

    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('0');
    expect(screen.getByTestId('kpi-card-peak')).toHaveTextContent('—');
    expect(screen.getByTestId('kpi-card-anomaly')).toHaveTextContent('0.0%');
  });

  it('translates KPI card headings, badges, and formats numbers according to locale on EN/ES toggle', () => {
    renderWithProviders('PE-HCO');
    const langToggle = screen.getByTestId('language-toggle');

    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('29,541');
    fireEvent.click(langToggle);

    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent(
      'Actividad de Fuego Armonizada (2000–2026)',
    );
    const esExpected = new Intl.NumberFormat('es-ES').format(29541);
    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent(esExpected);
    expect(screen.getByTestId('kpi-card-peak')).toHaveTextContent('Temporada Alta de Quemas');
    expect(screen.getByTestId('kpi-anomaly-badge')).toHaveTextContent('BASE NORMAL');
    expect(screen.getByTestId('kpi-regime-badge')).toHaveTextContent('Quema Agrícola Estacional');
  });
});

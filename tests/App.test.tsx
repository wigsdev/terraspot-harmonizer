import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('App Integration (T-05 Mission Navigation, KPIs & T-06 WebGIS Map)', () => {
  it('renders TerraSpot Harmonizer header, Challenge 15 badge, and default Huánuco AOI', () => {
    render(<App />);
    expect(screen.getByText('TerraSpot Harmonizer')).toBeInTheDocument();
    expect(screen.getByText('Challenge 15')).toBeInTheDocument();
    expect(screen.getByTestId('active-aoi-name')).toHaveTextContent(
      'Huánuco & Central Peruvian Andes',
    );
    expect(screen.getByTestId('active-aoi-bbox')).toHaveTextContent(
      '[-10.60, -77.10] to [-8.40, -74.40]',
    );
    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('29,541');
  });

  it('synchronizes region selection and bilingual EN/ES toggling across Navbar, KPI cards, and Map', () => {
    render(<App />);

    const regionSelect = screen.getByTestId('region-select');
    fireEvent.change(regionSelect, { target: { value: 'US-CAL' } });

    expect(screen.getByTestId('active-aoi-name')).toHaveTextContent(
      'California Sierra & Coastal Ranges',
    );
    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('71,620');

    const langToggle = screen.getByTestId('language-toggle');
    fireEvent.click(langToggle);

    expect(screen.getByTestId('active-aoi-name')).toHaveTextContent(
      'Sierra de California y Cordilleras Costeras',
    );
    expect(screen.getByTestId('active-aoi-bbox')).toHaveTextContent(
      '[36.00, -123.80] a [41.50, -118.50]',
    );
    expect(screen.getByTestId('kpi-regime-badge')).toHaveTextContent('Incendio Forestal Severo');
  });

  it('renders MapAOISelector and synchronizes quick region selection with app state', () => {
    render(<App />);

    // WebGIS container exists
    expect(screen.getByTestId('map-aoi-selector')).toBeInTheDocument();
    expect(screen.getByTestId('map-container')).toBeInTheDocument();

    // Verify initial Huánuco coordinates in inputs
    expect(screen.getByTestId('input-min-lat')).toHaveValue(-10.6);

    // Select Australia NSW from quick region pills
    const nswButton = screen.getByTestId('quick-region-AU-NSW');
    fireEvent.click(nswButton);

    // Verify state propagated to Active AOI Strip and KPI cards
    expect(screen.getByTestId('active-aoi-name')).toHaveTextContent(
      'New South Wales Eucalyptus Forest Belt',
    );
    expect(screen.getByTestId('kpi-card-afcd')).toHaveTextContent('86,714');
    expect(screen.getByTestId('input-min-lat')).toHaveValue(-37.5);
  });

  it('renders BurningCalendarMatrix and reacts to analytical projection mode switching', () => {
    render(<App />);

    // BurningCalendarMatrix container exists
    expect(screen.getByTestId('burning-calendar-matrix')).toBeInTheDocument();
    expect(screen.getByTestId('year-label-2000')).toBeInTheDocument();
    expect(screen.getByTestId('year-label-2026')).toBeInTheDocument();

    // Mode toolbar toggles projection
    const anomalyBtn = screen.getByTestId('mode-btn-anomaly');
    fireEvent.click(anomalyBtn);
    expect(anomalyBtn).toHaveAttribute('data-active', 'true');
  });

  it('renders ClimatologyAnomalyChart and SensorHarmonizationAudit with bidirectional synchronization', () => {
    render(<App />);

    // Verify ClimatologyAnomalyChart mounted
    expect(screen.getByTestId('climatology-anomaly-chart')).toBeInTheDocument();
    const yearSelect = screen.getByTestId('climatology-year-select') as HTMLSelectElement;
    expect(yearSelect.value).toBe('2024');

    // Verify SensorHarmonizationAudit mounted with step-jump and scorecards
    expect(screen.getByTestId('sensor-harmonization-audit')).toBeInTheDocument();
    expect(screen.getByTestId('step-jump-callout')).toBeInTheDocument();
    expect(screen.getByTestId('model-fit-scorecards')).toBeInTheDocument();
    expect(screen.getByTestId('beta-factors-breakdown')).toBeInTheDocument();

    // Select a cell in BurningCalendarMatrix for year 2020
    const cell2020Aug = screen.getByTestId('cell-2020-8');
    fireEvent.click(cell2020Aug);

    // Verify Climatology year updated to 2020 via bidirectional synchronization
    expect((screen.getByTestId('climatology-year-select') as HTMLSelectElement).value).toBe('2020');
  });
});

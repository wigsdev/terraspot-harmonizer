import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, RegionProvider } from '../src/context';
import { ClimatologyAnomalyChart } from '../src/components/ClimatologyAnomalyChart';
import rawCatalog from '../public/data/regions_catalog.json';
import type { RegionCube } from '../src/types';

const mockCube = rawCatalog.regions[0] as unknown as RegionCube; // PE-HCO

const renderChart = (props = {}) =>
  render(
    <LanguageProvider>
      <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
        <ClimatologyAnomalyChart activeCube={mockCube} {...props} />
      </RegionProvider>
    </LanguageProvider>,
  );

describe('ClimatologyAnomalyChart Component (T-08 User Story 1 - P1 MVP)', () => {
  it('renders the chart container, title, subtitle, and legend keys', () => {
    renderChart();

    const container = screen.getByTestId('climatology-anomaly-chart');
    expect(container).toBeInTheDocument();

    expect(screen.getByText(/Climatological Seasonal Curves/i)).toBeInTheDocument();
    expect(screen.getByTestId('climatology-year-select')).toBeInTheDocument();

    // Verify legend keys
    expect(screen.getByTestId('legend-baseline-median')).toBeInTheDocument();
    expect(screen.getByTestId('legend-iqr-envelope')).toBeInTheDocument();
    expect(screen.getByTestId('legend-p90-threshold')).toBeInTheDocument();
    expect(screen.getByTestId('legend-active-trajectory')).toBeInTheDocument();
  });

  it('renders year dropdown with default year and allows switching to another year', () => {
    const handleYearChange = vi.fn();
    renderChart({ selectedYear: 2024, onYearChange: handleYearChange });

    const select = screen.getByTestId('climatology-year-select') as HTMLSelectElement;
    expect(select.value).toBe('2024');

    // Switch to 2020
    fireEvent.change(select, { target: { value: '2020' } });
    expect(handleYearChange).toHaveBeenCalledWith(2020);
  });

  it('renders dropdown options from 2000 to 2026', () => {
    renderChart();

    const select = screen.getByTestId('climatology-year-select');
    const options = select.querySelectorAll('option');
    expect(options.length).toBe(27);
    expect(options[0].value).toBe('2026');
    expect(options[options.length - 1].value).toBe('2000');
  });

  it('handles future incomplete months for year 2026 safely without crashing', () => {
    renderChart({ selectedYear: 2026 });

    const container = screen.getByTestId('climatology-anomaly-chart');
    expect(container).toBeInTheDocument();
    const select = screen.getByTestId('climatology-year-select') as HTMLSelectElement;
    expect(select.value).toBe('2026');
  });

  it('renders gracefully when activeCube is null or undefined', () => {
    render(
      <LanguageProvider>
        <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
          <ClimatologyAnomalyChart activeCube={null} />
        </RegionProvider>
      </LanguageProvider>,
    );

    expect(screen.getByTestId('climatology-anomaly-chart')).toBeInTheDocument();
  });
});

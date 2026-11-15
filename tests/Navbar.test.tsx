import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, RegionProvider, useRegion } from '../src/context';
import { Navbar } from '../src/components/Navbar';

const StateProbe: React.FC = () => {
  const { selectedRegionId, activePalette, setCustomCube } = useRegion();
  return (
    <div data-testid="state-probe">
      <span data-testid="probe-region">{selectedRegionId}</span>
      <span data-testid="probe-palette">{activePalette}</span>
      <button
        type="button"
        data-testid="probe-set-custom"
        onClick={() =>
          setCustomCube({
            id: 'CUSTOM-PROBE',
            name: 'Custom Test Cube',
            country: 'Testland',
            bbox: { min_lat: -10, max_lat: -9, min_lon: -76, max_lon: -75 },
            center: [-9.5, -75.5],
            default_zoom: 9,
            description: 'Probe',
            typical_fire_regime: 'Test',
            peak_season_months: [8],
            seasonal_beta: { '8': 1.8 },
            validation_metrics: {
              r_squared: 0.9,
              pearson_r: 0.95,
              raw_mape_pct: 40,
              harmonized_mape_pct: 15,
              mape_reduction_pct: 62.5,
            },
            climatology_by_month: {},
            monthly_records: [],
          })
        }
      >
        Set Custom
      </button>
    </div>
  );
};

const renderNavbar = (onOpenUploadModal?: () => void) =>
  render(
    <LanguageProvider>
      <RegionProvider disableAutoFetch>
        <Navbar onOpenUploadModal={onOpenUploadModal} />
        <StateProbe />
      </RegionProvider>
    </LanguageProvider>,
  );

describe('Navbar Component (US1 & US3)', () => {
  it('renders brand mark, NASA Challenge 15 badge, version tag, and sensor baseline indicator', () => {
    renderNavbar();
    expect(screen.getByText('TerraSpot Harmonizer')).toBeInTheDocument();
    expect(screen.getByText('Challenge 15')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('MODIS (2000–2026) + VIIRS (2012–2026)')).toBeInTheDocument();
  });

  it('renders Upload FIRMS CSV button and invokes onOpenUploadModal when clicked', () => {
    const handleOpen = vi.fn();
    renderNavbar(handleOpen);
    const uploadBtn = screen.getByTestId('upload-firms-button');
    expect(uploadBtn).toBeInTheDocument();
    fireEvent.click(uploadBtn);
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });

  it('renders Export CSV button with telemetry tooltip', () => {
    renderNavbar();
    const exportBtn = screen.getByTestId('export-csv-button');
    expect(exportBtn).toBeInTheDocument();
    expect(exportBtn).toHaveAttribute(
      'title',
      'Download standardized 27-column RFC 4180 CSV dataset',
    );
  });

  it('displays persistent Custom Data badge and reset button when custom cube is active', () => {
    renderNavbar();
    expect(screen.queryByTestId('custom-data-badge')).not.toBeInTheDocument();

    const setCustomBtn = screen.getByTestId('probe-set-custom');
    fireEvent.click(setCustomBtn);

    expect(screen.getByTestId('custom-data-badge')).toBeInTheDocument();
    expect(screen.getByText(/Custom Data Active/i)).toBeInTheDocument();

    const resetBtn = screen.getByTestId('reset-benchmark-button');
    fireEvent.click(resetBtn);

    expect(screen.queryByTestId('custom-data-badge')).not.toBeInTheDocument();
  });

  it('populates all 5 benchmark regions and updates RegionContext upon selection', () => {
    renderNavbar();
    const select = screen.getByTestId('region-select') as HTMLSelectElement;
    const optionValues = Array.from(select.options).map((o) => o.value);
    expect(optionValues).toEqual(['PE-HCO', 'SAM-MAP', 'AR-PAR', 'US-CAL', 'AU-NSW']);
    expect(select.value).toBe('PE-HCO');

    fireEvent.change(select, { target: { value: 'US-CAL' } });
    expect(screen.getByTestId('probe-region')).toHaveTextContent('US-CAL');

    fireEvent.change(select, { target: { value: 'SAM-MAP' } });
    expect(screen.getByTestId('probe-region')).toHaveTextContent('SAM-MAP');
  });

  it('populates all 4 colorblind-safe palettes and updates active palette on selection', () => {
    renderNavbar();
    const paletteSelect = screen.getByTestId('palette-select') as HTMLSelectElement;
    const paletteValues = Array.from(paletteSelect.options).map((o) => o.value);
    expect(paletteValues).toEqual(['inferno', 'viridis', 'cividis', 'diverging']);
    expect(paletteSelect.value).toBe('inferno');

    fireEvent.change(paletteSelect, { target: { value: 'viridis' } });
    expect(screen.getByTestId('probe-palette')).toHaveTextContent('viridis');

    fireEvent.change(paletteSelect, { target: { value: 'diverging' } });
    expect(screen.getByTestId('probe-palette')).toHaveTextContent('diverging');
  });

  it('toggles reactively between English (EN) and Spanish (ES) preserving active region and palette', () => {
    renderNavbar();
    const regionSelect = screen.getByTestId('region-select');
    const paletteSelect = screen.getByTestId('palette-select');
    const langButton = screen.getByTestId('language-toggle');

    fireEvent.change(regionSelect, { target: { value: 'US-CAL' } });
    fireEvent.change(paletteSelect, { target: { value: 'cividis' } });

    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText(/California Sierra & Coastal Ranges/)).toBeInTheDocument();

    fireEvent.click(langButton);

    expect(screen.getByText('Exportar CSV')).toBeInTheDocument();
    expect(screen.getByText(/Sierra de California y Cordilleras Costeras/)).toBeInTheDocument();
    expect(screen.getByLabelText('Seleccionar Región de Referencia')).toBeInTheDocument();
    expect(screen.getByTestId('probe-region')).toHaveTextContent('US-CAL');
    expect(screen.getByTestId('probe-palette')).toHaveTextContent('cividis');

    fireEvent.click(langButton);
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });
});

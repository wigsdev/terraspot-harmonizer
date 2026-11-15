import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, RegionProvider, useRegion } from '../src/context';
import { Navbar } from '../src/components/Navbar';

const StateProbe: React.FC = () => {
  const { selectedRegionId, activePalette } = useRegion();
  return (
    <div data-testid="state-probe">
      <span data-testid="probe-region">{selectedRegionId}</span>
      <span data-testid="probe-palette">{activePalette}</span>
    </div>
  );
};

const renderNavbar = () =>
  render(
    <LanguageProvider>
      <RegionProvider disableAutoFetch>
        <Navbar />
        <StateProbe />
      </RegionProvider>
    </LanguageProvider>,
  );

describe('Navbar Component (US1 & US3)', () => {
  it('renders brand mark, NASA Challenge 15 badge, version tag, and sensor baseline indicator', () => {
    renderNavbar();
    expect(screen.getByText('TerraSpot Harmonizer')).toBeInTheDocument();
    expect(screen.getByText('Challenge 15')).toBeInTheDocument();
    expect(screen.getByText('v0.8.0')).toBeInTheDocument();
    expect(screen.getByText('MODIS (2000–2026) + VIIRS (2012–2026)')).toBeInTheDocument();
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

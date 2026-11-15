import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, RegionProvider } from '../src/context';
import { MapAOISelector } from '../src/components/MapAOISelector';

const renderMapComponent = (props = {}) =>
  render(
    <LanguageProvider>
      <RegionProvider disableAutoFetch>
        <MapAOISelector disableRemoteTiles {...props} />
      </RegionProvider>
    </LanguageProvider>,
  );

describe('MapAOISelector Component (T-06 WebGIS & NASA GIBS)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Story 1 - Map Canvas & Region Synchronization (P1)', () => {
    it('renders the map canvas container, title, and initial Huánuco coordinates', () => {
      renderMapComponent();

      expect(screen.getByTestId('map-aoi-selector')).toBeInTheDocument();
      expect(screen.getByText('Geospatial AOI Canvas & Satellite Telemetry')).toBeInTheDocument();
      expect(screen.getByTestId('input-min-lat')).toHaveValue(-10.6);
      expect(screen.getByTestId('input-max-lat')).toHaveValue(-8.4);
      expect(screen.getByTestId('input-min-lon')).toHaveValue(-77.1);
      expect(screen.getByTestId('input-max-lon')).toHaveValue(-74.4);
    });

    it('synchronizes quick region pills and updates coordinate inputs on selection', () => {
      renderMapComponent();

      const calPill = screen.getByTestId('quick-region-US-CAL');
      fireEvent.click(calPill);

      expect(screen.getByTestId('input-min-lat')).toHaveValue(36);
      expect(screen.getByTestId('input-max-lat')).toHaveValue(41.5);
      expect(screen.getByTestId('input-min-lon')).toHaveValue(-123.8);
      expect(screen.getByTestId('input-max-lon')).toHaveValue(-118.5);
    });
  });

  describe('User Story 2 - Bounding Box Drawing & Inputs (P2)', () => {
    it('allows manual editing of coordinate inputs and calls onCustomAOIChange', () => {
      const handleCustomAOI = vi.fn();
      renderMapComponent({ onCustomAOIChange: handleCustomAOI });

      const minLatInput = screen.getByTestId('input-min-lat');
      fireEvent.change(minLatInput, { target: { value: '-10.15' } });

      expect(handleCustomAOI).toHaveBeenCalledWith(
        expect.objectContaining({
          min_lat: -10.15,
        }),
      );
    });

    it('toggles drawing mode and resets custom bounding box to regional defaults', () => {
      const handleCustomAOI = vi.fn();
      renderMapComponent({ onCustomAOIChange: handleCustomAOI });

      const drawButton = screen.getByTestId('btn-toggle-draw');
      fireEvent.click(drawButton);

      expect(screen.getByTestId('draw-status-indicator')).toHaveTextContent(
        'Click & Drag to Draw AOI Rectangle',
      );

      // Simulate a custom bounding box set
      const minLatInput = screen.getByTestId('input-min-lat');
      fireEvent.change(minLatInput, { target: { value: '-10.0' } });

      const resetButton = screen.getByTestId('btn-reset-aoi');
      expect(resetButton).toBeInTheDocument();
      fireEvent.click(resetButton);

      expect(screen.getByTestId('input-min-lat')).toHaveValue(-10.6);
      expect(handleCustomAOI).toHaveBeenCalledWith(null);
    });

    it('displays error badge when invalid out-of-range coordinates are entered', () => {
      renderMapComponent();

      const minLatInput = screen.getByTestId('input-min-lat');
      fireEvent.change(minLatInput, { target: { value: '-95.0' } });

      expect(screen.getByTestId('coordinate-validation-error')).toHaveTextContent(
        'Coordinates out of bounds',
      );
    });
  });

  describe('User Story 3 - NASA GIBS WMTS & Spatial Fire Cells (P3)', () => {
    it('switches between Dark Matter and NASA GIBS satellite layer options', () => {
      renderMapComponent();

      const layerSelect = screen.getByTestId('layer-select');
      expect(layerSelect).toHaveValue('dark_matter');

      fireEvent.change(layerSelect, { target: { value: 'modis_truecolor' } });
      expect(layerSelect).toHaveValue('modis_truecolor');
      expect(screen.getByTestId('gibs-date-badge')).toHaveTextContent('2024-09-15');

      fireEvent.change(layerSelect, { target: { value: 'viirs_truecolor' } });
      expect(layerSelect).toHaveValue('viirs_truecolor');
    });

    it('toggles fire cells visibility and renders cell count badge', () => {
      renderMapComponent();

      const toggleCellsCheckbox = screen.getByTestId('toggle-fire-cells');
      expect(toggleCellsCheckbox).toBeChecked();

      fireEvent.click(toggleCellsCheckbox);
      expect(toggleCellsCheckbox).not.toBeChecked();
    });

    it('supports bilingual EN/ES translation across map controls and titles', () => {
      render(
        <LanguageProvider initialLanguage="es">
          <RegionProvider disableAutoFetch>
            <MapAOISelector disableRemoteTiles />
          </RegionProvider>
        </LanguageProvider>,
      );

      expect(
        screen.getByText('Lienzo Geoespacial de AOI y Telemetría Satelital'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('btn-toggle-draw')).toHaveTextContent('Dibujar AOI');
    });
  });
});

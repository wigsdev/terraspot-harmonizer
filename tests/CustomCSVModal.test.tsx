import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CustomCSVModal } from '../src/components/CustomCSVModal';
import { LanguageProvider, RegionProvider } from '../src/context';

const sampleCSVText = `latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_t31,frp,daynight,type
-10.13453,-75.83249,326.3,0.39,0.52,2024-08-18,1605,N,VIIRS,n,2.0NRT,298.1,12.3,D,0
-9.30272,-75.98646,315.6,0.54,0.66,2024-09-19,0610,N20,VIIRS,n,2.0NRT,288.2,56.3,N,0
-9.62314,-75.56372,341.2,2.29,1.79,2024-08-22,0700,Terra,MODIS,94,6.1,288.4,49.3,N,0
`;

describe('CustomCSVModal Component (US3 & US4)', () => {
  const mockOnClose = vi.fn();
  const mockOnApplyCustomCube = vi.fn();
  const mockOnResetToBenchmark = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('sample_firms_huanuco.csv')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(sampleCSVText),
        });
      }
      if (url.includes('meteomatics_weather.json')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              regions: {
                'PE-HCO': {
                  metrics: {
                    'forest_fire_warning:idx': 0.0,
                    't_2m:C': 19.1,
                    'relative_humidity_2m:p': 77.7,
                    'wind_speed_10m:ms': 2.4,
                    'evapotranspiration_24h:mm': 3.38,
                  },
                },
              },
            }),
        });
      }
      return Promise.reject(new Error(`Not found: ${url}`));
    });
  });

  const renderModal = (isOpen = true, isCustomActive = false) => {
    return render(
      <LanguageProvider initialLanguage="en">
        <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
          <CustomCSVModal
            isOpen={isOpen}
            onClose={mockOnClose}
            onApplyCustomCube={mockOnApplyCustomCube}
            onResetToBenchmark={mockOnResetToBenchmark}
            isCustomActive={isCustomActive}
          />
        </RegionProvider>
      </LanguageProvider>
    );
  };

  it('does not render content when isOpen is false', () => {
    renderModal(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders accessible dialog elements when isOpen is true', () => {
    renderModal(true);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(/Custom NASA FIRMS Hotspot Ingestion/i)).toBeInTheDocument();
  });

  it('calls onClose when clicking close button or pressing Escape key', () => {
    renderModal(true);
    const closeBtn = screen.getByTestId('modal-close-button');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('loads sample dataset and displays validation telemetry upon clicking Load Sample', async () => {
    renderModal(true);
    const sampleBtn = screen.getByTestId('load-sample-dataset-button');
    fireEvent.click(sampleBtn);

    await waitFor(() => {
      expect(screen.getByText(/Validated NASA FIRMS Hotspot Dataset/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Vegetation Hotspots/i)).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1); // vegetation hotspots in mock sample

    const applyBtn = screen.getByTestId('apply-custom-cube-button');
    expect(applyBtn).not.toBeDisabled();

    fireEvent.click(applyBtn);
    expect(mockOnApplyCustomCube).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onResetToBenchmark when clicking Reset button', () => {
    renderModal(true, true);
    const resetBtn = screen.getByTestId('reset-benchmark-modal-button');
    fireEvent.click(resetBtn);
    expect(mockOnResetToBenchmark).toHaveBeenCalledTimes(1);
  });
});

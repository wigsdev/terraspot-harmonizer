import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LanguageProvider, RegionProvider } from '../src/context';
import { BurningCalendarMatrix } from '../src/components/BurningCalendarMatrix';
import rawCatalog from '../public/data/regions_catalog.json';
import type { RegionCube } from '../src/types';

const mockCube = rawCatalog.regions[0] as unknown as RegionCube;

const renderMatrix = (initialRegionId = 'PE-HCO', props = {}) =>
  render(
    <LanguageProvider>
      <RegionProvider initialRegionId={initialRegionId} disableAutoFetch>
        <BurningCalendarMatrix activeCube={mockCube} {...props} />
      </RegionProvider>
    </LanguageProvider>,
  );

describe('BurningCalendarMatrix Component (T-07)', () => {
  describe('User Story 1 - Multi-Decadal Matrix Grid & Sensor Era Synthesis (P1 MVP)', () => {
    it('renders the matrix container, header, 27 year rows (2000-2026), and 12 month columns', () => {
      renderMatrix('PE-HCO');

      const container = screen.getByTestId('burning-calendar-matrix');
      expect(container).toBeInTheDocument();

      // Check title and subtitle
      expect(screen.getByText(/Burning Activity Calendar Matrix/i)).toBeInTheDocument();

      // Verify start year 2000 and end year 2026 exist
      expect(screen.getByTestId('year-label-2000')).toBeInTheDocument();
      expect(screen.getByTestId('year-label-2026')).toBeInTheDocument();

      // Verify month column headers
      const monthHeaders = screen.getAllByTestId(/^month-col-header-/);
      expect(monthHeaders).toHaveLength(12);
      expect(monthHeaders[0]).toHaveTextContent('Jan');
      expect(monthHeaders[11]).toHaveTextContent('Dec');
    });

    it('renders three distinct sensor era brackets on the vertical axis', () => {
      renderMatrix('PE-HCO');

      expect(screen.getByTestId('era-bracket-MODIS_SOLO')).toBeInTheDocument();
      expect(screen.getByTestId('era-bracket-DUAL_SENSOR_FUSION')).toBeInTheDocument();
      expect(screen.getByTestId('era-bracket-VIIRS_CONTINUITY')).toBeInTheDocument();
    });

    it('renders right-margin annual sum column with proportional mini-bars and bottom-margin monthly medians', () => {
      renderMatrix('PE-HCO');

      // Right margin header
      expect(screen.getByTestId('margin-header-annual')).toHaveTextContent('Annual Total');

      // Check annual sum for a known year (e.g. 2024)
      const annual2024 = screen.getByTestId('annual-sum-2024');
      expect(annual2024).toBeInTheDocument();
      expect(annual2024).not.toHaveTextContent('0Jan');

      // Bottom margin header
      expect(screen.getByTestId('margin-header-monthly-median')).toHaveTextContent(
        'Baseline Median (2001–2025)',
      );

      // Check monthly medians row
      const medianCols = screen.getAllByTestId(/^monthly-median-col-/);
      expect(medianCols).toHaveLength(12);
    });

    it('renders future months in 2026 (Nov and Dec) with N/A and future styling', () => {
      renderMatrix('PE-HCO');

      const nov2026 = screen.getByTestId('cell-2026-11');
      const dec2026 = screen.getByTestId('cell-2026-12');

      expect(nov2026).toHaveTextContent('N/A');
      expect(dec2026).toHaveTextContent('N/A');
      expect(nov2026).toHaveAttribute('data-future', 'true');
      expect(dec2026).toHaveAttribute('data-future', 'true');
    });
  });

  describe('User Story 2 - Analytical View Mode Switcher & Sensor Audit Step-Jump (P2)', () => {
    it('switches between all 4 projection modes and locks to diverging palette in anomaly mode', () => {
      renderMatrix('PE-HCO');

      // Initially in harmonized mode
      expect(screen.getByTestId('mode-btn-harmonized')).toHaveAttribute('data-active', 'true');

      // Switch to Anomaly mode
      const anomalyBtn = screen.getByTestId('mode-btn-anomaly');
      fireEvent.click(anomalyBtn);
      expect(anomalyBtn).toHaveAttribute('data-active', 'true');

      // In anomaly mode, cell values display percentage (+ or - %)
      const cellOct2024 = screen.getByTestId('cell-2024-10');
      expect(cellOct2024.textContent).toMatch(/[%]/);

      // Switch to FRP mode
      const frpBtn = screen.getByTestId('mode-btn-frp');
      fireEvent.click(frpBtn);
      expect(frpBtn).toHaveAttribute('data-active', 'true');

      // Switch to Raw mode
      const rawBtn = screen.getByTestId('mode-btn-raw');
      fireEvent.click(rawBtn);
      expect(rawBtn).toHaveAttribute('data-active', 'true');
      // Step jump notice should be visible in raw mode
      expect(screen.getByTestId('step-jump-notice')).toBeInTheDocument();
    });

    it('renders critical anomaly badges on cells exceeding thresholds', () => {
      renderMatrix('PE-HCO');

      // Switch to anomaly mode
      fireEvent.click(screen.getByTestId('mode-btn-anomaly'));

      const badges = screen.getAllByTestId('critical-anomaly-badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('User Story 3 - Interactive Cell Inspection, Tooltips & Selection (P3)', () => {
    it('displays aerospace dark tooltip on cell hover/focus with complete telemetry', () => {
      renderMatrix('PE-HCO');

      const cell = screen.getByTestId('cell-2024-8');
      fireEvent.mouseEnter(cell);

      const tooltip = screen.getByTestId('matrix-tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('2024');
      expect(tooltip).toHaveTextContent('Aug');
      expect(tooltip).toHaveTextContent('Harmonized Hotspots');
    });

    it('supports cell selection on click and triggers onSelectRecord callback', () => {
      const onSelectSpy = vi.fn();

      renderMatrix('PE-HCO', { onSelectRecord: onSelectSpy });

      const cell = screen.getByTestId('cell-2024-9');
      fireEvent.click(cell);

      expect(cell).toHaveAttribute('data-selected', 'true');
      expect(onSelectSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          year: 2024,
          month: 9,
          harmonizedHotspots: expect.any(Number),
        }),
      );
    });

    it('supports WAI-ARIA keyboard navigation across cells', () => {
      renderMatrix('PE-HCO');

      const cell = screen.getByTestId('cell-2024-5');

      act(() => {
        cell.focus();
      });

      // Navigate right
      act(() => {
        fireEvent.keyDown(cell, { key: 'ArrowRight' });
      });
      expect(document.activeElement).toHaveAttribute('data-testid', 'cell-2024-6');

      // Navigate down
      act(() => {
        fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
      });
      expect(document.activeElement).toHaveAttribute('data-testid', 'cell-2025-6');
    });
  });
});

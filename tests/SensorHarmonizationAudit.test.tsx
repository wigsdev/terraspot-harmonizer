import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider, RegionProvider } from '../src/context';
import { SensorHarmonizationAudit } from '../src/components/SensorHarmonizationAudit';
import rawCatalog from '../public/data/regions_catalog.json';
import type { RegionCube } from '../src/types';

const mockCube = rawCatalog.regions[0] as unknown as RegionCube; // PE-HCO

const renderAudit = (props = {}) =>
  render(
    <LanguageProvider>
      <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
        <SensorHarmonizationAudit activeCube={mockCube} {...props} />
      </RegionProvider>
    </LanguageProvider>,
  );

describe('SensorHarmonizationAudit Component (T-08 User Stories 2 & 3 - P2 & P3)', () => {
  describe('User Story 2 - Multi-Decadal Sensor Audit Timeline & Step-Jump Callout (P2)', () => {
    it('renders the audit container, title, subtitle, and 2012 step-jump callout', () => {
      renderAudit();

      const container = screen.getByTestId('sensor-harmonization-audit');
      expect(container).toBeInTheDocument();

      expect(
        screen.getByText(/Sensor Harmonization Audit/i),
      ).toBeInTheDocument();

      // Step-jump alert callout
      expect(screen.getByTestId('step-jump-callout')).toBeInTheDocument();
      expect(screen.getByText(/Artificial 2012 Step-Jump/i)).toBeInTheDocument();
    });

    it('renders 4 layer toggle buttons with initial active states', () => {
      renderAudit();

      const toggleGroup = screen.getByTestId('audit-layer-toggles');
      expect(toggleGroup).toBeInTheDocument();

      const modisToggle = screen.getByTestId('toggle-raw-modis');
      const viirsToggle = screen.getByTestId('toggle-raw-viirs');
      const afcdToggle = screen.getByTestId('toggle-afcd');
      const harmonizedToggle = screen.getByTestId('toggle-harmonized');

      expect(modisToggle).toHaveAttribute('aria-pressed', 'true');
      expect(viirsToggle).toHaveAttribute('aria-pressed', 'true');
      expect(afcdToggle).toHaveAttribute('aria-pressed', 'false');
      expect(harmonizedToggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('toggles layer visibility when clicking toggle badges', () => {
      renderAudit();

      const viirsToggle = screen.getByTestId('toggle-raw-viirs');
      expect(viirsToggle).toHaveAttribute('aria-pressed', 'true');

      // Click to disable
      fireEvent.click(viirsToggle);
      expect(viirsToggle).toHaveAttribute('aria-pressed', 'false');

      // Click to re-enable
      fireEvent.click(viirsToggle);
      expect(viirsToggle).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('User Story 3 - Model Fit Scorecards & Monthly Beta Factors (P3)', () => {
    it('renders 4 statistical model fit scorecards with empirical metrics', () => {
      renderAudit();

      const scorecardsContainer = screen.getByTestId('model-fit-scorecards');
      expect(scorecardsContainer).toBeInTheDocument();

      // Check R^2 card
      const r2Card = screen.getByTestId('scorecard-r2');
      expect(r2Card).toBeInTheDocument();
      expect(r2Card).toHaveTextContent(/0\.97|0\.98|0\.9/);

      // Check Pearson r card
      const pearsonCard = screen.getByTestId('scorecard-pearson');
      expect(pearsonCard).toBeInTheDocument();
      expect(pearsonCard).toHaveTextContent(/0\.98|0\.99|0\.9/);

      // Check MAPE reduction card
      const mapeCard = screen.getByTestId('scorecard-mape');
      expect(mapeCard).toBeInTheDocument();
      expect(mapeCard).toHaveTextContent(/85\.|8|%/);

      // Check RMSE card
      const rmseCard = screen.getByTestId('scorecard-rmse');
      expect(rmseCard).toBeInTheDocument();
    });

    it('renders 12 monthly beta calibration factors with formatted multipliers', () => {
      renderAudit();

      const betaContainer = screen.getByTestId('beta-factors-breakdown');
      expect(betaContainer).toBeInTheDocument();

      // Check that 12 month items are rendered
      const betaItems = screen.getAllByTestId(/^beta-factor-month-/);
      expect(betaItems).toHaveLength(12);

      // Check first month (Jan) has multiplier formatted as e.g. "1.66x"
      expect(betaItems[0]).toHaveTextContent(/1\.[0-9]+x/);
    });

    it('renders safely when activeCube is null', () => {
      render(
        <LanguageProvider>
          <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
            <SensorHarmonizationAudit activeCube={null} />
          </RegionProvider>
        </LanguageProvider>,
      );

      expect(screen.getByTestId('sensor-harmonization-audit')).toBeInTheDocument();
    });
  });
});

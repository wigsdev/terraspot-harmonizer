# Quickstart & Verification Guide: Climatological Anomaly Curves & Sensor Harmonization Audit Panels

**Feature**: `specs/007-climatology-sensor-audit/`  
**Date**: 2026-11-15  
**Goal**: Runnable verification scenarios demonstrating seasonal climatology curves, anomaly envelope bounds, sensor audit step-jump elimination, and model fit scorecards.

---

## 1. Prerequisites

Ensure local development environment is running with required packages:
```bash
node -v   # v24.x
pnpm -v   # 12.21.0
pnpm test:run
```

---

## 2. Verification Scenarios

### Scenario 1: Seasonal Climatology & Anomaly Envelope Curve (US1 - MVP)
**Goal:** Verify that `ClimatologyAnomalyChart.tsx` renders 12 months with baseline median ($M_m$), shaded IQR envelope ($P_{25}\text{--}P_{75}$), $P_{90}$ threshold, and active year trajectory.

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RegionProvider, LanguageProvider } from '@/context';
import { ClimatologyAnomalyChart } from '@/components';
import catalog from '../../public/data/regions_catalog.json';

const mockCube = catalog.regions[0]; // Huánuco

test('renders seasonal climatology curve and allows switching observation year', () => {
  render(
    <LanguageProvider>
      <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
        <ClimatologyAnomalyChart activeCube={mockCube} selectedYear={2024} />
      </RegionProvider>
    </LanguageProvider>
  );

  // Verify chart container & title
  expect(screen.getByTestId('climatology-anomaly-chart')).toBeInTheDocument();
  
  // Verify year selector dropdown exists with default 2024
  const yearSelect = screen.getByTestId('climatology-year-select');
  expect(yearSelect).toHaveValue('2024');

  // Switch year to 2020
  fireEvent.change(yearSelect, { target: { value: '2020' } });
  expect(yearSelect).toHaveValue('2020');
});
```

---

### Scenario 2: Sensor Harmonization Audit & Step-Jump Elimination (US2)
**Goal:** Verify that `SensorHarmonizationAudit.tsx` renders the multi-decadal timeline (2000–2026) and allows toggling raw vs harmonized layers, exposing the 2012 step-jump.

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RegionProvider, LanguageProvider } from '@/context';
import { SensorHarmonizationAudit } from '@/components';
import catalog from '../../public/data/regions_catalog.json';

const mockCube = catalog.regions[0];

test('renders multi-decadal timeline and toggles sensor audit layers', () => {
  render(
    <LanguageProvider>
      <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
        <SensorHarmonizationAudit activeCube={mockCube} />
      </RegionProvider>
    </LanguageProvider>
  );

  // Verify audit container & 2012 transition notice
  expect(screen.getByTestId('sensor-harmonization-audit')).toBeInTheDocument();
  expect(screen.getByTestId('sensor-step-jump-callout')).toBeInTheDocument();

  // Toggle layer checkboxes
  const viirsCheckbox = screen.getByTestId('layer-toggle-viirs');
  expect(viirsCheckbox).toBeChecked();
  fireEvent.click(viirsCheckbox);
  expect(viirsCheckbox).not.toBeChecked();
});
```

---

### Scenario 3: Model Fit Scorecards & Regional $\beta_m$ Factors (US3)
**Goal:** Verify quantitative validation cards ($R^2 \ge 0.90$, Pearson $r \ge 0.95$, MAPE reduction $\ge 65\%$, RMSE) and the 12-month calibration factor breakdown.

```tsx
test('displays statistical model fit scorecards and monthly beta factors', () => {
  render(
    <LanguageProvider>
      <RegionProvider initialRegionId="PE-HCO" disableAutoFetch>
        <SensorHarmonizationAudit activeCube={mockCube} showModelFitScorecards showBetaFactors />
      </RegionProvider>
    </LanguageProvider>
  );

  // Verify R^2 card
  expect(screen.getByTestId('metric-card-r-squared')).toBeInTheDocument();
  expect(screen.getByText(/0\.9/)).toBeInTheDocument();

  // Verify MAPE reduction
  expect(screen.getByTestId('metric-card-mape-reduction')).toBeInTheDocument();

  // Verify 12 beta factor items exist
  const betaCards = screen.getAllByTestId(/^beta-factor-month-/);
  expect(betaCards).toHaveLength(12);
});
```

---

### Scenario 4: Cross-Component Mission Synchronization
**Goal:** Verify that clicking a cell in `BurningCalendarMatrix` updates the active year in `ClimatologyAnomalyChart`.

```bash
pnpm test:run tests/App.test.tsx
```
Expected output: All integration tests pass with 0 errors.

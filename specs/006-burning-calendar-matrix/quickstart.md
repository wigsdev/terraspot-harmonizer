# Quickstart & Verification Guide: Burning Activity Calendar Matrix

**Feature**: `006-burning-calendar-matrix` (`T-07`)  
**Specification Reference**: `specs/006-burning-calendar-matrix/spec.md`  
**Date**: 2026-11-15  

---

## 1. Prerequisites

- Node.js `v24.x` and `pnpm 12.21.0`.
- All baseline packages installed via `pnpm install`.
- Active benchmark data in `public/data/regions_catalog.json`.

---

## 2. Interactive Verification Scenarios

### Scenario 1: Initial 27 × 12 Grid Rendering & Sensor Eras (US1 / MVP)
1. Start dev server: `pnpm dev`.
2. Inspect the dashboard below `MapAOISelector`.
3. Verify that 27 rows (2000 through 2026) are rendered.
4. Verify the 3 sensor era labels on the left margin:
   - `MODIS (2000–2011)`
   - `DUAL FUSION (2012–2025)`
   - `VIIRS (2026)`
5. Verify the right margin displays annual sums ($H_{\text{annual}}$) and the bottom margin displays monthly medians ($M_m$).

### Scenario 2: View Mode Switcher & 2012 Step-Jump Audit (US2)
1. In the matrix toolbar, toggle from **Harmonized Hotspots** to **Raw Unharmonized Counts**.
2. Observe row 2011 vs. row 2012: The raw counts show an artificial jump from ~150 to ~450+ due to VIIRS 375m higher resolution.
3. Switch back to **Harmonized Hotspots**: Verify that the calibration removes the discontinuity and aligns the time series.
4. Toggle to **Historical Anomaly**: Verify that cells switch to the diverging blue-white-red palette centered at 0% departure.

### Scenario 3: Hover Tooltip & Selection Callback (US3)
1. Hover over a high-fire cell (e.g. September 2024 for Huánuco or September 2020 for California).
2. Verify the aerospace tooltip details: Year, Month, Count, Median, Anomaly %, $Z$-Score, Mean FRP, and Night Fraction.
3. Click the cell: Verify the cyan/amber focus ring persists and downstream analytics receive the selected coordinates.

---

## 3. Automated Test Verification

Run dedicated unit and component tests:

```bash
pnpm test:run tests/BurningCalendarMatrix.test.tsx
```

Run full regression verification:

```bash
pnpm typecheck && pnpm test:run && pnpm build
```

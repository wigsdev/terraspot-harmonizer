# Quickstart & Verification Guide: Standardized CSV Exporter & Custom FIRMS Ingestion

**Feature**: Standardized CSV Exporter and Custom NASA FIRMS CSV Ingestion (`T-10`)  
**Directory**: `specs/009-csv-export-upload`  
**Date**: 2026-11-15  

---

## 1. Prerequisites & Environment Setup

Verify the development environment has required packages and test harness:

```bash
# Verify Node and pnpm versions
node -v   # Should be v24.x
pnpm -v   # Should be 12.21.0

# Verify papaparse dependency
pnpm list papaparse
```

---

## 2. Validation Scenarios

### Scenario 1: Standardized 27-Column CSV Export
1. Run automated unit tests verifying the CSV generator:
   ```bash
   pnpm test:run tests/csvExporter.test.ts
   ```
2. Verify that:
   - Header row contains exactly the 27 canonical columns specified in `CANONICAL_CSV_HEADERS`.
   - Number of data rows equals total months in the cube (e.g. 324 rows for 2000–2026).
   - Numerical fields with signs (`+77.17%`, `+3.09`) and quoted textual strings parse cleanly without delimiter corruption.
   - Blob creation and download trigger simulate cleanly without throwing in JSDOM / browser.

### Scenario 2: Client-Side Custom CSV Ingestion & Modal Interaction
1. Run automated component and parsing tests:
   ```bash
   pnpm test:run tests/CustomCSVModal.test.tsx
   ```
2. Verify that:
   - Modal renders when `isOpen={true}` and traps focus with `role="dialog"`.
   - Dragging or uploading a valid FIRMS CSV parses correctly, populating the diagnostic report.
   - Malformed files missing `latitude` or `longitude` trigger clear error diagnostics.
   - Clicking "Load Sample Dataset" parses `/data/sample_firms_huanuco.csv` and enables the "Apply to Dashboard" button.
   - Clicking "Apply to Dashboard" calls `onApplyCustomCube` and propagates updates to the UI.
   - Clicking "Reset to Benchmark" restores the initial cube and refits the cartographic viewport in MapAOISelector.

### Scenario 3: End-to-End Build & Compilation Verification
1. Verify TypeScript compiles with zero errors:
   ```bash
   pnpm typecheck
   ```
2. Verify full test suite passes:
   ```bash
   pnpm test:run
   ```
3. Verify clean production bundle build:
   ```bash
   pnpm build
   ```

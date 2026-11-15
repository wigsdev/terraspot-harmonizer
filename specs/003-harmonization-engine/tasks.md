---

description: "Actionable task list for Client-Side Spatiotemporal Harmonization Engine & Accessible Color Ramps (T-04)"
---

# Tasks: Client-Side Spatiotemporal Harmonization Engine & Accessible Color Ramps

**Input**: Design documents from `/specs/003-harmonization-engine/`  
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/engine-contracts.md](contracts/engine-contracts.md), [quickstart.md](quickstart.md)  
**Feature Branch**: `feat/T-04-motor-armonizacion` (`T-04`)  
**Target Version**: `0.4.0`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- All paths are relative to the repository root (`/home/wigsdev/GitHub/hackaton-nasa`)

---

## Phase 1: Setup (Shared Engine Structure)

**Purpose**: Initialize the pure TypeScript computational module skeleton under `src/engine/` before contract extensions and mathematical stage implementation.

- [X] T001 Initialize `src/engine/` module structure with documented header skeletons in `src/engine/harmonizer.ts`, `src/engine/colorRamps.ts`, and `src/engine/index.ts`

---

## Phase 2: Foundational (Core TypeScript Contracts)

**Purpose**: Extend shared domain and color accessibility TypeScript contracts required across all harmonization stages, color ramps, and automated test suites.

**⚠️ CRITICAL**: Complete these contract extensions cleanly before writing stage implementations or Vitest suites. Existing contracts consumed by `tests/dataPipeline.test.ts` and `tests/smoke.test.ts` must remain backward compatible.

- [X] T002 [P] Extend `src/types/harmonization.ts` with `AnomalyAlertStatus`, `FireRegimeClass`, `QualityFilterStats`, `MonthlySensorObservation`, and `HarmonizationResult` contracts per `specs/003-harmonization-engine/data-model.md`
- [X] T003 [P] Extend `src/types/palette.ts` with `RgbColor` and `ColorCellStyle` interfaces per `specs/003-harmonization-engine/data-model.md` (and re-export via `src/types/index.ts` if needed)

**Checkpoint**: Shared TypeScript contracts ready — harmonization engine and color ramp user stories can proceed independently in parallel.

---

## Phase 3: User Story 1 - Real-Time Multi-Decadal Spatiotemporal Harmonization & Custom AOI Recalculation (Priority: P1) 🎯 MVP

**Goal**: Implement Stages 1–3 of the NASA FIRMS MODIS/VIIRS cross-calibration methodology (`docs/02-modis-viirs-harmonization-methodology.md`) plus dynamic bounding-box spatial subsetting and raw CSV detection re-harmonization (`< 30 ms` client budget).

**Independent Test**: Run `pnpm vitest run tests/harmonizer.test.ts` to verify Stage 1 quality masking (`1,200` rows in `public/data/sample_firms_huanuco.csv` → `1,140` valid, `60` rejected), Stage 2 `0.01°` AFCD consolidation, Stage 3 regularized seasonal $\beta_m$ ($\lambda = 1.0$, `2012–2025` overlap), three-era temporal synthesis (`MODIS_SOLO`, `DUAL_SENSOR_FUSION` `0.70/0.30`, `VIIRS_CONTINUITY`), validation parity against all 5 regions in `public/data/regions_catalog.json`, and `< 30 ms` bounding-box subsetting over `public/data/firms_spatial_cells.json`.

### Implementation for User Story 1

- [X] T004 [US1] Implement Stage 1 radiometric quality masking constants and functions (`isValidVegetationFire`, `filterQualityDetections`) in `src/engine/harmonizer.ts` (`FR-001`)
- [X] T005 [US1] Implement Stage 2 `0.01°` spatial grid co-registration and same-day consolidation (`GRID_RESOLUTION_DEG`, `getGridCoordinates`, `aggregateToAfcdGrid`, `groupCellDaysByMonth`) in `src/engine/harmonizer.ts` (`FR-002`)
- [X] T006 [US1] Implement Stage 3 regularized seasonal cross-calibration calculator (`OVERLAP_START_YEAR`, `OVERLAP_END_YEAR`, `LAPLACE_LAMBDA`, `calculateSeasonalBeta`) and overlap validation metrics (`computeValidationMetrics`: `r_squared`, `pearson_r`, `raw_mape_pct`, `harmonized_mape_pct`, `mape_reduction_pct`) in `src/engine/harmonizer.ts` (`FR-003`)
- [X] T007 [US1] Implement Stage 3 three-era temporal synthesis (`VIIRS_FUSION_WEIGHT = 0.70`, `MODIS_FUSION_WEIGHT = 0.30`, `harmonizeTimeSeries` for `MODIS_SOLO`, `DUAL_SENSOR_FUSION`, and `VIIRS_CONTINUITY`) in `src/engine/harmonizer.ts` (`FR-003`)
- [X] T008 [US1] Implement custom AOI bounding-box normalizer, spatial grid subsetting, and end-to-end raw detection harmonizer (`normalizeBoundingBox`, `reharmonizeSpatialSubset`, `harmonizeRawDetections`) in `src/engine/harmonizer.ts` (`FR-006`, `SC-001`)

**Checkpoint**: User Story 1 delivers complete client-side Stages 1–3 MODIS/VIIRS calibration and dynamic spatial AOI recalculation.

---

## Phase 4: User Story 2 - Non-Parametric Climatological Anomaly Detection & Fire Regime Classification (Priority: P2)

**Goal**: Implement Stage 4 non-parametric baseline climatology (`2001–2025`), robust interquartile $Z$-score anomaly classification (`NORMAL`, `ELEVATED`, `CRITICAL`), Fire Regime Intensity Index ($I_{\text{regime}} \in [0, 100]$), and the full mathematical verification & benchmark suite in `tests/harmonizer.test.ts`.

**Independent Test**: Run `pnpm vitest run tests/harmonizer.test.ts` to assert exact quantile parity (`median`, `p25`, `p75`, `iqr`, `p90` over `2001–2025` excluding partial `2026`), zero-IQR denominator safeguards, `classifyAnomalyStatus` tier thresholds, `classifyFireRegime` scoring across all 3 regime classes, and mathematical parity ($\le 10^{-4}$ tolerance) against `public/data/regions_catalog.json`.

### Implementation & Verification for User Story 2

- [X] T009 [US2] Implement Stage 4 non-parametric linear quantile interpolation (`linearPercentile`), `2001–2025` baseline climatology (`CLIMATOLOGY_START_YEAR`, `CLIMATOLOGY_END_YEAR`, `computeMonthlyClimatology`), percentage departure ($\Delta\%_{y,m}$), robust $Z$-score ($Z_{y,m}$), and `classifyAnomalyStatus` in `src/engine/harmonizer.ts` (`FR-004`)
- [X] T010 [US2] Implement Stage 4 Fire Regime Intensity Index calculator (`classifyFireRegime`: $I_{\text{regime}} \in [0, 100]$, `'AGRICULTURAL_BURN'`, `'TRANSITIONAL'`, `'SEVERE_WILDFIRE'`) and wire Stage 4 outputs into `harmonizeTimeSeries` in `src/engine/harmonizer.ts` (`FR-005`)
- [X] T011 [US2] Create comprehensive Vitest unit, Python pipeline parity, degenerate edge-case, and `< 30 ms` performance benchmark test suite in `tests/harmonizer.test.ts` validating Stages 1–4 against `public/data/regions_catalog.json`, `public/data/firms_spatial_cells.json`, and `public/data/sample_firms_huanuco.csv` (`SC-001`, `SC-002`, `SC-003`, `SC-005`)

**Checkpoint**: User Stories 1 and 2 are fully integrated, scientifically parity-checked against NASA FIRMS benchmark cubes, and green in Vitest.

---

## Phase 5: User Story 3 - WCAG 2.1 AA Colorblind-Accessible Chromatic Mapping & Contrast Safety (Priority: P3)

**Goal**: Implement the 4 colorblind-certified chromatic ramps (**Inferno**, **Viridis**, **Cividis**, **Diverging Blue–White–Red**) with 5-stop piecewise-linear RGB interpolation and WCAG 2.1 Level AA relative luminance & contrast (`>= 4.5:1`) text resolution in `src/engine/colorRamps.ts`, verified by `tests/colorRamps.test.ts`.

**Independent Test**: Run `pnpm vitest run tests/colorRamps.test.ts` to verify exact hex equality at the 5 anchor stops per palette (`docs/design-system.md`), symmetric `-100% / 0% / +100%` mapping on `diverging`, `NaN`/`Infinity`/`min >= max` domain clamping, and `>= 4.5:1` WCAG 2.1 AA contrast ratios across 101 sampled steps ($t = 0.00 \dots 1.00$) for every palette.

### Implementation & Verification for User Story 3

- [X] T012 [P] [US3] Define `ACCESSIBLE_PALETTES` (`inferno`, `viridis`, `cividis`, `diverging`) using exact 5-stop hex anchors from `docs/design-system.md` and implement `hexToRgb`, `rgbToHex`, `normalizeValue`, and `normalizeDivergingAnomaly` in `src/engine/colorRamps.ts` (`FR-007`)
- [X] T013 [US3] Implement piecewise-linear RGB/hex interpolators and CSS linear gradient builder (`interpolatePaletteRgb`, `interpolatePaletteHex`, `getPaletteCssGradient`) in `src/engine/colorRamps.ts` (`FR-007`)
- [X] T014 [US3] Implement WCAG 2.1 sRGB gamma linearization luminance and contrast ratio resolvers (`DARK_TEXT_HEX`, `LIGHT_TEXT_HEX`, `WCAG_AA_MIN_CONTRAST`, `getRelativeLuminance`, `getContrastRatio`, `getAccessibleTextColor`, `getAccessibleCellStyle`) in `src/engine/colorRamps.ts` (`FR-008`, `SC-004`)
- [X] T015 [US3] Create comprehensive Vitest suite in `tests/colorRamps.test.ts` testing 5-stop anchor accuracy, diverging symmetry, degenerate/non-finite input safeguards, and WCAG 2.1 AA `>= 4.5:1` contrast compliance across all 4 palettes (`SC-003`, `SC-004`, `SC-005`)

**Checkpoint**: User Story 3 color scale engine and accessibility verification suite pass independently at 100%.

---

## Phase 6: Polish, Barrel Exports & Cross-Cutting Verification

**Purpose**: Expose unified public imports for upcoming UI tasks (`T-05`–`T-10`), execute full project build/typecheck/test verification, and update semantic versioning metadata (`0.4.0`).

- [X] T016 Wire complete public barrel re-exports for all harmonization and color ramp functions, constants, and types in `src/engine/index.ts` (`FR-009`)
- [X] T017 Run full project verification suite (`pnpm typecheck`, `pnpm test:run`, and `pnpm build`) confirming zero TypeScript errors, zero lint/bundle failures, and 100% test pass rate across all suites
- [X] T018 Bump `"version"` to `"0.4.0"` in `package.json` and document all `T-04` harmonization and WCAG accessibility deliverables in `CHANGELOG.md` under `[0.4.0] - 2026-11-14`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — executes immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS** all user story implementation (`US1`, `US2`, `US3`).
- **Phase 3 (`US1`) & Phase 5 (`US3`)**: Both depend strictly on Phase 2 completion and operate on completely separate modules (`src/engine/harmonizer.ts` vs. `src/engine/colorRamps.ts`), so **Phase 3 (`US1`) and Phase 5 (`US3`) can execute cleanly in parallel**.
- **Phase 4 (`US2`)**: Integrates Stage 4 climatology and regime classification directly into `src/engine/harmonizer.ts`, so `T009`–`T011` sequence cleanly after `T004`–`T008` in `US1`.
- **Phase 6 (Polish & Release Prep)**: Depends on Phases 3, 4, and 5 completion (`T016`–`T018`).

### Task-Level Dependencies

- `T002`, `T003` depend on `T001` and run in parallel `[P]`.
- Within `src/engine/harmonizer.ts` (`US1` → `US2`):
  - `T004` (Stage 1) → `T005` (Stage 2) → `T006` (Stage 3 $\beta_m$ & validation) → `T007` (Stage 3 synthesis) → `T009` (Stage 4 climatology) → `T010` (Stage 4 fire regime) → `T008` (custom AOI + full pipeline entry point, or implemented alongside Stage 4 wiring) → `T011` (`tests/harmonizer.test.ts`).
- Within `src/engine/colorRamps.ts` (`US3`, runs in parallel with `US1`/`US2`):
  - `T012` (palette anchors & normalizers) → `T013` (piecewise interpolators) → `T014` (WCAG luminance & contrast resolver) → `T015` (`tests/colorRamps.test.ts`).
- Phase 6 sequential finish: `T016` → `T017` → `T018`.

---

## Parallel Opportunities

```bash
# Phase 2: Extend domain and palette contracts simultaneously
Task T002: "Extend src/types/harmonization.ts per data-model.md"
Task T003: "Extend src/types/palette.ts per data-model.md"

# After Phase 2 checkpoint: Harmonizer track and Color Ramps track run in parallel
Track A (src/engine/harmonizer.ts + tests/harmonizer.test.ts): T004 -> T005 -> T006 -> T007 -> T008 -> T009 -> T010 -> T011
Track B (src/engine/colorRamps.ts + tests/colorRamps.test.ts): T012 -> T013 -> T014 -> T015
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Core Math)

1. Complete **Phase 1** (`T001`) and **Phase 2** (`T002`–`T003`) to lock TypeScript contracts.
2. Complete **Phase 3 (`US1`)** (`T004`–`T008`) and **Phase 4 (`US2`)** (`T009`–`T011`) to deliver the full 4-stage NASA FIRMS MODIS/VIIRS harmonization engine and prove mathematical parity against `public/data/regions_catalog.json` inside `tests/harmonizer.test.ts`.
3. **Checkpoint**: Validate Stages 1–4 math and `< 30 ms` AOI latency before UI integration.

### Incremental Delivery (Accessible Color Engine & Release Prep)

4. Complete **Phase 5 (`US3`)** (`T012`–`T015`) to lock all 4 WCAG 2.1 Level AA palettes and verify `>= 4.5:1` contrast in `tests/colorRamps.test.ts`.
5. Complete **Phase 6** (`T016`–`T018`) to finalize barrel exports in `src/engine/index.ts`, verify clean `pnpm typecheck && pnpm test:run && pnpm build`, and bump `package.json` + `CHANGELOG.md` to `0.4.0` (awaiting user approval before any `git commit` per `AGENTS.md`).

---

## Notes

- Zero external runtime dependencies are permitted inside `src/engine/`.
- Maintain full backward compatibility with `tests/smoke.test.ts` and `tests/dataPipeline.test.ts`.
- In test files (`tests/`), remember `tsconfig.app.json` does not include `@types/node`: read local JSON/CSV fixtures via `import.meta.url` + typed dynamic imports (`node:fs`, `node:path`, `node:url`) so `pnpm build` (`tsc -b`) passes cleanly without altering tsconfig.

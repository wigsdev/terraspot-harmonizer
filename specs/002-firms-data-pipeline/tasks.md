# Tasks: NASA FIRMS Spatiotemporal Data Pipeline & Benchmark Cubes

**Input**: Design documents from `/specs/002-firms-data-pipeline/` (`plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `research.md`, `data-model.md`, `contracts/`  
**Feature Branch**: `feat/T-03-pipeline-datos-firms`  

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Exact file paths are included in every task description

---

## Phase 1: Setup (Shared Infrastructure & Output Directories)

**Purpose**: Initialize data output directory structure and Python script skeleton with PEP 723 metadata (`FR-001`).

- [x] T001 Ensure `public/data/` directory exists and initialize `scripts/build_harmonized_cubes.py` with PEP 723 inline script metadata (`requires-python = ">=3.10"`, `dependencies = []`), deterministic PRNG seed (`SEED = 202615`), and CLI argument parser (`--verify`, `--output-dir`).
- [x] T002 [P] Synchronize TypeScript contracts in `src/types/harmonization.ts`, `src/types/region.ts`, and `src/types/firms.ts` with `specs/002-firms-data-pipeline/data-model.md` (`RegionsCatalogDocument`, `RegionCube`, `ValidationMetrics`, `MonthlyClimatology`, `SpatialGridCellSummary`, `SpatialCellsDocument`, and extended `HarmonizedMonthlyRecord` fields `sensor_era`, `beta_factor`, `p25_hotspots`, `p75_hotspots`, `p90_threshold`).

---

## Phase 2: Foundational (Core Data Structures & Benchmark Region Metadata)

**Purpose**: Define canonical data classes and the 5 benchmark Areas of Interest (`FR-006`) that all pipeline stages and user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Define Python `@dataclass` models in `scripts/build_harmonized_cubes.py` for `RawFirmsDetection`, `ActiveFireCellDay`, `HarmonizedMonthlyRecord`, `MonthlyClimatology`, `ValidationMetrics`, `RegionCube`, and `SpatialGridCellSummary` enforcing field constraints from `data-model.md`.
- [x] T004 Configure the 5 benchmark regional definitions in `scripts/build_harmonized_cubes.py` matching `docs/04-firms-data-specification.md` (`PE-HCO` Huánuco `Lat: [-10.60, -8.40], Lon: [-77.10, -74.40]`; `SAM-MAP` Southern Amazon `Lat: [-13.50, -8.50], Lon: [-71.50, -60.00]`; `AR-PAR` Paraná Delta / Gran Chaco `Lat: [-34.20, -25.50], Lon: [-62.00, -57.20]`; `US-CAL` California Sierra `Lat: [36.00, 41.50], Lon: [-123.80, -118.50]`; `AU-NSW` New South Wales `Lat: [-37.50, -31.50], Lon: [147.00, 152.50]`) with seasonal phenology weights, drought anomaly years, and FRP/nocturnal regime signatures.

**Checkpoint**: Foundation ready — core schemas and benchmark region metadata are established.

---

## Phase 3: User Story 2 - Radiometric Quality Masking & False-Positive Rejection (Priority: P2 — Stage 1 Ingreso)

**Goal**: Implement Stage 1 radiometric filtering (`type == 0`, sensor confidence masks) and diurnal fraction calculation (`FR-002`) so raw detections are cleaned before spatial binning.

**Independent Test**: Pass mixed detections (`type` in `{0, 1, 2, 3}`, MODIS confidence `0–100`, VIIRS confidence `'l'`, `'n'`, `'h'`) into `filter_quality_detections()` in `scripts/build_harmonized_cubes.py` and verify 100% rejection of non-vegetation and low-confidence records.

### Implementation for User Story 2

- [x] T005 [US2] Implement Stage 1 quality filter function `is_valid_vegetation_fire(record)` in `scripts/build_harmonized_cubes.py` retaining exclusively `type == 0` and sensor-specific confidence (`MODIS >= 30`, `VIIRS in {'n', 'h'}` case-insensitive) (`FR-002`).
- [x] T006 [US2] Implement CSV stream parser `parse_raw_firms_csv(csv_path)` in `scripts/build_harmonized_cubes.py` that reads 15-column NASA FIRMS CSV rows, applies Stage 1 filtering, and tracks rejected noise statistics (`FR-002`).
- [x] T007 [US2] Implement diurnal cycle aggregator in `scripts/build_harmonized_cubes.py` to compute monthly nighttime detection fraction `night_fraction` ($f_{\text{night}} \in [0.0, 1.0]$ from `daynight == 'N'`) and 90th-percentile FRP (`p90_frp_mw`) (`FR-002`, `FR-005`).

**Checkpoint**: Stage 1 radiometric quality filtering and diurnal persistence extraction are operational.

---

## Phase 4: User Story 1 - Pre-Computed Multi-Decadal Regional Fire Cubes (Priority: P1) 🎯 MVP

**Goal**: Implement Stage 2 ($0.01^\circ$ AFCD binning), Stage 3 ($\beta_m$ seasonal cross-calibration & 3-era synthesis with $R^2 > 0.90$), and Stage 4 (2001–2025 non-parametric climatology & Fire Regime Index $I_{\text{regime}}$), outputting `public/data/regions_catalog.json` (`FR-003`, `FR-004`, `FR-005`, `FR-006`).

**Independent Test**: Run `python3 scripts/build_harmonized_cubes.py --verify` and confirm `public/data/regions_catalog.json` contains all 5 regions, 322 monthly records (`2000-01` to `2026-10`) per region, $R^2 > 0.90$, and zero `NaN`/`null` values.

### Implementation for User Story 1

- [x] T008 [US1] Implement Stage 2 spatial grid binning `aggregate_to_afcd_grid(detections)` in `scripts/build_harmonized_cubes.py` using deterministic floor indexing ($g_x = \lfloor \text{lon} \times 100 \rfloor$, $g_y = \lfloor \text{lat} \times 100 \rfloor$) to collapse contiguous same-day detections into Active Fire Cell-Days (`afcd_modis`, `afcd_viirs`) and cell-level mean FRP (`FR-003`).
- [x] T009 [US1] Implement Stage 3 seasonal cross-calibration `compute_seasonal_beta(monthly_afcd)` in `scripts/build_harmonized_cubes.py` over the 14-year overlap window (`2012–2025`) with Laplace smoothing ($\lambda = 1.0$) for months $1 \dots 12$ (`FR-004`).
- [x] T010 [US1] Implement Stage 3 three-era temporal synthesis `synthesize_harmonized_series()` and goodness-of-fit calculator (`r_squared`, `pearson_r`, `raw_mape_pct`, `harmonized_mape_pct`, `mape_reduction_pct`) in `scripts/build_harmonized_cubes.py` enforcing $w_V = 0.70, w_M = 0.30$ and verifying $R^2 > 0.90$ (`FR-004`, `SC-002`).
- [x] T011 [US1] Implement Stage 4 non-parametric climatology calculator in `scripts/build_harmonized_cubes.py` over complete baseline years `2001–2025` to derive $\widetilde{M}_m$, $P_{25,m}$, $P_{75,m}$, $P_{90,m}$, percentage anomaly $\Delta\%_{y,m}$, and robust interquartile $Z$-score $Z_{y,m}$ (`FR-005`).
- [x] T012 [US1] Implement Stage 4 Fire Regime Intensity Index calculator in `scripts/build_harmonized_cubes.py` ($I_{\text{regime}} = 0.60 \cdot \min(100, \frac{P_{90}(\text{FRP})}{80}\times 100) + 0.40 \cdot \min(100, \frac{f_{\text{night}}}{0.35}\times 100)$) classifying each month into `'AGRICULTURAL_BURN'` ($0\text{--}35$), `'TRANSITIONAL'` ($36\text{--}65$), or `'SEVERE_WILDFIRE'` ($66\text{--}100$) (`FR-005`).
- [x] T013 [US1] Generate and serialize `public/data/regions_catalog.json` via `scripts/build_harmonized_cubes.py` containing all 5 benchmark regions and 322 monthly records (`2000-01` to `2026-10`) per region (`FR-006`, `SC-003`).

**Checkpoint**: User Story 1 (`public/data/regions_catalog.json`) is generated and verified.

---

## Phase 5: User Story 3 - Standardized Sample FIRMS CSV & Spatial Grid Overlay Generation (Priority: P3)

**Goal**: Generate the RFC 4180 raw NASA FIRMS CSV fixture for Huánuco (`public/data/sample_firms_huanuco.csv`) and the $0.01^\circ$ spatial cell summary bundle (`public/data/firms_spatial_cells.json`) (`FR-007`, `FR-008`).

**Independent Test**: Verify `public/data/sample_firms_huanuco.csv` parses cleanly through `parse_raw_firms_csv()` (filtering out intentional `type != 0` / low-confidence noise rows) and verify `public/data/firms_spatial_cells.json` contains valid $0.01^\circ$ centroids across all 5 benchmark bounding boxes.

### Implementation for User Story 3

- [x] T014 [P] [US3] Implement `generate_sample_firms_huanuco_csv()` in `scripts/build_harmonized_cubes.py` outputting `public/data/sample_firms_huanuco.csv` with the 15 official NASA FIRMS columns, realistic MODIS/VIIRS detections in `PE-HCO` (`Lat: [-10.60, -8.40], Lon: [-77.10, -74.40]`), and ~5% controlled noise rows (`type in {1, 2, 3}` and `confidence < 30` / `'l'`) (`FR-008`).
- [x] T015 [P] [US3] Implement `generate_spatial_cells_json()` in `scripts/build_harmonized_cubes.py` outputting `public/data/firms_spatial_cells.json` with $0.01^\circ$ cell centroids (`lat`, `lon`), `total_afcd`, `peak_month`, `mean_frp_mw`, `p90_frp_mw`, `night_fraction`, `regime_class`, and `yearly_afcd` across the 5 benchmark regions (`FR-007`).
- [x] T016 [US3] Implement self-verification routine `--verify` in `scripts/build_harmonized_cubes.py` that round-trip parses `public/data/sample_firms_huanuco.csv` through Stage 1 & Stage 2 and validates all invariants in `regions_catalog.json` and `firms_spatial_cells.json` (`SC-001` through `SC-005`).

**Checkpoint**: All 3 data artifacts (`regions_catalog.json`, `firms_spatial_cells.json`, `sample_firms_huanuco.csv`) are generated and self-verified.

---

## Phase 6: Polish, Automated Contract Testing & Cross-Cutting Concerns

**Purpose**: End-to-end validation with Vitest, bundle size verification, and documentation/version alignment.

- [x] T017 Execute `python3 scripts/build_harmonized_cubes.py --verify` and `uv run scripts/build_harmonized_cubes.py --verify` confirming byte-for-byte deterministic reproducibility (`SC-005`) and execution time `< 5 seconds` (`SC-001`).
- [x] T018 [P] Create Vitest data contract & mathematical validation suite in `tests/dataPipeline.test.ts` testing `public/data/regions_catalog.json`, `public/data/firms_spatial_cells.json`, and `public/data/sample_firms_huanuco.csv` against `specs/002-firms-data-pipeline/contracts/` schemas, verifying 5 regions × 322 records, $R^2 > 0.90$, MAPE reduction `> 65%`, and payload size `< 2.5 MB` (`SC-002`, `SC-003`, `SC-004`).
- [x] T019 Run `pnpm typecheck`, `pnpm test:run`, and `pnpm build` to verify 100% test pass rate and zero compilation errors.
- [x] T020 Bump version in `package.json` to `0.3.0` and document `T-03` deliverables in `CHANGELOG.md` under `[0.3.0] - 2026-11-14`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately (`T001`, `T002`).
- **Phase 2 (Foundational)**: Depends on Phase 1 (`T003`, `T004`) — BLOCKS all user stories.
- **Phase 3 (US2 - Stage 1 Quality Masking)**: Depends on Phase 2 (`T005`–`T007`).
- **Phase 4 (US1 - Stage 2–4 Regional Cubes MVP)**: Depends on Phase 3 (`T008`–`T013`).
- **Phase 5 (US3 - Sample CSV & Spatial Grid Overlay)**: Depends on Phase 3 & Phase 4 (`T014`–`T016`).
- **Phase 6 (Polish & Contract Testing)**: Depends on Phases 3–5 (`T017`–`T020`).

### Parallel Opportunities

- `T001` and `T002` (Python setup vs. TypeScript contract synchronization) can run in parallel `[P]`.
- `T014` and `T015` (`sample_firms_huanuco.csv` generation vs. `firms_spatial_cells.json` generation) can run in parallel `[P]`.
- `T018` (`tests/dataPipeline.test.ts`) validates all generated outputs independently.

---

## Implementation Strategy

### MVP First (User Stories 2 + 1)
1. Complete Phase 1 & Phase 2 (Data models & 5 benchmark region configs).
2. Complete Phase 3 (Stage 1 quality filter) and Phase 4 (Stages 2–4 harmonized cubes in `public/data/regions_catalog.json`).
3. Validate $R^2 > 0.90$ and 322 monthly records per region.

### Full Delivery (Add User Story 3 & Vitest Suite)
1. Complete Phase 5 (`public/data/sample_firms_huanuco.csv` and `public/data/firms_spatial_cells.json`).
2. Complete Phase 6 (`tests/dataPipeline.test.ts`, `pnpm test:run`, `pnpm build`, and `CHANGELOG.md` update to `0.3.0`).

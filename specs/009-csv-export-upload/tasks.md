# Tasks: Standardized CSV Exporter and Custom NASA FIRMS CSV Ingestion

**Input**: Design documents from `specs/009-csv-export-upload/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Feature Branch**: `feat/T-10-csv-export-upload`  
**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`, `contracts/`  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions, data contracts, and bilingual localization dictionaries.

- [X] T001 [P] Define `StandardizedHarmonizedRow`, `RawFIRMSPoint`, `FIRMSValidationReport`, and exporter options interfaces in `src/types/csv.ts` and re-export in `src/types/index.ts`. Quote verbatim constraints: 27 columns, `type == 0` for vegetation, nominal/high confidence, explicit sign for `anomaly_percent` (`+77.17%`).
- [X] T002 [P] Extend `src/types/language.ts` with modal and export dictionary keys and populate complete English and Spanish translations in `src/context/LanguageContext.tsx` (dropzone prompts, validation report cards, errors, export buttons, and custom data badges).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state management infrastructure required for dynamic custom cube injection.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Extend `src/context/RegionContext.tsx` with custom data cube state (`customCube: RegionCube | null`, `setCustomCube: (cube: RegionCube) => void`, `clearCustomCube: () => void`, and `isCustomActive: boolean`), allowing active components to consume custom in-memory cubes seamlessly with instant fallback to benchmark regions.

**Checkpoint**: Foundation ready — user story implementation can now proceed.

---

## Phase 3: User Story 1 - One-Click Download of Standardized 27-Column Harmonized Analytical CSV Dataset (Priority: P1) 🎯 MVP

**Goal**: Generate and trigger client-side download of an RFC 4180 compliant CSV containing exactly the 27 canonical columns for the active data cube, formatted for immediate analytical ingestion into Python (`pandas`), R, QGIS, or Excel.

**Independent Test**: Run `pnpm test:run tests/csvExporter.test.ts` and verify that generated CSV contains exact 27 canonical column headers, formatted numbers (+ signs on anomalies, 2 decimals for Z-score), STAC spatial bounds, and triggers browser download via Blob.

### Tests for User Story 1 ⚠️
- [X] T004 [P] [US1] Create unit tests for RFC 4180 serialization, 27 canonical headers, number formatting, and browser download trigger in `tests/csvExporter.test.ts`.

### Implementation for User Story 1
- [X] T005 [US1] Implement RFC 4180 CSV serialization engine (`exportHarmonizedCSV`) with canonical 27 columns and Blob download trigger (`downloadHarmonizedCSV`) in `src/engine/csvExporter.ts`.
- [X] T006 [US1] Re-export `exportHarmonizedCSV`, `downloadHarmonizedCSV`, and `CANONICAL_CSV_HEADERS` in `src/engine/index.ts`.
- [X] T007 [US1] Integrate "Download Harmonized CSV" action button with responsive tooltip and icon into `src/components/Navbar.tsx` calling `downloadHarmonizedCSV(currentRegion)`.

**Checkpoint**: User Story 1 is functional and testable independently (MVP reached).

---

## Phase 4: User Story 2 - Client-Side Drag-and-Drop Ingestion & In-Memory Validation of NASA FIRMS CSV Files (Priority: P2)

**Goal**: Parse and validate raw NASA FIRMS CSV files (MODIS C6.1 and VIIRS 375m C2) client-side in browser memory using `PapaParse`, applying Stage 1 radiometric quality filtering (`type == 0` and nominal/high confidence) and generating structured validation reports.

**Independent Test**: Run `pnpm test:run tests/firmsIngestion.test.ts` and verify that parsing valid and corrupted CSV data returns accurate `FIRMSValidationReport`, filtering non-vegetation records and computing bounding box.

### Tests for User Story 2 ⚠️
- [X] T008 [P] [US2] Create unit tests for PapaParse parsing, header normalization, validation reports, and Stage 1 vegetation filtering in `tests/firmsIngestion.test.ts`.

### Implementation for User Story 2
- [X] T009 [US2] Implement client-side PapaParse parser (`parseFIRMSCSV`), header normalizer, coordinate validator, and Stage 1 quality masking (`filterVegetationHotspots`) in `src/engine/firmsIngestion.ts`.
- [X] T010 [US2] Re-export `parseFIRMSCSV` and validation helpers in `src/engine/index.ts`.

**Checkpoint**: User Stories 1 AND 2 work independently.

---

## Phase 5: User Story 3 - Instant Dynamic Dashboard Re-Harmonization & Sample Dataset Benchmark Testing (Priority: P3)

**Goal**: Provide an accessible drag-and-drop modal (`CustomCSVModal.tsx`) with a one-click "Load Sample Dataset" feature (`sample_firms_huanuco.csv`), aggregate daily $0.01^\circ$ AFCD cells, apply seasonal calibration, dynamically re-render the dashboard, and support resetting to default benchmarks.

**Independent Test**: Run `pnpm test:run tests/CustomCSVModal.test.tsx` and verify modal dialog semantics, keyboard navigation (`Escape`), "Load Sample Dataset" execution, cube synthesis, and reset actions.

### Tests for User Story 3 ⚠️
- [X] T011 [P] [US3] Create integration tests for accessible modal dialog, drag-and-drop, sample dataset loading, and reset in `tests/CustomCSVModal.test.tsx`.

### Implementation for User Story 3
- [X] T012 [US3] Implement `synthesizeHarmonizedCubeFromFIRMS` for daily $0.01^\circ$ AFCD grid binning, monthly raw/cell counts, and seasonal $\beta_m$ calibration in `src/engine/firmsIngestion.ts`.
- [X] T013 [US3] Implement accessible drag-and-drop modal component with sample loader, file input, and validation telemetry cards in `src/components/CustomCSVModal.tsx`.
- [X] T014 [US3] Mount "Upload FIRMS CSV" button and persistent "Custom Data Active" badge with reset button in `src/components/Navbar.tsx`.
- [X] T015 [US3] Mount `CustomCSVModal` in `src/App.tsx`, providing custom cube injection into `RegionContext`, verifying reactive updates across KPI cards, calendar matrix, and charts, and ensuring resetting custom data restores original AOI cartographic bounds in `MapAOISelector`.

**Checkpoint**: User Stories 1, 2, and 3 are functional and integrated.

---

## Phase 6: User Story 4 - Geospatial STAC & Climatological Fire Weather Reference Verification (Priority: P4)

**Goal**: Ensure exported CSV metadata and modal diagnostics conform to Microsoft Planetary Computer STAC spatial schemas and reference Meteomatics fire weather indicators.

**Independent Test**: Verify that exported CSV includes standard STAC bounding box coordinates (`bbox_min_lat`, `bbox_max_lat`, `bbox_min_lon`, `bbox_max_lon`) and modal displays complementary fire weather indicator data from `public/data/meteomatics_weather.json`.

- [X] T016 [US4] Integrate live Meteomatics fire weather indicator metrics (`public/data/meteomatics_weather.json`) as complementary contextual telemetry cards inside `src/components/CustomCSVModal.tsx`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Test coverage validation, performance verification, type checking, and documentation.

- [X] T017 [P] Update unit test suites in `tests/Navbar.test.tsx` and `tests/App.test.tsx` to verify modal trigger buttons, export buttons, and custom data indicator badges.
- [X] T018 Execute full typecheck (`pnpm typecheck`), run entire test suite (`pnpm test:run`), and verify zero warnings during production build (`pnpm build`).
- [X] T019 [P] Update project documentation in `docs/backlog.md` (mark T-10 completed) and prepare release notes entry in `CHANGELOG.md` under `[0.10.0]`.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories.
- **Phase 3 (User Story 1 - P1)**: Depends on Phase 2. Can be delivered as standalone MVP.
- **Phase 4 (User Story 2 - P2)**: Depends on Phase 2. Independent of US1.
- **Phase 5 (User Story 3 - P3)**: Depends on Phase 4 (uses parser and synthesis).
- **Phase 6 (User Story 4 - P4)**: Depends on Phase 5.
- **Phase 7 (Polish)**: Depends on all user stories being implemented.

### Parallel Opportunities
- T001 and T002 can run in parallel (different files).
- T004 (US1 tests) and T008 (US2 tests) can run in parallel.
- T017 and T019 can run in parallel during polish.

---

## Implementation Strategy: MVP First

1. **Step 1:** Implement Setup (T001, T002) & Foundational (T003).
2. **Step 2:** Implement User Story 1 (T004–T007) → Deliver standalone 27-column CSV Exporter (MVP).
3. **Step 3:** Implement User Story 2 (T008–T010) → Deliver in-browser FIRMS Parser & Validator.
4. **Step 4:** Implement User Story 3 (T011–T015) → Deliver accessible Modal, Sample Loader & Re-Harmonization.
5. **Step 5:** Implement User Story 4 (T016) → Integrate Meteomatics fire weather context.
6. **Step 6:** Polish, run tests, and prepare SemVer `v0.10.0` (T017–T019).

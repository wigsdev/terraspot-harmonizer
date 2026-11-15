# Tasks: Fire Regime Diagnostic Classifier (`FireRegimePanel.tsx`)

**Input**: Design documents from `specs/008-fire-regime-classifier/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`)  
**Prerequisites**: `plan.md` (required), `spec.md` (required for user stories), `data-model.md`, `contracts/`  
**Tests**: Unit & component test suite in `tests/FireRegimePanel.test.tsx` and integration in `tests/App.test.tsx` explicitly specified.  
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define TypeScript types, contracts, and export barrel files.

- [X] T001 [P] Define fire regime interfaces (`FireRegimePoint`, `FireRegimeScatterData`, `FireRegimeDistribution`, `OperationalAgencyAdvice`, `FireRegimeMitigationPackage`) in `src/types/regime.ts`
- [X] T002 Re-export regime contracts in `src/types/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core calculation engine, data transformation utilities, and bilingual translation strings that MUST be complete before UI components can be built.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Implement core fire regime data transformation functions (`generateFireRegimeScatterData`, `computeFireRegimeDistribution`, `generateOperationalMitigation`) in `src/engine/fireRegime.ts`
- [X] T004 Re-export fire regime engine functions in `src/engine/index.ts`
- [X] T005 [P] Add complete bilingual translation dictionary (`EN`/`ES`) for fire regime classifications, quadrant thresholds, tooltips, and operational mitigations in `src/types/language.ts` and `src/context/LanguageContext.tsx`

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Interactive 2D Fire Regime Scatter Plot & Quadrants (Priority: P1) 🎯 MVP

**Goal**: Render the 2D Recharts Scatter Plot in `FireRegimePanel.tsx` mapping Mean FRP (MW) against Nocturnal Combustion Persistence ($f_{\text{night}}$) across three operational quadrants, with reference boundary lines, shaded background zones, active year highlight, and aerospace dark telemetry tooltips.

**Independent Test**: Mount `FireRegimePanel.tsx` with active AOI data cube. Verify that historical monthly points render in their respective quadrant series (Agricultural, Transitional, Severe Wildfire), reference threshold lines render at $X = 25, 45\text{ MW}$ and $Y = 0.10, 0.20$, and hovering displays an aerospace dark telemetry tooltip.

### Tests for User Story 1

- [X] T006 [P] [US1] Create unit tests for scatter data transformation, zero-fire filtering, and quadrant point assignment in `tests/FireRegimePanel.test.tsx`

### Implementation for User Story 1

- [X] T007 [US1] Implement `FireRegimePanel.tsx` scatter plot shell with Recharts `ScatterChart`, `ResponsiveContainer`, `XAxis`, `YAxis`, `ZAxis`, `Scatter`, `ReferenceArea`, and `ReferenceLine` in `src/components/FireRegimePanel.tsx`
- [X] T008 [US1] Implement custom aerospace dark telemetry tooltip (`CustomRegimeTooltip`) and active year dot highlighting in `src/components/FireRegimePanel.tsx`
- [X] T009 [US1] Re-export `FireRegimePanel` in `src/components/index.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently as an MVP.

---

## Phase 4: User Story 2 - Historical Regime Distribution Percentage Breakdown (Priority: P2)

**Goal**: Display statistical distribution cards showing historical frequency counts and percentage breakdown (% Agricultural, % Transitional, % Severe Wildfires), dominant regime badge, and multi-year average regime index ($\overline{I}_{\text{regime}}$) for the active AOI.

**Independent Test**: Verify summary cards render with correct percentages summing to $100\%$ (of active fire months) and update reactively when switching AOIs in $< 50\text{ ms}$.

### Tests for User Story 2

- [X] T010 [P] [US2] Add unit tests for historical distribution percentage calculation and edge case handling (zero-fire months, incomplete future months) in `tests/FireRegimePanel.test.tsx`

### Implementation for User Story 2

- [X] T011 [US2] Implement historical regime distribution cards and dominant regime badge in `src/components/FireRegimePanel.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Multi-Agency Operational Mitigation Recommendations (Priority: P3)

**Goal**: Present context-aware tactical recommendations for Civil Defense, Park Rangers, and Agricultural Authorities adapting to active year peak regime severity.

**Independent Test**: Verify that when active year exhibits severe wildfire months, alert posture elevates to EMERGENCY with specific tactical actions in both EN and ES.

### Tests for User Story 3

- [X] T012 [P] [US3] Add unit tests for operational mitigation generation, posture levels, and language toggling in `tests/FireRegimePanel.test.tsx`

### Implementation for User Story 3

- [X] T013 [US3] Implement multi-agency recommendation cards and alert status header in `src/components/FireRegimePanel.tsx`

**Checkpoint**: All three user stories are now independently functional and verified.

---

## Phase 6: Integration, Polish & Cross-Cutting Concerns

**Purpose**: Mount the completed component in `src/App.tsx`, verify bidirectional synchronization, run regression tests, and validate production build.

- [X] T014 Mount `FireRegimePanel` in `src/App.tsx` directly beneath `SensorHarmonizationAudit` with bidirectional year synchronization
- [X] T015 [P] Update end-to-end integration tests in `tests/App.test.tsx` to verify `FireRegimePanel` mounting and interaction
- [X] T016 Verify strict TypeScript compilation (`pnpm typecheck`) and Vitest test suite (`pnpm test:run`)
- [X] T017 Verify static production build bundle (`pnpm build`)
- [X] T018 Run quickstart validation scenarios from `specs/008-fire-regime-classifier/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately (T001, T002).
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories (T003, T004, T005).
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion — delivers core MVP scatter plot (T006 to T009).
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion — can integrate with US1 scatter panel (T010, T011).
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion — renders mitigation advice (T012, T013).
- **Integration & Polish (Phase 6)**: Depends on all user stories being complete (T014 to T018).

### Parallel Opportunities

- `T001` (types) and `T005` (language translations) can be drafted in parallel.
- `T006`, `T010`, and `T012` unit test blocks can be developed in parallel before component integration.
- `T014` and `T015` run during the integration phase.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 (T001, T002) and Phase 2 (T003, T004, T005).
2. Complete Phase 3 (T006, T007, T008, T009).
3. Validate User Story 1 independently with `pnpm test:run tests/FireRegimePanel.test.tsx`.

### Incremental Delivery
1. Add User Story 2 (T010, T011) → Test distribution cards.
2. Add User Story 3 (T012, T013) → Test mitigation recommendations.
3. Integrate into `src/App.tsx` (T014, T015).
4. Run full quality gates: `pnpm typecheck`, `pnpm test:run`, `pnpm build` (T016, T017, T018).

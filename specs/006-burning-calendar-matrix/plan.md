# Implementation Plan: Interactive Burning Activity Calendar Matrix

**Branch**: `feat/T-07-matriz-calendario` | **Date**: 2026-11-15 | **Spec**: [`specs/006-burning-calendar-matrix/spec.md`](spec.md)  
**Input**: Feature specification from `specs/006-burning-calendar-matrix/spec.md` (Requirements R2, R4, R5, R6).

---

## Summary

Deliver the primary scientific visualization mandated by **NASA Challenge 15 (Requirement R2)**: the interactive 27-year (2000–2026) × 12-month (Jan–Dec) **Burning Activity Calendar Matrix** (`BurningCalendarMatrix.tsx`). The matrix provides 4 analytical projections (*Harmonized Frequency*, *Climatological Anomaly*, *Fire Radiative Power*, and *Raw Unharmonized Counts*), colorblind-safe palettes (Inferno, Viridis, Cividis, Diverging), sensor era grouping brackets, marginal annual sums and monthly baseline medians, critical anomaly badges ($P_{90}$ / $Z \ge 2.0$), and rich hover tooltips with click synchronization.

---

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict Mode) / Node.js `v24.x` / React 19  
**Primary Dependencies**: React 19, Lucide React, Tailwind CSS v4, existing `src/engine/` utilities (`harmonizer.ts`, `colorRamps.ts`, `kpiCalculator.ts`)  
**Storage**: Client-side state in `RegionContext` and static JSON cubes in `public/data/regions_catalog.json`  
**Testing**: Vitest 5.1+, Testing Library React 16+, `@testing-library/jest-dom`  
**Target Platform**: Modern desktop, tablet, and mobile browsers (Chromium, Firefox, Safari)  
**Project Type**: Web Application (Single-Page App via Vite 6)  
**Performance Goals**: Matrix initial render $< 50\text{ ms}$, cell hover/focus response $< 16\text{ ms}$ (60 FPS)  
**Constraints**: Zero backend runtime dependencies, 100% WCAG 2.1 AA text contrast ($\ge 4.5:1$), responsive horizontal scrolling on compact viewports  
**Scale/Scope**: 322 active observation cells (27 rows × 12 columns, 2 pending future cells), 5 benchmark areas of interest  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle / Rule | Compliance Status | Evidence in Plan |
|---|:---:|---|
| **I. Dual-Language & Communication Protocol** | ✅ PASS | All code, comments, interfaces, and docs in English; UI supports bilingual `EN / ES` toggling; communications with `@wigsdev` 100% in Spanish. |
| **II. Package Strictness (`pnpm` only)** | ✅ PASS | Exclusively `pnpm` (`pnpm 12.21.0`), zero usage of `npm`/`yarn`. |
| **III. Mathematical Harmonization Rigor** | ✅ PASS | Directly consumes calibrated $H_{y,m}$, baseline medians ($M_m$), $P_{90}$ thresholds, and robust $Z$-scores derived from Stages 1–4 of `docs/02-modis-viirs-harmonization-methodology.md`. Includes raw unharmonized mode demonstrating elimination of 2012 step-jump. |
| **IV. Universal Visual Accessibility (WCAG 2.1 AA)** | ✅ PASS | Certified 4 colorblind-safe ramps (`inferno`, `viridis`, `cividis`, `diverging`), no red-green scales, relative luminance dynamic text color resolver guaranteeing $\text{contrast} \ge 4.5:1$. |
| **V. NASA Space Apps Compliance** | ✅ PASS | Fulfills Requirement R2 & R4; zero unauthorized NASA logos generated. |
| **VI. SDD Lifecycle & Commit Gatekeeping** | ✅ PASS | Executed under `specs/006-burning-calendar-matrix/`; zero automatic commits or pushes without explicit approval. |

---

## Project Structure

### Documentation (`specs/006-burning-calendar-matrix/`)

```text
specs/006-burning-calendar-matrix/
├── spec.md              # Feature specification (FR-001 to FR-010, SC-001 to SC-005)
├── checklists/
│   └── requirements.md  # Quality validation checklist (completed)
├── plan.md              # This implementation plan
├── research.md          # Phase 0 research & architectural decisions
├── data-model.md        # Phase 1 data entities and summary models
├── quickstart.md        # Phase 1 verification scenarios
└── contracts/           # Phase 1 interface contracts
    ├── burning-calendar-matrix.contract.ts
    └── matrix-engine.contract.ts
```

### Source Code (`src/` & `tests/`)

```text
src/
├── types/
│   ├── matrix.ts                     # CalendarMatrixViewMode, CalendarCellData, summaries
│   └── index.ts                      # Re-export matrix types
├── engine/
│   ├── calendarMatrix.ts             # Matrix grid generation, cell styling, and marginal summaries
│   └── index.ts                      # Re-export calendarMatrix engine
├── components/
│   ├── BurningCalendarMatrix.tsx     # Core interactive 27 × 12 calendar matrix component
│   └── index.ts                      # Re-export BurningCalendarMatrix
└── App.tsx                           # Mount BurningCalendarMatrix below MapAOISelector

tests/
├── BurningCalendarMatrix.test.tsx    # Unit & component test suite (US1, US2, US3)
└── App.test.tsx                      # End-to-end integration test
```

---

## Execution Phases

### Phase 0: Outline & Research (Completed)
- Completed `specs/006-burning-calendar-matrix/research.md`:
  - Evaluated CSS Grid vs Canvas/SVG -> Selected CSS Grid with semantic ARIA grid roles.
  - Formulated 4-mode normalization curves and diverging anomaly mapping.
  - Defined 3-era sensor brackets and 2026 future-month safeguards.

### Phase 1: Design & Contracts (Completed)
- Completed `specs/006-burning-calendar-matrix/data-model.md`.
- Completed `specs/006-burning-calendar-matrix/contracts/burning-calendar-matrix.contract.ts`.
- Completed `specs/006-burning-calendar-matrix/contracts/matrix-engine.contract.ts`.
- Completed `specs/006-burning-calendar-matrix/quickstart.md`.

### Phase 2: Task Breakdown (Completed)
- Generated by `/speckit-tasks` into `specs/006-burning-calendar-matrix/tasks.md` (26 tasks).

### Phase 3–5: Implementation & Verification (Completed)
- User Story 1 (P1 MVP): 27 × 12 CSS Grid, sensor eras, marginal summaries.
- User Story 2 (P2): 4-mode switcher, diverging palette lock, critical anomaly badges, raw step-jump audit.
- User Story 3 (P3): Interactive telemetry tooltips, cell selection, WAI-ARIA keyboard navigation.

### Phase 6: Polish, Responsive Ergonomics & Integration (Completed)
- Standardized uniform sensor era chips (`w-13 sm:w-14.5 h-5`) and continuous timeline tracks.
- Responsive toolbar optimization: 2×2 grid on mobile/tablet, 4-column single-line on 1024px desktop (`lg:grid-cols-4`), compact horizontal on wide desktop (`xl:`).
- Re-exported from `src/components/index.ts` and mounted into `src/App.tsx`.
- 100% test pass rate (71/71 tests) and clean production build.

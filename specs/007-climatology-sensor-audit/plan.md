# Implementation Plan: Climatological Anomaly Curves & Sensor Harmonization Audit Panels

**Branch**: `feat/T-08-curvas-anomalias-sensores` | **Date**: 2026-11-15 | **Spec**: [`specs/007-climatology-sensor-audit/spec.md`](spec.md)  
**Input**: Feature specification from `specs/007-climatology-sensor-audit/spec.md` (Requirements R1, R5).

---

## Summary

Deliver the scientific validation and climatological anomaly diagnostic panels mandated by **NASA Challenge 15 (Requirements R1 and R5)**:
1. **`ClimatologyAnomalyChart.tsx`**: Plots the active year's monthly fire trajectory (Jan–Dec) superimposed against the **Multi-Year Climatological Median (2001–2025)** ($M_m$), the shaded interquartile range envelope ($P_{25}\text{--}P_{75}$), and the critical disaster threshold ($P_{90}$) with Recharts, interactive year selection, and bidirectional synchronization with `BurningCalendarMatrix`.
2. **`SensorHarmonizationAudit.tsx`**: Renders the complete multi-decadal time series ($2000\text{--}2026$, 322 points) comparing raw MODIS (1 km), raw VIIRS (375 m), $0.01^\circ$ active fire cell-days (AFCD), and the **Final Bias-Corrected Harmonized Series ($H_{y,m}$)**, accompanied by 4 statistical model fit scorecards ($R^2$, Pearson $r$, MAPE reduction $\ge 65\%$, RMSE) and the 12-month regional scaling factor breakdown ($\beta_1 \dots \beta_{12}$).

---

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict Mode) / Node.js `v24.x` / React 19  
**Primary Dependencies**: React 19, Lucide React, Recharts `^2.15.0`, Tailwind CSS v4, existing `src/engine/` utilities (`harmonizer.ts`, `colorRamps.ts`, `calendarMatrix.ts`)  
**Storage**: Client-side state via `RegionContext` and pre-computed static JSON cubes in `public/data/regions_catalog.json`  
**Testing**: Vitest 5.1+, Testing Library React 16+, `@testing-library/jest-dom`  
**Target Platform**: Modern desktop, tablet, and mobile browsers (Chromium, Firefox, Safari)  
**Project Type**: Web Application (Single-Page App via Vite 6)  
**Performance Goals**: Chart initial render & AOI update $< 50\text{ ms}$, hover crosshair/tooltip response $< 16\text{ ms}$ (60 FPS)  
**Constraints**: Zero backend runtime dependencies, 100% WCAG 2.1 AA text contrast ($\ge 4.5:1$), responsive SVG containers (`ResponsiveContainer`), colorblind-safe palettes  
**Scale/Scope**: 12 monthly climatological points, 322 historical time series observations, 5 benchmark areas of interest  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle / Rule | Compliance Status | Evidence in Plan |
|---|:---:|---|
| **I. Dual-Language & Communication Protocol** | ✅ PASS | All code, comments, interfaces, and docs in English; UI supports bilingual `EN / ES` toggling; communications with `@wigsdev` 100% in Spanish. |
| **II. Package Strictness (`pnpm` only)** | ✅ PASS | Exclusively `pnpm` (`pnpm 12.21.0`), zero usage of `npm`/`yarn`. |
| **III. Mathematical Harmonization Rigor** | ✅ PASS | Direct visualization of Stage 3 empirical calibration ratios ($\beta_m$) and Stage 4 climatological medians ($M_m$). Explicitly proves elimination of the 2012 step-jump ($R^2 > 0.90$, MAPE reduction $> 65\%$). |
| **IV. Universal Visual Accessibility (WCAG 2.1 AA)** | ✅ PASS | Colorblind-safe palettes (Inferno, Viridis, Cividis, Diverging), high-contrast labels over aerospace dark background (`#0B0F17`), relative text contrast $\ge 4.5:1$. |
| **V. NASA Space Apps Compliance** | ✅ PASS | Fulfills Challenge 15 Requirements R1 & R5; zero unauthorized NASA logos generated. |
| **VI. SDD Lifecycle & Commit Gatekeeping** | ✅ PASS | Executed under `specs/007-climatology-sensor-audit/`; zero automatic commits or pushes without explicit approval. |

---

## Project Structure

### Documentation (`specs/007-climatology-sensor-audit/`)

```text
specs/007-climatology-sensor-audit/
├── spec.md              # Feature specification (FR-001 to FR-012, SC-001 to SC-005)
├── plan.md              # This implementation plan
├── research.md          # Phase 0 research & Recharts architectural decisions
├── data-model.md        # Phase 1 data entities and summary models
├── quickstart.md        # Phase 1 verification scenarios
└── contracts/           # Phase 1 interface contracts
    ├── climatology-anomaly-chart.contract.ts
    ├── sensor-harmonization-audit.contract.ts
    └── climatology-engine.contract.ts
```

### Source Code (`src/` & `tests/`)

```text
src/
├── types/
│   ├── climatology.ts                 # ClimatologyCurvePoint, SensorAuditPoint, BetaFactorEntry
│   └── index.ts                       # Re-export climatology types
├── engine/
│   ├── climatologyEngine.ts           # Transform functions for curves, audit series, and beta factors
│   └── index.ts                       # Re-export climatology engine
├── components/
│   ├── ClimatologyAnomalyChart.tsx    # Recharts composed seasonal climatology curve & IQR envelope
│   ├── SensorHarmonizationAudit.tsx   # Multi-decadal audit series, step-jump callout, and scorecards
│   └── index.ts                       # Re-export new chart components
└── App.tsx                            # Mount panels below BurningCalendarMatrix with tab/grid layout

tests/
├── ClimatologyAnomalyChart.test.tsx   # Unit & component test suite (US1)
├── SensorHarmonizationAudit.test.tsx  # Unit & component test suite (US2 & US3)
└── App.test.tsx                       # End-to-end integration test
```

---

## Execution Phases

### Phase 0: Outline & Research (Completed)
- Completed `specs/007-climatology-sensor-audit/research.md`:
  - Selected Recharts 2.15+ `ComposedChart` with `Area` range `[p25, p75]` for IQR envelope.
  - Formulated multi-decadal 4-layer sensor audit series with 2012 transition callout.
  - Defined model fit scorecards and regional $\beta_m$ factor extraction.
  - Defined bidirectional synchronization with `BurningCalendarMatrix`.

### Phase 1: Design & Contracts (Completed)
- Completed `specs/007-climatology-sensor-audit/data-model.md`.
- Completed `specs/007-climatology-sensor-audit/contracts/climatology-anomaly-chart.contract.ts`.
- Completed `specs/007-climatology-sensor-audit/contracts/sensor-harmonization-audit.contract.ts`.
- Completed `specs/007-climatology-sensor-audit/contracts/climatology-engine.contract.ts`.
- Completed `specs/007-climatology-sensor-audit/quickstart.md`.

### Phase 2: Task Breakdown
- Will be generated by `/speckit-tasks` into `specs/007-climatology-sensor-audit/tasks.md`.

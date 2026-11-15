# Implementation Plan: Fire Regime Diagnostic Classifier (`FireRegimePanel.tsx`)

**Branch**: `feat/T-09-fire-regime-classifier` | **Date**: 2026-11-15 | **Spec**: [`specs/008-fire-regime-classifier/spec.md`](spec.md)  
**Input**: Feature specification from `specs/008-fire-regime-classifier/spec.md` (NASA Challenge 15 Requirement R6, Backlog Task T-09).

---

## Summary

Deliver the **Fire Regime Diagnostic Classifier** mandated by **NASA Space Apps Challenge 15 Requirement R6**:
1. **Interactive 2D Recharts Scatter Plot (`FireRegimePanel.tsx`)**: Decouples daytime, low-energy agricultural stubble burning from high-intensity, nocturnal forest crown fires by plotting Mean Fire Radiative Power (MW) against Nocturnal Combustion Persistence ($f_{\text{night}}$).
2. **Three Operational Quadrants**: Delineates Agricultural Burning ($< 25\text{ MW}$, $f_{\text{night}} < 0.10$, $I_{\text{regime}} < 35$), Transitional / Escaped Burning ($25\text{--}45\text{ MW}$, $f_{\text{night}} 0.10\text{--}0.20$, $35 \le I_{\text{regime}} < 65$), and Severe Landscape Wildfire ($> 45\text{ MW}$, $f_{\text{night}} > 0.20$, $I_{\text{regime}} \ge 65$).
3. **Historical Distribution Breakdown**: Summarizes the multi-decadal frequency distribution (% Agricultural, % Transitional, % Severe Wildfire) and average regime intensity ($\overline{I}_{\text{regime}}$) for the active AOI.
4. **Multi-Agency Operational Mitigation Matrix**: Delivers context-sensitive tactical protocols for Civil Defense, Park Rangers, and Agricultural Authorities, adapting to the active year's peak regime severity.
5. **Universal Accessibility & Bilinguality**: Provides 100% client-side bilingual `EN` / `ES` support and WCAG 2.1 Level AA colorblind-safe palettes on dark aerospace background (`#0B0F17`).

---

## Technical Context

**Language/Version**: TypeScript 5.8+ (Strict Mode) / Node.js `v24.x` / React 19  
**Primary Dependencies**: React 19, Lucide React, Recharts `^2.15.0`, Tailwind CSS v4, existing `src/engine/` utilities (`harmonizer.ts`, `climatologyEngine.ts`)  
**Storage**: Client-side state via `RegionContext` and pre-computed static JSON cubes in `public/data/regions_catalog.json`  
**Testing**: Vitest 5.1+, Testing Library React 16+, `@testing-library/jest-dom`  
**Target Platform**: Modern desktop, tablet, and mobile browsers (Chromium, Firefox, Safari)  
**Project Type**: Web Application (Single-Page App via Vite 6)  
**Performance Goals**: Scatter plot initial render & AOI update $< 50\text{ ms}$, hover telemetry tooltip response $< 16\text{ ms}$ (60 FPS)  
**Constraints**: Zero backend runtime dependencies, 100% WCAG 2.1 AA text contrast ($\ge 4.5:1$), responsive SVG containers (`ResponsiveContainer`), colorblind-safe palettes  
**Scale/Scope**: 322 historical monthly observations per AOI, 3 operational quadrants, 3 agency guidance streams, 5 benchmark areas of interest  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle / Rule | Compliance Status | Evidence in Plan |
|---|:---:|---|
| **I. Dual-Language & Communication Protocol** | ✅ PASS | All code, comments, interfaces, and docs in English; UI supports bilingual `EN / ES` toggling; communications with `@wigsdev` 100% in Spanish. |
| **II. Package Strictness (`pnpm` only)** | ✅ PASS | Exclusively `pnpm` (`pnpm 12.21.0`), zero usage of `npm`/`yarn`. |
| **III. Mathematical Harmonization Rigor** | ✅ PASS | Direct implementation of Stage 4 Fire Regime Index formulation ($I_{\text{regime}} \in [0, 100]$) and quadrant bounds from `docs/02-modis-viirs-harmonization-methodology.md` Section 6. |
| **IV. Universal Visual Accessibility (WCAG 2.1 AA)** | ✅ PASS | Colorblind-safe palettes (Emerald/Cyan, Amber, Crimson), high-contrast labels over aerospace dark background (`#0B0F17`), relative text contrast $\ge 4.5:1$. |
| **V. NASA Space Apps Compliance** | ✅ PASS | Fulfills Challenge 15 Requirement R6; zero unauthorized NASA logos generated. |
| **VI. SDD Lifecycle & Commit Gatekeeping** | ✅ PASS | Executed under `specs/008-fire-regime-classifier/`; zero automatic commits or pushes without explicit approval. |

---

## Project Structure

### Documentation (`specs/008-fire-regime-classifier/`)

```text
specs/008-fire-regime-classifier/
├── spec.md              # Feature specification (FR-001 to FR-012, SC-001 to SC-005)
├── plan.md              # This implementation plan
├── research.md          # Phase 0 research & Recharts scatter architectural decisions
├── data-model.md        # Phase 1 data entities and summary models
├── quickstart.md        # Phase 1 validation scenarios
└── contracts/           # Phase 1 interface contracts
    ├── fire-regime-panel.contract.ts
    └── fire-regime-engine.contract.ts
```

### Source Code (`src/` & `tests/`)

```text
src/
├── types/
│   ├── regime.ts                      # FireRegimePoint, FireRegimeScatterData, FireRegimeDistribution, etc.
│   └── index.ts                       # Re-export regime types
├── engine/
│   ├── fireRegime.ts                  # Scatter data transformation, distribution aggregation, and mitigation engine
│   └── index.ts                       # Re-export fire regime engine
├── components/
│   ├── FireRegimePanel.tsx            # Recharts 2D scatter plot, quadrant bounds, distribution cards, and mitigation recommendations
│   └── index.ts                       # Re-export FireRegimePanel
├── context/
│   └── LanguageContext.tsx            # Bilingual EN/ES translation strings for fire regime panel
└── App.tsx                            # Mount FireRegimePanel beneath SensorHarmonizationAudit with synchronized year state

tests/
├── FireRegimePanel.test.tsx           # Unit & component test suite (US1, US2, US3)
└── App.test.tsx                       # End-to-end integration test
```

---

## Execution Phases

### Phase 0: Outline & Research (Completed)
- Completed `specs/008-fire-regime-classifier/research.md`:
  - Formulated 2D Recharts `ScatterChart` layout with three partitioned regime series and active year highlight.
  - Defined dynamic X/Y domain scaling and exclusion of zero-fire months.
  - Formalized historical distribution aggregation and dominant regime identification.
  - Established 3-tier multi-agency operational mitigation matrix for Civil Defense, Park Rangers, and Agricultural Authorities.

### Phase 1: Design & Contracts (Completed)
- Completed `specs/008-fire-regime-classifier/data-model.md`.
- Completed `specs/008-fire-regime-classifier/contracts/fire-regime-panel.contract.ts`.
- Completed `specs/008-fire-regime-classifier/contracts/fire-regime-engine.contract.ts`.
- Completed `specs/008-fire-regime-classifier/quickstart.md`.

### Phase 2: Task Breakdown
- To be generated by `/speckit-tasks` into `specs/008-fire-regime-classifier/tasks.md`.

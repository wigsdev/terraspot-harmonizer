# Implementation Plan: Mission Navigation Shell & Dynamic KPI Summary Panel

**Branch**: `feat/T-05-shell-navegacion-kpis` | **Date**: 2026-11-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-navigation-kpis-shell/spec.md`

## Summary

Deliver the primary mission control navigation shell (`src/components/Navbar.tsx`) and real-time headline KPI summary panel (`src/components/KPISummaryCards.tsx`) with reactive bilingual (`EN` / `ES`) context (`src/context/LanguageContext.tsx`) and global regional state management (`src/context/RegionContext.tsx`). The system connects pre-computed 27-year harmonized data cubes (`public/data/regions_catalog.json`) to an executive 4-card KPI grid calculating cumulative multi-decadal fire load, seasonal concentration, operational climatological anomaly alerts (evaluating `2026-10` vs $M_{10}$), and fire regime classification under full WCAG 2.1 Level AA colorblind-safe accessibility.

## Technical Context

**Language/Version**: TypeScript 5.9+, React 19, Node.js `v24.x` (`pnpm 12.21.0`).

**Primary Dependencies**: React 19, Lucide React (icons), Tailwind CSS v4.

**Storage**: Client-side in-memory React Context (`LanguageContext`, `RegionContext`), static pre-computed JSON catalog (`public/data/regions_catalog.json`).

**Testing**: Vitest 3.x, `@testing-library/react`, `@testing-library/jest-dom`, JSDOM environment.

**Target Platform**: Modern Evergreen Web Browsers (Chrome, Firefox, Safari, Edge) across mobile (360px+), tablet (768px+), and desktop (1280px+).

**Project Type**: Client-Side Single Page Application (SPA), edge-first architecture.

**Performance Goals**: UI reactive updates $< 16\text{ ms}$ (60 FPS) on language toggle or region change; initial load $< 1.5\text{ s}$.

**Constraints**: WCAG 2.1 Level AA contrast ratio $\ge 4.5:1$ on dark aerospace canvas (`#0B0F17`); certified colorblind-safe palettes (Inferno, Viridis, Cividis, Diverging); zero external runtime backend.

**Scale/Scope**: 5 benchmark regions (`PE-HCO`, `SAM-MAP`, `AR-PAR`, `US-CAL`, `AU-NSW`), 322 months per region (`2000-01` to `2026-10`), 4 headline KPI cards, 4 accessible palettes, 2 supported locales (`en` / `es`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Rule | Compliance Status | Analysis & Verification |
|---|---|---|
| **I. Dual-Language Protocol** | **PASS** | UI defaults to English (`en`) for NASA Global Judging compliance, with instantaneous client-side toggle to Spanish (`es`). All developer communication with `@wigsdev` conducted 100% in Spanish; all code, types, comments, and specs in 100% English. |
| **II. Package Management Strictness** | **PASS** | `pnpm` exclusively (`pnpm 12.21.0`) on Node 24.x. No `npm` or `yarn` used. Lockfile integrity preserved. |
| **III. Mathematical Harmonization Rigor** | **PASS** | Headline metrics directly derive from Stage 1–4 outputs in data cubes: cumulative AFCD, post-calibration $R^2$, robust non-parametric $Z$-score, departure $\Delta\%$, FRP (MW), and fire regime classification. |
| **IV. Universal Visual Accessibility** | **PASS** | WCAG 2.1 AA text contrast ($\ge 4.5:1$); dark aerospace theme (`#0B0F17`); certified accessible palettes (Inferno, Viridis, Cividis, Diverging); strictly no red-to-green heatmaps. |
| **V. NASA Challenge 2026 Regulations** | **PASS** | Challenge 15 indicators and baseline sensor labels included; no artificial NASA insignia or logos generated; AI disclosure documented. |
| **VI. SDD & Commit Gatekeeping** | **PASS** | Atomic branch `feat/T-05-shell-navegacion-kpis`; SemVer `0.5.0` planned; strict human review and approval required before any git commit or push. |

## Project Structure

### Documentation (this feature)

```text
specs/004-navigation-kpis-shell/
├── spec.md              # Feature specification & clarification log
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16 passing)
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 technical research & architecture decisions
├── data-model.md        # Phase 1 data entities, view models & formulas
├── quickstart.md        # Phase 1 verification & execution guide
├── contracts/           # Phase 1 interface contracts
│   ├── language-context.contract.ts
│   ├── region-context.contract.ts
│   └── kpi-summary.contract.ts
└── tasks.md             # Phase 2 task decomposition (22/22 tasks completed)
```

### Source Code (repository root)

```text
src/
├── context/
│   ├── LanguageContext.tsx      # Bilingual EN/ES state & typed dictionary provider
│   └── RegionContext.tsx        # Active region cube, catalog & palette state provider
├── components/
│   ├── Navbar.tsx               # Top mission header with brand, badges, selectors & controls
│   └── KPISummaryCards.tsx      # 4 responsive headline KPI cards with live reactive metrics
├── engine/
│   ├── kpiCalculator.ts         # Pure mathematical calculation of KPI view model from RegionCube
│   ├── harmonizer.ts            # (Existing) Core Stage 1-4 mathematical engine
│   └── colorRamps.ts            # (Existing) WCAG-certified color ramps & contrast resolvers
├── types/
│   ├── language.ts              # Language and dictionary type definitions
│   ├── region.ts                # (Existing) RegionCube & catalog contracts
│   ├── harmonization.ts         # (Existing) Harmonization contracts & alert types
│   └── palette.ts               # (Existing) Color palette contracts
└── App.tsx                      # Root application integrating LanguageContext, RegionContext, Navbar & KPI cards

tests/
├── Navbar.test.tsx              # Component tests for brand, badges, dropdowns & language toggle
├── KPISummaryCards.test.tsx     # Component tests for 4 KPI cards across regions & locales
└── App.test.tsx                 # Integration test verifying top-level assembly
```

**Structure Decision**: Standard React + TypeScript Single Page Application architecture. Global state partitioned cleanly into `src/context/` (`LanguageContext` and `RegionContext`), reusable view components in `src/components/`, mathematical derivations in `src/engine/`, and comprehensive test suites in `tests/`.

## Complexity Tracking

> *No Constitution violations or unjustified architectural patterns present.*

| Dimension | Selected Approach | Simpler Alternative Rejected Because |
|---|---|---|
| State Management | React 19 Context (`LanguageContext`, `RegionContext`) | Prop-drilling rejected due to 4-tier nesting; Redux/Zustand rejected as over-engineering for compact static catalog state. |
| Localization | Typed TypeScript dictionary in React Context | `i18next` rejected due to 35+ KB bundle size and unnecessary async loading overhead for ~50 static keys. |
| KPI Calculation | Pure memoized helper function (`computeKPISummary`) | Dynamic re-filtering on every render rejected to guarantee $< 16\text{ ms}$ 60 FPS animation frame budget. |

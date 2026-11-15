# Phase 0: Technical Research & Architecture Decisions

**Feature**: Mission Navigation Shell & Dynamic KPI Summary Panel (`004-navigation-kpis-shell`)  
**Branch**: `feat/T-05-shell-navegacion-kpis`  
**Date**: 2026-11-14  

---

## 1. Bilingual Localization Architecture (`LanguageContext`)

### Decision
Implement a lightweight, strongly typed React Context (`LanguageContext.tsx` and custom hook `useLanguage()`) with structured in-memory dictionaries for English (`en`, default) and Spanish (`es`).

### Rationale
- **Zero Runtime Overhead**: Heavy external i18n libraries (e.g., `i18next`, `react-intl`) introduce bundle bloat (25–40 KB), async dictionary loading complexity, and runtime key lookup penalties. A typed TypeScript dictionary with string interpolation functions executes synchronously within $\approx 0.1\text{ ms}$, ensuring $< 16\text{ ms}$ (60 FPS) frame budget upon language toggling.
- **Type Safety & Autocompletion**: TypeScript satisfies compile-time key verification (`keyof Dictionary`), eliminating missing translation keys in production.
- **Compliance with Constitution Principle I**: The app defaults to English for NASA Global Judging compliance while allowing instantaneous client-side switching to Spanish for local Huánuco/South American stakeholders.

### Alternatives Considered
- `react-i18next`: Rejected due to unnecessary bundle overhead, complex JSON loading pipelines, and lack of typed dictionary enforcement without heavyweight plugins.
- URL-based locale routing (`/en`, `/es`): Rejected because TerraSpot Harmonizer is an edge-first client SPA without server routing; internal state toggle maintains active AOI and matrix inspection state seamlessly.

---

## 2. Global Region & Palette State (`RegionContext`)

### Decision
Implement a unified `RegionContext` that manages:
1. `selectedRegionId`: Active AOI identifier (`'PE-HCO' | 'SAM-MAP' | 'AR-PAR' | 'US-CAL' | 'AU-NSW'`).
2. `currentRegion`: Active `RegionCube` object containing 322 monthly records, validation metrics, and climatology.
3. `availableRegions`: Summary list of all 5 benchmark regions.
4. `activePalette`: Selected colorblind-safe palette (`'inferno' | 'viridis' | 'cividis' | 'diverging'`).
5. `isLoading` and `error`: Asynchronous catalog fetching state with automatic fallback to pre-bundled default Huánuco data.

### Rationale
- Decouples navigation controls (`Navbar.tsx`) from consumption panels (`KPISummaryCards.tsx`, and future `BurningCalendarMatrix.tsx` and `MapAOISelector.tsx`).
- Allows any component in the tree to trigger region changes or access active metrics without prop-drilling across 4 layout tiers.
- Ensures immediate local fallback if network latency delays `public/data/regions_catalog.json` fetch.

### Alternatives Considered
- Redux Toolkit / Zustand: Rejected because application state is compact and hierarchical; standard React 19 Context with `useMemo` avoids external dependencies and maintains zero-dependency purity.
- Local component state inside `App.tsx`: Rejected due to severe prop-drilling down to child visualizers and tests.

---

## 3. Real-Time Headline KPI Computation Engine

### Decision
Create a pure, memoized computation utility `computeKPISummary(cube: RegionCube, language: 'en' | 'es'): KPIMetricsSummary` inside `src/engine/kpiCalculator.ts` (or integrated in component helper) that calculates:
1. **Total Multi-Decadal AFCD (2000–2026)**: Sum of `harmonized_hotspots` across all 322 months, paired with cross-sensor calibration fit $R^2$ from `cube.validation_metrics.r_squared`.
2. **Peak Burning Season**: Peak 2–3 contiguous calendar months determined by seasonal beta/climatological medians (or region `peak_season_months`), with the percentage of cumulative annual fire load concentrated during this window.
3. **Season Anomaly Alert (Clarification Decided - Oct 2026)**: Evaluates the latest available observation month (`2026-10`) against historical October baseline median ($M_{10}$), computing departure percentage ($\Delta\%$), robust $Z$-score, and alert badge (`NORMAL` for $Z < 1.0$, `ELEVATED` for $1.0 \le Z < 2.0$, `CRITICAL` for $Z \ge 2.0$).
4. **Dominant Fire Regime Diagnostic**: Mean Fire Radiative Power (MW) across records, nocturnal detection fraction ($f_{\text{night}}$), and categorical regime class (`AGRICULTURAL_BURN`, `TRANSITIONAL`, `SEVERE_WILDFIRE`) with accessible color coding.

### Rationale
- Pure calculation ensures $100\%$ unit testability in Vitest without DOM dependencies.
- Sub-millisecond execution ($< 0.5\text{ ms}$ for 322 items) guarantees zero perceptible UI lag when switching regions.
- Aligns strictly with NASA Challenge 15 requirements R1, R5, and R6.

### Alternatives Considered
- Pre-computing KPI summaries directly in Python (`scripts/build_harmonized_cubes.py`) and storing them statically: Rejected because user-uploaded CSVs (Task T-08) and custom bounding-box filters (Task T-06) require dynamic in-browser calculation on arbitrary subsets.

---

## 4. Visual Accessibility & Responsive Layout Strategy

### Decision
- Layout: Mobile-first responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) matching `docs/design-system.md` Section 4 & 5.1.
- Dark Theme Contrast: All cards utilize surface background `#111827` (`bg-space-900`), borders `#1E293B` (`border-space-800`), primary text `#F8FAFC` (`text-white`), secondary text `#94A3B8` (`text-slate-400`), and tabular numbers (`tabular-nums font-mono`).
- Badge Contrast: Every status badge (`NORMAL`, `ELEVATED`, `CRITICAL`, and Fire Regime badges) pairs high-contrast foreground text with soft background containers ($\text{CR} \ge 4.5:1$).

### Rationale
- Fulfills WCAG 2.1 Level AA accessibility mandatory requirements.
- Responsive breakpoints provide optimal density across smartphones (360px), tablets (768px), laptops (1280px), and wide monitors (1600px+).

---

## 5. Verification & Component Testing Strategy

### Decision
Develop dedicated Vitest suites:
1. `tests/Navbar.test.tsx`:
   - Brand mark, Challenge 15 indicator, version tag, sensor baseline pill rendering.
   - Region selector dropdown interaction and event firing.
   - Accessible palette selector dropdown interaction.
   - Language switcher toggling (`EN` $\leftrightarrow$ `ES`) and reactive string updating.
2. `tests/KPISummaryCards.test.tsx`:
   - Verification of all 4 KPI cards for default region (`PE-HCO`).
   - Verification of reactive recalculation when passing mock regions (e.g., `US-CAL`).
   - Verification of localized numerical formatting (e.g. thousands separators).
   - Verification of alert badges and regime class styling.
3. Regression verification of `tests/App.test.tsx` and full suite execution.

### Rationale
Ensures 100% test pass rate with Husky pre-commit hooks, preventing regressions as downstream visualization tasks are implemented.

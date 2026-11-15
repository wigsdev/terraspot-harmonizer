# Implementation Plan: Interactive Cartographic WebGIS Canvas with Bounding Box & NASA GIBS WMTS

**Branch**: `feat/T-06-mapa-aoi-gibs` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-map-aoi-gibs/spec.md`

## Summary

Deliver the interactive cartographic WebGIS module (`src/components/MapAOISelector.tsx`) integrated into the mission control workspace below `KPISummaryCards`. Built with Leaflet and React-Leaflet, the map provides:
1. Seamless synchronization and smooth animated camera transitions (`flyToBounds`) across the 5 NASA Challenge 15 benchmark regions (`PE-HCO`, `SAM-MAP`, `AR-PAR`, `US-CAL`, `AU-NSW`).
2. High-contrast aerospace dark basemap (CartoDB Dark Matter) and official public **NASA EOSDIS GIBS WMTS** satellite tile overlays (MODIS Terra & VIIRS SNPP True Color) using curated peak fire clear-sky reference dates.
3. Interactive bounding-box rectangle drawing tool paired with 4 bidirectional numeric coordinate inputs (`min_lat`, `max_lat`, `min_lon`, `max_lon`) and instant reset capabilities.
4. $0.01^\circ$ active fire cell density overlay loaded from `public/data/firms_spatial_cells.json`, styled with WCAG-certified color ramps (Inferno, Viridis, Cividis) and FRP intensity, complete with bilingual interactive popups.

---

## Technical Context

**Language/Version**: TypeScript 5.9+, React 19, Node.js `v24.x` (`pnpm 12.21.0`).

**Primary Dependencies**: `leaflet` (^1.9.4), `react-leaflet` (^5.0.0), `@types/leaflet` (^1.9.16), `lucide-react` (icons), Tailwind CSS v4.

**Storage**: Client-side static pre-computed JSON (`public/data/firms_spatial_cells.json`), local React component state, and global `RegionContext` + `LanguageContext`.

**Testing**: Vitest 3.x, `@testing-library/react`, `@testing-library/jest-dom`, JSDOM environment.

**Target Platform**: Modern Evergreen Web Browsers (Chrome, Firefox, Safari, Edge) across mobile ($360\text{px}+$ responsive stack) and desktop ($1280\text{px}+$ side-by-side workspace).

**Project Type**: Client-Side Single Page Application (SPA), edge-first architecture.

**Performance Goals**: $\ge 60\text{ FPS}$ pan/zoom interactions; spatial filtering and re-harmonization $< 30\text{ ms}$; initial map mount $< 250\text{ ms}$.

**Constraints**: Zero proprietary API keys or billing barriers; WCAG 2.1 Level AA contrast ($\ge 4.5:1$); dark aerospace aesthetic (`#0B0F17`); zero external CDN runtime dependencies.

**Scale/Scope**: 5 benchmark regions, 250 pre-aggregated spatial cells, 3 cartographic/satellite layer options, 4 numeric coordinate inputs, full bilingual (`EN`/`ES`) localization.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle / Rule | Compliance Status | Analysis & Verification |
|---|---|---|
| **I. Dual-Language Protocol** | **PASS** | UI defaults to English (`en`) for NASA Global Judging compliance, with instantaneous client-side toggle to Spanish (`es`) across all map controls, tooltips, and popups. All developer communication with `@wigsdev` conducted 100% in Spanish; all code, types, comments, and specs in 100% English. |
| **II. Package Management Strictness** | **PASS** | `pnpm` exclusively (`pnpm 12.21.0`) on Node 24.x. No `npm` or `yarn` used. Lockfile integrity preserved. |
| **III. Mathematical Harmonization Rigor** | **PASS** | Bounding box spatial subset filtering connects directly to Stage 2 geometric co-registration and invokes `reharmonizeSpatialSubset` (`src/engine/harmonizer.ts`). |
| **IV. Universal Visual Accessibility** | **PASS** | WCAG 2.1 AA text contrast ($\ge 4.5:1$); dark aerospace theme (`#0B0F17`); spatial cells styled with certified accessible palettes (Inferno, Viridis, Cividis, Diverging); strictly no red-to-green heatmaps. |
| **V. NASA Challenge 2026 Regulations** | **PASS** | Official NASA EOSDIS GIBS WMTS endpoints utilized directly; no artificial NASA insignia or logos generated; AI disclosure documented. |
| **VI. SDD & Commit Gatekeeping** | **PASS** | Atomic branch `feat/T-06-mapa-aoi-gibs`; SemVer `0.6.0` planned; strict human review and approval required before any git commit or push. |

---

## Project Structure

### Documentation (this feature)

```text
specs/005-map-aoi-gibs/
├── spec.md              # Feature specification & clarification log
├── checklists/
│   └── requirements.md  # Spec quality checklist (16/16 passing)
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 technical research & architecture decisions
├── data-model.md        # Phase 1 data entities, view models & formulas
├── quickstart.md        # Phase 1 verification & execution guide
├── contracts/           # Phase 1 interface contracts
│   ├── map-aoi-selector.contract.ts
│   ├── gibs-wmts.contract.ts
│   └── spatial-cells.contract.ts
└── tasks.md             # Phase 2 task decomposition (24/24 tasks generated)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── MapAOISelector.tsx       # Interactive Leaflet WebGIS cartography canvas
│   ├── Navbar.tsx               # (Existing) Top navigation shell
│   └── KPISummaryCards.tsx      # (Existing) Executive KPI summary cards
├── engine/
│   ├── harmonizer.ts            # (Existing) Contains reharmonizeSpatialSubset & bounding box utils
│   ├── colorRamps.ts            # (Existing) WCAG color ramps & cell styling helpers
│   └── kpiCalculator.ts         # (Existing) Pure KPI calculation engine
├── types/
│   ├── map.ts                   # Map layer, NASA GIBS, and drawing types
│   ├── region.ts                # (Existing) BoundingBox & BenchmarkRegion contracts
│   ├── language.ts              # (Existing) Bilingual dictionary extensions for map controls
│   └── index.ts                 # Centralized type exports
└── App.tsx                      # Root integration mounting MapAOISelector in workspace

tests/
├── MapAOISelector.test.tsx      # Component tests for Leaflet map, GIBS layers & drawing
├── Navbar.test.tsx              # (Existing) Navigation tests
├── KPISummaryCards.test.tsx     # (Existing) KPI summary tests
└── App.test.tsx                 # Integration test verifying top-level assembly
```

**Structure Decision**: Standard React + TypeScript Single Page Application architecture. Geospatial cartography isolated in `src/components/MapAOISelector.tsx` with dedicated types in `src/types/map.ts` and automated test verification in `tests/MapAOISelector.test.tsx`.

---

## Complexity Tracking

> *No Constitution violations or unjustified architectural patterns present.*

| Dimension | Selected Approach | Simpler Alternative Rejected Because |
|---|---|---|
| Map Engine | Leaflet + React-Leaflet | MapLibre GL rejected due to heavy bundle (> 600 KB) and WebGL JSDOM test mocking hurdles; static SVG map rejected because it cannot display live NASA GIBS satellite tiles. |
| Drawing Tool | Native React-Leaflet event handlers | `leaflet-draw` / `leaflet-geoman` rejected due to 100+ KB weight, React 19 incompatibilities, and unnecessary polygon/circle bloat for a simple rectangular bounding box. |
| GIBS Tile Access | Public REST/WMTS tile URLs | Complex OGC client library rejected as unnecessary overhead for standard Web Mercator tile requests. |

# Changelog

All notable changes to the **TerraSpot Harmonizer** project (**NASA Space Apps Challenge 2026**) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning (SemVer 2.0.0)](https://semver.org/).

---

## [Unreleased]

### Planned

- **Sprint 1 (`T-04`):** Pure TypeScript mathematical engine (`harmonizer.ts`) implementing the *TerraSpot 4-Stage* algorithm and accessible color scales (`colorRamps.ts`).
- **Sprint 2 (`T-05`, `T-06`):** *NASA Mission Control* design system, KPI summary cards, and interactive Leaflet WebGIS canvas with bounding box drawing and NASA GIBS WMTS satellite tile overlays.
- **Sprint 3 (`T-07`, `T-08`, `T-09`, `T-10`):** 27-year × 12-month *Burning Activity Calendar Matrix*, climatological anomaly curves, sensor audit view, agricultural vs. wildfire regime classifier, and standardized CSV exporter/uploader.
- **Sprint 4 (`T-11`, `T-12`):** Public HTTPS edge deployment, executive 7-slide presentation deck in English, and final `1.0.0` release.

---

## [0.3.0] - 2026-11-14

### Added

- **NASA FIRMS Data Engineering Pipeline (`T-03`):** Implemented deterministic Python 3.13 (`uv` / PEP 723, `SEED = 202615`) pipeline in `scripts/build_harmonized_cubes.py` executing the 4-stage MODIS Collection 6.1 & VIIRS 375m Collection 2 harmonization engine with `--verify` invariant validation.
- **Calibrated Multi-Decadal Benchmark Cubes (`T-03`):** Generated `public/data/regions_catalog.json` spanning `2000-01` through `2026-10` (322 monthly records per region) across the 5 benchmark Areas of Interest (`PE-HCO`, `SAM-MAP`, `AR-PAR`, `US-CAL`, `AU-NSW`) achieving $R^2 \in [0.9677, 0.9819]$ and cross-sensor MAPE reductions between `85.45%` and `87.83%`.
- **0.01° Active Fire Spatial Grid Cells (`T-03`):** Generated `public/data/firms_spatial_cells.json` with 250 pre-indexed $0.01^\circ$ hotspot cell summaries (`lat`, `lon`, `total_afcd`, `mean_frp_mw`, `p90_frp_mw`, `night_fraction`, `regime_class`, `yearly_afcd`) strictly enclosed within each AOI bounding box.
- **Standardized Sample FIRMS CSV Fixture (`T-03`):** Generated `public/data/sample_firms_huanuco.csv` (1,200 RFC 4180 15-column NASA FIRMS rows for Huánuco `PE-HCO`, including 60 intentional Stage 1 noise detections to validate `type == 0` and confidence masking).
- **Synchronized TypeScript Contracts & Vitest Validation (`T-03`):** Extended `src/types/` (`firms.ts`, `harmonization.ts`, `region.ts`) with `RegionsCatalogDocument`, `RegionCube`, `ValidationMetrics`, `MonthlyClimatology`, `SpatialGridCellSummary`, and `SpatialCellsDocument`, verified by the contract & math test suite in `tests/dataPipeline.test.ts`.

### Changed

- **Tailwind CSS v4 Canonical `@theme` Alignment:** Replaced arbitrary hex utility classes in `index.html` and `src/App.tsx` with canonical semantic tokens defined in `src/index.css` (`bg-space-950`, `bg-space-900`, `border-space-800`, `thermal-500`, `thermal-600`, `radar-cyan`, `status-success`) to resolve `suggestCanonicalClasses` diagnostics.

---

## [0.2.0] - 2026-11-14

### Added

- **Web Project Scaffolding (`T-02`):** Initialized modern frontend architecture with Vite 8 (Rolldown native bundler), React 19.3.1, TypeScript 7.0.2, and pnpm 12.21.0 on Node.js 24 LTS.
- **Tailwind CSS v4 Design Tokens (`T-02`):** Integrated `@tailwindcss/vite` with CSS-first design tokens in `src/index.css` (`#0B0F17`, `#131B2E`, `#FF6F00`, `#00E5FF`, `#10B981`) matching `docs/design-system.md`.
- **Vitest 5 Suite (`T-02`):** Configured Vitest 5.1.0 with `jsdom` and `@testing-library/react`, delivering unit smoke tests (`tests/smoke.test.ts`) and component render tests (`tests/App.test.tsx`).
- **Husky 9 Quality Gates (`T-02`):** Configured `.husky/pre-commit` (validating `pnpm typecheck`, `pnpm test:run`, and `pnpm build`) and `.husky/commit-msg` (enforcing Conventional Commits v1.0.0).
- **Architecture Contracts (`T-02`):** Created canonical TypeScript data schemas in `src/types/` (`firms.ts`, `harmonization.ts`, `region.ts`, `palette.ts`, `index.ts`).
- **Application Shell & Mobile-First Responsive Layout (`T-02`):** Implemented Aerospace Mission Control layout in `src/App.tsx`, `index.html`, and `public/favicon.svg` featuring a fluid $1 \rightarrow 2 \rightarrow 4$ column progression across mobile (360–425px), tablet (768px), and desktop ($\ge 1024\text{px}$) with touch-accessible controls.

---

---

## [0.1.0] - 2026-11-14

### Added

- **Repository Professional Governance (`T-01`):** Created `AGENTS.md` defining software engineering standards, Conventional Commits, SemVer 2.0.0 protocol, NASA Super Intelligence (SI) compliance, and strict commit approval gates.
- **Granular Product Backlog (`T-01`):** Authored `docs/backlog.md` with 4 Sprints and 12 atomic tasks (`T-01` to `T-12`) mapped to all 8 official requirements of *Challenge 15: Harmonization of MODIS and VIIRS Hot Spots*.
- **Comprehensive Operational Work Plan (`T-01`):** Created `docs/operational-work-plan.md` integrating the complete Spec Kit (SDD) lifecycle (`constitution` $\rightarrow$ `specify` $\rightarrow$ `clarify` $\rightarrow$ `plan` $\rightarrow$ `tasks` $\rightarrow$ `analyze` $\rightarrow$ `implement` $\rightarrow$ `converge`) with detailed prompts.
- **Design System & Universal Accessibility (`T-01`):** Authored `docs/design-system.md` specifying semantic CSS tokens (aerospace dark mode `#0B0F17` and light report mode), 4 colorblind-safe ramps (*Inferno, Viridis, Cividis, Diverging Anomaly*), and full ASCII dashboard wireframes.
- **Development Workflow & Versioning Strategy (`T-01`):** Authored `docs/workflow.md` establishing individual GitHub Flow, Mermaid `gitGraph` branch modeling, 5-step task closure protocol, and Definition of Done (DoD).
- **Architectural & Scientific Engineering Documentation (`T-01`):**
  - `docs/01-prd-terraspot-harmonizer.md`: Product Requirements Document and user personas.
  - `docs/02-modis-viirs-harmonization-methodology.md`: Mathematical and physical specification of the *TerraSpot 4-Stage* algorithm ($0.01^\circ$ Active Fire Cell-Days, seasonal cross-calibration $\beta_m$, non-parametric median anomalies, and FRP/nocturnal persistence index).
  - `docs/03-system-technical-architecture.md`: Zero-latency edge architecture, directory tree, and TypeScript data contracts.
  - `docs/04-firms-data-specification.md`: NASA FIRMS schema mapping (MODIS C6.1 vs. VIIRS 375m C2), NASA GIBS WMTS integration, 5 benchmark AOIs (highlighting Huánuco/Peruvian Andes), and 27-column CSV specification.
  - `docs/05-submission-pitch-rubric-plan.md`: Official NASA submission answers, 7-slide deck blueprint, and 30-second timed video script.
  - `docs/06-technology-stack-tools.md`: Challenge 15 decomposition and full technology stack.
- **Environment & Reference Isolation (`.gitignore`, `T-01`):** Configured `.gitignore` isolating `.reference/` (internal hackathon guidelines), `node_modules/`, `dist/`, and Python caches.
- **GitHub Projects Automation (`T-01`):** Developed `scripts/create_github_issues.py` to synchronize milestones, labels, and issues with GitHub Project boards.
- **Technical Frontpage & Open Source License (`T-01`):** Authored English-first `README.md` and MIT `LICENSE`.

# 📋 Comprehensive Operational Work Plan: TerraSpot Harmonizer (NASA Space Apps 2026)

This operational work plan establishes the **authoritative technical, methodological, and procedural framework** for the implementation of **TerraSpot Harmonizer** (`wigsdev/terraspot-harmonizer`), designed for **Challenge 15: Harmonization of MODIS and VIIRS Hot Spots**.

The plan integrates **Spec-Driven Development (SDD)** with **Spec Kit (`specify-cli`)**, logical dependency blocking, automated unit test suites, and the strict engineering governance defined in [AGENTS.md](../AGENTS.md) and [workflow.md](workflow.md).

---

## 🚀 0. Execution Environment, Tooling & Local Testing Guide

Before addressing any task or block, developers and agents must verify local execution integrity:

### 0.1 Environment Prerequisites
- **Node.js**: `v24.x` (verified on `v24.20.0`)
- **Package Manager**: **`pnpm` v12.21.0 exclusively**. *(Do not use `npm` or `yarn`)*.
- **Python**: `3.13.x` with `uv` for high-performance data processing.
- **Spec Kit**: `specify-cli` `v1.4.1.dev0` integrated with Antigravity skills.

### 0.2 Core Development & Verification Commands
```bash
# Clean dependency installation (Node / React / Vite)
pnpm install

# Local development server with Hot Module Replacement (HMR)
pnpm dev
# Web access: 👉 http://localhost:5173

# Strict TypeScript compilation check & production bundle build (Zero Errors/Warnings)
pnpm build

# Automated scientific unit testing (Vitest)
pnpm test:run

# Continuous watch mode for Test-Driven Development (TDD)
pnpm test

# Execute scientific FIRMS data pipeline (Python + uv)
python3 scripts/build_harmonized_cubes.py
```

---

## 🔄 The Full SDD Lifecycle with Spec Kit (`.agents/skills/`)

Every functional block and primary feature is developed through the complete sequence of Spec Kit skills, ensuring mathematical rigor, TypeScript contract safety, and zero regressions:

```mermaid
flowchart LR
    A["1. speckit-constitution<br/>(Core Principles)"] --> B["2. speckit-specify<br/>(Spec & User Stories)"]
    B --> C["3. speckit-clarify<br/>(Edge Cases & Ambiguities)"]
    C --> D["4. speckit-checklist<br/>(Verification Items)"]
    D --> E["5. speckit-plan<br/>(Architecture & Contracts)"]
    E --> F["6. speckit-tasks<br/>(Dependency Task List)"]
    F --> G["7. speckit-analyze<br/>(Cross-Artifact Audit)"]
    G --> H["8. speckit-implement<br/>(Coding & Unit Tests)"]
    H --> I["9. speckit-converge<br/>(Progress Alignment)"]
```

| Skill Command | Role in the SDD Lifecycle | Delivered Artifact |
|---|---|---|
| **`/speckit-constitution`** | Establishes foundational rules, NASA limits, token allocations, and mandatory stack. | `.specify/memory/constitution.md` |
| **`/speckit-specify`** | Formalizes functional specifications, user stories, data schemas, and Gherkin acceptance criteria. | `specs/XXX-feature-name/spec.md` |
| **`/speckit-clarify`** | Identifies technical ambiguities and resolves boundary conditions (e.g., zero-fire wet season $\beta_m$ stability). | Refined `spec.md` |
| **`/speckit-checklist`** | Generates a granular quality assurance checklist prior to architectural design. | `specs/XXX-feature-name/checklists/` |
| **`/speckit-plan`** | Architects module structure, component breakdown, library dependencies, and data contracts. | `specs/XXX-feature-name/plan.md` |
| **`/speckit-tasks`** | Deconstructs implementation into atomic tasks ordered by dependency. | `specs/XXX-feature-name/tasks.md` |
| **`/speckit-analyze`** | Audits bidirectional consistency between `spec.md`, `plan.md`, and `tasks.md` prior to code generation. | Consistency report |
| **`/speckit-implement`** | Executes source code generation, Vitest unit test authoring, and Definition of Done (DoD) verification. | Working code & passing tests |
| **`/speckit-converge`** | Benchmarks codebase state against specifications and detects remaining unbuilt tasks. | Convergence task list |

---

## 🗺️ Master Project Control Matrix (100% Traceability)

| # | Block / Task | Issue | Associated Spec | Primary Files | Dependencies | Status | Required Tests |
|---|---|---|---|---|---|:---:|---|
| **0.1** | Governance, Docs & Setup | `T-01` | *Constitution* | `AGENTS.md`, `docs/*`, `.gitignore`, `CHANGELOG.md` | None | 🟢 Ready | Path & linter checks |
| **0.2** | Web Scaffolding & Husky | `T-02` | `specs/001-scaffolding-web` | `package.json`, `vite.config.ts`, `tailwind.config.ts`, `.husky/*` | `T-01` | ⏳ Pending | `pnpm build`, pre-commit hook |
| **1.1** | FIRMS Ingestion & JSON Cubes | `T-03` | `specs/002-firms-data-pipeline` | `scripts/build_harmonized_cubes.py`, `public/data/*.json` | `T-02` | ⏳ Pending | `python3 scripts/build_harmonized_cubes.py --test` |
| **2.1** | Harmonizer Engine & Ramps | `T-04` | `specs/003-harmonization-engine` | `src/types/fireData.ts`, `src/engine/harmonizer.ts`, `colorRamps.ts` | `T-03` | ⏳ Pending | `tests/harmonizer.test.ts` (100% green) |
| **3.1** | Navigation Shell & KPIs | `T-05` | `specs/004-navigation-kpis-shell` | `src/components/Navbar.tsx`, `KPISummaryCards.tsx` | `T-02`, `T-04` | ⏳ Pending | UI rendering & i18n toggle |
| **3.2** | Leaflet WebGIS AOI Viewport | `T-06` | `specs/005-map-aoi-gibs` | `src/components/MapAOISelector.tsx` (NASA GIBS WMTS) | `T-04`, `T-05` | ⏳ Pending | WMTS tile loading & AOI drawing |
| **3.3** | Burning Calendar Matrix | `T-07` | `specs/006-burning-calendar-matrix` | `src/components/BurningCalendarMatrix.tsx` (27x12) | `T-04`, `T-06` | ⏳ Pending | 27×12 matrix, palettes, tooltips |
| **4.1** | Climatology Anomaly Chart | `T-08` | `specs/007-climatology-chart` | `src/components/ClimatologyAnomalyChart.tsx` | `T-04`, `T-07` | ⏳ Pending | Time-series & anomaly bars |
| **4.2** | Sensor Audit & Fire Regime | `T-09` | `specs/008-sensor-audit-regime` | `src/components/SensorHarmonizationAudit.tsx`, `FireRegimePanel.tsx` | `T-04`, `T-08` | ⏳ Pending | Agricultural vs. wildfire classifier |
| **4.3** | CSV Exporter & AOI Upload | `T-10` | `specs/009-csv-export-upload` | `src/engine/csvExporter.ts`, `src/components/CustomCSVModal.tsx` | `T-04`, `T-07` | ⏳ Pending | 27-column RFC 4180 validation |
| **5.1** | Optimization & Deployment | `T-11` | `specs/010-optimization-deployment` | `dist/`, Lighthouse, Vercel/Pages | `T-05` to `T-10` | ⏳ Pending | Lighthouse $\ge 90$, WCAG 2.1 AA |
| **5.2** | 7-Slide Deck & Submission | `T-12` | `specs/011-submission-pitch-deck` | `public/demo-slides.html`, NASA Form | `T-11` | ⏳ Pending | 7-slide / 30s limit confirmed |

---

## 🏛️ Block 0: Infrastructure, Governance & Base Scaffolding

### Task 0.1 (`T-01`): Professional Governance, Technical Architecture & Repository Setup
- **Branch**: `main` (initial)
- **Prerequisites**: None.
- **Deliverables**: `AGENTS.md`, `README.md`, `LICENSE`, `CHANGELOG.md`, `docs/*`, `.gitignore`, `scripts/create_github_issues.py`.
- **Status**: ✅ **Completed (Pending Initial Git Commit v0.1.0)**.
- **Constitutional Spec Kit Invocation**:
  ```text
  /speckit-constitution
  ```
  *Constitutional Prompt:*
  > "Establish the TerraSpot Harmonizer project constitution based on AGENTS.md, docs/01-prd-terraspot-harmonizer.md, docs/02-modis-viirs-harmonization-methodology.md, and docs/workflow.md. Enforce as non-negotiable principles: (1) Developer interactions in Spanish, all repository code, documentation, UI, and submission deliverables in 100% professional English with optional EN/ES bilingual UI toggle; (2) Exclusive usage of pnpm and Node.js v24; (3) Scientific rigor in MODIS C6.1 and VIIRS C2 harmonization on 0.01 deg spatial grids; (4) Strict adherence to NASA Space Apps 2026 rules (7-slide / 30-second demo limit, no alterations to official NASA insignia, transparent SI disclosure); (5) Absolute ban on automated git commits without explicit developer approval; (6) Universal WCAG 2.1 AA accessibility using certified colorblind-safe ramps (Inferno, Viridis, Cividis, Diverging)."

---

### Task 0.2 (`T-02`): Web Project Scaffolding (Vite + React 19 + TypeScript + Tailwind + Vitest + Husky)
- **Branch**: `feat/T-02-scaffolding-web`
- **Prerequisites**: Task 0.1 committed.
- **Deliverables**:
  - `package.json` with scripts for build, typecheck, test, and git hooks.
  - `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`.
  - `src/index.css` with `@import "tailwindcss";` and design tokens from [design-system.md](design-system.md).
  - `.husky/pre-commit` (validating `pnpm test:run` and `pnpm build`) and `.husky/commit-msg` (enforcing Conventional Commits).
  - `tests/setup.ts`, `vitest.config.ts`.
  - Clean modular directory structure: `src/components/`, `src/engine/`, `src/types/`, `public/data/`.
- **🛠️ Manual Verification**:
  ```bash
  pnpm install
  pnpm build
  pnpm test:run
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Create the base scaffolding for TerraSpot Harmonizer using Vite 6, React 19, TypeScript 5.7+, Tailwind CSS v4, Vitest, and Husky with pnpm. Configure aerospace dark mode design tokens (#0B0F17, #131B2E, #1E293B, cyan and thermal amber accents) matching docs/design-system.md, configure production build and unit test scripts, and establish modular structure across src/engine, src/components, and src/types adhering to docs/03-system-technical-architecture.md.
     ```
  2. **Clarification & Checklist:**
     ```text
     /speckit-clarify
     /speckit-checklist
     ```
  3. **Planning & Task Breakdown:**
     ```text
     /speckit-plan
     /speckit-tasks
     ```
  4. **Analysis, Implementation & Convergence:**
     ```text
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

## 🛰️ Block 1: NASA FIRMS Ingestion & Spatiotemporal Data Cubes

### Task 1.1 (`T-03`): Scientific Python Pipeline for FIRMS Ingestion & Cube Pre-Processing
- **Branch**: `feat/T-03-pipeline-datos-firms`
- **Prerequisites**: Task 0.2 (`public/data/` ready).
- **Deliverables**:
  - `scripts/build_harmonized_cubes.py`: Reproducible Python script using `pandas` / `numpy` to:
    1. Filter raw MODIS ($1\text{ km}$, $\text{confidence} \ge 30\%$) and VIIRS ($375\text{ m}$, confidence `'n'` and `'h'`).
    2. Bin detections onto a regular $0.01^\circ \times 0.01^\circ$ spatial grid to compute daily Active Fire Cell-Days (AFCD).
    3. Calculate regional seasonal scaling ratios $\beta_m = \sum \text{AFCD}_{\text{VIIRS}} / \sum \text{AFCD}_{\text{MODIS}}$ across the 2012–2025 overlap window.
    4. Synthesize unbroken 2000–2026 series ($H_{y,m} = \beta_m \cdot \text{AFCD}_{\text{MODIS}}$ for $y < 2012$; $\text{AFCD}_{\text{VIIRS}}$ for $y \ge 2012$).
    5. Export `public/data/regions_catalog.json` (5 benchmark AOIs: Huánuco Peru, Amazon Basin, Paraná Delta, California, Australia).
    6. Export `public/data/firms_spatial_cells.json` (spatial grid density for map overlay).
    7. Export `public/data/sample_firms_huanuco.csv` (27-column test dataset for custom user upload demo).
- **🛠️ Manual Verification**:
  ```bash
  python3 scripts/build_harmonized_cubes.py
  ls -lh public/data/
  # Confirm regions_catalog.json contains all 5 regions with 27-year monthly series
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Implement the scientific Python data pipeline (scripts/build_harmonized_cubes.py) to process NASA FIRMS MODIS C6.1 and VIIRS 375m C2 active fire archives following docs/02-modis-viirs-harmonization-methodology.md and docs/04-firms-data-specification.md. The script must calculate Active Fire Cell-Days on a 0.01-degree grid, derive monthly seasonal beta_m factors, compute multi-year climatological medians, and generate public/data/regions_catalog.json for the 5 benchmark AOIs (Huánuco Peru, Southern Amazon Basin, Paraná Delta, California, and Southeastern Australia), along with public/data/sample_firms_huanuco.csv.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

## 🧮 Block 2: TypeScript Mathematical Harmonization Engine

### Task 2.1 (`T-04`): TypeScript Harmonizer Engine, Accessible Color Ramps & Vitest Suite
- **Branch**: `feat/T-04-motor-armonizacion`
- **Prerequisites**: Schemas and data cubes from Block 1 (`public/data/regions_catalog.json`).
- **Deliverables**:
  - `src/types/fireData.ts`: TypeScript interfaces (`FIRMSHotspot`, `MonthlyFireRecord`, `BoundingBoxAOI`, `RegionDataBundle`, `ColorRampType`).
  - `src/engine/harmonizer.ts`: Pure, DOM-free functions:
    - `filterConfidence(records, minConfidence)`
    - `aggregateCellDays(records, gridSize)`
    - `calculateSeasonalBeta(modisRecords, viirsRecords)`
    - `harmonizeTimeSeries(modisSeries, viirsSeries, betaFactors)`
    - `calculateMultiyearMedian(series)`
    - `calculateRobustZScoreAnomalies(series, medians, iqr)`
    - `classifyFireRegime(frp, nightRatio)`
  - `src/engine/colorRamps.ts`: Colorblind-safe palettes (Inferno, Viridis, Cividis, Diverging B-W-R).
  - `tests/harmonizer.test.ts`: Vitest suite covering baseline data, zero-fire wet months, division-by-zero safeguards, and type assertions.
  - `tests/colorRamps.test.ts`: Ramping bounds and normalized $[0, 1]$ interpolation tests.
- **🛠️ Manual Verification**:
  ```bash
  pnpm test:run tests/harmonizer.test.ts tests/colorRamps.test.ts
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Design and implement the client-side mathematical harmonization engine in TypeScript (src/engine/harmonizer.ts and src/engine/colorRamps.ts) with strict data contracts in src/types/fireData.ts adhering to docs/02-modis-viirs-harmonization-methodology.md. Implement MODIS/VIIRS cross-calibration with monthly beta_m factors, 0.01-degree AFCD grid binning, rolling multi-year median calculations, robust Z-score anomalies using median and IQR, fire regime classification (FRP and night ratio), and WCAG 2.1 AA colorblind-accessible palettes (Inferno, Viridis, Cividis, Diverging). Include a comprehensive Vitest test suite.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

## 🎨 Block 3: UI Shell, Spatial Cartography & Burning Calendar Matrix

### Task 3.1 (`T-05`): Navigation Shell, Mission Header KPIs & Bilingual (EN/ES) Context
- **Branch**: `feat/T-05-shell-navegacion-kpis`
- **Prerequisites**: Scaffolding Task 0.2 and Types Task 2.1.
- **Deliverables**:
  - `src/components/Navbar.tsx`: Top bar featuring logo mark, Challenge 15 badge, active region selector, color ramp dropdown, and `EN / ES` bilingual toggle.
  - `src/components/KPISummaryCards.tsx`: 4 dynamic KPI cards:
    1. *Total Harmonized Fire Count (2000–2026)*
    2. *Current Season Anomaly vs. Historical Median*
    3. *Dominant Sensor Status (MODIS era vs. VIIRS era)*
    4. *Active Fire Regime Classification (Agricultural / Moderate / Extreme Forest)*
  - `src/context/LanguageContext.tsx`: Reactive bilingual context with English and Spanish dictionaries.
- **🛠️ Manual Verification**:
  ```bash
  pnpm dev
  # Verify live EN/ES switching and instant regional selector re-render
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Implement the primary mission navigation shell and top KPI summary panel (src/components/Navbar.tsx and src/components/KPISummaryCards.tsx) with reactive bilingual EN/ES support following docs/01-prd-terraspot-harmonizer.md and docs/design-system.md. Include the NASA Challenge 15 indicator, dropdown selector for the 5 benchmark regions, accessible palette selector (Inferno, Viridis, Cividis), and 4 headline KPI cards featuring numerical deltas and international formatting.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

### Task 3.2 (`T-06`): Leaflet WebGIS Canvas with Dynamic Bounding Box & NASA GIBS WMTS
- **Branch**: `feat/T-06-mapa-aoi-gibs`
- **Prerequisites**: Task 1.1 and Task 3.1.
- **Deliverables**:
  - `src/components/MapAOISelector.tsx`:
    - Dark-mode Leaflet map canvas.
    - Official NASA GIBS WMTS satellite tile layers (Terra/Aqua MODIS True Color and VIIRS Day/Night Band).
    - Rendered bounding boxes for benchmark regions with interactive bounding-box rectangle drawing tools.
    - Active fire cell density layer ($0.01^\circ$) sourced from `public/data/firms_spatial_cells.json`.
- **🛠️ Manual Verification**:
  ```bash
  pnpm dev
  # Open map, pan between Huánuco and Amazon Basin, verify NASA GIBS WMTS tile loading
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Build the interactive cartographic WebGIS module (src/components/MapAOISelector.tsx) using Leaflet and React Leaflet, integrating NASA GIBS WMTS satellite imagery layers and interactive bounding box drawing according to docs/03-system-technical-architecture.md and docs/04-firms-data-specification.md. Allow seamless switching between the 5 pre-calibrated study areas, display 0.01-degree AFCD active cell clusters, and provide zoom controls, coordinate inputs, and NASA GIBS layer toggles.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

### Task 3.3 (`T-07`): Interactive 27×12 Burning Activity Calendar Matrix
- **Branch**: `feat/T-07-burning-calendar-matrix`
- **Prerequisites**: Task 2.1 (Engine) and Task 3.1 (Shell).
- **Deliverables**:
  - `src/components/BurningCalendarMatrix.tsx`:
    - High-density heatmap with 27 rows (2000 through 2026) and 12 columns (January through December).
    - Dynamic cell styling matching selected palette (Inferno/Viridis/Cividis) scaled to harmonized counts $H_{y,m}$.
    - Rich hover tooltips displaying:
      - Observation Year & Month.
      - Harmonized Count ($H_{y,m}$).
      - Sensor attribution (`MODIS Scaled`, `Dual Overlap Calibrated`, or `VIIRS Direct`).
      - Raw MODIS and VIIRS counts during 2012–2025 overlap.
      - Robust $Z$-score anomaly and season status (Normal, Elevated, Critical).
    - Synchronized cell/year click handler updating downstream charts and map viewports.
    - Continuous accessible color legend showing minimum, median, and maximum thresholds.
- **🛠️ Manual Verification**:
  ```bash
  pnpm dev
  # Inspect matrix cells: 2000-2011 (MODIS era), 2012-2025 (dual era), and 2026 (continuity era)
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Develop the interactive 27-year by 12-month Burning Activity Calendar matrix (src/components/BurningCalendarMatrix.tsx) following docs/01-prd-terraspot-harmonizer.md and docs/02-modis-viirs-harmonization-methodology.md. Render a dense 27x12 grid where each cell represents harmonized monthly fire activity dynamically colored by the active colorblind-safe ramp. Provide rich hover tooltips with raw vs. harmonized counts, anomaly badges, click synchronization with global application state, and an accessible continuous gradient legend.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

## 📊 Block 4: Advanced Climatology, Sensor Audit & Data Export

### Task 4.1 (`T-08`): Climatology Curves & Anomaly Analytics with Recharts
- **Branch**: `feat/T-08-grafico-climatologia`
- **Prerequisites**: Task 2.1 and Task 3.3.
- **Deliverables**:
  - `src/components/ClimatologyAnomalyChart.tsx`:
    - Upper chart: 2000–2026 harmonized monthly time-series curve with trendline and interquartile range shading band (P25–P75).
    - Lower coordinated chart: Monthly departure anomaly bars relative to climatological median, color-coded blue for negative departures and red/amber for critical positive fire anomalies.
    - Temporal range selector (e.g., Last 5 Years, 2012–2025 Overlap Window, Full 2000–2026 Record).
- **🛠️ Manual Verification**:
  ```bash
  pnpm dev
  # Confirm tooltip coordination and temporal zooming
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Build the advanced temporal analytics module (src/components/ClimatologyAnomalyChart.tsx) using Recharts matching docs/01-prd-terraspot-harmonizer.md and docs/design-system.md. Render two coordinated views: (1) A 27-year time-series showing harmonized counts against a shaded seasonal median baseline band; (2) A diverging monthly anomaly bar chart in blue-white-red scale indicating standard deviations from expected regional climatology.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

### Task 4.2 (`T-09`): Sensor Harmonization Audit View & Fire Regime Diagnostics
- **Branch**: `feat/T-09-auditoria-regimen-fuego`
- **Prerequisites**: Task 2.1 and Task 4.1.
- **Deliverables**:
  - `src/components/SensorHarmonizationAudit.tsx`:
    - Comparative scatter plot and overlapping time-series for the 2012–2025 overlap displaying:
      - Raw MODIS C6.1 ($1\text{ km}$).
      - Raw VIIRS C2 ($375\text{ m}$).
      - Derived monthly scaling factor $\beta_m$.
      - Concordance metrics before vs. after harmonization ($R^2$, RMSE, MAPE reduction).
  - `src/components/FireRegimePanel.tsx`:
    - Mean and P90 Fire Radiative Power (MW).
    - Nighttime-to-daytime fire combustion ratio ($f_{\text{night}}$).
    - Automated fire regime classification:
      - 🌾 **Seasonal Agricultural Burning**: Moderate FRP ($< 35\text{ MW}$), low nocturnal persistence ($< 10\%$).
      - 🔥 **Severe Landscape Wildfire**: High FRP ($> 60\text{ MW}$), sustained nighttime persistence ($> 20\%$).
- **🛠️ Manual Verification**:
  ```bash
  pnpm dev
  # Verify calculated beta values match docs/02-modis-viirs-harmonization-methodology.md
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Implement the scientific audit and fire regime diagnostic components (src/components/SensorHarmonizationAudit.tsx and src/components/FireRegimePanel.tsx) adhering to docs/02-modis-viirs-harmonization-methodology.md. The audit module must transparently expose cross-calibration over the 2012-2025 window, detailing monthly beta_m factors, R2 improvements, and RMSE reductions. The fire regime panel must classify fire events by integrating FRP distributions in megawatts and nighttime combustion ratios to distinguish agricultural burns from catastrophic wildfires.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

### Task 4.3 (`T-10`): Standardized CSV Exporter & Custom FIRMS CSV Ingestion Modal
- **Branch**: `feat/T-10-csv-export-upload`
- **Prerequisites**: Task 2.1 and Task 3.3.
- **NASA Global Offers Integration**:
  - Align 27-column CSV metadata schema and spatial bounds with **Microsoft Planetary Computer STAC Catalog** standards.
  - Document in-situ fire weather correlation and validation using **Meteomatics Weather API** (`forest_fire_warning:idx` and multi-layer soil moisture).
- **Deliverables**:
  - `src/engine/csvExporter.ts`: Client-side RFC 4180 UTF-8 CSV exporter formatted to the 27-column canonical schema defined in [04-firms-data-specification.md](04-firms-data-specification.md).
  - `src/components/CustomCSVModal.tsx`:
    - Accessible drag-and-drop modal allowing users to upload their own NASA FIRMS CSV downloads (MODIS or VIIRS).
    - Client-side in-memory CSV parsing (`PapaParse`), zero data dispatched to remote servers.
    - Schema validation for required headers (`latitude`, `longitude`, `acq_date`, `confidence`, `frp`).
    - Dynamic re-harmonization and live re-rendering of the Burning Activity Calendar.
- **🛠️ Manual Verification**:
  ```bash
  pnpm dev
  # Upload public/data/sample_firms_huanuco.csv into modal and verify instant calendar re-rendering
  # Click "Download Harmonized CSV" and inspect exported file structure
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Implement the Standardized CSV Exporter (src/engine/csvExporter.ts) and Custom NASA FIRMS CSV Ingestion modal (src/components/CustomCSVModal.tsx) fulfilling NASA Space Apps Challenge 15 Requirement R7 and adhering to docs/04-firms-data-specification.md and docs/backlog.md (Task T-10). The exporter must generate a 27-column RFC 4180 compliant CSV containing all multi-decadal monthly records (raw MODIS, raw VIIRS, AFCD, beta factors, harmonized counts, climatological medians, percentage departures, robust Z-scores, FRP stats, and fire regime classifications) aligned with Microsoft Planetary Computer STAC spatial schemas and Meteomatics fire weather validation. The ingestion modal must provide an accessible client-side drag-and-drop interface for user-uploaded FIRMS CSV files with in-memory validation, error handling for corrupted rows, and instant re-harmonization across the dashboard with full bilingual EN/ES support and Vitest unit tests.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

## 🚀 Block 5: Packaging, 7-Slide Pitch Presentation & NASA Global Submission

### Task 5.1 (`T-11`): Production Performance Optimization, WCAG 2.1 AA Audit & Global Deployment
- **Branch**: `feat/T-11-optimization-deployment`
- **Prerequisites**: Tasks `T-02` through `T-10` completed.
- **NASA Global Offers Integration**:
  - Claim and bind official mission custom domain via **GoDaddy Registry & Porkbun** (free domain registration + 1-year SSL certificate) for primary HTTPS deployment.
- **Deliverables**:
  - Vite production bundle optimization (code-splitting with `manualChunks` for Leaflet and Recharts).
  - Contrast ratio and full keyboard navigation audit (WCAG 2.1 AA).
  - Clean production compilation: `pnpm build` with zero TypeScript errors or warnings.
  - Production deployment to public HTTPS URL (custom domain + Vercel / GitHub Pages edge fallback, zero authentication barriers).
- **🛠️ Manual Verification**:
  ```bash
  pnpm build
  pnpm preview
  # Lighthouse audit: Performance >= 90, Accessibility = 100, Best Practices = 100, SEO = 100
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Perform production performance optimization, WCAG 2.1 AA accessibility auditing, and public edge deployment preparation for TerraSpot Harmonizer following docs/01-prd-terraspot-harmonizer.md, docs/06-technology-stack-tools.md, and docs/backlog.md (Task T-11). Ensure clean code-splitting in Vite, initial load times under 2 seconds on standard broadband, zero public access barriers, configure GoDaddy/Porkbun custom domain and HTTPS deployment, and ensure full cross-browser compatibility across Chrome, Firefox, Safari, and Edge.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

### Task 5.2 (`T-12`): Interactive 7-Slide Presentation Deck & NASA Space Apps Submission (`v1.0.0`)
- **Branch**: `feat/T-12-submission-pitch-deck`
- **Prerequisites**: Live public production URL from `T-11`.
- **NASA Global Offers Integration**:
  - Formal declaration of **Meteomatics Weather API**, **GoDaddy Registry & Porkbun**, **Microsoft Planetary Computer**, **GitHub Copilot / Microsoft Copilot**, and **Miro** across Slides 3, 5, 6, and the official NASA Space Apps submission form.
- **Deliverables**:
  - `public/demo-slides.html`: High-resolution responsive HTML presentation of **exactly 7 slides** matching [05-submission-pitch-rubric-plan.md](05-submission-pitch-rubric-plan.md):
    - Slide 1: Title, Challenge 15 & Team (Huánuco, Peru).
    - Slide 2: The Problem (27-year sensor discontinuity & climate crisis).
    - Slide 3: TerraSpot Harmonizer Solution & Core Value.
    - Slide 4: Science & Math (The 4-Stage Harmonization Algorithm).
    - Slide 5: Product Demo (Interactive Burning Activity Calendar & AOI Map).
    - Slide 6: Open Science Architecture, Planetary Computer & Meteomatics Fusion.
    - Slide 7: Global Impact, Verified Public HTTPS Links & Team Credits.
  - Optional 30-second timed screen-recorded demo video.
  - Final verification of all submission form fields in English prior to Sunday, November 15, at 11:59 p.m.
- **🛠️ Manual Verification**:
  ```bash
  # Open http://localhost:5173/demo-slides.html
  # Verify keyboard arrow navigation and strict 7-slide boundary
  ```
- **⚡ Guided Spec Kit Workflow**:
  1. **Specification:**
     ```text
     /speckit-specify Construct the official interactive 7-slide presentation deck (public/demo-slides.html) and consolidate the NASA global submission package following docs/05-submission-pitch-rubric-plan.md, docs/backlog.md, and docs/operational-work-plan.md (Task T-12). Author exactly 7 self-contained slides in English with keyboard and touch navigation, integrating vector charts, Global Offers showcase (Meteomatics, GoDaddy/Porkbun, Planetary Computer, Copilot, Miro), live demo links, public repository links, and strict adherence to NASA Space Apps Challenge 2026 global judging criteria.
     ```
  2. **Lifecycle Steps:**
     ```text
     /speckit-clarify
     /speckit-checklist
     /speckit-plan
     /speckit-tasks
     /speckit-analyze
     /speckit-implement
     /speckit-converge
     ```

---

## 🔒 Task Closure Protocol & Commit Authorization (Golden Rule)

In strict adherence to [AGENTS.md](../AGENTS.md), completing any task requires following this 5-step sequence:

1. **Build & Test Verification:**
   Execute `pnpm build` and `pnpm test:run` to confirm 100% passing tests, zero TypeScript errors, and zero warnings.
2. **Semantic Versioning (SemVer 2.0.0):**
   - New feature/pipeline/module $\rightarrow$ increment `MINOR` (`0.X.0`) in `package.json`.
   - Bugfix/style adjustment/refactor $\rightarrow$ increment `PATCH` (`0.X.Y`).
3. **Changelog Record:**
   Document changes in [**`CHANGELOG.md`**](../CHANGELOG.md) under `Added`, `Changed`, or `Fixed`.
4. **Summary Presentation & Standby:**
   Present modified files, test outputs, and proposed Conventional Commit message in chat, remaining in standby.
5. **Commit Execution Upon Explicit Approval ONLY:**
   Await explicit developer authorization ("visto bueno") before executing the commit:
   ```bash
   git add <specific-files>
   git commit -m "<type>(<scope>): <imperative description> (T-XX)"
   ```

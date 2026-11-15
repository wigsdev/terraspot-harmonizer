# TerraSpot Harmonizer — Product Backlog (NASA Space Apps 2026)

## 📌 Project Overview

| Field | Description / Value |
|---|---|
| **Project Name** | TerraSpot Harmonizer: Unified MODIS-VIIRS Burning Activity Calendar |
| **Official NASA Challenge** | Challenge 15 — *Harmonization of MODIS and VIIRS Hot Spots* |
| **Team / Local Event** | TerraSpot Harmonizer · Huánuco, Peru |
| **Repository** | `wigsdev/terraspot-harmonizer` |
| **Team Lead & Developer** | Wilmer Gulcochía Sánchez (`@wigsdev`) |
| **Role** | Mission Director, GIS/Data Lead & Full-Stack WebGIS Architect |
| **Hackathon Window** | 36 Intensive Hours (November 14, 2026 – November 15, 2026, 23:59 PET / UTC-5) |
| **Technology Stack** | React 19 · TypeScript 5.7+ · Vite 6 · pnpm 12 · Vitest · Tailwind CSS v4 · Leaflet / React-Leaflet · NASA GIBS WMTS · Custom Scalable Matrix · Recharts · Python 3.13 (Pipeline) |
| **Engineering Governance** | SDLC + SDD (Spec Kit) · Husky Git Hooks · GitHub Actions CI/CD · Conventional Commits · SemVer 2.0.0 · WCAG 2.1 AA · Colorblind-Safe Ramps · Strict DoD |
| **Automation Tooling** | `scripts/create_github_issues.py` (Automatic Milestones, Labels, and Issues sync for GitHub Projects) |

---

## ⚙️ Management System & Operational Workflow

### Branching Strategy (Individual GitHub Flow)
Engineered for audit readiness by NASA global evaluators:
- **Production Branch (`main`):** Always stable, compiling, verified by test suites, and immediately deployable to global edge hosting (Vercel / GitHub Pages).
- **Feature Branches (`feat/T-XX-name` or `fix/T-XX-name`):** One atomic branch per backlog task. Upon verification, merged into `main` closing the associated GitHub Issue (`Closes #XX`).
- **Squash and Merge:** Linear, descriptive git commit history on `main`.

### Task Statuses
| Status | GitHub Label | Color Hex | Operational Meaning |
|---|---|---|---|
| 🔲 Backlog | `status: backlog` | `#EDEDED` | Task defined, ready for implementation |
| 🔨 In Progress | `status: in-progress` | `#FEF2C0` | Active work on dedicated feature branch |
| 🔍 In Review / QA | `status: in-review` | `#D8F8C8` | Build, typecheck, formula, and DoD verification |
| ✅ Done | — (Closed Issue) | — | Merged to `main`, documented in `CHANGELOG.md` |

### Priorities
| Label | Color Hex | Meaning |
|---|---|---|
| `priority: critical` | 🔴 `#B60205` | Blocker: Core governance, mathematical engine, or matrix calendar |
| `priority: high` | 🟠 `#D93F0B` | Challenge 15 Official Requirement: Essential for NASA judging rubric |
| `priority: medium` | 🟡 `#FBCA04` | Differentiating analytics (Agricultural vs. Forest Fire classifier, NASA GIBS) |
| `priority: low` | 🟢 `#0E8A16` | Visual polish, micro-interactions, presentation extras |

### Task Types
| Label | Description |
|---|---|
| `type: structure` | Governance, repository setup, tooling, and scaffolding |
| `type: data-science` | Python pipeline, NASA FIRMS ingestion, and TypeScript harmonization engine |
| `type: style` | Design system, semantic CSS tokens, dark aerospace mode, and accessible ramps |
| `type: feature` | WebGIS components (Leaflet AOI), matrix calendar, charts, and CSV export |
| `type: presentation` | Public HTTPS deployment, 7-slide presentation, and official NASA submission form |

### Challenge 15 Requirements Mapping
- **R1:** Mathematical harmonization of MODIS ($1\text{ km}$, 2000–2026) and VIIRS ($375\text{ m}$, 2012–2026) active fire records.
- **R2:** Interactive Burning Activity Calendar displaying multi-decadal monthly fire frequency.
- **R3:** Interactive Area of Interest (AOI) selection via bounding box drawing, coordinate inputs, or regional presets.
- **R4:** Scientifically accessible, colorblind-safe color scales (*Inferno, Viridis, Cividis, Diverging*).
- **R5:** Climatological comparison against multi-year baselines, anomaly detection, and critical threshold alerts.
- **R6:** Fire regime characterization (Seasonal agricultural burning vs. severe forest wildfires via FRP and nighttime persistence).
- **R7:** Standardized CSV data export and custom user NASA FIRMS CSV ingestion.
- **R8:** Frictionless public web deployment + 7-slide presentation / 30s video demo in English.

### General Definition of Done (DoD)
A task is marked as **Done** only when:
1. All task-specific acceptance criteria are 100% satisfied.
2. Clean compilation (`pnpm build`) with zero TypeScript errors and zero critical warnings.
3. Accessible contrast and colorblind-safe palettes verified.
4. SemVer version updated in `package.json` and changes recorded in `CHANGELOG.md`.
5. **Explicit developer approval ("visto bueno")** granted before committing with Conventional Commits.

---

## 🗓️ Sprint Schedule (36-Hour Hackathon)

| Sprint / Phase | Time Window | Primary Milestone | NASA Requirements Covered |
|---|:---:|---|:---:|
| **Sprint 1 (Phase 1)** | Sat Nov 14 (Morning/Afternoon) | Governance, Python FIRMS Pipeline & Mathematical Harmonization Engine | R1, R5, R6 |
| **Sprint 2 (Phase 2)** | Sat Nov 14 (Afternoon/Evening) | Web App Scaffolding, Design System & Leaflet WebGIS AOI (NASA GIBS) | R3, R4 |
| **Sprint 3 (Phase 3)** | Sat Nov 14 (Night) – Sun Nov 15 (Morning) | *Burning Activity Calendar Matrix*, Anomaly Analytics, Sensor Audit & CSV | R2, R4, R5, R6, R7 |
| **Sprint 4 (Phase 4)** | Sun Nov 15 (Afternoon/Night) | UI/UX Polish, Public HTTPS Deployment, 7-Slide Deck & Official NASA Submission | R8 |

---

## 📋 Granular Task Catalog

---

### SPRINT 1 — Governance, NASA FIRMS Data Pipeline & Harmonization Engine

#### T-01 — Professional Governance, Technical Architecture & Issue Synchronization
| Attribute | Specification |
|---|---|
| **Priority** | `priority: critical` |
| **Type** | `type: structure` |
| **Dependencies** | None |
| **Effort** | Low (2 hours) |
| **Files Affected** | `AGENTS.md`, `CHANGELOG.md`, `README.md`, `LICENSE`, `docs/*`, `scripts/create_github_issues.py` |

**Description & Technical Context:**  
Establish software engineering governance and repository foundations. Draft the architectural and scientific documentation in `docs/` (`01-prd` through `06-tools`, `operational-work-plan.md`, `design-system.md`, `workflow.md`, `backlog.md`), operational rules in `AGENTS.md`, version log in `CHANGELOG.md` (starting at `0.1.0`), MIT License, technical `README.md`, and the GitHub Issues synchronization script.

**Acceptance Criteria:**
- [x] Complete technical and scientific documentation in `docs/` in 100% professional English.
- [x] `docs/backlog.md`, `docs/design-system.md`, `docs/workflow.md`, and `docs/operational-work-plan.md` created with engineering rigor.
- [x] `AGENTS.md`, `CHANGELOG.md` (`v0.1.0`), `README.md`, and `LICENSE` (MIT) present at project root.
- [x] `scripts/create_github_issues.py` verified and ready to synchronize milestones, labels, and issues.

---

#### T-02 — Web Project Scaffolding with pnpm, Spec Kit (SDD), Vitest, Husky & CI/CD
| Attribute | Specification |
|---|---|
| **Priority** | `priority: critical` |
| **Type** | `type: structure` |
| **Dependencies** | T-01 |
| **Effort** | Low (1 hour) |
| **Files Affected** | `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`, `.husky/*`, `.github/workflows/ci.yml`, `.specify/*`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx` |

**Description & Technical Context:**  
Initialize the base application using `pnpm`, Vite 6, React 19, strict TypeScript, and **Vitest**. Configure **Spec Kit (SDD)** skills and workflows, install **Husky** (`.husky/pre-commit` and `.husky/commit-msg`) to enforce Conventional Commits and build validation, and configure **GitHub Actions CI/CD** (`.github/workflows/ci.yml`). Install core dependencies (`tailwindcss`, `lucide-react`, `leaflet`, `react-leaflet`, `recharts`, `vitest`).

**Acceptance Criteria:**
- [x] `package.json` managed via `pnpm` (`v0.2.0`) with scripts for `dev`, `build`, `preview`, `typecheck`, `test:run`, and `prepare`.
- [x] Operational **Husky** hooks validating commit messages (*Conventional Commits*), `.reference/` isolation, and clean builds.
- [x] `.github/workflows/ci.yml` and **Spec Kit (SDD)** initialized.
- [x] Initial compilation verified with `pnpm build` with zero warnings.

---

#### T-03 — Python NASA FIRMS Data Pipeline & Spatiotemporal Cubes Generation (2000–2026)
| Attribute | Specification |
|---|---|
| **Priority** | `priority: critical` |
| **Type** | `type: data-science` |
| **Dependencies** | T-02 |
| **Effort** | High (2 to 3 hours) |
| **Files Affected** | `scripts/build_harmonized_cubes.py`, `public/data/regions_catalog.json`, `public/data/firms_spatial_cells.json`, `public/data/sample_firms_huanuco.csv` |

**Description & Technical Context:**  
Develop the Python scientific pipeline script (`scripts/build_harmonized_cubes.py`) to process NASA FIRMS historical time series (MODIS C6.1 at 1 km from 2000 and VIIRS C2 at 375 m from 2012 through 2026) for the 5 benchmark regions (**Huánuco & Peruvian Andes**, **Southern Amazon Basin**, **Paraná River Delta / CONAE**, **California**, and **New South Wales - Australia**), plus a spatial grid supporting arbitrary bounding box queries. Generate a sample raw FIRMS CSV file for custom upload demonstration (Requirements R1, R5, R6).

**Acceptance Criteria:**
- [x] `scripts/build_harmonized_cubes.py` executes without errors on Python 3.13 and outputs data to `public/data/`.
- [x] Generates monthly aggregated series from `2000-01` to `2026-10` with raw MODIS/VIIRS counts, Active Fire Cell-Days (AFCD), mean FRP (MW), and night fraction.
- [x] Generates `public/data/sample_firms_huanuco.csv` matching NASA FIRMS schema for custom upload verification.

---

#### T-04 — TypeScript Harmonization Engine (`harmonizer.ts`), Color Ramps (`colorRamps.ts`) & Vitest Suite
| Attribute | Specification |
|---|---|
| **Priority** | `priority: critical` |
| **Type** | `type: data-science` |
| **Dependencies** | T-03 |
| **Effort** | High (2 hours) |
| **Files Affected** | `src/types/fireData.ts`, `src/engine/harmonizer.ts`, `src/engine/colorRamps.ts`, `tests/harmonizer.test.ts`, `tests/colorRamps.test.ts` |

**Description & Technical Context:**  
Implement the **TerraSpot 4-Stage Harmonization Engine** in TypeScript:
1. Geometric co-registration on $0.01^\circ$ grid (*Active Fire Cell-Days*).
2. Dynamic seasonal cross-calibration scaling factors ($\beta_m$) across the 2012–2025 overlap window.
3. Three-era temporal fusion (MODIS Solo Era 2000–2011, Dual Fusion Era 2012–2025, VIIRS Continuity Era 2026) with model fit metrics ($R^2$, Pearson $r$, and MAPE reduction).
4. Non-parametric monthly climatological median, IQR ($P_{25}\text{--}P_{75}$), critical alert threshold ($P_{90}$), robust $Z$-score, and the **Fire Regime Index ($I_{\text{regime}}$)** distinguishing agricultural burns from severe landscape wildfires.
5. Implement in `src/engine/colorRamps.ts` the **Inferno**, **Viridis**, **Cividis**, and **Diverging Blue-White-Red** scales, validating all logic with automated Vitest suites (Requirements R1, R4, R5, R6).

**Acceptance Criteria:**
- [x] Pure, strongly-typed functions in `src/engine/harmonizer.ts` recalculating 27 years × 12 months in $< 30\text{ ms}$ for any bounding box.
- [x] Accurate audit metrics demonstrating $R^2 > 0.90$ post-harmonization.
- [x] `src/engine/colorRamps.ts` provides continuous, colorblind-safe RGB/Hex interpolation.
- [x] Automated test suite passing at 100% in **Vitest** (`pnpm test:run`).

---

### SPRINT 2 — Design System, Mission Control Layout & Leaflet WebGIS AOI

#### T-05 — Semantic CSS Tokens, Aerospace Dark/Light Theme & Navigation Shell (`Navbar.tsx`)
| Attribute | Specification |
|---|---|
| **Priority** | `priority: high` |
| **Type** | `type: style` |
| **Dependencies** | T-04 |
| **Effort** | Medium (1.5 hours) |
| **Files Affected** | `src/index.css`, `src/components/Navbar.tsx`, `src/components/KPISummaryCards.tsx` |

**Description & Technical Context:**  
Implement semantic CSS design tokens defined in `docs/design-system.md` (aerospace dark mode `#0B0F17` by default and high-contrast light mode). Build `Navbar.tsx` featuring the regional preset selector, year range slider, FIRMS CSV upload modal trigger, CSV export button, theme toggle, and executive `KPISummaryCards.tsx`.

**Acceptance Criteria:**
- [x] Semantic CSS variables configured for dark and light modes with WCAG 2.1 AA contrast compliance.
- [x] Fully functional `Navbar.tsx` with global controls for region, temporal window, and export actions.
- [x] `KPISummaryCards.tsx` displaying live metrics: *Total Harmonized Hotspots*, *Peak Fire Season*, *Selected Year Anomaly ($\Delta\%$ & Z-Score)*, and *Dominant Fire Regime Badge*.

---

#### T-06 — Interactive WebGIS Canvas with Bounding Box Tool, Lat/Lon Inputs & NASA GIBS (`MapAOISelector.tsx`)
| Attribute | Specification |
|---|---|
| **Priority** | `priority: critical` |
| **Type** | `type: feature` |
| **Dependencies** | T-05 |
| **Effort** | High (2.5 hours) |
| **Files Affected** | `src/components/MapAOISelector.tsx` |

**Description & Technical Context:**  
Develop the interactive cartographic module with Leaflet (`MapAOISelector.tsx`) satisfying Requirement R3:
1. Interactive tool to **draw a rectangular bounding box** directly on the map viewport.
2. Synchronized numeric form inputs for `Min Lat`, `Max Lat`, `Min Lon`, and `Max Lon`.
3. Active fire cell density overlay colored by Fire Radiative Power (FRP) and regime classification.
4. Basemap switcher and satellite tile layer integration via **NASA EOSDIS GIBS (WMTS)** (MODIS/VIIRS corrected reflectance and thermal anomalies).

**Acceptance Criteria:**
- [x] Drawing a bounding box or editing coordinate inputs triggers instant re-harmonization of the calendar matrix and charts for that area.
- [x] Quick-select buttons for the 5 benchmark study regions (Huánuco/Peru, Amazon Basin, Paraná Delta, California, Australia) with smooth map transitions (`flyToBounds`).
- [x] NASA GIBS satellite layers and hotspot markers render with informative contextual popups.

---

### SPRINT 3 — Burning Activity Calendar Matrix, Anomaly Analytics & CSV

#### T-07 — Interactive Burning Activity Calendar Matrix (`BurningCalendarMatrix.tsx`)
| Attribute | Specification |
|---|---|
| **Priority** | `priority: critical` |
| **Type** | `type: feature` |
| **Dependencies** | T-04, T-05 |
| **Effort** | High (2.5 hours) |
| **Files Affected** | `src/components/BurningCalendarMatrix.tsx` |

**Description & Technical Context:**  
Construct the core deliverable mandated by NASA Challenge 15 (**Requirements R2 and R4**): the interactive 27-year (2000–2026) × 12-month (Jan–Dec) **Burning Activity Calendar Matrix**:
1. View Mode Switcher:
   - **Mode 1:** *Harmonized Hotspot Frequency* ($H_{y,m}$).
   - **Mode 2:** *Historical Anomaly ($\Delta\%$ vs. Multi-Year Median)* with diverging scale.
   - **Mode 3:** *Fire Radiative Power (FRP MW) & Regime Intensity*.
   - **Mode 4:** *Raw Unharmonized Counts* (visualizing the artificial 2012 step-jump).
2. Accessible Color Ramp Selector (*Inferno*, *Viridis*, *Cividis*, *Diverging Blue-White-Red*).
3. Marginal summary bars: Annual cumulative sum bar on the right and monthly historical median bar on the bottom.
4. Rich interactive tooltips and cell selection synchronizing downstream analytical panels on click.

**Acceptance Criteria:**
- [x] High-density 27 × 12 matrix rendering with sensor era indicators (`MODIS Era`, `Dual Fusion Era`, `VIIRS Continuity`).
- [x] Instant toggle between 4 analytical metrics and 4 colorblind-safe palettes.
- [x] Visual alert badges on cells exceeding critical thresholds ($P_{90}$ / $Z \ge 2.0$).
- [x] Clicking any cell or year updates the lower climatology curve and detailed inspection view.

---

#### T-08 — Climatology Curve, Anomaly Analytics & Sensor Audit (`ClimatologyAnomalyChart.tsx` & `SensorHarmonizationAudit.tsx`)
| Attribute | Specification |
|---|---|
| **Priority** | `priority: high` |
| **Type** | `type: feature` |
| **Dependencies** | T-07 |
| **Effort** | Medium (2 hours) |
| **Files Affected** | `src/components/ClimatologyAnomalyChart.tsx`, `src/components/SensorHarmonizationAudit.tsx` |

**Description & Technical Context:**  
Develop the scientific validation chart panels (Requirements R1 and R5):
1. `ClimatologyAnomalyChart.tsx`: Plots the active year's monthly fire trajectory against the **Multi-Year Climatological Median (2001–2025)**, the interquartile range envelope ($P_{25}\text{--}P_{75}$), and the critical alert threshold ($P_{90}$).
2. `SensorHarmonizationAudit.tsx`: Displays the full interannual 2000–2026 time series comparing raw MODIS (1 km), raw VIIRS (375 m), 1 km active cell-days, and the **Final Harmonized Series**, accompanied by statistical model fit cards ($R^2$, monthly $\beta_m$ factors, and MAPE reduction).

**Acceptance Criteria:**
- [x] Interactive climatological chart with year selector comparing active season against baseline medians.
- [x] Sensor audit plot demonstrating visual elimination of the 2012 sensor step-jump.
- [x] Display of calculated monthly calibration factors $\beta_1 \dots \beta_{12}$ for the selected AOI.

---

#### T-09 — Fire Regime Classifier: Agricultural Burning vs. Wildfires (`FireRegimePanel.tsx`)
| Attribute | Specification |
|---|---|
| **Priority** | `priority: medium` |
| **Type** | `type: feature` |
| **Dependencies** | T-07 |
| **Effort** | Medium (1.5 hours) |
| **Files Affected** | `src/components/FireRegimePanel.tsx` |

**Description & Technical Context:**  
Implement the analytical module fulfilling TerraSpot Harmonizer's core domain value proposition (Requirement R6): separating **seasonal agricultural burning** (daytime, low FRP, crop stubble management) from **severe forest wildfires** (high FRP, high nocturnal persistence). Features an FRP vs. Nighttime Persistence scatter plot, percentage distribution breakdown, and operational recommendations for civil defense and agricultural authorities.

**Acceptance Criteria:**
- [ ] Interactive scatter plot separating monthly records into three quadrants: *Seasonal Agricultural Burn*, *Mixed Transitional*, and *Severe Wildfire Event*.
- [ ] Context-aware operational recommendations based on active AOI conditions.

---

#### T-10 — Standardized CSV Exporter & Custom NASA FIRMS CSV Ingestion (`csvExporter.ts` & `CustomCSVModal.tsx`)
| Attribute | Specification |
|---|---|
| **Priority** | `priority: high` |
| **Type** | `type: feature` |
| **Dependencies** | T-07, T-08, T-09 |
| **Effort** | Medium (1.5 hours) |
| **Files Affected** | `src/engine/csvExporter.ts`, `src/components/CustomCSVModal.tsx`, `src/App.tsx` |

**Description & Technical Context:**  
Fulfill Challenge 15 Requirement R7:
1. `csvExporter.ts`: Generate and download with one click the complete 27-year × 12-month CSV dataset for the active AOI (including raw counts, AFCD, $\beta_m$, harmonized counts, historical medians, anomalies, $Z$-scores, FRP, and regime classifications).
2. `CustomCSVModal.tsx`: Modal interface allowing scientists and judges to upload raw NASA FIRMS CSV files (MODIS or VIIRS) or load the provided `sample_firms_huanuco.csv` for real-time in-browser harmonization.
3. *NASA Global Offers Integration:* Formulate CSV metadata schema and spatial bounds aligned with **Microsoft Planetary Computer STAC Catalog** and document in-situ fire weather correlation with **Meteomatics Weather API** (`forest_fire_warning:idx` and multi-layer soil moisture).
4. *Future Enhancement (T-08 Audit):* Include quick snapshot/image export (SVG/PNG) for the seasonal climatology and audit charts for operational field reporting.

**Acceptance Criteria:**
- [ ] **"Download Harmonized CSV"** button exports an RFC 4180 CSV containing all 27 columns specified in `docs/04-firms-data-specification.md`.
- [ ] **"Upload Custom FIRMS CSV"** modal parses user CSV files client-side and dynamically re-renders the calendar and charts.

---

### SPRINT 4 — UI/UX Polish, Public HTTPS Deployment & NASA Global Submission

#### T-11 — Quality Audit, Visual Accessibility & Public Production Deployment
| Attribute | Specification |
|---|---|
| **Priority** | `priority: critical` |
| **Type** | `type: presentation` |
| **Dependencies** | T-10 |
| **Effort** | Low (1.5 hours) |
| **Files Affected** | `src/App.tsx`, `README.md`, deployment config (Vercel / GitHub Pages) |

**Description & Technical Context:**  
Perform final UI/UX polish, cross-device responsiveness verification, compile clean static production bundle (`pnpm build` with zero warnings), and deploy to a public HTTPS URL without passwords or access restrictions (Requirement R8).
1. *NASA Global Offers Integration:* Claim and configure official custom mission domain via **GoDaddy Registry & Porkbun** (free domain + 1-year SSL certificate) for primary deployment URL, with automatic Vercel / GitHub Pages edge fallback.
2. *Future Enhancement (T-08 Audit):* Implement docked bottom positioning or compact mode for floating telemetry tooltips on ultra-small mobile screens ($< 360\text{ px}$).

**Acceptance Criteria:**
- [ ] `pnpm build` compiles cleanly with zero TypeScript errors and zero critical warnings.
- [ ] Application deployed to public HTTPS URL verified in an incognito browser window.
- [ ] Public GitHub repository fully synchronized.

---

#### T-12 — Executive 7-Slide Presentation & Official NASA Space Apps Submission (`v1.0.0`)
| Attribute | Specification |
|---|---|
| **Priority** | `priority: critical` |
| **Type** | `type: presentation` |
| **Dependencies** | T-11 |
| **Effort** | Medium (2 hours) |
| **Files Affected** | `public/demo-slides.html`, `docs/05-submission-pitch-rubric-plan.md`, `CHANGELOG.md`, `package.json` |

**Description & Technical Context:**  
Construct the interactive **7-slide presentation deck** in English (strictly meeting NASA Global Judging limits), verify live demo and project links in `docs/05-submission-pitch-rubric-plan.md`, and finalize SemVer `1.0.0` in `package.json` and `CHANGELOG.md`.
1. *NASA Global Offers Integration:* Feature **Meteomatics Weather API**, **GoDaddy / Porkbun**, **Microsoft Planetary Computer**, **GitHub Copilot**, and **Miro** across Slides 3, 5, 6, and the official submission form fields to maximize the *Partner Resources & Global Offers* rubric score.

**Acceptance Criteria:**
- [ ] Exactly **7 slides in English** presenting TerraSpot Harmonizer architecture, results, and Huánuco/Amazon case studies.
- [ ] All submission form text fields verified in English and ready for submission before the deadline, with Global Offers declared.
- [ ] Version `1.0.0` tagged and recorded in `CHANGELOG.md`.

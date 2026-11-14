# Changelog

All notable changes to the **TerraSpot Harmonizer** project (**NASA Space Apps Challenge 2026**) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning (SemVer 2.0.0)](https://semver.org/).

---

## [Unreleased]

### Planned

- **Sprint 1 (`T-02`):** Web application scaffolding with React 19, TypeScript 5.7+, Vite 6, Tailwind CSS v4, Vitest, and Husky git hooks.
- **Sprint 1 (`T-03`):** Scientific Python pipeline (`scripts/build_harmonized_cubes.py`) for NASA FIRMS historical archive processing (MODIS C6.1 and VIIRS 375m C2, 2000–2026).
- **Sprint 1 (`T-04`):** Pure TypeScript mathematical engine (`harmonizer.ts`) implementing the *TerraSpot 4-Stage* algorithm and accessible color scales (`colorRamps.ts`).
- **Sprint 2 (`T-05`, `T-06`):** *NASA Mission Control* design system, KPI summary cards, and interactive Leaflet WebGIS canvas with bounding box drawing and NASA GIBS WMTS satellite tile overlays.
- **Sprint 3 (`T-07`, `T-08`, `T-09`, `T-10`):** 27-year × 12-month *Burning Activity Calendar Matrix*, climatological anomaly curves, sensor audit view, agricultural vs. wildfire regime classifier, and standardized CSV exporter/uploader.
- **Sprint 4 (`T-11`, `T-12`):** Public HTTPS edge deployment, executive 7-slide presentation deck in English, and final `1.0.0` release.

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

# Implementation Plan: NASA FIRMS Spatiotemporal Data Pipeline & Benchmark Cubes

**Branch**: `feat/T-03-pipeline-datos-firms` | **Date**: 2026-11-14 | **Spec**: [specs/002-firms-data-pipeline/spec.md](spec.md)

**Input**: Feature specification from `specs/002-firms-data-pipeline/spec.md`

---

## Summary

Design and implement the reproducible scientific data pipeline (`scripts/build_harmonized_cubes.py`) on Python `3.13.5` (`uv`) implementing the **TerraSpot 4-Stage Harmonization Methodology** (`docs/02-modis-viirs-harmonization-methodology.md`). The pipeline filters raw MODIS Collection 6.1 ($1\text{ km}$, 2000–2026) and VIIRS Collection 2 ($375\text{ m}$, 2012–2026) thermal detections, bins observations into $0.01^\circ \times 0.01^\circ$ Active Fire Cell-Days (AFCD), derives monthly Laplace-smoothed scaling factors ($\beta_m$) over the 2012–2025 overlap window ($R^2 > 0.90$), and computes non-parametric climatological baselines (2001–2025) and Fire Regime Intensity Indices ($I_{\text{regime}}$). It outputs `public/data/regions_catalog.json` (5 benchmark regions × 322 months), `public/data/firms_spatial_cells.json` ($0.01^\circ$ cartographic density cells), and `public/data/sample_firms_huanuco.csv` (RFC 4180 raw FIRMS fixture).

---

## Technical Context

**Language/Version**: Python `3.13.5` (strictly compatible with `Python >= 3.10`) managed via `uv 0.12.3` + TypeScript `7.0.2` verification tests  
**Primary Dependencies**: Python Standard Library (`csv`, `json`, `math`, `statistics`, `random`, `dataclasses`, `pathlib`, `typing`, `argparse`) with PEP 723 inline script metadata  
**Storage**: Static pre-indexed JSON cubes and RFC 4180 CSV fixtures in `public/data/` (`< 1.5 MB` total uncompressed)  
**Testing**: Python `--verify` invariant self-check + Vitest `5.1.0` data contract validation suite (`tests/dataPipeline.test.ts`)  
**Target Platform**: Linux / macOS / Windows CLI (offline build step) producing static web assets for Evergreen Browsers  
**Project Type**: Scientific Data Engineering Pipeline + Static Edge Data Bundle  
**Performance Goals**: Complete generation of all 5 regional 27-year cubes and spatial cells in `< 2 seconds` (`SC-001` target `< 5s`)  
**Constraints**: 100% deterministic output (`seed = 202615`), zero external API keys required, $R^2 > 0.90$ overlap convergence, zero `NaN`/`null` values  
**Scale/Scope**: 5 benchmark AOIs × 322 months (`2000-01` to `2026-10` = 1,610 monthly records), 250 active $0.01^\circ$ spatial cells (50 per region), and ~1,200 raw sample FIRMS detections for Huánuco  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Constitutional Principle | Architectural Compliance Status | Verification Mechanism |
| :--- | :--- | :--- |
| **I. Dual-Language Governance** | **PASS** | Developer reporting in Spanish; all Python docstrings, CLI output, JSON keys, and documentation in professional English. |
| **II. Package Manager & Toolchain Strictness** | **PASS** | Python `3.13.x` / `uv` used for data pipeline; `pnpm 12.21.0` used exclusively for Vitest validation and Vite build. |
| **III. Mathematical & Physical Rigor** | **PASS** | Implements Stage 1 (`type == 0`, confidence masks), Stage 2 ($0.01^\circ$ AFCD), Stage 3 ($\beta_m$ with $R^2 > 0.90$), and Stage 4 ($\widetilde{M}_m$, $Z_{\text{robust}}$, $I_{\text{regime}}$). |
| **IV. Visual Accessibility (WCAG 2.1 AA)** | **PASS** | Pre-computes bounded normalized indices ($I_{\text{regime}} \in [0, 100]$, $Z_{\text{robust}}$) ready for direct mapping onto colorblind-safe palettes. |
| **V. NASA Space Apps Compliance** | **PASS** | Integrates official NASA FIRMS MODIS C6.1 & VIIRS 375m C2 schemas and highlights the CONAE / Paraguayan Space Agency regional partnership (`AR-PAR`) and Huánuco local benchmark (`PE-HCO`). |
| **VI. Commit Gatekeeping & SDD** | **PASS** | All artifacts verified via Vitest and `pnpm build`; commits gated on explicit user approval (*"visto bueno"*). |

---

## Project Structure

### Documentation (`specs/002-firms-data-pipeline/`)

```text
specs/002-firms-data-pipeline/
├── spec.md                                  # Feature specification & acceptance criteria
├── plan.md                                  # This implementation plan
├── research.md                              # Phase 0 technical decisions & ADRs
├── data-model.md                            # Phase 1 entity schemas & state transitions
├── quickstart.md                            # Phase 1 CLI execution & verification guide
├── contracts/
│   ├── regions_catalog.schema.json          # JSON Schema for regions_catalog.json
│   └── firms_spatial_cells.schema.json      # JSON Schema for firms_spatial_cells.json
└── checklists/
    └── requirements.md                      # Quality validation checklist (16/16 passed)
```

### Source Code & Data Artifacts (Repository Root)

```text
hackaton-nasa/
├── scripts/
│   ├── create_github_issues.py              # Existing GitHub Project automation
│   └── build_harmonized_cubes.py            # [NEW] 4-Stage NASA FIRMS data pipeline (Python 3.13 / uv)
├── public/
│   └── data/
│       ├── regions_catalog.json             # [NEW] 5 benchmark regions × 322 harmonized monthly records
│       ├── firms_spatial_cells.json         # [NEW] 0.01° gridded spatial density cells
│       └── sample_firms_huanuco.csv         # [NEW] Standardized raw NASA FIRMS CSV for Huánuco
├── src/
│   └── types/
│       ├── firms.ts                         # Raw detection & AFCD interfaces
│       ├── harmonization.ts                 # HarmonizedMonthlyRecord & era contracts
│       └── region.ts                        # BenchmarkRegion & RegionCatalog contracts
└── tests/
    └── dataPipeline.test.ts                 # [NEW] Vitest suite validating generated JSON/CSV contracts
```

**Structure Decision**: The offline scientific generator lives in `scripts/build_harmonized_cubes.py` and writes static edge-ready data bundles directly to `public/data/`, while `src/types/` and `tests/dataPipeline.test.ts` enforce strict end-to-end schema and mathematical contract compliance between Python and TypeScript.

---

## Complexity Tracking

> **Zero Constitutional Violations** — All 6 core principles pass without exception.

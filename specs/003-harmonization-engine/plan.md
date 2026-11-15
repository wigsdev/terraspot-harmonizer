# Implementation Plan: Client-Side Spatiotemporal Harmonization Engine & Accessible Color Ramps

**Branch**: `feat/T-04-motor-armonizacion` | **Date**: 2026-11-14 | **Spec**: [specs/003-harmonization-engine/spec.md](spec.md)

**Input**: Feature specification from `specs/003-harmonization-engine/spec.md`

---

## Summary

Design and implement the client-side pure TypeScript mathematical harmonization engine (`src/engine/harmonizer.ts`) and WCAG 2.1 Level AA colorblind-safe color scale engine (`src/engine/colorRamps.ts`) adhering to **Stage 1–4** of `docs/02-modis-viirs-harmonization-methodology.md` and **Section 2.3** of `docs/design-system.md`. The engine executes radiometric quality masking (`type == 0`, MODIS `>= 30`, VIIRS `'n'`/`'h'`), $0.01^\circ$ Active Fire Cell-Day (AFCD) grid binning, regularized monthly cross-calibration ($\beta_1 \dots \beta_{12}$ over `2012–2025`, Laplace $\lambda = 1.0$, $R^2 > 0.90$), three-era temporal synthesis (`MODIS_SOLO`, `DUAL_SENSOR_FUSION` $0.70/0.30$, `VIIRS_CONTINUITY`), non-parametric climatology (`2001–2025` median, IQR, $P_{90}$, $\Delta\%$, $Z_{\text{robust}}$), Fire Regime Intensity Index ($I_{\text{regime}} \in [0, 100]$), arbitrary bounding-box spatial subsetting, and 5-stop colorblind-accessible palettes (`inferno`, `viridis`, `cividis`, `diverging`) with contrast-checked foreground typography ($\ge 4.5:1$).

---

## Technical Context

**Language/Version**: TypeScript `7.0.2` (strict mode, pure ES2022 functions, zero DOM/network coupling)  
**Primary Dependencies**: Zero third-party runtime math or color dependencies (`src/types/*` internal contracts only)  
**Storage**: Pure in-memory calculation over JSON/CSV contracts (`public/data/regions_catalog.json`, `public/data/firms_spatial_cells.json`, `public/data/sample_firms_huanuco.csv`)  
**Testing**: Vitest `5.1.0` automated unit, mathematical parity, contrast, and latency suites (`tests/harmonizer.test.ts`, `tests/colorRamps.test.ts`)  
**Target Platform**: Evergreen Browsers & Node/Vitest headless test environment (edge-first, client-side SPA)  
**Project Type**: Client-side Scientific Computation & Accessibility Library (`src/engine/`)  
**Performance Goals**: Recalculate 322 monthly observations or aggregate custom spatial bounding boxes in `< 30 ms` (`SC-001`)  
**Constraints**: Pure deterministic functions, zero `NaN`/`Infinity` outputs on degenerate/zero-fire inputs (`SC-003`), exact parity with Python pipeline `scripts/build_harmonized_cubes.py` (`SC-002`), and WCAG 2.1 AA contrast `>= 4.5:1` (`SC-004`)  
**Scale/Scope**: 5 benchmark cubes × 322 monthly records (`2000-01` to `2026-10`), 250 spatial cells (and up to 10k+ raw CSV detections for browser upload), and 4 certified palettes

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Constitutional Principle | Architectural Compliance Status | Verification Mechanism |
| :--- | :--- | :--- |
| **I. Dual-Language Governance** | **PASS** | All TypeScript identifiers, JSDoc docstrings, tests, and design artifacts in professional English; developer reporting in Spanish. |
| **II. Package Manager & Toolchain Strictness** | **PASS** | Uses `pnpm 12.21.0` exclusively for `pnpm typecheck`, `pnpm test:run`, and `pnpm build` (zero `npm`/`yarn`). |
| **III. Mathematical & Scientific Harmonization Rigor** | **PASS** | Implements exact Stages 1–4 equations from `docs/02-modis-viirs-harmonization-methodology.md` and matches Python pipeline (`build_harmonized_cubes.py`) to exact integer rounding. |
| **IV. Visual Accessibility (WCAG 2.1 AA)** | **PASS** | Enforces Inferno/Viridis/Cividis/Diverging anchors, prohibits Rainbow/Jet/Red-Green, and programmatically asserts $\ge 4.5:1$ contrast across `[0, 1]`. |
| **V. NASA Space Apps Compliance** | **PASS** | Zero AI-synthesized NASA imagery; traceable client-side sensor cross-calibration audit metrics ($R^2$, Pearson $r$, MAPE reduction). |
| **VI. SDD & Commit Gatekeeping** | **PASS** | Spec Kit SDD flow (`specify -> clarify -> plan -> tasks -> analyze -> implement`); Husky hooks and commit approval gates upheld. |

---

## Project Structure

### Documentation (this feature)

```text
specs/003-harmonization-engine/
├── spec.md                              # Feature specification & acceptance criteria
├── plan.md                              # This implementation plan
├── research.md                          # Phase 0 architectural decision records (ADRs)
├── data-model.md                        # Phase 1 TypeScript entity extensions & validation rules
├── quickstart.md                        # Phase 1 validation & benchmark test workflow
├── contracts/
│   └── engine-contracts.md              # Exported API signatures & invariants for src/engine/*
└── checklists/
    └── requirements.md                  # Spec quality validation checklist (16/16 passed)
```

### Source Code & Tests (repository root)

```text
hackaton-nasa/
├── src/
│   ├── types/
│   │   ├── firms.ts                     # Raw detections, AFCD cells, spatial cell summaries
│   │   ├── harmonization.ts             # Monthly records, alert status, filter stats, climatology, fit metrics
│   │   ├── palette.ts                   # Palette types, RGB color, accessible cell styles
│   │   ├── region.ts                    # BoundingBox, BenchmarkRegion, RegionCube, catalog
│   │   └── index.ts                     # Barrel exports
│   └── engine/
│       ├── harmonizer.ts                # [NEW] Pure 4-stage harmonization & spatial AOI engine
│       ├── colorRamps.ts                # [NEW] Colorblind-safe interpolation & WCAG 2.1 AA resolver
│       └── index.ts                     # [NEW] Barrel exports for engine functions and types
└── tests/
    ├── harmonizer.test.ts               # [NEW] Stages 1-4 math, edge cases, Python parity & perf (<30ms)
    └── colorRamps.test.ts               # [NEW] Palette stop exactness, diverging mapping & WCAG >=4.5:1
```

**Structure Decision**: Keeping `src/engine/harmonizer.ts` and `src/engine/colorRamps.ts` strictly DOM-free pure TypeScript modules enables headless execution inside Vitest (`tests/`), Web Workers for future custom CSV uploads (`T-10`), and zero-recalculation React memoization inside Leaflet/Calendar UI components (`T-05`–`T-08`).

---

## Complexity Tracking

> **Zero Constitutional Violations** — All 6 core principles pass cleanly with zero third-party runtime dependencies added.

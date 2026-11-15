# Quickstart & Validation Guide: TypeScript Harmonization & Color Ramps Engine

**Feature**: `003-harmonization-engine`  
**Branch**: `feat/T-04-motor-armonizacion`  

---

## Prerequisites

- Node.js `v24.x` with `pnpm 12.21.0`
- Pre-computed data bundles generated in Feature `002-firms-data-pipeline` (`public/data/regions_catalog.json`, `public/data/firms_spatial_cells.json`, `public/data/sample_firms_huanuco.csv`)

---

## Validation Scenarios

### 1. Execute Harmonization & Accessibility Vitest Suites

```bash
pnpm test:run tests/harmonizer.test.ts tests/colorRamps.test.ts
```

**Expected Verification Outcomes**:
- Stage 1 filtering achieves 100% exclusion of `type != 0` and low-confidence MODIS/VIIRS records.
- Stage 2 spatial binning consolidates multi-pixel daily hits on $0.01^\circ$ grid into integer Active Fire Cell-Days (`AFCD < detection_count`) and accumulates exact mean/max FRP.
- Stage 3 cross-calibration re-running over `public/data/regions_catalog.json` matches every benchmark region's pre-computed `seasonal_beta`, `validation_metrics` ($R^2 > 0.90$, MAPE reduction `> 65%`), and 322 `harmonized_hotspots` counts cleanly.
- Custom bounding-box subsetting (`reharmonizeSpatialSubset`) completes in `< 30 ms` and handles empty/inverted bounding boxes with zero `NaN`/`Infinity`.
- All 4 certified palettes (`inferno`, `viridis`, `cividis`, `diverging`) match `docs/design-system.md` anchor hexes at `t = 0.0, 0.25, 0.5, 0.75, 1.0`, normalize diverging anomalies around `0.5`, and select foreground text achieving WCAG 2.1 AA contrast $\ge 4.5:1$ across `[0.0, 1.0]`.

### 2. Full Project Quality Gates

```bash
pnpm typecheck && pnpm test:run && pnpm build
```

**Expected Verification Outcomes**:
- `tsc --noEmit`: exit code `0` (strict TypeScript, zero unused locals/parameters).
- `vitest run`: 100% tests passing across all suites (`smoke.test.ts`, `App.test.tsx`, `dataPipeline.test.ts`, `harmonizer.test.ts`, `colorRamps.test.ts`).
- `pnpm build`: clean `tsc -b && vite build` bundle emission into `dist/`.

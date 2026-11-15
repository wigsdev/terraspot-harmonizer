# Quickstart & Validation Guide: NASA FIRMS Data Pipeline

**Feature**: `002-firms-data-pipeline`  
**Date**: 2026-11-14  

---

## 1. Prerequisites

Verify local Python 3.13 and `uv` availability:

```bash
python3 --version   # Expected: Python 3.13.x (compatible with >= 3.10)
uv --version        # Expected: uv 0.12.x+
```

---

## 2. Running the Scientific Pipeline

Execute the pipeline to generate all benchmark spatiotemporal cubes and the Huánuco sample FIRMS CSV:

```bash
# Option A: Direct execution with system Python 3.13
python3 scripts/build_harmonized_cubes.py

# Option B: Hermetic execution via uv
uv run scripts/build_harmonized_cubes.py
```

### Expected Console Summary
- Confirms Stage 1 radiometric filtering (`type == 0`, confidence thresholds).
- Confirms Stage 2 $0.01^\circ$ spatial grid aggregation (AFCD).
- Reports Stage 3 seasonal $\beta_m$ factors and $R^2 > 0.90$ convergence for all 5 regions (`PE-HCO`, `SAM-MAP`, `AR-PAR`, `US-CAL`, `AU-NSW`).
- Outputs artifacts to `public/data/`:
  - `public/data/regions_catalog.json`
  - `public/data/firms_spatial_cells.json`
  - `public/data/sample_firms_huanuco.csv`

---

## 3. Automated Verification & Quality Gates

Verify data integrity, mathematical invariants, and frontend build compatibility:

```bash
# 1. Verify pipeline self-check flag
python3 scripts/build_harmonized_cubes.py --verify

# 2. Run Vitest unit & contract verification suite
pnpm test:run

# 3. Verify clean production build with generated public/data/ assets
pnpm build
```

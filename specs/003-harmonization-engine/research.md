# Research & Architectural Decision Records: Client-Side Harmonization Engine

**Feature**: `003-harmonization-engine`  
**Date**: 2026-11-14  

---

## ADR-006: Numerical Parity Between Offline Python Pipeline and Client TypeScript Engine

- **Decision**: Replicate the exact mathematical operations, baseline slices (`2001–2025`), overlap window (`2012–2025`), Laplace smoothing ($\lambda = 1.0$), linear quantile interpolation, and half-up integer rounding (`Math.round(x)` for non-negative `x`, matching `math.floor(x + 0.5)` in `scripts/build_harmonized_cubes.py`) inside `src/engine/harmonizer.ts`.
- **Rationale**: Judges testing client-side recalculation or re-harmonizing the pre-computed `PE-HCO` / `US-CAL` records expect zero rounding drift between Python-generated `public/data/regions_catalog.json` values and live browser calculations (`SC-002`).
- **Alternatives Considered**:
  - *Rank-7 `statistics.quantiles` or nearest-rank quantiles*: Rejected because nearest-rank produces step jumps across small sample sizes ($N = 25$ baseline years), whereas linear interpolation ($pos = q \times (n - 1)$) matches standard NumPy/SciPy and Python pipeline output identically.

---

## ADR-007: Dual-Mode Spatial AOI Recalculation (< 30 ms Budget)

- **Decision**: Support two distinct client recalculation entry points in `src/engine/harmonizer.ts`:
  1. **`reharmonizeSpatialSubset(cells, baseRegion, customBbox)`**: Filters `public/data/firms_spatial_cells.json` entries inside normalized `customBbox`, aggregates annual cell-day shares scaled proportionally against the regional monthly temporal phenology and sensor energetics, and re-runs Stage 3–4 harmonization across all 322 months in $< 2\text{ ms}$.
  2. **`harmonizeRawDetections(detections)`**: Runs full Stages 1–4 directly over arbitrary user-uploaded NASA FIRMS CSV rows (`RawFirmsDetection[]`) in $< 15\text{ ms}$ for datasets of thousands of detections.
- **Rationale**: Allows instant interactive bounding-box drawing on the Leaflet map (`T-06`) over `firms_spatial_cells.json` while keeping raw point ingestion (`T-10`) cleanly decoupled on identical mathematical primitives (`aggregateToAfcdGrid`, `calculateSeasonalBeta`, `harmonizeTimeSeries`, `computeMonthlyClimatology`, `classifyFireRegime`).
- **Alternatives Considered**:
  - *Re-bundling full raw multi-decadal detections in browser*: Rejected due to payload size limits ($> 100\text{ MB}$ raw FIRMS CSV vs. `< 1.5\text{ MB}$ pre-indexed cells & catalog).

---

## ADR-008: 5-Stop Piecewise-Linear Color Ramps & WCAG 2.1 AA Contrast Selection

- **Decision**: Implement `inferno`, `viridis`, `cividis`, and `diverging` strictly via exact 5-stop hex anchors from Section 2.3 of `docs/design-system.md` (`offset` in `0.00, 0.25, 0.50, 0.75, 1.00`) using piecewise-linear RGB channel interpolation (`round(c0 + (c1 - c0) * localT)`). Compute W3C WCAG 2.1 relative luminance ($L = 0.2126 R_{\text{lin}} + 0.7152 G_{\text{lin}} + 0.0722 B_{\text{lin}}$ with sRGB linearization at $0.03928$ / $0.04045$ cutoff) and select `#0B0F17` (dark aerospace ink) vs. `#F8FAFC` (crisp white ink) maximizing contrast ratio ($CR = \frac{L_1 + 0.05}{L_2 + 0.05}$).
- **Rationale**: Choosing the higher-contrast candidate between `#0B0F17` ($L \approx 0.0056$) and `#F8FAFC` ($L \approx 0.953$) guarantees mathematically that every background color $L \in [0, 1]$ achieves at least $\sim 4.8:1$ contrast ratio (strictly above WCAG 2.1 Level AA `4.5:1` for normal text). Zero external dependency like `chroma-js` or `d3-scale-chromatic` is needed, keeping bundle size minimal.
- **Alternatives Considered**:
  - *Using fixed luminance cutoff `L > 0.179` without comparing both text candidates*: Same transition point mathematically (`sqrt(1.05 * 0.0556) - 0.05`), but computing actual ratios for both candidates makes `ColorCellStyle.contrastRatio` explicitly inspectable in unit tests and tooltips.

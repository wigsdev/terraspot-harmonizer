# Engine Module API Contracts (`src/engine/`)

**Feature**: `003-harmonization-engine`  
**Date**: 2026-11-14  

---

## 1. `src/engine/harmonizer.ts`

Pure, stateless TypeScript functions implementing Stages 1–4 of `docs/02-modis-viirs-harmonization-methodology.md`.

### Constants
- `GRID_RESOLUTION_DEG = 0.01`
- `OVERLAP_START_YEAR = 2012`
- `OVERLAP_END_YEAR = 2025`
- `CLIMATOLOGY_START_YEAR = 2001`
- `CLIMATOLOGY_END_YEAR = 2025`
- `LAPLACE_LAMBDA = 1.0`
- `VIIRS_FUSION_WEIGHT = 0.70`
- `MODIS_FUSION_WEIGHT = 0.30`

### Stage 1: Radiometric Quality Masking & Filtering
- `isValidVegetationFire(detection: RawFirmsDetection): boolean`
  - Requires `detection.type === 0`.
  - MODIS / numeric confidence: `>= 30`.
  - VIIRS / categorical confidence: `'n'` or `'h'` (case-insensitive).
- `filterQualityDetections(detections: RawFirmsDetection[]): { valid: RawFirmsDetection[]; stats: QualityFilterStats }`
  - Returns clean detections plus counts of rejected non-vegetation (`type != 0`) and low-confidence records.

### Stage 2: $0.01^\circ$ Spatial Grid Aggregation (AFCD)
- `getGridCoordinates(lat: number, lon: number, gridSizeDeg?: number): { grid_x: number; grid_y: number }`
  - Deterministic floor projection `Math.floor(lon / gridSizeDeg)` and `Math.floor(lat / gridSizeDeg)`.
- `aggregateToAfcdGrid(detections: RawFirmsDetection[], gridSizeDeg?: number): ActiveFireCellDay[]`
  - Collapses same-day, same-sensor detections inside `(grid_x, grid_y)` into $1$ `ActiveFireCellDay` with `mean_frp`, `max_frp`, `detection_count`, and `has_night_fire`.
- `groupCellDaysByMonth(cellDays: ActiveFireCellDay[], detections?: RawFirmsDetection[]): MonthlySensorObservation[]`
  - Converts daily grid cells (or paired filtered detections) into chronological monthly sensor observations computing `raw_modis_count`, `raw_viirs_count`, `afcd_modis`, `afcd_viirs`, `mean_frp_mw`, `p90_frp_mw`, and `night_fraction`.

### Stage 3: Seasonal Cross-Calibration ($\beta_m$) & 3-Era Synthesis
- `calculateSeasonalBeta(observations: MonthlySensorObservation[], lambda?: number): Record<string, number>`
  - Computes regularized scaling factors for keys `'1'` through `'12'` over overlap window `2012–2025` rounded to 4 decimals.
- `computeValidationMetrics(observations: MonthlySensorObservation[], seasonalBeta: Record<string, number>): ValidationMetrics`
  - Computes `r_squared`, `pearson_r`, `raw_mape_pct`, `harmonized_mape_pct`, and `mape_reduction_pct` over `2012–2025`.
- `harmonizeTimeSeries(observations: MonthlySensorObservation[], overrideBeta?: Record<string, number>): HarmonizationResult`
  - Executes Stage 3 three-era fusion (`MODIS_SOLO`, `DUAL_SENSOR_FUSION`, `VIIRS_CONTINUITY`) and Stage 4 climatology/regime classification cleanly.

### Stage 4: Non-Parametric Climatology & Fire Regime Classification
- `linearPercentile(sortedValues: number[], q: number): number`
  - Linear quantile interpolation (`q` clamped to `[0, 1]`).
- `computeMonthlyClimatology(records: Array<{ year: number; month: number; harmonized_hotspots: number }>): Record<string, MonthlyClimatology>`
  - Computes `median`, `p25`, `p75`, `iqr`, `p90` strictly over `2001–2025`.
- `classifyAnomalyStatus(harmonizedHotspots: number, p90Threshold: number, robustZScore: number): AnomalyAlertStatus`
  - Evaluates `'NORMAL' | 'ELEVATED' | 'CRITICAL'`.
- `classifyFireRegime(p90FrpMw: number, nightFraction: number): { fire_regime_index: number; regime_class: FireRegimeClass }`
  - Computes $I_{\text{regime}} \in [0, 100]$ and categorical regime class (`<= 35` -> `AGRICULTURAL_BURN`, `<= 65` -> `TRANSITIONAL`, `> 65` -> `SEVERE_WILDFIRE`).

### Dynamic AOI Subsetting & Full CSV Pipeline Helper
- `normalizeBoundingBox(bbox: BoundingBox): BoundingBox`
  - Orders swapped latitudes/longitudes safely (`min <= max`).
- `reharmonizeSpatialSubset(cells: SpatialGridCellSummary[], baseRegion: RegionCube, customBbox: BoundingBox): HarmonizationResult`
  - Filters `cells` strictly within `normalizeBoundingBox(customBbox)`, computes regional proportional monthly activity across `2000-01` to `2026-10` using cell annual shares and cell-level energetics, and executes `harmonizeTimeSeries`. Returns deterministic zeroed records cleanly if zero cells fall inside `customBbox`.
- `harmonizeRawDetections(detections: RawFirmsDetection[]): { filterStats: QualityFilterStats; cellDays: ActiveFireCellDay[]; result: HarmonizationResult }`
  - Executes complete end-to-end Stages 1–4 on uploaded NASA FIRMS detections.

---

## 2. `src/engine/colorRamps.ts`

Pure TypeScript color interpolation and WCAG 2.1 Level AA accessibility verifier.

### Constants
- `ACCESSIBLE_PALETTES: Record<PaletteType, AccessiblePalette>`
- `DARK_TEXT_HEX = '#0B0F17'`
- `LIGHT_TEXT_HEX = '#F8FAFC'`
- `WCAG_AA_MIN_CONTRAST = 4.5`

### Helpers & Functions
- `hexToRgb(hex: string): RgbColor`
- `rgbToHex(rgb: RgbColor): string`
- `normalizeValue(value: number, min: number, max: number): number`
  - Clamps normalized value to `[0, 1]`; guards `min >= max` and non-finite inputs (`0.0`).
- `normalizeDivergingAnomaly(departurePercentage: number, maxMagnitude?: number): number`
  - Maps symmetric `[-maxMagnitude, +maxMagnitude]` (default `100%`) onto `[0.0, 1.0]` centered cleanly at `0.5` for `0%`.
- `interpolatePaletteRgb(palette: PaletteType, t: number): RgbColor`
- `interpolatePaletteHex(palette: PaletteType, t: number): string`
- `getRelativeLuminance(hexOrRgb: string | RgbColor): number`
- `getContrastRatio(fgHex: string, bgHex: string): number`
- `getAccessibleTextColor(bgHex: string): { textHex: '#0B0F17' | '#F8FAFC'; contrastRatio: number }`
- `getAccessibleCellStyle(palette: PaletteType, t: number): ColorCellStyle`
- `getPaletteCssGradient(palette: PaletteType, direction?: string): string`
  - Produces CSS `linear-gradient(...)` string for interactive heatmap legends.

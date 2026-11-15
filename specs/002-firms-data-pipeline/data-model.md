# Data Model & Output Schemas: NASA FIRMS Data Pipeline

**Feature**: `002-firms-data-pipeline`  
**Date**: 2026-11-14  

---

## 1. Pipeline Processing Stages & State Transitions

```text
[Raw FIRMS Detections (MODIS C6.1 / VIIRS C2)]
       │
       ▼  Stage 1: Quality & Vegetation Masking (type == 0, conf >= 30% | 'n','h')
[Filtered Vegetation Detections]
       │
       ▼  Stage 2: 0.01° Spatial Grid Binning (gx = floor(lon*100), gy = floor(lat*100))
[Daily Active Fire Cell-Days (AFCD) & Spatial Cell Summaries]
       │
       ▼  Stage 3: 2012–2025 Overlap Cross-Calibration (Seasonal Beta_m & Era Fusion)
[Harmonized Monthly Series H_(y,m) (2000-01 to 2026-10)]
       │
       ▼  Stage 4: Non-Parametric Climatology (2001–2025) & Fire Regime Index I_regime
[Output Artifacts: regions_catalog.json, firms_spatial_cells.json, sample_firms_huanuco.csv]
```

---

## 2. Core Data Entities

### 2.1 `RegionsCatalogDocument` (`public/data/regions_catalog.json`)

Top-level JSON structure consumed by the frontend application:

| Field | Type | Constraints / Description |
| :--- | :--- | :--- |
| `generated_at` | `string` | Deterministic ISO-8601 timestamp (`"2026-11-14T00:00:00Z"`) |
| `methodology_version` | `string` | `"TerraSpot-4Stage-v1.0"` |
| `grid_resolution_deg` | `number` | `0.01` ($\sim 1.11\text{ km}$ equatorial equivalent) |
| `temporal_coverage` | `object` | `{"start": "2000-01", "end": "2026-10", "total_months": 322, "climatology_baseline": [2001, 2025], "overlap_window": [2012, 2025]}` |
| `regions` | `RegionCube[]` | Array of 5 calibrated benchmark region cubes (`PE-HCO`, `SAM-MAP`, `AR-PAR`, `US-CAL`, `AU-NSW`) |

### 2.2 `RegionCube` Entity

Aligns with `BenchmarkRegion` (`src/types/region.ts`) and `HarmonizedMonthlyRecord` (`src/types/harmonization.ts`):

| Field | Type | Constraints / Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique region code (`"PE-HCO"`, `"SAM-MAP"`, `"AR-PAR"`, `"US-CAL"`, `"AU-NSW"`) |
| `name` | `string` | Display name in English |
| `country` | `string` | Country / international territory label |
| `bbox` | `BoundingBox` | `{"min_lat": float, "max_lat": float, "min_lon": float, "max_lon": float}` |
| `center` | `[number, number]` | `[lat, lon]` map viewport center |
| `default_zoom` | `number` | Default Leaflet zoom level (`6` or `7`) |
| `description` | `string` | Ecosystem and fire regime analytical summary |
| `typical_fire_regime` | `string` | Primary regional combustion dynamics |
| `peak_season_months` | `number[]` | Array of peak fire activity calendar months ($1\text{--}12$) |
| `seasonal_beta` | `Record<string, number>` | Keys `"1"` to `"12"` mapping to $\beta_m$ scaling ratios |
| `validation_metrics` | `ValidationMetrics` | `{"r_squared": float, "pearson_r": float, "raw_mape_pct": float, "harmonized_mape_pct": float, "mape_reduction_pct": float}` |
| `climatology_by_month` | `Record<string, MonthlyClimatology>` | Keys `"1"` to `"12"` with `median`, `p25`, `p75`, `iqr`, `p90` |
| `monthly_records` | `HarmonizedMonthlyRecord[]` | 322 chronological records (`2000-01` through `2026-10`) |

### 2.3 `HarmonizedMonthlyRecord` Entity

Matches `src/types/harmonization.ts`:

| Field | Type | Validation Rule |
| :--- | :--- | :--- |
| `year` | `number` | Integer $2000 \le y \le 2026$ |
| `month` | `number` | Integer $1 \le m \le 12$ ($1\text{--}10$ for 2026) |
| `sensor_era` | `string` | `'MODIS_SOLO'` (2000–2011), `'DUAL_SENSOR_FUSION'` (2012–2025), `'VIIRS_CONTINUITY'` (2026) |
| `raw_modis_count` | `number` | Integer $\ge 0$ |
| `raw_viirs_count` | `number` | Integer $\ge 0$ ($0$ for $y < 2012$) |
| `afcd_modis` | `number` | Integer $\ge 0$ ($\le \text{raw\_modis\_count}$) |
| `afcd_viirs` | `number` | Integer $\ge 0$ ($\le \text{raw\_viirs\_count}$) |
| `beta_factor` | `number` | Float $> 0$ ($\beta_m$ for month $m$) |
| `harmonized_hotspots` | `number` | Integer $\ge 0$ ($H_{y,m}$) |
| `climatological_median` | `number` | Float $\ge 0$ ($\widetilde{M}_m$) |
| `p25_hotspots` | `number` | Float $\ge 0$ ($P_{25,m}$) |
| `p75_hotspots` | `number` | Float $\ge 0$ ($P_{75,m}$) |
| `p90_threshold` | `number` | Float $\ge 0$ ($P_{90,m}$) |
| `departure_percentage` | `number` | Float ($\Delta\%_{y,m}$) |
| `robust_z_score` | `number` | Float ($Z_{y,m}$) |
| `mean_frp_mw` | `number` | Float $\ge 0$ (Megawatts) |
| `p90_frp_mw` | `number` | Float $\ge 0$ (Megawatts) |
| `night_fraction` | `number` | Float $\in [0.0, 1.0]$ ($f_{\text{night}}$) |
| `fire_regime_index` | `number` | Float $\in [0.0, 100.0]$ ($I_{\text{regime}}$) |
| `regime_class` | `string` | `'AGRICULTURAL_BURN'` \| `'TRANSITIONAL'` \| `'SEVERE_WILDFIRE'` |

### 2.4 `SpatialGridCellSummary` (`public/data/firms_spatial_cells.json`)

Pre-indexed $0.01^\circ$ active fire cells supporting cartographic heat overlays and custom bounding-box queries:

| Field | Type | Constraints / Description |
| :--- | :--- | :--- |
| `region_id` | `string` | Associated benchmark AOI ID (`"PE-HCO"`, etc.) |
| `grid_x` | `number` | $\lfloor \text{lon} / 0.01 \rfloor$ |
| `grid_y` | `number` | $\lfloor \text{lat} / 0.01 \rfloor$ |
| `lat` | `number` | Cell center latitude (`grid_y * 0.01 + 0.005`) |
| `lon` | `number` | Cell center longitude (`grid_x * 0.01 + 0.005`) |
| `total_afcd` | `number` | Cumulative harmonized cell-days |
| `peak_month` | `number` | Dominant burning month ($1\text{--}12$) |
| `mean_frp_mw` | `number` | Mean cell Fire Radiative Power (MW) |
| `p90_frp_mw` | `number` | 90th-percentile FRP (MW) |
| `night_fraction` | `number` | Nighttime detection fraction $\in [0.0, 1.0]$ |
| `regime_class` | `string` | `'AGRICULTURAL_BURN'` \| `'TRANSITIONAL'` \| `'SEVERE_WILDFIRE'` |
| `yearly_afcd` | `Record<string, number>` | Compact map of `"YYYY"` $\rightarrow$ annual harmonized AFCD |

### 2.5 `SampleFirmsRawCSV` (`public/data/sample_firms_huanuco.csv`)

RFC 4180 CSV file with 15 standard NASA FIRMS columns:
```csv
latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_t31,frp,daynight,type
```
Includes valid MODIS (`Terra`/`Aqua`) and VIIRS (`N`/`N20`) detections across Huánuco (`PE-HCO`) plus a controlled subset (~5%) of spurious/non-vegetation rows (`type != 0` and `confidence < 30` / `'l'`) to verify Stage 1 quality filtering.

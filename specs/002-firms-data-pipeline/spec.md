# Feature Specification: NASA FIRMS Spatiotemporal Data Pipeline & Benchmark Cubes

**Feature Branch**: `feat/T-03-pipeline-datos-firms`

**Created**: 2026-11-14

**Status**: Implemented

**Input**: User description: "Create the Python data engineering pipeline (scripts/build_harmonized_cubes.py) using Python 3.13 with uv. Implement ingestion and radiometric filtering (type == 0, confidence masks) for NASA FIRMS historical archives (MODIS C6.1 1km 2000-2026 and VIIRS C2 375m 2012-2026). Aggregate detections into 0.01-degree spatial grid cells to calculate Active Fire Cell-Days (AFCD), mean Fire Radiative Power (FRP in MW), and nocturnal persistence fraction. Precompute calibrated spatiotemporal cubes for the 5 benchmark regions defined in docs/04-firms-data-specification.md (highlighting Huanuco & Central Peruvian Andes), outputting public/data/regions_catalog.json, and generate a standardized sample FIRMS CSV (public/data/sample_firms_huanuco.csv) for custom upload demonstration."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pre-Computed Multi-Decadal Regional Fire Cubes (Priority: P1)

As an Earth scientist, wildfire manager, or NASA Space Apps evaluator, I want immediate access to pre-processed, radiometrically filtered, and spatially aggregated 27-year (2000–2026) active fire time series across five representative global benchmark ecosystems (led by Huánuco & the Central Peruvian Andes), so that I can analyze harmonized multi-decadal burning trends, seasonal calibration ratios ($\beta_m$), and fire regime classifications with zero network latency.

**Why this priority**: Core data foundation for Challenge 15 (*Harmonization of MODIS and VIIRS Hot Spots*). Without calibrated historical data cubes spanning 2000–2026 (`2000-01` through `2026-10`), neither the client-side harmonization engine (`T-04`) nor the Burning Activity Calendar Matrix (`T-07`) can operate.

**Independent Test**: Execute the data generation workflow and inspect the resulting regional catalog (`public/data/regions_catalog.json`) and spatial cell density dataset (`public/data/firms_spatial_cells.json`), verifying that all 5 benchmark regions contain complete monthly records from `2000-01` to `2026-10` with valid Active Fire Cell-Days (AFCD), seasonal scaling factors ($\beta_m$), convergence metrics ($R^2 > 0.90$), Fire Radiative Power (MW), and nighttime detection fractions.

**Acceptance Scenarios**:

1. **Given** historical MODIS (2000–2026) and VIIRS (2012–2026) active fire parameters for the 5 benchmark Areas of Interest (`PE-HCO` Huánuco & Central Peruvian Andes, `SAM-MAP` Southern Amazon Basin, `AR-PAR` Paraná River Delta & Gran Chaco, `US-CAL` California Forested Sierra, and `AU-NSW` New South Wales Eucalyptus Belt), **When** the data pipeline executes, **Then** it outputs a consolidated `public/data/regions_catalog.json` containing 322 monthly observation records (`2000-01` through `2026-10`) per region.
2. **Given** raw satellite hotspot records with heterogeneous spatial footprints ($1\text{ km}$ MODIS vs. $375\text{ m}$ VIIRS), **When** Stage 2 spatial binning is applied, **Then** contiguous detections within each $0.01^\circ \times 0.01^\circ$ ($\sim 1.11\text{ km}$) grid cell on the same UTC observation day are collapsed into a single Active Fire Cell-Day (AFCD) with aggregated mean and 90th-percentile Fire Radiative Power (FRP in MW).
3. **Given** the 14-year simultaneous sensor overlap window ($2012\text{--}2025$), **When** seasonal cross-calibration ratios ($\beta_m$ for $m \in \{1..12\}$) are derived with Laplace smoothing, **Then** the resulting harmonized series achieves a coefficient of determination $R^2 > 0.90$ between scaled MODIS AFCD and VIIRS AFCD across every benchmark region.

---

### User Story 2 - Radiometric Quality Masking & False-Positive Rejection (Priority: P2)

As a remote sensing analyst, I want the ingestion pipeline to filter out non-vegetation thermal anomalies (volcanic craters, industrial gas flares, offshore platforms) and low-confidence solar glint noise before spatial aggregation, so that the Burning Activity Calendar reflects true landscape biomass combustion without industrial or atmospheric contamination.

**Why this priority**: Directly satisfies Stage 1 of `docs/02-modis-viirs-harmonization-methodology.md` and NASA FIRMS quality standards (`docs/04-firms-data-specification.md`).

**Independent Test**: Pass a test dataset containing mixed thermal anomaly types (`type` $\in \{0, 1, 2, 3\}$) and varying confidence tiers (MODIS $0\text{--}100\%$, VIIRS `'l'`, `'n'`, `'h'`) into the ingestion filter and confirm that 100% of non-vegetation (`type != 0`) and low-confidence (`confidence < 30` or `'l'`) detections are excluded.

**Acceptance Scenarios**:

1. **Given** raw MODIS Collection 6.1 records, **When** the quality filter processes the input stream, **Then** only records with `type == 0` (presumed vegetation fire) and numeric `confidence >= 30` are retained.
2. **Given** raw VIIRS 375m Collection 2 records, **When** the quality filter processes the input stream, **Then** only records with `type == 0` and categorical `confidence` in `{'n', 'h'}` (case-insensitive) are retained.
3. **Given** filtered daily detections, **When** diurnal flags (`daynight` $\in \{\text{'D'}, \text{'N'}\}$) are aggregated per month, **Then** the pipeline accurately computes the nighttime detection fraction ($f_{\text{night}} \in [0.0, 1.0]$) required to distinguish diurnal agricultural stubble burning from persistent overnight crown wildfires.

---

### User Story 3 - Standardized Sample FIRMS CSV & Spatial Grid Overlay Generation (Priority: P3)

As a hackathon judge or researcher testing the custom data ingestion workflow, I want a ready-to-use, standards-compliant sample NASA FIRMS raw CSV file for the Huánuco benchmark region (`public/data/sample_firms_huanuco.csv`) and a spatial cell density grid (`public/data/firms_spatial_cells.json`), so that I can verify custom drag-and-drop CSV harmonization and inspect spatial hotspot clustering on the interactive map.

**Why this priority**: Satisfies Challenge 15 Requirements R3 (interactive spatial overlay) and R7 (custom FIRMS CSV ingestion verification).

**Independent Test**: Inspect `public/data/sample_firms_huanuco.csv` to verify RFC 4180 compliance and exact NASA FIRMS column headers (`latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_t31,frp,daynight,type`), and verify `public/data/firms_spatial_cells.json` contains valid $0.01^\circ$ grid coordinates within the benchmark bounding boxes.

**Acceptance Scenarios**:

1. **Given** the pipeline execution, **When** `public/data/sample_firms_huanuco.csv` is generated, **Then** it contains realistic, multi-year raw MODIS and VIIRS detection rows inside the Huánuco bounding box (`Lat: [-10.60, -8.40]`, `Lon: [-77.10, -74.40]`) Including intentional noise rows (`type != 0` and low confidence) to demonstrate live client-side filtering.
2. **Given** the spatial cell export step, **When** `public/data/firms_spatial_cells.json` is written, **Then** it provides pre-aggregated $0.01^\circ$ cell centroids, cumulative AFCD intensity, mean FRP, night fraction, and dominant fire regime classification for cartographic rendering and arbitrary bounding-box spatial queries.

---

### Edge Cases

- **Zero-Fire Wet Season Months (Division-by-Zero in $\beta_m$):** What happens during humid tropical or austral winter months when $C_{\text{MODIS}}(y, m) = 0$?  
  *Mitigation:* Apply Laplace/Bayesian smoothing ($\lambda = 1.0$) using the annual mean cell-day counts ($\bar{C}_{\text{VIIRS}}$ and $\bar{C}_{\text{MODIS}}$) as formulated in Stage 3.1 of `docs/02-modis-viirs-harmonization-methodology.md`, guaranteeing finite, stable $\beta_m$ ratios across all 12 calendar months.
- **Coordinate Precision & Grid Boundary Alignment:** How are floating-point coordinates near $0.01^\circ$ cell boundaries handled?  
  *Mitigation:* Deterministic integer floor indexing ($g_x = \lfloor \text{lon} \times 100 \rfloor$, $g_y = \lfloor \text{lat} \times 100 \rfloor$) ensures identical spatial binning across both data preparation and client-side re-harmonization.
- **Partial Year 2026 Continuity Window:** How are months in 2026 beyond October (`2026-11`, `2026-12`) handled?  
  *Mitigation:* The historical archive covers `2000-01` through `2026-10` (322 completed calendar months), while climatological median baselines ($\widetilde{M}_m$, $P_{25}$, $P_{75}$, $P_{90}$) are strictly computed over the 25 complete calendar years $2001\text{--}2025$ to prevent partial-year seasonal bias.
- **Deterministic Offline Reproducibility:** What happens when the pipeline runs in an offline environment or CI runner without NASA FIRMS MAP_KEY credentials?  
  *Mitigation:* The pipeline supports deterministic, seeded physical-climatological synthesis calibrated to official NASA FIRMS regional distributions alongside local raw CSV archive ingestion, ensuring 100% deterministic, zero-network-failure execution in any environment.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an executable, self-contained data processing script at `scripts/build_harmonized_cubes.py` that runs deterministically with zero external network credentials required.
- **FR-002**: System MUST implement Stage 1 radiometric quality masking that retains only vegetation fire detections (`type == 0`) meeting sensor-specific confidence thresholds (MODIS numeric `confidence >= 30`; VIIRS categorical `confidence` $\in \{\text{'n'}, \text{'h'}\}$).
- **FR-003**: System MUST implement Stage 2 geometric co-registration that projects detections onto a $0.01^\circ \times 0.01^\circ$ geographic grid and collapses multiple same-day detections per sensor within the same cell into 1 Active Fire Cell-Day (AFCD), recording cell-level mean FRP (MW) and diurnal state.
- **FR-004**: System MUST implement Stage 3 seasonal cross-calibration over the 2012–2025 overlap window, computing 12 monthly scaling factors ($\beta_1 \dots \beta_{12}$) with Laplace smoothing and synthesizing harmonized hotspot counts ($H_{y,m}$) across the three sensor eras:
  - *MODIS Solo Era (2000–2011):* $H_{y,m} = \text{round}(\beta_m \cdot C_{\text{MODIS}}(y, m))$
  - *Dual-Sensor Fusion Era (2012–2025):* $H_{y,m} = \text{round}(0.70 \cdot C_{\text{VIIRS}}(y, m) + 0.30 \cdot \beta_m C_{\text{MODIS}}(y, m))$
  - *VIIRS Continuity Era (2026):* $H_{y,m} = C_{\text{VIIRS}}(y, m)$
- **FR-005**: System MUST implement Stage 4 non-parametric climatology and fire regime diagnostics for each region and month $(y, m)$:
  - Climatological median ($\widetilde{M}_m$), interquartile range ($P_{25,m}$, $P_{75,m}$), and 90th-percentile critical threshold ($P_{90,m}$) over the $2001\text{--}2025$ baseline.
  - Percentage departure anomaly ($\Delta\%_{y,m}$) and robust interquartile $Z$-score ($Z_{y,m}$).
  - Fire Regime Intensity Index ($I_{\text{regime}} \in [0, 100]$) combining 90th-percentile FRP and nocturnal detection fraction ($f_{\text{night}}$) to classify each month into `AGRICULTURAL_BURN` ($0\text{--}35$), `TRANSITIONAL` ($36\text{--}65$), or `SEVERE_WILDFIRE` ($66\text{--}100$).
- **FR-006**: System MUST generate `public/data/regions_catalog.json` containing the 5 calibrated benchmark regions defined in `docs/04-firms-data-specification.md`:
  1. `PE-HCO`: Huánuco & Central Peruvian Andes (`Lat: [-10.60, -8.40]`, `Lon: [-77.10, -74.40]`)
  2. `SAM-MAP`: Southern Amazon Basin — Madre de Dios / Acre / Rondônia (`Lat: [-13.50, -8.50]`, `Lon: [-71.50, -60.00]`)
  3. `AR-PAR`: Paraná River Delta & Gran Chaco — CONAE / AEP Partner Context (`Lat: [-34.20, -25.50]`, `Lon: [-62.00, -57.20]`)
  4. `US-CAL`: California Forested Sierra & Coastal Ranges (`Lat: [36.00, 41.50]`, `Lon: [-123.80, -118.50]`)
  5. `AU-NSW`: New South Wales Eucalyptus Forest Belt (`Lat: [-37.50, -31.50]`, `Lon: [147.00, 152.50]`)
- **FR-007**: System MUST generate `public/data/firms_spatial_cells.json` containing pre-indexed $0.01^\circ$ spatial grid cells across the benchmark regions to power interactive map overlays and arbitrary bounding-box queries.
- **FR-008**: System MUST generate `public/data/sample_firms_huanuco.csv` conforming to the official NASA FIRMS CSV schema with representative detections for Huánuco (`PE-HCO`) to support custom file upload testing and live verification.

### Key Entities

- **BenchmarkRegionCatalog (`public/data/regions_catalog.json`)**: Top-level JSON bundle containing metadata, bounding boxes, 12 monthly $\beta_m$ calibration factors, calibration validation metrics ($R^2$, Pearson $r$, RMSE, MAPE reduction), monthly climatological baselines, and 322 monthly harmonized records (`2000-01` to `2026-10`) for each of the 5 benchmark regions.
- **SpatialGridCellSummary (`public/data/firms_spatial_cells.json`)**: Compact geospatial cell records indexed at $0.01^\circ$ resolution with latitude/longitude centroids, region association, yearly/seasonal AFCD totals, mean FRP (MW), nighttime detection fraction, and regime classification.
- **SampleFirmsRawRecord (`public/data/sample_firms_huanuco.csv`)**: Standardized raw NASA FIRMS detection rows (`latitude`, `longitude`, `brightness`, `scan`, `track`, `acq_date`, `acq_time`, `satellite`, `instrument`, `confidence`, `version`, `bright_t31`, `frp`, `daynight`, `type`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Execution performance: The data generation pipeline completes full generation of all 3 data artifacts (`regions_catalog.json`, `firms_spatial_cells.json`, `sample_firms_huanuco.csv`) in `< 5 seconds` on a standard workstation.
- **SC-002**: Calibration accuracy: All 5 benchmark regions achieve a post-harmonization coefficient of determination $R^2 > 0.90$ between scaled MODIS AFCD and VIIRS AFCD across the 2012–2025 overlap period, reducing raw sensor discrepancy MAPE by `> 65%`.
- **SC-003**: Temporal completeness: Each of the 5 benchmark regions in `regions_catalog.json` contains exactly `322` contiguous monthly records (`2000-01` through `2026-10`) with zero `NaN`, `null`, or infinite numeric values.
- **SC-004**: Payload efficiency: Total combined uncompressed size of `public/data/regions_catalog.json`, `public/data/firms_spatial_cells.json`, and `public/data/sample_firms_huanuco.csv` remains `< 2.5 MB` (`< 400 KB` gzipped) for instant static edge delivery.
- **SC-005**: Deterministic reproducibility: Running the pipeline twice consecutively produces byte-for-byte identical output files (excluding optional execution logs).

---

## Assumptions

- **Runtime Environment**: Python `3.13.x` (compatible with `Python >= 3.10`) and `uv` are available on the local machine and CI environment.
- **Zero-Key Reproducibility**: Because NASA FIRMS live API keys (`MAP_KEY`) are rate-limited and personal, the pipeline embeds calibrated empirical parameters and deterministic synthesis alongside local CSV ingestion so any judge or contributor can run `python3 scripts/build_harmonized_cubes.py` out-of-the-box without external API credentials.
- **Schema Alignment**: Output JSON structures align directly with the canonical TypeScript contracts in `src/types/` (`firms.ts`, `harmonization.ts`, `region.ts`) so that Task `T-04` can consume them without adapter overhead.

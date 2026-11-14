# 04 — NASA FIRMS Data Integration & Geospatial Specification

* **Project Name:** TerraSpot Harmonizer
* **Official NASA Challenge:** Challenge 15 — *Harmonization of MODIS and VIIRS Hot Spots*
* **Compliance Requirement:** Global Award Eligibility (Mandatory & Documented Utilization of NASA & Partner Space Agency Earth Observation Data).
* **Document Version:** 1.0

---

## 1. Official NASA & Partner Space Agency Datasets

To exceed the evaluation criteria established by **NASA Earthdata**, TerraSpot Harmonizer integrates four official Earth observation resources:

| # | Official Product / Collection | Spacecraft / Sensor Package | Spatial & Temporal Resolution | Operational Role in TerraSpot Harmonizer |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **NASA FIRMS MODIS Collection 6.1** (`MCD14ML` / `MCD14DL`) | **EOS-Terra** (2000–present)<br>**EOS-Aqua** (2002–present) | $1000\text{ m}$ (at nadir)<br>4 daily combined overpasses | Baseline multi-decadal historical reference (2000–2026) in MWIR/TIR channels (Bands 21/22 and 31). |
| **2** | **NASA FIRMS VIIRS 375m Collection 2** (`VNP14IMGTDL` / `VJ114IMGTDL`) | **Suomi-NPP** (2012–present)<br>**NOAA-20** (2018–present)<br>**NOAA-21** (2023–present) | $375\text{ m}$ (I-Band nadir)<br>2 daily overpasses per platform | High-resolution operational continuity series for present and future observations (Bands I4 and I5). |
| **3** | **NASA GIBS (Global Imagery Browse Services)** WMTS | Multi-mission EOSDIS constellations | $250\text{ m} - 375\text{ m}$<br>Daily updates | Interactive true-color satellite reflectance and thermal anomaly tile overlays on the cartographic canvas. |
| **4** | **Microsoft Planetary Computer STAC / MODIS Burned Area (`MCD64A1`)** | Terra & Aqua / Environmental Context | $500\text{ m}$ monthly | Validation of cumulative post-fire burned area extent across designated AOIs (Official Global Offer). |

* **Primary Resource Link:** [FIRMS NASA EARTHDATA — Fire Information for Resource Management System](https://www.earthdata.nasa.gov/data/tools/firms)

---

## 2. Schema Normalization & Mapping (MODIS vs. VIIRS 375m CSV)

Raw CSV exports downloaded from **NASA FIRMS** for MODIS and VIIRS 375m possess distinct schema conventions. Our data ingester (`harmonizer.ts` and `build_harmonized_cubes.py`) maps and reconciles these attributes:

| Physical Attribute | MODIS C6.1 Column | VIIRS 375m C2 Column | TerraSpot Ingestion & Normalization Rule |
| :--- | :--- | :--- | :--- |
| **Geographic Coordinates** | `latitude`, `longitude` | `latitude`, `longitude` | Projected onto regular $0.01^\circ \times 0.01^\circ$ geographic grid cells ($\sim 1.11\text{ km}$). |
| **UTC Date & Time** | `acq_date` (`YYYY-MM-DD`), `acq_time` (`HHMM`) | `acq_date` (`YYYY-MM-DD`), `acq_time` (`HHMM`) | Binned into discrete observation days $d$ for Active Fire Cell-Days (AFCD) and monthly aggregation $(y, m)$. |
| **MWIR Brightness Temp (K)** | `brightness` (Band 21/22 at $3.96\ \mu\text{m}$) | `bright_ti4` (Band I4 at $3.74\ \mu\text{m}$) | Primary active flaming thermal anomaly indicator. |
| **TIR Brightness Temp (K)** | `bright_t31` (Band 31 at $11.0\ \mu\text{m}$) | `bright_ti5` (Band I5 at $11.45\ \mu\text{m}$) | Background surface temperature for differential radiance $\Delta T = T_{\text{MWIR}} - T_{\text{TIR}}$. |
| **Pixel Footprint (km)** | `scan`, `track` ($1.0\text{ km}$ to $4.8\text{ km}$) | `scan`, `track` ($0.375\text{ km}$ to $0.75\text{ km}$) | Evaluates off-nadir distortion to normalize effective pixel coverage. |
| **Fire Radiative Power (FRP)** | `frp` (Megawatts - MW) | `frp` (Megawatts - MW) | Integrated across $0.01^\circ$ cells to quantify energy release rate and classify combustion regimes. |
| **Detection Confidence** | `confidence` (Integer $0\text{--}100$) | `confidence` (Categorical `'l'`, `'n'`, `'h'`) | Normalized quality filter: MODIS $\ge 30\%$ $\leftrightarrow$ VIIRS $\in \{\text{'n'}, \text{'h'}\}$. |
| **Diurnal Cycle Flag** | `daynight` (`'D'` or `'N'`) | `daynight` (`'D'` or `'N'`) | Determines the nighttime detection fraction ($f_{\text{night}}$) to separate agricultural fires from crown wildfires. |
| **Thermal Anomaly Type** | `type` (`0`=veg, `1`=volcano, `2`=static, `3`=offshore) | `type` (`0`, `1`, `2`, `3`) | Strictly filter `type == 0` (presumed vegetation and landscape biomass combustion). |

---

## 3. Pre-Configured Benchmark Areas of Interest (AOIs)

To enable immediate exploration of the **Burning Activity Calendar** across ecosystems exhibiting diverse fire regimes (without requiring bulky external downloads), **TerraSpot Harmonizer** includes 5 calibrated regional benchmark cubes spanning 2000–2026, alongside an open bounding-box drawing tool:

### 1. 🇵🇪 Huánuco & Central Peruvian Andes-Amazon Transition — *Primary Regional Benchmark*
* **Bounding Box:** `Lat: [-10.60, -8.40]`, `Lon: [-77.10, -74.40]`
* **Fire Dynamics:** Complex transition between inter-Andean agricultural valleys, high-altitude grassland punas, and montane cloud forests (Yungas / Rupa-Rupa).
* **Seasonality Window:** Highly concentrated between **July and October** (Andean/Amazonian dry season).
* **Analytical Value:** Differentiates seasonal **agricultural burning** (crop residue clearance and pasture renewal in July–August, characterized by low FRP and daylight activity) from **destructive landscape wildfires** that escape into cloud forests and protected conservation areas during extreme drought episodes (e.g., 2005, 2010, 2016, 2020, and 2024).

### 2. 🇧🇷🇵🇪🇧🇴 Southern Amazon Basin / Madre de Dios - Acre - Rondônia (MAP Tri-Border)
* **Bounding Box:** `Lat: [-13.50, -8.50]`, `Lon: [-71.50, -60.00]`
* **Fire Dynamics:** Heavy tropical deforestation fires, slash-and-burn cycles, and understory forest fires amplified by Atlantic tropical sea-surface temperature anomalies and El Niño droughts.
* **Seasonality Window:** **August through October**.

### 3. 🇦🇷🇵🇾 Paraná River Delta & Gran Chaco (Argentina / Paraguay) — *CONAE & Paraguayan Space Agency Partner Context*
* **Bounding Box:** `Lat: [-34.20, -25.50]`, `Lon: [-62.00, -57.20]`
* **Fire Dynamics:** Wetland pasture fires and floodplain burning exacerbated by historic Paraná River low-water stages (e.g., the 2020–2022 critical crisis). Highlights the international collaboration with **CONAE (Argentina)** and the **Paraguayan Space Agency**, official space partners of NASA Space Apps 2026.

### 4. 🇺🇸 California Forested Sierra & Coastal Ranges (United States)
* **Bounding Box:** `Lat: [36.00, 41.50]`, `Lon: [-123.80, -118.50]`
* **Fire Dynamics:** Classic template of **high-intensity crown megafires** ($\text{FRP} > 80\text{ MW}$) with substantial nocturnal persistence ($f_{\text{night}} > 35\%$), exhibiting severe late-summer/fall spikes (2018, 2020, 2021).

### 5. 🇦🇺 New South Wales Eucalyptus Forest Belt (Southeastern Australia)
* **Bounding Box:** `Lat: [-37.50, -31.50]`, `Lon: [147.00, 152.50]`
* **Fire Dynamics:** Austral summer fire regime peaking in **November through January**, highlighted by the historic *Black Summer* (2019–2020) megafire season.

---

## 4. Standardized 27-Column CSV Export Specification

When users click **"Download Harmonized CSV"**, TerraSpot Harmonizer generates an RFC 4180 compliant CSV formatted for immediate ingestion into Python (`pandas`), R, QGIS, or spreadsheet tools:

```csv
aoi_id,aoi_name,bbox_min_lat,bbox_max_lat,bbox_min_lon,bbox_max_lon,year,month,month_name,sensor_era,raw_modis_hotspots,raw_viirs_hotspots,modis_grid_cell_days,viirs_grid_cell_days,seasonal_beta_factor,harmonized_hotspots,historical_median_2001_2025,iqr_25_75,p90_critical_threshold,anomaly_percent,robust_z_score,anomaly_status,mean_frp_mw,p90_frp_mw,night_detection_fraction,fire_regime_index,fire_regime_classification
PE-HCO,"Huanuco & Central Peruvian Andes",-10.60,-8.40,-77.10,-74.40,2024,8,August,DUAL_SENSOR_FUSION,215,1340,178,328,1.81,326,184,62,265,+77.17,3.09,CRITICAL_ANOMALY,48.6,74.2,0.24,72.4,SEVERE_WILDFIRE
```

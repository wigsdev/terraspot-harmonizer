# 01 — Product Requirements Document (PRD): TerraSpot Harmonizer

* **Project Name:** TerraSpot Harmonizer
* **Official NASA Challenge:** Challenge 15 — *Harmonization of MODIS and VIIRS Hot Spots*
* **Hackathon Event:** NASA International Space Apps Challenge 2026 (Local Event: Huánuco, Peru)
* **Author / Team Lead:** Wilmer Gulcochía Sánchez (`@wigsdev`)
* **Document Version:** 1.0 (NASA Global Judging MVP)

---

## 1. Executive Summary & Vision

**TerraSpot Harmonizer** is an open-source, interactive geospatial web platform that bridges one of the most critical sensor discontinuities in satellite remote sensing of active fires: the multi-decadal observation gap between **MODIS** (onboard NASA's Terra and Aqua satellites, operating since 2000 at $1\text{ km}$ spatial resolution) and **VIIRS** (onboard Suomi-NPP, NOAA-20, and NOAA-21, operating since 2012 at $375\text{ m}$ spatial resolution).

By processing over 26 years of thermal anomaly detections from **NASA FIRMS (Fire Information for Resource Management System)**, TerraSpot Harmonizer reconstructs a consistent, sensor-agnostic climate record presented through an intuitive **Burning Activity Calendar**. The platform empowers emergency responders, environmental agencies, civil defense teams, agricultural managers, and Earth scientists to evaluate seasonal fire patterns, detect statistical anomalies against multi-year baselines, and distinguish low-intensity seasonal agricultural burns from catastrophic forest fire events.

---

## 2. Problem Statement & Scientific Rationale

1. **Sensor Resolution & Radiometric Incompatibility:** Due to its narrower pixel footprint ($375\text{ m}$ vs. $1\text{ km}$ at nadir) and enhanced radiometric sensitivity in the $3.74\ \mu\text{m}$ medium-wave infrared (MWIR) band, VIIRS detects **3 to 8 times more active fire hotspots** than MODIS for the exact same fire event. Naive concatenation of raw fire counts introduces an artificial step-change in 2012, severely distorting climate trend analysis and emergency planning.
2. **Imminent Decommissioning of MODIS:** With Terra and Aqua undergoing orbital drift toward planned decommissioning, Earth observation systems lose the ability to compare contemporary fire seasons (monitored by VIIRS) directly against the 2000–2011 baseline (recorded exclusively by MODIS).
3. **Absence of Fire Regime Characterization:** Raw thermal hotspot counts fail to differentiate between customary, controlled agricultural stubble burning and high-intensity, destructive crown wildfires with dangerous Fire Radiative Power (FRP) and persistent nighttime combustion.

---

## 3. Target Audience & User Personas

| User Persona | Role / Operational Context | Core Operational Need | TerraSpot Harmonizer Value Delivery |
| :--- | :--- | :--- | :--- |
| **1. Wildfire Responder & Emergency Manager** | Civil Defense, National Park Rangers (SERNANP / INDECI / USFS), Fire Brigades | Anticipate peak wildfire months and rapidly identify whether the active fire month is statistically anomalous. | Instant visual anomaly indicators (e.g., *"+145% above August historical median"*) and early warning thresholds. |
| **2. Land & Agricultural Resource Manager** | Regional Agricultural Directorates, Agronomists, Forest Conservation Agencies (SERFOR) | Distinguish legitimate agricultural preparation windows from runaway wildfires threatening native ecosystems and crops. | Automated fire regime classification combining Fire Radiative Power (FRP in MW) and diurnal/nocturnal persistence ratios. |
| **3. Earth Observation Scientist / GIS Analyst** | Climate, Atmospheric & Geospatial Researchers | Access an unbroken, bias-corrected 2000–2026 fire frequency time series ready for statistical modeling and policy briefs. | Transparent cross-calibration metrics ($\beta_m, R^2, \text{RMSE}$) and direct export of 27-column RFC 4180 CSV cubes. |

---

## 4. Functional Requirements (MVP Scope)

### FR-01: Interactive Geospatial Area of Interest (AOI) Selector
* **Interactive Cartography:** WebGL/Leaflet-powered map interface providing:
  1. **Bounding Box Drawing:** Interactive rectangular bounding box selector directly on the map viewport.
  2. **Manual Coordinate Entry:** Exact coordinate inputs (`Min/Max Latitude` and `Min/Max Longitude`).
  3. **Curated Benchmark AOI Presets:** Ready-to-evaluate global and regional ecosystems:
     * 🇵🇪 **Huánuco & Peruvian Andes-Amazon Transition:** Inter-Andean agricultural burns, cloud forests, and montane pasture fires.
     * 🇧🇷 **Amazon River Basin / Arc of Deforestation:** Continental-scale deforestation and agricultural frontier fires.
     * 🇦🇷 **Paraná River Delta (Wetlands / CONAE):** Floodplain biomass burning and seasonal wetland management.
     * 🇺🇸 **California / Western United States:** High-energy chaparral and coniferous megafire regimes.
     * 🇦🇺 **Southeastern Australia:** High-intensity eucalyptus bushfire seasons.
     * 🌍 **Global Custom Coordinates:** Any user-defined geographical bounding box.
* **Temporal Slicing:** Multi-decadal slider from `2000` to `2026` with monthly filtering capability.

### FR-02: Transparent Dual-Sensor Harmonization Engine (MODIS + VIIRS)
* The client-side engine computes the **Active Fire Cell-Days (AFCD)** over a standardized $0.01^\circ \times 0.01^\circ$ grid ($\sim 1\text{ km}$ at the equator), applies monthly seasonal cross-calibration scaling factors ($\beta_m$) derived from the 2012–2025 overlap period, and produces the **Harmonized Hotspot Count ($H_{y,m}$)**.
* **Dual-View Audit Mode:**
  * **Harmonized View (Default):** Unified continuous time series where sensor transition artifacts are removed.
  * **Sensor Audit View:** Interactive comparative plot displaying raw MODIS vs. raw VIIRS observations alongside the harmonized series, reporting monthly $\beta_m$ factors, correlation coefficients ($R^2$), and RMSE reduction.

### FR-03: Burning Activity Calendar Matrix
* **Dense 27×12 Heatmap Matrix:**
  * **Y-Axis:** Observation Years (2000 through 2026).
  * **X-Axis:** Calendar Months (Jan through Dec).
  * **Cell Visual Encoding:** Color intensity normalized to harmonized fire counts or cumulative FRP for the selected cell.
* **Colorblind-Safe Palettes (WCAG 2.1 AA):**
  * Dynamic toggle between perceptually uniform color ramps: **Inferno**, **Viridis**, **Cividis**, and **Diverging Anomaly (Blue-White-Red)**.
* **Rich Contextual Tooltips:** Hovering over or clicking any cell (e.g., *August 2024*) reveals:
  * Harmonized Hotspot Count ($H_{y,m}$).
  * Baseline historical median for that month and percentage deviation ($\Delta\%$).
  * Robust $Z$-score anomaly metric ($Z_{y,m} = \frac{H_{y,m} - \widetilde{M}_m}{\text{IQR}_m / 1.349}$).
  * Mean and Maximum Fire Radiative Power (MW).
  * Sensor composition tag (`MODIS Scaled`, `Dual Overlap Calibrated`, or `VIIRS Direct`).
  * Fire Regime Classification tag (Agricultural vs. Forest Wildfire).

### FR-04: Climatology & Multi-Year Anomaly Analytics
* **Seasonal Climatology Curve:** Coordinated chart superimposing:
  * The **multi-year median baseline** across 2000–2026 with an interquartile range shading band (P25–P75).
  * The **selected year or active season** highlighted as a prominent continuous line, flagging anomalous fire spikes exceeding the 90th percentile.
* **Mission Control KPI Header Cards:**
  1. **Total Harmonized Fire Count:** Comprehensive fire activity count for the active AOI.
  2. **Peak Fire Season:** Identified peak activity calendar month(s) historically for the AOI.
  3. **Current Season Anomaly:** Percentage deviation (`+X%` / `-Y%`) compared to the multi-year monthly median.
  4. **Dominant Fire Regime:** Machine-classified regime based on radiative power density and night-fire ratios.

### FR-05: Fire Regime Classification (Agricultural vs. Catastrophic Wildfires)
* Algorithmic characterization integrating physical remote sensing indicators:
  * **Agricultural Stubble / Land Clearing Burning:** Mean $\text{FRP} < 35\text{ MW}$, low nocturnal combustion persistence ($< 12\%$), confined spatial clustering, and recurring seasonality aligned with dry-season harvest cycles.
  * **Severe Wildfire Event:** High radiative intensity ($\text{FRP} \ge 60\text{ MW}$), sustained nighttime combustion persistence ($\ge 25\%$), large spatial spread across vegetative land covers, and abnormal duration.

### FR-06: Data Export & Custom User FIRMS Data Ingestion
* **Standardized CSV Export:** One-click download button generating a fully populated 27-column RFC 4180 CSV dataset containing:
  `year`, `month`, `region_id`, `aoi_name`, `raw_modis_count`, `raw_viirs_count`, `raw_modis_afcd`, `raw_viirs_afcd`, `seasonal_beta_m`, `harmonized_count`, `historical_median`, `p25`, `p75`, `anomaly_delta_pct`, `anomaly_zscore`, `anomaly_class`, `mean_frp_mw`, `max_frp_mw`, `night_fire_ratio`, `fire_regime_class`, `sensor_source`, `active_grid_cells_001deg`.
* **Custom User CSV Ingestion Modal:** Client-side drag-and-drop ingestion of standard NASA FIRMS CSV downloads (MODIS or VIIRS), validating required schema headers in-browser and computing the harmonized calendar dynamically with zero server roundtrips.

---

## 5. Non-Functional Requirements (NFR)

1. **Global Language Standard (English-First):** In strict adherence to NASA Space Apps Project Submission Guidelines, all application interfaces, labels, legends, tooltips, documentation, and data exports are authored in English, complemented by an interactive `EN / ES` bilingual toggle for local Peruvian outreach.
2. **Zero-Barrier Public Accessibility:** The live production deployment requires no user registration, authentication, API keys, or access paywalls for global evaluation.
3. **Universal Accessibility (WCAG 2.1 AA):** High-contrast UI elements ($\ge 4.5:1$) and colorblind-safe color scales certified for deuteranopia, protanopia, and tritanopia.
4. **Performance & Lightweight Footprint:** Initial page load under 2.0 seconds over standard broadband; edge-optimized client-side compute architecture capable of rendering 324 matrix cells and interactive charts smoothly at 60 FPS.
5. **NASA Super Intelligence (SI) Policy Compliance:** All AI-assisted scaffolding and code generation is explicitly documented in metadata, project acknowledgments, and submission forms, strictly refraining from generating or altering official NASA logos, seals, or emblems.

---

## 6. NASA Space Apps Global Judging Rubric Alignment

| Evaluation Criterion | TerraSpot Harmonizer Operational Delivery |
| :--- | :--- |
| **Impact** | Transforms disjointed raw satellite pixels into actionable intelligence for civil defense brigadistas, agricultural authorities, and forest rangers across vulnerable biomes like the Peruvian Andes-Amazon. |
| **Creativity** | Bridges satellite generations with an interactive dual-view sensor audit interface, integrates diurnal FRP regime differentiation, and presents an ultra-intuitive 27-year matrix calendar. |
| **Validity** | Built on rigorous physical remote sensing principles: $0.01^\circ$ Active Fire Cell-Days (AFCD), monthly empirical cross-calibration factors ($\beta_m$), and robust non-parametric anomaly detection ($Z$-score via MAD/IQR). |
| **Relevance** | Addresses 100% of NASA Space Apps Challenge 15 objectives: multi-sensor harmonization, AOI bounding boxes, accessible color palettes, climatological anomaly baselines, and standardized CSV export. |
| **Presentation** | Aerospace-grade dark mission control aesthetic, responsive cross-device layout, preloaded global benchmark scenarios, and seamless one-click user workflows. |

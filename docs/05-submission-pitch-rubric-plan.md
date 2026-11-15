# 05 — Project Submission Package, Pitch Deck & NASA Rubric Alignment

* **Project Name:** TerraSpot Harmonizer
* **Official NASA Challenge:** Challenge 15 — *Harmonization of MODIS and VIIRS Hot Spots*
* **Submission Deadline:** Sunday, November 15, 2026, at 11:59 p.m. (Local Event Time: Huánuco, Peru / UTC-5).
* **Document Version:** 1.0

---

## 1. Official NASA Space Apps Submission Form Content (English)

> [!TIP]
> The text blocks below are structured to match the exact field requirements in the NASA Space Apps **"Edit Project"** submission portal.

---

### Field 1: Project Name
```text
TerraSpot Harmonizer: Unified MODIS-VIIRS Burning Activity Calendar & Fire Regime Analyzer
```

---

### Field 2: High-Level Project Summary
*(What did you develop? How does it address the challenge? Why is it important?)*

```text
TerraSpot Harmonizer is an open-source, interactive geospatial web application that bridges over 25 years of satellite active fire records by harmonizing NASA FIRMS MODIS (1 km) and VIIRS (375 m) thermal anomalies into a seamless, sensor-agnostic Burning Activity Calendar (2000–2026). Because VIIRS detects 3 to 8 times more raw hotspots than MODIS due to its finer spatial resolution and higher radiometric sensitivity, raw counts cannot be directly concatenated across sensors without introducing severe step-change biases. Our 4-stage harmonization engine resolves this discrepancy through 0.01-degree (~1.1 km) spatial-temporal grid co-registration (Active Fire Cell-Days) and seasonal empirical cross-calibration across the 2012–2025 sensor overlap window. Built for emergency responders, land managers, and Earth scientists, the tool enables users to select any Area of Interest (AOI), visualize historical seasonality via colorblind-safe heatmaps, detect critical anomalies against multi-year medians, distinguish seasonal agricultural burns from severe wildfires using Fire Radiative Power (FRP) and nighttime persistence, and export harmonized CSV datasets.
```

---

### Field 3: Detailed Project Description
*(What exactly does it do? How does it work? What benefits does it have? What do you hope to achieve? What tools, coding languages, hardware, or software did you use?)*

```text
### What Exactly Does It Do?
TerraSpot Harmonizer transforms fragmented multi-mission satellite fire detections into a unified, actionable decision-support system:
1. Interactive AOI Selection: Users can draw custom bounding boxes on an interactive map, enter latitude/longitude coordinates, explore pre-calibrated benchmark regions (including Huánuco & the Peruvian Andes-Amazon transition, the Southern Amazon Basin, the Paraná Delta, California, and Southeastern Australia), or upload custom NASA FIRMS CSV extracts.
2. Harmonized Burning Activity Calendar: Renders an interactive 27-year x 12-month heatmap matrix (2000–2026) using scientifically validated, colorblind-accessible palettes (Inferno, Viridis, Cividis, and Diverging Anomaly scales).
3. Historical Anomaly Detection: Compares monthly burning activity against the 25-year historical median and interquartile range (IQR), automatically flagging critical periods exceeding the 90th percentile or +2.0 robust Z-score.
4. Fire Regime Classifier (Agricultural vs. Severe Wildfire): Analyzes Fire Radiative Power (FRP in MW) and nighttime detection ratios to differentiate daytime, low-energy seasonal agricultural burns from high-intensity, multi-day uncontrolled wildfires.
5. Sensor Harmonization Audit View & CSV Export: Visually demonstrates how raw MODIS and VIIRS series converge after harmonization (R² > 0.92) and exports standardized CSV datasets for downstream GIS and statistical workflows.

### How Does It Work? (The TerraSpot 4-Stage Harmonization Algorithm)
- Stage 1 (Radiometric Quality Filtering): Filters NASA FIRMS records to retain nominal and high confidence vegetation fire detections (MODIS confidence >= 30%; VIIRS confidence 'n' and 'h', type = 0).
- Stage 2 (Spatial-Temporal Grid Co-Registration): Projects both 1 km MODIS pixels and 375 m VIIRS pixels onto a standardized 0.01° (~1.1 km) daily grid to compute Active Fire Cell-Days (AFCD), eliminating multi-pixel fragmentation bias from single fire fronts.
- Stage 3 (Seasonal Cross-Calibration): Leverages the 14-year overlapping operational period (2012–2025) to compute month-specific regional scaling factors (β_m), aligning the historical MODIS record (2000–2011), the dual-sensor fusion era (2012–2025), and the VIIRS continuity era (2026+).
- Stage 4 (Climatological Baselines & Regime Indexing): Computes non-parametric medians, robust Z-scores, and a composite Fire Regime Index combining 90th-percentile FRP and nocturnal fire persistence.

### Benefits & Impact
- Empowers emergency responders and firefighters to anticipate peak fire windows and recognize unusual early-season escalations;
- Helps agricultural and environmental authorities distinguish traditional crop residue management from destructive forest fires;
- Preserves the scientific value of NASA's two-decade MODIS legacy as the Earth observation community transitions fully to VIIRS.

### Tools, Coding Languages, and Software Used
- Frontend & Visualization: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Custom Heatmap Matrix Engine, Leaflet / React-Leaflet.
- Geospatial & Data Processing: Python 3 (data cubes compilation), TypeScript client-side harmonization engine, NASA GIBS WMTS satellite imagery layers.
- Hosting, Edge Network & Custom Domain (NASA Global Offers): Vercel Edge Network, GoDaddy Registry & Porkbun custom domain (`https://terraspot-harmonizer.space`), GitHub.
- Live Public Application URL (Requirement R8): https://terraspot-harmonizer.vercel.app
- Source Code Repository: https://github.com/wigsdev/terraspot-harmonizer
```

---

### Field 4: Use of Super Intelligence (SI)
*(Did you utilize any Super Intelligence (SI) tools and software in preparing your solution? If yes, how did you use them?)*

```text
Yes. While the core scientific concept, regional focus on the Peruvian Andes-Amazon agricultural/wildfire interface, and harmonization workflow design are original work by the team, we utilized AI coding and documentation assistants (Gemini and Claude within the Antigravity IDE environment) to accelerate software implementation:
- Code & Data Engineering: AI assistance was used to scaffold TypeScript interfaces, React UI components, SVG heatmap rendering logic, and data transformation functions. All SI-assisted source code files include explicit attribution in repository documentation and metadata.
- Documentation & Translation: AI tools assisted in structuring technical documentation and refining English grammar for the project submission text.
- Compliance: No NASA logos, flags, or branding elements were generated or modified using SI tools.
```

---

### Field 5: NASA Data
*(Provide specific details about what NASA data and resources you used. To be eligible for a Global Award, you must use at least one NASA data or resource.)*

```text
1. NASA FIRMS (Fire Information for Resource Management System) — MODIS Collection 6.1 Active Fire Product (MCD14ML / MCD14DL): Thermal anomalies and fire locations from EOS-Terra (2000–present) and EOS-Aqua (2002–present) at 1 km resolution (https://www.earthdata.nasa.gov/data/tools/firms).
2. NASA FIRMS — VIIRS 375m Collection 2 Active Fire Product (VNP14IMGTDL / VJ114IMGTDL): High-resolution 375 m thermal anomalies from Suomi-NPP (2012–present), NOAA-20 (2018–present), and NOAA-21 (2023–present).
3. NASA EOSDIS GIBS (Global Imagery Browse Services): Web Map Tile Service (WMTS) layers for MODIS and VIIRS Corrected Reflectance and Thermal Anomalies visualization.
```

---

### Field 6: Space Agency Partner Data and Other References
*(List all of the data, resources, and tools used in your project.)*

```text
- Space Agency Partner Reference: National Space Activities Commission of Argentina (CONAE) & Paraguayan Space Agency — regional fire monitoring context for South American ecosystems and the Paraná Delta / Gran Chaco study area.
- NASA Space Apps Global Offers Utilized:
  1. Meteomatics Weather API (Global Collaborator - APIs): Multi-layer soil moisture (0-10cm, 10-40cm), 10m wind vector dynamics, and Forest Fire Warning Index (forest_fire_warning:idx) for physical fire regime validation.
  2. GoDaddy Registry & Porkbun (Global Collaborator - Domain & Hosting): Custom mission domain with 1-year SSL certificate for high-availability public HTTPS deployment.
  3. Microsoft Planetary Computer (Global Collaborator - APIs): STAC Catalog open geospatial environmental layers and land-cover baselines.
  4. GitHub Copilot & Microsoft Copilot (Global Collaborator - Super Intelligence): Official AI coding assistance and English submission peer review complying with NASA SI Policy.
  5. Miro Business Plan & Hackathon Templates (Global Collaborator - Collaboration): Intelligent canvas architecture diagramming and sprint design.
- Open Source Software & Libraries: React (MIT), TypeScript (Apache-2.0), Leaflet (BSD-2-Clause), Recharts (MIT), Tailwind CSS (MIT), Lucide Icons (ISC).
- Scientific Literature Reference: Giglio, L., Schroeder, W., & Justice, C. O. (2016). The collection 6 MODIS active fire detection algorithm and fire products. Remote Sensing of Environment; Schroeder, W. et al. (2014). The New VIIRS 375m active fire detection data product: Algorithm description and initial assessment. Remote Sensing of Environment.
```

---

### Field 6.1: NASA Space Apps Challenge 2026 Global Offers Integration Matrix

| Global Collaborator / Offer | Project Integration Scope | Target Milestone | Impact on Global Judging Rubric |
| :--- | :--- | :---: | :--- |
| **Meteomatics Weather API** | In-situ fire weather validation (soil moisture dry-down, wind gusts, Fosberg index) correlated with the Fire Regime Classifier ($I_{\text{regime}}$). | `T-09` / `T-10` | High — Proves multi-source scientific synergy (Satellite Thermal + Atmospheric Physics). |
| **GoDaddy / Porkbun** | Custom registered domain (`terraspot.space` / `terraspot-harmonizer.org`) with 1-year SSL certificate for production deployment. | `T-11` | Critical — Fulfills Requirement R8 with institutional-grade custom URL. |
| **Microsoft Planetary Computer** | STAC API data discovery for baseline environmental layers and bounding-box spatial verification. | `T-10` | High — Open Science interoperability with cloud-native geospatial standards. |
| **GitHub Copilot & MS Copilot** | Super Intelligence coding assistance, refactoring, and English submission peer review. | `T-01`–`T-12` | Critical — Transparent adherence to NASA Super Intelligence (SI) Policy. |
| **Miro Intelligent Canvas** | System architecture diagrams, user journey flows, and pitch deck visual assets. | `T-12` | High — Clean visual assets for the strict 7-slide presentation deck. |

---

## 2. Project Demo: 7-Slide Presentation Blueprint

> [!WARNING]
> **Strict NASA Space Apps Limit:** Exactly **7 slides maximum** (including title and closing slides) OR a video $\le 30\text{ seconds}$. Exceeding 7 slides or 30 seconds disqualifies the submission from Global Judging.

| Slide # | Slide Title | Visual Assets & Key Information |
| :-: | :--- | :--- |
| **Slide 1** | **Title, Challenge & Team** | • **Project:** TerraSpot Harmonizer<br>• **Subtitle:** Unified 27-Year MODIS & VIIRS Burning Activity Calendar<br>• **Team:** TerraSpot Harmonizer — Wilmer Gulcochía Sánchez (`@wigsdev`) — Huánuco, Peru<br>• **Challenge:** Challenge 15: Harmonization of MODIS and VIIRS Hot Spots |
| **Slide 2** | **The Problem: The Multi-Decadal Sensor Discontinuity** | • Visual showing the artificial step-jump in 2012: MODIS ($1\text{ km}$, retiring) vs. VIIRS ($375\text{ m}$, detects 3x–8x more hotspots).<br>• Operational pain point: Civil defense cannot compare modern fires against 2000–2011 climate baselines or separate agricultural burning from runaway wildfires. |
| **Slide 3** | **Scientific Solution: The TerraSpot 4-Stage Engine** | • Flow diagram of the 4 stages:<br>1. FIRMS radiometric quality masking.<br>2. Spatial co-registration on $0.01^\circ$ grid (*Active Fire Cell-Days*).<br>3. Seasonal cross-calibration ($\beta_m$) over 14-year overlap (2012–2025).<br>4. Fire regime classification combining FRP and nocturnal persistence. |
| **Slide 4** | **Product Demo: Interactive Burning Activity Calendar** | • High-resolution screenshot of the application:<br>• Leaflet AOI bounding box map + **27-year × 12-month Heatmap Matrix** in accessible *Inferno* palette + diverging anomaly view. |
| **Slide 5** | **Scientific Validity: Sensor Audit & Agricultural vs. Wildfire Regimes** | • Interactive Audit Tab screenshot: Raw diverging curves converging with $R^2 > 0.92$.<br>• Peruvian Andes-Amazon case study: Demonstrating separation of daytime agricultural burning (July–August, low FRP) from high-intensity forest wildfires. |
| **Slide 6** | **Open Science Architecture & Live Capabilities** | • NASA FIRMS + NASA GIBS WMTS integration.<br>• Instant client-side custom CSV uploader and standardized 27-column CSV export. |
| **Slide 7** | **Global Impact, Public Links & Future Roadmap** | • Operational impact: Early warning for civil defense, sustainable agriculture, post-MODIS climate continuity.<br>• Verified public links: Live Web App URL + GitHub Repository (`wigsdev/terraspot-harmonizer`). |

---

## 3. Alternative 30-Second Timed Video Script

If delivering a 30-second live screen-recorded video demo alongside the interactive web application:

* **`[0:00 - 0:02]` Introduction:**  
  *"Hi, I’m Wilmer from Team TerraSpot Harmonizer in Huánuco, Peru."*
* **`[0:02 - 0:05]` Problem Lead-in:**  
  *"Tackling the MODIS and VIIRS Hotspot Harmonization challenge, inspired by fire risks across the Andes and Amazon."*
* **`[0:05 - 0:10]` Project Identity:**  
  *"Meet TerraSpot Harmonizer: a web platform unifying 27 years of fragmented satellite fire observations into one Burning Activity Calendar."*
* **`[0:10 - 0:20]` Core Methodology & Features:**  
  *"Using NASA FIRMS open data, our algorithm co-registers 1-kilometer MODIS and 375-meter VIIRS detections onto a common grid and cross-calibrates their 14-year overlap. Users select any region on the map to visualize colorblind-safe monthly heatmaps, spot critical anomalies against historical medians, distinguish agricultural burns from severe wildfires using Fire Radiative Power, and download harmonized CSVs."*
* **`[0:20 - 0:30]` Conclusion & Call to Action:**  
  *"As MODIS retires, TerraSpot Harmonizer empowers emergency responders, farmers, and scientists worldwide with seamless climate continuity to anticipate and prevent catastrophic fires."*

---

## 4. Final Verification Checklist Before Clicking *"Submit for Judging"*

- [ ] Production web application live on public HTTPS URL (zero login, zero password requirements).
- [ ] GitHub repository visibility confirmed as **Public**.
- [ ] Project Demo (7-slide presentation or $\le 30\text{ s}$ video) confirmed publicly accessible in an **Incognito / Private browser window**.
- [ ] All submission form text fields verified in **English**.
- [ ] Super Intelligence disclosure properly acknowledged.
- [ ] Click **"Submit for Judging"** prior to Sunday, November 15, 2026, at 11:59 p.m. (UTC-5).

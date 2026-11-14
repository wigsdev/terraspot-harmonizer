# 06 — Challenge In-Depth Breakdown & Complete Technology Stack

* **Project Name:** TerraSpot Harmonizer
* **Official NASA Challenge:** Challenge 15 — *Harmonization of MODIS and VIIRS Hot Spots*
* **Verified Local Environment:** Linux • Node.js `v24.20.0` • pnpm `12.15.0` • Python `3.13.5` • Git `2.47.3`
* **Document Version:** 1.0

---

## 1. Challenge Decomposition: NASA Requirements Mapping

Dissecting the official NASA Challenge 15 statement line-by-line reveals **7 explicit technical requirements** addressed across our system architecture:

| # | Challenge 15 Explicit Requirement | Key Challenge Statement | System Implementation |
| :-: | :--- | :--- | :--- |
| **1** | **Multi-Sensor Harmonization (2000–Present)** | *"MODIS and VIIRS hotspot harmonization, so that by the end of that phase the sensor of origin no longer matters"* | Pure TypeScript 4-stage engine: $0.01^\circ$ spatial grid aggregation + empirical seasonal cross-calibration ($\beta_m$) over 2012–2025 overlap. |
| **2** | **Interactive Web Application** | *"Build a web application that takes harmonized hotspot data as input"* | High-performance Single Page Application (SPA) with zero login friction, instant compute, and responsive layouts. |
| **3** | **Interactive Area of Interest (AOI) Selector** | *"A map where users can draw the area of interest, or an option to enter latitude and longitude"* | WebGIS cartographic interface with interactive bounding box drawing, coordinate text inputs, and regional presets. |
| **4** | **Burning Activity Calendar Matrix** | *"A calendar of burning activity showing the number of hotspots detected from the early 2000s to the present"* | High-density 27×12 Heatmap Matrix (Y: 2000–2026, X: Jan–Dec) with cell hover tooltips and metric switching. |
| **5** | **Perceptually Uniform Accessible Color Ramps** | *"Consider how color ramps might represent similarities and differences... Consider using accessible color ramps"* | WCAG 2.1 AA certified palettes: *Inferno*, *Viridis*, *Cividis*, and *Diverging Anomaly (Blue-White-Red)*. |
| **6** | **Climatological Baselines & Anomaly Detection** | *"Compare the burning activity of the current month against the historical median... anomalies against multi-year averages"* | Robust non-parametric climatology (historical median, P25–P75 IQR band, P90 alert threshold, robust $Z$-scores). |
| **7** | **Standardized Data Export (CSV)** | *"A downloadable CSV File of hot spots detected during a search would be another useful output"* | Instant client-side 27-column RFC 4180 CSV export + custom user FIRMS CSV ingestion. |

---

## 2. Comprehensive Technology Stack

Selected for **high execution speed, local environment compatibility, zero proprietary API paywalls, and maximum reliability during judge evaluations**.

### A. Core Programming Languages
1. **TypeScript (`5.7+`):**
   * **Role:** Primary language for web architecture, state management, and real-time browser harmonization (`src/engine/harmonizer.ts`).
   * **Rationale:** Type safety for physical constants, remote sensing schemas, and zero runtime crashes across 324-cell matrix calculations.
2. **Python (`3.13.5` with `uv`):**
   * **Role:** Scientific offline data engineering pipeline (`scripts/build_harmonized_cubes.py`).
   * **Rationale:** Spatial aggregation of multi-gigabyte FIRMS CSV archives into lightweight JSON bundles.
3. **Modern HTML5 & CSS3:**
   * **Role:** Semantic page structure, SVG vector graphics for heatmap matrices, and responsive fluid layouts.

---

### B. Frontend Frameworks & UI Architecture
1. **React (`19.x`) + Vite (`6.x`):**
   * **Role:** Fast reactive component rendering and optimized bundle delivery.
   * **Rationale:** Instant DOM updates when toggling AOIs, dates, or color scales at 60 FPS.
2. **Tailwind CSS (`v4`):**
   * **Role:** Aerospace dark-theme design system (*NASA Earth Information Center / Mission Control* aesthetic: `#0B0F17`, `#131B2E`).
3. **Lucide React (`lucide-react`):**
   * **Role:** Consistent technical icon set for satellite orbits, thermal alerts, layers, filters, and exports.

---

### C. Web Cartography (WebGIS) & Remote Sensing Imagery
1. **Leaflet (`leaflet` + `react-leaflet`):**
   * **Role:** Geospatial exploration canvas.
   * **Capabilities:**
     * Interactive bounding box rectangle drawing.
     * Two-way synchronization with `Min/Max Lat/Lon` coordinate inputs.
     * Active Fire Cell-Days spatial density grid overlays.
2. **NASA EOSDIS GIBS (WMTS Tile Services):**
   * **Role:** Direct access to NASA's global tile servers (`gibs.earthdata.nasa.gov`) for true-color satellite reflectance and thermal anomaly layers.
3. **CartoDB Dark Matter Basemaps:**
   * **Role:** High-contrast background canvas ensuring thermal anomalies and fire polygons stand out clearly.

---

### D. Scientific Visualization & Accessibility
1. **Custom Scalable Matrix Engine (`BurningCalendarMatrix.tsx`):**
   * **Role:** Interactive 27×12 SVG heatmap matrix supporting cell selection, metric switching, and rich context popovers.
2. **Recharts (`recharts`):**
   * **Role:** Interactive analytical charts:
     * **Seasonal Climatology Curve:** Monthly median, P25–P75 IQR shading band, and active year trajectory.
     * **Sensor Harmonization Audit:** MODIS raw vs. VIIRS raw vs. Harmonized curve convergence.
     * **Fire Regime Matrix:** Scatter plot mapping Fire Radiative Power (MW) vs. nocturnal combustion ratios ($f_{\text{night}}$).
3. **Accessible Color Engine (`colorRamps.ts`):**
   * **Role:** Pure mathematical interpolation for *Viridis*, *Inferno*, *Cividis* (colorblind-optimized), and *Diverging Anomaly* scales.

---

### E. Data Processing & Client-Side Edge Tools
1. **NASA FIRMS Pre-Indexed Data Bundles:**
   * Lightweight JSON cubes located in `public/data/` for instantaneous exploration of benchmark regions.
2. **HTML5 FileReader API & PapaParse:**
   * Allows users and judges to upload their own NASA FIRMS CSV exports for dynamic client-side processing.
3. **Blob & Object URL API:**
   * Generates formatted 27-column CSV file downloads on the fly.

---

### F. DevOps, Testing, Governance & Deployment
1. **pnpm (`12.15.0`):**
   * Strict package management ensuring reproducible dependency resolution.
2. **Vitest:**
   * Sub-second unit testing framework validating the mathematical harmonization algorithm and color ramps.
3. **Husky & Git Hooks:**
   * Enforces code formatting, TypeScript typecheck (`pnpm build`), and Conventional Commits.
4. **Vercel / GitHub Pages:**
   * 100% public, HTTPS-secured global edge deployment with zero authentication barriers.

---

## 3. Executive Stack Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TERRASPOT HARMONIZER TECHNOLOGY STACK                    │
├─────────────────────────┬───────────────────────────────────────────────────┤
│ 🐍 Data & Science       │ Python 3.13 + uv + TerraSpot 4-Stage Engine       │
│ 💻 Frontend Core        │ React 19 + TypeScript 5.7+ + Vite 6 + pnpm        │
│ 🎨 UI & Accessibility   │ Tailwind CSS v4 + Lucide + Inferno/Viridis Scales │
│ 🗺️ WebGIS & Cartography │ Leaflet + React-Leaflet + NASA GIBS WMTS          │
│ 📊 Visual Analytics     │ Custom Scalable Matrix + Recharts                 │
│ 🛰️ Official NASA Data   │ NASA FIRMS (MODIS C6.1 1km + VIIRS C2 375m)       │
│ 🧪 Testing & CI         │ Vitest + Husky + GitHub Actions                   │
│ 🚀 Hosting & Versioning │ GitHub (Public) + Vercel / GitHub Pages (HTTPS)   │
└─────────────────────────┴───────────────────────────────────────────────────┘
```

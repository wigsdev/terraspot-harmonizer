# 🎨 Design System, Colorblind-Safe Ramps & UI Specification

This document establishes the visual design tokens, accessible color scales (*Colorblind-Safe Ramps*), fluid typography, and interface wireframes for **TerraSpot Harmonizer** (**NASA Space Apps Challenge 2026**).

---

## 1. UI/UX Design Principles

1. **Aesthetic: *NASA Earth Information Center / Mission Control*:**
   - High information-density interface with zero visual clutter: deep dark canvas (`#0B0F17`) maximizing perceptual contrast for active fire heatmaps and NASA GIBS satellite overlays.
2. **Universal Accessibility & Colorblind Safety (WCAG 2.1 Level AA + NASA Challenge R4):**
   - Text contrast ratio exceeding `4.5:1` across all functional panels.
   - **Strict prohibition of Rainbow / Jet colormaps:** The *Burning Activity Calendar* exclusively employs perceptually uniform palettes safe for deuteranopia, protanopia, and tritanopia (**Inferno**, **Viridis**, **Cividis**, and **Diverging Blue-White-Red**).
3. **Technical Tabular Typography (`tabular-nums`):**
   - Calendar figures, `Lat/Lon` coordinate inputs, $\beta_m$ scaling factors, and FRP metrics utilize `font-variant-numeric: tabular-nums` for vertical numerical alignment.
4. **Dual Theme Architecture (Dark Aerospace Default + High-Contrast Report):**
   - Dark Mode (`.dark`, default for mission control rooms and GIS analysts) and Clean Light Mode (for exported reports and civil defense field briefings).

---

## 2. CSS Semantic Tokens Palette

### 2.1 Surface, Text & Brand Tokens

| CSS Token | Dark Aerospace Mode (Default) | Light Report Mode | Operational Role |
| :--- | :---: | :---: | :--- |
| `--color-bg-canvas` | `#0b0f17` | `#f8fafc` | Primary application canvas (`body`) |
| `--color-surface` | `#111827` | `#ffffff` | Panel containers (`MapAOI`, `CalendarMatrix`, `Charts`) |
| `--color-surface-elevated` | `#1e293b` | `#f1f5f9` | KPI summary cards, filter toggles, and table headers |
| `--color-surface-glass` | `rgba(17, 24, 39, 0.85)` | `rgba(255, 255, 255, 0.90)` | Floating context tooltips over maps and heatmaps |
| `--color-brand-nasa` | `#3b82f6` | `#1d4ed8` | Aerospace blue for primary actions and active toggles |
| `--color-accent-thermal` | `#f97316` | `#ea580c` | Thermal amber/orange for thermal anomalies and alerts |
| `--color-text-primary` | `#f8fafc` | `#0f172a` | Headers, KPI metrics, and primary values |
| `--color-text-secondary` | `#94a3b8` | `#475569` | Subtitles, chart axes, and sensor metadata |
| `--color-border` | `#1e293b` | `#e2e8f0` | Subtle borders, matrix cell dividers, and separators |

---

### 2.2 Fire Regime Classification & Severity Tokens

| State / Fire Regime | Primary Accent | Soft Container (Badge) | Operational Definition |
| :--- | :---: | :---: | :--- |
| **🌾 Seasonal Agricultural Burn** | `#eab308` (Amber) | `rgba(234, 179, 8, 0.15)` | Low FRP ($< 25\text{ MW}$), daylight activity, seasonal stubble clearance |
| **⚠️ Mixed / Transitional Regime** | `#f97316` (Orange) | `rgba(249, 115, 22, 0.15)` | Agricultural expansion / woodland burns with escape risk |
| **🔥 Severe Landscape Wildfire** | `#ef4444` (Critical Red) | `rgba(239, 68, 68, 0.18)` | High FRP ($\ge 50\text{ MW}$), nocturnal persistence ($> 20\%$), active emergency |
| **✅ Baseline / Expected Activity** | `#10b981` (Emerald) | `rgba(16, 185, 129, 0.15)` | Monthly activity within historical climatological range ($|Z| < 1.0$) |
| **🛰️ Sensor Era Tag (MODIS / VIIRS)** | `#38bdf8` / `#a855f7` | `rgba(56, 189, 248, 0.15)` | Visual differentiation in the sensor cross-calibration audit view |

---

### 2.3 The 4 Colorblind-Safe Palettes (*Burning Activity Calendar*)

Each calendar matrix cell $(y, m)$ is normalized to scalar $t \in [0, 1]$ and mapped via piece-wise linear interpolation across one of the 4 selectable color scales:

1. **🔥 Inferno (Default — Perceptually Uniform Thermal Scale):**
   `#000004` ($0\%$) $\rightarrow$ `#420a68` ($25\%$) $\rightarrow$ `#932667` ($50\%$) $\rightarrow$ `#dd513a` ($75\%$) $\rightarrow$ `#fcffa4` ($100\%$)
2. **🌿 Viridis (Scientific Multi-Hue High Contrast):**
   `#440154` ($0\%$) $\rightarrow$ `#3b528b` ($25\%$) $\rightarrow$ `#21918c` ($50\%$) $\rightarrow$ `#5ec962` ($75\%$) $\rightarrow$ `#fde725` ($100\%$)
3. **👁️ Cividis (Optimized for Severe Deuteranopia & Protanopia):**
   `#00204d` ($0\%$) $\rightarrow$ `#414d6b` ($25\%$) $\rightarrow$ `#7c7b78` ($50\%$) $\rightarrow$ `#bba868` ($75\%$) $\rightarrow$ `#ffea46` ($100\%$)
4. **🌡️ Diverging Anomaly (Blue–White–Red for Monthly Anomaly $\Delta\%$ vs. Baseline):**
   `#2166ac` ($-100\%$ Below median) $\rightarrow$ `#67a9cf` ($-50\%$) $\rightarrow$ `#f7f7f7` ($0\%$ Climatological median) $\rightarrow$ `#ef8a62` ($+50\%$) $\rightarrow$ `#b2182b` ($\ge +100\%$ Critical anomaly)

---

## 3. Typography & Fluid Responsive Scale

- **Primary UI Font:** `Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
- **Monospace Font (Data, Coordinates, Cells, Formulas):** `"JetBrains Mono", "Cascadia Code", ui-monospace, monospace` with `font-variant-numeric: tabular-nums`.

```css
/* Adaptive fluid typography */
--text-xs: clamp(0.70rem, 0.66rem + 0.20vw, 0.75rem);     /* Matrix cells, axis labels */
--text-sm: clamp(0.8125rem, 0.78rem + 0.20vw, 0.875rem);  /* Controls, tables, badges */
--text-base: clamp(0.9375rem, 0.90rem + 0.25vw, 1rem);    /* Paragraphs, descriptions */
--text-lg: clamp(1.125rem, 1.05rem + 0.35vw, 1.25rem);    /* Section headers */
--text-xl: clamp(1.35rem, 1.20rem + 0.60vw, 1.65rem);     /* KPI values */
--text-2xl: clamp(1.65rem, 1.45rem + 0.85vw, 2.15rem);    /* Top mission title */
```

---

## 4. Layout Breakpoints & Grid Composition

| Breakpoint | Window Width | Layout Composition |
| :--- | :---: | :--- |
| `sm` | `< 768px` | Single stacked column; calendar matrix with smooth touch horizontal pan |
| `md` | `768px – 1023px` | 2×2 KPI grid; Map viewport on top, Calendar matrix 100% width below |
| `lg` | `1024px – 1439px` | 4-column KPI row; Asymmetric split 5/12 (Map AOI) + 7/12 (Calendar 27×12) |
| `xl` | `≥ 1440px` | Full *Mission Control* workspace up to `1600px` max-width |

---

## 5. Visual Architecture Wireframes (ASCII)

### 5.1 Mission Control Navigation (`Navbar.tsx`) & KPI Row (`KPISummaryCards.tsx`)

```text
+---------------------------------------------------------------------------------------------------+
| [🛰️ TerraSpot Harmonizer]  NASA FIRMS MODIS+VIIRS (2000-2026)                                     |
| Region: [🇵🇪 Huánuco & Peruvian Andes ▾]  Years: [2000 ▾]–[2026 ▾]  [📂 Upload CSV] [⬇️ Export CSV] |
+---------------------------------------------------------------------------------------------------+
| +-----------------------+ +-----------------------+ +-----------------------+ +-----------------+ |
| | HARMONIZED CELL-DAYS  | | PEAK BURNING SEASON   | | SELECTED YEAR ANOMALY | | DOMINANT REGIME | |
| | 38,420 AFCD           | | Aug – Sep             | | +42.8% (Z = +2.14)    | | 🌾 Agricultural | |
| | R² = 0.94 Calibrated  | | 68% of annual total   | | 🔴 CRITICAL PERIOD    | | / 🔥 Aug Wildf. | |
| +-----------------------+ +-----------------------+ +-----------------------+ +-----------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 5.2 Split Workspace: Interactive AOI Map (`MapAOISelector.tsx`) + Heatmap (`BurningCalendarMatrix.tsx`)

```text
+-----------------------------------------+ +-------------------------------------------------------+
| 🗺️ INTERACTIVE AOI & NASA GIBS VIEWER   | | 🗓️ HARMONIZED BURNING ACTIVITY CALENDAR (2000–2026)   |
| [✏️ Draw Box] [🛰️ NASA GIBS Thermal ON] | | Metric: [Harmonized ▾]  Ramp: [Inferno (Accessible) ▾]|
| +-------------------------------------+ | |                                                       |
| |                                     | | | YEAR | J  F  M  A  M  J  J  A  S  O  N  D | TOTAL |   |
| |       +---------------------+       | | | -----+------------------------------------+-------|   |
| |       |  Selected AOI Box   |       | | | 2000 | ·  ·  ·  ·  ░  ▒  ▓  █  ▓  ▒  ·  · | 1,120 |M  |
| |       |  🔥 Hotspots Grid   |       | | | ...  | ...                                | ...   |O  |
| |       +---------------------+       | | | 2011 | ·  ·  ·  ·  ░  ▒  ▓  █  █  ▒  ·  · | 1,340 |D  |
| |                                     | | | -----+------------------------------------+-------|   |
| +-------------------------------------+ | | 2012 | ·  ·  ·  ·  ░  ▒  ▓  █  ▓  ▒  ·  · | 1,290 |F  |
| Bounding Box Coordinates (WGS84):       | | | 2020 | ·  ·  ·  ░  ▒  ▓  █ [🔥] █  ▓  ░  · | 2,180 |U  |
| MinLat: [-10.60] MaxLat: [-8.40]        | | | 2024 | ·  ·  ·  ░  ▒  ▓  █ [🔥][🔥] ▓  ░  · | 2,410 |S  |
| MinLon: [-77.10] MaxLon: [-74.40]       | | | 2026 | ·  ·  ·  ░  ▒  ▓  █  █  ▓  ▒  -  - | 1,890 |V  |
| [Apply Coordinates] [Reset to Preset]   | | | -----+------------------------------------+-------|   |
|                                         | | | MED  | 12 8  10 19 45 92 210 385 340 160 35 15  |   |
+-----------------------------------------+ +-------------------------------------------------------+
```

### 5.3 Coordinated Lower Analytical Tabs

```text
+---------------------------------------------------------------------------------------------------+
| [📈 1. Seasonal Climatology & Anomaly] [🔬 2. Sensor Harmonization Audit] [🌾/🔥 3. Fire Regime]   |
+---------------------------------------------------------------------------------------------------+
|  Hotspots                                        |  INSPECTED CELL / YEAR DETAILS (Aug 2024)      |
|   450 |                 ╭───╮  <-- 2024 (Alert)  |  • Raw MODIS (1km):       215 detections       |
|       |             ╭───╯   ╰──╮                 |  • Raw VIIRS (375m):      1,340 detections     |
|   200 |   ░░░░░░░░░╭╯░░░░░░░░░░░╰╮░░░░░          |  • Harmonized Cell-Days:  326 AFCD             |
|       |   ·········•············•····· (Median)  |  • Historical Median:     184 AFCD             |
|     0 +---------------------------------         |  • Departure Anomaly:     +77.2% (Z = +3.09)   |
|         J  F  M  A  M  J  J  A  S  O  N  D       |  • Fire Radiative Power:  Mean 48.6 MW (Max 74)|
|                                                  |  • Regime Classification: 🔥 SEVERE WILDFIRE  |
+---------------------------------------------------------------------------------------------------+
```

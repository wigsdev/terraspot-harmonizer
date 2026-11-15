# Technical Research: Fire Regime Diagnostic Classifier (`FireRegimePanel.tsx`)

**Branch**: `feat/T-09-fire-regime-classifier`  
**Date**: 2026-11-15  
**Spec Reference**: [`specs/008-fire-regime-classifier/spec.md`](spec.md)

---

## 1. Context & Research Objectives

The core scientific mandate of **NASA Space Apps Challenge 15 Requirement R6** is to eliminate ambiguity in raw active fire counts by differentiating **seasonal agricultural burning** (customary, diurnal crop residue management with low thermal energy) from **destructive landscape wildfires** (high-intensity crown fires with persistent nocturnal combustion).

This research resolves:
1. Architectural integration of an interactive 2D Recharts Scatter Plot (`ScatterChart`) displaying multi-decadal monthly observations.
2. Formulation and rendering of the three operational quadrants using dynamic bounds and shaded zones.
3. Historical regime distribution breakdown logic and performance across 322 monthly records.
4. Institutional mitigation guidance matrix tailored for Civil Defense, Park Rangers, and Agricultural Authorities.
5. High-contrast aerospace dark theme (`#0B0F17`), WCAG 2.1 AA accessibility, and seamless client-side bilingual (`EN`/`ES`) reactivity.

---

## 2. Scientific Formulations & Quadrant Thresholds

### 2.1 The Remote Sensing Observables
Satellite thermal anomaly records contain two critical biophysical indicators:
1. **Fire Radiative Power ($\overline{\text{FRP}}$ in Megawatts):** Instantaneous thermal energy emission rate. Low values ($\overline{\text{FRP}} < 25\text{ MW}$) indicate light fuels (grassland, stubble, pasture). High values ($\overline{\text{FRP}} > 45\text{ MW}$) indicate dense woody biomass combustion (forest canopy, heavy slash).
2. **Nighttime Combustion Fraction ($f_{\text{night}}$):** Proportion of orbital detections logged during night passes (`daynight == 'N'`). Because agricultural burnings are intentionally lit during the afternoon and extinguished by dusk, $f_{\text{night}} < 0.10$. Uncontrolled wildfires continue burning, spotting, and crowning throughout the night due to high fuel loads and thermal inertia ($f_{\text{night}} > 0.20$).

### 2.2 Composite Fire Regime Intensity Index ($I_{\text{regime}}$)
Adhering strictly to `docs/02-modis-viirs-harmonization-methodology.md` Section 6:

$$
I_{\text{regime}} = 0.60 \cdot \min\left(100, \frac{P_{90}(\text{FRP})}{80\text{ MW}} \times 100\right) + 0.40 \cdot \min\left(100, \frac{f_{\text{night}}}{0.35} \times 100\right)
$$

### 2.3 Operational Quadrant Delimitation

| Quadrant | Operational Designation | Mean FRP (MW) | Night Fraction ($f_{\text{night}}$) | $I_{\text{regime}}$ | Visual Token | Diagnostic Signature |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **Q1** | **Seasonal Agricultural Burning** | $< 25\text{ MW}$ | $< 0.10$ ($< 10\%$) | $< 35$ | Emerald / Cyan (`#10B981`) | Controlled daytime stubble burning, low fuel load, zero overnight smoldering. |
| **Q2** | **Mixed / Transitional Regime** | $25\text{--}45\text{ MW}$ | $0.10\text{--}0.20$ ($10\text{--}20\%$) | $35\text{--}65$ | Amber / Orange (`#F59E0B`) | Escaped field burns, secondary scrub clearance, moderate nocturnal persistence. |
| **Q3** | **Severe Landscape Wildfire** | $> 45\text{ MW}$ | $> 0.20$ ($> 20\%$) | $\ge 65$ | Crimson / Red (`#EF4444`) | Catastrophic crown wildfire, deep smoldering, contiguous multi-day fire fronts. |

---

## 3. Technology & Component Design Decisions

### 3.1 Recharts 2D Scatter Plot Architecture
- **Decision:** Use Recharts `ScatterChart`, `ResponsiveContainer`, `XAxis`, `YAxis`, `ZAxis`, `Scatter`, `ReferenceLine`, `ReferenceArea`, and custom `Tooltip`.
- **Series Partitioning:** Partition monthly observations into three distinct `Scatter` components:
  1. `Scatter name="Agricultural"` with `data={agriculturalPoints}` and `fill="#10B981"`.
  2. `Scatter name="Transitional"` with `data={transitionalPoints}` and `fill="#F59E0B"`.
  3. `Scatter name="Severe Wildfire"` with `data={severeWildfirePoints}` and `fill="#EF4444"`.
  4. An overlaid `Scatter name="Active Year"` with `data={activeYearPoints}` featuring an enlarged outer ring (`stroke="#38BDF8"`, `strokeWidth={2}`) to make the selected year immediately identifiable against the historical multi-decadal background.
- **Reference Areas & Lines:**
  - `ReferenceArea` covering $X \in [0, 25]$, $Y \in [0, 0.10]$ with fill `rgba(16, 185, 129, 0.06)`.
  - `ReferenceArea` covering $X \in [25, 45]$, $Y \in [0.10, 0.20]$ with fill `rgba(245, 158, 11, 0.06)`.
  - `ReferenceArea` covering $X \in [45, 100]$, $Y \in [0.20, 0.50]$ with fill `rgba(239, 68, 68, 0.06)`.
  - `ReferenceLine x={25}`, `ReferenceLine x={45}`, `ReferenceLine y={0.10}`, `ReferenceLine y={0.20}` with dashed subtle borders (`#475569`).
- **Rationale:** Native Recharts SVG components render $< 30\text{ ms}$ for 322 points, provide smooth tooltips, and allow seamless integration with the existing `ResizeObserverMock` in Vitest tests.

### 3.2 Dynamic Axis Scaling & Zero-Fire Filtering
- **Decision:** Exclude months where $H_{y,m} = 0$ (no detected fires) from the scatter plot, avoiding a cluster of meaningless points at $(0, 0)$.
- **X-Axis Domain:** `[0, (dataMax) => Math.max(100, Math.ceil(dataMax / 10) * 10)]`. Default maximum is $100\text{ MW}$, expanding dynamically if an extreme catastrophic event exceeds $100\text{ MW}$.
- **Y-Axis Domain:** `[0, (dataMax) => Math.max(0.40, Math.min(1.0, Math.ceil(dataMax * 10) / 10))]`. Default range is $0.0\text{--}0.40$ ($40\%$ night combustion), accommodating extreme night persistence up to $1.0$.

### 3.3 Historical Regime Breakdown Cards
- **Decision:** Aggregate all active historical months for the selected Area of Interest:
  - `agricultural_pct = (agricultural_count / total_active_months) * 100`
  - `transitional_pct = (transitional_count / total_active_months) * 100`
  - `severe_wildfire_pct = (severe_wildfire_count / total_active_months) * 100`
  - Overall regional dominant regime (the mode of all monthly records).
  - Multi-year mean Fire Regime Index ($\overline{I}_{\text{regime}}$).
- **Presentation:** High-impact metric cards above the chart with color-coded badges, counts, and percentages.

### 3.4 Multi-Agency Operational Mitigation Advice Matrix
- **Decision:** Provide three institutional advisory cards:
  1. **Civil Defense (Defensa Civil / Emergency Response):**
     - Normal/Agricultural: Standard seasonal monitoring; verify local municipal fire brigade equipment readiness.
     - Transitional: Standby mobilization; restrict open burning permits; pre-position water tankers near wildland-urban interface (WUI).
     - Severe Wildfire: Emergency Operations Center (COEN) activation; aerial suppression mobilization; evacuation corridor notices.
  2. **Park Rangers & Conservation Units (Guardaparques / SERNANP):**
     - Normal/Agricultural: Buffer zone community outreach; verify agrarian boundary firebreaks ($3\text{--}5\text{ m}$).
     - Transitional: Intensified boundary patrols; deploy thermal camera UAVs for nocturnal hotspot verification.
     - Severe Wildfire: Immediate ground crew initial attack; tactical backburning operations; temporary closure of protected park access routes.
  3. **Agricultural & Agrarian Authorities (Autoridades Agrarias / Extension):**
     - Normal/Agricultural: Supervised burning permits; enforce daytime burning window (10:00–15:00 hrs, wind $< 15\text{ km/h}$).
     - Transitional: Immediate suspension of agricultural burn permits during high wind / low humidity advisories; promote stubble chopping and compost incorporation.
     - Severe Wildfire: Total burning ban; impose administrative sanctions on unpermitted field clearing; post-fire soil recovery assistance.

---

## 4. Accessibility & Responsive UX Standards

- **Theme Compliance:** Strict alignment with `#0B0F17` (Deep Space Navy), `#161F30` (Surface Navy), `#334155` (Slate borders), and `#F8FAFC` (High-contrast typography).
- **Colorblind Safety:** Green (`#10B981`) paired with cyan accents, amber (`#F59E0B`), and crimson (`#EF4444`) with distinct SVG dot shapes (circles, triangles, diamonds) and text badges, ensuring full WCAG 2.1 AA legibility without relying exclusively on color.
- **Bi-directional Year Synchronization:** The selected year state in `App.tsx` (set by `BurningCalendarMatrix` or `ClimatologyAnomalyChart`) passes down to `FireRegimePanel`, highlighting that year's monthly trajectory across the scatter plot.

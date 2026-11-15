# Research & Technical Decisions: Climatological Anomaly Curves & Sensor Harmonization Audit Panels

**Feature**: `specs/007-climatology-sensor-audit/`  
**Date**: 2026-11-15  
**Author**: Lead UI/UX Design System Architect & Aerospace Mission Operations Engineer

---

## 1. Charting Architecture: Recharts vs. D3 vs. Chart.js

### Decision
Utilize **Recharts 2.15+** with composable declarative primitives (`ResponsiveContainer`, `ComposedChart`, `Area`, `Line`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `Legend`, `ReferenceLine`, `ReferenceArea`).

### Rationale
- **Zero Additional Bundle Cost:** `recharts` is already declared in `package.json` (`^2.15.0`) and bundled with Vite.
- **React 19 Compatibility:** Recharts 2.15+ cleanly operates in React 19 StrictMode with declarative component state.
- **Composable Multi-Layering:** `ComposedChart` allows rendering floating range areas (`[p25, p75]`), multiple overlay lines, and reference markers in a single coordinated SVG coordinate system.
- **High-Performance Vector Rendering:** SVG elements provide razor-sharp rendering on Retina/4K displays, with hardware-accelerated CSS opacity transitions and hover hit testing.

### Alternatives Considered
- *Raw D3.js:* Provides ultimate rendering freedom, but requires hundreds of lines of imperative DOM manipulation, explicit resize observers, and manual tooltip positioning, increasing regression risks.
- *Chart.js / React-Chartjs-2:* Canvas-based, making high-contrast text contrast styling, aerospace dark gradients, and custom Tailwind tooltips harder to style seamlessly.

---

## 2. Climatological Anomaly Envelope Visualization

### Decision
Model the climatological envelope using a Recharts `Area` component with range bounds:
```tsx
<Area
  type="monotone"
  dataKey="iqr_range" // [p25, p75]
  stroke="none"
  fill="#38BDF8"
  fillOpacity={0.12}
  name="Normal Range (P25–P75)"
/>
```
Superimposed with:
1. `Line` for Climatological Median ($M_m$, 2001–2025): solid cyan/slate line (`strokeWidth={2}`, `stroke="#94A3B8"`).
2. `Line` for $P_{90}$ Critical Threshold: dashed amber/crimson line (`strokeWidth={1.5}`, `strokeDasharray="4 4"`, `stroke="#F43F5E"`).
3. `Line` for Active Year Trajectory: bold amber line (`strokeWidth={2.5}`, `stroke="#F59E0B"`) with dynamic status dots.

### Rationale
- **Floating Shaded Band:** Recharts natively supports array-valued dataKeys (`[min, max]`) in `Area`, shading strictly between the 25th and 75th percentiles without requiring stacked math.
- **Cognitive Clarity:** The shaded band immediately tells the analyst whether the active season is within normal climatological bounds. When the active trajectory pierces above the band or breaches the $P_{90}$ line, it triggers immediate emergency awareness.
- **Safe Termination for 2026:** For future months (Nov–Dec 2026), the active year value is `null`, causing Recharts `connectNulls={false}` to stop the line cleanly at October without artificial drop-offs.

---

## 3. Sensor Harmonization Audit: Step-Jump Demonstration & Multi-Decadal Timeline

### Decision
Render an interactive 27-year time series ($2000\text{--}2026$, 322 monthly timestamps) with independent layer visibility toggles and a dedicated `ReferenceArea` annotating the 2012 sensor transition.

### Layers Available:
1. `Raw MODIS C6.1 (1 km)` (2000–2026): `#F59E0B` (Amber)
2. `Raw VIIRS C2 (375 m)` (2012–2026): `#8B5CF6` (Violet) — Exposing the artificial 3x step-jump.
3. `Coregistered AFCD (0.01° grid)`: `#64748B` (Slate, dashed) — Demonstrating Stage 2 spatial clustering.
4. `Final Harmonized Series (H_y,m)`: `#06B6D4` (Cyan, bold 2.5px) — Proving seamless continuity.

### Rationale
- Fulfills the core NASA Challenge 15 deliverable: explaining why sensor calibration is required and validating that the harmonization formula eliminates the artificial step-jump.
- Permitting reviewers to toggle individual layers on and off provides transparency into each stage of the physical model.

---

## 4. Model Fit Scorecards & Regional $\beta_m$ Calibration Factors

### Decision
Present validation metrics via a dedicated scientific scorecard grid:
1. $R^2$ Determination Coefficient ($\ge 0.90$)
2. Pearson Correlation $r$ ($\ge 0.95$)
3. MAPE Reduction ($\ge 65\%$)
4. Root Mean Square Error (RMSE in AFCD)

Accompanied by a 12-month horizontal bar chart or card matrix illustrating the empirical monthly scaling ratios ($\beta_1 \dots \beta_{12}$).

### Rationale
- Traceability: Shows how each Area of Interest possesses unique seasonal calibration parameters depending on canopy density and cloud cover.
- Reuses existing `ValidationMetrics` and `RegionCube.seasonal_beta` data structures already pre-computed in `public/data/regions_catalog.json`.

---

## 5. Bidirectional State Synchronization with `BurningCalendarMatrix`

### Decision
The active year in `ClimatologyAnomalyChart` defaults to the latest complete observation year (`2024` or active `2026`), but automatically synchronizes whenever the user clicks a cell or year row in `BurningCalendarMatrix`. Conversely, selecting a year in the chart dropdown notifies downstream listeners.

### Rationale
- Creates a seamless mission control experience where inspecting a cell in the 27-year matrix immediately unfolds its seasonal curve in the lower panel without manual navigation.

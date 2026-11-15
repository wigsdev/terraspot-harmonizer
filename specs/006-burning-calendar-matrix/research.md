# Research: Interactive Burning Activity Calendar Matrix Architecture

**Feature**: `006-burning-calendar-matrix` (`T-07`)  
**Context**: NASA Space Apps Challenge 2026 — Challenge 15 (Requirements R2, R4, R5, R6)  
**Date**: 2026-11-15  

---

## 1. High-Density Matrix Rendering Engine: CSS Grid vs. Canvas/SVG

### Question
How should the 27-year × 12-month (324 cells) calendar matrix be rendered in React 19 to achieve sub-50ms mounting, crisp typography, and full WCAG 2.1 AA accessibility?

### Evaluation
1. **HTML5 Canvas**:
   - *Pros*: Extremely fast for tens of thousands of data points.
   - *Cons*: Poor accessibility (no native DOM nodes for screen readers or keyboard focus), cumbersome tooltip hit testing, complex text rendering across device pixel ratios.
2. **SVG `<rect>` elements**:
   - *Pros*: Scalable, supports DOM events and tooltips.
   - *Cons*: Requires custom viewBox calculations, SVG text styling lacks native flex/grid centering and responsive fluid wraps.
3. **Pure Semantic HTML / CSS Grid (Tailwind CSS v4)**:
   - *Pros*: 324 elements is a trivial DOM payload for modern browsers (renders in $< 8\text{ ms}$). Native CSS Grid provides clean 12-month columns with sticky Year labels, native `<button>` or `role="gridcell"` elements for Tab/Arrow key navigation, automatic WCAG contrast, and seamless tooltip anchoring.
   - *Cons*: Requires disciplined responsive layout for mobile screens.

### Decision
**Pure Semantic HTML & CSS Grid**: Render the matrix using responsive CSS Grid with a fixed column for Year/Era labels, 12 month columns, and a right margin summary column, wrapped in a smooth horizontal overflow container with sticky left headers for smaller screens.

---

## 2. Multi-Metric Normalization & Chromatic Mapping

### Question
How should the 4 view modes map their numerical ranges to color stops while upholding strict WCAG 2.1 AA contrast?

### Evaluation
1. **Mode 1 — Harmonized Frequency ($H_{y,m}$)**:
   - Normalized over $[0, H_{\max}]$ where $H_{\max}$ is the region's 99th percentile monthly hotspot count (preventing isolated catastrophic spikes from flattening the visual scale).
   - Sequential palettes (**Inferno**, **Viridis**, **Cividis**) interpolated from $t=0.0$ to $t=1.0$.
2. **Mode 2 — Climatological Anomaly ($\Delta\%$ Departure)**:
   - Evaluated as $\Delta\% = \frac{H_{y,m} - M_m}{M_m} \times 100\%$ where $M_m$ is the 2001–2025 monthly baseline median.
   - Centered symmetrically at $t=0.5$ ($0.0\%$ departure). $\Delta\% \le -100\%$ maps to $t=0.0$ (deep blue), $\Delta\% = 0\%$ maps to $t=0.5$ (neutral high-contrast gray/white), and $\Delta\% \ge +100\%$ maps to $t=1.0$ (saturated thermal crimson).
   - **Mandatory constraint:** Must always use the Diverging Blue-White-Red palette (`ACCESSIBLE_PALETTES.diverging`), regardless of user's active sequential palette.
3. **Mode 3 — Fire Radiative Power (Mean FRP MW)**:
   - Normalized over $[10.0\text{ MW}, 80.0\text{ MW}]$, separating low-intensity agricultural burns ($< 25\text{ MW}$) from extreme canopy megafires ($> 45\text{ MW}$).
4. **Mode 4 — Raw Unharmonized Sensor Audit**:
   - Displays uncalibrated monthly hits (MODIS C6.1 2000–2026 and VIIRS C2 2012–2026).
   - Purpose: Visually highlights the threefold artificial jump in 2012 to educate evaluators on why NASA requires harmonization.

### Decision
Use pure normalization functions in `src/engine/colorRamps.ts` (`normalizeValue`, `normalizeDivergingAnomaly`, `getAccessibleCellStyle`) ensuring every cell dynamically chooses light or dark text based on its relative luminance to satisfy $\text{contrast ratio} \ge 4.5:1$.

---

## 3. Sensor Era Bracket Visual Delineation

### Question
How should the three satellite observation eras be visually partitioned without cluttering the matrix?

### Evaluation
The 27 years naturally segment into three distinct remote sensing operational eras:
1. **MODIS Solo Era (2000–2011, 12 years):** Only MODIS Terra/Aqua active fire detections ($1000\text{ m}$).
2. **Dual-Sensor Fusion Era (2012–2025, 14 years):** Overlap period used for empirical calibration ($\beta_m$) and $0.70/0.30$ variance-weighted fusion.
3. **VIIRS Continuity Era (2026, operational current):** VIIRS $375\text{ m}$ scaled down via $\beta_m$ to preserve multi-decadal consistency.

### Decision
Add a semantic vertical bracket column on the left of the Year axis with subtle color-coded accent lines and vertical badges (`MODIS (2000–2011)`, `DUAL FUSION (2012–2025)`, `VIIRS (2026)`), providing immediate historical grounding for judges.

---

## 4. Marginal Aggregations & Missing Data Safeguards

### Question
How should marginal summaries (annual row sums and monthly column medians) handle incomplete years like 2026?

### Findings
- **2026 Data Boundary:** In NASA FIRMS historical series, 2026 is complete through October (`2026-10`). November and December are future months.
- **Safeguards:**
  - Future months (`is_future_month: true`) render with diagonal striped hatching and label `N/A`. They are excluded from annual sums and monthly median calculations.
  - Baseline monthly medians ($M_m$) are calculated over the completed 25-year window $2001\text{--}2025$.
  - When $M_m = 0$ (e.g. desert or non-fire season month), anomaly departure defaults safely to $0.0\%$ if $H_{y,m} = 0$, or $+100.0\%$ if $H_{y,m} > 0$, preventing `NaN` or `Infinity` crashes.

---

## 5. Keyboard Navigation & ARIA Accessibility

### Decision
Implement standard WAI-ARIA grid pattern:
- Outer matrix: `role="grid"` with `aria-label="Burning Activity Calendar Matrix (2000–2026)"`.
- Rows: `role="row"`.
- Cells: `role="gridcell"`, `tabIndex={0}`, with comprehensive `aria-label` (e.g. `"August 2024: 326 harmonized hotspots, +77.2% anomaly, Severe Wildfire"`).
- Keyboard handler: `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` move focus across the 27 × 12 grid; `Enter` or `Space` selects the cell.

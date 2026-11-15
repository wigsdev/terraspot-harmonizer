# Feature Specification: Climatological Anomaly Curves & Sensor Harmonization Audit Panels

**Feature Branch**: `feat/T-08-curvas-anomalias-sensores`  
**Created**: 2026-11-15  
**Status**: Draft  
**Input**: Natural language feature specification for NASA Space Apps Challenge 2026 (Challenge 15 — Requirements R1 and R5) as defined in `docs/backlog.md` Task T-08.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seasonal Climatology & Anomaly Envelope Curve (`ClimatologyAnomalyChart.tsx`) (Priority: P1) 🎯 MVP

As an emergency responder, forestry engineer, or climate researcher, I need to visualize the active year's 12-month fire trajectory (Jan–Dec) superimposed against the 2001–2025 climatological baseline median ($M_m$), the interquartile range (IQR) envelope ($P_{25}\text{--}P_{75}$), and the critical $P_{90}$ alert threshold, so that I can instantly diagnose whether the current fire season is normal, unusually early, or severely elevated.

**Why this priority**: While the 27-year matrix (Task T-07) presents the broad historical overview, the Climatology Curve provides the detailed seasonal diagnosis for any individual operational year. It answers the fundamental field question: *"Are we burning more than normal for this time of year, and have we breached the critical $P_{90}$ disaster threshold?"*

**Independent Test**: Mount `ClimatologyAnomalyChart.tsx` for Huánuco (`PE-HCO`). Verify that:
1. The baseline median curve ($M_m$) is rendered across all 12 months.
2. The shaded IQR envelope ($P_{25}\text{--}P_{75}$) visually depicts the normal seasonal range.
3. The dashed $P_{90}$ threshold line marks extreme fire regimes.
4. The active year's trajectory (e.g. 2024) is plotted with data points, and hovering over any month reveals telemetry tooltips with exact hotspot counts, baseline median, and percentage departure ($\Delta\%$).
5. Changing the active year via dropdown or matrix selection smoothly updates the trajectory line in $< 50\text{ ms}$.

**Acceptance Scenarios**:
1. **Given** an active benchmark region, **When** `ClimatologyAnomalyChart` mounts, **Then** it renders the multi-year monthly baseline median line ($M_m$), shaded IQR envelope ($P_{25}\text{--}P_{75}$), and $P_{90}$ critical alert curve for months 1 to 12.
2. **Given** the climatology chart, **When** selecting a specific year (e.g. 2024 or 2020), **Then** an active trajectory line connects all observed months with circular markers colored according to anomaly status (normal/cyan, elevated/amber, critical/crimson).
3. **Given** incomplete months in 2026 (Nov–Dec), **When** 2026 is selected, **Then** the trajectory cleanly terminates at the latest available observation (October) without dropping to zero.

---

### User Story 2 - Sensor Harmonization Audit & Step-Jump Elimination (`SensorHarmonizationAudit.tsx`) (Priority: P2)

As a remote sensing auditor, NASA global judge, or academic evaluator, I need to inspect the multi-decadal time series (2000–2026) comparing raw MODIS counts ($1\text{ km}$), raw VIIRS counts ($375\text{ m}$), $0.01^\circ$ active fire cell-days (AFCD), and the **Final Harmonized Series ($H_{y,m}$)**, so that I can verify the mathematical necessity of cross-calibration and confirm that the artificial 2012 step-jump has been physically eliminated.

**Why this priority**: NASA Challenge 15 mandates transparency and justification for sensor fusion. Global judges need empirical proof that the ~3x increase in raw active fires observed in 2012 is an artifact of VIIRS's finer spatial resolution ($375\text{ m}$ vs $1\text{ km}$), and that TerraSpot Harmonizer successfully reconstructs a bias-free, physically continuous 27-year climate record.

**Independent Test**: Mount `SensorHarmonizationAudit.tsx`. Toggle series visibility checkboxes (*Raw MODIS*, *Raw VIIRS*, *AFCD Grid*, *Harmonized Curve*). Verify that enabling raw counts visually exposes the abrupt threefold vertical discontinuity in 2012, while the harmonized curve transitions smoothly across the 2011–2012 boundary with $R^2 > 0.90$.

**Acceptance Scenarios**:
1. **Given** `SensorHarmonizationAudit`, **When** rendered, **Then** it presents an interactive multi-decadal timeline chart spanning 2000 through 2026.
2. **Given** the audit chart, **When** toggling between *Raw Uncalibrated* and *Harmonized* layers, **Then** an integrated annotation badge highlights the 2012 transition and quantitatively details the resolution jump ($1\text{ km} \rightarrow 375\text{ m}$).
3. **Given** the harmonized curve, **When** examining the 14-year overlap baseline (2012–2025), **Then** both sensors correlate strongly ($R^2 > 0.90$) following Stage 2 geometric grid aggregation and Stage 3 seasonal calibration.

---

### User Story 3 - Model Fit Scorecards & Seasonal Calibration Factors ($\beta_m$) (Priority: P3)

As a scientific analyst, I need to view quantitative model fit cards ($R^2$, Pearson $r$, MAPE reduction $\ge 65\%$, and RMSE) alongside a visual breakdown of the 12 monthly calibration scaling ratios ($\beta_1 \dots \beta_{12}$) for the selected Area of Interest, so that I have complete traceability into the empirical parameters governing the harmonization.

**Why this priority**: Fulfills the NASA Open Science and peer-reviewed rigor requirements. Displaying the exact mathematical coefficients ($\beta_m = \text{median}(AFCD_{\text{VIIRS}, m} / AFCD_{\text{MODIS}, m})$) proves that harmonization is dynamically tailored to the regional vegetation, fuel type, and atmospheric transmissivity of each specific AOI.

**Independent Test**: Switch between benchmark regions (Huánuco vs California vs Pantanal). Verify that the 12 monthly $\beta$ factors re-render with distinct regional profiles (e.g. tropical wet-season vs Mediterranean dry-season ratios), and that model fit cards reflect regional regression statistics.

**Acceptance Scenarios**:
1. **Given** any active AOI, **When** inspecting the model validation section, **Then** 4 statistical cards display:
   - Coefficient of Determination ($R^2 \ge 0.90$)
   - Pearson Correlation Coefficient ($r \ge 0.95$)
   - Mean Absolute Percentage Error (MAPE) Reduction ($\ge 65\%$)
   - Root Mean Square Error (RMSE in AFCD)
2. **Given** the calibration parameters view, **When** examining the 12 monthly factors ($\beta_1 \dots \beta_{12}$), **Then** a compact horizontal bar chart or card grid displays each month's ratio with its confidence interval and baseline explanation.

---

## Edge Cases

- **Incomplete Future Months in 2026 (Nov–Dec):** Trajectory line terminates at October 2026 without plummeting to 0. Tooltips display `Pending` or `N/A`.
- **Zero Fire Activity Months ($H_{y,m} = 0$):** Point sits on the baseline axis. Departure percentage displays `0%` or `-100%` without `NaN%` or division-by-zero crashes.
- **Regions with Zero Historical Fires in a Given Month ($M_m = 0$):** If current fires $> 0$, anomaly departure is clamped to `+100%` rather than `+Infinity%`.
- **AOI Switching while Zoomed or Filtered:** Selecting a new region in `Navbar` or `MapAOISelector` cleanly resets the year trajectory and updates $\beta_m$ factors in $< 50\text{ ms}$ without UI flicker.
- **Bi-directional Synchronization with Matrix:** Clicking a year row or month cell in `BurningCalendarMatrix` immediately updates the active year in `ClimatologyAnomalyChart`, creating a unified mission operations workflow.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render `ClimatologyAnomalyChart` displaying monthly fire activity across calendar months 1–12 for the selected observation year.
- **FR-002**: System MUST render the historical climatological median curve ($M_m$, calculated over the 2001–2025 non-parametric baseline).
- **FR-003**: System MUST render a shaded interquartile range (IQR) area between the 25th percentile ($P_{25}$) and 75th percentile ($P_{75}$) representing normal seasonal envelope bounds.
- **FR-004**: System MUST render the critical anomaly alert threshold line ($P_{90}$) styled as a high-visibility dashed indicator (amber/crimson).
- **FR-005**: System MUST provide an interactive Year Selector dropdown (2000–2026) allowing users to switch the active trajectory, and MUST react to cell/year selection events dispatched from `BurningCalendarMatrix`.
- **FR-006**: System MUST render `SensorHarmonizationAudit` displaying a continuous multi-decadal time series (2000–2026) comparing:
  - Raw uncalibrated MODIS C6.1 ($1\text{ km}$)
  - Raw uncalibrated VIIRS C2 ($375\text{ m}$)
  - $0.01^\circ \times 0.01^\circ$ Active Fire Cell-Days (AFCD)
  - Final Bias-Corrected Harmonized Series ($H_{y,m}$)
- **FR-007**: System MUST provide independent visibility toggles for each audit time series layer.
- **FR-008**: System MUST visually annotate the 2012 sensor transition with an informational callout explaining the artificial resolution step-jump.
- **FR-009**: System MUST display 4 statistical model fit cards:
  - $R^2$ Determination Coefficient ($> 0.90$)
  - Pearson Correlation ($r > 0.95$)
  - MAPE Reduction Percentage ($> 65\%$)
  - Root Mean Square Error (RMSE)
- **FR-010**: System MUST display the regional monthly calibration factors ($\beta_1 \dots \beta_{12}$) derived from the 2012–2025 dual-sensor overlap baseline.
- **FR-011**: System MUST support 100% client-side bilingual internationalization (`EN` / `ES`) across all chart titles, axis labels, legends, tooltips, scorecards, and parameter tables.
- **FR-012**: System MUST adhere to WCAG 2.1 Level AA accessibility standards, using colorblind-safe palettes and contrast ratios $\ge 4.5:1$ on dark aerospace background.

---

### Key Entities *(data involved)*

- **ClimatologyCurvePoint**: Monthly datum representing the climatological envelope and active year observation:
  - `month`: number ($1\text{--}12$)
  - `month_name`: string (e.g. "Jan", "Ene")
  - `baseline_median`: number ($M_m$)
  - `baseline_p25`: number ($P_{25}$)
  - `baseline_p75`: number ($P_{75}$)
  - `baseline_p90`: number ($P_{90}$)
  - `active_year_value`: number | null
  - `active_year_anomaly`: number | null ($\Delta\%$)
  - `active_year_z_score`: number | null
  - `is_critical`: boolean ($P_{90}$ or $Z \ge 2.0$)
- **SensorAuditSeriesPoint**: Monthly datum spanning 2000 through 2026 across sensor regimes:
  - `date`: string ("YYYY-MM")
  - `year`: number
  - `month`: number
  - `raw_modis`: number
  - `raw_viirs`: number
  - `afcd_coregistered`: number
  - `harmonized`: number
  - `sensor_era`: `'MODIS_SOLO' | 'DUAL_SENSOR_FUSION' | 'VIIRS_CONTINUITY'`
- **RegionalModelFitMetrics**: Statistical validation summary for active Area of Interest:
  - `r_squared`: number ($R^2$)
  - `pearson_r`: number
  - `mape_reduction_percent`: number
  - `rmse_afcd`: number
  - `beta_factors`: Record<number, number> (months 1 through 12)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Climatological anomaly chart and sensor audit panel render and update in under **50 ms** upon region or year switch.
- **SC-002**: Interactive chart tooltips and hover crosshairs maintain **60 FPS** responsiveness ($< 16\text{ ms}$ render time) without frame drops.
- **SC-003**: The sensor audit panel mathematically demonstrates post-harmonization regression accuracy of $R^2 \ge 0.90$ and MAPE reduction $\ge 65\%$ across all 5 benchmark regions.
- **SC-004**: All chart lines, shaded areas, and interactive elements comply with WCAG 2.1 AA text contrast ($\ge 4.5:1$) and use colorblind-safe palettes (Inferno, Viridis, Cividis, Diverging).
- **SC-005**: Automated unit and component test suite achieves **100% pass rate** in Vitest with $\ge 8$ dedicated test cases covering curve plotting, year switching, sensor audit layer toggling, metric calculations, and bilingual localization.

---

## Assumptions

- The active Area of Interest data cube is provided via `RegionContext` and already contains pre-computed historical records (2000–2026), monthly baseline medians ($M_m$), percentiles ($P_{25}, P_{75}, P_{90}$), and regional $\beta_m$ factors from Task T-03 / T-04.
- Charts will be built using **Recharts** (`ResponsiveContainer`, `ComposedChart`, `Area`, `Line`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `Legend`), which is already installed as a core dependency (`package.json`).
- Mobile and tablet viewports will display charts with responsive width (`w-full`) and appropriate touch-friendly tooltip triggers.

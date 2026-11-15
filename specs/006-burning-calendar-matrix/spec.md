# Feature Specification: Interactive Burning Activity Calendar Matrix

**Feature Branch**: `feat/T-07-matriz-calendario`  
**Created**: 2026-11-15  
**Status**: Implemented  
**Input**: Natural language feature specification for NASA Space Apps Challenge 2026 (Challenge 15 — Requirements R2 and R4) as defined in `docs/backlog.md` Task T-07.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-Decadal Matrix Grid & Sensor Era Synthesis (Priority: P1) 🎯 MVP

As an emergency responder, climate researcher, or land manager, I need to visualize 27 continuous years (2000–2026) of fire activity across all 12 calendar months (Jan–Dec) in an accessible matrix grid, so that I can instantly identify seasonality patterns, peak burn periods, and inter-annual fire frequency across sensor eras.

**Why this priority**: The 27-year × 12-month calendar matrix is the foundational deliverable mandated by NASA Challenge 15 (Requirement R2). Without this visual grid, no comparative climatology or multi-era historical analysis can be conducted.

**Independent Test**: Mount `BurningCalendarMatrix.tsx` inside `RegionProvider` and `LanguageProvider` for default region `PE-HCO` (Huánuco). Verify that 27 rows (2000 to 2026) and 12 month columns are rendered with color-coded heatmap cells, sensor era grouping brackets (`MODIS Solo Era 2000–2011`, `Dual Fusion Era 2012–2025`, `VIIRS Continuity Era 2026`), annual cumulative sums in the right margin, and monthly baseline medians in the bottom margin.

**Acceptance Scenarios**:
1. **Given** an active benchmark region (`PE-HCO`), **When** the calendar matrix mounts, **Then** it renders 322 chronological monthly cells (27 rows from 2000 to 2026, with November and December 2026 marked as pending/future).
2. **Given** the calendar matrix view, **When** examining the left vertical axis, **Then** three distinct sensor era brackets are visually delineated with semantic badges (`MODIS Era`, `Dual Fusion Era`, `VIIRS Era`).
3. **Given** the calendar matrix view, **When** inspecting the margins, **Then** the rightmost column displays the annual total harmonized hotspots with a proportional visual mini-bar, and the bottom row displays the multi-year monthly baseline median ($M_m$, 2001–2025).

---

### User Story 2 - Analytical View Mode Switcher & Sensor Audit Step-Jump (Priority: P2)

As a scientific evaluator or fire analyst, I need to switch between 4 analytical visual modes (*Harmonized Frequency*, *Climatological Anomaly*, *Fire Radiative Power*, and *Raw Unharmonized Counts*), so that I can evaluate both harmonized trends and understand the empirical necessity of sensor calibration by visualizing the artificial 2012 step-jump.

**Why this priority**: NASA Challenge 15 specifically requires demonstrating the harmonization impact. Being able to toggle between raw uncalibrated counts and calibrated harmonized numbers proves the physical validity and utility of the harmonization model to NASA global judges.

**Independent Test**: Use the view mode toolbar to toggle across the 4 modes. In `Raw Unharmonized` mode, observe the sharp artificial threefold increase starting in 2012. In `Harmonized` mode, verify that the series is continuous and calibrated. In `Anomaly` mode, verify that cells switch to the diverging color scale centered at 0% departure.

**Acceptance Scenarios**:
1. **Given** the matrix in `harmonized` mode, **When** switching to `anomaly` mode, **Then** cell background colors re-interpolate using the diverging palette (blue for below-median, white/neutral for normal, red/vermilion for extreme above-median), and values display percentage departures ($\Delta\%$).
2. **Given** the matrix in `anomaly` mode, **When** a cell has an anomaly meeting critical conditions ($P_{90}$ or $Z \ge 2.0$), **Then** it displays an alert badge/pulsing indicator.
3. **Given** the matrix in `harmonized` mode, **When** switching to `raw` mode, **Then** cells display uncalibrated MODIS and VIIRS counts, visually demonstrating the raw step-jump in 2012.
4. **Given** the matrix in `frp` mode, **When** selected, **Then** cell colors map to mean Fire Radiative Power (MW) reflecting combustion energy intensity.

---

### User Story 3 - Interactive Cell Inspection, Tooltips & State Coordination (Priority: P3)

As a land manager or emergency coordinator, I need to hover over and click any individual monthly cell or annual row to inspect detailed fire regime telemetry and broadcast the selected period to downstream analytics panels, so that I can conduct deep-dive audits into specific extreme fire events (e.g., California 2020, Australia Black Summer 2019/2020, or Amazon 2024).

**Why this priority**: Interactive drill-down and cross-component coordination are essential for turning a static heatmap into an operational mission control dashboard, preparing the ground for Task T-08 (Climatology Curve & Sensor Audit charts).

**Independent Test**: Hover over any cell (e.g., September 2024 in Huánuco) to verify the rich aerospace dark tooltip with exact counts, median departure, $Z$-score, and regime classification. Click the cell and verify that it receives an active focus ring and invokes `onSelectMonth({ year, month })`.

**Acceptance Scenarios**:
1. **Given** the interactive matrix, **When** hovering over a cell, **Then** an accessible floating tooltip appears displaying: Year & Month, Sensor Era, Harmonized Count ($H_{y,m}$), Historical Median ($M_m$), Anomaly Departure ($\Delta\%$), Robust $Z$-Score, Mean FRP (MW), and Nocturnal Fraction ($f_{\text{night}}$).
2. **Given** the interactive matrix, **When** clicking a cell, **Then** it is marked with an active cyan/amber border ring, and `onSelectMonth` callback dispatches the selected record.
3. **Given** keyboard navigation, **When** a user presses arrow keys (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`), **Then** cell focus moves accordingly, and `Enter` or `Space` activates cell selection.

---

### Edge Cases

- **Incomplete Future Months in 2026 (Nov–Dec):** Must render with a subtle striped/hatched pattern, labeled `N/A`, and disabled from tooltip calculations or marginal median skew.
- **Months with Zero Fire Activity ($H_{y,m} = 0$):** Must render cleanly with the lowest palette stop (`offset 0.0`), displaying `0` without negative anomalies or `NaN%` division-by-zero crashes.
- **Degenerate Climatological Median ($M_m = 0$):** When historical baseline median is zero, departure percentage calculation must fallback to `+100%` if $H_{y,m} > 0$ or `0.0%` if $H_{y,m} = 0$, preventing `Infinity%`.
- **Viewport Constraints (Mobile & Small Tablets):** High-density 27 × 12 layout must feature horizontal scrolling with sticky Year labels and sticky Month headers so orientation is never lost.
- **Missing or Custom AOI Cube:** If a custom user bounding-box has fewer than 27 years of records, missing cells render gracefully with empty indicators.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render a 27-row (2000–2026) by 12-column (Jan–Dec) matrix grid representing monthly fire frequency for the active Area of Interest.
- **FR-002**: System MUST visually partition rows into three historical observation eras:
  - `MODIS Solo Era` (2000–2011)
  - `Dual-Sensor Fusion Era` (2012–2025)
  - `VIIRS Continuity Era` (2026)
- **FR-003**: System MUST provide a View Mode switcher supporting 4 analytical projections:
  - `harmonized`: Total harmonized active fire cell-days ($H_{y,m}$)
  - `anomaly`: Percentage departure vs. multi-year baseline median ($\Delta\%$)
  - `frp`: Mean Fire Radiative Power in Megawatts (MW)
  - `raw`: Raw uncalibrated sensor detection counts
- **FR-004**: System MUST dynamically color cells using the global colorblind-safe palette selected in `RegionContext` (`inferno`, `viridis`, `cividis`, `diverging`), with WCAG 2.1 AA text contrast compliance.
- **FR-005**: In `anomaly` view mode, the matrix MUST automatically use the diverging blue-white-red palette centered symmetrically at 0% departure, regardless of whether a sequential palette was active.
- **FR-006**: System MUST compute and display marginal summary statistics:
  - Right margin: Annual cumulative sum ($H_{\text{annual}}$) with an inline visual mini-bar
  - Bottom margin: Climatological baseline median for each month ($M_m$, 2001–2025)
- **FR-007**: Cells exceeding critical climatological thresholds ($P_{90}$ or robust $Z \ge 2.0$) MUST display a high-contrast visual alert badge (e.g. amber/crimson indicator).
- **FR-008**: System MUST display an aerospace dark tooltip on cell hover/focus containing complete record telemetry:
  - Formatted Year and Month name
  - Sensor Era tag
  - Harmonized count vs. baseline median
  - Anomaly percentage and $Z$-score
  - Anomaly classification (`NORMAL`, `ELEVATED`, `CRITICAL`)
  - Mean FRP (MW) and Night Detection Fraction ($f_{\text{night}}$)
- **FR-009**: System MUST allow selecting a specific monthly cell or year row on click, highlighting the selection and invoking an optional `onSelectRecord` callback for downstream synchronization.
- **FR-010**: System MUST support full bilingual internationalization (`EN` / `ES`) across all matrix controls, headers, tooltips, era labels, and legend scales.

---

### Key Entities *(data involved)*

- **CalendarMatrixViewMode**: Enumeration of the 4 view modes: `'harmonized' | 'anomaly' | 'frp' | 'raw'`.
- **CalendarCellData**: Model representing an individual month's rendered state:
  - `year`: number (2000–2026)
  - `month`: number (1–12)
  - `sensor_era`: `'MODIS_SOLO' | 'DUAL_SENSOR_FUSION' | 'VIIRS_CONTINUITY'`
  - `harmonized_hotspots`: number
  - `raw_modis_hotspots`: number
  - `raw_viirs_hotspots`: number
  - `departure_percentage`: number
  - `robust_z_score`: number
  - `anomaly_status`: `'NORMAL' | 'ELEVATED' | 'CRITICAL'`
  - `mean_frp_mw`: number
  - `night_fraction`: number
  - `is_future_month`: boolean
- **CalendarRowSummary**: Cumulative metrics for a single calendar year:
  - `year`: number
  - `total_harmonized`: number
  - `peak_month`: number
  - `max_departure`: number
- **CalendarColumnSummary**: Climatological baseline metrics for a calendar month across 2001–2025:
  - `month`: number
  - `baseline_median`: number
  - `baseline_p75`: number
  - `baseline_p90`: number

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Matrix grid renders all 322 historical monthly cells in under **50 ms** upon region or view mode switch.
- **SC-002**: 100% of matrix cells satisfy WCAG 2.1 Level AA contrast standards ($\ge 4.5:1$ for text numbers over colored cell backgrounds).
- **SC-003**: The visual distinction between `raw` and `harmonized` modes clearly demonstrates elimination of the artificial 2012 sensor step-jump ($R^2 > 0.90$).
- **SC-004**: Users can hover, focus, and inspect any cell's telemetry in under **16 ms** (60 FPS responsiveness) without UI lag.
- **SC-005**: Automated unit and component test suite achieves **100% pass rate** in Vitest with $\ge 8$ dedicated test cases covering grid rendering, mode switching, cell tooltips, and bilingual responsiveness.

---

## Assumptions

- **Pre-computed Baseline:** The 5 benchmark region cubes in `public/data/regions_catalog.json` contain continuous 2000–2026 records generated by `scripts/build_harmonized_cubes.py`.
- **Current Observation Horizon:** 2026 data currently extends through October (`2026-10`). Months 11 and 12 of 2026 are modeled as future pending months.
- **Display Resolution:** The full 27 × 12 matrix is optimized for desktop and tablet screens ($\ge 768\text{ px}$), with responsive horizontal scroll enabled on compact viewports to maintain legible typography.
- **Climatology Baseline Window:** The climatological baseline median and percentiles are derived from the 25-year window $2001\text{--}2025$ (excluding uncalibrated partial initial records).

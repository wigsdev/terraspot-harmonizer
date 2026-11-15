# Feature Specification: Fire Regime Diagnostic Classifier (`FireRegimePanel.tsx`)

**Feature Branch**: `feat/T-09-fire-regime-classifier`  
**Created**: 2026-11-15  
**Status**: Draft  
**Input**: Natural language feature specification for NASA Space Apps Challenge 2026 (Challenge 15 — Requirement R6) as defined in `docs/02-modis-viirs-harmonization-methodology.md` and `docs/backlog.md` Task T-09.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive 2D Fire Regime Scatter Plot & Quadrant Mapping (`FireRegimePanel.tsx`) (Priority: P1) 🎯 MVP

As a wildfire researcher, civil defense coordinator, or NASA evaluator, I need to explore an interactive 2D scatter plot mapping Fire Radiative Power (Mean and P90 FRP in Megawatts) against nocturnal combustion persistence (Night Fraction $f_{\text{night}}$) for every monthly observation in the active Area of Interest (AOI), so that I can immediately distinguish between routine, low-intensity agricultural stubble burns and dangerous, nocturnal crown forest wildfires.

**Why this priority**: Fulfills the core domain and operational value proposition of NASA Challenge 15 (Requirement R6). Thermal hotspot counts alone cannot identify destructive fire events; decoupling daytime agricultural burning from sustained landscape conflagrations provides emergency agencies with actionable triage intelligence.

**Independent Test**: Mount `FireRegimePanel.tsx` with the active AOI data cube (e.g., Huánuco `PE-HCO`). Verify that:
1. An interactive 2D Recharts Scatter Plot renders with X-axis (Mean FRP $0\text{--}100\text{ MW}$) and Y-axis (Night Fraction $f_{\text{night}}$ $0.0\text{--}0.50$).
2. The plot visually demarcates three operational quadrants using shaded reference zones and threshold boundary lines:
   - **Seasonal Agricultural Burning**: Mean FRP $< 25\text{ MW}$, $f_{\text{night}} < 0.10$, $I_{\text{regime}} < 35$ (Emerald/Cyan).
   - **Mixed / Transitional Regime**: Mean FRP $25\text{--}45\text{ MW}$, $f_{\text{night}} 0.10\text{--}0.20$, $35 \le I_{\text{regime}} < 65$ (Amber/Orange).
   - **Severe Landscape Wildfire**: Mean FRP $> 45\text{ MW}$, $f_{\text{night}} > 0.20$, $I_{\text{regime}} \ge 65$ (Crimson/Red).
3. Hovering over any point displays an aerospace dark telemetry tooltip (`#0B0F17`) detailing Year, Month, Mean FRP, P90 FRP, Night Fraction ($f_{\text{night}}$), Composite Regime Index ($I_{\text{regime}}$), and Harmonized Hotspot Count ($H_{y,m}$).
4. Clicking or highlighting an active year (e.g., 2024) emphasizes that year's 12 monthly observations while attenuating historical background points.

**Acceptance Scenarios**:
1. **Given** an active benchmark region, **When** `FireRegimePanel` renders, **Then** all historical monthly records (2000–2026) with active fire detections are plotted as categorized scatter points with distinct visual styling according to their regime classification.
2. **Given** the 2D scatter plot, **When** hovering over a point, **Then** a floating tooltip shows exact telemetry: Year, Month, Mean FRP (MW), P90 FRP (MW), Night Combustion Fraction (%), Regime Index ($I_{\text{regime}}$ / 100), and Regime Tier.
3. **Given** the operational quadrants, **When** observing the scatter plot layout, **Then** reference lines at $\text{FRP} = 25\text{ MW}$, $\text{FRP} = 45\text{ MW}$, $f_{\text{night}} = 0.10$, and $f_{\text{night}} = 0.20$ clearly delineate the boundaries between Agricultural, Transitional, and Severe Wildfire domains.

---

### User Story 2 - Historical Regime Distribution Percentage Breakdown (Priority: P2)

As a forestry authority or environmental policy maker, I need to see a high-level statistical breakdown showing the historical percentage distribution of monthly fire regimes for the active Area of Interest, so that I can quantify whether the region is predominantly agricultural or prone to catastrophic forest fire disasters.

**Why this priority**: Decision makers require summary statistics alongside raw scatter plots. Seeing that an AOI has $82\%$ agricultural burning vs $7\%$ severe wildfires establishes the long-term regional fire ecology baseline and guides long-range prevention budgets.

**Independent Test**: Inspect the distribution summary cards above or alongside the scatter plot. Verify that:
1. Three distinct metric cards display:
   - **Agricultural Burning %**: Count and percentage of total active months.
   - **Transitional / Escaped Fire %**: Count and percentage of total active months.
   - **Severe Landscape Wildfire %**: Count and percentage of total active months.
2. An overall **Dominant Fire Regime** badge and the multi-year average Fire Regime Index ($\overline{I}_{\text{regime}}$) are prominently indicated.
3. Switching between regions (e.g., agricultural Andean valleys vs dense Amazonian lowlands) updates distribution percentages in $< 50\text{ ms}$.

**Acceptance Scenarios**:
1. **Given** the historical dataset for an AOI, **When** calculating distribution statistics, **Then** percentages across the three regimes sum to $100\%$ (of months with fire activity) and display accurate record counts.
2. **Given** an AOI selection change, **When** a new region is selected, **Then** all three distribution cards and dominant regime badges dynamically recalculate and re-render instantly.

---

### User Story 3 - Multi-Agency Operational Mitigation & Decision Recommendations (Priority: P3)

As a disaster response coordinator (Civil Defense / INDECI), park ranger (SERNANP), or agricultural extension officer (Ministry of Agriculture), I need context-aware operational mitigation recommendations dynamically tailored to the active AOI's current or selected year regime severity, so that field teams can implement targeted suppression or preventive interventions.

**Why this priority**: Transforms satellite diagnostic data into direct tactical utility for frontline personnel, closing the gap between aerospace observations and field action.

**Independent Test**: Examine the operational mitigation panel. Verify that:
1. Three agency-specific recommendation columns/cards are presented:
   - **Civil Defense & Emergency Response** (e.g. fire crew staging, aerial water tanker readiness, evacuation corridor planning).
   - **Park Rangers & Conservation Units** (e.g. perimeter patrols, nocturnal drone thermal scouting, protected buffer enforcement).
   - **Agricultural & Agrarian Authorities** (e.g. prescribed burning permit enforcement, daytime burning calendar windows, residue mulching alternatives).
2. The operational alert level and specific guidance dynamically adapt based on the selected year's peak fire regime (e.g., heightened emergency mobilization when the active year exhibits Severe Wildfire points, versus routine agricultural permit oversight during normal years).

**Acceptance Scenarios**:
1. **Given** a year with Severe Wildfire activity ($I_{\text{regime}} \ge 65$ or Mean FRP $> 45\text{ MW}$), **When** viewing operational recommendations, **Then** the panel elevates to "Critical Wildfire Mobilization" mode with urgent tactical protocols for Civil Defense and Rangers.
2. **Given** a year dominated exclusively by Seasonal Agricultural Burning ($I_{\text{regime}} < 35$), **When** viewing operational recommendations, **Then** the panel displays "Agrarian Burning Governance" mode emphasizing scheduled burning windows, wind advisory compliance, and stubble incorporation.

---

## Edge Cases

- **Zero-Fire Months ($H_{y,m} = 0$, $\text{FRP} = 0$, $f_{\text{night}} = 0$):** Inactive months (e.g. wet season months with 0 detected fires) are excluded from the scatter plot to prevent visual clutter at the origin $(0, 0)$. A caption states: *"Excludes inactive months with zero detected fires ($H_{y,m} = 0$)"*.
- **Pending/Future Observation Months (e.g., Nov–Dec 2026):** Unobserved future records are filtered out of both the scatter plot and historical distribution cards, displaying no `NaN` or invalid points.
- **Extreme FRP Outliers (e.g., $\text{FRP} > 100\text{ MW}$):** The X-axis defaults to $0\text{--}100\text{ MW}$, with automatic domain expansion up to the maximum observed FRP ($\lceil\max(\text{FRP}) / 10\rceil \times 10$) so that extreme conflagrations are never clipped outside the visible chart area.
- **High Nocturnal Persistence with Low FRP (e.g., smoldering peat or dense understory scrub):** Classified correctly via the composite index formula ($I_{\text{regime}}$), which weights both P90 FRP ($60\%$) and Night Fraction ($40\%$).
- **Client-Side Responsive Layout on Small Screens:** On mobile viewports ($< 768\text{ px}$), the scatter plot maintains a minimum touch-friendly height ($320\text{ px}$), and recommendation cards stack vertically without horizontal overflow.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement `FireRegimePanel.tsx` in `src/components/FireRegimePanel.tsx` and export it through `src/components/index.ts`.
- **FR-002**: System MUST render an interactive 2D Recharts Scatter Plot (`ScatterChart`) mapping Mean Fire Radiative Power (MW) on the X-axis ($0\text{--}100+\text{ MW}$) against Nocturnal Combustion Fraction ($f_{\text{night}}$) on the Y-axis ($0.0\text{--}0.50$).
- **FR-003**: System MUST render three clearly demarcated operational quadrants based on scientific thresholds:
  1. *Seasonal Agricultural Burning*: Mean FRP $< 25\text{ MW}$, $f_{\text{night}} < 0.10$, $I_{\text{regime}} < 35$ (Emerald/Cyan tone: `#10B981` / `#06B6D4`).
  2. *Mixed / Transitional Regime*: Mean FRP $25\text{--}45\text{ MW}$, $f_{\text{night}} 0.10\text{--}0.20$, $35 \le I_{\text{regime}} < 65$ (Amber/Orange tone: `#F59E0B`).
  3. *Severe Landscape Wildfire*: Mean FRP $> 45\text{ MW}$, $f_{\text{night}} > 0.20$, $I_{\text{regime}} \ge 65$ (Crimson/Red tone: `#EF4444`).
- **FR-004**: System MUST render reference lines and shaded background zones (`ReferenceArea` / `ReferenceLine`) highlighting the quadrant boundaries.
- **FR-005**: System MUST render floating telemetry tooltips (`#0B0F17` dark aerospace card with border) on hover, providing:
  - Date (Year, Month name)
  - Fire Regime Classification badge
  - Mean FRP ($\text{MW}$) and P90 FRP ($\text{MW}$)
  - Nocturnal Combustion Fraction ($f_{\text{night}}$ as percentage)
  - Harmonized Active Fire Cell-Days ($H_{y,m}$)
  - Composite Fire Regime Index ($I_{\text{regime}}$ on a $0\text{--}100$ scale)
- **FR-006**: System MUST highlight observations belonging to the currently selected active year (synced with global year context or dropdown), while slightly dimming other historical observations for high-contrast temporal inspection.
- **FR-007**: System MUST provide historical regime distribution summary cards displaying count and percentage breakdown for Agricultural Burning, Transitional Fires, and Severe Wildfires for the active AOI.
- **FR-008**: System MUST display context-aware operational mitigation recommendations tailored to three distinct institutional roles:
  - Civil Defense / Emergency Response Authorities (e.g. INDECI / FEMA)
  - Park Rangers & Forestry Protection Units (e.g. SERNANP / USFS)
  - Agricultural & Agrarian Authorities (e.g. MIDAGRI / USDA Extension)
- **FR-009**: System MUST dynamically adapt the operational alert posture (Advisory vs Warning vs Tactical Mobilization) based on the peak fire regime observed in the selected year.
- **FR-010**: System MUST support 100% client-side bilingual internationalization (`EN` / `ES`) across all panel titles, quadrant labels, axis headings, tooltips, cards, and operational recommendation text.
- **FR-011**: System MUST strictly adhere to WCAG 2.1 Level AA accessibility standards, with high-contrast text, colorblind-safe quadrant accents, and full keyboard/screen-reader compatibility.
- **FR-012**: System MUST include comprehensive Vitest unit tests verifying regime calculation math, scatter data transformations, quadrant classification logic, and component rendering.

---

### Key Entities *(include if feature involves data)*

- **`FireRegimeScatterPoint`**: Transformed plotting point for Recharts containing `x` (mean FRP in MW), `y` (night fraction $f_{\text{night}}$), `z` (harmonized hotspots for bubble sizing or sorting), `year`, `month`, `p90_frp_mw`, `fire_regime_index`, `regime_class`, and `isActiveYear`.
- **`FireRegimeDistribution`**: Summary aggregation for the AOI containing `total_active_months`, `agricultural_count`, `agricultural_pct`, `transitional_count`, `transitional_pct`, `severe_wildfire_count`, `severe_wildfire_pct`, `dominant_regime`, and `mean_regime_index`.
- **`OperationalMitigationAdvice`**: Agency-specific guidance packet containing operational posture (`NORMAL` | `ELEVATED_MONITORING` | `CRITICAL_SUPPRESSION`), summary alert message, and actionable task lists for Civil Defense, Park Rangers, and Agricultural Authorities.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sub-50ms rendering and reactive updating of scatter points and distribution cards upon switching Areas of Interest.
- **SC-002**: 100% mathematical adherence to the Fire Regime Index formulation ($I_{\text{regime}} \in [0, 100]$) and operational quadrant boundaries defined in `docs/02-modis-viirs-harmonization-methodology.md`.
- **SC-003**: 100% client-side execution with zero external network requests or backend API calls.
- **SC-004**: 100% bilingual parity between English and Spanish, with zero untranslated strings or layout breaks.
- **SC-005**: Comprehensive unit test suite achieving 100% pass rate in Vitest (`pnpm test:run`) with zero type errors (`pnpm typecheck`) and a clean production build (`pnpm build`).

---

## Assumptions

- Pre-computed region data cubes (`public/data/*.json`) already contain populated `mean_frp_mw`, `p90_frp_mw`, `night_fraction`, `fire_regime_index`, and `regime_class` in each `HarmonizedMonthlyRecord`.
- The scatter plot is mounted in `src/App.tsx` directly beneath `SensorHarmonizationAudit` within the main analytical dashboard flow.
- Selected year state can be synchronized bidirectionally with the existing active year state in `App.tsx` (initialized from `BurningCalendarMatrix` or `ClimatologyAnomalyChart`).
- Recharts `ScatterChart`, `Scatter`, `XAxis`, `YAxis`, `ZAxis`, `Tooltip`, `ReferenceLine`, `ReferenceArea`, and `ResponsiveContainer` are compatible with the existing `ResizeObserverMock` configured in `tests/setup.ts`.

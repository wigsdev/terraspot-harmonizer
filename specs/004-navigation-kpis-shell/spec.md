# Feature Specification: Mission Navigation Shell & Dynamic KPI Summary Panel

**Feature Branch**: `feat/T-05-shell-navegacion-kpis`

**Created**: 2026-11-14

**Status**: Implemented (v0.5.0)

**Input**: User description: "Implement the primary mission navigation shell and top KPI summary panel (src/components/Navbar.tsx and src/components/KPISummaryCards.tsx) with reactive bilingual EN/ES support following docs/01-prd-terraspot-harmonizer.md and docs/design-system.md. Include the NASA Challenge 15 indicator, dropdown selector for the 5 benchmark regions, accessible palette selector (Inferno, Viridis, Cividis, Diverging), and 4 headline KPI cards featuring live harmonized metrics (Total Harmonized AFCD 2000-2026, Season Anomaly vs Historical Median, Cross-Sensor Correlation R2, and Fire Regime Classification) with responsive layout and Vitest component verification."

## Clarifications

### Session 2026-11-14
- Q: Which temporal reference period should the Season Anomaly Alert KPI card (Card 3) evaluate by default when a benchmark region is loaded? → A: Option A (Most Recent Available Observation: evaluates the latest month in the data cube, `2026-10`, against the historical monthly baseline median $M_{10}$ across the multi-decadal record, providing real-time operational situation awareness of the active fire season).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mission Navigation & Dynamic Benchmark Region Selection (Priority: P1) 🎯 MVP

As an Earth scientist, emergency analyst, or NASA Space Apps evaluator, I want a persistent top navigation bar that displays the mission brand, official Challenge 15 badge, and a benchmark region selector, so that I can seamlessly explore multi-decadal fire regimes across distinct ecosystems (Peruvian Andes, Amazon Basin, Paraná Delta, California, and New South Wales) and switch regions with immediate dashboard feedback.

**Why this priority**: Serves as the global control hub for the entire application. Without the region selector and navigation shell, users cannot load benchmark cubes or orchestrate downstream cartographic and matrix visualizers.

**Independent Test**: Load the web application, interact with the region dropdown, and verify that selecting any of the 5 benchmark regions updates active metadata, coordinates, and headline metrics instantaneously without full-page reloads.

**Acceptance Scenarios**:

1. **Given** the application shell in the browser, **When** the page renders, **Then** the top navigation bar displays the brand mark ("TerraSpot Harmonizer"), the official "Challenge 15" badge, the current version tag, and the active sensor baseline indicator ("MODIS 2000–2026 + VIIRS 2012–2026").
2. **Given** the region selector dropdown, **When** the user changes the active region (e.g. from "Huánuco & Central Peruvian Andes" to "California Sierra & Coastal Ranges"), **Then** the application state updates immediately and propagates the new region cube to all active cards.
3. **Given** the color palette selector in the navigation bar, **When** the user selects an accessible chromatic ramp (`inferno`, `viridis`, `cividis`, `diverging`), **Then** the active palette preference updates in global state and is preserved across interactions.

---

### User Story 2 - Real-Time Headline Mission KPI Summary Cards (Priority: P2)

As an environmental researcher or decision-maker, I want to inspect 4 coordinated executive KPI summary cards above the workspace displaying cumulative multi-decadal activity, seasonal fire concentration, climatological anomaly alerts, and fire regime classification, so that I can rapidly gauge regional fire risk, multi-sensor calibration quality ($R^2$), and severity before delving into detailed calendar matrices.

**Why this priority**: Fulfills Challenge 15 Requirements R1, R5, and R6 at the executive dashboard level. Connects the offline data cubes and mathematical engine to high-impact user-facing metrics.

**Independent Test**: Switch between different benchmark regions (e.g. `PE-HCO` agricultural valleys vs `US-CAL` extreme wildfire season) and verify that all 4 KPI cards display mathematically synchronized metrics, localized number formatting, and color-coded alert badges.

**Acceptance Scenarios**:

1. **Given** an active region cube, **When** Card 1 ("Harmonized Fire Activity") renders, **Then** it presents the total cumulative Active Fire Cell-Days (`AFCD`) across the entire 27-year record (`2000-01` to `2026-10`) alongside the cross-sensor validation coefficient of determination ($R^2 > 0.90$).
2. **Given** the active region's seasonal phenology, **When** Card 2 ("Peak Burning Season") renders, **Then** it identifies the primary calendar months of elevated burning (e.g. "Aug – Oct") and calculates the percentage share of annual fire activity concentrated during this peak.
3. **Given** the latest available fire observation in the data cube (`2026-10`), **When** Card 3 ("Season Anomaly Alert") renders, **Then** it evaluates active conditions against the historical monthly baseline median ($M_{10}$) across the multi-decadal record, displaying the percentage departure ($\Delta\%$), robust non-parametric $Z$-score, and color-coded severity badge (`NORMAL` for $Z < 1.0$, `ELEVATED` for $1.0 \le Z < 2.0$, `CRITICAL` for $Z \ge 2.0$).
4. **Given** the monthly 90th-percentile Fire Radiative Power (MW) and nocturnal combustion persistence ($f_{\text{night}}$), **When** Card 4 ("Dominant Fire Regime") renders, **Then** it displays the categorical regime badge (`AGRICULTURAL_BURN`, `TRANSITIONAL`, `SEVERE_WILDFIRE`) with mean FRP (MW) and nighttime detection fraction.

---

### User Story 3 - Reactive Bilingual Context & Global Accessibility (Priority: P3)

As an international evaluator from NASA or a regional disaster coordinator in South America, I want to toggle seamlessly between English (`EN`) and Spanish (`ES`) at any time, so that the entire navigation interface, KPI titles, tooltip descriptions, and alert labels translate reactively while maintaining WCAG 2.1 Level AA visual accessibility.

**Why this priority**: Required by the TerraSpot Harmonizer Constitution (Principle I: Dual-Language Protocol) and NASA Space Apps Challenge submission guidelines (global judging compliance with native Spanish accessibility).

**Independent Test**: Click the `EN / ES` toggle button in the navigation bar and verify that 100% of header labels, dropdown options, and KPI card texts update reactively without resetting the user's selected region or temporal state.

**Acceptance Scenarios**:

1. **Given** the application running in default English mode (`EN`), **When** the user clicks the language toggle button, **Then** the interface switches to Spanish (`ES`), translating all navigation labels, region descriptions, KPI titles, and regime categories instantly.
2. **Given** Spanish mode active, **When** numeric figures are displayed (e.g. thousands separators in cumulative counts), **Then** international locale formatting formats numbers appropriately without layout disruption.
3. **Given** high-contrast aerospace dark theme (`#0B0F17`) active, **When** KPI cards render, **Then** typography, badge backgrounds, and icon contrasts meet or exceed WCAG 2.1 Level AA standards ($\ge 4.5:1$).

---

### Edge Cases

- **Missing or Delayed Catalog Fetch:** What happens if the regions catalog JSON is loading or fails to load?  
  *Mitigation:* The application displays sleek skeleton loading placeholders across the 4 KPI cards and provides a fallback to the bundled default Huánuco (`PE-HCO`) configuration.
- **Extreme Anomaly Spikes ($Z > 5.0$ or $\Delta\% > +500\%$):** How are historical drought outliers (e.g., California 2020 megafires or Amazon 2024 extremes) formatted inside compact KPI cards?  
  *Mitigation:* Departure percentages and $Z$-scores use defensive typography with ellipsis truncation safeguards, ensuring badges remain legible across mobile (360px) and desktop viewports.
- **Regions with Zero Night Fires:** What happens if a selected sub-period or custom selection exhibits 0.0% night fire activity?  
  *Mitigation:* Formatting helpers display `0.0%` cleanly with zero `NaN` or `undefined` artifacts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a top navigation bar (`Navbar.tsx`) containing the application title, animated mission logo, "Challenge 15" badge, active version tag, sensor coverage summary, and accessible control triggers.
- **FR-002**: System MUST implement a region selector dropdown populated with all 5 benchmark Areas of Interest (`PE-HCO`, `SAM-MAP`, `AR-PAR`, `US-CAL`, `AU-NSW`) from `public/data/regions_catalog.json`, updating active regional context upon selection.
- **FR-003**: System MUST provide a color palette dropdown allowing users to select among all 4 certified colorblind-safe ramps (`inferno`, `viridis`, `cividis`, `diverging`).
- **FR-004**: System MUST provide a reactive bilingual language switcher (`LanguageContext.tsx`) supporting seamless toggling between English (`EN`) and Spanish (`ES`) across all navigation and KPI strings without page reloads.
- **FR-005**: System MUST render an executive 4-card KPI summary panel (`KPISummaryCards.tsx`) calculating and displaying:
  1. *Total Harmonized Fire Activity (2000–2026)* with post-calibration $R^2$ fit metric.
  2. *Peak Burning Season* months with percentage share of annual fire load.
  3. *Season Climatological Anomaly Alert* evaluating the latest observation month (`2026-10`) against historical monthly baseline median ($M_{10}$), reporting departure percentage ($\Delta\%$), robust $Z$-score, and color-coded alert tier (`NORMAL`, `ELEVATED`, `CRITICAL`).
  4. *Dominant Fire Regime Diagnostic* with regime classification badge (`AGRICULTURAL_BURN`, `TRANSITIONAL`, `SEVERE_WILDFIRE`), mean FRP (MW), and night detection fraction.
- **FR-006**: The KPI panel MUST implement a fluid responsive layout adapting from 1 column on mobile screens ($< 768\text{px}$), to a $2 \times 2$ grid on tablets and compact laptops ($768\text{px} \dots 1279\text{px}$), to 4 columns in a single row on wide desktop displays ($\ge 1280\text{px}$).
- **FR-007**: All numerical values displayed in KPI cards MUST use locale-aware number formatting (e.g. `Intl.NumberFormat`).
- **FR-008**: System MUST provide automated Vitest component verification suites validating dropdown interactions, bilingual string switching, and accurate KPI card value rendering.

### Key Entities

- **RegionContext**: Global application state providing the currently selected `RegionCube`, catalog of available benchmark regions, active color palette, and active language locale.
- **BilingualDictionary**: Structured dictionary mapping UI keys to English and Spanish text for navigation, KPI cards, sensor metadata, and alert statuses.
- **KPIMetricsSummary**: Calculated view model encapsulating total multi-decadal AFCD, model $R^2$, peak months, peak concentration percentage, recent anomaly departure, robust $Z$-score, alert status tier, mean FRP, night fraction, and fire regime classification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Interactive responsiveness: Switching active regions or toggling between English and Spanish updates the entire navigation header and all 4 KPI cards in $< 16\text{ ms}$ (within a single animation frame).
- **SC-002**: Visual accessibility compliance: 100% of text elements and badge containers across `Navbar.tsx` and `KPISummaryCards.tsx` achieve a contrast ratio $\ge 4.5:1$ against the dark aerospace background (`#0B0F17`) under WCAG 2.1 Level AA guidelines.
- **SC-003**: Responsive usability: The navigation header and KPI cards render without text clipping, overflow scrolls, or broken layouts across mobile (360px), tablet (768px), and desktop (1280px+) viewport widths.
- **SC-004**: Automated test coverage: 100% of unit and component test cases in `tests/Navbar.test.tsx` and `tests/KPISummaryCards.test.tsx` pass cleanly with zero warnings or errors.

## Assumptions

- **Pre-computed Benchmark Catalog**: Uses `public/data/regions_catalog.json` generated in Feature `002-firms-data-pipeline` containing complete 322-month records and metadata for all 5 benchmark regions.
- **Shared Color Engine**: Uses color ramp definitions and accessible contrast resolvers from `src/engine/colorRamps.ts` (`003-harmonization-engine`).
- **Default Locale**: Application defaults to English (`EN`) to comply with NASA Global Judging requirements, with language preference stored in React state.

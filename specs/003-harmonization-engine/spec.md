# Feature Specification: Client-Side Spatiotemporal Harmonization Engine & Accessible Color Ramps

**Feature Branch**: `feat/T-04-motor-armonizacion`

**Created**: 2026-11-14

**Status**: Implemented

**Input**: User description: "Design and implement the client-side mathematical harmonization engine in TypeScript (src/engine/harmonizer.ts and src/engine/colorRamps.ts) with strict data contracts in src/types/ adhering to docs/02-modis-viirs-harmonization-methodology.md. Implement MODIS/VIIRS cross-calibration with monthly beta_m factors, 0.01-degree AFCD grid binning, multi-year median calculations (2001-2025 baseline), robust Z-score anomalies using median and IQR, fire regime classification (FRP and night ratio), and WCAG 2.1 AA colorblind-accessible palettes (Inferno, Viridis, Cividis, Diverging). Include comprehensive Vitest test suites (tests/harmonizer.test.ts and tests/colorRamps.test.ts)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Real-Time Multi-Decadal Spatiotemporal Harmonization & Custom AOI Recalculation (Priority: P1)

As an Earth scientist or NASA Challenge evaluator, I want the application to perform client-side radiometric quality filtering, $0.01^\circ$ Active Fire Cell-Day (AFCD) spatial aggregation, seasonal $\beta_m$ cross-calibration ($2012\text{--}2025$ overlap), and three-era temporal fusion (`MODIS_SOLO`, `DUAL_SENSOR_FUSION`, `VIIRS_CONTINUITY`) directly in the browser, so that I can dynamically harmonize uploaded NASA FIRMS observations or re-aggregate arbitrary custom Areas of Interest (bounding boxes) instantaneously without backend delays.

**Why this priority**: Core computational engine for Challenge 15 (*Harmonization of MODIS and VIIRS Hot Spots*). Without deterministic, zero-latency cross-sensor calibration in the browser, interactive bounding-box selection (`T-06`) and custom CSV ingestion (`T-10`) cannot recalculate multi-decadal series live.

**Independent Test**: Pass raw mixed MODIS and VIIRS hotspot observations and multi-year monthly AFCD series into the harmonization calculations and verify Stage 1 quality rejection, Stage 2 $0.01^\circ$ grid consolidation, Stage 3 seasonal $\beta_m$ estimation ($R^2 > 0.90$, MAPE reduction $> 65\%$), and exact parity with the pre-computed benchmark catalog.

**Acceptance Scenarios**:

1. **Given** raw active fire detections spanning `type` $\in \{0, 1, 2, 3\}$ and mixed sensor confidence values, **When** Stage 1 quality masking executes, **Then** only vegetation fires (`type == 0`) with MODIS numeric confidence $\ge 30\%$ or VIIRS categorical confidence $\in \{\text{'n'}, \text{'h'}\}$ (case-insensitive) are retained.
2. **Given** filtered MODIS ($1\text{ km}$) and VIIRS ($375\text{ m}$) detections on the same UTC date falling inside a $0.01^\circ \times 0.01^\circ$ cell ($g_x = \lfloor \text{lon} \times 100 \rfloor$, $g_y = \lfloor \text{lat} \times 100 \rfloor$), **When** Stage 2 spatial binning runs, **Then** same-day same-sensor detections in each cell collapse into $1$ Active Fire Cell-Day (`AFCD`) recording cell mean FRP, maximum FRP, and nocturnal combustion presence.
3. **Given** overlapping monthly AFCD observations from $2012$ through $2025$, **When** Stage 3 seasonal calibration derives regularized monthly scaling factors $\beta_1 \dots \beta_{12}$ ($\lambda = 1.0$) and synthesizes $H_{y,m}$ across MODIS Solo ($2000\text{--}2011$), Dual-Sensor Fusion ($2012\text{--}2025$, $w_V = 0.70$, $w_M = 0.30$), and VIIRS Continuity ($2026$), **Then** the calibrated series removes the 2012 sensor step-jump discontinuity and yields goodness-of-fit metrics ($R^2 > 0.90$, Pearson $r$, raw vs. harmonized MAPE, and MAPE reduction percentage).
4. **Given** an arbitrary geographic bounding box drawn or entered by the user alongside pre-indexed spatial cells, **When** custom AOI subsetting and re-harmonization executes, **Then** all records inside the bounding box are aggregated and re-calibrated into a complete multi-decadal timeline within real-time interactive latency.

---

### User Story 2 - Non-Parametric Climatological Anomaly Detection & Fire Regime Classification (Priority: P2)

As an environmental analyst or disaster risk manager, I want the engine to compute a robust 25-year (`2001–2025`) monthly climatological baseline ($\widetilde{M}_m$, $P_{25}$, $P_{75}$, IQR, $P_{90}$), percentage departure anomalies ($\Delta\%_{y,m}$), robust interquartile $Z$-scores ($Z_{y,m}$), and the Fire Regime Intensity Index ($I_{\text{regime}}$), so that I can distinguish routine seasonal agricultural burning from critical drought-driven forest wildfire emergencies.

**Why this priority**: Directly enables Challenge 15 Requirements R5 (multi-year baseline anomaly alerts) and R6 (differentiating agricultural burning from destructive wildfires via radiative power and nocturnal persistence).

**Independent Test**: Provide 27-year monthly harmonized observations (`2000-01` to `2026-10`) containing normal agricultural wet/dry seasons and extreme drought spikes, then verify exact non-parametric quantiles over `2001–2025`, anomaly severity scores, and regime classifications across normal and extreme months.

**Acceptance Scenarios**:

1. **Given** a multi-decadal harmonized series (`2000–2026`), **When** climatological baselines are computed for calendar months $1 \dots 12$, **Then** statistics use strictly complete calendar years $2001\text{--}2025$ to determine the median $\widetilde{M}_m$, $P_{25,m}$, $P_{75,m}$, $\text{IQR}_m = P_{75,m} - P_{25,m}$, and $90\text{th}$-percentile threshold $P_{90,m}$ without partial-year 2026 bias.
2. **Given** monthly observed activity $H_{y,m}$ and its climatological envelope ($\widetilde{M}_m$, $\text{IQR}_m$), **When** anomaly metrics are calculated, **Then** percentage departure $\Delta\%_{y,m}$ and robust $Z$-score $Z_{y,m} = (H_{y,m} - \widetilde{M}_m) / \max(0.7413 \cdot \text{IQR}_m, 1.0)$ assign alert tiers (`NORMAL`, `ELEVATED`, `CRITICAL`) consistently.
3. **Given** monthly 90th-percentile Fire Radiative Power ($P_{90}(\text{FRP})$ in MW) and nighttime detection fraction ($f_{\text{night}} \in [0, 1]$), **When** the Fire Regime Intensity Index $I_{\text{regime}} \in [0, 100]$ is computed, **Then** months are classified into `AGRICULTURAL_BURN` ($0\text{--}35$), `TRANSITIONAL` ($36\text{--}65$), or `SEVERE_WILDFIRE` ($66\text{--}100$).

---

### User Story 3 - WCAG 2.1 AA Colorblind-Accessible Chromatic Mapping & Contrast Safety (Priority: P3)

As a colorblind researcher or accessibility reviewer, I want every numeric intensity and anomaly value in the Burning Activity Calendar and cartographic layers to be mapped through scientifically validated colorblind-safe palettes (**Inferno**, **Viridis**, **Cividis**, and **Diverging Blue–White–Red**) paired with contrast-checked foreground typography, so that every visual cell remains unambiguous and compliant with WCAG 2.1 Level AA standards (`>= 4.5:1` contrast ratio).

**Why this priority**: Directly fulfills Challenge 15 Requirement R4 (scientifically accessible color schemes) and WCAG 2.1 Level AA visual accessibility governance without relying on inaccessible Rainbow/Jet or red-to-green scales.

**Independent Test**: Sample scalar values across the entire normalized range $t \in [0.0, 1.0]$ and extreme anomaly percentages across all 4 color palettes, verifying valid hex/RGB interpolation, smooth monotonic transitions between official anchor stops, and foreground text contrast ratio $\ge 4.5:1$ on every sampled cell color.

**Acceptance Scenarios**:

1. **Given** any normalized scalar intensity $t \in [0, 1]$ and any of the 4 certified palettes (`inferno`, `viridis`, `cividis`, `diverging`), **When** color interpolation is invoked, **Then** it performs piecewise-linear RGB interpolation across the exact 5-stop hex anchors specified in `docs/design-system.md` and outputs valid 6-digit hex and RGB values.
2. **Given** a percentage departure anomaly value ($\Delta\% \in (-\infty, +\infty)$), **When** mapped onto the `diverging` scale centered at `0%` (`#f7f7f7`), **Then** negative anomalies (`-100%` to `0%`) interpolate across blue tones (`#2166ac` $\rightarrow$ `#67a9cf` $\rightarrow$ `#f7f7f7`) and positive anomalies (`0%` to `>= +100%`) interpolate across red-coral tones (`#f7f7f7` $\rightarrow$ `#ef8a62` $\rightarrow$ `#b2182b`).
3. **Given** any interpolated background hex color produced by any of the 4 color scales, **When** accessible foreground text selection runs, **Then** relative WCAG luminance selects dark (`#0B0F17`) or light (`#F8FAFC`) foreground text guaranteeing a contrast ratio of at least `4.5:1`.

---

### Edge Cases

- **Zero-Fire Wet Season Months & Empty Spatial Bounding Boxes:** What happens if a calendar month has $0$ MODIS and $0$ VIIRS detections across all overlap years, or if $\widetilde{M}_m = 0$ or $\text{IQR}_m = 0$, or a custom bounding box encloses zero active cells?  
  *Mitigation:* Laplace smoothing ($\lambda = 1.0$) with overlap-window means safeguards $\beta_m$; denominator floor guards (`max(median, 1.0)` for $\Delta\%$, `max(0.7413 * IQR, 1.0)` for $Z_{\text{robust}}$, and minimum positive checks on validation variance) prevent `NaN`, `null`, or `Infinity`; empty bounding boxes return a deterministic zero-filled valid monthly record structure with finite metrics.
- **Degenerate & Out-of-Range Color Normalization Inputs:** What happens when scalar input $v$ falls outside `[min, max]`, `min >= max`, or `v` is `NaN`/`Infinity`?  
  *Mitigation:* Inputs are validated and clamped strictly to $[0.0, 1.0]$; non-finite values default deterministically to baseline `0.0` (or neutral center `0.5` on diverging scales), ensuring valid hex output with zero runtime exceptions.
- **Partial-Year 2026 Exclusion from Climatological Envelope:** How are incomplete months in `2026` (`2026-01` to `2026-10`) handled when building monthly historical medians?  
  *Mitigation:* Climatological quantiles ($\widetilde{M}_m$, $P_{25,m}$, $P_{75,m}$, $P_{90,m}$) are filtered strictly over $2001 \le y \le 2025$ while anomaly metrics ($\Delta\%_{y,m}$, $Z_{y,m}$) evaluate across all years $2000\text{--}2026$.
- **Inverted Bounding Box Coordinates:** What happens if user coordinate inputs provide `min_lat > max_lat` or `min_lon > max_lon`?  
  *Mitigation:* Coordinate bounds normalization orders `[min, max]` pairs before spatial cell filtering so inverted user inputs still query the intended area reliably.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement Stage 1 radiometric quality filtering retaining strictly presumed vegetation fire detections (`type == 0`) with MODIS numeric confidence $\ge 30$ or VIIRS categorical confidence $\in \{\text{'n'}, \text{'h'}\}$ (case-insensitive).
- **FR-002**: System MUST implement Stage 2 geometric spatial binning mapping coordinates onto a $0.01^\circ \times 0.01^\circ$ grid ($g_x = \lfloor \text{lon} \times 100 \rfloor$, $g_y = \lfloor \text{lat} \times 100 \rfloor$) and collapsing same-day same-sensor detections per cell into 1 Active Fire Cell-Day (AFCD) with aggregated mean FRP, maximum FRP, and nighttime fire indicator (`daynight == 'N'`).
- **FR-003**: System MUST implement Stage 3 seasonal cross-calibration over the `2012–2025` overlap window computing Laplace-smoothed monthly scaling factors ($\beta_1 \dots \beta_{12}$, $\lambda = 1.0$), synthesizing harmonized counts ($H_{y,m}$) across `MODIS_SOLO` (`2000–2011`), `DUAL_SENSOR_FUSION` (`2012–2025` with weights $w_V = 0.70$, $w_M = 0.30$), and `VIIRS_CONTINUITY` (`2026`), and calculating overlap validation metrics ($R^2$, Pearson $r$, raw MAPE %, harmonized MAPE %, and MAPE reduction %).
- **FR-004**: System MUST implement Stage 4 non-parametric climatology over complete baseline years `2001–2025` deriving per-month median ($\widetilde{M}_m$), quartiles ($P_{25,m}$, $P_{75,m}$, $\text{IQR}_m$), $90\text{th}$-percentile critical threshold ($P_{90,m}$), percentage departure ($\Delta\%_{y,m}$), robust interquartile $Z$-score ($Z_{y,m}$), and anomaly alert severity tier (`NORMAL`, `ELEVATED`, `CRITICAL`).
- **FR-005**: System MUST calculate the Fire Regime Intensity Index ($I_{\text{regime}} \in [0, 100]$) combining normalized $P_{90}(\text{FRP})$ against $80\text{ MW}$ ($60\%$ weight) and nighttime fraction $f_{\text{night}}$ against $0.35$ ($40\%$ weight), classifying observations into `AGRICULTURAL_BURN` ($0\text{--}35$), `TRANSITIONAL` ($36\text{--}65$), or `SEVERE_WILDFIRE` ($66\text{--}100$).
- **FR-006**: System MUST support spatial subsetting and full re-harmonization for arbitrary rectangular bounding boxes (`BoundingBox`) over pre-indexed $0.01^\circ$ spatial grid cells, producing synchronized monthly and annual series without requiring server requests.
- **FR-007**: System MUST provide continuous piecewise-linear RGB/Hex interpolation across all 4 colorblind-safe palettes (**Inferno**, **Viridis**, **Cividis**, **Diverging Blue–White–Red**) matching the exact 5-stop hex color anchors defined in `docs/design-system.md`, plus domain normalization helpers for both linear ($[0, 1]$) and symmetric anomaly ($\Delta\%$) scales.
- **FR-008**: System MUST compute WCAG 2.1 relative luminance and contrast ratios between any interpolated fill color and candidate text colors, automatically selecting accessible foreground typography achieving a contrast ratio $\ge 4.5:1$.
- **FR-009**: All core computation routines MUST be pure, deterministic, free of DOM or browser-storage side effects, and guarded against division-by-zero, `NaN`, or non-finite inputs.

### Key Entities

- **HarmonizationResult**: Complete re-calibrated multi-decadal output structure for a regional cube, custom bounding box, or uploaded CSV dataset, containing calibrated `seasonal_beta`, `validation_metrics`, `climatology_by_month`, and chronological `monthly_records`.
- **SeasonalCalibrationModel**: Twelve monthly scaling factors ($\beta_1 \dots \beta_{12}$) paired with overlap fit metrics ($R^2$, Pearson $r$, raw MAPE %, harmonized MAPE %, MAPE reduction %).
- **ClimatologyEnvelope**: Non-parametric monthly reference distribution (`median`, `p25`, `p75`, `iqr`, `p90`) computed strictly across baseline years `2001–2025`.
- **FireRegimeDiagnostic**: Monthly physical energy and diurnal assessment holding `mean_frp_mw`, `p90_frp_mw`, `night_fraction`, `fire_regime_index` ($0\text{--}100$), and categorical regime label.
- **AccessibleColorScale**: Certified colorblind-safe ramp specification with WCAG metadata, 5 anchor color stops, legend gradient helpers, and contrast-compliant text resolver.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Interactive computation performance: Re-harmonizing a complete 322-month dataset or aggregating a custom spatial bounding box completes in `< 30 ms` on standard desktop and mobile client hardware.
- **SC-002**: Cross-calibration fidelity: Re-running the seasonal calibration calculations over the overlap window for all 5 pre-computed benchmark regions matches published catalog harmonized series with zero rounding drift and reproduces $R^2 > 0.90$ and MAPE reduction `> 65%`.
- **SC-003**: Mathematical resilience: 100% of edge-case executions involving empty spatial boxes, all-zero wet-season months, inverted bounding boxes, or non-finite inputs return valid, finite numerical structures with zero `NaN` or `Infinity` values.
- **SC-004**: Visual accessibility compliance: 100% of sampled colors ($t \in [0.0, 1.0]$) across all 4 palettes (`inferno`, `viridis`, `cividis`, `diverging`) yield contrast ratios $\ge 4.5:1$ when paired with the selected foreground text color under WCAG 2.1 Level AA luminance calculations.
- **SC-005**: Automated verification coverage: Comprehensive test suites validate every mathematical stage, safeguard, palette stop, normalization rule, and contrast threshold with a 100% pass rate.

## Assumptions

- **Shared Mathematical Specification**: All equations, baseline windows (`2001–2025`), overlap calibration periods (`2012–2025`), weights ($w_V = 0.70$, $w_M = 0.30$), and Laplace smoothing factor ($\lambda = 1.0$) match Stage 1–4 of `docs/02-modis-viirs-harmonization-methodology.md` and `scripts/build_harmonized_cubes.py`.
- **Canonical Palette Anchors**: Exact 5-stop hex color definitions for `inferno`, `viridis`, `cividis`, and `diverging` follow Section 2.3 of `docs/design-system.md`.
- **Data Contract Compatibility**: Input and output structures extend and align with existing contracts in `src/types/` (`firms.ts`, `harmonization.ts`, `region.ts`, `palette.ts`) generated by Feature `002-firms-data-pipeline`.

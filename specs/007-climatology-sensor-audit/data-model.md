# Data Model: Climatological Anomaly Curves & Sensor Harmonization Audit Panels

**Feature**: `specs/007-climatology-sensor-audit/`  
**Date**: 2026-11-15  
**Domain**: NASA FIRMS Climatological Curves, Sensor Cross-Calibration & Validation Metrics

---

## 1. Domain Entities & Interfaces

### A. `ClimatologyCurvePoint`
Represents an individual calendar month ($1\text{--}12$) combining the historical non-parametric baseline (2001–2025) and the active year's observation trajectory.

```typescript
export interface ClimatologyCurvePoint {
  month: number;                   // 1 - 12
  monthName: string;               // Short month label ("Jan" / "Ene")
  baselineMedian: number;          // M_m (2001-2025 baseline median)
  baselineP25: number;             // P_25 lower quartile
  baselineP75: number;             // P_75 upper quartile
  baselineP90: number;             // P_90 critical disaster threshold
  iqrRange: [number, number];      // [baselineP25, baselineP75] for Recharts Area shading
  activeYearValue: number | null;  // Observed AFCD in active year (null for future months)
  departurePercentage: number | null; // Delta% vs baseline median
  robustZScore: number | null;     // Z-score calculated via IQR
  isCritical: boolean;             // True if activeYearValue >= baselineP90 or Z >= 2.0
  isFuture: boolean;               // True for pending future months (e.g. Nov-Dec 2026)
}
```

---

### B. `SensorAuditSeriesPoint`
Represents a monthly timestamp in the multi-decadal time series ($2000\text{--}2026$, 322 total points) across all 4 sensor harmonization stages.

```typescript
export interface SensorAuditSeriesPoint {
  date: string;                    // "YYYY-MM"
  year: number;                    // 2000 - 2026
  month: number;                   // 1 - 12
  rawModisCount: number;           // Uncalibrated MODIS C6.1 (1 km)
  rawViirsCount: number | null;    // Uncalibrated VIIRS C2 (375 m, null before 2012)
  afcdCoregistered: number;        // 0.01° Active Fire Cell-Days
  harmonizedHotspots: number;      // Final bias-corrected series H_{y,m}
  sensorEra: 'MODIS_SOLO' | 'DUAL_SENSOR_FUSION' | 'VIIRS_CONTINUITY';
  isOverlapPeriod: boolean;        // True for 2012-2025 calibration baseline
  isStepJumpAnchor: boolean;       // True for 2012-01 (point of resolution transition)
}
```

---

### C. `AuditLayerVisibility`
State model controlling interactive toggles for the 4 time series layers in `SensorHarmonizationAudit`.

```typescript
export interface AuditLayerVisibility {
  showRawModis: boolean;           // Default: true
  showRawViirs: boolean;           // Default: true
  showAfcd: boolean;               // Default: false
  showHarmonized: boolean;         // Default: true
}
```

---

### D. `BetaFactorEntry`
Represents the empirical seasonal calibration scaling factor ($\beta_m$) for a calendar month.

```typescript
export interface BetaFactorEntry {
  month: number;                   // 1 - 12
  monthName: string;               // "Jan", "Feb", ...
  betaFactor: number;              // beta_m = median(AFCD_VIIRS / AFCD_MODIS)
  formattedBeta: string;           // e.g. "1.42x"
  sampleCount: number;             // Years of overlap (14 years, 2012-2025)
}
```

---

### E. `ClimatologyChartState`
Component-level state model for `ClimatologyAnomalyChart`.

```typescript
export interface ClimatologyChartState {
  activeYear: number;              // Current selected year (2000 - 2026)
  hoveredMonth: number | null;     // Month index under mouse/focus
  tooltipVisible: boolean;
}
```

---

## 2. Invariants & Validation Rules

1. **Non-Negativity:** Hotspot counts, medians, percentiles, and $\beta$ factors must satisfy $X \ge 0$.
2. **Quartile Monotonicity:** For every month $m \in [1, 12]$:
   $$0 \le P_{25} \le M_m \le P_{75} \le P_{90}$$
3. **Future Safeguard Invariant:** If `isFuture` is true (e.g. Nov–Dec 2026), `activeYearValue` MUST be `null` to ensure Recharts does not connect lines to zero.
4. **Division-by-Zero Protection:** When calculating $\Delta\%$ departure where $M_m = 0$:
   - If $H_{y,m} > 0 \rightarrow \Delta\% = +100.0\%$
   - If $H_{y,m} = 0 \rightarrow \Delta\% = 0.0\%$

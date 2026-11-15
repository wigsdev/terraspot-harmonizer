# Data Model & Contract Extensions: Harmonization & Accessibility Engine

**Feature**: `003-harmonization-engine`  
**Date**: 2026-11-14  

---

## 1. Domain Extensions in `src/types/harmonization.ts`

Extends existing Stage 1–4 types without breaking existing consumers (`tests/dataPipeline.test.ts`, `tests/smoke.test.ts`):

| Symbol | Definition / Fields | Purpose & Constraints |
| :--- | :--- | :--- |
| `AnomalyAlertStatus` | `'NORMAL' \| 'ELEVATED' \| 'CRITICAL'` | Operational alert tier (`\|Z\| < 1.0` $\rightarrow$ `NORMAL`, `1.0 <= Z < 2.0` $\rightarrow$ `ELEVATED`, `Z >= 2.0` or `H >= p90_threshold` (with `H > 0`) $\rightarrow$ `CRITICAL`); exposed as optional `HarmonizedMonthlyRecord.anomaly_status?: AnomalyAlertStatus` for backward compatibility with pre-computed JSON cubes. |
| `FireRegimeClass` | `'AGRICULTURAL_BURN' \| 'TRANSITIONAL' \| 'SEVERE_WILDFIRE'` | Shared regime union type (`I_regime <= 35`, `35 < I_regime <= 65`, `> 65`), referenced directly by `HarmonizedMonthlyRecord.regime_class: FireRegimeClass`. |
| `QualityFilterStats` | `{ total_input: number; valid_vegetation: number; rejected_type: number; rejected_confidence: number; total_rejected: number }` | Tracks Stage 1 radiometric cleaning audit metrics (`total_input === valid_vegetation + total_rejected`). |
| `MonthlySensorObservation` | `{ year: number; month: number; raw_modis_count: number; raw_viirs_count: number; afcd_modis: number; afcd_viirs: number; mean_frp_mw: number; p90_frp_mw: number; night_fraction: number }` | Clean Stage 1–2 monthly aggregation unit ready for Stage 3 $\beta_m$ calibration. |
| `HarmonizationResult` | `{ seasonal_beta: Record<string, number>; validation_metrics: ValidationMetrics; climatology_by_month: Record<string, MonthlyClimatology>; monthly_records: HarmonizedMonthlyRecord[] }` | Complete output bundle returned by `harmonizeTimeSeries`, `reharmonizeSpatialSubset`, and `harmonizeRawDetections`. |

---

## 2. Accessibility & Color Scale Extensions in `src/types/palette.ts`

| Symbol | Definition / Fields | Purpose & Constraints |
| :--- | :--- | :--- |
| `AccessibleTextColor` | `'#0B0F17' \| '#F8FAFC' \| '#000000' \| '#FFFFFF'` | Contrast-safe foreground text palette guaranteeing $CR \ge 4.5:1$ across all background luminances. |
| `RgbColor` | `{ r: number; g: number; b: number }` | Integer channel triplet where `r, g, b in [0, 255]`. |
| `ColorCellStyle` | `{ backgroundHex: string; textHex: AccessibleTextColor; contrastRatio: number; normalizedT: number }` | Complete accessible cell styling metadata returned for calendar cells and legend swatches (`contrastRatio >= 4.5`). |

---

## 3. Canonical Colorblind-Safe Palette Anchors (`docs/design-system.md`)

All 4 palettes in `ACCESSIBLE_PALETTES` (`Record<PaletteType, AccessiblePalette>`) define `wcag_certified: true` and `colorblind_safe: ['deuteranopia', 'protanopia', 'tritanopia']`:

1. **`inferno`** (*Inferno — Thermal Uniform*):
   - `0.00`: `#000004`
   - `0.25`: `#420a68`
   - `0.50`: `#932667`
   - `0.75`: `#dd513a`
   - `1.00`: `#fcffa4`
2. **`viridis`** (*Viridis — Scientific Multi-Hue*):
   - `0.00`: `#440154`
   - `0.25`: `#3b528b`
   - `0.50`: `#21918c`
   - `0.75`: `#5ec962`
   - `1.00`: `#fde725`
3. **`cividis`** (*Cividis — Optimized Dichromacy*):
   - `0.00`: `#00204d`
   - `0.25`: `#414d6b`
   - `0.50`: `#7c7b78`
   - `0.75`: `#bba868`
   - `1.00`: `#ffea46`
4. **`diverging`** (*Diverging Anomaly — Blue to Red*):
   - `0.00` ($-100\%$): `#2166ac`
   - `0.25` ($-50\%$): `#67a9cf`
   - `0.50` ($0\%$ Median): `#f7f7f7`
   - `0.75` ($+50\%$): `#ef8a62`
   - `1.00` ($\ge +100\%$): `#b2182b`

# Research & Architecture Decisions: Standardized CSV Exporter & Custom FIRMS Ingestion

**Feature**: Standardized CSV Exporter and Custom NASA FIRMS CSV Ingestion (`T-10`)  
**Directory**: `specs/009-csv-export-upload`  
**Date**: 2026-11-15  
**Author**: Antigravity Assistant & `@wigsdev`  

---

## 1. RFC 4180 CSV Generation & Client-Side Download Trigger

### Context
NASA Space Apps Challenge 15 Requirement R7 mandates a standardized CSV export of the harmonized time series, including raw counts, active fire cell-days (AFCD), monthly beta calibration ratios, harmonized counts, climatological medians, percentage departures, robust $Z$-scores, Fire Radiative Power (FRP) metrics, and fire regime diagnoses across 27 canonical columns.

### Decision
Implement pure TypeScript RFC 4180 serialization in `src/engine/csvExporter.ts` with zero external dependencies for export generation:
- Escape any text containing commas, quotes, or newlines by wrapping in double quotes and doubling internal quotes (`""`).
- Format all numeric values with consistent precision:
  - Latitude / Longitude: 2 to 4 decimal places (`-10.60`, `-77.10`).
  - Beta factor ($\beta_m$): 2 decimal places (`1.81`).
  - Percentage anomaly: explicit sign and 2 decimal places (`+77.17%` or `+77.17`).
  - Robust $Z$-score: 2 decimal places (`+3.09`).
  - FRP (MW): 1 decimal place (`48.6`).
  - Night fraction: 2 decimal places (`0.24`).
- Generate download via `URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }))` attached to an ephemeral anchor element (`<a download="...">`) and trigger programmatic `.click()`. Revoke the object URL immediately afterwards to prevent browser memory leaks.

### Alternatives Considered
- *Using PapaParse `unparse()`:* While PapaParse can unparse arrays to CSV, a dedicated pure TypeScript generator provides strict compile-time type safety over the exact 27 column order and custom number formatting (such as explicit `+` signs on anomalies and STAC bounding box naming) without overhead.

---

## 2. In-Memory NASA FIRMS Parsing & Validation via PapaParse

### Context
Users and judges can upload raw FIRMS CSV exports from MODIS Collection 6.1 (`MCD14ML`/`MCD14DL`) or VIIRS 375m Collection 2 (`VNP14IMGTDL`/`VJ114IMGTDL`), or load the pre-bundled `public/data/sample_firms_huanuco.csv`. Processing must execute 100% in-browser with zero server roundtrips, honoring strict privacy and offline resilience.

### Decision
Use `PapaParse` with `header: true`, `dynamicTyping: true`, and `skipEmptyLines: true`:
1. **Header Normalization:** Normalize lowercased, trimmed column names. Check for mandatory fields: `latitude`, `longitude`, `acq_date`. Identify optional attributes: `brightness`/`bright_ti4`, `bright_t31`/`bright_ti5`, `scan`, `track`, `acq_time`, `satellite`, `instrument`, `confidence`, `frp`, `daynight`, `type`.
2. **Quality Masking (Stage 1 Harmonization):**
   - Retain only vegetation and landscape combustion records (`type == 0` or missing). Exclude industrial flares (`type == 2`), volcanoes (`type == 1`), and offshore detections (`type == 3`).
   - Validate detection confidence: MODIS numeric $\ge 30\%$ or VIIRS categorical `'n'` (nominal) or `'h'` (high).
3. **Diagnostic Reporting:** Return a structured `FIRMSValidationReport` containing total rows, valid vegetation hotspots, discarded rows, detected sensor platforms, temporal date span, geographic bounding box, and any syntax errors.

### Alternatives Considered
- *Web Worker vs. Main Thread Parsing:* For typical regional FIRMS extracts ($1,000$ to $20,000$ rows, $\sim 1\text{ MB} - 3\text{ MB}$), `PapaParse` in-memory synchronous/asynchronous parsing takes $< 150\text{ ms}$, well within the $1.5\text{ s}$ performance budget. Running directly on the client with React state is instant and simplifies bundle configuration without separate worker build targets.

---

## 3. Dynamic Spatiotemporal Aggregation & Re-Harmonization

### Context
When a custom CSV is uploaded, the application must transform individual point detections into daily $0.01^\circ \times 0.01^\circ$ active fire cell-days (AFCD), aggregate monthly counts, apply seasonal harmonization ratios, compute climatology medians, and generate a valid `RegionCube` that can replace the active region in `RegionContext`.

### Decision
Implement `synthesizeHarmonizedCubeFromFIRMS(detections, aoiMetadata)` in `src/engine/firmsIngestion.ts`:
1. Group points by date (`YYYY-MM-DD`) and rounded spatial grid coordinate $(\text{round}(\text{lat}, 2), \text{round}(\text{lon}, 2))$.
2. Distinct active grid cells per day define the daily $0.01^\circ$ AFCD count.
3. Group into months $(y, m)$:
   - Sum raw MODIS and VIIRS detections.
   - Sum AFCD cell-days for each sensor.
   - For months with both sensors ($2012\text{--}2026$), compute empirical ratio $\beta_m = \frac{\text{AFCD}_{\text{VIIRS}}}{\text{AFCD}_{\text{MODIS}}}$ or apply the regional seasonal baseline.
   - Harmonized count: $H_{y,m} = \text{AFCD}_{\text{VIIRS}} / \beta_m$ (or calibrated to the unified MODIS-equivalent baseline).
4. Compute multi-year monthly medians $\widetilde{M}_m$, interquartile ranges, percentage anomalies $\Delta\% = \frac{H_{y,m} - \widetilde{M}_m}{\widetilde{M}_m} \times 100$, and robust $Z$-scores $Z = \frac{H_{y,m} - \widetilde{M}_m}{\text{NIQR}_m}$.
5. Construct a drop-in `RegionCube` and pass it to `setCurrentCustomCube(cube)` in `RegionContext`.

---

## 4. Modal UX, Accessibility (WCAG 2.1 AA) & Bilingual Support

### Context
The ingestion modal must be accessible to reviewers, researchers, and keyboard/screen-reader users, supporting instant bilingual English/Spanish switching.

### Decision
Build `src/components/CustomCSVModal.tsx`:
- Rendered in a React portal or fixed high-z-index overlay with aerospace dark palette (`#0B0F17` background, `border-slate-800`, `text-slate-100`).
- Traps keyboard focus, closes on `Escape` key and backdrop click, with proper ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`).
- Interactive dropzone with active drag state styling (`border-dashed border-amber-500/60 bg-amber-500/10`).
- Prominent "Load Sample Dataset (Huánuco)" button fetching `/data/sample_firms_huanuco.csv`.
- Real-time diagnostic summary cards (Valid Hotspots, Rejected Rows, Date Range, Detected Satellites).
- Complete translation strings added to `src/types/language.ts` and `src/context/LanguageContext.tsx`.

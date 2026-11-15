# Feature Specification: Standardized CSV Exporter and Custom NASA FIRMS CSV Ingestion

**Feature Branch**: `feat/T-10-csv-export-upload`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "Implement the Standardized CSV Exporter (src/engine/csvExporter.ts) and Custom NASA FIRMS CSV Ingestion modal (src/components/CustomCSVModal.tsx) fulfilling NASA Space Apps Challenge 15 Requirement R7 and adhering to docs/04-firms-data-specification.md and docs/backlog.md (Task T-10). The exporter must generate a 27-column RFC 4180 compliant CSV containing all multi-decadal monthly records (raw MODIS, raw VIIRS, AFCD, beta factors, harmonized counts, climatological medians, percentage departures, robust Z-scores, FRP stats, and fire regime classifications) aligned with Microsoft Planetary Computer STAC spatial schemas and Meteomatics fire weather validation. The ingestion modal must provide an accessible client-side drag-and-drop interface for user-uploaded FIRMS CSV files with in-memory validation, error handling for corrupted rows, and instant re-harmonization across the dashboard with full bilingual EN/ES support and Vitest unit tests."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One-Click Download of Standardized 27-Column Harmonized Analytical CSV Dataset (Priority: P1)

As a wildfire researcher, civil defense analyst, or NASA Space Apps challenge judge, I want to download the complete 27-year (2000–2026) harmonized monthly dataset for the active Area of Interest in an RFC 4180 compliant CSV format so that I can immediately import the cross-calibrated time series into Python (`pandas`), R, QGIS, or spreadsheet tools with full scientific traceability.

**Why this priority**: Directly satisfies NASA Challenge 15 Requirement R7 and Article III/VI of the project constitution. Without data export, scientific reviewers cannot independently audit our geometric active fire cell-days (AFCD), monthly beta calibration factors, climatological medians, and fire regime diagnostics outside the web interface.

**Independent Test**: Can be fully tested independently by invoking the export generator on any calibrated benchmark cube (e.g. Huánuco `PE-HCO`) and verifying that an RFC 4180 compliant 27-column CSV string and downloadable file are produced containing exactly 324 monthly records (27 years × 12 months) with complete analytical metrics.

**Acceptance Scenarios**:

1. **Given** an active regional data cube (e.g., Huánuco `PE-HCO`) loaded in the application, **When** the user clicks the "Download Harmonized CSV" button in the navigation header or modal, **Then** an RFC 4180 formatted CSV file named `terraspot_harmonized_<AOI_ID>_<TIMESTAMP>.csv` is instantly generated and downloaded by the browser.
2. **Given** the downloaded CSV file, **When** inspected in standard tabular software or analytical scripts, **Then** the header row contains exactly the 27 canonical column names defined in `docs/04-firms-data-specification.md`, and all numeric values (coordinates, counts, percentages, Z-scores, FRP) are properly formatted with decimal points and signs without column shifting or delimiter corruption.
3. **Given** months where an anomaly is positive (e.g. $+77.17\%$), **When** rendered in the CSV record, **Then** the value includes the explicit positive sign or valid numerical notation for unambiguous interpretation.

---

### User Story 2 - Client-Side Drag-and-Drop Ingestion & In-Memory Validation of NASA FIRMS CSV Files (Priority: P2)

As a GIS specialist or firefighter command officer, I want to upload custom NASA FIRMS CSV exports (MODIS C6.1 or VIIRS 375m C2) directly in the web browser via an accessible drag-and-drop modal, so that I can validate, process, and analyze my own local fire event data without requiring server-side processing or compromising proprietary data privacy.

**Why this priority**: Fulfills the interactive custom analysis requirement of NASA Challenge 15 (Requirement R7). Enables end-users to bring their own fresh or historical satellite observations beyond the pre-compiled benchmark regions.

**Independent Test**: Can be independently tested by mounting the ingestion modal, uploading or simulating the upload of valid, partial, or malformed CSV text, and verifying that client-side parsing validates column structures, catches missing mandatory fields, and produces clear, user-friendly diagnostic logs.

**Acceptance Scenarios**:

1. **Given** the user opens the "Upload Custom FIRMS CSV" modal from the navigation header, **When** the user drags and drops a valid FIRMS CSV file (or selects it via file picker), **Then** the file is parsed in-browser memory using client-side streaming, displaying file size, total row count, detected satellite instruments, and temporal date range.
2. **Given** a corrupted CSV file missing mandatory coordinates (`latitude`, `longitude`) or observation date (`acq_date`), **When** the user uploads the file, **Then** the system displays an accessible error banner with specific feedback detailing the missing headers or corrupt rows without crashing the application.
3. **Given** a file with a mix of valid vegetation fires (`type == 0`) and industrial/static gas flares (`type != 0`), **When** processed by the ingestion engine, **Then** the system automatically filters out non-vegetation fires, reporting the count of accepted vs. excluded detections.

---

### User Story 3 - Instant Dynamic Dashboard Re-Harmonization & Sample Dataset Benchmark Testing (Priority: P3)

As an evaluator assessing the system during a demo or pitch, I want to click a "Load Sample Dataset" button in the modal to load the bundled `sample_firms_huanuco.csv` (or my uploaded custom file) and immediately observe all dashboard components update dynamically, with an easy option to restore default benchmark data.

**Why this priority**: Delivers maximum usability and resilience during live hackathon judging and presentations. Judges can test custom data ingestion with one click without needing to download external multi-megabyte files from NASA Earthdata during evaluation.

**Independent Test**: Can be tested by clicking "Load Sample Dataset" in the modal, confirming the active data cube updates to the custom ingestion state, and verifying that the Burning Activity Calendar, KPIs, Climatology Chart, and Fire Regime Scatter reflect the newly processed time series, followed by clicking "Reset to Benchmark" to restore default state.

**Acceptance Scenarios**:

1. **Given** the ingestion modal is open, **When** the user clicks "Load Sample Dataset (Huánuco 2024-2025)", **Then** the system asynchronously parses `public/data/sample_firms_huanuco.csv`, runs geometric active fire cell aggregation and seasonal calibration, and displays a success confirmation with summary metrics.
2. **Given** custom data ingestion succeeds, **When** the user closes the modal or clicks "Apply to Dashboard", **Then** the entire application (KPI summary cards, calendar matrix, climatology curves, and regime scatter plot) updates instantaneously to reflect the ingested data with a clear visual badge indicating "Custom Data Active".
3. **Given** a custom dataset is active in the dashboard, **When** the user clicks "Reset to Default Benchmark", **Then** the application clears the temporary in-memory custom cube, restores the original pre-calibrated regional cube, and refits the cartographic viewport in MapAOISelector.

---

### User Story 4 - Geospatial STAC & Climatological Fire Weather Reference Verification (Priority: P4)

As an environmental data architect, I want the exported CSV and metadata to align with Microsoft Planetary Computer STAC conventions and reference live fire weather indicators (from Meteomatics API), so that cross-system geospatial fusion and climate correlation are seamlessly facilitated.

**Why this priority**: Directly reinforces the hackathon's Global Offers strategy (Meteomatics Weather API and Microsoft Planetary Computer STAC integration) across evaluation criteria.

**Independent Test**: Can be tested by checking that the exported CSV metadata and UI telemetry badges contain valid bounding box coordinates (`bbox_min_lat`, `bbox_max_lat`, `bbox_min_lon`, `bbox_max_lon`), sensor era identifiers, and references to in-situ fire weather indicators.

**Acceptance Scenarios**:

1. **Given** any exported CSV file, **When** parsed by a spatial data tool, **Then** the bounding box fields correspond to standard GeoJSON/STAC bounding box coordinates `[min_lon, min_lat, max_lon, max_lat]`.
2. **Given** the modal or telemetry views, **When** viewing the active AOI summary, **Then** relevant environmental context (such as fire weather risk or soil moisture index if available in `public/data/meteomatics_weather.json`) is presented as complementary reference data.

---

### Edge Cases

- **Empty or Zero-Byte CSV File**: System displays an immediate error stating that the file contains no data rows, disabling the "Apply" button.
- **Corrupted Headers / Delimiters**: If a CSV uses semicolons (`;`) or tabs (`\t`) instead of commas, or lacks `latitude`/`longitude`, the parser detects the format mismatch, attempts auto-detection via PapaParse, and if invalid, outputs a clear guidance message.
- **Single-Sensor Only Records**: When an uploaded CSV contains only MODIS records (e.g. historical 2000–2011) or only VIIRS records (2012–2026), the harmonization engine applies appropriate fallback scaling ($\beta_m = 1.0$ or empirical regional median) without division-by-zero or NaN errors.
- **Out-of-Bounds Coordinates**: Detections with latitude $> 90^\circ$ or $<-90^\circ$ or longitude $> 180^\circ$ or $<-180^\circ$ are flagged and discarded during row sanitization.
- **Extreme High-Volume Uploads**: Files exceeding 50,000 rows are parsed asynchronously with progress indication to prevent UI thread lockup.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an export module (`src/engine/csvExporter.ts`) that converts any active `RegionCube` or custom-ingested dataset into an RFC 4180 compliant CSV string.
- **FR-002**: The generated CSV MUST include exactly the 27 canonical columns specified in `docs/04-firms-data-specification.md`:
  1. `aoi_id`
  2. `aoi_name`
  3. `bbox_min_lat`
  4. `bbox_max_lat`
  5. `bbox_min_lon`
  6. `bbox_max_lon`
  7. `year`
  8. `month`
  9. `month_name`
  10. `sensor_era`
  11. `raw_modis_hotspots`
  12. `raw_viirs_hotspots`
  13. `modis_grid_cell_days`
  14. `viirs_grid_cell_days`
  15. `seasonal_beta_factor`
  16. `harmonized_hotspots`
  17. `historical_median_2001_2025`
  18. `iqr_25_75`
  19. `p90_critical_threshold`
  20. `anomaly_percent`
  21. `robust_z_score`
  22. `anomaly_status`
  23. `mean_frp_mw`
  24. `p90_frp_mw`
  25. `night_detection_fraction`
  26. `fire_regime_index`
  27. `fire_regime_classification`
- **FR-003**: System MUST trigger an in-browser automatic file download using a generated `Blob` with MIME type `text/csv;charset=utf-8;` and sanitized filename `terraspot_harmonized_<aoi_id>_<timestamp>.csv`.
- **FR-004**: System MUST provide a dedicated modal component (`src/components/CustomCSVModal.tsx`) accessible via a prominent button in the main `Navbar.tsx` and quick-action toolbars.
- **FR-005**: The modal MUST provide an interactive drag-and-drop dropzone supporting direct file drop and native OS file selector browsing for `.csv` and `.txt` files.
- **FR-006**: System MUST parse uploaded files completely client-side in browser memory using `PapaParse` with zero transmission of raw data to any external server.
- **FR-007**: System MUST validate essential NASA FIRMS attributes (`latitude`, `longitude`, `acq_date`) and extract sensor attributes (`confidence`, `frp`, `daynight`, `type`, `instrument`, `satellite`).
- **FR-008**: System MUST provide an actionable validation report inside the modal showing:
  - Validation status (`Valid`, `Warnings`, `Invalid`)
  - Total rows parsed
  - Filtered vegetation hotspots (`type == 0` and nominal/high confidence)
  - Detected satellite instruments (MODIS Terra/Aqua, VIIRS S-NPP/NOAA-20/NOAA-21)
  - Spatiotemporal coverage (Date range and bounding box coordinates)
- **FR-009**: The modal MUST include a "Load Sample Dataset" button that fetches and parses `public/data/sample_firms_huanuco.csv` for zero-friction evaluation.
- **FR-010**: System MUST dynamically aggregate raw ingested detections into daily $0.01^\circ$ active fire cell-days (AFCD), compute monthly counts, apply seasonal harmonization calibration, and synthesize a temporary in-memory `RegionCube`.
- **FR-011**: System MUST support injecting the custom-synthesized `RegionCube` into the application's `RegionContext`, updating the KPI cards, calendar matrix, climatology chart, sensor audit, and fire regime scatter plot synchronously.
- **FR-012**: System MUST display a persistent "Custom Data Active" badge on the navigation bar when custom data is loaded, alongside a single-click "Reset" button to revert to standard benchmark cubes.
- **FR-013**: System MUST provide 100% complete bilingual support (English and Spanish) across all modal labels, buttons, dropzone text, error messages, and validation stats.
- **FR-014**: The modal MUST meet WCAG 2.1 AA accessibility guidelines, including `aria-modal="true"`, `role="dialog"`, keyboard `Escape` closing, focus trapping, and high-contrast color scheme (`#0B0F17` background with visible focus rings).

---

### Key Entities

- **StandardizedHarmonizedRow**: Represents a single month in the 27-column analytical CSV output, encapsulating spatio-temporal identifiers, raw counts, AFCD cells, seasonal calibration ratio ($\beta_m$), harmonized count, non-parametric baseline median, robust anomaly metrics ($\Delta\%$ and $Z$-score), FRP energy stats, nocturnal fraction, and fire regime diagnosis.
- **RawFIRMSDetection**: Represents an individual active fire pixel record parsed from a NASA FIRMS CSV export (latitude, longitude, brightness, scan, track, acq_date, acq_time, satellite, instrument, confidence, version, bright_t31, frp, daynight, type).
- **IngestionValidationReport**: Data structure detailing the outcome of client-side validation (isValid, totalRows, validHotspots, excludedRows, detectedSensors, dateRange, boundingBox, errors, warnings).
- **CustomHarmonizedCube**: A dynamically synthesized `RegionCube` instance conforming to the system's core data contract, enabling seamless drop-in substitution across all dashboard visualization components.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of generated CSV files pass RFC 4180 syntax validation with exactly 27 canonical columns and zero corrupted or unescaped cells.
- **SC-002**: CSV generation and download trigger executes in less than $250\text{ ms}$ for a full 27-year time series (324 monthly records) on standard desktop and laptop browsers.
- **SC-003**: Client-side parsing and in-memory validation of a 10,000-row FIRMS CSV completes in under $1.5\text{ seconds}$ without blocking user interactivity.
- **SC-004**: Ingestion error validation catches 100% of malformed files (missing mandatory headers, invalid dates, out-of-range coordinates) and displays explicit user guidance without unhandled exceptions.
- **SC-005**: 100% of user-facing UI strings in `CustomCSVModal.tsx` and export alerts switch instantly when toggling the global language switcher between English and Spanish.
- **SC-006**: Unit test suite for CSV export and custom modal attains 100% test pass rate across Vitest suites, with zero TypeScript compilation warnings during `pnpm build`.

---

## Assumptions

- Users accessing the export feature have modern browsers supporting HTML5 `Blob` and `download` attributes.
- Custom uploaded CSVs originate from or follow the column conventions of NASA FIRMS (Earthdata) downloads for MODIS and VIIRS.
- For custom files covering geographic areas outside the 5 benchmark cubes, default empirical beta calibration ratios ($\beta_m \approx 1.8$ to $2.2$ depending on month) and non-parametric medians are estimated based on regional latitude bands.
- Uploaded files are processed strictly in-memory and discarded upon page reload or when the user clicks "Reset", maintaining zero persistent remote storage requirements.

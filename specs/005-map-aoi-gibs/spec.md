# Feature Specification: Interactive Cartographic WebGIS Canvas with Bounding Box & NASA GIBS WMTS

**Feature Branch**: `feat/T-06-mapa-aoi-gibs`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "Build the interactive cartographic WebGIS module (src/components/MapAOISelector.tsx) using Leaflet and React Leaflet, integrating NASA GIBS WMTS satellite imagery layers and interactive bounding box drawing according to docs/03-system-technical-architecture.md and docs/04-firms-data-specification.md. Allow seamless switching between the 5 pre-calibrated study areas, display 0.01-degree AFCD active cell clusters, and provide zoom controls, coordinate inputs, and NASA GIBS layer toggles."

## Clarifications

### Session 2026-11-15
- Q: Which default date should the NASA GIBS WMTS satellite tile layer query, given that real NASA GIBS servers host daily global satellite overpasses? → A: Option A (Curated Peak Burning Season Reference Date per Benchmark Region): Uses documented, clear-sky dates of prominent historical burning activity (e.g., `2024-09-15` for Huánuco `PE-HCO` and Amazon `SAM-MAP`, `2020-09-09` for California `US-CAL`, `2019-12-30` for Australia `AU-NSW`, and `2020-08-20` for Paraná Delta `AR-PAR`) to reliably showcase authentic satellite smoke plumes and thermal scars without cloud-cover interference or missing real-time orbital swathes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive Cartographic Canvas & Benchmark Region Synchronization (Priority: P1) 🎯 MVP

As an Earth science researcher, emergency manager, or NASA judge, I want to explore an aerospace dark-themed interactive map canvas synchronized with the active benchmark region, so that I can visually verify geographic extents, examine landforms, and fluidly navigate between the 5 designated study areas with automatic smooth camera transitions.

**Why this priority**: Forms the foundational spatial viewport of the mission control workspace. Without the map canvas and region synchronization, spatial selection and cartographic exploration are impossible.

**Independent Test**: Load the dashboard, observe the map automatically centered on the default benchmark region (Huánuco & Central Peruvian Andes), switch between the 5 study areas via navigation or quick-select pills, and verify that the map smoothly pans and fits bounds (`flyToBounds`) to the selected region coordinates.

**Acceptance Scenarios**:

1. **Given** the application loaded with default region `PE-HCO`, **When** the map mounts, **Then** it renders a dark cartographic basemap centered on `[-9.50, -75.75]` with bounds matching `[-10.60, -77.10]` to `[-8.40, -74.40]`.
2. **Given** the active map canvas, **When** the user changes the active region in the global navigation shell (or via on-map AOI quick pills), **Then** the map smoothly animates its viewport to the new bounding box without page reloads or UI freezing.
3. **Given** touch or mouse interaction, **When** the user pans, zooms, or clicks standard Leaflet navigation controls, **Then** the map responds fluidly at $\ge 60\text{ FPS}$ with zoom constrained between minimum zoom (level 2) and maximum zoom (level 12).

---

### User Story 2 - Interactive Bounding Box Drawing & Coordinate Inputs (Priority: P2)

As a disaster response analyst or remote sensing specialist, I want to interactively draw a custom rectangular bounding box on the map or enter exact latitude/longitude coordinates, so that I can isolate specific fire complexes, valley corridors, or micro-regions for localized re-harmonization.

**Why this priority**: Fulfills NASA Challenge 15 Requirement R3 (custom geographical bounding-box definition) and unlocks dynamic client-side re-harmonization beyond fixed catalog extents.

**Independent Test**: Click the "Draw AOI" toolbar button, drag a rectangle across an active burning area on the map, and verify that the numeric coordinate fields (`Min Lat`, `Max Lat`, `Min Lon`, `Max Lon`) update in real time and trigger fast subset re-harmonization.

**Acceptance Scenarios**:

1. **Given** the map toolbar, **When** the user activates the "Draw AOI Rectangle" mode and drags across the canvas, **Then** a visible bounding box with high-contrast dashed borders and vertex handles is rendered on the map.
2. **Given** an active bounding box, **When** the drawing completes or the user edits the numeric latitude/longitude input fields, **Then** coordinates are validated against WGS84 physical boundaries and the spatial subset is filtered in $< 30\text{ ms}$.
3. **Given** a custom drawn bounding box, **When** the user clicks "Reset to Benchmark AOI", **Then** the custom rectangle is cleared, coordinate inputs reset to the active benchmark bounds, and the map camera returns to the full regional extent.

---

### User Story 3 - NASA GIBS Satellite Imagery Overlays & Fire Cell Density Clusters (Priority: P3)

As an environmental investigator or satellite data auditor, I want to toggle NASA EOSDIS GIBS satellite imagery layers (Terra/Aqua MODIS and Suomi-NPP/NOAA-20 VIIRS True Color) and overlay high-resolution active fire cell density clusters ($0.01^\circ$), so that I can visually cross-examine spaceborne thermal detections against real atmospheric smoke plumes and surface terrain.

**Why this priority**: Provides direct visual evidence connecting raw thermal anomalies to NASA Earth observation satellite passes, meeting the core NASA Space Apps Challenge standard for Earth science visualization.

**Independent Test**: Open the map layer control panel, toggle the NASA GIBS MODIS True Color tile layer, and click on an active fire cell cluster to inspect its contextual popup with total AFCD, peak month, Fire Radiative Power (MW), and nighttime persistence fraction.

**Acceptance Scenarios**:

1. **Given** the map layer switcher, **When** the user toggles on the "NASA GIBS Terra/Aqua MODIS True Color" or "VIIRS True Color" layer, **Then** the map requests and displays the corresponding WMTS satellite tile overlays without authentication barriers.
2. **Given** pre-computed spatial density data (`public/data/firms_spatial_cells.json`), **When** active fire cells render, **Then** each $0.01^\circ$ cell is styled with chromatic intensity matching the selected colorblind-safe palette (Inferno/Viridis/Cividis) and Fire Radiative Power (MW).
3. **Given** a rendered fire cell marker or rectangle, **When** the user clicks on it, **Then** an informative aerospace dark tooltip/popup appears displaying: Cell Coordinates (Lat/Lon), Total AFCD ($2000\text{--}2026$), Peak Burning Month, Mean FRP (MW), and Nocturnal Detection Ratio ($f_{\text{night}}$).

---

### Edge Cases

- **Custom Bounding Box with Zero Fire Cells:** What happens if the user draws a bounding box in an ocean area or high-altitude glacier with 0 hotspots?  
  *Mitigation:* The system displays an informative badge *"No active fire cells detected within selected coordinates"* and retains zeroed safe metrics without application errors.
- **NASA GIBS WMTS Offline / Network Latency:** What happens if NASA GIBS tile servers experience network timeouts or CORS errors?  
  *Mitigation:* Leaflet tile error listeners catch network interruptions gracefully, falling back to the dark cartographic basemap with a non-intrusive indicator tag *"Satellite layer unavailable; displaying basemap"*.
- **Degenerate Bounding Box Coordinates:** What happens if a user types inverted coordinates (`Min Lat > Max Lat` or `Min Lon > Max Lon`) or out-of-range values?  
  *Mitigation:* The component runs `normalizeBoundingBox` automatically, swapping inverted min/max values and clamping latitudes to $[-85.05, 85.05]$ (Web Mercator limit) and longitudes to $[-180.0, 180.0]$.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render an interactive Leaflet cartographic canvas (`MapAOISelector.tsx`) integrated into the mission control workspace, supporting fluid pan, zoom, and touch gestures.
- **FR-002**: System MUST automatically synchronize the map center and bounds with the active benchmark region selected in `RegionContext` (`PE-HCO`, `SAM-MAP`, `AR-PAR`, `US-CAL`, `AU-NSW`), executing smooth camera transitions (`flyToBounds`).
- **FR-003**: System MUST provide an on-map interactive bounding box drawing tool allowing users to define custom rectangular Areas of Interest directly on the canvas.
- **FR-004**: System MUST display 4 synchronized numeric input fields (`Min Lat`, `Max Lat`, `Min Lon`, `Max Lon`) that update bidirectionally with the drawn bounding box and allow manual coordinate entry with immediate validation.
- **FR-005**: System MUST provide a layer switcher control supporting:
  1. Default aerospace dark basemap (CartoDB Dark Matter / OSM dark tile service).
  2. NASA EOSDIS GIBS WMTS tile layer (Terra/Aqua MODIS Corrected Reflectance True Color).
  3. NASA EOSDIS GIBS WMTS tile layer (VIIRS SNPP Corrected Reflectance True Color).
  4. Active Fire Cell Density ($0.01^\circ$ spatial grid) layer toggle.
- **FR-006**: System MUST fetch and render spatial fire cell clusters from `public/data/firms_spatial_cells.json`, styling each cell according to the active colorblind-safe palette (Inferno/Viridis/Cividis) and its Fire Radiative Power (FRP).
- **FR-007**: System MUST provide interactive cell popups displaying geographic coordinates, cumulative multi-decadal AFCD, peak month, mean FRP (MW), and nocturnal persistence fraction ($f_{\text{night}}$).
- **FR-008**: System MUST provide a "Reset to Benchmark AOI" button that clears custom bounding box overrides and restores the default regional bounds.
- **FR-009**: System MUST support bilingual (`EN` / `ES`) labels across all map controls, layer names, coordinate labels, tooltips, and popups.
- **FR-010**: System MUST configure the temporal reference date parameter for NASA GIBS WMTS satellite tile requests using curated, clear-sky peak fire dates per benchmark region (`2024-09-15` for `PE-HCO` & `SAM-MAP`, `2020-09-09` for `US-CAL`, `2019-12-30` for `AU-NSW`, and `2020-08-20` for `AR-PAR`) to reliably reveal observable smoke plumes and burn scars without cloud-cover degradation.

### Key Entities

- **BoundingBox**: Geographic rectangular envelope defined by `min_lat`, `max_lat`, `min_lon`, and `max_lon` in decimal degrees (WGS84).
- **SpatialFireCell**: $0.01^\circ \times 0.01^\circ$ active fire cell containing spatial coordinates, cumulative AFCD, peak burning month, mean/p90 FRP (MW), night detection fraction, and fire regime class.
- **GIBSLayerConfig**: Configuration object for NASA GIBS WMTS tile endpoints defining layer identifier, tile matrix set, date parameter, image format, and layer attribution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Interactive fluidity: Map panning and zooming maintain $\ge 60\text{ FPS}$ on standard displays with $< 100\text{ ms}$ response to user inputs.
- **SC-002**: Spatial calculation speed: Filtering the $0.01^\circ$ active cell clusters and recalculating spatial subsets upon bounding box adjustments completes in $< 30\text{ ms}$ on client hardware.
- **SC-003**: Accessibility and visual contrast: All on-map control buttons, coordinate input badges, layer toggle panels, and popup dialogs achieve WCAG 2.1 Level AA contrast ratio ($\ge 4.5:1$) against dark backgrounds.
- **SC-004**: Zero proprietary token barrier: Map tiles, NASA GIBS layers, and spatial overlays load without requiring API keys, user authentication, or billable third-party accounts.
- **SC-005**: Automated test coverage: 100% of unit and component test suites in `tests/MapAOISelector.test.tsx` pass cleanly in Vitest.

## Assumptions

- **Leaflet Asset Bundling**: Leaflet CSS and marker assets are bundled locally via Vite without relying on external unpkg/cdnjs CDNs that could fail in restricted environments.
- **NASA GIBS Availability**: NASA GIBS WMTS endpoints (`https://gibs.earthdata.nasa.gov/wmts/...`) are publicly accessible over standard HTTPS without authentication.
- **Default Baseline Date**: When NASA GIBS true-color imagery is displayed, a documented benchmark date (or the latest observation date) is used to avoid requesting future dates where satellite imagery does not yet exist.
- **Pre-computed Spatial Grid**: Uses `public/data/firms_spatial_cells.json` containing 250 pre-aggregated $0.01^\circ$ cells across the 5 benchmark regions.

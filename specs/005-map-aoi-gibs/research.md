# Technical Research: Interactive Cartographic WebGIS Canvas (T-06)

**Feature**: `005-map-aoi-gibs` | **Branch**: `feat/T-06-mapa-aoi-gibs` | **Date**: 2026-11-15

## Research Overview & Objectives

Investigate and document architectural decisions, integration patterns, and best practices for delivering the interactive Leaflet WebGIS cartographic canvas (`src/components/MapAOISelector.tsx`) in TerraSpot Harmonizer:
1. High-performance Leaflet & React-Leaflet integration in React 19 and Vite.
2. Official NASA EOSDIS GIBS WMTS tile endpoints and public basemaps without API key constraints.
3. Native bounding-box rectangle drawing tools with bidirectional coordinate synchronization.
4. Rendering and styling 250 $0.01^\circ$ active fire cell density clusters using WCAG-certified color palettes.
5. Client-side spatial subset re-harmonization ($< 30\text{ ms}$) via `reharmonizeSpatialSubset`.

---

## Architectural Decisions & Research Findings

### Decision 1: Leaflet Cartographic Integration & Vite Bundling

- **Context**: Map component must render inside the dark aerospace dashboard (`#0B0F17`) with smooth 60 FPS pan/zoom, responsive height, and zero external CDN script tags.
- **Decision**: Use `leaflet` (v1.9.4) and `react-leaflet` (v5.0.0) with local CSS import (`import 'leaflet/dist/leaflet.css';`) in `src/components/MapAOISelector.tsx`.
- **Rationale**:
  - `react-leaflet` v5 provides clean React 19 hooks (`useMap`, `useMapEvents`) and declarative layer composition (`MapContainer`, `TileLayer`, `Rectangle`, `CircleMarker`, `Popup`, `Tooltip`).
  - Standard raster marker image 404s in Vite are avoided completely by rendering spatial fire cells as vector geometries (`CircleMarker` / `Rectangle`) colored by FRP and regime intensity.
- **Alternatives Considered**:
  - *MapLibre GL / Mapbox GL:* Requires WebGL 2.0 context which complicates headless JSDOM testing and has heavier bundle footprint (> 600 KB vs Leaflet ~140 KB).
  - *OpenLayers:* Excessively complex API for 2D tile + bounding box requirements.

---

### Decision 2: NASA EOSDIS GIBS WMTS Integration & Curated Baseline Dates

- **Context**: Challenge 15 requires visualizing spaceborne Earth observation data to validate ground fire regimes against satellite passes. Real NASA GIBS servers host daily global mosaics in Web Mercator (`EPSG:3857`).
- **Decision**: Configure official NASA GIBS WMTS endpoints using the `GoogleMapsCompatible_Level9` matrix:
  - **MODIS Terra True Color (Corrected Reflectance):**
    `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
  - **VIIRS SNPP True Color (Corrected Reflectance):**
    `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`
  - **Aerospace Dark Basemap (Default Base):**
    `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` (CARTO / OpenStreetMap) with subdomains `['a', 'b', 'c', 'd']`.
  - **Curated Peak Fire Season Dates:**
    - `PE-HCO` & `SAM-MAP`: `2024-09-15` (massive South American drought fires)
    - `US-CAL`: `2020-09-09` (historic California wildfire orange skies)
    - `AU-NSW`: `2019-12-30` (Black Summer extreme pyrocumulonimbus events)
    - `AR-PAR`: `2020-08-20` (Paraná wetland agricultural/wildland fires)
- **Rationale**:
  - Zero API key, zero user sign-in, and 100% public HTTPS availability.
  - Curated dates guarantee that the NASA judges see authentic, cloud-free smoke plumes and fire scars that correlate directly with the FIRMS active fire detections.
  - Graceful fallback: If GIBS tiles fail (e.g. offline/testing), Leaflet layer error handler switches to or retains the dark basemap.

---

### Decision 3: Interactive Bounding Box Drawing Tool (Zero Heavy Plugins)

- **Context**: Users must be able to click-and-drag a rectangular AOI on the map, view the dashed bounding box rectangle, and see numeric inputs update in real time.
- **Decision**: Implement a native React-Leaflet drawing controller (`BoundingBoxDrawHandler`) utilizing `useMapEvents`:
  - When "Draw AOI" mode is active, map dragging is disabled (`map.dragging.disable()`).
  - `mousedown` records the anchor coordinate `[lat1, lon1]`.
  - `mousemove` updates transient visual rectangle preview.
  - `mouseup` finalizes the bounding box, re-enables map dragging, and dispatches the normalized `BoundingBox` to the coordinate inputs and context.
  - "Reset to Benchmark AOI" button instantly clears custom rectangle state and restores `currentRegion.bbox`.
- **Rationale**:
  - Avoids adding bulky unmaintained third-party drawing plugins (`leaflet-draw` or `leaflet-geoman` which add 100+ KB and have React 19 compatibility quirks).
  - Clean, pure TypeScript implementation with $< 80$ lines of reliable code.

---

### Decision 4: Spatial Fire Cell Density Grid ($0.01^\circ$) & Color Scaling

- **Context**: 250 spatial cells from `public/data/firms_spatial_cells.json` must be rendered with high visual contrast and interactive popups.
- **Decision**:
  - Load `public/data/firms_spatial_cells.json` dynamically (with bundled fallback).
  - Filter cells matching active region ID (or custom bounding box coordinates).
  - Render each cell as a Leaflet `Rectangle` (or `CircleMarker` for high-zoom performance) spanning $0.01^\circ \times 0.01^\circ$.
  - Style fill color using `interpolateRamp` and `normalizeValue` from `src/engine/colorRamps.ts` based on cell Fire Radiative Power (`mean_frp_mw`) or total AFCD.
  - Render dark-themed Leaflet `Popup` on click with bilingual labels (`EN` / `ES`).

---

### Decision 5: Client-Side Re-Harmonization Speed ($< 30\text{ ms}$)

- **Context**: When a custom bounding box is drawn, headline metrics must recalculate without perceptible UI stutter.
- **Decision**: Execute `reharmonizeSpatialSubset(cells, currentRegion, customBbox)` in-memory.
- **Rationale**: Benchmarked in `tests/harmonizer.test.ts` at $< 10\text{ ms}$ for 250 cells. Guarantees 60 FPS animation budget.

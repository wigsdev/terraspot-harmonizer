# Quickstart & Verification Guide: Interactive Cartographic WebGIS Canvas (T-06)

**Feature**: `005-map-aoi-gibs` | **Branch**: `feat/T-06-mapa-aoi-gibs` | **Date**: 2026-11-15

## 1. Prerequisites

- Node.js `v24.x` with `pnpm 12.21.0`
- Existing dataset: `public/data/firms_spatial_cells.json` (250 spatial cells) and `public/data/regions_catalog.json`
- Verified engine functions: `reharmonizeSpatialSubset` (`src/engine/harmonizer.ts`) and `interpolateRamp` (`src/engine/colorRamps.ts`)

---

## 2. Automated Testing Suite

Execute targeted component tests for the WebGIS cartographic module:

```bash
# Run MapAOISelector tests with Vitest
pnpm test:run tests/MapAOISelector.test.tsx

# Run full project test suite
pnpm test:run

# Verify TypeScript compilation
pnpm typecheck
```

### Expected Test Assertions

1. **Mount & Basemap Loading**: Verifies that the Leaflet map container mounts with dark aerospace theme and centers on default region `PE-HCO` (`[-9.50, -75.75]`).
2. **Region Synchronization**: Verifies that switching active region (e.g. to `US-CAL`) re-centers the map bounds to California.
3. **Layer Switcher**: Verifies that switching between CartoDB Dark Matter, NASA GIBS MODIS True Color, and VIIRS True Color updates the active tile layer URL.
4. **Spatial Cell Clusters**: Verifies that $0.01^\circ$ active fire cell rectangles/markers render with colors derived from the active palette (Inferno/Viridis/Cividis).
5. **Bounding Box Drawing & Inputs**: Verifies that setting custom `[min_lat, max_lat, min_lon, max_lon]` coordinates filters spatial cells and calls `onCustomAOIChange`.
6. **Bilingual Toggling**: Verifies that all labels, layer names, coordinate titles, and tooltips toggle reactively between `EN` and `ES`.

---

## 3. Manual Browser Verification

Start the local development server:

```bash
pnpm dev
```

1. Open `http://localhost:5173/` in Google Chrome / Chromium.
2. Verify that `MapAOISelector` is visible in the workspace below the KPI cards.
3. Click the **Layer Switcher** icon on the map:
   - Select **NASA GIBS MODIS True Color**: Notice real spaceborne satellite imagery of central Peru.
   - Select **NASA GIBS VIIRS True Color**: Notice high-resolution reflectance.
   - Return to **Dark Matter Basemap**.
4. Click on a glowing fire cell:
   - Observe the dark aerospace popup showing coordinates, total AFCD, mean FRP (MW), and night fraction.
5. Click **"Draw AOI"** on the map toolbar:
   - Drag a rectangle across a cluster of cells.
   - Observe the 4 numeric coordinate inputs updating in real time.
   - Click **"Reset to Benchmark AOI"**: Observe the map camera and coordinates restoring cleanly.
6. Click the **`EN / ES`** toggle button in the Navbar:
   - Confirm all on-map text translates instantly to Spanish (`Dibujar AOI`, `Restablecer AOI`, `Capa Satelital NASA GIBS`, etc.).

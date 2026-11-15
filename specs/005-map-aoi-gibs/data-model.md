# Data Model & Geographic Contracts: Interactive Cartographic WebGIS Canvas (T-06)

**Feature**: `005-map-aoi-gibs` | **Branch**: `feat/T-06-mapa-aoi-gibs` | **Date**: 2026-11-15

## 1. Domain Entities & Spatial Structures

### 1.1 Geographic Bounding Box (`BoundingBox`)

Represents the WGS84 spatial envelope defining an Area of Interest (AOI):

```typescript
export interface BoundingBox {
  min_lat: number; // South latitude bound (-85.0511 to 85.0511)
  max_lat: number; // North latitude bound (-85.0511 to 85.0511)
  min_lon: number; // West longitude bound (-180.0 to 180.0)
  max_lon: number; // East longitude bound (-180.0 to 180.0)
}
```

**Validation Invariants**:
- `min_lat <= max_lat` (normalized automatically via `normalizeBoundingBox`).
- `min_lon <= max_lon` (normalized automatically).
- Coordinates clamped to Web Mercator limits: latitudes $\in [-85.0511, 85.0511]$, longitudes $\in [-180.0, 180.0]$.

---

### 1.2 Spatial Active Fire Cell Summary (`SpatialGridCellSummary`)

Schema of individual $0.01^\circ \times 0.01^\circ$ (~$1.1\text{ km}$) active fire cells loaded from `public/data/firms_spatial_cells.json`:

```typescript
import type { FireRegimeClass } from './harmonization';

export interface SpatialGridCellSummary {
  region_id: string; // e.g., 'PE-HCO', 'US-CAL'
  grid_x: number;    // lon * 100 integer grid index
  grid_y: number;    // lat * 100 integer grid index
  lat: number;       // Cell centroid latitude
  lon: number;       // Cell centroid longitude
  total_afcd: number;// Cumulative 2000-2026 active fire cell-days
  peak_month: number;// Primary burning month (1-12)
  mean_frp_mw: number; // Average Fire Radiative Power in megawatts
  p90_frp_mw: number;  // 90th percentile FRP
  night_fraction: number; // Nocturnal detection ratio (0.0000 - 1.0000)
  regime_class: FireRegimeClass; // 'AGRICULTURAL_BURN' | 'TRANSITIONAL' | 'SEVERE_WILDFIRE'
  yearly_afcd: Record<string, number>; // Yearly breakout { "2000": 10, ... }
}

export interface SpatialCellsCatalogDocument {
  generated_at: string;
  grid_resolution_deg: number; // 0.01
  total_cells: number;
  cells: SpatialGridCellSummary[];
}
```

---

### 1.3 NASA GIBS Layer Configuration (`GIBSLayerConfig`)

Schema defining cartographic basemaps and satellite WMTS services:

```typescript
export type MapLayerId = 'dark_matter' | 'modis_truecolor' | 'viirs_truecolor';

export interface GIBSLayerConfig {
  id: MapLayerId;
  nameKey: 'darkMatter' | 'modisTrueColor' | 'viirsTrueColor';
  urlTemplate: string;
  attribution: string;
  maxZoom: number;
  minZoom: number;
  isSatellite: boolean;
  timeParam?: string; // YYYY-MM-DD for NASA GIBS
}
```

---

### 1.4 WebGIS Component State (`MapAOIState`)

Internal state model of `MapAOISelector.tsx`:

```typescript
export interface MapAOIState {
  activeLayer: MapLayerId;
  showFireCells: boolean;
  isDrawing: boolean;
  customBbox: BoundingBox | null;
  transientDrawBounds: [[number, number], [number, number]] | null;
  selectedCell: SpatialGridCellSummary | null;
  coordinateInputs: {
    minLat: string;
    maxLat: string;
    minLon: string;
    maxLon: string;
  };
  inputError: string | null;
}
```

---

## 2. Benchmark Region Peak Fire Reference Dates

Mapping benchmark regions to NASA GIBS clear-sky satellite imagery dates:

```typescript
export const BENCHMARK_GIBS_DATES: Record<string, string> = {
  'PE-HCO': '2024-09-15', // Central Peruvian Andes peak dry season fires
  'SAM-MAP': '2024-09-15', // Southern Amazonia megafire drought window
  'AR-PAR': '2020-08-20', // Paraná Delta catastrophic wetland burn
  'US-CAL': '2020-09-09', // California August Complex historic orange skies
  'AU-NSW': '2019-12-30', // Australia Black Summer southeastern megablaze
};
```

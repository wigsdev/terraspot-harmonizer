# Data Model & Architectural Contracts: Web Application Scaffolding

**Feature**: `001-web-scaffolding`  
**Date**: 2026-11-14  

---

## 1. Architectural Entities & Type Definitions (`src/types/`)

The foundational scaffolding establishes the core TypeScript data contracts according to `docs/03-system-technical-architecture.md` and `docs/04-firms-data-specification.md`:

### 1.1 Sensor Detections & Active Fire Cell-Days (`src/types/firms.ts`)

```typescript
export type SensorType = 'MODIS' | 'VIIRS';

export interface RawFirmsDetection {
  latitude: number;
  longitude: number;
  brightness: number;
  scan: number;
  track: number;
  acq_date: string;     // YYYY-MM-DD
  acq_time: string;     // HHMM
  satellite: string;
  confidence: number | string; // MODIS (0-100) or VIIRS ('l' | 'n' | 'h')
  version: string;
  bright_t31?: number;
  frp: number;          // Megawatts (MW)
  daynight: 'D' | 'N';
  type: number;         // 0: vegetation, 1: volcano, 2: static industrial, 3: offshore
}

export interface ActiveFireCellDay {
  grid_x: number;       // Math.floor(lon / 0.01)
  grid_y: number;       // Math.floor(lat / 0.01)
  date: string;         // YYYY-MM-DD
  sensor: SensorType;
  detection_count: number;
  mean_frp: number;     // Aggregated FRP in MW
  max_frp: number;
  has_night_fire: boolean;
}
```

### 1.2 Spatiotemporal Harmonized Record (`src/types/harmonization.ts`)

```typescript
export interface HarmonizedMonthlyRecord {
  year: number;         // 2000 - 2026
  month: number;        // 1 - 12
  raw_modis_count: number;
  raw_viirs_count: number;
  afcd_modis: number;
  afcd_viirs: number;
  harmonized_hotspots: number; // H_{y,m}
  climatological_median: number; // M_m
  departure_percentage: number;  // Delta%
  robust_z_score: number;        // Z_{robust}
  mean_frp_mw: number;
  p90_frp_mw: number;
  night_fraction: number;        // f_{night}
  fire_regime_index: number;     // I_{regime} (0 - 100)
  regime_class: 'AGRICULTURAL_BURN' | 'TRANSITIONAL' | 'SEVERE_WILDFIRE';
}

export interface SensorEraMapping {
  era: 'MODIS_SOLO' | 'DUAL_SENSOR_FUSION' | 'VIIRS_CONTINUITY';
  years: [number, number];
  primary_sensor: string;
  methodology_ref: string;
}
```

### 1.3 Geographic Benchmark Region (`src/types/region.ts`)

```typescript
export interface BoundingBox {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export interface BenchmarkRegion {
  id: string;
  name: string;
  country: string;
  bbox: BoundingBox;
  description: string;
  typical_fire_regime: string;
  seasonal_beta: Record<number, number>; // Month (1-12) -> beta_m factor
}
```

### 1.4 Visual Accessible Palette (`src/types/palette.ts`)

```typescript
export type PaletteType = 'inferno' | 'viridis' | 'cividis' | 'diverging';

export interface ColorStop {
  offset: number; // 0.0 to 1.0
  hex: string;
}

export interface AccessiblePalette {
  id: PaletteType;
  name: string;
  wcag_certified: boolean;
  colorblind_safe: ('deuteranopia' | 'protanopia' | 'tritanopia')[];
  stops: ColorStop[];
}
```

---

## 2. Directory Layout Architecture (`src/`)

```text
src/
├── assets/                  # Icons, mission patches, SVGs
├── components/              # Modular UI React components
│   ├── layout/              # Header, Navigation, Footer, Theme Shell
│   ├── calendar/            # Burning Activity Calendar Matrix
│   ├── map/                 # WebGIS Cartographic Canvas & AOI Selector
│   ├── charts/              # Recharts Climatology & Regime Scatter
│   └── modal/               # CSV Upload & Sensor Audit Modals
├── engine/                  # Pure TypeScript scientific algorithms (Zero React dependencies)
│   ├── gridBinning.ts       # Stage 2: 0.01 deg spatial binning
│   ├── harmonizer.ts        # Stage 3: Beta_m cross-calibration & fusion
│   ├── climatology.ts       # Stage 4: Non-parametric median & Z-score
│   ├── regimeClassifier.ts  # Stage 4: FRP + night persistence classifier
│   ├── colorRamps.ts        # WCAG 2.1 AA accessible thermal scales
│   └── csvExporter.ts       # Canonical 27-column RFC 4180 CSV export
├── types/                   # Centralized TypeScript definitions
│   ├── firms.ts
│   ├── harmonization.ts
│   ├── region.ts
│   └── palette.ts
├── App.tsx                  # Root Application Shell
├── index.css                # CSS-first Tailwind v4 tokens & @theme definitions
└── main.tsx                 # React 19 entry point
```

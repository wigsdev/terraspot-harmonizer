# Data Model & Configuration Schema: T-11 Optimization & Deployment

**Feature**: `010-optimization-deployment`  
**Date**: 2026-11-15  

---

## 1. Vite Modular Build Configuration Schema

```typescript
export interface ChunkSplittingConfig {
  /** Map of vendor chunk name to list of matching module path segments */
  vendorGroups: {
    'vendor-react': string[];
    'vendor-gis': string[];
    'vendor-charts': string[];
    'vendor-icons': string[];
    'vendor-utils': string[];
  };
  /** Maximum chunk size target in kB */
  maxChunkSizeTargetKB: number; // 450 kB
}
```

## 2. Edge Deployment Manifest (`vercel.json`)

```typescript
export interface VercelDeploymentManifest {
  rewrites: Array<{
    source: string;
    destination: string;
  }>;
  headers: Array<{
    source: string;
    headers: Array<{
      key: string;
      value: string;
    }>;
  }>;
}
```

## 3. Responsive Tooltip Boundary Geometry

```typescript
export interface ClampedTooltipPosition {
  x: number;
  y: number;
  isTopRowInversion: boolean;
  maxWidthCss: string;
}
```

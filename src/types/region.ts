/**
 * Benchmark Area of Interest (AOI) and geographic contracts.
 * Adheres to docs/04-firms-data-specification.md.
 */

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

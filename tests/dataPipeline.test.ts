import { describe, it, expect, beforeAll } from 'vitest';
import type { RegionsCatalogDocument, SpatialCellsDocument } from '../src/types';

interface NodeFsSync {
  readFileSync(filePath: string, encoding: 'utf-8'): string;
  statSync(filePath: string): { size: number };
}

interface NodePath {
  dirname(filePath: string): string;
  resolve(...segments: string[]): string;
}

interface NodeUrl {
  fileURLToPath(url: string): string;
}

const EXPECTED_REGION_IDS = ['PE-HCO', 'SAM-MAP', 'AR-PAR', 'US-CAL', 'AU-NSW'] as const;
const EXPECTED_CSV_HEADER =
  'latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_t31,frp,daynight,type';

describe('NASA FIRMS Spatiotemporal Data Pipeline Artifacts (T-03)', () => {
  let fs: NodeFsSync;
  let path: NodePath;
  let regionsPath: string;
  let cellsPath: string;
  let sampleCsvPath: string;
  let catalog: RegionsCatalogDocument;
  let cellsDoc: SpatialCellsDocument;
  let csvContent: string;

  beforeAll(async () => {
    const fsModuleId = 'node:fs';
    const pathModuleId = 'node:path';
    const urlModuleId = 'node:url';
    fs = (await import(/* @vite-ignore */ fsModuleId)) as NodeFsSync;
    path = (await import(/* @vite-ignore */ pathModuleId)) as NodePath;
    const { fileURLToPath } = (await import(/* @vite-ignore */ urlModuleId)) as NodeUrl;

    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const dataDir = path.resolve(currentDir, '..', 'public', 'data');
    regionsPath = path.resolve(dataDir, 'regions_catalog.json');
    cellsPath = path.resolve(dataDir, 'firms_spatial_cells.json');
    sampleCsvPath = path.resolve(dataDir, 'sample_firms_huanuco.csv');

    catalog = JSON.parse(fs.readFileSync(regionsPath, 'utf-8')) as RegionsCatalogDocument;
    cellsDoc = JSON.parse(fs.readFileSync(cellsPath, 'utf-8')) as SpatialCellsDocument;
    csvContent = fs.readFileSync(sampleCsvPath, 'utf-8');
  });

  it('validates regions_catalog.json top-level metadata and 5 benchmark regions', () => {
    expect(catalog.methodology_version).toBe('TerraSpot-4Stage-v1.0');
    expect(catalog.grid_resolution_deg).toBe(0.01);
    expect(catalog.temporal_coverage).toEqual({
      start: '2000-01',
      end: '2026-10',
      total_months: 322,
      climatology_baseline: [2001, 2025],
      overlap_window: [2012, 2025],
    });
    expect(catalog.regions).toHaveLength(5);
    expect(catalog.regions.map((r) => r.id)).toEqual([...EXPECTED_REGION_IDS]);
  });

  it('validates 322 chronological monthly records, Stage 3 accuracy (R^2 > 0.90, MAPE reduction > 65%), and Stage 4 invariants', () => {
    for (const region of catalog.regions) {
      expect(region.monthly_records).toHaveLength(322);
      expect(region.validation_metrics.r_squared).toBeGreaterThan(0.9);
      expect(region.validation_metrics.pearson_r).toBeGreaterThan(0.94);
      expect(region.validation_metrics.mape_reduction_pct).toBeGreaterThan(65);

      for (let m = 1; m <= 12; m += 1) {
        const beta = region.seasonal_beta[String(m)];
        expect(Number.isFinite(beta)).toBe(true);
        expect(beta).toBeGreaterThan(0);

        const clim = region.climatology_by_month[String(m)];
        expect(clim).toBeDefined();
        expect(clim.p25).toBeLessThanOrEqual(clim.median);
        expect(clim.median).toBeLessThanOrEqual(clim.p75);
        expect(clim.p75).toBeLessThanOrEqual(clim.p90);
      }

      let expectedYear = 2000;
      let expectedMonth = 1;

      for (const rec of region.monthly_records) {
        expect(rec.year).toBe(expectedYear);
        expect(rec.month).toBe(expectedMonth);
        expectedMonth += 1;
        if (expectedMonth > 12) {
          expectedMonth = 1;
          expectedYear += 1;
        }

        expect(Number.isFinite(rec.harmonized_hotspots)).toBe(true);
        expect(Number.isFinite(rec.climatological_median)).toBe(true);
        expect(Number.isFinite(rec.departure_percentage)).toBe(true);
        expect(Number.isFinite(rec.robust_z_score)).toBe(true);
        expect(Number.isFinite(rec.mean_frp_mw)).toBe(true);
        expect(Number.isFinite(rec.p90_frp_mw)).toBe(true);
        expect(rec.night_fraction).toBeGreaterThanOrEqual(0);
        expect(rec.night_fraction).toBeLessThanOrEqual(1);
        expect(rec.fire_regime_index).toBeGreaterThanOrEqual(0);
        expect(rec.fire_regime_index).toBeLessThanOrEqual(100);
        expect(['AGRICULTURAL_BURN', 'TRANSITIONAL', 'SEVERE_WILDFIRE']).toContain(
          rec.regime_class
        );

        const beta = rec.beta_factor ?? 0;
        expect(beta).toBe(region.seasonal_beta[String(rec.month)]);

        if (rec.year < 2012) {
          expect(rec.sensor_era).toBe('MODIS_SOLO');
          expect(rec.raw_viirs_count).toBe(0);
          expect(rec.afcd_viirs).toBe(0);
          expect(rec.harmonized_hotspots).toBe(Math.round(beta * rec.afcd_modis));
        } else if (rec.year <= 2025) {
          expect(rec.sensor_era).toBe('DUAL_SENSOR_FUSION');
          expect(rec.harmonized_hotspots).toBe(
            Math.round(0.7 * rec.afcd_viirs + 0.3 * beta * rec.afcd_modis)
          );
        } else {
          expect(rec.sensor_era).toBe('VIIRS_CONTINUITY');
          expect(rec.harmonized_hotspots).toBe(rec.afcd_viirs);
        }
      }
    }
  });

  it('validates firms_spatial_cells.json spatial bounds and 0.01-deg grid indexing', () => {
    const bboxByRegion = new Map(catalog.regions.map((r) => [r.id, r.bbox]));

    expect(cellsDoc.grid_resolution_deg).toBe(0.01);
    expect(cellsDoc.total_cells).toBeGreaterThanOrEqual(100);
    expect(cellsDoc.cells).toHaveLength(cellsDoc.total_cells);

    const seenRegions = new Set<string>();
    for (const cell of cellsDoc.cells) {
      seenRegions.add(cell.region_id);
      const bbox = bboxByRegion.get(cell.region_id);
      expect(bbox).toBeDefined();
      if (!bbox) continue;

      expect(cell.lat).toBeGreaterThan(bbox.min_lat);
      expect(cell.lat).toBeLessThan(bbox.max_lat);
      expect(cell.lon).toBeGreaterThan(bbox.min_lon);
      expect(cell.lon).toBeLessThan(bbox.max_lon);
      expect(cell.grid_x).toBe(Math.floor(cell.lon * 100));
      expect(cell.grid_y).toBe(Math.floor(cell.lat * 100));
      expect(cell.peak_month).toBeGreaterThanOrEqual(1);
      expect(cell.peak_month).toBeLessThanOrEqual(12);
      expect(cell.night_fraction).toBeGreaterThanOrEqual(0);
      expect(cell.night_fraction).toBeLessThanOrEqual(1);
      expect(cell.total_afcd).toBeGreaterThan(0);
    }

    expect(seenRegions.size).toBe(5);
  });

  it('validates sample_firms_huanuco.csv RFC 4180 compliance, PE-HCO bounds, and Stage 1 noise coverage', () => {
    const lines = csvContent.trim().split(/\r?\n/);
    expect(lines.length).toBeGreaterThanOrEqual(501);
    expect(lines[0]).toBe(EXPECTED_CSV_HEADER);

    const huanuco = catalog.regions.find((r) => r.id === 'PE-HCO');
    expect(huanuco).toBeDefined();
    if (!huanuco) return;

    let modisCount = 0;
    let viirsCount = 0;
    let validVegetationCount = 0;
    let rejectedTypeNoiseCount = 0;
    let rejectedConfidenceNoiseCount = 0;

    for (const line of lines.slice(1)) {
      const cols = line.split(',');
      expect(cols).toHaveLength(15);

      const lat = Number(cols[0]);
      const lon = Number(cols[1]);
      const instrument = cols[8];
      const confidence = cols[9];
      const anomalyType = Number(cols[14]);

      expect(lat).toBeGreaterThanOrEqual(huanuco.bbox.min_lat);
      expect(lat).toBeLessThanOrEqual(huanuco.bbox.max_lat);
      expect(lon).toBeGreaterThanOrEqual(huanuco.bbox.min_lon);
      expect(lon).toBeLessThanOrEqual(huanuco.bbox.max_lon);

      if (instrument === 'MODIS') modisCount += 1;
      if (instrument === 'VIIRS') viirsCount += 1;

      if (anomalyType !== 0) {
        rejectedTypeNoiseCount += 1;
      } else {
        const isLowViirs = instrument === 'VIIRS' && confidence.toLowerCase() === 'l';
        const isLowModis = instrument === 'MODIS' && Number(confidence) < 30;
        if (isLowViirs || isLowModis) {
          rejectedConfidenceNoiseCount += 1;
        } else {
          validVegetationCount += 1;
        }
      }
    }

    expect(modisCount).toBeGreaterThan(100);
    expect(viirsCount).toBeGreaterThan(300);
    expect(validVegetationCount).toBeGreaterThan(500);
    expect(rejectedTypeNoiseCount).toBeGreaterThan(0);
    expect(rejectedConfidenceNoiseCount).toBeGreaterThan(0);
  });

  it('enforces total uncompressed public/data payload budget strictly under 2.5 MB', () => {
    const totalBytes =
      fs.statSync(regionsPath).size +
      fs.statSync(cellsPath).size +
      fs.statSync(sampleCsvPath).size;

    const maxBytes = 2.5 * 1024 * 1024;
    expect(totalBytes).toBeGreaterThan(0);
    expect(totalBytes).toBeLessThan(maxBytes);
  });
});

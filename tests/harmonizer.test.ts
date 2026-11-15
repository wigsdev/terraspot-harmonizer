import { describe, it, expect, beforeAll } from 'vitest';
import type {
  BoundingBox,
  MonthlySensorObservation,
  RawFirmsDetection,
  RegionsCatalogDocument,
  SpatialCellsDocument,
} from '../src/types';
import {
  aggregateToAfcdGrid,
  calculateSeasonalBeta,
  classifyAnomalyStatus,
  classifyFireRegime,
  computeMonthlyClimatology,
  computePearsonAndR2,
  computeValidationMetrics,
  filterQualityDetections,
  getGridCoordinates,
  groupCellDaysByMonth,
  harmonizeRawDetections,
  harmonizeTimeSeries,
  isValidVegetationFire,
  linearPercentile,
  normalizeBoundingBox,
  reharmonizeSpatialSubset,
} from '../src/engine/harmonizer';

interface NodeFsSync {
  readFileSync(filePath: string, encoding: 'utf-8'): string;
}

interface NodePath {
  dirname(filePath: string): string;
  resolve(...segments: string[]): string;
}

interface NodeUrl {
  fileURLToPath(url: string): string;
}

describe('TerraSpot Harmonization Engine (src/engine/harmonizer.ts)', () => {
  let catalog: RegionsCatalogDocument;
  let cellsDoc: SpatialCellsDocument;
  let rawCsvDetections: RawFirmsDetection[];

  beforeAll(async () => {
    const fsModuleId = 'node:fs';
    const pathModuleId = 'node:path';
    const urlModuleId = 'node:url';
    const fs = (await import(/* @vite-ignore */ fsModuleId)) as NodeFsSync;
    const path = (await import(/* @vite-ignore */ pathModuleId)) as NodePath;
    const { fileURLToPath } = (await import(/* @vite-ignore */ urlModuleId)) as NodeUrl;

    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const dataDir = path.resolve(currentDir, '..', 'public', 'data');

    const regionsJson = fs.readFileSync(path.resolve(dataDir, 'regions_catalog.json'), 'utf-8');
    catalog = JSON.parse(regionsJson) as RegionsCatalogDocument;

    const cellsJson = fs.readFileSync(path.resolve(dataDir, 'firms_spatial_cells.json'), 'utf-8');
    cellsDoc = JSON.parse(cellsJson) as SpatialCellsDocument;

    const csvContent = fs.readFileSync(path.resolve(dataDir, 'sample_firms_huanuco.csv'), 'utf-8');
    const lines = csvContent.trim().replace(/\r/g, '').split('\n');
    const headers = lines[0].split(',');

    rawCsvDetections = lines.slice(1).map((line) => {
      const parts = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = parts[i];
      });

      return {
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        brightness: parseFloat(row.brightness),
        scan: parseFloat(row.scan),
        track: parseFloat(row.track),
        acq_date: row.acq_date,
        acq_time: row.acq_time,
        satellite: row.satellite,
        instrument: row.instrument,
        confidence: isNaN(Number(row.confidence)) ? row.confidence : parseFloat(row.confidence),
        version: row.version,
        bright_t31: parseFloat(row.bright_t31),
        frp: parseFloat(row.frp),
        daynight: row.daynight as 'D' | 'N',
        type: parseInt(row.type, 10),
      };
    });
  });

  describe('Stage 1: Radiometric Quality Masking (FR-001)', () => {
    it('accurately identifies vegetation fires with valid confidence thresholds', () => {
      expect(
        isValidVegetationFire({
          type: 0,
          confidence: 80,
          instrument: 'MODIS',
          latitude: -9.5,
          longitude: -75.5,
          brightness: 330,
          scan: 1,
          track: 1,
          acq_date: '2024-08-15',
          acq_time: '1430',
          satellite: 'Terra',
          version: '6.1NRT',
          frp: 25,
          daynight: 'D',
        }),
      ).toBe(true);

      // MODIS below 30% must be rejected
      expect(
        isValidVegetationFire({
          type: 0,
          confidence: 29,
          instrument: 'MODIS',
          latitude: -9.5,
          longitude: -75.5,
          brightness: 330,
          scan: 1,
          track: 1,
          acq_date: '2024-08-15',
          acq_time: '1430',
          satellite: 'Terra',
          version: '6.1NRT',
          frp: 25,
          daynight: 'D',
        }),
      ).toBe(false);

      // Non-vegetation fire (type != 0) must be rejected
      expect(
        isValidVegetationFire({
          type: 2,
          confidence: 90,
          instrument: 'MODIS',
          latitude: -9.5,
          longitude: -75.5,
          brightness: 330,
          scan: 1,
          track: 1,
          acq_date: '2024-08-15',
          acq_time: '1430',
          satellite: 'Terra',
          version: '6.1NRT',
          frp: 25,
          daynight: 'D',
        }),
      ).toBe(false);

      // VIIRS categorical confidence
      expect(
        isValidVegetationFire({
          type: 0,
          confidence: 'n',
          instrument: 'VIIRS',
          latitude: -9.5,
          longitude: -75.5,
          brightness: 330,
          scan: 0.5,
          track: 0.5,
          acq_date: '2024-08-15',
          acq_time: '1830',
          satellite: 'N20',
          version: '2.0NRT',
          frp: 15,
          daynight: 'D',
        }),
      ).toBe(true);

      expect(
        isValidVegetationFire({
          type: 0,
          confidence: 'l',
          instrument: 'VIIRS',
          latitude: -9.5,
          longitude: -75.5,
          brightness: 330,
          scan: 0.5,
          track: 0.5,
          acq_date: '2024-08-15',
          acq_time: '1830',
          satellite: 'N20',
          version: '2.0NRT',
          frp: 15,
          daynight: 'D',
        }),
      ).toBe(false);
    });

    it('filters sample Huánuco CSV reproducing exact 1140 valid and 60 rejected rows', () => {
      expect(rawCsvDetections).toHaveLength(1200);

      const { valid, stats } = filterQualityDetections(rawCsvDetections);
      expect(stats.total_input).toBe(1200);
      expect(stats.valid_vegetation).toBe(1140);
      expect(stats.rejected_type).toBe(30);
      expect(stats.rejected_confidence).toBe(30);
      expect(stats.total_rejected).toBe(60);
      expect(valid).toHaveLength(1140);
    });
  });

  describe('Stage 2: Geometric Co-Registration & AFCD Grid (FR-002)', () => {
    it('computes discrete 0.01-degree grid indices accurately', () => {
      const coords1 = getGridCoordinates(-9.5, -75.75);
      expect(coords1.grid_y).toBe(-950);
      expect(coords1.grid_x).toBe(-7575);

      const coords2 = getGridCoordinates(38.75, -121.15);
      expect(coords2.grid_y).toBe(3875);
      expect(coords2.grid_x).toBe(-12115);
    });

    it('aggregates same-day same-sensor cell detections into single AFCD cells', () => {
      const { valid } = filterQualityDetections(rawCsvDetections);
      const cellDays = aggregateToAfcdGrid(valid);

      expect(cellDays.length).toBeGreaterThan(0);
      expect(cellDays.length).toBeLessThan(valid.length);

      for (const cell of cellDays) {
        expect(cell.detection_count).toBeGreaterThanOrEqual(1);
        expect(cell.mean_frp).toBeGreaterThan(0);
        expect(cell.max_frp).toBeGreaterThanOrEqual(cell.mean_frp);
        expect(typeof cell.has_night_fire).toBe('boolean');
      }
    });

    it('groups cell days into monthly observations with valid sensor statistics', () => {
      const { valid } = filterQualityDetections(rawCsvDetections);
      const cellDays = aggregateToAfcdGrid(valid);
      const observations = groupCellDaysByMonth(cellDays, valid);

      expect(observations.length).toBeGreaterThan(0);
      for (const obs of observations) {
        expect(obs.year).toBeGreaterThanOrEqual(2024);
        expect(obs.month).toBeGreaterThanOrEqual(1);
        expect(obs.month).toBeLessThanOrEqual(12);
        expect(obs.afcd_modis + obs.afcd_viirs).toBeGreaterThan(0);
        expect(obs.night_fraction).toBeGreaterThanOrEqual(0);
        expect(obs.night_fraction).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Stage 3: Seasonal Cross-Calibration & Parity Against Benchmark Cubes (FR-003, SC-002)', () => {
    it('matches seasonal beta factors and 322 harmonized counts for all 5 benchmark regions with 0 rounding drift', () => {
      for (const region of catalog.regions) {
        const observations: MonthlySensorObservation[] = region.monthly_records.map((r) => ({
          year: r.year,
          month: r.month,
          raw_modis_count: r.raw_modis_count,
          raw_viirs_count: r.raw_viirs_count,
          afcd_modis: r.afcd_modis,
          afcd_viirs: r.afcd_viirs,
          mean_frp_mw: r.mean_frp_mw,
          p90_frp_mw: r.p90_frp_mw,
          night_fraction: r.night_fraction,
        }));

        // 1. Verify recalculation of seasonal beta
        const recalculatedBeta = calculateSeasonalBeta(observations);
        for (let m = 1; m <= 12; m++) {
          const expectedBeta = region.seasonal_beta[String(m)];
          const computedBeta = recalculatedBeta[String(m)];
          expect(Math.abs(computedBeta - expectedBeta)).toBeLessThanOrEqual(0.0001);
        }

        // 2. Verify complete Stage 3 & 4 harmonization
        const result = harmonizeTimeSeries(observations, region.seasonal_beta);
        expect(result.monthly_records).toHaveLength(region.monthly_records.length);

        for (let i = 0; i < region.monthly_records.length; i++) {
          const expectedRec = region.monthly_records[i];
          const actualRec = result.monthly_records[i];

          expect(actualRec.year).toBe(expectedRec.year);
          expect(actualRec.month).toBe(expectedRec.month);
          expect(actualRec.sensor_era).toBe(expectedRec.sensor_era);
          expect(actualRec.harmonized_hotspots).toBe(expectedRec.harmonized_hotspots);
          expect(actualRec.climatological_median).toBe(expectedRec.climatological_median);
          expect(Math.abs(actualRec.departure_percentage - expectedRec.departure_percentage)).toBeLessThanOrEqual(0.02);
          expect(actualRec.robust_z_score).toBe(expectedRec.robust_z_score);
          expect(Math.abs(actualRec.fire_regime_index - expectedRec.fire_regime_index)).toBeLessThanOrEqual(0.02);
          expect(actualRec.regime_class).toBe(expectedRec.regime_class);
        }

        // 3. Verify validation metrics
        expect(result.validation_metrics.r_squared).toBeGreaterThan(0.9);
        expect(result.validation_metrics.pearson_r).toBeGreaterThan(0.94);
        expect(result.validation_metrics.mape_reduction_pct).toBeGreaterThan(65.0);
      }
    });

    it('computes validation metrics directly for an observation series', () => {
      const hcoRegion = catalog.regions[0];
      const obs: MonthlySensorObservation[] = hcoRegion.monthly_records.map((r) => ({
        year: r.year,
        month: r.month,
        raw_modis_count: r.raw_modis_count,
        raw_viirs_count: r.raw_viirs_count,
        afcd_modis: r.afcd_modis,
        afcd_viirs: r.afcd_viirs,
        mean_frp_mw: r.mean_frp_mw,
        p90_frp_mw: r.p90_frp_mw,
        night_fraction: r.night_fraction,
      }));

      const metrics = computeValidationMetrics(obs, hcoRegion.seasonal_beta);
      expect(metrics.r_squared).toBeGreaterThan(0.9);
      expect(metrics.pearson_r).toBeGreaterThan(0.94);
      expect(metrics.raw_mape_pct).toBeGreaterThan(0.0);
      expect(metrics.harmonized_mape_pct).toBeLessThan(metrics.raw_mape_pct);
      expect(metrics.mape_reduction_pct).toBeGreaterThan(65.0);
    });

    it('computes Pearson r and R2 correctly', () => {
      const x = [10, 20, 30, 40, 50];
      const y = [11, 19, 31, 39, 51];
      const { pearson_r, r_squared } = computePearsonAndR2(x, y);
      expect(pearson_r).toBeGreaterThan(0.99);
      expect(r_squared).toBeGreaterThan(0.99);
    });

    it('handles degenerate Pearson inputs safely', () => {
      const { pearson_r, r_squared } = computePearsonAndR2([5, 5, 5], [5, 5, 5]);
      expect(pearson_r).toBe(0.0);
      expect(r_squared).toBe(0.0);
    });
  });

  describe('Stage 4: Climatology, Anomalies & Fire Regime Index (FR-004, FR-005)', () => {
    it('computes 2001-2025 monthly climatology envelopes correctly', () => {
      const hcoRegion = catalog.regions[0];
      const records = hcoRegion.monthly_records.map((r) => ({
        year: r.year,
        month: r.month,
        harmonized_hotspots: r.harmonized_hotspots,
      }));

      const clim = computeMonthlyClimatology(records);
      for (let m = 1; m <= 12; m++) {
        const expected = hcoRegion.climatology_by_month[String(m)];
        const computed = clim[String(m)];
        expect(computed.median).toBe(expected.median);
        expect(computed.p25).toBe(expected.p25);
        expect(computed.p75).toBe(expected.p75);
        expect(computed.iqr).toBe(expected.iqr);
        expect(computed.p90).toBe(expected.p90);
      }
    });

    it('interpolates quantiles with linear interpolation precision', () => {
      const sample = [10, 20, 30, 40, 50];
      expect(linearPercentile(sample, 0.0)).toBe(10);
      expect(linearPercentile(sample, 0.5)).toBe(30);
      expect(linearPercentile(sample, 0.25)).toBe(20);
      expect(linearPercentile(sample, 0.75)).toBe(40);
      expect(linearPercentile(sample, 1.0)).toBe(50);
      expect(linearPercentile([], 0.5)).toBe(0.0);
    });

    it('classifies fire regime index according to FRP and nocturnal persistence', () => {
      // Low energy agricultural burn
      const ag = classifyFireRegime(20.0, 0.05);
      expect(ag.fire_regime_index).toBeLessThanOrEqual(35.0);
      expect(ag.regime_class).toBe('AGRICULTURAL_BURN');

      // Transitional fire
      const tr = classifyFireRegime(45.0, 0.18);
      expect(tr.fire_regime_index).toBeGreaterThan(35.0);
      expect(tr.fire_regime_index).toBeLessThanOrEqual(65.0);
      expect(tr.regime_class).toBe('TRANSITIONAL');

      // Severe crown wildfire
      const wf = classifyFireRegime(75.0, 0.32);
      expect(wf.fire_regime_index).toBeGreaterThan(65.0);
      expect(wf.regime_class).toBe('SEVERE_WILDFIRE');
    });

    it('classifies anomaly status correctly into NORMAL, ELEVATED, and CRITICAL', () => {
      expect(classifyAnomalyStatus(20, 50, 0.4)).toBe('NORMAL');
      expect(classifyAnomalyStatus(35, 50, 1.2)).toBe('ELEVATED');
      expect(classifyAnomalyStatus(10, 50, -1.3)).toBe('ELEVATED');
      expect(classifyAnomalyStatus(60, 50, 2.3)).toBe('CRITICAL');
      expect(classifyAnomalyStatus(55, 50, 1.8)).toBe('CRITICAL'); // Exceeds P90
      expect(classifyAnomalyStatus(0, 0, 0)).toBe('NORMAL'); // Zero hotspots
    });
  });

  describe('Spatial AOI Recalculation & Performance (FR-006, SC-001, SC-003)', () => {
    it('normalizes inverted bounding box coordinates', () => {
      const inverted: BoundingBox = {
        min_lat: -8.4,
        max_lat: -10.6,
        min_lon: -74.4,
        max_lon: -77.1,
      };
      const norm = normalizeBoundingBox(inverted);
      expect(norm.min_lat).toBe(-10.6);
      expect(norm.max_lat).toBe(-8.4);
      expect(norm.min_lon).toBe(-77.1);
      expect(norm.max_lon).toBe(-74.4);
    });

    it('executes custom AOI spatial subsetting in under 30 ms', () => {
      const hcoRegion = catalog.regions.find((r) => r.id === 'PE-HCO')!;
      const hcoCells = cellsDoc.cells.filter((c) => c.region_id === 'PE-HCO');

      const customBbox: BoundingBox = {
        min_lat: -10.0,
        max_lat: -9.0,
        min_lon: -76.5,
        max_lon: -75.0,
      };

      const start = performance.now();
      const result = reharmonizeSpatialSubset(hcoCells, hcoRegion, customBbox);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(30.0);
      expect(result.monthly_records).toHaveLength(322);
      expect(result.validation_metrics.r_squared).toBeGreaterThan(0.85);

      for (const rec of result.monthly_records) {
        expect(Number.isFinite(rec.harmonized_hotspots)).toBe(true);
        expect(Number.isFinite(rec.departure_percentage)).toBe(true);
        expect(Number.isFinite(rec.robust_z_score)).toBe(true);
        expect(Number.isFinite(rec.fire_regime_index)).toBe(true);
      }
    });

    it('handles empty spatial bounding boxes gracefully with zero NaN or Infinity', () => {
      const hcoRegion = catalog.regions.find((r) => r.id === 'PE-HCO')!;
      const hcoCells = cellsDoc.cells.filter((c) => c.region_id === 'PE-HCO');

      // Bounding box with zero cells (offshore in Pacific)
      const emptyBbox: BoundingBox = {
        min_lat: -20.0,
        max_lat: -19.0,
        min_lon: -85.0,
        max_lon: -84.0,
      };

      const result = reharmonizeSpatialSubset(hcoCells, hcoRegion, emptyBbox);
      expect(result.monthly_records).toHaveLength(322);

      for (const rec of result.monthly_records) {
        expect(rec.harmonized_hotspots).toBe(0);
        expect(rec.climatological_median).toBe(0.0);
        expect(rec.departure_percentage).toBe(0.0);
        expect(rec.robust_z_score).toBe(0.0);
        expect(rec.anomaly_status).toBe('NORMAL');
        expect(rec.fire_regime_index).toBe(0.0);
        expect(rec.regime_class).toBe('AGRICULTURAL_BURN');
        expect(Number.isNaN(rec.harmonized_hotspots)).toBe(false);
      }
    });

    it('harmonizes raw NASA FIRMS detections end-to-end', () => {
      const { filterStats, cellDays, result } = harmonizeRawDetections(rawCsvDetections);
      expect(filterStats.total_input).toBe(1200);
      expect(filterStats.valid_vegetation).toBe(1140);
      expect(cellDays.length).toBeGreaterThan(0);
      expect(result.monthly_records.length).toBeGreaterThan(0);
      expect(result.validation_metrics).toBeDefined();
    });
  });
});

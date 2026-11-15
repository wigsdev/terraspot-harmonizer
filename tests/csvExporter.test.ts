import { describe, expect, it, vi } from 'vitest';
import {
  CANONICAL_CSV_HEADERS,
  downloadHarmonizedCSV,
  exportHarmonizedCSV,
} from '../src/engine/csvExporter';
import type { RegionCube } from '../src/types';

const mockCube: RegionCube = {
  id: 'PE-HCO',
  name: 'Huánuco & Central Peruvian Andes',
  country: 'Peru',
  bbox: {
    min_lat: -10.6,
    max_lat: -8.4,
    min_lon: -77.1,
    max_lon: -74.4,
  },
  center: [-9.5, -75.75],
  default_zoom: 8,
  description: 'Test AOI',
  typical_fire_regime: 'Tropical Yungas & Inter-Andean Valleys',
  peak_season_months: [8, 9],
  seasonal_beta: { '8': 1.81, '9': 1.95 },
  validation_metrics: {
    r_squared: 0.94,
    pearson_r: 0.97,
    raw_mape_pct: 45.2,
    harmonized_mape_pct: 12.8,
    mape_reduction_pct: 71.6,
  },
  climatology_by_month: {
    '8': { median: 184, p25: 140, p75: 202, iqr: 62, p90: 265 },
  },
  monthly_records: [
    {
      year: 2024,
      month: 8,
      sensor_era: 'DUAL_SENSOR_FUSION',
      raw_modis_count: 215,
      raw_viirs_count: 1340,
      afcd_modis: 178,
      afcd_viirs: 328,
      beta_factor: 1.81,
      harmonized_hotspots: 326,
      climatological_median: 184,
      p25_hotspots: 140,
      p75_hotspots: 202,
      p90_threshold: 265,
      departure_percentage: 77.17,
      robust_z_score: 3.09,
      anomaly_status: 'CRITICAL',
      mean_frp_mw: 48.6,
      p90_frp_mw: 74.2,
      night_fraction: 0.24,
      fire_regime_index: 72.4,
      regime_class: 'SEVERE_WILDFIRE',
    },
    {
      year: 2024,
      month: 3,
      sensor_era: 'DUAL_SENSOR_FUSION',
      raw_modis_count: 12,
      raw_viirs_count: 35,
      afcd_modis: 10,
      afcd_viirs: 18,
      beta_factor: 1.5,
      harmonized_hotspots: 18,
      climatological_median: 25,
      departure_percentage: -28.0,
      robust_z_score: -0.85,
      anomaly_status: 'NORMAL',
      mean_frp_mw: 14.2,
      p90_frp_mw: 22.0,
      night_fraction: 0.05,
      fire_regime_index: 18.0,
      regime_class: 'AGRICULTURAL_BURN',
    },
  ],
};

describe('csvExporter Engine', () => {
  it('defines exactly the 27 canonical CSV headers specified in docs/04', () => {
    expect(CANONICAL_CSV_HEADERS).toHaveLength(27);
    expect(CANONICAL_CSV_HEADERS[0]).toBe('aoi_id');
    expect(CANONICAL_CSV_HEADERS[1]).toBe('aoi_name');
    expect(CANONICAL_CSV_HEADERS[26]).toBe('fire_regime_classification');
  });

  it('generates RFC 4180 compliant CSV string with header and exact rows', () => {
    const csv = exportHarmonizedCSV(mockCube);
    const lines = csv.split('\r\n');

    expect(lines.length).toBe(3); // Header + 2 data rows
    expect(lines[0]).toBe(CANONICAL_CSV_HEADERS.join(','));

    // Check first data row content
    const row1 = lines[1];
    expect(row1).toContain('PE-HCO');
    expect(row1).toContain('"Huánuco & Central Peruvian Andes"');
    expect(row1).toContain('-10.6');
    expect(row1).toContain('-8.4');
    expect(row1).toContain('2024');
    expect(row1).toContain('August');
    expect(row1).toContain('DUAL_SENSOR_FUSION');
    expect(row1).toContain('+77.17%');
    expect(row1).toContain('3.09');
    expect(row1).toContain('CRITICAL');
    expect(row1).toContain('SEVERE_WILDFIRE');
  });

  it('formats negative departure percentages without duplicate signs', () => {
    const csv = exportHarmonizedCSV(mockCube);
    const lines = csv.split('\r\n');
    const row2 = lines[2];

    expect(row2).toContain('March');
    expect(row2).toContain('-28.00%');
    expect(row2).toContain('-0.85');
    expect(row2).toContain('AGRICULTURAL_BURN');
  });

  it('escapes quotes and commas per RFC 4180', () => {
    const complexCube: RegionCube = {
      ...mockCube,
      name: 'Complex, "Quoted" Region',
    };
    const csv = exportHarmonizedCSV(complexCube);
    const lines = csv.split('\r\n');

    expect(lines[1]).toContain('"Complex, ""Quoted"" Region"');
  });

  it('triggers browser file download with blob and revokes object URL', () => {
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-uuid');
    const mockRevokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = mockCreateObjectURL;
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadHarmonizedCSV(mockCube, 'custom_name.csv');

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/test-uuid');

    clickSpy.mockRestore();
  });
});

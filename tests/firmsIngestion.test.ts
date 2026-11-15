import { describe, expect, it } from 'vitest';
import {
  filterVegetationHotspots,
  normalizeFIRMSHeaders,
  parseFIRMSCSV,
} from '../src/engine/firmsIngestion';
import type { RawFIRMSPoint } from '../src/types';

const validCSV = `latitude,longitude,brightness,scan,track,acq_date,acq_time,satellite,instrument,confidence,version,bright_t31,frp,daynight,type
-10.13453,-75.83249,326.3,0.39,0.52,2024-08-18,1605,N,VIIRS,n,2.0NRT,298.1,12.3,D,0
-9.30272,-75.98646,315.6,0.54,0.66,2024-09-19,0610,N20,VIIRS,n,2.0NRT,288.2,56.3,N,0
-9.62314,-75.56372,341.2,2.29,1.79,2024-08-22,0700,Terra,MODIS,94,6.1,288.4,49.3,N,0
-9.50000,-75.50000,310.0,1.00,1.00,2024-08-23,1200,Aqua,MODIS,20,6.1,280.0,5.0,D,0
-9.80000,-75.70000,330.0,0.40,0.40,2024-08-24,1400,N,VIIRS,h,2.0NRT,295.0,20.0,D,2
`;

describe('firmsIngestion Engine (US2)', () => {
  describe('normalizeFIRMSHeaders', () => {
    it('normalizes uppercase and whitespace-padded header names', () => {
      const raw = {
        ' Latitude ': -10.5,
        'LONGITUDE': -75.2,
        'ACQ_DATE': '2024-08-10',
        'FRP': 45.2,
      };
      const normalized = normalizeFIRMSHeaders(raw as Record<string, unknown>);
      expect(normalized.latitude).toBe(-10.5);
      expect(normalized.longitude).toBe(-75.2);
      expect(normalized.acq_date).toBe('2024-08-10');
      expect(normalized.frp).toBe(45.2);
    });
  });

  describe('filterVegetationHotspots (Stage 1 Masking)', () => {
    it('retains only type == 0 and nominal/high confidence vegetation fires', () => {
      const points: RawFIRMSPoint[] = [
        { latitude: -10.1, longitude: -75.8, acq_date: '2024-08-18', confidence: 'n', type: 0 },
        { latitude: -9.3, longitude: -75.9, acq_date: '2024-08-19', confidence: 'h', type: 0 },
        { latitude: -9.6, longitude: -75.5, acq_date: '2024-08-22', confidence: 94, type: 0 },
        { latitude: -9.5, longitude: -75.5, acq_date: '2024-08-23', confidence: 20, type: 0 }, // Low confidence MODIS
        { latitude: -9.8, longitude: -75.7, acq_date: '2024-08-24', confidence: 'h', type: 2 }, // Static flare
        { latitude: -9.9, longitude: -75.6, acq_date: '2024-08-25', confidence: 'l', type: 0 }, // Low confidence VIIRS
      ];

      const { valid, excluded } = filterVegetationHotspots(points);
      expect(valid).toHaveLength(3);
      expect(excluded.nonVegetationType).toBe(1);
      expect(excluded.lowConfidence).toBe(2);
    });
  });

  describe('parseFIRMSCSV', () => {
    it('parses valid CSV string and returns a complete validation report', async () => {
      const { report, points } = await parseFIRMSCSV(validCSV, 'test_huanuco.csv');

      expect(report.isValid).toBe(true);
      expect(report.fileName).toBe('test_huanuco.csv');
      expect(report.totalRows).toBe(5);
      expect(report.validVegetationHotspots).toBe(3);
      expect(report.excludedRows.lowConfidence).toBe(1);
      expect(report.excludedRows.nonVegetationType).toBe(1);
      expect(report.detectedSensors).toEqual(
        expect.arrayContaining(['VIIRS', 'MODIS'])
      );
      expect(report.dateRange.startDate).toBe('2024-08-18');
      expect(report.dateRange.endDate).toBe('2024-09-19');
      expect(points).toHaveLength(3);
    });

    it('flags CSV as invalid if missing mandatory coordinates or date', async () => {
      const invalidCSV = `scan,track,confidence,frp\n1.0,1.0,90,50.0\n`;
      const { report, points } = await parseFIRMSCSV(invalidCSV, 'invalid.csv');

      expect(report.isValid).toBe(false);
      expect(report.errorMessages.length).toBeGreaterThan(0);
      expect(report.errorMessages[0]).toContain('latitude');
      expect(points).toHaveLength(0);
    });

    it('rejects empty or whitespace-only CSV input', async () => {
      const { report, points } = await parseFIRMSCSV('   \n\n  ', 'empty.csv');

      expect(report.isValid).toBe(false);
      expect(report.errorMessages.length).toBeGreaterThan(0);
      expect(points).toHaveLength(0);
    });
  });
});

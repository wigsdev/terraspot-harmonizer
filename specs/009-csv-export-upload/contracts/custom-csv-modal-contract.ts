/**
 * Technical Contract: Custom NASA FIRMS CSV Ingestion & Modal
 * NASA Space Apps Challenge 2026 — TerraSpot Harmonizer
 */

import { RegionCube } from '../../../src/types/cube';
import { FIRMSValidationReport, RawFIRMSPoint } from '../data-model';

export interface CustomCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomCube: (customCube: RegionCube) => void;
  onResetToBenchmark?: () => void;
  isCustomActive?: boolean;
}

export interface FIRMSParserOptions {
  filterVegetationOnly?: boolean;
  minConfidenceModis?: number;
  allowedSensors?: ('MODIS' | 'VIIRS')[];
}

/**
 * Parses raw CSV string or File into validated FIRMS point detections.
 */
export type ParseFIRMSCSVFn = (
  csvData: string | File,
  options?: FIRMSParserOptions
) => Promise<{
  report: FIRMSValidationReport;
  points: RawFIRMSPoint[];
}>;

/**
 * Synthesizes a RegionCube from parsed FIRMS points.
 */
export type SynthesizeCubeFromFIRMSFn = (
  points: RawFIRMSPoint[],
  report: FIRMSValidationReport
) => RegionCube;

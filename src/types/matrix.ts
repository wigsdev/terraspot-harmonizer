/**
 * Burning Activity Calendar Matrix Types and Contracts.
 * Adheres to specs/006-burning-calendar-matrix/spec.md and docs/design-system.md.
 */

import type {
  AnomalyAlertStatus,
  FireRegimeClass,
  SensorEra,
} from './harmonization';
import type { ColorCellStyle, PaletteType } from './palette';
import type { RegionCube } from './region';

export type CalendarMatrixViewMode = 'harmonized' | 'anomaly' | 'frp' | 'raw';

export type SensorObservationEra = SensorEra;

export interface SelectedCellCoordinates {
  year: number;
  month: number;
}

export interface CalendarCellData {
  year: number;
  month: number;
  monthName: string;
  sensorEra: SensorObservationEra;
  harmonizedHotspots: number;
  rawModisHotspots: number;
  rawViirsHotspots: number;
  baselineMedian: number;
  departurePercentage: number;
  robustZScore: number;
  anomalyStatus: AnomalyAlertStatus;
  meanFrpMw: number;
  p90FrpMw: number;
  nightFraction: number;
  fireRegimeClass: FireRegimeClass;
  isFutureMonth: boolean;
  isCriticalAnomaly: boolean;
  formattedValue: string;
  cellStyle: ColorCellStyle;
}

export interface CalendarRowSummary {
  year: number;
  sensorEra: SensorObservationEra;
  totalHarmonized: number;
  peakMonth: number;
  peakHarmonized: number;
  maxDeparture: number;
  relativeBarWidth: number; // 0.0 to 100.0%
}

export interface CalendarColumnSummary {
  month: number;
  monthName: string;
  baselineMedian: number;
  baselineP75: number;
  baselineP90: number;
  historicalMax: number;
  historicalMaxYear: number;
}

export interface BurningCalendarMatrixProps {
  /**
   * Complete spatiotemporal cube of the active benchmark Area of Interest.
   */
  activeCube?: RegionCube;

  /**
   * Initial analytical view projection (defaults to 'harmonized').
   */
  initialViewMode?: CalendarMatrixViewMode;

  /**
   * Active accessible color palette (derived from RegionContext if omitted).
   */
  activePalette?: PaletteType;

  /**
   * Whether to display right-margin annual sums and bottom-margin monthly medians (default: true).
   */
  enableMarginalSummaries?: boolean;

  /**
   * Callback fired when an individual cell is selected via mouse click or Enter/Space key.
   */
  onSelectRecord?: (record: {
    year: number;
    month: number;
    harmonizedHotspots: number;
    departurePercentage: number;
    robustZScore: number;
    meanFrpMw: number;
    nightFraction: number;
  }) => void;

  /**
   * Optional custom styling classes for root card container.
   */
  className?: string;
}

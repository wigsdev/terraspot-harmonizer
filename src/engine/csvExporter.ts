/**
 * NASA Space Apps Challenge 2026 — TerraSpot Harmonizer
 * Standardized 27-Column RFC 4180 CSV Exporter Engine
 * Adheres strictly to docs/04-firms-data-specification.md and Challenge 15 Requirement R7.
 */

import { CANONICAL_CSV_HEADERS, CSVExportOptions } from '../types/csv';
import type { RegionCube } from '../types/region';

export { CANONICAL_CSV_HEADERS };

const ENGLISH_MONTHS: readonly string[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Escapes a cell value according to RFC 4180 rules:
 * - If value contains commas, double quotes, or newlines, enclose in double quotes.
 * - Any internal double quote is escaped by preceding it with another double quote.
 */
export function escapeCSVCell(value: unknown, forceQuote = false): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (
    forceQuote ||
    str.includes(',') ||
    str.includes('"') ||
    str.includes('\n') ||
    str.includes('\r')
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Transforms an active RegionCube into an RFC 4180 compliant CSV string
 * containing exactly the 27 canonical analytical columns.
 */
export function exportHarmonizedCSV(cube: RegionCube, options?: CSVExportOptions): string {
  const lineEnding = options?.lineEnding ?? '\r\n';
  const headerLine = CANONICAL_CSV_HEADERS.join(',');

  const rows = (cube.monthly_records || []).map((record) => {
    const monthName = ENGLISH_MONTHS[(record.month - 1) % 12] ?? `Month-${record.month}`;
    const departure = record.departure_percentage ?? 0;
    const formattedAnomaly =
      departure > 0 ? `+${departure.toFixed(2)}%` : `${departure.toFixed(2)}%`;
    const robustZ = Number((record.robust_z_score ?? 0).toFixed(2));
    const meanFrp = Number((record.mean_frp_mw ?? 0).toFixed(1));
    const p90Frp = Number((record.p90_frp_mw ?? 0).toFixed(1));
    const nightFrac = Number((record.night_fraction ?? 0).toFixed(2));
    const regimeIdx = Number((record.fire_regime_index ?? 0).toFixed(1));

    const cells: (string | number)[] = [
      cube.id,
      escapeCSVCell(cube.name, true),
      cube.bbox.min_lat,
      cube.bbox.max_lat,
      cube.bbox.min_lon,
      cube.bbox.max_lon,
      record.year,
      record.month,
      monthName,
      record.sensor_era ?? (record.year >= 2026 ? 'VIIRS_CONTINUITY' : 'DUAL_SENSOR_FUSION'),
      record.raw_modis_count,
      record.raw_viirs_count,
      record.afcd_modis,
      record.afcd_viirs,
      Number((record.beta_factor ?? 1.8).toFixed(2)),
      record.harmonized_hotspots,
      record.climatological_median,
      (record.p75_hotspots ?? 0) - (record.p25_hotspots ?? 0),
      record.p90_threshold ?? 0,
      formattedAnomaly,
      robustZ,
      record.anomaly_status ?? 'NORMAL',
      meanFrp,
      p90Frp,
      nightFrac,
      regimeIdx,
      record.regime_class,
    ];

    return cells.join(',');
  });

  return [headerLine, ...rows].join(lineEnding);
}

/**
 * Triggers an in-browser automatic file download of the standardized CSV dataset.
 */
export function downloadHarmonizedCSV(cube: RegionCube, customFilename?: string): void {
  const csvContent = exportHarmonizedCSV(cube);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = customFilename || `terraspot_harmonized_${cube.id}_${dateStr}.csv`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

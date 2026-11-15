/**
 * TerraSpot Harmonizer - Interactive Burning Activity Calendar Matrix
 * Adheres to specs/006-burning-calendar-matrix/spec.md (Requirements FR-001 through FR-010).
 */

import React, { useCallback, useId, useMemo, useState } from "react";
import { Activity, Flame, Info, Layers, Percent } from "lucide-react";
import { useLanguage, useRegion } from "../context";
import {
  computeColumnSummaries,
  computeRowSummaries,
  generateMatrixGrid,
  MATRIX_END_YEAR,
  MATRIX_START_YEAR,
} from "../engine/calendarMatrix";
import type {
  BurningCalendarMatrixProps,
  CalendarCellData,
  CalendarMatrixViewMode,
  SelectedCellCoordinates,
} from "../types";

export const BurningCalendarMatrix: React.FC<BurningCalendarMatrixProps> = ({
  activeCube: propCube,
  initialViewMode = "harmonized",
  activePalette: propPalette,
  enableMarginalSummaries = true,
  onSelectRecord,
  className = "",
}) => {
  const { currentRegion: contextCube, activePalette: contextPalette } =
    useRegion();
  const { t } = useLanguage();

  const cube = propCube ?? contextCube;
  const palette = propPalette ?? contextPalette;

  const [viewMode, setViewMode] =
    useState<CalendarMatrixViewMode>(initialViewMode);
  const [selectedCell, setSelectedCell] =
    useState<SelectedCellCoordinates | null>(null);
  const [hoveredCell, setHoveredCell] = useState<CalendarCellData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const gridId = useId();

  // Compute 27 x 12 grid cells
  const grid = useMemo(
    () => generateMatrixGrid(cube, viewMode, palette, t.monthNamesShort),
    [cube, viewMode, palette, t.monthNamesShort],
  );

  // Compute marginal row summaries (annual sums and relative bar widths)
  const rowSummaries = useMemo(() => computeRowSummaries(grid), [grid]);

  // Compute marginal column summaries (monthly baseline medians)
  const columnSummaries = useMemo(
    () =>
      computeColumnSummaries(
        grid,
        t.monthNamesShort,
        cube?.climatology_by_month,
      ),
    [grid, t.monthNamesShort, cube],
  );

  // Handle cell click / selection
  const handleCellSelect = useCallback(
    (cell: CalendarCellData) => {
      if (cell.isFutureMonth) return;

      setSelectedCell({ year: cell.year, month: cell.month });

      if (onSelectRecord) {
        onSelectRecord({
          year: cell.year,
          month: cell.month,
          harmonizedHotspots: cell.harmonizedHotspots,
          departurePercentage: cell.departurePercentage,
          robustZScore: cell.robustZScore,
          meanFrpMw: cell.meanFrpMw,
          nightFraction: cell.nightFraction,
        });
      }
    },
    [onSelectRecord],
  );

  // Keyboard navigation handler adhering to WAI-ARIA grid design pattern
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, y: number, m: number) => {
      let nextYear = y;
      let nextMonth = m;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          if (m < 12) nextMonth = m + 1;
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (m > 1) nextMonth = m - 1;
          break;
        case "ArrowDown":
          e.preventDefault();
          if (y < MATRIX_END_YEAR) nextYear = y + 1;
          break;
        case "ArrowUp":
          e.preventDefault();
          if (y > MATRIX_START_YEAR) nextYear = y - 1;
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          const targetCell = grid[y - MATRIX_START_YEAR]?.[m - 1];
          if (targetCell) handleCellSelect(targetCell);
          return;
        }
        default:
          return;
      }

      const nextTargetId = `cell-${nextYear}-${nextMonth}`;
      const el = document.querySelector<HTMLButtonElement>(
        `[data-testid="${nextTargetId}"]`,
      );
      if (el) el.focus();
    },
    [grid, handleCellSelect],
  );

  return (
    <section
      data-testid="burning-calendar-matrix"
      aria-labelledby={`${gridId}-title`}
      className={`relative w-full rounded-2xl border border-slate-800 bg-space-950 p-4 sm:p-6 shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* ── Header & Projection Toolbar ───────────────────────────────────── */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between pb-6 border-b border-slate-800/80">
        <div className="min-w-0">
          <div className="flex items-start gap-2.5">
            <Flame className="h-6 w-6 text-amber-500 animate-pulse shrink-0 self-start mt-0.5" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id={`${gridId}-title`}
                  className="text-lg sm:text-xl font-bold tracking-tight text-slate-100"
                >
                  {t.matrix.title}
                </h2>
                <span className="inline-flex items-center whitespace-nowrap rounded-full border border-cyan-500/30 bg-cyan-950/50 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 shadow-sm">
                  27 Years • 322 Months
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl xl:max-w-2xl leading-relaxed">
                {t.matrix.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toolbar - 2x2 grid on mobile/tablet, 4-cols on 1024px desktop, horizontal on wide desktop */}
        <div
          role="group"
          aria-label={t.matrix.aria.viewModeGroup}
          className="grid grid-cols-2 lg:grid-cols-4 xl:flex xl:flex-row xl:items-center gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/90 p-1.5 w-full xl:w-auto shadow-inner"
        >
          <button
            type="button"
            data-testid="mode-btn-harmonized"
            data-active={viewMode === "harmonized"}
            onClick={() => setViewMode("harmonized")}
            title={t.matrix.modes.harmonizedTooltip}
            className={`flex items-center justify-center sm:justify-start gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all select-none min-h-10.5 ${
              viewMode === "harmonized"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white bg-slate-950/40 border border-slate-800/60"
            }`}
          >
            <Flame className="h-3.5 w-3.5 shrink-0" />
            <span className="text-2xs sm:text-xs font-semibold leading-tight text-center sm:text-left lg:whitespace-nowrap">
              {t.matrix.modes.harmonized}
            </span>
          </button>

          <button
            type="button"
            data-testid="mode-btn-anomaly"
            data-active={viewMode === "anomaly"}
            onClick={() => setViewMode("anomaly")}
            title={t.matrix.modes.anomalyTooltip}
            className={`flex items-center justify-center sm:justify-start gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all select-none min-h-10.5 ${
              viewMode === "anomaly"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white bg-slate-950/40 border border-slate-800/60"
            }`}
          >
            <Percent className="h-3.5 w-3.5 shrink-0" />
            <span className="text-2xs sm:text-xs font-semibold leading-tight text-center sm:text-left lg:whitespace-nowrap">
              {t.matrix.modes.anomaly}
            </span>
          </button>

          <button
            type="button"
            data-testid="mode-btn-frp"
            data-active={viewMode === "frp"}
            onClick={() => setViewMode("frp")}
            title={t.matrix.modes.frpTooltip}
            className={`flex items-center justify-center sm:justify-start gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all select-none min-h-10.5 ${
              viewMode === "frp"
                ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white bg-slate-950/40 border border-slate-800/60"
            }`}
          >
            <Activity className="h-3.5 w-3.5 shrink-0" />
            <span className="text-2xs sm:text-xs font-semibold leading-tight text-center sm:text-left lg:whitespace-nowrap">
              {t.matrix.modes.frp}
            </span>
          </button>

          <button
            type="button"
            data-testid="mode-btn-raw"
            data-active={viewMode === "raw"}
            onClick={() => setViewMode("raw")}
            title={t.matrix.modes.rawTooltip}
            className={`flex items-center justify-center sm:justify-start gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all select-none min-h-10.5 ${
              viewMode === "raw"
                ? "bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20"
                : "text-slate-300 hover:bg-slate-800/80 hover:text-white bg-slate-950/40 border border-slate-800/60"
            }`}
          >
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span className="text-2xs sm:text-xs font-semibold leading-tight text-center sm:text-left lg:whitespace-nowrap">
              {t.matrix.modes.raw}
            </span>
          </button>
        </div>
      </div>

      {/* ── Raw Step-Jump Notice Banner ───────────────────────────────────── */}
      {viewMode === "raw" && (
        <div
          data-testid="step-jump-notice"
          className="mt-4 flex items-start gap-3 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3.5 text-xs text-indigo-200"
        >
          <Info className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
          <p>{t.matrix.stepJumpNotice}</p>
        </div>
      )}

      {/* ── Mobile Scroll Hint (Visible only on < lg viewports) ─────────────── */}
      <div className="flex items-center justify-between text-2xs text-slate-400 lg:hidden mt-4 px-1">
        <span className="inline-flex items-center gap-1.5 text-cyan-400/90 font-medium">
          <span className="inline-block animate-pulse">↔</span>{" "}
          {t.matrix.marginalLabels.scrollHint}
        </span>
      </div>

      {/* ── Matrix Heatmap Table Grid ─────────────────────────────────────── */}
      <div className="relative mt-3 overflow-x-auto pb-4">
        <div
          role="grid"
          aria-label={t.matrix.aria.gridLabel}
          className="min-w-225 inline-block w-full select-none"
        >
          {/* Header Row: Month Names */}
          <div
            role="row"
            className="flex items-center gap-1 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-400"
          >
            {/* Sticky Era & Year Label Header */}
            <div className="sticky left-0 z-20 flex items-center gap-1.5 bg-space-950 pl-2.5 pr-2.5 border-r border-slate-800/90 shadow-[4px_0_12px_rgba(0,0,0,0.6)]">
              <div className="w-16 sm:w-20 shrink-0 text-center text-2xs uppercase tracking-wider text-slate-500 font-bold">
                Era
              </div>
              <div className="w-12 shrink-0 text-center font-mono text-2xs uppercase tracking-wider text-slate-500 font-bold">
                Year
              </div>
            </div>

            {/* 12 Month Headers */}
            <div className="flex-1 grid grid-cols-12 gap-1 text-center pl-1">
              {t.monthNamesShort.map((monthName, idx) => (
                <div
                  key={`month-${idx + 1}`}
                  data-testid={`month-col-header-${idx + 1}`}
                  role="columnheader"
                  className="py-1 tracking-wider uppercase text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {monthName}
                </div>
              ))}
            </div>
            {/* Marginal Annual Summary Header */}
            {enableMarginalSummaries && (
              <div
                data-testid="margin-header-annual"
                role="columnheader"
                className="w-32 shrink-0 text-right pr-2 tracking-wider text-slate-400 uppercase text-2xs"
              >
                {t.matrix.marginalLabels.annualSum}
              </div>
            )}
          </div>

          {/* Grid Rows: 2000 through 2026 */}
          <div className="flex flex-col gap-1 pt-2">
            {grid.map((rowCells, rIdx) => {
              const year = MATRIX_START_YEAR + rIdx;
              const rowSummary = rowSummaries[rIdx];

              // Determine era bracket boundaries
              const isModisSoloStart = year === 2000;
              const isDualFusionStart = year === 2012;
              const isViirsStart = year === 2026;

              return (
                <div
                  key={`row-${year}`}
                  role="row"
                  className="group flex items-center gap-1 rounded-md hover:bg-slate-900/50 transition-colors py-0.5"
                >
                  {/* Sticky Era & Year Labels */}
                  <div className="sticky left-0 z-20 flex items-center gap-1.5 bg-space-950 pl-2.5 pr-2.5 border-r border-slate-800/90 shadow-[4px_0_12px_rgba(0,0,0,0.6)]">
                    {/* Vertical Era Label / Indicators with timeline track */}
                    <div className="w-16 sm:w-20 shrink-0 flex items-center justify-center relative h-7">
                      {isModisSoloStart ? (
                        <span
                          data-testid="era-bracket-MODIS_SOLO"
                          title="MODIS Solo Observation Era (2000–2011) — 1km native resolution baseline"
                          className="w-13 sm:w-14.5 h-5 inline-flex items-center justify-center rounded border border-amber-500/60 bg-amber-950/80 text-[9px] font-bold text-amber-300 uppercase tracking-wider shadow-sm z-10 select-none cursor-help"
                        >
                          MODIS
                        </span>
                      ) : isDualFusionStart ? (
                        <span
                          data-testid="era-bracket-DUAL_SENSOR_FUSION"
                          title="Dual-Sensor Fusion Era (2012–2025) — Harmonized MODIS C6.1 + VIIRS C2 cross-calibration"
                          className="w-13 sm:w-14.5 h-5 inline-flex items-center justify-center rounded border border-cyan-500/60 bg-cyan-950/80 text-[9px] font-bold text-cyan-300 uppercase tracking-wider shadow-sm z-10 select-none cursor-help"
                        >
                          FUSION
                        </span>
                      ) : isViirsStart ? (
                        <span
                          data-testid="era-bracket-VIIRS_CONTINUITY"
                          title="VIIRS Continuity Era (2026+) — VIIRS 375m operational baseline"
                          className="w-13 sm:w-14.5 h-5 inline-flex items-center justify-center rounded border border-indigo-500/60 bg-indigo-950/80 text-[9px] font-bold text-indigo-300 uppercase tracking-wider shadow-sm z-10 select-none cursor-help"
                        >
                          VIIRS
                        </span>
                      ) : (
                        <div
                          className={`h-full w-0.5 rounded-full ${
                            year <= 2011
                              ? "bg-amber-500/30"
                              : year <= 2025
                                ? "bg-cyan-500/30"
                                : "bg-indigo-500/30"
                          }`}
                        />
                      )}
                    </div>

                    {/* Year Label */}
                    <div
                      data-testid={`year-label-${year}`}
                      role="rowheader"
                      className="w-12 shrink-0 text-center font-mono text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors"
                    >
                      {year}
                    </div>
                  </div>

                  {/* 12 Monthly Heatmap Cells */}
                  <div className="flex-1 grid grid-cols-12 gap-1 pl-1">
                    {rowCells.map((cell) => {
                      const isSelected =
                        selectedCell?.year === cell.year &&
                        selectedCell?.month === cell.month;

                      const isFuture = cell.isFutureMonth;

                      return (
                        <button
                          key={`cell-${cell.year}-${cell.month}`}
                          type="button"
                          role="gridcell"
                          tabIndex={0}
                          data-testid={`cell-${cell.year}-${cell.month}`}
                          data-future={isFuture ? "true" : "false"}
                          data-selected={isSelected ? "true" : "false"}
                          data-active={isSelected ? "true" : "false"}
                          aria-selected={isSelected}
                          aria-label={`${cell.monthName} ${cell.year}: ${cell.formattedValue}`}
                          onClick={() => handleCellSelect(cell)}
                          onKeyDown={(e) =>
                            handleKeyDown(e, cell.year, cell.month)
                          }
                          onMouseEnter={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setTooltipPos({
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                            setHoveredCell(cell);
                          }}
                          onMouseLeave={() => {
                            setHoveredCell(null);
                          }}
                          onFocus={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setTooltipPos({
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                            setHoveredCell(cell);
                          }}
                          onBlur={() => {
                            setHoveredCell(null);
                          }}
                          style={{
                            backgroundColor: isFuture
                              ? undefined
                              : cell.cellStyle.backgroundHex,
                            color: isFuture
                              ? "#94A3B8"
                              : cell.cellStyle.textHex,
                          }}
                          className={`relative flex h-7 items-center justify-center rounded-sm font-mono text-2xs font-semibold tracking-tight transition-all duration-150 ${
                            isFuture
                              ? "bg-slate-800/60 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.05)_4px,rgba(255,255,255,0.05)_8px)] cursor-not-allowed opacity-60"
                              : "hover:scale-105 hover:z-20 hover:shadow-lg cursor-pointer"
                          } ${
                            isSelected
                              ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-space-950 z-30 scale-105"
                              : "border border-black/10"
                          }`}
                        >
                          <span>{cell.formattedValue}</span>

                          {/* Critical Anomaly Alert Indicator Badge */}
                          {cell.isCriticalAnomaly && viewMode === "anomaly" && (
                            <span
                              data-testid="critical-anomaly-badge"
                              title={t.matrix.legend.criticalAnomalyBadge}
                              className="absolute -top-1 -right-1 flex h-2 w-2"
                            >
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Marginal Annual Summary Column (Right) */}
                  {enableMarginalSummaries && (
                    <div
                      data-testid={`annual-sum-${year}`}
                      className="w-32 shrink-0 pl-2 pr-1 flex flex-col justify-center"
                    >
                      <div className="flex items-center justify-between text-2xs font-mono text-slate-300">
                        <span className="font-semibold">
                          {rowSummary?.totalHarmonized.toLocaleString()}
                        </span>
                        <span className="text-3xs text-slate-500">
                          {rowSummary?.peakMonth
                            ? t.monthNamesShort[rowSummary.peakMonth - 1]
                            : ""}
                        </span>
                      </div>
                      {/* Proportional Mini-Bar */}
                      <div className="h-1.5 w-full rounded-full bg-slate-800/80 overflow-hidden mt-0.5">
                        <div
                          style={{
                            width: `${rowSummary?.relativeBarWidth ?? 0}%`,
                          }}
                          className="h-full rounded-full bg-amber-500 transition-all duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Bottom Marginal Summary Row: Monthly Baseline Medians ───────── */}
          {enableMarginalSummaries && (
            <div
              role="row"
              className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1 text-xs"
            >
              {/* Sticky bottom corner for Med label */}
              <div className="sticky left-0 z-20 flex items-center gap-1.5 bg-space-950 pl-2.5 pr-2.5 border-r border-slate-800/90 shadow-[4px_0_12px_rgba(0,0,0,0.6)]">
                <div className="w-16 sm:w-20 shrink-0" />
                <div
                  data-testid="margin-header-monthly-median"
                  className="w-12 shrink-0 text-center font-mono text-2xs uppercase tracking-wider text-slate-400 font-bold"
                  title={t.matrix.marginalLabels.monthlyMedian}
                  aria-label={t.matrix.marginalLabels.monthlyMedian}
                >
                  <span className="sr-only">
                    {t.matrix.marginalLabels.monthlyMedian}
                  </span>
                  <span aria-hidden="true">Med</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-12 gap-1 pl-1">
                {columnSummaries.map((col) => (
                  <div
                    key={`median-col-${col.month}`}
                    data-testid={`monthly-median-col-${col.month}`}
                    className="flex flex-col items-center justify-center py-1 rounded bg-slate-900/60 border border-slate-800 font-mono text-2xs text-slate-300"
                  >
                    <span className="font-semibold">
                      {col.baselineMedian.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="w-32 shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Aerospace Dark Telemetry Tooltip ─────────────────────── */}
      {hoveredCell && tooltipPos && !hoveredCell.isFutureMonth && (
        <div
          data-testid="matrix-tooltip"
          role="tooltip"
          style={{
            left: `${Math.max(120, Math.min(typeof window !== "undefined" ? window.innerWidth - 120 : 300, tooltipPos.x))}px`,
            top: `${tooltipPos.y < 220 ? tooltipPos.y + 24 : tooltipPos.y - 12}px`,
            transform: tooltipPos.y < 220 ? "translate(-50%, 0)" : "translate(-50%, -100%)",
          }}
          className="fixed z-50 pointer-events-none min-w-56 max-w-[calc(100vw-24px)] rounded-xl border border-slate-700 bg-space-950/95 p-3.5 shadow-2xl backdrop-blur-md transition-opacity duration-150 animate-in fade-in zoom-in-95"
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-sm font-bold text-slate-100">
              {hoveredCell.monthName} {hoveredCell.year}
            </span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-3xs font-semibold uppercase text-cyan-400">
              {hoveredCell.sensorEra.replace(/_/g, " ")}
            </span>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">
                {t.matrix.tooltip.harmonizedCount}:
              </span>
              <span className="font-mono font-bold text-amber-400">
                {hoveredCell.harmonizedHotspots.toLocaleString()} AFCD
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">
                {t.matrix.tooltip.baselineMedian}:
              </span>
              <span className="font-mono text-slate-300">
                {hoveredCell.baselineMedian.toLocaleString()} AFCD
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">
                {t.matrix.tooltip.departure}:
              </span>
              <span
                className={`font-mono font-semibold ${
                  hoveredCell.departurePercentage >= 0
                    ? "text-rose-400"
                    : "text-blue-400"
                }`}
              >
                {hoveredCell.departurePercentage >= 0 ? "+" : ""}
                {hoveredCell.departurePercentage.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">
                {t.matrix.tooltip.robustZ}:
              </span>
              <span className="font-mono text-slate-300">
                Z = {hoveredCell.robustZScore.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">
                {t.matrix.tooltip.meanFrp}:
              </span>
              <span className="font-mono text-amber-300">
                {hoveredCell.meanFrpMw.toFixed(1)} MW
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">
                {t.matrix.tooltip.nightFraction}:
              </span>
              <span className="font-mono text-indigo-300">
                {(hoveredCell.nightFraction * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300 border-t border-slate-800/60 pt-1.5 mt-1">
              <span className="text-slate-400">
                {t.matrix.tooltip.rawModis}:
              </span>
              <span className="font-mono text-slate-400">
                {hoveredCell.rawModisHotspots.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">
                {t.matrix.tooltip.rawViirs}:
              </span>
              <span className="font-mono text-slate-400">
                {hoveredCell.rawViirsHotspots.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

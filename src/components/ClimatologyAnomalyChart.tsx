/**
 * ClimatologyAnomalyChart Component
 * Visualizes 12-month active fire trajectory vs 2001-2025 non-parametric median,
 * shaded IQR normal envelope, and P90 critical disaster alert threshold.
 * Complies with specs/007-climatology-sensor-audit/ (User Story 1 - P1 MVP)
 */

import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Calendar, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { useLanguage, useRegion } from '../context';
import { generateClimatologyCurveData } from '../engine';
import type { ClimatologyAnomalyChartProps, ClimatologyCurvePoint } from '../types';

export const ClimatologyAnomalyChart: React.FC<ClimatologyAnomalyChartProps> = ({
  activeCube: propCube,
  selectedYear: propSelectedYear,
  onYearChange,
  className = '',
}) => {
  const { t, language } = useLanguage();
  const { currentRegion: contextCube } = useRegion();

  const cube = propCube !== undefined ? propCube : contextCube;

  // Uncontrolled year fallback if not supplied via props
  const [internalYear, setInternalYear] = useState<number>(2024);
  const activeYear = propSelectedYear !== undefined ? propSelectedYear : internalYear;

  // Generate 2000-2026 years descending
  const availableYears = useMemo(() => {
    const years: number[] = [];
    for (let y = 2026; y >= 2000; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Compute 12-month curve points
  const chartData = useMemo(() => {
    return generateClimatologyCurveData(cube, activeYear, t.monthNamesShort);
  }, [cube, activeYear, t.monthNamesShort]);

  const handleYearSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    setInternalYear(newYear);
    onYearChange?.(newYear);
  };

  // Custom active trajectory dot colored according to anomaly severity
  const renderTrajectoryDot = (props: any): React.ReactElement<SVGElement> => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || !payload || payload.activeYearValue == null) {
      return <g key={payload?.month ? `dot-empty-${payload.month}` : undefined} />;
    }

    let fillColor = '#38BDF8'; // Normal: Cyan
    if (payload.isCritical) {
      fillColor = '#EF4444'; // Critical: Crimson
    } else if (payload.departurePercentage != null && payload.departurePercentage > 25) {
      fillColor = '#F59E0B'; // Elevated: Amber
    }

    return (
      <circle
        key={`dot-${payload.month}`}
        cx={cx}
        cy={cy}
        r={4.5}
        fill={fillColor}
        stroke="#0B0F17"
        strokeWidth={2}
        className="transition-transform duration-150 hover:scale-125"
      />
    );
  };

  // Custom Dark Aerospace Telemetry Tooltip
  const renderCustomTooltip = (props: {
    active?: boolean;
    payload?: Array<{ payload?: ClimatologyCurvePoint }>;
  }) => {
    const { active, payload } = props;
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div
        data-testid="climatology-tooltip"
        className="rounded-lg border border-slate-700/80 bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md text-xs z-50 min-w-60"
      >
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2">
          <span className="font-semibold text-slate-200 text-sm">
            {data.monthName} ({activeYear})
          </span>
          {data.isFuture ? (
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-700">
              {t.climatology.alerts.pending}
            </span>
          ) : data.isCritical ? (
            <span className="rounded bg-red-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-red-400 border border-red-800/80 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-red-400 inline" />
              {t.climatology.alerts.critical}
            </span>
          ) : data.departurePercentage != null && data.departurePercentage > 25 ? (
            <span className="rounded bg-amber-950/80 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-800/80">
              {t.climatology.alerts.elevated}
            </span>
          ) : (
            <span className="rounded bg-sky-950/80 px-1.5 py-0.5 text-[10px] font-medium text-sky-400 border border-sky-800/80">
              {t.climatology.alerts.normal}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t.climatology.tooltip.observed}:</span>
            <span className="font-mono font-bold text-slate-100">
              {data.isFuture ? (
                <span className="text-slate-500 italic">{t.climatology.tooltip.futurePending}</span>
              ) : (
                `${data.activeYearValue ?? 0} AFCD`
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t.climatology.tooltip.baseline}:</span>
            <span className="font-mono text-sky-400 font-medium">
              {data.baselineMedian} AFCD
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t.climatology.tooltip.iqr}:</span>
            <span className="font-mono text-slate-300">
              [{data.baselineP25} – {data.baselineP75}]
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t.climatology.tooltip.departure}:</span>
            <span
              className={`font-mono font-semibold ${
                data.departurePercentage == null
                  ? 'text-slate-500'
                  : data.departurePercentage > 0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              }`}
            >
              {data.departurePercentage != null
                ? `${data.departurePercentage > 0 ? '+' : ''}${data.departurePercentage.toFixed(1)}%`
                : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t.climatology.tooltip.zScore}:</span>
            <span className="font-mono text-slate-300">
              {data.robustZScore != null ? data.robustZScore.toFixed(2) : '—'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      data-testid="climatology-anomaly-chart"
      aria-label={t.climatology.title}
      className={`rounded-xl border border-slate-800 bg-[#0B0F17]/90 p-4 md:p-6 shadow-2xl backdrop-blur-sm ${className}`}
    >
      {/* Header and Year Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-800/80 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
                {t.climatology.title}
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-cyan-950/60 text-cyan-400 border border-cyan-800/60">
                  {activeYear}
                </span>
              </h3>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                {t.climatology.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Year Selector Control */}
        <div className="flex items-center gap-3 self-start lg:self-auto">
          <label
            htmlFor="climatology-year-select"
            className="text-xs font-medium text-slate-400 flex items-center gap-1.5 whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {t.climatology.activeYearLabel}:
          </label>
          <select
            id="climatology-year-select"
            data-testid="climatology-year-select"
            aria-label={t.climatology.yearSelectAria}
            value={activeYear}
            onChange={handleYearSelect}
            className="rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs md:text-sm font-semibold text-slate-200 shadow-inner focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer min-w-28"
          >
            {availableYears.map((year) => (
              <option key={year} value={year} className="bg-slate-900 text-slate-200">
                {year} {year === 2026 ? `(${language === 'es' ? 'Parcial' : 'Partial'})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Accessible Interactive Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 text-xs">
        <div
          data-testid="legend-baseline-median"
          className="flex items-center gap-1.5 text-slate-300"
        >
          <span className="w-4 h-0.5 bg-[#38BDF8] inline-block rounded" />
          <span>{t.climatology.baselineMedian}</span>
        </div>

        <div
          data-testid="legend-iqr-envelope"
          className="flex items-center gap-1.5 text-slate-300"
        >
          <span className="w-4 h-2.5 bg-[#38BDF8]/20 border border-[#38BDF8]/40 inline-block rounded-sm" />
          <span>{t.climatology.iqrEnvelope}</span>
        </div>

        <div
          data-testid="legend-p90-threshold"
          className="flex items-center gap-1.5 text-slate-300"
        >
          <span className="w-4 h-0.5 border-t border-dashed border-[#F59E0B] inline-block" />
          <span>{t.climatology.p90Threshold}</span>
        </div>

        <div
          data-testid="legend-active-trajectory"
          className="flex items-center gap-1.5 text-slate-300"
        >
          <span className="w-4 h-0.5 bg-[#F97316] inline-block rounded relative">
            <span className="absolute -top-1 left-1 w-2.5 h-2.5 rounded-full bg-[#F97316] border border-[#0B0F17]" />
          </span>
          <span className="font-medium text-orange-400">
            {t.climatology.anomalyTrajectory} ({activeYear})
          </span>
        </div>
      </div>

      {/* Recharts Chart Container */}
      <div className="w-full h-80 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={280}>
          <ComposedChart
            data={chartData}
            margin={{ top: 12, right: 16, left: 4, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1E293B"
              vertical={false}
            />
            <XAxis
              dataKey="monthName"
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748B"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickLine={{ stroke: '#334155' }}
              label={{
                value: 'AFCD',
                angle: -90,
                position: 'insideLeft',
                fill: '#64748B',
                fontSize: 11,
                offset: 8,
              }}
            />
            <Tooltip content={renderCustomTooltip} />

            {/* Shaded Interquartile Range Envelope Area [P25, P75] */}
            <Area
              type="monotone"
              dataKey="iqrRange"
              stroke="transparent"
              fill="#38BDF8"
              fillOpacity={0.16}
              isAnimationActive={false}
            />

            {/* Climatological Median Curve (Mm) */}
            <Line
              type="monotone"
              dataKey="baselineMedian"
              stroke="#38BDF8"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

            {/* Critical P90 Disaster Threshold (Dashed) */}
            <Line
              type="monotone"
              dataKey="baselineP90"
              stroke="#F59E0B"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />

            {/* Active Year Observation Trajectory with Anomaly Dots */}
            <Line
              type="monotone"
              dataKey="activeYearValue"
              stroke="#F97316"
              strokeWidth={2.5}
              connectNulls={false}
              dot={renderTrajectoryDot}
              activeDot={{ r: 6, fill: '#F97316', stroke: '#FFFFFF', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info Notice */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          {language === 'es'
            ? 'Línea base no paramétrica (2001–2025). Puntos naranjas indican trayectoria anual; anomalías críticas marcadas en rojo cuando superan P90.'
            : 'Non-parametric climatological baseline (2001–2025). Orange points indicate active year; critical anomalies highlighted in crimson when exceeding P90.'}
        </span>
      </div>
    </section>
  );
};

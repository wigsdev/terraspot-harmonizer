import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import {
  Flame,
  Wheat,
  AlertTriangle,
  ShieldAlert,
  Compass,
  Sprout,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { useLanguage, useRegion } from '../context';
import type { RegionCube } from '../types/region';
import type { FireRegimePoint } from '../types/regime';
import type { BilingualDictionary } from '../types/language';
import {
  generateFireRegimeScatterData,
  computeFireRegimeDistribution,
  generateOperationalMitigation
} from '../engine/fireRegime';

export interface FireRegimePanelProps {
  /**
   * Data cube for active AOI.
   */
  activeCube?: RegionCube | null;
  cube?: RegionCube | null;

  /**
   * Selected year in dashboard (2000 - 2026).
   */
  selectedYear?: number;

  /**
   * Callback on selecting an observation.
   */
  onSelectObservation?: (year: number, month: number) => void;

  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: FireRegimePoint }>;
  t: BilingualDictionary;
}

const CustomRegimeTooltip: React.FC<CustomTooltipProps> = ({ active, payload, t }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  const regimeBadgeColor =
    point.regime_class === 'SEVERE_WILDFIRE'
      ? 'border-red-500/50 bg-red-950/60 text-red-300'
      : point.regime_class === 'TRANSITIONAL'
      ? 'border-amber-500/50 bg-amber-950/60 text-amber-300'
      : 'border-emerald-500/50 bg-emerald-950/60 text-emerald-300';

  const regimeName =
    point.regime_class === 'SEVERE_WILDFIRE'
      ? t.fireRegime.quadrants.severeWildfire
      : point.regime_class === 'TRANSITIONAL'
      ? t.fireRegime.quadrants.transitional
      : t.fireRegime.quadrants.agricultural;

  return (
    <div
      data-testid="regime-telemetry-tooltip"
      className="rounded-lg border border-slate-700 bg-space-950/95 p-3.5 shadow-2xl backdrop-blur-md text-xs font-mono max-w-xs z-50 text-slate-200"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
        <span className="font-semibold text-slate-100 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          {point.year} — {point.monthName} (M{point.month})
        </span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${regimeBadgeColor}`}>
          {point.regime_class === 'SEVERE_WILDFIRE' ? '🔥 SEVERE' : point.regime_class === 'TRANSITIONAL' ? '⚠️ MIXED' : '🌾 AGRI'}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">{t.fireRegime.tooltip.regime}:</span>
          <span className="font-medium text-slate-200 text-right truncate max-w-35">{regimeName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">{t.fireRegime.tooltip.meanFrp}:</span>
          <span className="font-semibold text-amber-400">{point.mean_frp_mw.toFixed(1)} MW</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">{t.fireRegime.tooltip.p90Frp}:</span>
          <span className="text-slate-300">{point.p90_frp_mw.toFixed(1)} MW</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">{t.fireRegime.tooltip.nightFraction}:</span>
          <span className="font-semibold text-cyan-400">{(point.night_fraction * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">{t.fireRegime.tooltip.hotspots}:</span>
          <span className="text-slate-200">{point.z.toLocaleString()} AFCD</span>
        </div>
        <div className="flex justify-between items-center border-t border-slate-800 pt-1 mt-1">
          <span className="text-slate-400 font-bold">{t.fireRegime.tooltip.regimeIndex}:</span>
          <span className="font-bold text-emerald-400">{point.fire_regime_index.toFixed(1)} / 100</span>
        </div>
      </div>
    </div>
  );
};

export const FireRegimePanel: React.FC<FireRegimePanelProps> = ({
  activeCube,
  cube,
  selectedYear = 2024,
  onSelectObservation,
  className = ''
}) => {
  const { t, language } = useLanguage();
  const { currentRegion: contextCube } = useRegion();
  const effectiveCube = activeCube !== undefined ? activeCube : (cube !== undefined ? cube : contextCube);

  const records = useMemo(() => effectiveCube?.monthly_records ?? [], [effectiveCube]);

  // Transform scatter data
  const scatterData = useMemo(() => {
    return generateFireRegimeScatterData(records, selectedYear, language);
  }, [records, selectedYear, language]);

  // Compute distribution breakdown
  const distribution = useMemo(() => {
    return computeFireRegimeDistribution(records);
  }, [records]);

  // Generate operational mitigation guidance
  const mitigation = useMemo(() => {
    return generateOperationalMitigation(records, selectedYear, language);
  }, [records, selectedYear, language]);

  if (!effectiveCube) {
    return (
      <div
        data-testid="fire-regime-panel-loading"
        className="rounded-xl border border-slate-800 bg-space-950 p-8 text-center text-slate-400"
      >
        <Activity className="mx-auto mb-3 h-8 w-8 animate-pulse text-cyan-500" />
        <p className="font-medium text-slate-300">Loading Fire Regime Diagnostics...</p>
      </div>
    );
  }

  // Domain max bounds for axes
  const xDomainMax = Math.max(100, Math.ceil(scatterData.maxFrp / 10) * 10);
  const yDomainMax = Math.max(0.40, Math.min(1.0, Math.ceil(scatterData.maxNightFraction * 10) / 10));

  const postureBadgeColor =
    mitigation.postureLevel === 'EMERGENCY'
      ? 'border-red-500/40 bg-red-950/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
      : mitigation.postureLevel === 'WARNING'
      ? 'border-amber-500/40 bg-amber-950/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
      : 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]';

  const postureIcon =
    mitigation.postureLevel === 'EMERGENCY' ? (
      <Flame className="w-4 h-4 text-red-400" />
    ) : mitigation.postureLevel === 'WARNING' ? (
      <AlertTriangle className="w-4 h-4 text-amber-400" />
    ) : (
      <Wheat className="w-4 h-4 text-emerald-400" />
    );

  return (
    <div
      data-testid="fire-regime-panel"
      className={`rounded-xl border border-slate-800 bg-space-950 p-6 shadow-2xl ${className}`}
    >
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="rounded bg-linear-to-r from-emerald-500/20 via-amber-500/20 to-red-500/20 border border-slate-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              NASA Challenge 15 • Req R6
            </span>
            <span className="rounded bg-cyan-950/50 border border-cyan-700/40 px-2 py-0.5 text-[11px] font-mono text-cyan-300">
              {effectiveCube.id} — {effectiveCube.name}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-amber-500" />
            {t.fireRegime.title}
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-400 max-w-3xl">
            {t.fireRegime.subtitle}
          </p>
        </div>

        {/* Dynamic Alert Posture Badge */}
        <div
          data-testid="alert-posture-badge"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border ${postureBadgeColor}`}
        >
          {postureIcon}
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider opacity-75">
              {t.fireRegime.mitigation.activePosture} ({selectedYear})
            </div>
            <div className="text-xs font-bold font-mono">
              {t.fireRegime.mitigation.postures[mitigation.postureLevel]}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Historical Frequency Distribution Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Agricultural Burning */}
        <div
          data-testid="distribution-card-agricultural"
          className="rounded-lg border border-emerald-900/50 bg-[#101826]/80 p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-emerald-400" />
              {t.fireRegime.distribution.agriculturalLabel}
            </span>
            <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              Q1
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">
              {distribution.agriculturalPct}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({distribution.agriculturalCount} {language === 'es' ? 'meses' : 'months'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 line-clamp-1">
            {t.fireRegime.quadrants.agriculturalSub}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/30">
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${distribution.agriculturalPct}%` }}
            />
          </div>
        </div>

        {/* Card 2: Transitional / Escaped Burning */}
        <div
          data-testid="distribution-card-transitional"
          className="rounded-lg border border-amber-900/50 bg-[#101826]/80 p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {t.fireRegime.distribution.transitionalLabel}
            </span>
            <span className="px-2 py-0.5 text-[10px] rounded bg-amber-950 text-amber-300 border border-amber-800">
              Q2
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">
              {distribution.transitionalPct}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({distribution.transitionalCount} {language === 'es' ? 'meses' : 'months'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 line-clamp-1">
            {t.fireRegime.quadrants.transitionalSub}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500/30">
            <div
              className="h-full bg-amber-500"
              style={{ width: `${distribution.transitionalPct}%` }}
            />
          </div>
        </div>

        {/* Card 3: Severe Landscape Wildfires */}
        <div
          data-testid="distribution-card-severe"
          className="rounded-lg border border-red-900/50 bg-[#101826]/80 p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400" />
              {t.fireRegime.distribution.severeWildfireLabel}
            </span>
            <span className="px-2 py-0.5 text-[10px] rounded bg-red-950 text-red-300 border border-red-800">
              Q3
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">
              {distribution.severeWildfirePct}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({distribution.severeWildfireCount} {language === 'es' ? 'meses' : 'months'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 line-clamp-1">
            {t.fireRegime.quadrants.severeWildfireSub}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500/30">
            <div
              className="h-full bg-red-500"
              style={{ width: `${distribution.severeWildfirePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* AOI Overall Diagnostic Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#161F30]/60 border border-slate-800/80 px-4 py-2.5 rounded-lg mb-6 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">{t.fireRegime.distribution.dominantRegime}:</span>
          <span className="font-bold text-white">
            {distribution.dominantRegime === 'SEVERE_WILDFIRE'
              ? '🔥 ' + t.fireRegime.quadrants.severeWildfire
              : distribution.dominantRegime === 'TRANSITIONAL'
              ? '⚠️ ' + t.fireRegime.quadrants.transitional
              : '🌾 ' + t.fireRegime.quadrants.agricultural}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <div>
            <span>{t.fireRegime.distribution.meanIndex}: </span>
            <span className="font-bold text-cyan-400">{distribution.meanRegimeIndex} / 100</span>
          </div>
          <div>
            <span>{t.fireRegime.distribution.totalMonths}: </span>
            <span className="font-bold text-white">{distribution.totalActiveMonths}</span>
          </div>
        </div>
      </div>

      {/* 3. 2D Interactive Scatter Plot */}
      <div className="rounded-xl border border-slate-800/90 bg-[#0F172A]/50 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>2D Fire Regime Phase Space (Mean FRP vs. Nocturnal Persistence)</span>
          </div>
          {/* Custom Interactive Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5" data-testid="legend-agricultural">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-300">{t.fireRegime.legend.agricultural}</span>
            </div>
            <div className="flex items-center gap-1.5" data-testid="legend-transitional">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-300">{t.fireRegime.legend.transitional}</span>
            </div>
            <div className="flex items-center gap-1.5" data-testid="legend-severe">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="text-slate-300">{t.fireRegime.legend.severeWildfire}</span>
            </div>
            <div className="flex items-center gap-1.5" data-testid="legend-active-year">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 inline-block" />
              <span className="text-cyan-300 font-semibold">{t.fireRegime.legend.activeYearHighlight} ({selectedYear})</span>
            </div>
          </div>
        </div>

        <div className="w-full h-95" data-testid="scatter-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 15 }}>
              {/* Shaded Quadrant Zones */}
              <ReferenceArea
                x1={0}
                x2={25}
                y1={0}
                y2={0.10}
                fill="#10B981"
                fillOpacity={0.06}
              />
              <ReferenceArea
                x1={25}
                x2={45}
                y1={0.10}
                y2={0.20}
                fill="#F59E0B"
                fillOpacity={0.06}
              />
              <ReferenceArea
                x1={45}
                x2={xDomainMax}
                y1={0.20}
                y2={yDomainMax}
                fill="#EF4444"
                fillOpacity={0.06}
              />

              {/* Threshold Boundary Lines */}
              <ReferenceLine x={25} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLine x={45} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLine y={0.10} stroke="#475569" strokeDasharray="3 3" />
              <ReferenceLine y={0.20} stroke="#475569" strokeDasharray="3 3" />

              <XAxis
                type="number"
                dataKey="x"
                name={t.fireRegime.axes.xAxis}
                unit=" MW"
                domain={[0, xDomainMax]}
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                stroke="#334155"
                label={{
                  value: t.fireRegime.axes.xAxis,
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#94A3B8',
                  fontSize: 11
                }}
              />

              <YAxis
                type="number"
                dataKey="y"
                name={t.fireRegime.axes.yAxis}
                domain={[0, yDomainMax]}
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                stroke="#334155"
                tickFormatter={(val: number) => `${(val * 100).toFixed(0)}%`}
                label={{
                  value: t.fireRegime.axes.yAxis,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: '#94A3B8',
                  fontSize: 11
                }}
              />

              <ZAxis type="number" dataKey="z" range={[30, 240]} />

              <Tooltip content={<CustomRegimeTooltip t={t} />} />

              {/* Quadrant Series */}
              <Scatter
                name={t.fireRegime.legend.agricultural}
                data={scatterData.agricultural}
                fill="#10B981"
                fillOpacity={0.65}
                stroke="#059669"
                strokeWidth={1}
                onClick={(node: any) => {
                  if (node?.payload && onSelectObservation) {
                    onSelectObservation(node.payload.year, node.payload.month);
                  }
                }}
              />

              <Scatter
                name={t.fireRegime.legend.transitional}
                data={scatterData.transitional}
                fill="#F59E0B"
                fillOpacity={0.7}
                stroke="#D97706"
                strokeWidth={1}
                onClick={(node: any) => {
                  if (node?.payload && onSelectObservation) {
                    onSelectObservation(node.payload.year, node.payload.month);
                  }
                }}
              />

              <Scatter
                name={t.fireRegime.legend.severeWildfire}
                data={scatterData.severeWildfire}
                fill="#EF4444"
                fillOpacity={0.8}
                stroke="#DC2626"
                strokeWidth={1}
                onClick={(node: any) => {
                  if (node?.payload && onSelectObservation) {
                    onSelectObservation(node.payload.year, node.payload.month);
                  }
                }}
              />

              {/* Active Year Highlight Layer */}
              <Scatter
                name={t.fireRegime.legend.activeYearHighlight}
                data={scatterData.activeYearPoints}
                fill="none"
                stroke="#38BDF8"
                strokeWidth={2}
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Footnote / notice */}
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-mono">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{t.fireRegime.zeroFireNotice}</span>
        </div>
      </div>

      {/* 4. Multi-Agency Tactical Mitigation Directives */}
      <div className="border-t border-slate-800 pt-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            {t.fireRegime.mitigation.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.fireRegime.mitigation.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mitigation.agencies.map((agency) => {
            const icon =
              agency.agencyId === 'civil_defense' ? (
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
              ) : agency.agencyId === 'park_rangers' ? (
                <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Sprout className="w-4 h-4 text-amber-400 shrink-0" />
              );

            return (
              <div
                key={agency.agencyId}
                data-testid={`agency-card-${agency.agencyId}`}
                className="rounded-lg border border-slate-800/80 bg-[#101826]/90 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                    {icon}
                    <h4 className="text-xs font-bold text-slate-200 truncate">
                      {agency.agencyName}
                    </h4>
                  </div>
                  <div className="text-xs font-semibold text-slate-100 mb-2 font-mono">
                    {agency.headline}
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-300">
                    {agency.actionItems.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-cyan-400 font-mono">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

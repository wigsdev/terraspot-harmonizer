/**
 * Executive 4-Card Mission KPI Summary Panel (Symmetric 3-Tier Cards).
 * Displays real-time multi-decadal AFCD, R^2 fit, seasonal peak share,
 * operational anomaly alert (2026-10 vs M_10), and dominant fire regime.
 */

import React, { useMemo } from 'react';
import {
  Activity,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { useLanguage, useRegion } from '../context';
import { computeKPISummary } from '../engine';
import type { AnomalyAlertStatus, FireRegimeClass, RegionCube } from '../types';

export interface KPISummaryCardsProps {
  overrideRegion?: RegionCube | null;
  isLoadingOverride?: boolean;
}

const ALERT_BADGE_CLASSES: Record<AnomalyAlertStatus, string> = {
  NORMAL: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
  ELEVATED: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
  CRITICAL: 'bg-red-500/20 text-red-300 border-red-400/45',
};

const ALERT_ICON_STYLES: Record<AnomalyAlertStatus, { container: string; icon: string }> = {
  NORMAL: {
    container: 'bg-emerald-500/10 border-emerald-500/30',
    icon: 'text-emerald-400',
  },
  ELEVATED: {
    container: 'bg-amber-500/10 border-amber-500/30',
    icon: 'text-amber-400',
  },
  CRITICAL: {
    container: 'bg-red-500/15 border-red-500/40',
    icon: 'text-red-400',
  },
};

const REGIME_BADGE_CLASSES: Record<FireRegimeClass, string> = {
  AGRICULTURAL_BURN: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
  TRANSITIONAL: 'bg-orange-500/15 text-orange-300 border-orange-400/40',
  SEVERE_WILDFIRE: 'bg-red-500/20 text-red-300 border-red-400/45',
};

const REGIME_ICON_STYLES: Record<
  FireRegimeClass,
  { container: string; icon: string; dot: string }
> = {
  AGRICULTURAL_BURN: {
    container: 'bg-amber-500/10 border-amber-500/30',
    icon: 'text-amber-400',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.65)]',
  },
  TRANSITIONAL: {
    container: 'bg-orange-500/10 border-orange-500/30',
    icon: 'text-orange-400',
    dot: 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.65)]',
  },
  SEVERE_WILDFIRE: {
    container: 'bg-red-500/15 border-red-500/40',
    icon: 'text-red-400',
    dot: 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.75)]',
  },
};

const CARD_CONTAINER_CLASS =
  'bg-space-900 border border-space-800 hover:border-space-700 rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors shadow-sm min-w-0 min-h-37';
const CARD_TITLE_CLASS =
  'text-xs sm:text-[13px] font-semibold tracking-tight text-slate-200 leading-snug';
const CARD_FOOTER_CLASS =
  'pt-3 border-t border-space-800/80 flex items-center justify-between gap-2 text-xs';

export const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({
  overrideRegion,
  isLoadingOverride,
}) => {
  const { language, t } = useLanguage();
  const { currentRegion, isLoading } = useRegion();

  const effectiveRegion = overrideRegion !== undefined ? overrideRegion : currentRegion;
  const effectiveLoading = isLoadingOverride !== undefined ? isLoadingOverride : isLoading;

  const kpi = useMemo(
    () => computeKPISummary(effectiveRegion, language, t),
    [effectiveRegion, language, t],
  );

  if (effectiveLoading) {
    return (
      <section
        aria-label="Loading KPI Summary"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4"
      >
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            data-testid="kpi-skeleton"
            className="bg-space-900 border border-space-800 rounded-xl p-4 sm:p-5 min-h-37 animate-pulse flex flex-col justify-between"
          >
            <div className="h-4 w-2/3 bg-space-800 rounded" />
            <div className="h-8 w-1/2 bg-space-800 rounded" />
            <div className="h-3.5 w-3/4 bg-space-800 rounded" />
          </div>
        ))}
      </section>
    );
  }

  const alertIconStyle = ALERT_ICON_STYLES[kpi.alertStatus];
  const regimeIconStyle = REGIME_ICON_STYLES[kpi.regimeClass];
  const AlertIcon =
    kpi.alertStatus === 'NORMAL'
      ? ShieldCheck
      : kpi.alertStatus === 'ELEVATED'
        ? AlertTriangle
        : ShieldAlert;

  return (
    <section
      aria-label="Mission KPI Summary"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4"
    >
      {/* Card 1: Total Harmonized Fire Activity (2000-2026) & R^2 */}
      <article data-testid="kpi-card-afcd" className={CARD_CONTAINER_CLASS}>
        <div className="flex items-center justify-between gap-2.5 text-slate-300 min-w-0">
          <span className={CARD_TITLE_CLASS}>{t.kpiCards.card1.title}</span>
          <div className="p-2 rounded-lg bg-space-950 border border-space-800 shrink-0">
            <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-300" aria-hidden="true" />
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-none font-mono tabular-nums">
            {kpi.formattedTotalAfcd}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-cyan-300 uppercase tracking-wide">
            {t.kpiCards.card1.unit}
          </span>
        </div>

        <div className={CARD_FOOTER_CLASS}>
          <span className="whitespace-nowrap shrink-0 font-mono tabular-nums font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-400/35 px-2.5 py-0.5 rounded">
            {kpi.formattedRSquared}
          </span>
          <span className="text-slate-300 truncate">{t.kpiCards.card1.r2Label}</span>
        </div>
      </article>

      {/* Card 2: Peak Burning Season & Annual Concentration Share */}
      <article data-testid="kpi-card-peak" className={CARD_CONTAINER_CLASS}>
        <div className="flex items-center justify-between gap-2.5 text-slate-300 min-w-0">
          <span className={CARD_TITLE_CLASS}>{t.kpiCards.card2.title}</span>
          <div className="p-2 rounded-lg bg-space-950 border border-space-800 shrink-0">
            <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300" aria-hidden="true" />
          </div>
        </div>

        <div className="my-3">
          <div className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-none">
            {kpi.peakMonthsLabel}
          </div>
        </div>

        <div className={CARD_FOOTER_CLASS}>
          <span className="whitespace-nowrap shrink-0 font-mono tabular-nums font-semibold text-amber-300 bg-amber-500/15 border border-amber-400/35 px-2.5 py-0.5 rounded">
            {kpi.formattedPeakShare}
          </span>
          <span className="text-slate-300 truncate">{t.kpiCards.card2.subtextSuffix}</span>
        </div>
      </article>

      {/* Card 3: Operational Season Anomaly Alert (2026-10 vs M_10) */}
      <article data-testid="kpi-card-anomaly" className={CARD_CONTAINER_CLASS}>
        <div className="flex items-center justify-between gap-2.5 text-slate-300 min-w-0">
          <span className={CARD_TITLE_CLASS}>{t.kpiCards.card3.title}</span>
          <div
            data-testid="kpi-anomaly-icon-container"
            className={`p-2 rounded-lg border shrink-0 transition-colors ${alertIconStyle.container}`}
          >
            <AlertIcon
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${alertIconStyle.icon}`}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-none font-mono tabular-nums">
            {kpi.formattedDeparture}
          </span>
          <span className="text-xs sm:text-sm font-mono tabular-nums text-slate-300 whitespace-nowrap">
            ({kpi.formattedZScore})
          </span>
        </div>

        <div className={CARD_FOOTER_CLASS}>
          <span
            data-testid="kpi-anomaly-badge"
            className={`whitespace-nowrap shrink-0 font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded border ${ALERT_BADGE_CLASSES[kpi.alertStatus]}`}
          >
            {kpi.alertBadgeLabel}
          </span>
          <span className="font-mono tabular-nums text-slate-300 whitespace-nowrap">
            {t.kpiCards.card3.latestObservationLabel}
          </span>
        </div>
      </article>

      {/* Card 4: Dominant Fire Regime Diagnostic */}
      <article data-testid="kpi-card-regime" className={CARD_CONTAINER_CLASS}>
        <div className="flex items-center justify-between gap-2.5 text-slate-300 min-w-0">
          <span className={CARD_TITLE_CLASS}>{t.kpiCards.card4.title}</span>
          <div
            data-testid="kpi-regime-icon-container"
            className={`p-2 rounded-lg border shrink-0 transition-colors ${regimeIconStyle.container}`}
          >
            <Flame
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${regimeIconStyle.icon}`}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="my-3 flex items-center min-w-0">
          <span
            data-testid="kpi-regime-badge"
            className={`inline-flex items-center text-xs sm:text-sm font-bold px-3.5 py-1.5 rounded-lg border max-w-full truncate ${REGIME_BADGE_CLASSES[kpi.regimeClass]}`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full mr-2 shrink-0 ${regimeIconStyle.dot}`}
              aria-hidden="true"
            />
            <span className="truncate">{kpi.regimeBadgeLabel}</span>
          </span>
        </div>

        <div className={`${CARD_FOOTER_CLASS} font-mono tabular-nums`}>
          <span className="text-slate-300 whitespace-nowrap">
            {t.kpiCards.card4.frpLabel}:{' '}
            <strong className="text-white font-semibold">{kpi.formattedMeanFrp}</strong>
          </span>
          <span className="text-slate-300 whitespace-nowrap">
            {t.kpiCards.card4.nightFractionLabel}:{' '}
            <strong className="text-white font-semibold">{kpi.formattedNightFraction}</strong>
          </span>
        </div>
      </article>
    </section>
  );
};

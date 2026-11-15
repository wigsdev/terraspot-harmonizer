/**
 * Primary NASA Mission Control Top Navigation Shell (2-Tier Architecture).
 * Tier 1: Mission identity, Challenge 15 indicator, release tag, and dual-sensor baseline.
 * Tier 2: Full-width benchmark region selector, accessible palette selector, EN/ES switch, and CSV export.
 */

import React from 'react';
import {
  Flame,
  Satellite,
  MapPin,
  Palette,
  Languages,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';
import { useLanguage, useRegion } from '../context';
import { downloadHarmonizedCSV } from '../engine';
import type { PaletteType } from '../types';

const PALETTE_OPTIONS: PaletteType[] = ['inferno', 'viridis', 'cividis', 'diverging'];

export interface NavbarProps {
  onOpenUploadModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUploadModal }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const {
    selectedRegionId,
    regionsList,
    activePalette,
    setRegionId,
    setPalette,
    currentRegion,
    isCustomActive,
    clearCustomCube,
  } = useRegion();

  const handleExportCSV = () => {
    if (currentRegion) {
      downloadHarmonizedCSV(currentRegion);
    }
  };

  return (
    <header className="border-b border-space-800 bg-space-900/95 backdrop-blur sticky top-0 z-50 px-4 py-2.5 sm:px-6 sm:py-3">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-2.5">
        {/* Tier 1: Brand Identity & Dual-Sensor Telemetry */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-thermal-500/15 border border-thermal-500/40 rounded-lg text-thermal-400 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  {t.navbar.brand}
                </h1>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-400/35 whitespace-nowrap">
                  {t.navbar.challengeBadge}
                </span>
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-space-800 text-slate-300 border border-space-700 whitespace-nowrap">
                  {t.navbar.versionTag}
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-300 mt-0.5">
                {t.navbar.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isCustomActive && (
              <div
                data-testid="custom-data-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>{t.navbar.customDataBadge}</span>
                <button
                  type="button"
                  onClick={clearCustomCube}
                  data-testid="reset-benchmark-button"
                  className="ml-1 inline-flex items-center gap-1 text-slate-300 hover:text-white underline cursor-pointer"
                  title={t.navbar.resetBenchmark}
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>{t.navbar.resetBenchmark}</span>
                </button>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-slate-300 bg-space-950 px-2.5 py-1 rounded-md border border-space-800 self-start sm:self-center shrink-0">
              <Satellite className="w-3.5 h-3.5 text-cyan-300 shrink-0" aria-hidden="true" />
              <span className="whitespace-nowrap">{t.navbar.sensorBaseline}</span>
            </div>
          </div>
        </div>

        {/* Tier 2: Operational Controls (Responsive Single Row on Tablet/Desktop, Stacked Full-Width on Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] gap-2 items-center pt-2 border-t border-space-800/80">
          {/* Benchmark Region Selector (5 AOIs) */}
          <div className="flex items-center bg-space-950 border border-space-700 rounded-md px-2.5 py-1.5 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/50 w-full min-w-0">
            <MapPin className="w-3.5 h-3.5 text-cyan-300 mr-1.5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cyan-300/90 mr-1.5 shrink-0">
              AOI:
            </span>
            <select
              data-testid="region-select"
              aria-label={t.navbar.regionSelectAria}
              value={selectedRegionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="bg-transparent text-xs font-medium text-white focus:outline-none w-full cursor-pointer truncate"
            >
              {regionsList.map((region) => (
                <option key={region.id} value={region.id} className="bg-space-900 text-white">
                  {t.regionNames[region.id] ?? region.name} (
                  {t.regionCountries[region.id] ?? region.country})
                </option>
              ))}
            </select>
          </div>

          {/* Accessible Color Palette Selector */}
          <div className="flex items-center bg-space-950 border border-space-700 rounded-md px-2.5 py-1.5 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400/50 w-full md:w-63.75 lg:w-68.75 shrink-0">
            <Palette className="w-3.5 h-3.5 text-amber-300 mr-1.5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-amber-300/90 mr-1.5 shrink-0">
              {language === 'es' ? 'PALETA:' : 'RAMP:'}
            </span>
            <select
              data-testid="palette-select"
              aria-label={t.navbar.paletteSelectAria}
              value={activePalette}
              onChange={(e) => setPalette(e.target.value as PaletteType)}
              className="bg-transparent text-xs font-medium text-white focus:outline-none w-full cursor-pointer truncate"
            >
              {PALETTE_OPTIONS.map((palette) => (
                <option key={palette} value={palette} className="bg-space-900 text-white">
                  {t.paletteNames[palette]}
                </option>
              ))}
            </select>
          </div>

          {/* Utility Action Group: Language Toggle + Upload FIRMS + Export CSV */}
          <div className="grid grid-cols-3 md:flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              type="button"
              data-testid="language-toggle"
              onClick={toggleLanguage}
              aria-label={t.navbar.languageToggleAria}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-space-950 border border-space-700 hover:border-cyan-400/60 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/50 cursor-pointer whitespace-nowrap"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
              <span className={language === 'en' ? 'text-cyan-300' : 'text-slate-400'}>EN</span>
              <span className="text-slate-500">/</span>
              <span className={language === 'es' ? 'text-cyan-300' : 'text-slate-400'}>ES</span>
            </button>

            <button
              type="button"
              data-testid="upload-firms-button"
              onClick={onOpenUploadModal}
              aria-label={t.navbar.uploadCsv}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-space-950 hover:bg-space-800 border border-space-700 hover:border-cyan-400/60 text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50 whitespace-nowrap cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-300 shrink-0" aria-hidden="true" />
              <span>{t.navbar.uploadCsv}</span>
            </button>

            <button
              type="button"
              data-testid="export-csv-button"
              onClick={handleExportCSV}
              title={t.navbar.exportCsvTooltip}
              aria-label={t.navbar.exportCsv}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-[#C2410C] hover:bg-[#9A3412] active:scale-95 text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t.navbar.exportCsv}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

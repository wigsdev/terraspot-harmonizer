import React from 'react';
import { Flame, Satellite, Globe2, ShieldAlert, Download, Layers } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-space-950 text-[#E2E8F0] flex flex-col font-sans selection:bg-thermal-500/30 selection:text-white">
      {/* ── Top Aerospace Header (Mobile-First Architecture) ───────────────── */}
      <header className="border-b border-space-800 bg-space-900/90 backdrop-blur sticky top-0 z-50 px-4 py-2.5 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3">
        {/* Brand & Mission Identifier */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-1.5 sm:p-2 bg-thermal-500/10 border border-thermal-500/30 rounded-lg text-thermal-500 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                TerraSpot Harmonizer
              </h1>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-radar-cyan/10 text-radar-cyan border border-radar-cyan/30 whitespace-nowrap">
                Challenge 15
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-space-800 text-[#94A3B8] whitespace-nowrap">
                v0.2.0-alpha
              </span>
            </div>
            <p className="hidden sm:block text-xs text-[#94A3B8] truncate max-w-md lg:max-w-2xl mt-0.5">
              Unified Multi-Decadal Burning Activity Calendar &amp; Fire Regime Diagnostic Engine (2000–2026)
            </p>
          </div>
        </div>

        {/* Action Controls & Sensor Pill */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#94A3B8] bg-space-950 px-3 py-1.5 rounded-md border border-space-800">
            <Satellite className="w-3.5 h-3.5 text-radar-cyan" />
            <span>MODIS (2000–2026) + VIIRS (2012–2026)</span>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-1.5 text-xs font-medium px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-md bg-thermal-500 hover:bg-thermal-600 active:scale-95 text-white transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-thermal-500/50"
            aria-label="Export CSV"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline">Export CSV</span>
            <span className="inline xs:hidden sm:hidden sr-only">Export CSV</span>
          </button>
        </div>
      </header>

      {/* ── Main Dashboard Content (Fluid Scale 1 -> 2 -> 4 Columns) ─────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* KPI Banner: Mobile-First Grid (1 col mobile, 2 cols tablet, 4 cols desktop) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Active AOI */}
          <div className="bg-space-900 border border-space-800 hover:border-space-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-medium">Active AOI</span>
              <Globe2 className="w-4 h-4 text-radar-cyan shrink-0" />
            </div>
            <div className="mt-2.5">
              <div className="text-sm sm:text-base font-semibold text-white tracking-tight">Huánuco &amp; Central Andes</div>
              <div className="text-xs text-radar-cyan font-mono mt-0.5 truncate">[-10.50, -76.50] to [-9.00, -75.00]</div>
            </div>
          </div>

          {/* Card 2: Sensor Fusion Era */}
          <div className="bg-space-900 border border-space-800 hover:border-space-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-medium">Sensor Fusion Era</span>
              <Layers className="w-4 h-4 text-thermal-500 shrink-0" />
            </div>
            <div className="mt-2.5">
              <div className="text-sm sm:text-base font-semibold text-white tracking-tight">Dual-Sensor Fusion (2012–2025)</div>
              <div className="text-xs text-[#94A3B8] mt-0.5">Convergence R² &gt; 0.92 (0.01° AFCD)</div>
            </div>
          </div>

          {/* Card 3: Climatological Median */}
          <div className="bg-space-900 border border-space-800 hover:border-space-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-medium">Climatological Median</span>
              <ShieldAlert className="w-4 h-4 text-status-success shrink-0" />
            </div>
            <div className="mt-2.5">
              <div className="text-sm sm:text-base font-semibold text-white tracking-tight">Robust 25-Year Baseline</div>
              <div className="text-xs text-status-success mt-0.5">Non-parametric interquartile envelope</div>
            </div>
          </div>

          {/* Card 4: Accessible Ramps */}
          <div className="bg-space-900 border border-space-800 hover:border-space-800/80 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between transition-colors shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-medium">Accessible Ramps</span>
              <span className="text-[10px] uppercase font-bold text-thermal-500 bg-thermal-500/10 px-1.5 py-0.5 rounded border border-thermal-500/20">
                WCAG 2.1 AA
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-sm sm:text-base font-semibold text-white tracking-tight">Inferno / Viridis / Cividis</div>
              <div className="text-xs text-[#94A3B8] mt-0.5">Certified Colorblind-Safe</div>
            </div>
          </div>
        </section>

        {/* Scaffolding Placeholder Card */}
        <section className="bg-space-900 border border-space-800 rounded-xl p-5 sm:p-8 text-center space-y-3 sm:space-y-4 shadow-sm">
          <div className="inline-flex p-2.5 sm:p-3 bg-space-950 rounded-full border border-space-800 text-radar-cyan">
            <Satellite className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Web Architecture Initialized</h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            TerraSpot Harmonizer frontend core is operational on Vite 8 (Rolldown native bundler), React 19, TypeScript 7, and Tailwind CSS v4. Modular engine stubs in <code className="text-radar-cyan font-mono">src/engine/</code> are ready for Task T-03 and T-04 implementation.
          </p>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-space-800 bg-space-950 px-4 py-3 sm:px-6 sm:py-4 text-[11px] sm:text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div>
          Data Source: <span className="text-[#94A3B8]">NASA FIRMS (MODIS C6.1 &amp; VIIRS C2)</span> | NASA EOSDIS GIBS
        </div>
        <div>
          NASA Space Apps Challenge 2026 — Local Event: Huánuco, Peru
        </div>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import { Globe2, Satellite } from 'lucide-react';
import { LanguageProvider, RegionProvider, useLanguage, useRegion } from './context';
import { Navbar } from './components/Navbar';
import { KPISummaryCards } from './components/KPISummaryCards';

const DashboardContent: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentRegion, selectedRegionId } = useRegion();

  const regionName = t.regionNames[selectedRegionId] ?? currentRegion?.name ?? selectedRegionId;
  const countryName = t.regionCountries[selectedRegionId] ?? currentRegion?.country ?? '';
  const bbox = currentRegion?.bbox;

  return (
    <div className="min-h-screen bg-space-950 text-[#E2E8F0] flex flex-col font-sans selection:bg-thermal-500/30 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Executive 4-Card KPI Summary Panel */}
        <KPISummaryCards />

        {/* Operational Workspace Readiness Card (awaiting T-06 Map & T-07 Calendar Matrix) */}
        <section
          aria-label="Active Area of Interest Telemetry Workspace"
          className="bg-space-900 border border-space-800 rounded-xl overflow-hidden shadow-sm"
        >
          {/* Active AOI Spatial Header Strip */}
          <div className="bg-space-950/60 border-b border-space-800 px-4 py-2.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <Globe2 className="w-4 h-4 text-cyan-300 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-white" data-testid="active-aoi-name">
                {regionName}
              </span>
              {countryName && (
                <span className="text-slate-300 whitespace-nowrap">({countryName})</span>
              )}
            </div>

            {bbox && (
              <div className="inline-flex items-center gap-1.5 font-mono tabular-nums text-slate-300 whitespace-nowrap">
                <span className="text-slate-400">BBox WGS84:</span>
                <span data-testid="active-aoi-bbox" className="text-cyan-300 whitespace-nowrap">
                  [{bbox.min_lat.toFixed(2)}, {bbox.min_lon.toFixed(2)}]{' '}
                  {language === 'es' ? 'a' : 'to'} [{bbox.max_lat.toFixed(2)},{' '}
                  {bbox.max_lon.toFixed(2)}]
                </span>
              </div>
            )}
          </div>

          {/* Harmonization Workspace Readiness Body */}
          <div className="p-5 sm:p-8 text-center space-y-3 sm:space-y-4">
            <div className="inline-flex p-2.5 sm:p-3 bg-space-950 rounded-full border border-space-800 text-cyan-300">
              <Satellite className="w-6 h-6 sm:w-8 sm:h-8" aria-hidden="true" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {language === 'es'
                ? 'Centro de Control y Armonización Operativo'
                : 'Mission Control Telemetry & Harmonization Active'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {currentRegion?.description}
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-space-800 bg-space-950 px-4 py-3 sm:px-6 sm:py-4 text-[11px] sm:text-xs text-slate-400">
        <div className="max-w-[1600px] w-full mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            Data Source:{' '}
            <span className="text-slate-300">NASA FIRMS (MODIS C6.1 &amp; VIIRS C2)</span> | NASA
            EOSDIS GIBS
          </div>
          <div>NASA Space Apps Challenge 2026 — Local Event: Huánuco, Peru</div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <RegionProvider>
        <DashboardContent />
      </RegionProvider>
    </LanguageProvider>
  );
};

export default App;

import React from 'react';
import { Globe2 } from 'lucide-react';
import { LanguageProvider, RegionProvider, useLanguage, useRegion } from './context';
import { Navbar, KPISummaryCards, MapAOISelector, BurningCalendarMatrix } from './components';

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

        {/* Active AOI Spatial Status Strip */}
        <div
          data-testid="active-aoi-strip"
          className="bg-space-900 border border-space-800 rounded-xl px-4 py-2.5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-sm"
        >
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

        {/* Interactive WebGIS Map AOI Selector & NASA GIBS Canvas (T-06) */}
        <MapAOISelector />

        {/* Interactive 27-Year Burning Activity Calendar Matrix (T-07) */}
        <BurningCalendarMatrix />
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

/**
 * Interactive Cartographic WebGIS Module with Bounding Box Tool & NASA GIBS WMTS.
 * Complies with docs/03-system-technical-architecture.md, docs/04-firms-data-specification.md,
 * and specs/005-map-aoi-gibs/spec.md.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Rectangle,
  CircleMarker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Globe2,
  Layers,
  Pencil,
  RotateCcw,
  Maximize2,
  Flame,
  AlertCircle,
  Satellite,
  Compass,
} from 'lucide-react';
import { useLanguage, useRegion } from '../context';
import {
  BENCHMARK_GIBS_DATES,
  DEFAULT_GIBS_DATE,
  type BoundingBox,
  type MapAOISelectorProps,
  type MapCoordinateInputs,
  type MapLayerId,
  type SpatialGridCellSummary,
} from '../types';
import { buildTileUrl, MAP_LAYERS } from '../engine/gibsLayers';
import { filterCellsByBBox, resolveCellStyle } from '../engine/spatialGrid';
import { normalizeBoundingBox, reharmonizeSpatialSubset } from '../engine/harmonizer';

// Fallback sample cells for synchronous initial render & offline testing
const FALLBACK_SPATIAL_CELLS: SpatialGridCellSummary[] = [
  {
    region_id: 'PE-HCO',
    grid_x: -7470,
    grid_y: -999,
    lat: -9.985,
    lon: -74.695,
    total_afcd: 351,
    peak_month: 7,
    mean_frp_mw: 30.44,
    p90_frp_mw: 52.72,
    night_fraction: 0.1143,
    regime_class: 'TRANSITIONAL',
    yearly_afcd: { '2024': 22, '2025': 13, '2026': 8 },
  },
  {
    region_id: 'PE-HCO',
    grid_x: -7560,
    grid_y: -960,
    lat: -9.6,
    lon: -75.6,
    total_afcd: 180,
    peak_month: 8,
    mean_frp_mw: 24.1,
    p90_frp_mw: 38.5,
    night_fraction: 0.05,
    regime_class: 'AGRICULTURAL_BURN',
    yearly_afcd: { '2024': 15, '2025': 9, '2026': 5 },
  },
  {
    region_id: 'SAM-MAP',
    grid_x: -6950,
    grid_y: -1100,
    lat: -11.0,
    lon: -69.5,
    total_afcd: 840,
    peak_month: 9,
    mean_frp_mw: 42.8,
    p90_frp_mw: 78.2,
    night_fraction: 0.18,
    regime_class: 'TRANSITIONAL',
    yearly_afcd: { '2024': 65, '2025': 40, '2026': 25 },
  },
  {
    region_id: 'US-CAL',
    grid_x: -12150,
    grid_y: 3950,
    lat: 39.5,
    lon: -121.5,
    total_afcd: 920,
    peak_month: 9,
    mean_frp_mw: 56.4,
    p90_frp_mw: 98.1,
    night_fraction: 0.22,
    regime_class: 'SEVERE_WILDFIRE',
    yearly_afcd: { '2020': 180, '2021': 140, '2026': 30 },
  },
  {
    region_id: 'AU-NSW',
    grid_x: 15000,
    grid_y: -3400,
    lat: -34.0,
    lon: 150.0,
    total_afcd: 1150,
    peak_month: 12,
    mean_frp_mw: 64.2,
    p90_frp_mw: 112.5,
    night_fraction: 0.25,
    regime_class: 'SEVERE_WILDFIRE',
    yearly_afcd: { '2019': 310, '2020': 280, '2026': 45 },
  },
  {
    region_id: 'AR-PAR',
    grid_x: -6050,
    grid_y: -3250,
    lat: -32.5,
    lon: -60.5,
    total_afcd: 460,
    peak_month: 8,
    mean_frp_mw: 28.6,
    p90_frp_mw: 48.0,
    night_fraction: 0.08,
    regime_class: 'AGRICULTURAL_BURN',
    yearly_afcd: { '2020': 110, '2021': 85, '2026': 18 },
  },
];

/**
 * Helper component handling dynamic Leaflet bounds animation upon region changes.
 */
const MapCameraController: React.FC<{
  bbox?: BoundingBox;
  isDrawing: boolean;
}> = ({ bbox, isDrawing }) => {
  const map = useMap();

  useEffect(() => {
    if (bbox && !isDrawing) {
      try {
        map.flyToBounds(
          [
            [bbox.min_lat, bbox.min_lon],
            [bbox.max_lat, bbox.max_lon],
          ],
          { padding: [24, 24], duration: 1.0 },
        );
      } catch {
        try {
          map.fitBounds([
            [bbox.min_lat, bbox.min_lon],
            [bbox.max_lat, bbox.max_lon],
          ]);
        } catch {
          // Ignored in headless JSDOM environments
        }
      }
    }
  }, [bbox, isDrawing, map]);

  return null;
};

/**
 * Helper component handling native click-and-drag bounding box rectangle drawing.
 */
const BoundingBoxDrawHandler: React.FC<{
  isDrawing: boolean;
  onDrawComplete: (bbox: BoundingBox) => void;
  onTransientUpdate: (bounds: [[number, number], [number, number]] | null) => void;
}> = ({ isDrawing, onDrawComplete, onTransientUpdate }) => {
  const map = useMap();
  const [startPoint, setStartPoint] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (isDrawing) {
      map.dragging.disable();
    } else {
      map.dragging.enable();
      setStartPoint(null);
      onTransientUpdate(null);
    }
  }, [isDrawing, map, onTransientUpdate]);

  useMapEvents({
    mousedown: (e) => {
      if (!isDrawing) return;
      const point: [number, number] = [e.latlng.lat, e.latlng.lng];
      setStartPoint(point);
      onTransientUpdate([point, point]);
    },
    mousemove: (e) => {
      if (!isDrawing || !startPoint) return;
      onTransientUpdate([
        [Math.min(startPoint[0], e.latlng.lat), Math.min(startPoint[1], e.latlng.lng)],
        [Math.max(startPoint[0], e.latlng.lat), Math.max(startPoint[1], e.latlng.lng)],
      ]);
    },
    mouseup: (e) => {
      if (!isDrawing || !startPoint) return;
      const min_lat = Math.min(startPoint[0], e.latlng.lat);
      const max_lat = Math.max(startPoint[0], e.latlng.lat);
      const min_lon = Math.min(startPoint[1], e.latlng.lng);
      const max_lon = Math.max(startPoint[1], e.latlng.lng);
      setStartPoint(null);
      onTransientUpdate(null);

      // Only complete if dragged at least a minimal area (0.005 degrees)
      if (Math.abs(max_lat - min_lat) > 0.005 && Math.abs(max_lon - min_lon) > 0.005) {
        onDrawComplete({ min_lat, max_lat, min_lon, max_lon });
      }
    },
  });

  return null;
};

export const MapAOISelector: React.FC<MapAOISelectorProps> = ({
  className = '',
  onCustomAOIChange,
  onCellSelect,
  height = 500,
  disableRemoteTiles = false,
}) => {
  const { t } = useLanguage();
  const { currentRegion, selectedRegionId, regionsList, activePalette, setRegionId } = useRegion();

  const [activeLayer, setActiveLayer] = useState<MapLayerId>('dark_matter');
  const [showFireCells, setShowFireCells] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [customBbox, setCustomBbox] = useState<BoundingBox | null>(null);
  const [transientBounds, setTransientBounds] = useState<
    [[number, number], [number, number]] | null
  >(null);
  const [spatialCells, setSpatialCells] = useState<SpatialGridCellSummary[]>(FALLBACK_SPATIAL_CELLS);
  const [inputError, setInputError] = useState<string | null>(null);

  // Active target bounding box: custom AOI takes precedence over regional default
  const effectiveBbox: BoundingBox = useMemo(() => {
    if (customBbox) return customBbox;
    return (
      currentRegion?.bbox ?? {
        min_lat: -10.6,
        max_lat: -8.4,
        min_lon: -77.1,
        max_lon: -74.4,
      }
    );
  }, [customBbox, currentRegion]);

  // Coordinate form inputs state
  const [coords, setCoords] = useState<MapCoordinateInputs>({
    minLat: effectiveBbox.min_lat.toFixed(2),
    maxLat: effectiveBbox.max_lat.toFixed(2),
    minLon: effectiveBbox.min_lon.toFixed(2),
    maxLon: effectiveBbox.max_lon.toFixed(2),
  });

  // Synchronize coordinate inputs whenever effective bounding box updates
  useEffect(() => {
    setCoords({
      minLat: effectiveBbox.min_lat.toFixed(2),
      maxLat: effectiveBbox.max_lat.toFixed(2),
      minLon: effectiveBbox.min_lon.toFixed(2),
      maxLon: effectiveBbox.max_lon.toFixed(2),
    });
    setInputError(null);
  }, [effectiveBbox]);

  // Fetch full 250 spatial cells from public directory if available
  useEffect(() => {
    let isMounted = true;
    if (typeof fetch === 'function' && !disableRemoteTiles) {
      fetch('/data/firms_spatial_cells.json')
        .then((res) => {
          if (!res.ok) throw new Error('Spatial cells file not found');
          return res.json();
        })
        .then((doc) => {
          if (isMounted && Array.isArray(doc.cells) && doc.cells.length > 0) {
            setSpatialCells(doc.cells);
          }
        })
        .catch(() => {
          // Graceful fallback to bundled cells
        });
    }
    return () => {
      isMounted = false;
    };
  }, [disableRemoteTiles]);

  // Filter spatial cells within the active bounding box envelope
  const visibleCells = useMemo(() => {
    return filterCellsByBBox(spatialCells, effectiveBbox);
  }, [spatialCells, effectiveBbox]);

  // NASA GIBS curated reference date for satellite imagery
  const gibsReferenceDate = useMemo(() => {
    return BENCHMARK_GIBS_DATES[selectedRegionId] ?? DEFAULT_GIBS_DATE;
  }, [selectedRegionId]);

  // Active Tile Layer URL template
  const tileUrl = useMemo(() => {
    return buildTileUrl(activeLayer, gibsReferenceDate);
  }, [activeLayer, gibsReferenceDate]);

  // Handle bounding box drawn interactively
  const handleDrawComplete = useCallback(
    (newBbox: BoundingBox) => {
      const norm = normalizeBoundingBox(newBbox);
      setCustomBbox(norm);
      setIsDrawing(false);
      onCustomAOIChange?.(norm);

      // Re-harmonize subset if base region is active
      if (currentRegion) {
        try {
          reharmonizeSpatialSubset(spatialCells, currentRegion, norm);
        } catch {
          // Handled defensively
        }
      }
    },
    [currentRegion, spatialCells, onCustomAOIChange],
  );

  // Handle manual coordinate input changes
  const handleCoordinateChange = (field: keyof MapCoordinateInputs, value: string) => {
    const updated = { ...coords, [field]: value };
    setCoords(updated);

    const minLat = parseFloat(updated.minLat);
    const maxLat = parseFloat(updated.maxLat);
    const minLon = parseFloat(updated.minLon);
    const maxLon = parseFloat(updated.maxLon);

    if (isNaN(minLat) || isNaN(maxLat) || isNaN(minLon) || isNaN(maxLon)) {
      return;
    }

    if (minLat < -85.05 || maxLat > 85.05 || minLon < -180 || maxLon > 180) {
      setInputError(t.map.invalidCoordsError);
      return;
    }

    setInputError(null);
    const normalized: BoundingBox = {
      min_lat: Math.min(minLat, maxLat),
      max_lat: Math.max(minLat, maxLat),
      min_lon: Math.min(minLon, maxLon),
      max_lon: Math.max(minLon, maxLon),
    };

    setCustomBbox(normalized);
    onCustomAOIChange?.(normalized);
  };

  // Reset custom AOI to the benchmark region defaults
  const handleResetAOI = () => {
    setCustomBbox(null);
    setIsDrawing(false);
    setInputError(null);
    onCustomAOIChange?.(null);
  };

  const center: [number, number] = useMemo(() => {
    return currentRegion?.center ?? [-9.5, -75.75];
  }, [currentRegion]);

  const zoom: number = useMemo(() => {
    return currentRegion?.default_zoom ?? 6;
  }, [currentRegion]);

  return (
    <section
      data-testid="map-aoi-selector"
      aria-label={t.map.title}
      className={`bg-space-900 border border-space-800 rounded-xl overflow-hidden shadow-sm flex flex-col ${className}`}
    >
      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-space-950/70 border-b border-space-800 px-4 py-3 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shrink-0">
            <Globe2 className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
              {t.map.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 truncate">{t.map.subtitle}</p>
          </div>
        </div>

        {/* Layer Controls & Drawing Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          {/* Layer Switcher */}
          <div className="flex items-center bg-space-950 border border-space-700 rounded-md px-2.5 py-1 text-xs focus-within:border-cyan-400">
            <Layers className="w-3.5 h-3.5 text-cyan-300 mr-1.5 shrink-0" aria-hidden="true" />
            <select
              data-testid="layer-select"
              aria-label={t.map.layerSelectAria}
              value={activeLayer}
              onChange={(e) => setActiveLayer(e.target.value as MapLayerId)}
              className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer truncate max-w-47.5 sm:max-w-none"
            >
              <option value="dark_matter" className="bg-space-900 text-white">
                {t.map.layers.darkMatter}
              </option>
              <option value="modis_truecolor" className="bg-space-900 text-white">
                {t.map.layers.modisTrueColor}
              </option>
              <option value="viirs_truecolor" className="bg-space-900 text-white">
                {t.map.layers.viirsTrueColor}
              </option>
            </select>
          </div>

          {/* Draw AOI Button */}
          <button
            type="button"
            data-testid="btn-toggle-draw"
            onClick={() => setIsDrawing((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
              isDrawing
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 ring-2 ring-amber-400/30'
                : 'bg-space-950 border-space-700 hover:border-cyan-400 text-slate-200'
            }`}
          >
            <Pencil className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{isDrawing ? t.map.drawingActive : t.map.drawAoiButton}</span>
          </button>

          {/* Reset AOI (if custom box set) */}
          {customBbox && (
            <button
              type="button"
              data-testid="btn-reset-aoi"
              onClick={handleResetAOI}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-space-950 border border-space-700 hover:border-red-400 text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400 shrink-0" aria-hidden="true" />
              <span>{t.map.resetAoiButton}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Information / Telemetry Sub-Bar ─────────────────────────────────── */}
      <div className="bg-space-950/40 border-b border-space-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Active GIBS observation date badge */}
          {activeLayer !== 'dark_matter' && (
            <span
              data-testid="gibs-date-badge"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-400/35 text-cyan-300 font-mono text-[11px]"
            >
              <Satellite className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                {t.map.gibsReferenceDateLabel}: <strong>{gibsReferenceDate}</strong>
              </span>
            </span>
          )}

          {/* Active drawing status banner */}
          {isDrawing && (
            <span
              data-testid="draw-status-indicator"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 font-medium text-[11px] animate-pulse"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t.map.drawingActive}</span>
            </span>
          )}

          {/* Active fire cell toggle & count */}
          <label className="inline-flex items-center gap-1.5 text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              data-testid="toggle-fire-cells"
              checked={showFireCells}
              onChange={(e) => setShowFireCells(e.target.checked)}
              className="rounded bg-space-900 border-space-700 text-cyan-400 focus:ring-cyan-400/40"
            />
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
              <span>
                {t.map.layers.fireCells} ({visibleCells.length})
              </span>
            </span>
          </label>
        </div>

        {/* Validation error tag if invalid coordinates */}
        {inputError && (
          <div
            data-testid="coordinate-validation-error"
            className="inline-flex items-center gap-1.5 text-red-400 text-[11px] font-medium"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{inputError}</span>
          </div>
        )}
      </div>

      {/* ── Leaflet Interactive Map Viewport ─────────────────────────────────── */}
      <div
        data-testid="map-container"
        className="relative w-full"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          minZoom={2}
          maxZoom={12}
          className="w-full h-full z-10 bg-space-950"
          style={{ background: '#0B0F17' }}
        >
          {/* Automatic Smooth Bounds Controller */}
          <MapCameraController bbox={effectiveBbox} isDrawing={isDrawing} />

          {/* Drawing Handler */}
          <BoundingBoxDrawHandler
            isDrawing={isDrawing}
            onDrawComplete={handleDrawComplete}
            onTransientUpdate={setTransientBounds}
          />

          {/* Base Cartographic / Satellite Tile Layer */}
          {!disableRemoteTiles && (
            <TileLayer
              key={`${activeLayer}-${gibsReferenceDate}`}
              url={tileUrl}
              attribution={MAP_LAYERS[activeLayer].attribution}
              maxZoom={MAP_LAYERS[activeLayer].maxZoom}
              minZoom={MAP_LAYERS[activeLayer].minZoom}
              subdomains={MAP_LAYERS[activeLayer].subdomains ?? []}
            />
          )}

          {/* Bounding Box Visual Rectangle */}
          <Rectangle
            bounds={[
              [effectiveBbox.min_lat, effectiveBbox.min_lon],
              [effectiveBbox.max_lat, effectiveBbox.max_lon],
            ]}
            pathOptions={{
              color: customBbox ? '#F59E0B' : '#06B6D4',
              weight: 2,
              dashArray: '6, 6',
              fillOpacity: 0.08,
            }}
          />

          {/* Transient rectangle while drawing */}
          {transientBounds && (
            <Rectangle
              bounds={transientBounds}
              pathOptions={{
                color: '#F59E0B',
                weight: 2,
                dashArray: '4, 4',
                fillOpacity: 0.15,
              }}
            />
          )}

          {/* Active 0.01-degree Fire Cell Density Clusters */}
          {showFireCells &&
            visibleCells.map((cell) => {
              const style = resolveCellStyle(cell, activePalette);
              return (
                <CircleMarker
                  key={`${cell.region_id}-${cell.grid_x}-${cell.grid_y}`}
                  center={[cell.lat, cell.lon]}
                  radius={style.radius}
                  pathOptions={{
                    fillColor: style.fillColor,
                    color: style.color,
                    weight: style.weight,
                    fillOpacity: style.fillOpacity,
                  }}
                  eventHandlers={{
                    click: () => onCellSelect?.(cell),
                  }}
                >
                  <Popup className="aerospace-popup">
                    <div className="p-1 min-w-52.5 space-y-1.5 text-xs text-slate-200">
                      <div className="font-bold text-white border-b border-slate-700 pb-1 flex items-center justify-between">
                        <span>{t.map.cellPopup.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-space-950 text-cyan-300">
                          {cell.region_id}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-cyan-300">
                        {cell.lat.toFixed(3)}°, {cell.lon.toFixed(3)}°
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] pt-1">
                        <div>
                          <span className="text-slate-400 block">{t.map.cellPopup.totalAfcd}:</span>
                          <strong className="text-white font-mono">{cell.total_afcd}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{t.map.cellPopup.peakMonth}:</span>
                          <strong className="text-white font-mono">
                            {t.monthNamesShort[cell.peak_month - 1] ?? cell.peak_month}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{t.map.cellPopup.meanFrp}:</span>
                          <strong className="text-white font-mono">{cell.mean_frp_mw.toFixed(1)} MW</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">{t.map.cellPopup.nightFraction}:</span>
                          <strong className="text-white font-mono">
                            {(cell.night_fraction * 100).toFixed(1)}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
        </MapContainer>
      </div>

      {/* ── Bounding Box Coordinate Inputs & Benchmark Region Pills ─────────── */}
      <div className="bg-space-950 border-t border-space-800 p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Coordinate Inputs */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5 shrink-0">
            <Maximize2 className="w-3.5 h-3.5 text-cyan-300" aria-hidden="true" />
            <span>{t.map.coordinatesHeading}:</span>
          </span>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 font-mono text-xs">
            <label className="flex items-center gap-1 bg-space-900 border border-space-700 rounded px-2 py-1">
              <span className="text-slate-400 text-[10px] uppercase">{t.map.minLat}:</span>
              <input
                type="number"
                step="0.05"
                data-testid="input-min-lat"
                value={coords.minLat}
                onChange={(e) => handleCoordinateChange('minLat', e.target.value)}
                className="w-16 bg-transparent text-white focus:outline-none"
              />
            </label>

            <label className="flex items-center gap-1 bg-space-900 border border-space-700 rounded px-2 py-1">
              <span className="text-slate-400 text-[10px] uppercase">{t.map.maxLat}:</span>
              <input
                type="number"
                step="0.05"
                data-testid="input-max-lat"
                value={coords.maxLat}
                onChange={(e) => handleCoordinateChange('maxLat', e.target.value)}
                className="w-16 bg-transparent text-white focus:outline-none"
              />
            </label>

            <label className="flex items-center gap-1 bg-space-900 border border-space-700 rounded px-2 py-1">
              <span className="text-slate-400 text-[10px] uppercase">{t.map.minLon}:</span>
              <input
                type="number"
                step="0.05"
                data-testid="input-min-lon"
                value={coords.minLon}
                onChange={(e) => handleCoordinateChange('minLon', e.target.value)}
                className="w-16 bg-transparent text-white focus:outline-none"
              />
            </label>

            <label className="flex items-center gap-1 bg-space-900 border border-space-700 rounded px-2 py-1">
              <span className="text-slate-400 text-[10px] uppercase">{t.map.maxLon}:</span>
              <input
                type="number"
                step="0.05"
                data-testid="input-max-lon"
                value={coords.maxLon}
                onChange={(e) => handleCoordinateChange('maxLon', e.target.value)}
                className="w-16 bg-transparent text-white focus:outline-none"
              />
            </label>
          </div>
        </div>

        {/* Quick Benchmark Region Switcher Pills */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Quick AOI:</span>
          {regionsList.map((r) => (
            <button
              key={r.id}
              type="button"
              data-testid={`quick-region-${r.id}`}
              onClick={() => {
                setRegionId(r.id);
                setCustomBbox(null);
                onCustomAOIChange?.(null);
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                selectedRegionId === r.id && !customBbox
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-bold'
                  : 'bg-space-900 text-slate-300 border-space-800 hover:border-space-600'
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

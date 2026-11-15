/**
 * NASA Space Apps Challenge 2026 — TerraSpot Harmonizer
 * Custom NASA FIRMS CSV Ingestion & In-Memory Validation Modal
 * Conforms to WCAG 2.1 AA accessibility guidelines and Challenge 15 Requirement R7.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  RotateCcw,
  CloudSun,
  Flame,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useLanguage, useRegion } from '../context';
import {
  parseFIRMSCSV,
  synthesizeHarmonizedCubeFromFIRMS,
} from '../engine/firmsIngestion';
import type {
  FIRMSValidationReport,
  RawFIRMSPoint,
  RegionCube,
} from '../types';

export interface CustomCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomCube: (customCube: RegionCube) => void;
  onResetToBenchmark?: () => void;
  isCustomActive?: boolean;
}

export const CustomCSVModal: React.FC<CustomCSVModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomCube,
  onResetToBenchmark,
  isCustomActive = false,
}) => {
  const { t } = useLanguage();
  const { currentRegion } = useRegion();

  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<FIRMSValidationReport | null>(null);
  const [points, setPoints] = useState<RawFIRMSPoint[]>([]);
  const [weatherMetrics, setWeatherMetrics] = useState<Record<string, number> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch complementary Meteomatics fire weather context
  useEffect(() => {
    if (!isOpen) return;

    fetch('/data/meteomatics_weather.json')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data) => {
        const regionId = currentRegion?.id ?? 'PE-HCO';
        const regionMetrics = data?.regions?.[regionId]?.metrics;
        if (regionMetrics) {
          setWeatherMetrics(regionMetrics);
        }
      })
      .catch(() => {
        // Fallback gracefully without breaking modal
      });
  }, [isOpen, currentRegion?.id]);

  // Handle keyboard Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const result = await parseFIRMSCSV(file);
      setReport(result.report);
      setPoints(result.points);
    } catch (err) {
      setReport({
        isValid: false,
        fileName: file.name,
        fileSizeBytes: file.size,
        totalRows: 0,
        validVegetationHotspots: 0,
        excludedRows: {
          nonVegetationType: 0,
          lowConfidence: 0,
          invalidCoordinates: 0,
          missingDate: 0,
        },
        detectedSensors: [],
        dateRange: { startDate: '', endDate: '' },
        boundingBox: { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 },
        errorMessages: [err instanceof Error ? err.message : t.customCsvModal.errors.parseError],
        warningMessages: [],
      });
      setPoints([]);
    } finally {
      setIsLoading(false);
    }
  }, [t.customCsvModal.errors.parseError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        void processFile(file);
      }
    },
    [processFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        void processFile(file);
      }
    },
    [processFile],
  );

  const handleLoadSample = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/data/sample_firms_huanuco.csv');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const csvText = await res.text();
      const result = await parseFIRMSCSV(csvText, 'sample_firms_huanuco.csv');
      setReport(result.report);
      setPoints(result.points);
    } catch (err) {
      setReport({
        isValid: false,
        fileName: 'sample_firms_huanuco.csv',
        fileSizeBytes: 0,
        totalRows: 0,
        validVegetationHotspots: 0,
        excludedRows: {
          nonVegetationType: 0,
          lowConfidence: 0,
          invalidCoordinates: 0,
          missingDate: 0,
        },
        detectedSensors: [],
        dateRange: { startDate: '', endDate: '' },
        boundingBox: { minLat: 0, maxLat: 0, minLon: 0, maxLon: 0 },
        errorMessages: [err instanceof Error ? err.message : t.customCsvModal.errors.parseError],
        warningMessages: [],
      });
      setPoints([]);
    } finally {
      setIsLoading(false);
    }
  }, [t.customCsvModal.errors.parseError]);

  const handleApply = useCallback(() => {
    if (!report || !report.isValid || points.length === 0) return;
    const synthesizedCube = synthesizeHarmonizedCubeFromFIRMS(points, report, currentRegion);
    onApplyCustomCube(synthesizedCube);
    onClose();
  }, [report, points, currentRegion, onApplyCustomCube, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-csv-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-space-900 border border-space-700 rounded-xl shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-space-800 bg-space-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
              <Upload className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="custom-csv-modal-title" className="text-base sm:text-lg font-bold text-white">
                {t.customCsvModal.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{t.customCsvModal.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            data-testid="modal-close-button"
            onClick={onClose}
            aria-label={t.customCsvModal.closeButton}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                : 'border-space-700 hover:border-cyan-400/60 bg-space-950/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="p-3 rounded-full bg-space-800 text-cyan-300 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">
              {isDragging ? t.customCsvModal.dropzoneActive : t.customCsvModal.dropzoneTitle}
            </p>
            <p className="text-xs text-slate-400 mt-1">{t.customCsvModal.dropzoneSubtitle}</p>

            <div className="flex items-center gap-2 mt-4">
              <button
                type="button"
                className="px-3 py-1.5 rounded bg-space-800 hover:bg-space-700 text-white font-medium border border-space-700 text-xs transition-colors"
              >
                {t.customCsvModal.selectFileButton}
              </button>
              <span className="text-slate-500">|</span>
              <button
                type="button"
                data-testid="load-sample-dataset-button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleLoadSample();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40 text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.customCsvModal.loadSampleButton}</span>
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-4 rounded-lg bg-space-950 border border-cyan-500/40 flex items-center justify-center gap-2 text-cyan-300 font-mono">
              <span className="w-3 h-3 rounded-full border-2 border-cyan-300 border-t-transparent animate-spin" />
              <span>{t.customCsvModal.parsingFile}</span>
            </div>
          )}

          {/* Validation Diagnostics Report */}
          {report && !isLoading && (
            <div
              className={`rounded-xl p-4 border ${
                report.isValid
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-rose-950/20 border-rose-500/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {report.isValid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-emerald-300 text-sm">
                      {t.customCsvModal.report.statusValid}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="font-bold text-rose-300 text-sm">
                      {t.customCsvModal.report.statusInvalid}
                    </span>
                  </>
                )}
              </div>

              {/* Error messages if invalid */}
              {report.errorMessages.length > 0 && (
                <div className="space-y-1 my-2">
                  {report.errorMessages.map((msg, i) => (
                    <p key={i} className="text-rose-300 font-mono text-xs">
                      • {msg}
                    </p>
                  ))}
                </div>
              )}

              {/* Telemetry Grid */}
              {report.isValid && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-space-800">
                  <div className="bg-space-950/80 p-2.5 rounded border border-space-800">
                    <p className="text-[10px] text-slate-400 font-mono uppercase">
                      {t.customCsvModal.report.totalRows}
                    </p>
                    <p className="text-base font-bold font-mono text-white mt-0.5">
                      {report.totalRows.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-space-950/80 p-2.5 rounded border border-space-800">
                    <p className="text-[10px] text-slate-400 font-mono uppercase">
                      {t.customCsvModal.report.validHotspots}
                    </p>
                    <p className="text-base font-bold font-mono text-emerald-400 mt-0.5">
                      {report.validVegetationHotspots.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-space-950/80 p-2.5 rounded border border-space-800">
                    <p className="text-[10px] text-slate-400 font-mono uppercase">
                      {t.customCsvModal.report.detectedSensors}
                    </p>
                    <p className="text-xs font-semibold text-cyan-300 mt-1 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>{report.detectedSensors.join(', ')}</span>
                    </p>
                  </div>

                  <div className="bg-space-950/80 p-2.5 rounded border border-space-800">
                    <p className="text-[10px] text-slate-400 font-mono uppercase">
                      {t.customCsvModal.report.dateRange}
                    </p>
                    <p className="text-[11px] font-mono text-slate-200 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>
                        {report.dateRange.startDate} → {report.dateRange.endDate}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Bounding Box Information */}
              {report.isValid && (
                <div className="mt-2.5 pt-2 border-t border-space-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      {t.customCsvModal.report.boundingBox}: [{report.boundingBox.minLat},{' '}
                      {report.boundingBox.minLon}] → [{report.boundingBox.maxLat},{' '}
                      {report.boundingBox.maxLon}]
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Meteomatics Fire Weather Global Offer Context Card */}
          {weatherMetrics && (
            <div className="p-3.5 rounded-xl bg-space-950/90 border border-space-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white text-xs">
                    {t.customCsvModal.report.fireWeatherIndicators}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  NASA Space Apps Partner
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-space-900/80 p-2 rounded border border-space-800">
                  <span className="text-[10px] text-slate-400 block">
                    {t.customCsvModal.weatherCard.fireWarningIndex}
                  </span>
                  <span className="text-sm font-bold font-mono text-amber-400 flex items-center gap-1 mt-0.5">
                    <Flame className="w-3.5 h-3.5" />
                    {weatherMetrics['forest_fire_warning:idx']?.toFixed(1) ?? '0.0'}
                  </span>
                </div>

                <div className="bg-space-900/80 p-2 rounded border border-space-800">
                  <span className="text-[10px] text-slate-400 block">
                    {t.customCsvModal.weatherCard.soilMoisture}
                  </span>
                  <span className="text-sm font-bold font-mono text-cyan-300 mt-0.5 block">
                    {weatherMetrics['evapotranspiration_24h:mm']?.toFixed(2) ?? '0.00'} mm
                  </span>
                </div>

                <div className="bg-space-900/80 p-2 rounded border border-space-800">
                  <span className="text-[10px] text-slate-400 block">
                    {t.customCsvModal.weatherCard.windSpeed}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-200 mt-0.5 block">
                    {weatherMetrics['wind_speed_10m:ms']?.toFixed(1) ?? '0.0'} m/s
                  </span>
                </div>

                <div className="bg-space-900/80 p-2 rounded border border-space-800">
                  <span className="text-[10px] text-slate-400 block">
                    {t.customCsvModal.weatherCard.relativeHumidity}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-200 mt-0.5 block">
                    {weatherMetrics['relative_humidity_2m:p']?.toFixed(1) ?? '0.0'}%
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">
                {t.customCsvModal.weatherCard.providerNote}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-space-800 bg-space-950/90">
          <div>
            {isCustomActive && onResetToBenchmark && (
              <button
                type="button"
                data-testid="reset-benchmark-modal-button"
                onClick={() => {
                  onResetToBenchmark();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-space-800 hover:bg-space-700 text-slate-300 font-semibold border border-space-700 text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.customCsvModal.resetButton}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-space-800 hover:bg-space-700 text-slate-300 font-medium border border-space-700 text-xs transition-colors cursor-pointer"
            >
              {t.customCsvModal.closeButton}
            </button>

            <button
              type="button"
              data-testid="apply-custom-cube-button"
              disabled={!report?.isValid || points.length === 0}
              onClick={handleApply}
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 disabled:bg-space-800 disabled:text-slate-500 disabled:border-space-800 disabled:cursor-not-allowed text-white font-semibold border border-cyan-500/40 text-xs transition-colors shadow-sm cursor-pointer"
            >
              {t.customCsvModal.applyButton}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

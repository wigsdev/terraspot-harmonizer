# Implementation Plan: Standardized CSV Exporter and Custom NASA FIRMS CSV Ingestion

**Branch**: `feat/T-10-csv-export-upload` | **Date**: 2026-11-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-csv-export-upload/spec.md`

---

## Summary

Implement the Standardized CSV Exporter (`src/engine/csvExporter.ts`), Custom FIRMS Ingestion Engine (`src/engine/firmsIngestion.ts`), and the accessible Ingestion Modal (`src/components/CustomCSVModal.tsx`) fulfilling NASA Space Apps Challenge 15 Requirement R7. The exporter serializes the active regional cube into a 27-column RFC 4180 compliant CSV dataset aligning with Microsoft Planetary Computer STAC conventions and referencing Meteomatics fire weather data. The ingestion modal provides an accessible client-side drag-and-drop interface powered by `PapaParse` that validates raw FIRMS exports in browser memory, aggregates daily $0.01^\circ$ active fire cell-days (AFCD), applies seasonal calibration, and dynamically re-renders all dashboard visualization modules with full bilingual (EN/ES) support.

---

## Technical Context

**Language/Version**: TypeScript 5.8 / React 19.3 / Node.js 24.x (pnpm 12.21.0)  
**Primary Dependencies**: `papaparse` (^5.5.0), `@types/papaparse` (^5.3.15), `lucide-react`, Tailwind CSS v4, `recharts`  
**Storage**: In-browser client-side memory (`RegionContext` state) + static bundled sample (`public/data/sample_firms_huanuco.csv`)  
**Testing**: Vitest 5.1.0 + `@testing-library/react` + `@testing-library/user-event`  
**Target Platform**: Modern desktop & mobile browsers (Edge-first SPA, zero backend dependencies)  
**Project Type**: Web Application / Geospatial Science Dashboard  
**Performance Goals**: CSV export generation $< 250\text{ ms}$; in-memory parsing of 10,000 FIRMS records $< 1.5\text{ s}$; instantaneous dashboard re-render  
**Constraints**: WCAG 2.1 AA compliant modal dialogs; zero data transmission to external servers; strict RFC 4180 formatting  
**Scale/Scope**: 5 benchmark regions, 27-year time series (324 monthly records), custom FIRMS uploads up to 50,000 rows  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Rule | Evaluation & Strategy | Status |
| :--- | :--- | :---: |
| **I. Dual-Language & Communication Protocol** | Direct chat with `@wigsdev` is 100% Spanish. Code, types, tests, commit messages, and documentation are 100% English. UI supports seamless EN/ES switching. | ✅ PASS |
| **II. Package Management & Toolchain** | Uses `pnpm` exclusively on Node.js 24.x. No `npm` or `yarn`. | ✅ PASS |
| **III. Harmonization Rigor** | Exporter outputs exact 27 canonical columns with AFCD, $\beta_m$, $H_{y,m}$, medians, anomalies, and regime indicators. Ingestor applies Stage 1 (type 0 + confidence) and Stage 2 (daily $0.01^\circ$ AFCD). | ✅ PASS |
| **IV. Visual Accessibility (WCAG 2.1 AA)** | Modal follows WAI-ARIA dialog practices (keyboard trap, Escape key, `#0B0F17` dark aerospace palette, visible focus rings, colorblind-safe badges). | ✅ PASS |
| **V. NASA Regulatory & Global Offers** | CSV metadata aligns with Microsoft Planetary Computer STAC; references Meteomatics Weather API integration; no AI-generated NASA logos. | ✅ PASS |
| **VI. SDD & Commit Gatekeeping** | Following SDD pipeline. Zero auto-commits; will present diff and CHANGELOG entry for explicit developer approval. | ✅ PASS |

---

## Project Structure

### Documentation (this feature)

```text
specs/009-csv-export-upload/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── csv-exporter-contract.ts
│   └── custom-csv-modal-contract.ts
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── CustomCSVModal.tsx       # New accessible drag-and-drop FIRMS modal
│   ├── Navbar.tsx               # Updated with "Upload FIRMS CSV" & "Download CSV"
│   └── ...
├── context/
│   ├── RegionContext.tsx        # Updated with custom cube injection & reset methods
│   └── LanguageContext.tsx      # Updated with modal and export translation strings
├── engine/
│   ├── csvExporter.ts           # Pure TS RFC 4180 27-column serializer and downloader
│   ├── firmsIngestion.ts        # Client-side PapaParse parser, validator & AFCD synthesizer
│   └── index.ts                 # Re-exports for engine modules
├── types/
│   ├── csv.ts                   # Standardized CSV & ingestion interfaces
│   ├── language.ts              # Extended with translation contracts
│   └── index.ts                 # Re-exports
public/
└── data/
    ├── sample_firms_huanuco.csv # Bundled benchmark demonstration dataset
    └── meteomatics_weather.json # Validated fire weather indicator cache
tests/
├── csvExporter.test.ts          # Unit tests for 27-column RFC 4180 generation & download
├── firmsIngestion.test.ts       # Unit tests for FIRMS parsing, masking & AFCD aggregation
└── CustomCSVModal.test.tsx      # Component integration & accessibility tests
```

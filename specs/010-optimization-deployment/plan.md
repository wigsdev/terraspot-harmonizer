# Implementation Plan: T-11 Quality Audit, Visual Accessibility & Public Production Deployment

**Branch**: `feat/T-11-optimization-deployment` | **Date**: 2026-11-15 | **Spec**: [specs/010-optimization-deployment/spec.md](file:///home/wigsdev/GitHub/hackaton-nasa/specs/010-optimization-deployment/spec.md)

**Input**: Feature specification from `specs/010-optimization-deployment/spec.md`

## Summary

Optimize the production build pipeline via deterministic vendor code splitting in `vite.config.ts` (eliminating the monolithic > 500 kB chunk warning and achieving < 450 kB per bundle), perform visual accessibility and mobile tooltip clamping audits, configure public HTTPS deployment manifests (`vercel.json`), and document custom mission domain integration (GoDaddy Registry / Porkbun NASA Global Offer).

## Technical Context

**Language/Version**: TypeScript 5.9.x, Node.js v24.x (`pnpm 12.21.0`), Python 3.13.x  
**Primary Dependencies**: React 19, Vite 8, Tailwind CSS v4, Leaflet 1.9, Recharts 2.15, PapaParse 5.5, Lucide-React 1.72  
**Storage**: Client-side in-memory state (`RegionContext`), static pre-computed JSON cubes (`public/data/*.json`)  
**Testing**: Vitest 5.1.0, `@testing-library/react`, JSDOM  
**Target Platform**: Evergreen desktop & mobile browsers, Edge CDN (Vercel / GitHub Pages)  
**Project Type**: Single-Page Application (SPA) WebGIS & Climate Analytics Dashboard  
**Performance Goals**: Maximum JS chunk $< 450\text{ kB}$ uncompressed ($< 120\text{ kB}$ gzipped), 0 build warnings, 60 FPS UI transitions  
**Constraints**: Fully unauthenticated public HTTPS URL (NASA Challenge 15 Requirement R8), 100% client-side execution, WCAG 2.1 AA colorblind accessibility  
**Scale/Scope**: 5 core regional cubes (2000–2026), dynamic client-side FIRMS ingestion, 27-column RFC 4180 export

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                 | Check                                                                                                                                                                | Status  |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| I. Dual-Language & Communication Protocol | Interactions with @wigsdev in 100% Spanish; code, commits, and NASA deliverables in 100% English.                                                                    | ✅ PASS |
| II. Toolchain Strictness                  | `pnpm` exclusively on Node.js v24.x. Prohibit `npm`/`yarn`.                                                                                                          | ✅ PASS |
| III. Harmonization Rigor                  | Preserves all MODIS C6.1 + VIIRS C2 mathematical formulas ($H_{y,m}$, $\beta_m$, AFCD, $I_{\text{regime}}$).                                                         | ✅ PASS |
| IV. Universal Visual Accessibility        | WCAG 2.1 AA compliant colorblind ramps (Inferno, Viridis, Cividis, Diverging Blue-White-Red). Mobile clamped tooltips.                                               | ✅ PASS |
| V. NASA Space Apps Compliance             | Unrestricted public HTTPS access (R8). Disclosed AI assistance in metadata. No AI-generated NASA logos.                                                              | ✅ PASS |
| VI. SDD & Commit Gatekeeping              | Complete Spec Kit lifecycle (`specify` $\rightarrow$ `plan` $\rightarrow$ `tasks` $\rightarrow$ `analyze` $\rightarrow$ `implement`). Explicit commit authorization. | ✅ PASS |

## Project Structure

### Documentation (this feature)

```text
specs/010-optimization-deployment/
├── spec.md                  # Feature Specification
├── checklists/
│   └── requirements.md      # Spec Quality Checklist
├── plan.md                  # Implementation Plan (this file)
├── research.md              # Research on Vite chunking & Vercel edge deployment
├── data-model.md            # Chunking, deployment & tooltip schemas
├── contracts/
│   └── deployment-contract.ts # Deployment & build metrics interfaces
├── quickstart.md            # Verification & build quickstart guide
└── tasks.md                 # Generated tasks (speckit-tasks output)
```

### Source Code (repository root)

```text
/
├── vite.config.ts           # Vite build & chunking configuration
├── vercel.json              # Edge hosting SPA rewrites & security headers
├── README.md                # Updated with live deployment URL & Global Offers
├── docs/
│   ├── backlog.md           # Task T-11 tracking
│   └── 05-submission-pitch-rubric-plan.md # Global Offers & public deployment details
├── src/
│   ├── components/
│   │   ├── BurningCalendarMatrix.tsx # Responsive mobile tooltip bounds
│   │   ├── ClimatologyAnomalyChart.tsx # Chart responsive container & tooltips
│   │   └── FireRegimePanel.tsx      # Accessible focus & responsive cards
│   └── App.tsx              # App container layout & meta tags
└── tests/                   # Regression test suite (113+ passing tests)
```

**Structure Decision**: Standardized Vite SPA architecture with granular vendor chunking in `vite.config.ts` and static edge hosting manifest in `vercel.json`.

## Complexity Tracking

_No violations detected. Zero unnecessary abstractions introduced._

# Implementation Plan: Foundational Web Application Scaffolding

**Branch**: `feat/T-02-scaffolding-web` | **Date**: 2026-11-14 | **Spec**: [specs/001-web-scaffolding/spec.md](spec.md)

**Input**: Feature specification from `specs/001-web-scaffolding/spec.md`

---

## Summary

Establish the foundational frontend architecture for **TerraSpot Harmonizer** using modern, stable 2026 technologies: **Vite 8.x** (with native Rolldown bundler), **React 19.x** (v19.3.1), **TypeScript 7.x** (v7.0.2), **Tailwind CSS 4.x** (v4.3.5 via `@tailwindcss/vite`), **Vitest 5.x** (v5.1.0 with JSDOM), and **Husky 9.x** (v9.1.7). The architecture delivers a zero-backend, edge-native Single Page Application configured with the dark aerospace design system (`#0B0F17`, `#131B2E`), strict modular directory layout (`src/engine/`, `src/components/`, `src/types/`), and automated quality gates enforcing Conventional Commits and clean builds.

---

## Technical Context

**Language/Version**: TypeScript `7.0.2` on Node.js `v24.20.0 LTS`  
**Package Manager**: `pnpm 12.21.0` (strictly enforced; `npm`/`yarn` prohibited)  
**Primary Dependencies**: React `19.3.1`, `@vitejs/plugin-react` `4.x`, Tailwind CSS `4.3.5` (`@tailwindcss/vite`), Lucide React `1.16.x`, Recharts `2.15.x`, Leaflet `1.9.x`, React-Leaflet `5.x`, PapaParse `5.5.x`  
**Storage**: Client-side in-memory state & pre-indexed JSON cubes in `public/data/` (zero remote database)  
**Testing**: Vitest `5.1.0` with `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom`  
**Target Platform**: Modern Evergreen Web Browsers (Chrome, Firefox, Safari, Edge) via static edge hosting  
**Project Type**: Edge-Native Single Page Application (SPA)  
**Performance Goals**: HMR reload `< 100ms`, local dev server start `< 1s`, production build `< 5s`, Vitest test run `< 3s`  
**Constraints**: Zero backend dependencies, offline-capable client execution, WCAG 2.1 AA accessible color ramps  
**Scale/Scope**: Initial scaffolding covering 12 backlog tasks, 4 sprints, and 27-year time series visualization  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Constitutional Principle | Architectural Compliance Status | Verification Mechanism |
| :--- | :--- | :--- |
| **I. Dual-Language Governance** | **PASS** | Developer reporting in Spanish; all code, types, comments, and UI strings strictly in professional English. |
| **II. Package Manager Strictness** | **PASS** | `pnpm 12.21.0` specified in `package.json#engines` and `packageManager`. `only-allow pnpm` preinstall script blocks npm/yarn. |
| **III. Mathematical & Physical Rigor** | **PASS** | Modular separation: pure TypeScript scientific engine in `src/engine/` isolated from React presentation in `src/components/`. |
| **IV. Visual Accessibility (WCAG 2.1 AA)** | **PASS** | Design tokens in `src/index.css` enforce dark aerospace canvas (`#0B0F17`) and colorblind-safe palettes (*Inferno*, *Viridis*, *Cividis*, *Diverging*). Fluid Mobile-First progression ($1 \rightarrow 2 \rightarrow 4$ cols) and touch-accessible controls ($\ge 40\text{px}$) guarantee universal usability across mobile, tablet, and desktop. |
| **V. NASA Space Apps Compliance** | **PASS** | Pure client-side edge deployment ensuring zero authentication walls, zero AI-altered NASA logos, and sub-second load times for judges. |
| **VI. Commit Gatekeeping & SDD** | **PASS** | Husky hooks (`.husky/pre-commit` and `.husky/commit-msg`) enforce Conventional Commits and 100% test pass rate prior to commit. |

---

## Project Structure

### Documentation (`specs/001-web-scaffolding/`)

```text
specs/001-web-scaffolding/
├── spec.md              # Feature specification & user stories
├── plan.md              # This implementation plan
├── research.md          # Technical research & ecosystem compatibility (Vite 8, TS 7, Tailwind 4)
├── data-model.md        # Architectural entities & TypeScript schemas
├── quickstart.md        # Local installation & verification quickstart guide
├── contracts/
│   └── package.contract.json # Complete dependency & script contract
└── checklists/
    └── requirements.md  # Quality checklist (16/16 passed)
```

### Source Code Layout (`src/`, `tests/`, `public/`)

```text
hackaton-nasa/
├── .husky/
│   ├── commit-msg       # Conventional Commits regex linting
│   └── pre-commit       # pnpm typecheck && pnpm test:run && pnpm build
├── public/
│   ├── data/            # Pre-indexed regional JSON cubes and sample FIRMS CSVs
│   └── favicon.svg      # Satellite orbital icon
├── src/
│   ├── assets/          # Static icons & mission vectors
│   ├── components/      # React 19 UI presentation components
│   │   ├── layout/      # Header, Navigation bar, Status bar
│   │   ├── calendar/    # Burning Activity Calendar Matrix
│   │   ├── map/         # Leaflet WebGIS Canvas & Bounding Box selector
│   │   ├── charts/      # Recharts Climatology & Regime scatter plots
│   │   └── modal/       # CSV Uploader & Sensor Audit modals
│   ├── engine/          # Pure TypeScript harmonization engine (zero React deps)
│   │   ├── gridBinning.ts
│   │   ├── harmonizer.ts
│   │   ├── climatology.ts
│   │   ├── regimeClassifier.ts
│   │   ├── colorRamps.ts
│   │   └── csvExporter.ts
│   ├── types/           # Canonical TypeScript interfaces
│   │   ├── firms.ts
│   │   ├── harmonization.ts
│   │   ├── region.ts
│   │   └── palette.ts
│   ├── App.tsx          # Main Application Shell
│   ├── index.css        # Tailwind v4 CSS-first theme & design tokens
│   └── main.tsx         # Application entry point
├── tests/
│   ├── setup.ts         # Vitest + Jest DOM matchers
│   └── smoke.test.ts    # Baseline test runner verification
├── package.json         # Version 0.2.0, dependencies & scripts
├── tsconfig.json        # Solution-level TypeScript configuration
├── tsconfig.app.json    # Application TypeScript configuration (strict: true)
├── tsconfig.node.json   # Build-tooling TypeScript configuration
├── vite.config.ts       # Vite 8 + React 19 + Tailwind v4 configuration
└── vitest.config.ts     # Vitest 5 test configuration
```

**Structure Decision**: Single-project edge Single Page Application (Option 1). Cleanly isolates computational remote sensing algorithms (`src/engine/`) from reactive UI presentation (`src/components/`), enabling exhaustive unit testing without DOM overhead.

---

## Complexity Tracking

> **No constitutional violations detected. Architecture strictly adheres to all non-negotiable principles.**

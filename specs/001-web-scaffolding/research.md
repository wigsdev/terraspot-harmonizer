# Technical Research: Foundational Web Application Scaffolding

**Feature**: `001-web-scaffolding`  
**Date**: 2026-11-14  
**Author**: Lead Architecture Team / Spec Kit  

---

## 1. Executive Summary & Objective

The objective of Task `T-02` is establishing the high-performance, reproducible frontend development shell for **TerraSpot Harmonizer**. The application is architected as an edge-native, zero-backend Single Page Application (SPA) designed to harmonize 27 years of NASA Earth Observation fire data client-side with sub-second response times.

---

## 2. Technology Stack & Ecosystem Compatibility Analysis

### 2.1 Package Manager & Runtime Baseline
* **Runtime**: Node.js `v24.20.0 LTS`
* **Package Manager**: `pnpm 12.21.0`
* **Rationale**: Strict symlink resolution prevents phantom dependencies and guarantees 100% deterministic dependency trees. In accordance with Constitution Principle II, `npm` and `yarn` are strictly prohibited via `only-allow pnpm`.

### 2.2 Core Bundler & Compiler: Vite 8.x + TypeScript 7.x
* **Vite `8.3.8` (Rolldown Engine)**: 
  * Integrates the native Rust-based Rolldown bundler for production builds, providing sub-second HMR (<100ms) and ultra-fast static tree shaking.
  * Fully compatible with standard Vite configuration syntax (`defineConfig`), eliminating legacy Rollup bottlenecks.
* **React `19.3.1`**:
  * Utilizes `@vitejs/plugin-react@4.x` for optimized JSX transformation and full support for modern React 19 primitives (Actions, useOptimistic, Server/Client components boundary readiness).
* **TypeScript `7.0.2`**:
  * Native compiler performance with strict typing flags (`strict: true`, `noImplicitAny: true`, `verbatimModuleSyntax: true`, `moduleResolution: "bundler"`).
  * High-speed type checking aligned with TS 5.7+ language specifications.

### 2.3 Styling Engine: Tailwind CSS v4.x (`@tailwindcss/vite`)
* **Tailwind CSS `4.3.5`**:
  * Adopts Tailwind v4's CSS-first architecture. Eliminates legacy `tailwind.config.js`, `postcss.config.js`, and `@tailwind` directives.
  * Direct integration via `@tailwindcss/vite` plugin in `vite.config.ts`.
  * Design tokens defined directly in `src/index.css` using `@theme` blocks:
    * `--color-space-950: #0B0F17` (Deep Space Navy background)
    * `--color-space-900: #131B2E` (Instrument Card background)
    * `--color-space-800: #1E293B` (Border / grid lines)
    * `--color-amber-thermal: #FF6F00` (Thermal active fire anomaly)
    * `--color-cyan-radar: #00E5FF` (Orbital track / calibration cyan)
    * `--color-emerald-calm: #10B981` (Normal climatological regime)

### 2.4 Testing Framework: Vitest 5.x
* **Vitest `5.1.0`**:
  * Shares the exact same configuration, resolution pipeline, and plugins as Vite 8.
  * Configured with `jsdom` environment and `@testing-library/react` + `@testing-library/jest-dom` for robust component and algorithmic unit testing.
  * Single command verification: `pnpm test:run` executes in `< 3 seconds`.

### 2.5 Git Hooks & Quality Gates: Husky 9.x
* **Husky `9.1.7`**:
  * Zero-dependency native Git hook runner.
  * Hook 1: `.husky/pre-commit` -> runs `pnpm typecheck`, `pnpm test:run`, and `pnpm build`.
  * Hook 2: `.husky/commit-msg` -> validates Conventional Commits regex:
    `^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9_-]+\))?: .+$`

---

## 3. Risk Assessment & Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Tailwind v4 vs. Legacy PostCSS conflicts** | Build failure | Do not create `postcss.config.js` or `tailwind.config.js`. Use `@tailwindcss/vite` in `vite.config.ts` and `@import "tailwindcss";` in `src/index.css`. |
| **TypeScript 7 moduleResolution mismatch** | Import resolution errors | Specify `"moduleResolution": "bundler"` and `"isolatedModules": true` in `tsconfig.app.json`. |
| **Husky execution in CI / non-git environments** | Hook failure on CI build | Check for `.git` presence in `prepare` script: `git rev-parse --is-inside-work-tree >/dev/null 2>&1 && husky || true`. |

---

## 4. Architectural Decisions Record (ADR)

* **ADR-001 (Toolchain)**: Approved Vite `8.3.x` + React `19.3.x` + TS `7.0.x` + Tailwind `4.3.x` as the project foundation.
* **ADR-002 (Styling)**: Approved CSS-first tokens in `src/index.css` matching `docs/design-system.md`.
* **ADR-003 (Governance)**: Approved Husky `9.x` pre-commit and commit-msg hooks enforcing Conventional Commits.

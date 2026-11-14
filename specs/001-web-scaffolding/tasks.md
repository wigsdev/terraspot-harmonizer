# Tasks: Foundational Web Application Scaffolding

**Input**: Design documents from `specs/001-web-scaffolding/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/package.contract.json`, `quickstart.md`)  
**Feature Branch**: `feat/T-02-scaffolding-web`  
**Prerequisites**: `plan.md` (approved), `spec.md` (validated)  

---

## Phase 1: Setup (Shared Infrastructure & Toolchain)

**Purpose**: Project initialization, package configuration, and toolchain alignment on Vite 8, TypeScript 7, Tailwind CSS 4, and Vitest 5 with pnpm 12 on Node.js 24 LTS.

- [x] T001 Create `package.json` matching `specs/001-web-scaffolding/contracts/package.contract.json` (version `0.2.0`, lifecycle scripts `dev`, `build`, `typecheck`, `test:run`, `prepare`, dependencies, and pnpm engine constraints).
- [x] T002 [P] Configure TypeScript compiler: create `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json` with strict native TS 7 settings (`moduleResolution: "bundler"`, `isolatedModules: true`, `strict: true`).
- [x] T003 [P] Configure Vite 8 bundler in `vite.config.ts` integrating `@vitejs/plugin-react` and `@tailwindcss/vite`.
- [x] T004 [P] Configure Vitest 5 in `vitest.config.ts` with `jsdom` environment and test setup reference.
- [x] T005 Execute `pnpm install` to generate `pnpm-lock.yaml` and install dependencies cleanly without warnings.

---

## Phase 2: Foundational (Modular Directory Layout & Core Contracts)

**Purpose**: Establish folder layout and canonical TypeScript contracts adhering to `docs/03-system-technical-architecture.md`.

- [x] T006 Create directory layout: `src/components/layout/`, `src/engine/`, `src/types/`, `src/assets/`, `public/data/`, and `tests/`.
- [x] T007 [P] Implement core FIRMS detection interfaces in `src/types/firms.ts` (`RawFirmsDetection`, `ActiveFireCellDay`, `SensorType`).
- [x] T008 [P] Implement harmonization and time series contracts in `src/types/harmonization.ts` (`HarmonizedMonthlyRecord`, `SensorEraMapping`).
- [x] T009 [P] Implement benchmark region and geographic contracts in `src/types/region.ts` (`BoundingBox`, `BenchmarkRegion`).
- [x] T010 [P] Implement accessible color palette contracts in `src/types/palette.ts` (`AccessiblePalette`, `ColorStop`, `PaletteType`).
- [x] T011 Create unified barrel export in `src/types/index.ts`.

---

## Phase 3: User Story 1 - Local Development & Verification Workflow (Priority: P1) 🎯 MVP

**Goal**: Deliver a fully buildable, testable, and runnable Vite 8 + React 19 + TypeScript 7 application shell responding to `pnpm dev`, `pnpm build`, and `pnpm test:run`.

**Independent Test**: Run `pnpm test:run` followed by `pnpm build`, verifying zero exit codes and optimized output in `dist/`.

### Tests for User Story 1
- [x] T012 [P] [US1] Create Vitest global setup in `tests/setup.ts` importing `@testing-library/jest-dom/vitest`.
- [x] T013 [P] [US1] Create baseline unit smoke test in `tests/smoke.test.ts` verifying Vitest runner and TypeScript type assertions.

### Implementation for User Story 1
- [x] T014 [P] [US1] Create root `index.html` with viewport meta, aerospace dark background styling, and React mounting root (`#root`).
- [x] T015 [US1] Create application entry point in `src/main.tsx` initializing React 19 root (`createRoot`) with strict mode.
- [x] T016 [US1] Verify execution of `pnpm typecheck`, `pnpm test:run`, and `pnpm build`.

---

## Phase 4: User Story 2 - Automated Quality & Commit Governance Enforcement (Priority: P2)

**Goal**: Configure Husky 9 git hooks intercepting invalid commit messages and broken builds before Git records them.

**Independent Test**: Attempt a commit with an invalid commit message format to verify rejection; run pre-commit hook directly to verify build/test gate.

### Implementation for User Story 2
- [x] T017 [US2] Initialize Husky 9 hooks directory in `.husky/` and ensure executable permissions (`chmod +x`).
- [x] T018 [P] [US2] Implement `.husky/pre-commit` hook executing `pnpm typecheck && pnpm test:run && pnpm build`.
- [x] T019 [P] [US2] Implement `.husky/commit-msg` hook enforcing Conventional Commits v1.0.0 via regex check (`^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9_-]+\))?: .+$`).
- [x] T020 [US2] Validate hook execution by simulating pre-commit and commit-msg verification locally.

---

## Phase 5: User Story 3 - Dark Aerospace Theme & Visual Design Tokens (Priority: P3)

**Goal**: Inject Tailwind CSS v4 design tokens and render the NASA Earth Information Center / Mission Control visual theme.

**Independent Test**: Inspect computed styles in browser or DOM test confirming `--color-space-950: #0B0F17` and card background `#131B2E`.

### Implementation for User Story 3
- [x] T021 [P] [US3] Create `src/index.css` configuring Tailwind CSS v4 `@import "tailwindcss";` and `@theme` design tokens matching `docs/design-system.md` (`#0B0F17`, `#131B2E`, `#1E293B`, `#FF6F00`, `#00E5FF`, `#10B981`).
- [x] T022 [US3] Implement base `src/App.tsx` application shell with Aerospace Header, Sub-header badges, Mobile-First fluid KPI grid ($1 \rightarrow 2 \rightarrow 4$ cols), and placeholder panels for Calendar, Map, and Metrics.
- [x] T023 [P] [US3] Create component test `tests/App.test.tsx` verifying that `App` renders without crashing, displays header title "TerraSpot Harmonizer", and applies dark theme classes.

---

## Phase 6: Polish & Verification

**Purpose**: Final end-to-end audit of all quality gates prior to commit review.

- [x] T024 Execute complete validation suite: `pnpm typecheck`, `pnpm test:run`, and `pnpm build`.
- [x] T025 Verify static assets bundle size in `dist/` is `< 250 KB` gzipped.
- [x] T026 Update `package.json` version to `0.2.0` and prepare `CHANGELOG.md` entry.

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Setup)**: Completed.
- **Phase 2 (Foundational)**: Completed.
- **Phase 3 (User Story 1 - MVP)**: Completed.
- **Phase 4 (User Story 2 - Governance)**: Completed.
- **Phase 5 (User Story 3 - Theme & App)**: Completed.
- **Phase 6 (Polish & Verification)**: Completed.

### Parallel Opportunities [P]
- Setup: T002, T003, T004 verified.
- Contracts: T007, T008, T009, T010 verified.
- Tests & Entry: T012, T013, T014 verified.
- Hooks: T018, T019 verified.
- Styling: T021, T023 verified.

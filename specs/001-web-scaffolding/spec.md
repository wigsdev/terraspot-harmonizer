# Feature Specification: Foundational Web Application Scaffolding

**Feature Branch**: `feat/T-02-scaffolding-web`

**Created**: 2026-11-14

**Status**: Draft

**Input**: User description: "Create the foundational web application scaffolding for TerraSpot Harmonizer using Vite 8.x (v8.3+), React 19.x (v19.3+), TypeScript 7.x (v7.0+), Tailwind CSS 4.x (v4.3+) with @tailwindcss/vite, Vitest 5.x (v5.1+), and Husky 9.x (v9.1+) with pnpm 12.x on Node.js 24 LTS. Configure aerospace dark mode design tokens matching docs/design-system.md, establish the modular directory structure across src/engine, src/components, and src/types adhering to docs/03-system-technical-architecture.md, configure pre-commit hooks enforcing typecheck and build validation, and verify initial compilation with pnpm build."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Local Development & Verification Workflow (Priority: P1)

As a scientific software developer or open-source contributor, I want to clone the repository and run standard package manager commands (`pnpm dev`, `pnpm build`, `pnpm test:run`) on Node.js v24, so that I have an immediate, reproducible local development environment with zero compilation warnings or configuration errors.

**Why this priority**: Essential technical foundation. Without a reproducible build, typecheck, and test runner, no subsequent analytical or visual features can be developed or validated.

**Independent Test**: Can be fully verified by running `pnpm install`, `pnpm build`, and `pnpm test:run` in a clean environment, confirming zero exit codes and valid artifact generation in `dist/`.

**Acceptance Scenarios**:

1. **Given** a clean working copy on Node.js `v24.x`, **When** the developer executes `pnpm install`, **Then** dependencies are locked via `pnpm-lock.yaml` with zero dependency peer-conflicts and git hooks are initialized.
2. **Given** valid source files, **When** `pnpm dev` is run, **Then** a local development server starts on `http://localhost:5173` with Hot Module Replacement (HMR) responding under 100ms.
3. **Given** standard TypeScript source code, **When** `pnpm build` is executed, **Then** Vite produces an optimized static production bundle in `dist/` with strict type checking and zero syntax or type warnings.

---

### User Story 2 - Automated Quality & Commit Governance Enforcement (Priority: P2)

As a project maintainer and lead architect, I want pre-commit and commit-message Git hooks to automatically intercept and validate every staged change, so that broken builds, failing unit tests, and non-conventional commit messages cannot enter the repository history.

**Why this priority**: Enforces Section 3 of `AGENTS.md` and Constitution Principle VI, guaranteeing that all commits follow Conventional Commits and maintain unbroken test passing.

**Independent Test**: Attempt committing with an invalid message format (e.g., `git commit -m "update"`) and verify rejection; attempt committing with a failing test and verify rejection.

**Acceptance Scenarios**:

1. **Given** a staged file, **When** a commit is attempted with a message not matching Conventional Commits (`type(scope): description`), **Then** `.husky/commit-msg` rejects the commit with an explanatory error.
2. **Given** a staged file with a TypeScript type violation or a broken test, **When** `git commit` is invoked, **Then** `.husky/pre-commit` executes `pnpm test:run` and `pnpm build`, aborting the commit before creating a Git object.

---

### User Story 3 - Dark Aerospace Theme & Visual Design Tokens (Priority: P3)

As a mission operator, Earth scientist, or hackathon evaluator, I want the base application shell to display the NASA-grade Dark Aerospace visual theme with semantic CSS tokens, so that high-contrast typography, aerospace palettes, and accessible color ramps are consistently available across all UI components.

**Why this priority**: Establishes the design tokens defined in `docs/design-system.md` to prevent styling fragmentation in subsequent sprint tasks (`T-05` to `T-10`).

**Independent Test**: Inspect the DOM root elements and verify that CSS custom properties (`--bg-primary`, `--bg-card`, `--accent-amber`, `--accent-cyan`) render accurately and match `#0B0F17`, `#131B2E`, `#FF6F00`, and `#00E5FF`.

**Acceptance Scenarios**:

1. **Given** the web application loaded in a browser, **When** viewing the root layout, **Then** the background renders `#0B0F17` (Deep Space Navy) with high-contrast text `#E2E8F0`.
2. **Given** custom Tailwind utility classes, **When** styling components with semantic tokens (cards, borders, accents), **Then** Tailwind CSS v4 resolves the aerospace variables without legacy `@tailwind` directives.
3. **Given** diverse device viewport widths (Mobile 360–425px, Tablet 768px, and Desktop $\ge$ 1024px), **When** viewing the application shell and KPI cards, **Then** the layout employs a fluid Mobile-First progression (1 column on mobile, 2 columns on tablet, 4 columns on desktop) with touch-accessible buttons and zero horizontal overflow.

---

### Edge Cases

- **Multi-Screen Responsive Density:** What happens when viewing the dashboard on narrow mobile viewports (360–425px) or tablet portrait mode (768px)?  
  *Mitigation:* The application header and KPI grid employ a Mobile-First layout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) with compact spacing (`px-4 py-2.5 sm:px-6 sm:py-3.5`) and adaptive element visibility (`hidden sm:block`) to prevent text wrapping bottlenecks.
- **Node.js Environment Mismatch:** What happens if a developer attempts running `npm install` or `yarn install`?  
  *Mitigation:* An `only-allow pnpm` preinstall script or engine restriction in `package.json` blocks execution and outputs an informative error message.
- **Git Hook Bypass:** What happens if Git commands are executed in non-interactive CI environments?  
  *Mitigation:* Husky hooks fail gracefully or skip when `CI=true` or `.git` directory is uninitialized during package builds.
- **Tailwind CSS v4 Import Paradigm:** How does the build handle Tailwind CSS v4's new CSS-first `@import "tailwindcss";` without requiring a legacy `tailwind.config.js`?  
  *Mitigation:* `src/index.css` is configured with modern `@import "tailwindcss";` and `@theme` directives matching `docs/design-system.md`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST configure `package.json` with version `0.2.0`, metadata identifying TerraSpot Harmonizer, and strict package manager set to `pnpm@12.21.0` on Node.js `24.x LTS`.
- **FR-002**: System MUST configure Vite 8.x (`8.3.x` with Rolldown native bundler) with React 19.x plugin (`@vitejs/plugin-react@4.x`) supporting TypeScript JSX compilation.
- **FR-003**: System MUST configure TypeScript 7.x (`7.0.x`) (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`) with native compilation engine and strict type-checking enabled (`strict: true`, `noImplicitAny: true`, `isolatedModules: true`).
- **FR-004**: System MUST install and configure Tailwind CSS 4.x (`4.3.x`) using the modern `@tailwindcss/vite` plugin without legacy PostCSS or `tailwind.config.js`, injecting custom design tokens (`--bg-space: #0B0F17`, `--bg-card: #131B2E`, `--border-card: #1E293B`, `--accent-amber: #FF6F00`, `--accent-cyan: #00E5FF`) and enforcing a Mobile-First responsive grid progression (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
- **FR-005**: System MUST configure Vitest 5.x (`5.1.x`) (`vitest.config.ts`) sharing the Vite 8 pipeline with `jsdom` test environment and `@testing-library/react` setup for component and unit testing.
- **FR-006**: System MUST configure Husky 9.x (`9.1.x`) git hooks:
  - `.husky/pre-commit` executing `pnpm test:run` and `pnpm build`.
  - `.husky/commit-msg` validating Conventional Commits v1.0.0.
- **FR-007**: System MUST establish a modular, clean folder layout adhering to `docs/03-system-technical-architecture.md`:
  - `src/components/` (UI presentation components).
  - `src/engine/` (pure TypeScript scientific harmonization algorithms).
  - `src/types/` (TypeScript schemas and contracts).
  - `src/assets/` (static assets and icons).
  - `public/data/` (spatiotemporal JSON cubes and FIRMS sample CSVs).
- **FR-008**: System MUST supply a baseline smoke unit test (`tests/App.test.tsx` or `tests/engine/smoke.test.ts`) verifying test runner operational readiness.

### Key Entities

- **Application Configuration (`package.json`)**: Defines dependencies (React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, Leaflet, Vitest) and lifecycle scripts (`dev`, `build`, `test:run`, `typecheck`).
- **Design Tokens (`src/index.css`)**: Encapsulates dark aerospace color definitions, typography rules, and colorblind-safe ramps (*Inferno*, *Viridis*, *Cividis*, *Diverging*).
- **Architecture Contracts (`src/types/`)**: TypeScript interface stubs for `ActiveFireCellDay`, `HarmonizedMonthlyRecord`, and `BenchmarkRegion`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Clean initial build: `pnpm build` completes in `< 5 seconds` with zero TypeScript errors and zero warnings.
- **SC-002**: Unit test runner: `pnpm test:run` executes and passes all baseline tests in `< 3 seconds`.
- **SC-003**: Local dev server start: `pnpm dev` boots local HMR environment in `< 1 second`.
- **SC-004**: Git commit integrity: Commits with non-conventional messages or compilation errors are 100% blocked by local Husky hooks.
- **SC-005**: Bundle efficiency: Initial production bundle size for baseline shell is `< 250 KB` gzipped.

---

## Assumptions

- **Host Toolchain:** Node.js `>= 20.x` (specifically tested on `v24.x`) and `pnpm >= 10.x` are installed and available in the environment `PATH`.
- **Operating System:** Linux environment with standard bash shell execution for Git hooks and scripts.
- **Component Scope:** Task `T-02` delivers application scaffolding, architecture boundaries, and baseline theme shell; detailed interactive components (Matrix, Leaflet map, CSV parser) are incrementally delivered in subsequent tasks (`T-03` to `T-10`).

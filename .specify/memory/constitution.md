# TerraSpot Harmonizer Constitution

## Core Principles

### I. Dual-Language & Communication Protocol (NON-NEGOTIABLE)
- **Developer Interactions:** All direct interactions, reporting, and operational queries with the lead developer (`@wigsdev`) must be conducted **100% in Spanish**.
- **Code, Artifacts & NASA Deliverables:** All source code, TypeScript interfaces, inline comments, test descriptions, git commit messages, technical documentation in `docs/`, application UI labels, and official NASA Space Apps submission forms must be drafted **100% in professional, peer-reviewed English**.
- **User Interface Bilinguality:** The web application UI defaults to English for global judging compliance, with seamless client-side bilingual toggling (`EN` / `ES`).

### II. Package Management & Toolchain Strictness (NON-NEGOTIABLE)
- **Node Package Manager:** Use **`pnpm` exclusively** (`pnpm install`, `pnpm dev`, `pnpm build`, `pnpm test:run`) on Node.js `v24.x` (`pnpm 12.15.0`).
- **Prohibited Tools:** Usage of `npm` or `yarn` is strictly forbidden. Lockfile integrity (`pnpm-lock.yaml`) must be preserved.
- **Python Scientific Pipeline:** Python data processing scripts (`scripts/build_harmonized_cubes.py`) must execute cleanly on Python `3.13.x` with explicit typing and reproducible dependencies (`uv`).

### III. Mathematical & Scientific Harmonization Rigor (NON-NEGOTIABLE)
- **Physical Traceability:** The harmonization engine must strictly uphold the mathematical formulations established in `docs/02-modis-viirs-harmonization-methodology.md`:
  1. *Stage 1 (Radiometric Quality Masking):* Filtering nominal/high confidence vegetation fires (`type == 0`).
  2. *Stage 2 (Geometric Co-Registration):* Collapsing contiguous $375\text{ m}$ VIIRS pixels into daily $0.01^\circ \times 0.01^\circ$ (~$1.1\text{ km}$) Active Fire Cell-Days (AFCD).
  3. *Stage 3 (Seasonal Calibration):* Applying monthly empirical scaling ratios ($\beta_m$) over the 14-year overlap baseline ($2012\text{--}2025$) with statistical convergence $R^2 > 0.90$.
  4. *Stage 4 (Climatology & Fire Regime):* Non-parametric median baseline ($\widetilde{M}_m$), robust interquartile $Z$-scores, and regime classification ($I_{\text{regime}}$) combining Fire Radiative Power (MW) and nocturnal persistence ($f_{\text{night}}$).
- **Audit Transparency:** The user interface must provide a dedicated sensor audit mode allowing reviewers to toggle between raw unharmonized counts and harmonized curves.

### IV. Universal Visual Accessibility (WCAG 2.1 AA)
- **Colorblind-Safe Palettes:** The Burning Activity Calendar Matrix and cartographic overlays must exclusively use scientifically validated, perceptually uniform color ramps: **Inferno** (default thermal), **Viridis**, **Cividis**, and **Diverging Blue–White–Red**.
- **Prohibited Visual Mappings:** Red-to-green gradients are strictly prohibited.
- **Contrast & Hierarchy:** Dark aerospace background (`#0B0F17`) paired with high-contrast text and interactive cell tooltips providing numerical values alongside chromatic representation.

### V. NASA Space Apps Challenge 2026 Regulatory Compliance
- **Deliverable Limits:** Pitch presentations must strictly not exceed **7 slides maximum** (or a video $\le 30\text{ seconds}$). Exceeding limits results in disqualification.
- **Super Intelligence (SI) Policy:** AI assistance in coding, design, and translation must be fully disclosed in submission metadata and `docs/05-submission-pitch-rubric-plan.md`.
- **Insignia Protection:** No NASA logos, meatball patches, worm logos, space agency seals, or flags may be generated, altered, or synthesized using AI tools.

### VI. Spec-Driven Development (SDD) & Commit Gatekeeping (NON-NEGOTIABLE)
- **SDD Lifecycle:** Development across all 12 backlog tasks (`T-01` to `T-12`) strictly follows Spec Kit: `constitution` $\rightarrow$ `specify` $\rightarrow$ `clarify` $\rightarrow$ `plan` $\rightarrow$ `tasks` $\rightarrow$ `analyze` $\rightarrow$ `implement` $\rightarrow$ `converge`.
- **Commit & Push Authorization:** **NEVER execute `git commit` or `git push` automatically.** Every atomic commit requires presenting the proposed diff, Conventional Commit message, and `CHANGELOG.md` entry to the developer, awaiting explicit approval ("visto bueno").
- **Branching Strategy:** Work in isolated atomic feature branches (`feat/T-XX-name` or `fix/T-XX-name`). Maintain `main` continuously deployable and verified via `pnpm build` and `pnpm test:run`.

## Technology & Architectural Constraints

- **Edge-First Architecture:** The client web application executes completely client-side (SPA via Vite + React 19 + TypeScript + Tailwind CSS v4) with zero backend runtime dependencies. Pre-computed spatiotemporal data cubes (`public/data/*.json`) ensure instantaneous sub-second query response.
- **Client-Side CSV Parsing:** Custom NASA FIRMS CSV uploads (MODIS or VIIRS) must be parsed and re-harmonized in-browser using Web Workers or asynchronous chunks without leaking user data to remote servers.
- **Data Export Compliance:** CSV downloads must follow RFC 4180 standards and produce the canonical 27-column analytical schema defined in `docs/04-firms-data-specification.md`.

## Quality Gates & Verification Standards

1. **Pre-Commit Verification:** Husky hooks (`.husky/pre-commit`) must automatically enforce `pnpm typecheck`, `pnpm test:run` (100% passing Vitest suite), and `pnpm build` prior to any commit creation.
2. **Commit Message Linting:** Commit messages must strictly adhere to **Conventional Commits v1.0.0** (`type(scope): description (T-XX)`).
3. **Semantic Versioning (SemVer 2.0.0):** Version increments in `package.json` and entries in `CHANGELOG.md` (Keep a Changelog format) must strictly accompany each merged milestone from `v0.1.0` through `v1.0.0`.

## Governance

- This Constitution constitutes the supreme technical and operational authority for the TerraSpot Harmonizer repository.
- All agent instructions, subagent workflows, pull requests, and automated scripts are bound by its core principles.
- Amendments require explicit developer review, updating of `docs/operational-work-plan.md` and `AGENTS.md`, and an increment to `CONSTITUTION_VERSION`.

**Version**: 1.0.0 | **Ratified**: 2026-11-14 | **Last Amended**: 2026-11-14

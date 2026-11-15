---
description: "Task list for T-11 Quality Audit, Visual Accessibility & Public Production Deployment"
---

# Tasks: T-11 Quality Audit, Visual Accessibility & Public Production Deployment

**Input**: Design documents from `specs/010-optimization-deployment/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/deployment-contract.ts`  
**Tests**: Vitest component and configuration integration tests  
**Organization**: Tasks grouped by user story for independent implementation and verification  

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Target user story (US1, US2, US3)

---

## Phase 1: Setup & Foundational Configuration

**Purpose**: Baseline build configuration and test harnesses

- [X] T001 Define deployment and build configuration contracts in `specs/010-optimization-deployment/contracts/deployment-contract.ts`
- [X] T002 Configure granular Rolldown/Rollup vendor chunks (`vendor-react`, `vendor-gis`, `vendor-charts`, `vendor-icons`, `vendor-utils`) in `vite.config.ts`

---

## Phase 2: User Story 1 - Clean Production Bundle & Modular Code Splitting (Priority: P1) 🎯 MVP

**Goal**: Eliminate the monolithic > 500 kB bundle warning by splitting vendor dependencies into discrete cacheable chunks under 450 kB uncompressed.

**Independent Test**: `pnpm build` outputs modular chunks with zero chunk size warnings and zero errors.

### Implementation for User Story 1
- [X] T003 [US1] Implement deterministic `manualChunks` function in `vite.config.ts` separating React core, Leaflet GIS, Recharts, Lucide, and PapaParse/Lodash
- [X] T004 [US1] Verify production build output with `pnpm build` and assert all chunk sizes are strictly $< 450\text{ kB}$ uncompressed ($< 120\text{ kB}$ gzipped)
- [X] T005 [P] [US1] Create automated build verification test in `tests/buildOptimization.test.ts` to assert zero monolithic bundle regressions

**Checkpoint**: User Story 1 complete. `pnpm build` runs cleanly with zero warnings.

---

## Phase 3: User Story 2 - Comprehensive Visual Accessibility & Mobile Tooltip Clamping (Priority: P2)

**Goal**: Ensure WCAG 2.1 AA keyboard accessibility, visible focus rings, ARIA dialog landmarks, and responsive tooltip clamping on ultra-small viewports ($< 360\text{ px}$).

**Independent Test**: Keyboard navigation traversals and ultra-narrow screen rendering without tooltip clipping or layout breaks.

### Implementation for User Story 2
- [X] T006 [P] [US2] Audit and enforce accessible focus rings (`focus-visible:ring-2 focus-visible:ring-cyan-400` / `focus-visible:ring-amber-500`) and ARIA labels on all Navbar buttons in `src/components/Navbar.tsx`
- [X] T007 [P] [US2] Enhance `BurningCalendarMatrix.tsx` tooltip positioning with viewport clamping to prevent off-screen overflow on mobile viewports $< 360\text{ px}$
- [X] T008 [P] [US2] Add keyboard `Escape` dismissal and `aria-modal` trap validation in `src/components/CustomCSVModal.tsx`
- [X] T009 [US2] Verify responsive rendering across mobile and desktop breakpoints in `tests/accessibilityMobile.test.tsx`

**Checkpoint**: User Story 2 complete. All accessibility and mobile responsiveness requirements satisfied.

---

## Phase 4: User Story 3 - Public HTTPS Deployment Configuration & Global Offers Integration (Priority: P3)

**Goal**: Provide edge deployment configuration (`vercel.json`), document custom mission domain options (GoDaddy / Porkbun), and declare live Meteomatics and Planetary Computer integrations.

**Independent Test**: Valid static edge deployment manifest with SPA fallback routes and secure HTTP headers.

### Implementation for User Story 3
- [X] T010 [P] [US3] Create `vercel.json` with SPA rewrites (`/(.*) -> /index.html`), asset cache-control headers, and strict security headers (CSP, nosniff, DENY)
- [X] T011 [P] [US3] Document public HTTPS deployment instructions and custom mission domain setup (GoDaddy Registry & Porkbun NASA Global Offer) in `README.md`
- [X] T012 [P] [US3] Update `docs/05-submission-pitch-rubric-plan.md` highlighting GoDaddy/Porkbun, Meteomatics API, and Planetary Computer STAC for maximum judging rubric scoring

**Checkpoint**: User Story 3 complete. Deployment manifests and mission domain documentation ready for public judging.

---

## Phase 5: Polish, Quality Gates & SemVer v0.11.0

**Purpose**: Verification of full test suite, version bump, and release changelog.

- [X] T013 Run full test suite (`pnpm test:run`) ensuring 100% pass rate across all existing and new tests
- [X] T014 Run TypeScript check (`pnpm typecheck`) and verify zero errors
- [X] T015 Increment version to `0.11.0` in `package.json`, `src/context/LanguageContext.tsx`, and `tests/Navbar.test.tsx`
- [X] T016 Document changes in `CHANGELOG.md` under `[0.11.0]` following Keep a Changelog 1.1.0 format
- [X] T017 Update `docs/backlog.md` marking Task T-11 as completed `[x]`

---

## Dependencies & Execution Order

1. **Setup & US1 (T001–T005)**: Configures Vite chunking and verifies clean build (MVP).
2. **US2 (T006–T009)**: Accessibility and mobile docking polish.
3. **US3 (T010–T012)**: Deployment manifests and Global Offers documentation.
4. **Polish (T013–T017)**: Quality gates, tests, SemVer bump to `0.11.0`.

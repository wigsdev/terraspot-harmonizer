---
description: "Task list for T-12 Executive 7-Slide Presentation & Official NASA Space Apps Submission"
---

# Tasks: T-12 Executive 7-Slide Presentation & Official NASA Space Apps Submission

**Input**: Design documents from `specs/011-presentation-submission/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/slides-contract.ts`  
**Tests**: Automated Vitest slide deck verification test (`tests/slideDeck.test.ts`)  
**Organization**: Tasks grouped by user story for independent implementation and verification  

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Target user story (US1, US2, US3)

---

## Phase 1: Setup & Foundational Configuration

**Purpose**: Baseline slide deck contracts and automated test scaffold

- [X] T001 Define slide deck manifest and submission verification contracts in `specs/011-presentation-submission/contracts/slides-contract.ts`
- [X] T002 [P] Create automated slide validation test harness in `tests/slideDeck.test.ts` to enforce the strict 7-slide maximum limit and keyboard event handlers

---

## Phase 2: User Story 1 - Interactive 7-Slide Presentation Deck (Priority: P1) 🎯 MVP

**Goal**: Construct an interactive, self-contained 7-slide HTML deck (`public/demo-slides.html`) in English adhering to NASA Space Apps limits.

**Independent Test**: Loading `public/demo-slides.html` in browser displays exactly 7 slides with smooth keyboard navigation (`ArrowRight`, `ArrowLeft`, `Spacebar`), progress counter (`Slide X of 7`), and deep aerospace styling (`#0B0F17`).

### Implementation for User Story 1
- [X] T003 [US1] Create standalone HTML shell with dark aerospace CSS architecture (`#0B0F17`, cyan glow, amber accents, grid layouts) in `public/demo-slides.html`
- [X] T004 [US1] Implement Slide 1 (Title & Team), Slide 2 (The Multi-Decadal Sensor Dilemma), and Slide 3 (The TerraSpot 4-Stage Harmonization Engine)
- [X] T005 [US1] Implement Slide 4 (Interactive Burning Activity Calendar Demo) and Slide 5 (Peruvian Andes-Amazon Agricultural vs. Wildfire Regime Case Study)
- [X] T006 [US1] Implement Slide 6 (Open Science Architecture & Live Data Ingestion) and Slide 7 (Global Impact, Public Links & Call to Action)

**Checkpoint**: User Story 1 complete. Interactive 7-slide deck is functional, beautiful, and testable independently.

---

## Phase 3: User Story 2 - Strategic Integration of NASA Global Offers & Partner Resources (Priority: P2)

**Goal**: Explicitly feature all 5 NASA Space Apps Global Offers across slides and pitch texts to maximize rubric scoring.

**Independent Test**: Slide badges and submission documents showcase concrete implementations of Meteomatics, GoDaddy/Porkbun, Microsoft Planetary Computer, GitHub Copilot, and Miro.

### Implementation for User Story 2
- [X] T007 [P] [US2] Embed Global Offer callouts and technical badges across Slides 3, 5, 6, and 7 in `public/demo-slides.html`
- [X] T008 [P] [US2] Update Field 6 and Field 6.1 in `docs/05-submission-pitch-rubric-plan.md` documenting exact endpoints and parameters for each Global Collaborator
- [X] T009 [US2] Verify automated tests in `tests/slideDeck.test.ts` assert the presence of all 5 partner offer tokens

**Checkpoint**: User Story 2 complete. Global Offers prominently showcased across all visual and textual deliverables.

---

## Phase 4: User Story 3 - Official NASA Submission Package & SemVer 1.0.0 Release (Priority: P3)

**Goal**: Review all English form fields in `docs/05-submission-pitch-rubric-plan.md`, verify Super Intelligence (SI) compliance, and release SemVer `1.0.0`.

**Independent Test**: All submission fields match NASA portal character limits; `package.json`, `LanguageContext.tsx`, and `Navbar.test.tsx` reflect version `1.0.0`.

### Implementation for User Story 3
- [X] T010 [P] [US3] Peer-review and finalize all 7 English fields (Project Title, Short Summary, Detailed Description, SI Disclosure, NASA Data, Partners, Links) in `docs/05-submission-pitch-rubric-plan.md`
- [X] T011 [US3] Update version to `1.0.0` in `package.json`, `src/context/LanguageContext.tsx`, and `tests/Navbar.test.tsx`
- [X] T012 [US3] Document full production release in `CHANGELOG.md` under `[1.0.0]` following Keep a Changelog 1.1.0 format
- [X] T013 [US3] Mark all 12 tasks complete `[x]` across all 4 sprints in `docs/backlog.md`

**Checkpoint**: User Story 3 complete. Production release `v1.0.0` and NASA submission package finalized.

---

## Phase 5: Polish, Quality Gates & Complete Project Closure

**Purpose**: Final verification of build, full test suite pass rate, and tag preparation.

- [X] T014 Run full test suite (`pnpm test:run`) ensuring 100% pass rate across all 18 test suites
- [X] T015 Run TypeScript check (`pnpm typecheck`) and verify zero errors
- [X] T016 Run production build (`pnpm build`) and verify clean compilation
- [X] T017 Prepare final release summary for developer authorization and git tag `v1.0.0`

---

## Dependencies & Execution Order

1. **Setup & US1 (T001–T006)**: Build the interactive 7-slide presentation deck.
2. **US2 (T007–T009)**: Enhance slides and submission text with NASA Global Offers.
3. **US3 (T010–T013)**: Finalize submission documentation and bump version to `1.0.0`.
4. **Polish (T014–T017)**: Validate quality gates and prepare final milestone release.

# Feature Specification: Executive 7-Slide Presentation & Official NASA Space Apps Submission (T-12)

**Feature Branch**: `feat/T-12-presentation-submission`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "T-12 Executive 7-Slide Presentation & Official NASA Space Apps Submission (v1.0.0). Construct an interactive, high-impact 7-slide presentation deck in English (public/demo-slides.html) strictly adhering to NASA Space Apps Challenge 2026 Global Judging limits (exactly 7 slides maximum). Illustrate the multi-decadal observation dilemma, the 4-stage harmonization engine, the interactive Burning Activity Calendar, the Peruvian Andes-Amazon agricultural burning vs. runaway wildfire diagnostic case study, and open science architecture. Feature NASA Space Apps Global Offers across slides and submission text (Meteomatics Weather API in-situ validation, GoDaddy/Porkbun mission domain, Microsoft Planetary Computer STAC, GitHub Copilot, Miro) to maximize rubric scoring. Verify all English submission form fields in docs/05-submission-pitch-rubric-plan.md, ensure complete Super Intelligence (SI) disclosure compliance, and finalize SemVer 1.0.0 release across package.json and CHANGELOG.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive 7-Slide Presentation Deck in English (Priority: P1) 🎯 MVP

As an official NASA Space Apps Challenge 2026 Global Judge, scientific evaluator, or local lead in Huánuco, Peru, I need an interactive, aesthetically stunning, self-contained 7-slide presentation deck in English (`public/demo-slides.html`) that strictly adheres to the 7-slide maximum global judging limit, so that I can evaluate the project's scientific rigor, problem definition, mathematical innovation, and operational impact within a 3-minute executive review.

**Why this priority**: NASA Space Apps rules mandate that pitch decks exceeding 7 slides are automatically disqualified from Global Judging consideration. Providing an interactive, responsive HTML deck with keyboard navigation (Arrow keys / Spacebar) and deep-space aerospace styling delivers an unforgettable, institutional-grade evaluation experience.

**Independent Test**: Opening `http://localhost:5173/demo-slides.html` or direct file viewing renders exactly 7 slides in English with sequential keyboard navigation (`ArrowLeft`, `ArrowRight`, `Space`), touch swipe support, fullscreen toggle, active slide indicator (`1 / 7` through `7 / 7`), and crisp visual diagrams.

**Acceptance Scenarios**:

1. **Given** the presentation deck at `public/demo-slides.html`, **When** loaded in any modern desktop or mobile browser, **Then** exactly 7 distinct slides are navigable with zero layout breakages, adhering to the NASA Space Apps 7-slide maximum rule.
2. **Given** slide navigation controls, **When** the user presses ArrowRight, ArrowLeft, or clicks the next/prev buttons, **Then** slides transition smoothly with aerospace dark gradients (`#0B0F17`), high-contrast typography, and responsive scaling.

---

### User Story 2 - Strategic Integration of NASA Global Offers & Partner Resources (Priority: P2)

As a NASA Global Judging Committee member evaluating the "Partner Resources & Global Offers" scoring rubric, I need to see explicit, demonstrable integration of official hackathon partner technologies throughout the slides and pitch text, so that TerraSpot Harmonizer receives top rubric marks for cross-agency technological synergy.

**Why this priority**: Effectively demonstrating the use of official Global Collaborator resources (Meteomatics, GoDaddy/Porkbun, Microsoft Planetary Computer, GitHub Copilot, Miro) directly boosts the scoring rubric in global competition stages.

**Independent Test**: Reviewing Slides 3, 5, 6, and 7, along with `docs/05-submission-pitch-rubric-plan.md`, displays concrete technical applications of:
- **Meteomatics Weather API**: In-situ fire weather verification (`forest_fire_warning:idx`, temperature, humidity, wind gusts).
- **GoDaddy Registry & Porkbun**: Official custom mission domain (`https://terraspot-harmonizer.space`) and edge SSL termination.
- **Microsoft Planetary Computer**: Cloud-native STAC API metadata alignment.
- **GitHub Copilot & Microsoft Copilot**: Super Intelligence (SI) coding assistance and documentation peer review.
- **Miro**: Architectural workflow diagrams and sprint orchestration.

**Acceptance Scenarios**:

1. **Given** Slides 3, 5, 6, and 7, **When** inspected by judges, **Then** dedicated partner callout badges and architecture references highlight all 5 Global Offers with concrete technical context.
2. **Given** `docs/05-submission-pitch-rubric-plan.md`, **When** reviewed against the NASA Space Apps submission portal fields, **Then** Field 6 and Field 6.1 explicitly document the exact APIs, endpoints, and resources utilized.

---

### User Story 3 - Official NASA Submission Package & SemVer 1.0.0 Release (Priority: P3)

As the project lead (`@wigsdev`) submitting to the NASA Space Apps portal before the global deadline, I need all English form fields (Project Title, Short Summary, Detailed Description, SI Disclosure, NASA Data, Space Agency Partners) verified in `docs/05-submission-pitch-rubric-plan.md`, and the project version bumped to `1.0.0` in `package.json` and `CHANGELOG.md`, so that the project reaches full production milestone status.

**Why this priority**: Marks the official completion of the entire 12-task backlog, formalizing the delivery of TerraSpot Harmonizer for local and global judging.

**Independent Test**: Inspecting `docs/05-submission-pitch-rubric-plan.md` confirms all submission text fields are 100% in English, meet character limits, include live verified links to the Vercel HTTPS app and GitHub repository, and disclose AI assistance without violating NASA logo/trademark rules. Version `1.0.0` is tagged and recorded in `CHANGELOG.md`.

**Acceptance Scenarios**:

1. **Given** `package.json`, `LanguageContext.tsx`, and `CHANGELOG.md`, **When** inspected, **Then** the version is set to `1.0.0` under SemVer 2.0.0 guidelines.
2. **Given** the submission package in `docs/05-submission-pitch-rubric-plan.md`, **When** cross-checked with the official NASA submission guidelines, **Then** all required sections (Summary, Detailed Description, SI Disclosure, NASA Data, Partner Data) are complete, peer-reviewed, and ready for immediate copy-pasting.

---

### Edge Cases

- **Presentation Projection on Low-Resolution Displays:** If a judge views `public/demo-slides.html` on a standard 1080p projector or a compact 13" laptop, CSS responsive scaling (`clamp()`, viewport units) prevents content truncation or vertical scrollbars.
- **Offline Slide Presentation:** If judges lose internet connectivity during live judging, `public/demo-slides.html` functions 100% offline with embedded SVG icons and inline CSS, requiring zero external CDN dependencies.
- **Strict Slide Count Enforcement:** The slide deck MUST contain exactly 7 slides (neither 6 nor 8), numbered `01` to `07`, preventing disqualification.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an interactive, standalone presentation deck at `public/demo-slides.html` containing exactly 7 slides in English, styled with the dark aerospace theme (`#0B0F17`, cyan, amber, and slate accents).
- **FR-002**: Slide navigation MUST support keyboard arrow keys (`ArrowRight`, `ArrowLeft`), spacebar, on-screen next/previous buttons, and a visible progress counter (`Slide X of 7`).
- **FR-003**: The presentation deck MUST illustrate:
  1. Slide 1: Mission Title, Challenge 15, and Team Credentials.
  2. Slide 2: The Multi-Decadal Sensor Dilemma (Retiring MODIS vs. VIIRS Step-Jump).
  3. Slide 3: The TerraSpot 4-Stage Harmonization Mathematical Architecture.
  4. Slide 4: Interactive Burning Activity Calendar Matrix & Colorblind Ramps.
  5. Slide 5: Scientific Validation & The Peruvian Andes-Amazon Fire Regime Case Study.
  6. Slide 6: Open Science Architecture, Live NASA FIRMS Ingestion & Global Offers.
  7. Slide 7: Global Impact, Verification Links (Live Web App, GitHub), and Call to Action.
- **FR-004**: All 5 NASA Space Apps Global Offers (Meteomatics Weather API, GoDaddy / Porkbun, Microsoft Planetary Computer, GitHub Copilot, Miro) MUST be prominently highlighted across the slide deck and submission documentation.
- **FR-005**: All submission text fields in `docs/05-submission-pitch-rubric-plan.md` MUST be verified in English, compliant with NASA character constraints, and fully disclose Super Intelligence (SI) usage in accordance with NASA SI Policy (no AI-generated NASA logos).
- **FR-006**: Project version MUST be incremented to `1.0.0` in `package.json`, `src/context/LanguageContext.tsx`, and `CHANGELOG.md`, completing Task T-12 and marking 100% backlog completion.

### Key Entities

- **SlideDeck**: Interactive presentation state managing active slide index (1 to 7), keyboard event listeners, and transition animations.
- **SubmissionManifest**: Complete set of English fields matching the NASA Space Apps "Edit Project" portal specifications.
- **MilestoneRelease**: Production `v1.0.0` release package linking live deployment, repository, and slide presentation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Presentation deck contains exactly **7 slides** (01 to 07), verified via automated test and visual inspection.
- **SC-002**: Slide deck loads in $< 500\text{ ms}$ with zero console errors and 100% offline standalone capability.
- **SC-003**: 100% of the 12 backlog tasks (`T-01` to `T-12`) are marked complete `[x]` in `docs/backlog.md`.
- **SC-004**: Production build (`pnpm build`) and complete test suite (`pnpm test:run`) compile with zero errors and 100% passing tests under version `1.0.0`.

## Assumptions

- Judges may view the deck either hosted live on the web at `https://terraspot-harmonizer.vercel.app/demo-slides.html` or locally via browser file open.
- The 7-slide deck serves as the primary visual pitch deliverable under NASA Space Apps Global Judging regulations.
- The project author is Wilmer Gulcochía Sánchez (`@wigsdev`), participating in the NASA Space Apps Challenge 2026 local event in Huánuco, Peru.

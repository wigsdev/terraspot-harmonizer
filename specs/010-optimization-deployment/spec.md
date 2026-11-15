# Feature Specification: Quality Audit, Visual Accessibility & Public Production Deployment (T-11)

**Feature Branch**: `feat/T-11-optimization-deployment`

**Created**: 2026-11-15

**Status**: Draft

**Input**: User description: "T-11 Quality Audit, Visual Accessibility & Public Production Deployment. Perform final UI/UX polish, cross-device responsiveness verification, compile clean static production bundle with modular chunk splitting in Vite to eliminate monolithic bundle warnings (> 500 kB), and configure deployment manifests (vercel.json) for a public HTTPS URL without passwords or access restrictions complying with NASA Space Apps Challenge 15 Requirement R8. Integrate NASA Global Offers including official custom mission domain (GoDaddy Registry & Porkbun 1-year SSL certificate) with Vercel edge fallback, declare Meteomatics Weather API in-situ fire weather correlation and Microsoft Planetary Computer STAC metadata alignment. Enforce WCAG 2.1 AA visual accessibility standards, visible keyboard focus rings, dialog ARIA landmarks, and docked/clamped tooltip positioning on ultra-compact mobile viewports (< 360px)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean Production Bundle & Modular Code Splitting (Priority: P1) 🎯 MVP

As a NASA Space Apps judge, scientific reviewer, or emergency responder operating in low-bandwidth field environments (such as the Huánuco Andean-Amazonian transition corridor), I need TerraSpot Harmonizer to compile into optimized, granular JavaScript chunks (vendor libraries, mapping modules, charting engines) rather than a single monolithic script (> 500 kB), so that the application loads quickly with immediate first contentful paint (FCP) and smooth sub-second interactions.

**Why this priority**: Eliminating monolithic bundle warnings and optimizing initial download payloads ensures rapid loading and zero build warnings during global evaluation by NASA judges across diverse devices and network latencies.

**Independent Test**: Running `pnpm build` partitions third-party vendor dependencies into discrete bundles (`vendor-react`, `vendor-gis`, `vendor-charts`, `vendor-icons`, `vendor-utils`), ensuring no individual JavaScript asset exceeds 500 kB uncompressed ($< 120\text{ kB}$ gzipped) and generating clean build outputs with zero critical warnings.

**Acceptance Scenarios**:

1. **Given** the Vite/Rolldown production build configuration in `vite.config.ts`, **When** `pnpm build` is executed, **Then** vendor libraries are partitioned into separate cacheable chunks with zero chunk size warnings (`(!) Some chunks are larger than 500 kB after minification`).
2. **Given** the generated production distribution in `dist/`, **When** the application is previewed via `pnpm preview` or served via static hosting, **Then** all dynamic modules load correctly without runtime script errors or broken asset references.

---

### User Story 2 - Comprehensive Visual Accessibility & Mobile Tooltip Clamping (Priority: P2)

As a field technician, ranger, or visual observer navigating with keyboard-only input or an ultra-compact mobile viewport ($< 360\text{ px}$ width), I need interactive controls to display visible focus rings, modal dialogs to trap focus and dismiss on `Escape`, and floating calendar/chart tooltips to clamp within screen boundaries without clipping or overflowing off-screen.

**Why this priority**: Fulfills NASA Space Apps Challenge 15 Requirement R8 and WCAG 2.1 AA standards, guaranteeing that the application is universally accessible to users with motor, cognitive, or visual impairments across all form factors.

**Independent Test**: Navigating the application using keyboard `Tab`/`Shift+Tab` highlights interactive controls with visible focus rings; inspecting matrix cells on viewports $< 360\text{ px}$ clamps tooltip coordinates between safe margins (`12px` and `window.innerWidth - 12px`), preventing horizontal scroll or cutoff.

**Acceptance Scenarios**:

1. **Given** any interactive element (Navbar dropdowns, buttons, matrix cells, modal dialogs), **When** navigated via keyboard, **Then** focus indicators (`focus-visible:ring-2 focus-visible:ring-cyan-400` or `amber-500`) and ARIA attributes (`aria-label`, `role="dialog"`, `aria-modal="true"`) are present and discernible.
2. **Given** a mobile viewport narrower than $360\text{ px}$, **When** a user hovers or taps on any matrix cell, **Then** the telemetry tooltip position is dynamically clamped within viewport boundaries, displaying numerical values legibly without horizontal page clipping.

---

### User Story 3 - Public HTTPS Deployment Manifest & NASA Global Offers (Priority: P3)

As a global judge evaluating TerraSpot Harmonizer against the NASA Global Award criteria, I need to access the deployed web application at a public HTTPS URL without password gates, paywalls, or authentication barriers (Requirement R8), with official mission domain options (GoDaddy Registry & Porkbun) and documented use of NASA Global Offers.

**Why this priority**: Requirement R8 explicitly mandates open, unrestricted public HTTPS accessibility for judging eligibility, while integrating NASA Global Offers (Meteomatics Weather API, GoDaddy / Porkbun, Microsoft Planetary Computer) maximizes the project score under the *Partner Resources & Global Offers* rubric.

**Independent Test**: Valid static edge deployment manifest (`vercel.json`) provides SPA routing fallbacks and HTTP security headers (CSP, X-Frame-Options, HSTS), and project documentation (`README.md` and `docs/05-submission-pitch-rubric-plan.md`) clearly highlights live deployment links and Global Offers integration.

**Acceptance Scenarios**:

1. **Given** `vercel.json` deployed to an edge static host, **When** a judge visits the public URL, **Then** the application resolves securely via HTTPS with valid security headers and clean SPA rewrites (`/(.*) -> /index.html`).
2. **Given** project documentation in `README.md` and `docs/05-submission-pitch-rubric-plan.md`, **When** evaluated by judges, **Then** the custom domain options (GoDaddy / Porkbun) and NASA Global Offers (Meteomatics Weather API in-situ validation and Planetary Computer STAC alignment) are thoroughly documented.

---

### Edge Cases

- **Ultra-Narrow Screen Viewports ($< 360\text{ px}$):** When rendered on small mobile devices (e.g. iPhone SE at $375\text{ px}$ or compact foldables at $320\text{ px}$), telemetry cards clamp within screen bounds and adjust vertical translation (`translate(-50%, 0)` for top rows) to prevent header collision.
- **Intermittent Offline Connectivity:** When satellite map tiles fail to load due to rural connectivity drops, fallback CSS styles and boundary outlines ensure the map canvas remains responsive and does not throw uncaught JavaScript exceptions.
- **Client-Side Data Privacy:** User-uploaded custom FIRMS CSV files remain strictly processed in-memory client-side, with zero remote telemetry leakage or server-side transmission.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The build pipeline MUST split third-party vendor dependencies into discrete modular chunks in `vite.config.ts` (`vendor-react`, `vendor-gis`, `vendor-charts`, `vendor-icons`, `vendor-utils`), completely eliminating the monolithic $> 500\text{ kB}$ bundle warning.
- **FR-002**: All interactive controls MUST satisfy WCAG 2.1 AA accessibility guidelines, providing visible focus indicators (`focus-visible:ring-2`), accessible ARIA labels (`aria-label`), and keyboard `Escape` dismissal for modal dialogs.
- **FR-003**: The Floating Telemetry Tooltip in `BurningCalendarMatrix.tsx` MUST calculate clamped screen coordinates (`Math.max(120, Math.min(window.innerWidth - 120, x))`) to prevent off-screen overflow on mobile viewports.
- **FR-004**: The project MUST provide an edge deployment manifest (`vercel.json`) containing SPA routing rewrites (`/(.*) -> /index.html`), immutable caching headers for hashed assets, and strict security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`).
- **FR-005**: The project documentation (`README.md` and `docs/05-submission-pitch-rubric-plan.md`) MUST prominently declare the unauthenticated public HTTPS URL, the GoDaddy / Porkbun custom mission domain configuration, and the Meteomatics Weather API and Planetary Computer Global Offers integrations.
- **FR-006**: The production build MUST compile cleanly (`pnpm build`) with zero TypeScript errors, zero Vitest test failures, and zero Rollup/Rolldown chunk size warnings.

### Key Entities

- **ModularChunkConfig**: Rollup/Rolldown `manualChunks` function grouping runtime modules by dependency domain.
- **EdgeDeploymentManifest**: Static hosting configuration schema (`vercel.json`) defining SPA rewrites, caching policies, and security headers.
- **AccessibleTooltipGeometry**: Viewport-clamped coordinates and dynamic transform rules preventing mobile clipping.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Maximum size of any single uncompressed JavaScript bundle in `dist/assets/` is below $450\text{ kB}$ (gzip $< 120\text{ kB}$), down from the $989\text{ kB}$ monolithic bundle.
- **SC-002**: `pnpm build` completes with exit code `0`, zero TypeScript compilation errors, and zero chunk size warnings.
- **SC-003**: Automated test suite maintains a 100% pass rate (`113+` passing tests) across all test files with zero regression failures.
- **SC-004**: Application is configured for immediate one-click public HTTPS edge deployment without passwords or authentication gates (NASA Challenge 15 Requirement R8).

## Assumptions

- Target deployment infrastructure is Vercel Edge / GitHub Pages supporting static SPA rewrites.
- Custom mission domain provided via NASA Global Offers (GoDaddy Registry & Porkbun) maps to the edge CDN via standard CNAME / DNS apex records.
- Target client environments are modern evergreen browsers supporting ES2022, CSS Grid, and dynamic imports.

# Research Document: T-11 Quality Audit, Visual Accessibility & Public Production Deployment

**Feature**: `010-optimization-deployment`  
**Date**: 2026-11-15  
**Author**: Antigravity Assistant & Lead Developer Wilmer Gulcochía (`@wigsdev`)

---

## 1. Vite & Rolldown Code Splitting Optimization

### 1.1 Problem Statement
In default monolithic builds (`pnpm build`), Vite combines all runtime dependencies and application logic into a single bundle exceeding 980 kB:
```
dist/assets/index-BMxcRitN.js   989.41 kB │ gzip: 277.90 kB
(!) Some chunks are larger than 500 kB after minification.
```
This warning degrades first contentful paint (FCP), increases initial CPU parse times on low-power mobile devices, and violates performance best practices for remote field deployments (e.g. Peruvian Amazon basin / Huánuco, where internet access is intermittent).

### 1.2 Solution: Deterministic Vendor Chunking
By configuring `build.rollupOptions.output.manualChunks` in `vite.config.ts`, we partition the vendor dependency graph into discrete, cacheable bundles:
1. `vendor-react`: `react`, `react-dom` (~219 kB raw)
2. `vendor-charts`: `recharts`, `react-smooth`, `recharts-scale` (~422 kB raw)
3. `vendor-gis`: `leaflet`, `react-leaflet`, `@react-leaflet/core` (~157 kB raw)
4. `vendor-icons`: `lucide-react` (modular tree-shaken icons)
5. `vendor-utils`: `papaparse`, `lodash` (~18 kB raw)
6. `index`: Application logic, math harmonization engine, UI components (~170 kB raw)

Every single chunk drops below $450\text{ kB}$ uncompressed and $< 120\text{ kB}$ gzipped, eliminating the chunk size warning while maximizing browser caching efficiency.

---

## 2. Visual Accessibility (WCAG 2.1 AA) & Mobile Clamping

### 2.1 WCAG 2.1 AA Compliance Standards
- **Color Contrast & Keyboard Navigation:**
  - Foreground text on `#0B0F17` (Deep Space Dark) and panel surfaces (`#111827`) exceeds $4.5:1$ contrast ratio for regular text and $3:1$ for large text/icons.
  - Interactive badges (NASA Challenge 15, Custom Data Active, Anomaly Warning) maintain WCAG-safe contrast levels.
  - Interactive controls (Navbar selectors, buttons, matrix cells, modal dialogs) provide high-visibility focus indicators (`focus-visible:ring-2 focus-visible:ring-cyan-400` or `focus-visible:ring-amber-500`).
- **Modal Accessibility:**
  - `CustomCSVModal` implements `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, keyboard `Escape` dismissal, and backdrop click traps.

### 2.2 Mobile Clamping on Ultra-Small Viewports ($< 360\text{ px}$)
- Floating tooltips on high-density heatmap matrices can overflow screen boundaries on compact devices (e.g., iPhone SE at $375\text{ px}$, Galaxy Fold external screen at $320\text{ px}$).
- Solution: Calculate clamped tooltip coordinates in `BurningCalendarMatrix.tsx`:
  ```typescript
  const safeLeft = Math.max(120, Math.min(window.innerWidth - 120, tooltipPos.x));
  const isTopRow = tooltipPos.y < 220;
  const safeTop = isTopRow ? tooltipPos.y + 24 : tooltipPos.y - 12;
  const transform = isTopRow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)';
  ```
  This ensures the tooltip never clips the left, right, or top edge of the browser viewport.

---

## 3. Public Production Deployment & NASA Global Offers

### 3.1 Edge Hosting Configuration (`vercel.json`)
- Clean SPA client-side routing fallback:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
    "headers": [
      {
        "source": "/assets/(.*)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
        ]
      }
    ]
  }
  ```
- Public URL without authentication, passwords, or paywalls (fulfilling NASA Challenge 15 Requirement R8).

### 3.2 NASA Global Offer: Custom Mission Domain (GoDaddy Registry & Porkbun)
- NASA Space Apps provides free custom domain registration and 1-year SSL certificates through partner offers.
- Primary proposed domain: `https://terraspot-harmonizer.space` with edge CDN fallback on Vercel.
- Documented in `docs/05-submission-pitch-rubric-plan.md` and `README.md`.

# Quickstart: T-11 Production Build, Quality Audit & Deployment

**Feature**: `010-optimization-deployment`  
**Date**: 2026-11-15  

---

## 1. Verifying Optimized Modular Build

Run the clean production build script:
```bash
pnpm build
```

**Verification criteria:**
- Output displays separated chunks: `vendor-react-*.js`, `vendor-charts-*.js`, `vendor-gis-*.js`, `vendor-icons-*.js`, `vendor-utils-*.js`, `index-*.js`.
- No single chunk exceeds $450\text{ kB}$ uncompressed.
- Zero chunk size warnings `(!) Some chunks are larger than 500 kB`.

---

## 2. Testing Production Preview

Spin up the local production server:
```bash
pnpm preview
```
Visit `http://localhost:4173/` in your browser. Verify:
- All 5 pre-calibrated AOIs load data instantly.
- Burning Activity Calendar renders 27 years with interactive hover.
- Climatology curves and fire regime scatter plot render with smooth 60 FPS transitions.
- "Upload Custom FIRMS CSV" and "Download Harmonized CSV" work seamlessly.

---

## 3. Auditing Accessibility & Mobile Responsiveness

- **Keyboard Navigation:** Tab through Navbar, KPI Cards, Matrix, and Modals. Confirm distinct focus rings (`focus-visible:ring-2`).
- **Mobile Viewport ($< 360\text{ px}$):** In Chrome DevTools, select iPhone SE ($375\text{ px}$) or custom $320\text{ px}$ viewport. Verify that tooltips and modals do not clip or produce horizontal overflow.

---

## 4. Production Edge Deployment

### Deploying to Vercel:
```bash
# Optional automated CLI deployment:
vercel --prod
```
The repository includes `vercel.json` configured with SPA rewrites and security headers.

### Public HTTPS URL Verification:
Open the production URL in an incognito browser window to confirm zero login prompts and full public accessibility per NASA Challenge 15 Requirement R8.

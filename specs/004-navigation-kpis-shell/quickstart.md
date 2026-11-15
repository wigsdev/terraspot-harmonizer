# Quickstart Validation Guide: Mission Navigation & KPI Shell

**Feature**: Mission Navigation Shell & Dynamic KPI Summary Panel (`004-navigation-kpis-shell`)  
**Branch**: `feat/T-05-shell-navegacion-kpis`  
**Date**: 2026-11-14  

---

## 1. Prerequisites & Environment

1. **Node.js Environment**: Verify Node.js `v24.x` and `pnpm 12.21.0`:
   ```bash
   node -v
   pnpm -v
   ```
2. **Repository Branch**: Ensure you are on the atomic feature branch:
   ```bash
   git branch --show-current
   # Output must be: feat/T-05-shell-navegacion-kpis
   ```
3. **Data Artifacts**: Verify that the pre-computed benchmark catalog exists:
   ```bash
   test -f public/data/regions_catalog.json && echo "Catalog OK"
   ```

---

## 2. Validation Scenarios

### Scenario A: Automated Component Test Suite (Vitest)

Execute the targeted component unit tests validating navigation shell and KPI card reactivity:

```bash
pnpm test:run tests/Navbar.test.tsx tests/KPISummaryCards.test.tsx tests/App.test.tsx
```

**Expected Outcome**:
- All component tests pass cleanly with 0 failures and 0 warnings.
- Verifies:
  - Header brand, Challenge 15 badge, version pill, and baseline sensors.
  - Region selector dropdown switching between all 5 benchmark AOIs.
  - Accessible palette dropdown selecting Inferno, Viridis, Cividis, and Diverging.
  - Language toggle switching reactively between English (`EN`) and Spanish (`ES`).
  - 4 KPI cards rendering correct mathematically derived metrics for each region.

---

### Scenario B: Type Checking & Clean Build

Execute strict TypeScript compilation and Vite production bundling:

```bash
pnpm typecheck
pnpm build
```

**Expected Outcome**:
- TypeScript compiler (`tsc -b`) exits with code `0` (zero type errors).
- Vite build completes cleanly without asset warnings.

---

### Scenario C: Interactive Browser Verification

Launch the local development server:

```bash
pnpm dev
```

Open `http://localhost:5173` and visually verify:
1. **Navigation Shell (`Navbar.tsx`)**:
   - Check the top header in desktop and mobile viewports.
   - Click the language toggle button `EN / ES`: all header texts, dropdown labels, and KPI card labels switch instantaneously without page reload.
   - Switch regions in the dropdown from **Huánuco** to **California** or **Amazon**: the 4 KPI cards update values instantly ($< 16\text{ ms}$).
2. **KPI Summary Cards (`KPISummaryCards.tsx`)**:
   - Card 1: Check multi-decadal total AFCD and calibrated $R^2$.
   - Card 2: Check peak burning months and percentage share.
   - Card 3: Check real-time anomaly alert for `2026-10` with color-coded badge.
   - Card 4: Check dominant fire regime badge with mean FRP and nocturnal percentage.
3. **Responsive Grid**:
   - Resize browser window from 360px (mobile 1 column) $\rightarrow$ 768px (tablet 2 columns) $\rightarrow$ 1280px (desktop 4 columns). Layout adapts smoothly without horizontal overflow.

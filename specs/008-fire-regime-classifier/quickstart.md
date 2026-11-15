# Quickstart Validation Guide: Fire Regime Diagnostic Classifier

**Branch**: `feat/T-09-fire-regime-classifier`  
**Date**: 2026-11-15  
**Spec Reference**: [`specs/008-fire-regime-classifier/spec.md`](spec.md)

---

## 1. Prerequisites

- Node.js `v24.x`
- `pnpm` `12.21.0` (exclusively, do not use `npm` or `yarn`)
- Working directory: `/home/wigsdev/GitHub/hackaton-nasa`

---

## 2. Validation Scenarios

### Scenario 1: Engine Unit Testing
Verify that the regime data transformation functions strictly adhere to mathematical specifications:
```bash
pnpm test:run tests/FireRegimePanel.test.tsx
```
**Expected Outcome**:
- All test suites pass (100%).
- Agricultural, Transitional, and Severe Wildfire points are partitioned cleanly.
- Historical percentage distributions sum to $100\%$.
- Inactive months ($H_{y,m} = 0$) and future unobserved months are excluded from the scatter domain.
- Operational mitigation packages generate context-sensitive action items for all three institutions in both English and Spanish.

### Scenario 2: TypeScript Strict Compilation
Validate that all contracts and types are strictly compatible with the codebase:
```bash
pnpm typecheck
```
**Expected Outcome**:
- Clean compilation with `0 errors`.

### Scenario 3: Full Vitest Regression Suite
Ensure zero regressions across all 11 existing test suites:
```bash
pnpm test:run
```
**Expected Outcome**:
- 100% pass rate across all test files (83+ tests passing).

### Scenario 4: Production Static Build
Verify that Vite compiles a clean, optimized static production bundle:
```bash
pnpm build
```
**Expected Outcome**:
- Clean output in `dist/` with zero critical warnings or type breaks.

### Scenario 5: Visual Verification in Dev Server
Start local development server and inspect UI:
```bash
pnpm dev
```
**Visual Checklist**:
1. Navigate to the dashboard; scroll below `SensorHarmonizationAudit`.
2. Inspect the **Fire Regime Diagnostics** panel:
   - 3 summary cards display the historical distribution for the active AOI (% Agricultural, % Transitional, % Severe Wildfires) and dominant regime badge.
   - Interactive 2D Recharts Scatter Plot renders with X-axis (Mean FRP $0\text{--}100\text{ MW}$) and Y-axis (Night Fraction $0\text{--}0.50$).
   - Three tinted quadrant reference zones and dashed threshold lines ($X = 25, 45\text{ MW}$, $Y = 0.10, 0.20$).
   - Hovering over any scatter dot opens an aerospace dark tooltip with complete monthly telemetry.
   - Points belonging to the active year (e.g. 2024) are visually accented.
   - 3 operational guidance cards (Civil Defense, Park Rangers, Agricultural Authorities) present specific action items tailored to the active year's peak regime.
   - Toggling the language switch (`EN` / `ES`) instantly updates all panel headers, quadrant titles, tooltips, and action items.

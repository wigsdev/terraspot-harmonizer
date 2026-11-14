# Quickstart Guide: Web Application Scaffolding

**Feature**: `001-web-scaffolding`  
**Date**: 2026-11-14  

---

## 1. Prerequisites

Verify host toolchain versions before installation:

```bash
node -v   # Expected: v24.x LTS (e.g., v24.20.0)
pnpm -v   # Expected: 12.x (e.g., 12.21.0)
```

> [!WARNING]
> Do NOT use `npm` or `yarn`. Package management is strictly governed by `pnpm`.

---

## 2. Installation & Setup

Install dependencies and configure Husky git hooks:

```bash
pnpm install
```

Verify that `.husky/pre-commit` and `.husky/commit-msg` hooks are executable:

```bash
ls -la .husky/
```

---

## 3. Development Workflow

### 3.1 Start Local Development Server (Vite 8 + HMR)
```bash
pnpm dev
```
Local URL: `http://localhost:5173`

### 3.2 Run Unit Tests (Vitest 5)
```bash
# Run test suite once
pnpm test:run

# Run test suite in watch mode
pnpm test
```

### 3.3 TypeScript Typechecking
```bash
pnpm typecheck
```

### 3.4 Production Static Build (Rolldown)
```bash
pnpm build
```
Generates optimized static artifacts in `dist/`.

---

## 4. Git Commit & Quality Gates Verification

Husky automatically validates commits before Git accepts them:

```bash
# Example valid Conventional Commit:
git commit -m "feat(scaffolding): initialize Vite 8 and React 19 shell (T-02)"

# Example invalid commit (will be blocked):
git commit -m "added stuff"
# -> ERROR: Commit message must match Conventional Commits format!
```

#!/usr/bin/env python3
"""
TerraSpot Harmonizer (NASA Space Apps 2026) — GitHub Issues, Milestones & Project Board Automation Script.

Based on the official Product Backlog:
  - docs/backlog.md

Publishes or synchronizes the complete catalog of 12 atomic tasks organized across the 4 Hackathon Sprints (Nov 14-15, 2026):
  - Sprint 1 (Sat Nov 14 - Morning/Afternoon): T-01 to T-04 (Governance, Python NASA FIRMS Pipeline & Harmonization Engine)
  - Sprint 2 (Sat Nov 14 - Afternoon/Evening): T-05 to T-06 (Accessible Design System & Leaflet WebGIS AOI Canvas)
  - Sprint 3 (Sat Nov 14 Night - Sun Nov 15 Morning): T-07 to T-10 (Burning Activity Calendar Matrix, Anomalies, Regime & CSV)
  - Sprint 4 (Sun Nov 15 - Afternoon/Night): T-11 to T-12 (Public HTTPS Deployment, 7-Slide Pitch Deck & NASA Submission)

Usage:
  python3 scripts/create_github_issues.py [--dry-run] [--repo OWNER/REPO] [--sprint SPRINT_NUM] [--update] [--no-project] [--assignee USER]
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile
from typing import Any, Dict, List, Optional


# ── Milestone Configurations (4 Official Hackathon Sprints) ───────────────────
MILESTONES = [
    {
        "title": "Sprint 1: Governance, NASA FIRMS Pipeline & Harmonization Engine",
        "description": "Engineering governance, React 19 + TS + Vite setup, Python NASA FIRMS pipeline (2000-2026), and TerraSpot 4-Stage mathematical engine (Nov 14, 2026).",
        "due_date": "2026-11-14T20:00:00Z",
    },
    {
        "title": "Sprint 2: Accessible Design System & Leaflet WebGIS AOI",
        "description": "Aerospace dark-mode CSS tokens, KPI Cards, and interactive Leaflet map with Bounding Box, Lat/Lon coordinates, and NASA GIBS WMTS layers (Nov 14, 2026).",
        "due_date": "2026-11-15T03:00:00Z",
    },
    {
        "title": "Sprint 3: Burning Activity Calendar, Anomalies, Regime & CSV",
        "description": "Interactive 27x12 matrix with accessible ramps, climatology curve, MODIS/VIIRS sensor audit, agricultural/wildfire classifier, and CSV export (Nov 15, 2026).",
        "due_date": "2026-11-15T18:00:00Z",
    },
    {
        "title": "Sprint 4: Public HTTPS Deployment, 7-Slide Pitch Deck & NASA Submission",
        "description": "UI/UX polish, public deployment on unrestricted URL, 7-slide interactive pitch deck in English, and final v1.0.0 release (Nov 15, 2026).",
        "due_date": "2026-11-16T04:59:59Z",
    },
]

# ── Label Configurations (Sprint, Priority, Type & Status) ────────────────────
LABELS = [
    {"name": "sprint:1", "color": "0E8A16", "description": "Sprint 1: Governance, FIRMS Data & Mathematical Engine"},
    {"name": "sprint:2", "color": "FBCA04", "description": "Sprint 2: UI Design System & Leaflet WebGIS AOI"},
    {"name": "sprint:3", "color": "D93F0B", "description": "Sprint 3: Burning Activity Calendar, Charts & CSV"},
    {"name": "sprint:4", "color": "5319E7", "description": "Sprint 4: Public Deployment, 7-Slide Deck & NASA Submission"},
    {"name": "priority: critical", "color": "B60205", "description": "Blocker: Core algorithm or indispensable component"},
    {"name": "priority: high", "color": "D93F0B", "description": "Official Challenge 15 Requirement: Essential for NASA judging"},
    {"name": "priority: medium", "color": "FBCA04", "description": "Differentiating analytical feature or UX enhancement"},
    {"name": "priority: low", "color": "0E8A16", "description": "Visual polish or presentation extra"},
    {"name": "type: structure", "color": "1D76DB", "description": "Governance, repository setup and base architecture"},
    {"name": "type: data-science", "color": "5319E7", "description": "Python NASA FIRMS pipeline and MODIS-VIIRS algorithm"},
    {"name": "type: style", "color": "D4C5F9", "description": "Design system, CSS tokens and accessible color ramps"},
    {"name": "type: feature", "color": "0052CC", "description": "WebGIS components, calendar matrix, charts and CSV"},
    {"name": "type: presentation", "color": "BFD4F2", "description": "Public HTTPS deployment, 7 slides and NASA submission"},
    {"name": "status: backlog", "color": "EDEDED", "description": "Defined task ready for implementation"},
    {"name": "status: in-progress", "color": "FEF2C0", "description": "Active work in dedicated feature branch"},
    {"name": "status: in-review", "color": "D8F8C8", "description": "Build, formula and criteria verification"},
]

# ── Catalog of the 12 Atomic Backlog Tasks ────────────────────────────────────
ISSUES: List[Dict[str, Any]] = [
    {
        "id": "T-01",
        "sprint_num": 1,
        "title": "[T-01] Professional Governance, Technical Architecture & Issue Synchronization",
        "milestone": "Sprint 1: Governance, NASA FIRMS Pipeline & Harmonization Engine",
        "labels": ["sprint:1", "priority: critical", "type: structure", "status: backlog"],
        "body": """## Description
Establish software engineering governance and repository foundations for `wigsdev/terraspot-harmonizer`. Draft technical and scientific documentation in `docs/`, design system contracts in `docs/design-system.md`, operational workflow in `docs/workflow.md`, operational agent rules in `AGENTS.md`, version history in `CHANGELOG.md` (`v0.1.0`), MIT License, `README.md`, and the GitHub Issues automation script.

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-01` |
| **Sprint** | Sprint 1 (Sat Nov 14, 2026) |
| **Priority** | `priority: critical` |
| **Type** | `type: structure` |
| **Assignee** | Wilmer (@wigsdev) |
| **Files Affected** | `AGENTS.md`, `CHANGELOG.md`, `README.md`, `LICENSE`, `docs/*`, `scripts/create_github_issues.py` |

## Acceptance Criteria
- [x] Complete technical and scientific documentation in `docs/` (`01-prd` through `06-tools`, `operational-work-plan.md`, `design-system.md`, `workflow.md`, `backlog.md`).
- [x] `docs/backlog.md`, `docs/design-system.md`, and `docs/workflow.md` structured with engineering rigor in 100% English.
- [x] `AGENTS.md`, `CHANGELOG.md` (`v0.1.0`), `README.md`, and `LICENSE` (MIT) created at project root.
- [x] `scripts/create_github_issues.py` verified and ready to synchronize all 4 Sprints and 12 tasks on GitHub.""",
    },
    {
        "id": "T-02",
        "sprint_num": 1,
        "title": "[T-02] Web Project Scaffolding (React 19 + TypeScript + Vite + Tailwind CSS + Vitest + Husky)",
        "milestone": "Sprint 1: Governance, NASA FIRMS Pipeline & Harmonization Engine",
        "labels": ["sprint:1", "priority: critical", "type: structure", "status: backlog"],
        "body": """## Description
Initialize application architecture with Vite 6, React 19, and strict TypeScript using `pnpm`. Configure Spec Kit (SDD) workflows, install Husky git hooks (`.husky/pre-commit` and `.husky/commit-msg`) enforcing Conventional Commits and type safety, set up GitHub Actions CI/CD (`.github/workflows/ci.yml`), and install core dependencies (`tailwindcss`, `lucide-react`, `leaflet`, `react-leaflet`, `recharts`, `vitest`).

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-02` |
| **Sprint** | Sprint 1 (Sat Nov 14, 2026) |
| **Priority** | `priority: critical` |
| **Type** | `type: structure` |
| **Dependencies** | `T-01` |
| **Files Affected** | `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.husky/*`, `.github/workflows/ci.yml`, `src/main.tsx`, `src/App.tsx` |

## Acceptance Criteria
- [ ] `package.json` configured with version `0.2.0` and scripts `dev`, `build`, `preview`, `typecheck`, `test:run`, and `prepare`.
- [ ] Husky git hooks operational validating commit messages (*Conventional Commits*) and build/test checks.
- [ ] Initial compilation verified with `pnpm build` with zero errors or warnings.""",
    },
    {
        "id": "T-03",
        "sprint_num": 1,
        "title": "[T-03] Python NASA FIRMS Pipeline & Spatiotemporal Data Cubes Generation (2000–2026)",
        "milestone": "Sprint 1: Governance, NASA FIRMS Pipeline & Harmonization Engine",
        "labels": ["sprint:1", "priority: critical", "type: data-science", "status: backlog"],
        "body": """## Description
Develop the scientific Python script (`scripts/build_harmonized_cubes.py`) to model and process historical archives from NASA FIRMS (MODIS C6.1 at 1 km from 2000 and VIIRS C2 at 375 m from 2012 through 2026) for the 5 benchmark study regions (Huánuco & Peruvian Andes, Southern Amazon Basin, Paraná Delta / CONAE, California, and Southeastern Australia), plus a 0.01-degree spatial density grid for arbitrary bounding box queries.

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-03` |
| **Sprint** | Sprint 1 (Sat Nov 14, 2026) |
| **Priority** | `priority: critical` |
| **Type** | `type: data-science` |
| **Dependencies** | `T-02` |
| **Files Affected** | `scripts/build_harmonized_cubes.py`, `public/data/regions_catalog.json`, `public/data/firms_spatial_cells.json`, `public/data/sample_firms_huanuco.csv` |

## Acceptance Criteria
- [ ] `scripts/build_harmonized_cubes.py` executes cleanly on Python 3.13 and outputs data to `public/data/`.
- [ ] Generates monthly aggregated series from `2000-01` to `2026-10` with raw MODIS/VIIRS counts, Active Fire Cell-Days (AFCD), mean FRP (MW), and night fraction.
- [ ] Generates `public/data/sample_firms_huanuco.csv` matching NASA FIRMS schema for custom upload verification.""",
    },
    {
        "id": "T-04",
        "sprint_num": 1,
        "title": "[T-04] TypeScript Harmonization Engine, Accessible Color Ramps & Vitest Suite",
        "milestone": "Sprint 1: Governance, NASA FIRMS Pipeline & Harmonization Engine",
        "labels": ["sprint:1", "priority: critical", "type: data-science", "status: backlog"],
        "body": """## Description
Implement the **TerraSpot 4-Stage Harmonization Engine** in TypeScript (`src/engine/harmonizer.ts`): 0.01-degree grid co-registration, seasonal cross-calibration scaling factors $\\beta_m$ (2012–2025), multi-era fusion, historical climatological median, interquartile range ($P_{25}\\text{--}P_{75}$), robust $Z$-scores, and the Fire Regime Index ($I_{\\text{regime}}$). Implement `src/engine/colorRamps.ts` with *Inferno*, *Viridis*, *Cividis*, and *Diverging Anomaly* scales, accompanied by a comprehensive Vitest test suite.

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-04` |
| **Sprint** | Sprint 1 (Sat Nov 14, 2026) |
| **Priority** | `priority: critical` |
| **Type** | `type: data-science` |
| **Dependencies** | `T-03` |
| **Files Affected** | `src/types/fireData.ts`, `src/engine/harmonizer.ts`, `src/engine/colorRamps.ts`, `tests/harmonizer.test.ts`, `tests/colorRamps.test.ts` |

## Acceptance Criteria
- [ ] Pure, strongly-typed functions in `src/engine/harmonizer.ts` recalculating 27 years × 12 months in $< 30\\text{ ms}$.
- [ ] Exact model fit metrics demonstrating $R^2 > 0.90$ post-harmonization.
- [ ] `src/engine/colorRamps.ts` provides continuous, colorblind-safe RGB/Hex interpolation.
- [ ] Automated unit test suite passing at 100% in Vitest (`pnpm test:run`).""",
    },
    {
        "id": "T-05",
        "sprint_num": 2,
        "title": "[T-05] Semantic CSS Design Tokens, Aerospace Dark/Light Theme & Navigation Shell",
        "milestone": "Sprint 2: Accessible Design System & Leaflet WebGIS AOI",
        "labels": ["sprint:2", "priority: high", "type: style", "status: backlog"],
        "body": r"""## Description
Implement semantic CSS design tokens defined in `docs/design-system.md` (aerospace dark mode `#0B0F17` by default and high-contrast light mode). Build `Navbar.tsx` featuring the regional preset dropdown, year range slider, FIRMS CSV upload modal trigger, CSV export button, theme toggle, and executive `KPISummaryCards.tsx`.

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-05` |
| **Sprint** | Sprint 2 (Sat Nov 14, 2026) |
| **Priority** | `priority: high` |
| **Type** | `type: style` |
| **Dependencies** | `T-04` |
| **Files Affected** | `src/index.css`, `src/components/Navbar.tsx`, `src/components/KPISummaryCards.tsx` |

## Acceptance Criteria
- [ ] Semantic CSS variables configured for dark and light modes with WCAG 2.1 AA contrast compliance.
- [ ] Fully functional `Navbar.tsx` with global controls for region, temporal window, and export actions.
- [ ] `KPISummaryCards.tsx` displaying live metrics: *Total Harmonized Hotspots*, *Peak Fire Season*, *Selected Year Anomaly ($\Delta\%$ & Z-Score)*, and *Dominant Fire Regime Badge*.""",
    },
    {
        "id": "T-06",
        "sprint_num": 2,
        "title": "[T-06] Interactive WebGIS Canvas with Bounding Box Tool, Lat/Lon Inputs & NASA GIBS",
        "milestone": "Sprint 2: Accessible Design System & Leaflet WebGIS AOI",
        "labels": ["sprint:2", "priority: critical", "type: feature", "status: backlog"],
        "body": """## Description
Develop the interactive cartographic module with Leaflet (`MapAOISelector.tsx`) satisfying Challenge 15 Requirement R3: interactive bounding-box rectangle drawing, synchronized coordinate inputs (`Min/Max Lat/Lon`), active fire cell markers by FRP, and official NASA EOSDIS GIBS WMTS satellite tile overlays (MODIS/VIIRS corrected reflectance and thermal anomalies).

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-06` |
| **Sprint** | Sprint 2 (Sat Nov 14, 2026) |
| **Priority** | `priority: critical` |
| **Type** | `type: feature` |
| **Dependencies** | `T-05` |
| **Files Affected** | `src/components/MapAOISelector.tsx` |

## Acceptance Criteria
- [ ] Drawing a bounding box or editing coordinate inputs triggers instant re-harmonization of the calendar matrix and charts.
- [ ] Quick-select buttons for the 5 benchmark study regions with smooth camera transitions (`flyToBounds`).
- [ ] NASA GIBS satellite layers and hotspot markers render with informative contextual popups.""",
    },
    {
        "id": "T-07",
        "sprint_num": 3,
        "title": "[T-07] Interactive 27×12 Burning Activity Calendar Matrix (BurningCalendarMatrix.tsx)",
        "milestone": "Sprint 3: Burning Activity Calendar, Anomalies, Regime & CSV",
        "labels": ["sprint:3", "priority: critical", "type: feature", "status: backlog"],
        "body": """## Description
Construct the core deliverable mandated by NASA Challenge 15 (Requirements R2 and R4): the interactive 27-year (2000–2026) × 12-month (Jan–Dec) **Burning Activity Calendar Matrix**. Features metric toggles (Harmonized, Anomaly $\\Delta\\%$, FRP, Raw Unharmonized), accessible palette selection (*Inferno*, *Viridis*, *Cividis*, *Diverging*), marginal summary bars, and rich hover tooltips.

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-07` |
| **Sprint** | Sprint 3 (Nov 14-15, 2026) |
| **Priority** | `priority: critical` |
| **Type** | `type: feature` |
| **Dependencies** | `T-04`, `T-05` |
| **Files Affected** | `src/components/BurningCalendarMatrix.tsx` |

## Acceptance Criteria
- [ ] High-density 27 × 12 matrix rendering with sensor era indicators (`MODIS Era`, `Dual Fusion`, `VIIRS Continuity`).
- [ ] Instant toggle between 4 analytical metrics and 4 colorblind-safe palettes.
- [ ] Visual alert badges on cells exceeding critical thresholds ($P_{90}$ / $Z \\ge 2.0$).
- [ ] Clicking any cell or year updates the lower climatology curve and detailed inspection view.""",
    },
    {
        "id": "T-08",
        "sprint_num": 3,
        "title": "[T-08] Climatology Curves, Anomaly Analytics & Sensor Audit View (MODIS vs. VIIRS)",
        "milestone": "Sprint 3: Burning Activity Calendar, Anomalies, Regime & CSV",
        "labels": ["sprint:3", "priority: high", "type: feature", "status: backlog"],
        "body": """## Description
Develop `ClimatologyAnomalyChart.tsx` (plotting the active year against the 2001–2025 Historical Median, IQR $P_{25}\\text{--}P_{75}$ band, and $P_{90}$ critical threshold) and `SensorHarmonizationAudit.tsx` (visualizing convergence between raw MODIS, raw VIIRS, and harmonized series, reporting monthly $\\beta_m$ factors and $R^2$).

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-08` |
| **Sprint** | Sprint 3 (Nov 14-15, 2026) |
| **Priority** | `priority: high` |
| **Type** | `type: feature` |
| **Dependencies** | `T-07` |
| **Files Affected** | `src/components/ClimatologyAnomalyChart.tsx`, `src/components/SensorHarmonizationAudit.tsx` |

## Acceptance Criteria
- [ ] Interactive climatological chart comparing active season against baseline medians.
- [ ] Sensor audit plot demonstrating visual elimination of the 2012 sensor step-jump.
- [ ] Display of calculated monthly calibration factors $\\beta_1 \\dots \\beta_{12}$ and $R^2$ fit metrics.""",
    },
    {
        "id": "T-09",
        "sprint_num": 3,
        "title": "[T-09] Fire Regime Classifier: Agricultural Burning vs. Wildfires (FireRegimePanel.tsx)",
        "milestone": "Sprint 3: Burning Activity Calendar, Anomalies, Regime & CSV",
        "labels": ["sprint:3", "priority: medium", "type: feature", "status: backlog"],
        "body": """## Description
Implement `FireRegimePanel.tsx` to distinguish seasonal agricultural burning (daytime, low FRP, crop stubble clearance) from severe forest wildfires (high FRP, sustained nocturnal persistence). Features an FRP vs. Nighttime Persistence scatter plot, percentage distribution breakdown, and operational recommendations for civil defense and agricultural authorities.

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-09` |
| **Sprint** | Sprint 3 (Nov 14-15, 2026) |
| **Priority** | `priority: medium` |
| **Type** | `type: feature` |
| **Dependencies** | `T-07` |
| **Files Affected** | `src/components/FireRegimePanel.tsx` |

## Acceptance Criteria
- [ ] Interactive scatter plot separating monthly records into three quadrants: *Seasonal Agricultural Burn*, *Mixed Transitional*, and *Severe Wildfire Event*.
- [ ] Context-aware operational recommendations based on active AOI conditions.""",
    },
    {
        "id": "T-10",
        "sprint_num": 3,
        "title": "[T-10] Standardized CSV Exporter & Custom NASA FIRMS CSV Ingestion",
        "milestone": "Sprint 3: Burning Activity Calendar, Anomalies, Regime & CSV",
        "labels": ["sprint:3", "priority: high", "type: feature", "status: backlog"],
        "body": """## Description
Implement `csvExporter.ts` to generate and download with one click the complete 27-year × 12-month CSV dataset for the active AOI (27 canonical columns), and `CustomCSVModal.tsx` to allow uploading raw NASA FIRMS CSV files (MODIS or VIIRS) for real-time in-browser harmonization.

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-10` |
| **Sprint** | Sprint 3 (Nov 14-15, 2026) |
| **Priority** | `priority: high` |
| **Type** | `type: feature` |
| **Dependencies** | `T-07`, `T-08`, `T-09` |
| **Files Affected** | `src/engine/csvExporter.ts`, `src/components/CustomCSVModal.tsx`, `src/App.tsx` |

## Acceptance Criteria
- [ ] **"Download Harmonized CSV"** button exports an RFC 4180 CSV containing all 27 specified columns.
- [ ] **"Upload Custom FIRMS CSV"** modal parses user CSV files client-side and dynamically re-renders the calendar and charts.""",
    },
    {
        "id": "T-11",
        "sprint_num": 4,
        "title": "[T-11] Quality Audit, Visual Accessibility & Public Production Deployment",
        "milestone": "Sprint 4: Public HTTPS Deployment, 7-Slide Pitch Deck & NASA Submission",
        "labels": ["sprint:4", "priority: critical", "type: presentation", "status: backlog"],
        "body": """## Description
Perform final UI/UX polish, cross-device responsiveness verification, compile clean static production bundle (`pnpm build` with zero warnings), and deploy to a public HTTPS URL without passwords or access restrictions (Requirement R8).

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-11` |
| **Sprint** | Sprint 4 (Sun Nov 15, 2026) |
| **Priority** | `priority: critical` |
| **Type** | `type: presentation` |
| **Dependencies** | `T-10` |
| **Files Affected** | `src/App.tsx`, `README.md`, deployment configuration |

## Acceptance Criteria
- [ ] `pnpm build` compiles cleanly with zero TypeScript errors and zero critical warnings.
- [ ] Application deployed to public HTTPS URL verified in an incognito browser window.
- [ ] Public GitHub repository fully synchronized.""",
    },
    {
        "id": "T-12",
        "sprint_num": 4,
        "title": "[T-12] Executive 7-Slide Presentation & Official NASA Space Apps Submission (v1.0.0)",
        "milestone": "Sprint 4: Public HTTPS Deployment, 7-Slide Pitch Deck & NASA Submission",
        "labels": ["sprint:4", "priority: critical", "type: presentation", "status: backlog"],
        "body": """## Description
Construct the interactive 7-slide presentation deck in English (strictly meeting NASA Global Judging limits), verify live demo and project links in `docs/05-submission-pitch-rubric-plan.md`, and finalize SemVer `1.0.0` in `package.json` and `CHANGELOG.md`.

## Metadata
| Field | Value |
|---|---|
| **Task ID** | `T-12` |
| **Sprint** | Sprint 4 (Sun Nov 15, 2026) |
| **Priority** | `priority: critical` |
| **Type** | `type: presentation` |
| **Dependencies** | `T-11` |
| **Files Affected** | `public/demo-slides.html`, `docs/05-submission-pitch-rubric-plan.md`, `CHANGELOG.md`, `package.json` |

## Acceptance Criteria
- [ ] Exactly 7 slides in English presenting TerraSpot Harmonizer architecture, results, and Huánuco/Amazon case studies.
- [ ] All submission form text fields verified in English and ready for submission before the deadline.
- [ ] Version `1.0.0` tagged and recorded in `CHANGELOG.md`.""",
    },
]


def run_command(cmd: List[str], check: bool = True) -> subprocess.CompletedProcess:
    """Executes a system shell command and returns the completion result."""
    return subprocess.run(cmd, check=check, text=True, capture_output=True)


def check_gh_installed() -> bool:
    try:
        run_command(["gh", "--version"])
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def check_gh_auth() -> bool:
    try:
        run_command(["gh", "auth", "status"])
        return True
    except subprocess.CalledProcessError:
        return False


def detect_git_repo() -> Optional[str]:
    try:
        res = run_command(["git", "remote", "get-url", "origin"])
        url = res.stdout.strip()
        if "github.com" in url:
            part = url.split("github.com")[-1].lstrip(":/").removesuffix(".git")
            return part
    except subprocess.CalledProcessError:
        pass
    return None


def ensure_milestones(repo: str, dry_run: bool = False) -> None:
    print(f"\n🗓️  Checking Milestones (Sprints) for {repo}...")
    existing = {}
    if not dry_run:
        try:
            res = run_command(["gh", "api", f"repos/{repo}/milestones?state=all"])
            for m in json.loads(res.stdout):
                existing[m["title"]] = m["number"]
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Error querying existing milestones: {e.stderr.strip()}")

    for ms in MILESTONES:
        title = ms["title"]
        if title in existing:
            print(f"  ✓ Existing milestone found: {title} (#{existing[title]})")
        elif dry_run:
            print(f"  [DRY-RUN] Would create milestone: {title} (Due: {ms['due_date']})")
        else:
            try:
                run_command([
                    "gh", "api", f"repos/{repo}/milestones",
                    "-X", "POST",
                    "-f", f"title={title}",
                    "-f", f"description={ms['description']}",
                    "-f", f"due_on={ms['due_date']}",
                ])
                print(f"  ✓ Created milestone: {title}")
            except subprocess.CalledProcessError as e:
                print(f"  ⚠️ Error creating milestone '{title}': {e.stderr.strip()}")


def ensure_labels(repo: str, dry_run: bool = False) -> None:
    print(f"\n🏷️  Checking Labels for {repo}...")
    existing_labels = set()
    if not dry_run:
        try:
            res = run_command(["gh", "label", "list", "--repo", repo, "--limit", "100", "--json", "name"])
            existing_labels = {l["name"].lower() for l in json.loads(res.stdout)}
        except subprocess.CalledProcessError as e:
            print(f"⚠️ Error listing labels: {e.stderr.strip()}")

    for lbl in LABELS:
        if lbl["name"].lower() in existing_labels:
            print(f"  ✓ Existing label found: {lbl['name']}")
        elif dry_run:
            print(f"  [DRY-RUN] Would create label: {lbl['name']} (Color: #{lbl['color']})")
        else:
            try:
                run_command([
                    "gh", "label", "create", lbl["name"],
                    "--repo", repo,
                    "--color", lbl["color"],
                    "--description", lbl.get("description", ""),
                ])
                print(f"  ✓ Created label: {lbl['name']}")
            except subprocess.CalledProcessError as e:
                print(f"  ⚠️ Error creating label '{lbl['name']}': {e.stderr.strip()}")


def ensure_project(owner: str, title: str, dry_run: bool = False) -> Optional[int]:
    print(f"\n📊 Checking GitHub Project '{title}' for '{owner}'...")
    if dry_run:
        print(f"  [DRY-RUN] Would create or link GitHub Project: '{title}' (owner: {owner})")
        return 1

    try:
        res = run_command(["gh", "project", "list", "--owner", owner, "--format", "json"])
        for p in json.loads(res.stdout).get("projects", []):
            if p.get("title") == title:
                print(f"  ✓ Existing project found: #{p['number']} - '{title}'")
                return p["number"]

        create_res = run_command(["gh", "project", "create", "--owner", owner, "--title", title, "--format", "json"])
        p_num = json.loads(create_res.stdout).get("number")
        print(f"  ✓ Created new GitHub Project: #{p_num} - '{title}'")
        return p_num
    except subprocess.CalledProcessError as e:
        err = e.stderr.strip() if e.stderr else str(e)
        print(f"  ⚠️ Could not manage GitHub Project automatically: {err}")
        return None


def add_issue_to_project(owner: str, project_num: int, issue_url: str, dry_run: bool = False) -> None:
    if dry_run:
        print(f"    ↳ [DRY-RUN] Would add item to Project #{project_num}")
        return
    try:
        run_command(["gh", "project", "item-add", str(project_num), "--owner", owner, "--url", issue_url])
        print(f"    ↳ ✓ Added to Project #{project_num}")
    except subprocess.CalledProcessError as e:
        msg = e.stderr.strip() if e.stderr else str(e)
        if "already" in msg.lower():
            print(f"    ↳ ℹ️ Already linked to Project #{project_num}")
        else:
            print(f"    ↳ ⚠️ Warning linking to Project #{project_num}: {msg}")


def get_existing_issues(repo: str) -> Dict[str, Dict[str, Any]]:
    try:
        res = run_command(["gh", "issue", "list", "--repo", repo, "--state", "all", "--limit", "100", "--json", "number,title,state,body"])
        mapping = {}
        for item in json.loads(res.stdout):
            title = item.get("title", "")
            if title.startswith("[") and "]" in title:
                tag = title[1:title.index("]")].strip()
                mapping[tag] = item
        return mapping
    except subprocess.CalledProcessError as e:
        print(f"⚠️ Could not query existing issues: {e.stderr.strip()}")
        return {}


def create_or_update_issues(
    repo: str,
    dry_run: bool = False,
    update: bool = False,
    sprint_filter: Optional[int] = None,
    assignee: Optional[str] = "@me",
    project_num: Optional[int] = None,
    owner: str = "wigsdev",
) -> None:
    target_issues = ISSUES
    if sprint_filter is not None:
        target_issues = [i for i in ISSUES if i.get("sprint_num") == sprint_filter]
        print(f"\n🎯 Filtering solely tasks for Sprint {sprint_filter} ({len(target_issues)} tasks)")

    print(f"\n🚀 Processing {len(target_issues)} tasks for {repo}...")
    existing = get_existing_issues(repo) if not dry_run else {}

    processed = 0
    for issue in target_issues:
        task_id = issue["id"]
        if task_id in existing:
            num = existing[task_id]["number"]
            state = existing[task_id]["state"]
            if update:
                if dry_run:
                    print(f"  [DRY-RUN] Would update {task_id} (#{num})")
                else:
                    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
                        f.write(issue["body"])
                        temp_body = f.name
                    try:
                        cmd = [
                            "gh", "issue", "edit", str(num),
                            "--repo", repo,
                            "--title", issue["title"],
                            "--body-file", temp_body,
                            "--milestone", issue["milestone"],
                        ]
                        if assignee:
                            cmd.extend(["--add-assignee", assignee])
                        for lbl in issue["labels"]:
                            cmd.extend(["--add-label", lbl])
                        run_command(cmd)
                        print(f"  ✓ {task_id} (#{num}) updated successfully")
                        if project_num:
                            add_issue_to_project(owner, project_num, f"https://github.com/{repo}/issues/{num}", dry_run=False)
                    finally:
                        if os.path.exists(temp_body):
                            os.remove(temp_body)
            else:
                print(f"  ℹ️ {task_id} already exists as #{num} ({state})")
            processed += 1
            continue

        if dry_run:
            print(f"  [DRY-RUN] Would create issue: {task_id} -> {issue['title']} (Milestone: {issue['milestone']})")
            if project_num:
                add_issue_to_project(owner, project_num, f"https://github.com/{repo}/issues/dry-run", dry_run=True)
            processed += 1
        else:
            with tempfile.NamedTemporaryFile("w", delete=False, suffix=".md", encoding="utf-8") as f:
                f.write(issue["body"])
                temp_body = f.name
            try:
                cmd = [
                    "gh", "issue", "create",
                    "--repo", repo,
                    "--title", issue["title"],
                    "--body-file", temp_body,
                    "--milestone", issue["milestone"],
                ]
                if assignee:
                    cmd.extend(["--assignee", assignee])
                for lbl in issue["labels"]:
                    cmd.extend(["--label", lbl])
                res = run_command(cmd)
                issue_url = res.stdout.strip()
                print(f"  ✓ {task_id} created: {issue_url}")
                if project_num:
                    add_issue_to_project(owner, project_num, issue_url, dry_run=False)
                processed += 1
            except subprocess.CalledProcessError as e:
                print(f"  ❌ Error creating {task_id}: {e.stderr.strip()}")
            finally:
                if os.path.exists(temp_body):
                    os.remove(temp_body)

    print(f"\n✨ Completed: {processed}/{len(target_issues)} tasks processed.")


def main():
    parser = argparse.ArgumentParser(
        description="GitHub Issues, Milestones and Project Board Automation for TerraSpot Harmonizer (NASA Space Apps 2026)."
    )
    parser.add_argument("--dry-run", action="store_true", help="Simulate execution without modifying GitHub.")
    parser.add_argument("--update", action="store_true", help="Update existing issues on GitHub.")
    parser.add_argument("--sprint", type=int, choices=[1, 2, 3, 4], help="Filter by sprint number (1 to 4).")
    parser.add_argument("--repo", type=str, default=None, help="Target repository OWNER/REPO (e.g., 'wigsdev/terraspot-harmonizer').")
    parser.add_argument("--assignee", type=str, default="@me", help="Assigned user handle (default: '@me').")
    parser.add_argument("--no-project", action="store_true", help="Skip linking items to GitHub Project Board.")
    parser.add_argument("--project-title", type=str, default="TerraSpot Harmonizer — NASA Space Apps 2026", help="GitHub Project Board title.")
    args = parser.parse_args()

    repo = args.repo or detect_git_repo() or "wigsdev/terraspot-harmonizer"
    owner = repo.split("/")[0] if "/" in repo else "wigsdev"

    print("════════════════════════════════════════════════════════════════════════")
    print("   🛰️ TerraSpot Harmonizer — GitHub Projects Tasks Synchronization     ")
    print("════════════════════════════════════════════════════════════════════════")

    if not check_gh_installed():
        print("❌ Error: GitHub CLI ('gh') is not installed.")
        sys.exit(1)

    if not args.dry_run and not check_gh_auth():
        print("⚠️ Warning: You are not authenticated with GitHub CLI ('gh auth login').")
        sys.exit(1)

    print(f"🎯 Target repository: {repo}")
    if args.dry_run:
        print("🔍 Mode: SIMULATION (DRY-RUN)")

    project_num = None
    if not args.no_project:
        project_num = ensure_project(owner=owner, title=args.project_title, dry_run=args.dry_run)

    ensure_milestones(repo=repo, dry_run=args.dry_run)
    ensure_labels(repo=repo, dry_run=args.dry_run)
    create_or_update_issues(
        repo=repo,
        dry_run=args.dry_run,
        update=args.update,
        sprint_filter=args.sprint,
        assignee=args.assignee,
        project_num=project_num,
        owner=owner,
    )


if __name__ == "__main__":
    main()

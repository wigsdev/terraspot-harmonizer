# Research Document: T-12 Executive 7-Slide Presentation & Official NASA Space Apps Submission

**Feature**: `011-presentation-submission`  
**Date**: 2026-11-15  
**Author**: Antigravity Assistant & Lead Developer Wilmer Gulcochía (`@wigsdev`)

---

## 1. NASA Space Apps Challenge 2026 Pitch Regulations

### 1.1 The 7-Slide Rule
According to the official **NASA Space Apps Challenge 2026 Project Submission Guide**:
- Presentations MUST NOT exceed **7 slides maximum** (or a video $\le 30\text{ seconds}$).
- Any submission with 8 or more slides is subject to immediate disqualification during Global Judging.
- The 7 slides must cover:
  1. Title, Team, and Challenge Name
  2. The Problem and Scientific Discontinuity
  3. The Methodology / Innovative Solution
  4. The Working Tool / Interactive Product Demo
  5. Scientific Validity / Case Study Evidence
  6. Architecture, Data Sources & Global Offers
  7. Impact, Future Vision, and Verified Links

### 1.2 Interactive HTML Slide Deck Architecture (`public/demo-slides.html`)
Instead of a static PDF or generic PowerPoint, providing an interactive, standalone HTML deck delivers significant advantages:
1. **Interactive Evaluation:** Judges can navigate via keyboard (`ArrowRight`, `ArrowLeft`, `Space`), touch swipes, or navigation buttons.
2. **Deep-Space Dark Aesthetic:** High-contrast aerospace UI (`#0B0F17`), glowing cyber-accents (`#06B6D4` Cyan, `#F59E0B` Amber, `#10B981` Emerald), and clean SVG iconography.
3. **100% Offline Standalone:** Self-contained CSS, embedded SVG icons, and vanilla JavaScript event listeners. No external CDN dependencies that could fail during judging.
4. **Direct Web Hosting:** Accessible directly via `https://terraspot-harmonizer.vercel.app/demo-slides.html` as well as locally.

---

## 2. Global Offers & Partner Resources Integration Matrix

To maximize points under the *Partner Resources & Global Offers* judging rubric, the deck and submission texts explicitly feature:

1. **Meteomatics Weather API:**
   - Real in-situ atmospheric parameters (`forest_fire_warning:idx`, temperature, relative humidity, wind speed, evapotranspiration) cached client-side to physically validate high-energy fire regimes.
2. **GoDaddy Registry & Porkbun:**
   - Official custom mission domain registration (`https://terraspot-harmonizer.space`) with 1-year SSL certificate for public HTTPS delivery.
3. **Microsoft Planetary Computer:**
   - STAC API open geospatial catalog integration and bounding box alignment.
4. **GitHub Copilot & Microsoft Copilot:**
   - Super Intelligence (SI) coding acceleration and English documentation peer review under official NASA SI Policy guidelines.
5. **Miro Intelligent Canvas:**
   - Architecture diagrams, workflow design, and sprint sprint planning.

---

## 3. Peruvian Andes-Amazon Case Study & Scientific Validation

- **Huánuco Context:** Showcases the Andean-Amazonian interface where traditional agricultural burning (July–August, low Fire Radiative Power, daytime only) contrasts sharply with runaway forest wildfires (high FRP $> 80\text{ MW}$, night persistence $f_{\text{night}} > 25\%$).
- **Statistical Convergence:** Highlights the empirical scaling factor $\beta_m$ achieving $R^2 > 0.92$ over the 14-year sensor overlap window (2012–2025).

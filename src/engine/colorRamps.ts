/**
 * TerraSpot Harmonizer - Accessible Color Ramps & WCAG 2.1 AA Contrast Engine
 * Adheres to docs/design-system.md Section 2.3 and WCAG 2.1 Relative Luminance Standards.
 */

import type { AccessiblePalette, AccessibleTextColor, ColorCellStyle, PaletteType, RgbColor } from '../types';

// ---------------------------------------------------------------------------
// Constants & Color Definitions
// ---------------------------------------------------------------------------

export const COLOR_RAMPS_ENGINE_VERSION = '0.4.0';

export const DARK_TEXT_HEX = '#0B0F17';
export const LIGHT_TEXT_HEX = '#F8FAFC';
export const PURE_BLACK_TEXT_HEX = '#000000';
export const PURE_WHITE_TEXT_HEX = '#FFFFFF';
export const WCAG_AA_MIN_CONTRAST = 4.5;

/**
 * Certified colorblind-safe 5-stop color palettes.
 * Verified for Deuteranopia, Protanopia, and Tritanopia.
 */
export const ACCESSIBLE_PALETTES: Record<PaletteType, AccessiblePalette> = {
  inferno: {
    id: 'inferno',
    name: 'Inferno (Thermal Activity)',
    wcag_certified: true,
    colorblind_safe: ['deuteranopia', 'protanopia', 'tritanopia'],
    stops: [
      { offset: 0.0, hex: '#000004' },
      { offset: 0.25, hex: '#420a68' },
      { offset: 0.5, hex: '#932667' },
      { offset: 0.75, hex: '#dd513a' },
      { offset: 1.0, hex: '#fcffa4' },
    ],
  },
  viridis: {
    id: 'viridis',
    name: 'Viridis (Scientific Multihue)',
    wcag_certified: true,
    colorblind_safe: ['deuteranopia', 'protanopia', 'tritanopia'],
    stops: [
      { offset: 0.0, hex: '#440154' },
      { offset: 0.25, hex: '#3b528b' },
      { offset: 0.5, hex: '#21918c' },
      { offset: 0.75, hex: '#5ec962' },
      { offset: 1.0, hex: '#fde725' },
    ],
  },
  cividis: {
    id: 'cividis',
    name: 'Cividis (Optimized Dichromacy)',
    wcag_certified: true,
    colorblind_safe: ['deuteranopia', 'protanopia', 'tritanopia'],
    stops: [
      { offset: 0.0, hex: '#00204d' },
      { offset: 0.25, hex: '#414d6b' },
      { offset: 0.5, hex: '#7c7b78' },
      { offset: 0.75, hex: '#bba868' },
      { offset: 1.0, hex: '#ffea46' },
    ],
  },
  diverging: {
    id: 'diverging',
    name: 'Diverging Anomaly (Blue-White-Red)',
    wcag_certified: true,
    colorblind_safe: ['deuteranopia', 'protanopia', 'tritanopia'],
    stops: [
      { offset: 0.0, hex: '#2166ac' },
      { offset: 0.25, hex: '#67a9cf' },
      { offset: 0.5, hex: '#f7f7f7' },
      { offset: 0.75, hex: '#ef8a62' },
      { offset: 1.0, hex: '#b2182b' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Conversion & Normalization Helpers (FR-007)
// ---------------------------------------------------------------------------

/**
 * Parse standard 3-digit or 6-digit hex string into RGB triplet.
 */
export function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return {
      r: Number.isNaN(r) ? 0 : r,
      g: Number.isNaN(g) ? 0 : g,
      b: Number.isNaN(b) ? 0 : b,
    };
  }

  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return {
    r: Number.isNaN(r) ? 0 : r,
    g: Number.isNaN(g) ? 0 : g,
    b: Number.isNaN(b) ? 0 : b,
  };
}

/**
 * Format RGB color triplet into canonical uppercase 6-digit hex string.
 */
export function rgbToHex(rgb: RgbColor): string {
  const clampChannel = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const rHex = clampChannel(rgb.r).toString(16).padStart(2, '0');
  const gHex = clampChannel(rgb.g).toString(16).padStart(2, '0');
  const bHex = clampChannel(rgb.b).toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`.toLowerCase();
}

/**
 * Normalize scalar value onto [0.0, 1.0], with safeguards for non-finite or degenerate domains.
 */
export function normalizeValue(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
    return 0.0;
  }
  const t = (value - min) / (max - min);
  return Math.max(0.0, Math.min(1.0, t));
}

/**
 * Map climatological percentage departure (-100% to +100%+) symmetrically onto [0.0, 1.0].
 * Centered strictly at 0.5 for 0.0% departure (median baseline).
 */
export function normalizeDivergingAnomaly(departurePercentage: number, maxMagnitude: number = 100.0): number {
  if (!Number.isFinite(departurePercentage) || !Number.isFinite(maxMagnitude) || maxMagnitude <= 0.0) {
    return 0.5;
  }
  const clamped = Math.max(-maxMagnitude, Math.min(maxMagnitude, departurePercentage));
  return Number((0.5 + 0.5 * (clamped / maxMagnitude)).toFixed(4));
}

// ---------------------------------------------------------------------------
// Piecewise-Linear Color Interpolation (FR-007)
// ---------------------------------------------------------------------------

/**
 * Interpolate RGB color along the chosen palette at normalized position t in [0.0, 1.0].
 */
export function interpolatePaletteRgb(palette: PaletteType, t: number): RgbColor {
  const pal = ACCESSIBLE_PALETTES[palette] ?? ACCESSIBLE_PALETTES.inferno;
  const clampedT = Math.max(0.0, Math.min(1.0, Number.isFinite(t) ? t : 0.0));
  const stops = pal.stops;

  // Exact anchor stop match
  if (clampedT <= stops[0].offset) {
    return hexToRgb(stops[0].hex);
  }
  if (clampedT >= stops[stops.length - 1].offset) {
    return hexToRgb(stops[stops.length - 1].hex);
  }

  // Find enclosing interval [i, i+1]
  for (let i = 0; i < stops.length - 1; i++) {
    const s0 = stops[i];
    const s1 = stops[i + 1];
    if (clampedT >= s0.offset && clampedT <= s1.offset) {
      const localRange = s1.offset - s0.offset;
      const localT = localRange > 0 ? (clampedT - s0.offset) / localRange : 0.0;
      const c0 = hexToRgb(s0.hex);
      const c1 = hexToRgb(s1.hex);

      return {
        r: Math.round(c0.r + (c1.r - c0.r) * localT),
        g: Math.round(c0.g + (c1.g - c0.g) * localT),
        b: Math.round(c0.b + (c1.b - c0.b) * localT),
      };
    }
  }

  return hexToRgb(stops[stops.length - 1].hex);
}

/**
 * Interpolate hex color string along the chosen palette at position t in [0.0, 1.0].
 */
export function interpolatePaletteHex(palette: PaletteType, t: number): string {
  const rgb = interpolatePaletteRgb(palette, t);
  return rgbToHex(rgb);
}

/**
 * Generate CSS linear-gradient string for interactive UI heatmap legends.
 */
export function getPaletteCssGradient(palette: PaletteType, direction: string = 'to right'): string {
  const pal = ACCESSIBLE_PALETTES[palette] ?? ACCESSIBLE_PALETTES.inferno;
  const stopsCss = pal.stops.map((s) => `${s.hex} ${Math.round(s.offset * 100)}%`).join(', ');
  return `linear-gradient(${direction}, ${stopsCss})`;
}

// ---------------------------------------------------------------------------
// WCAG 2.1 Level AA Relative Luminance & Contrast Resolver (FR-008)
// ---------------------------------------------------------------------------

/**
 * Linearize an sRGB 8-bit color channel [0, 255] according to WCAG 2.1 specs.
 */
function linearizeChannel(channel8Bit: number): number {
  const s = Math.max(0.0, Math.min(255.0, channel8Bit)) / 255.0;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Compute W3C WCAG 2.1 relative luminance L in [0.0, 1.0].
 */
export function getRelativeLuminance(hexOrRgb: string | RgbColor): number {
  const rgb = typeof hexOrRgb === 'string' ? hexToRgb(hexOrRgb) : hexOrRgb;
  const rLin = linearizeChannel(rgb.r);
  const gLin = linearizeChannel(rgb.g);
  const bLin = linearizeChannel(rgb.b);

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Compute WCAG 2.1 contrast ratio between two colors (fg and bg).
 * Returns ratio in [1.0, 21.0].
 */
export function getContrastRatio(fgHex: string, bgHex: string): number {
  const l1 = getRelativeLuminance(fgHex);
  const l2 = getRelativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

/**
 * Select the foreground text color maximizing contrast against bgHex.
 * Guarantees contrast ratio >= 4.5:1 for every background luminance.
 */
export function getAccessibleTextColor(bgHex: string): {
  textHex: AccessibleTextColor;
  contrastRatio: number;
} {
  const crDark = getContrastRatio(DARK_TEXT_HEX, bgHex);
  const crLight = getContrastRatio(LIGHT_TEXT_HEX, bgHex);

  if (crDark >= WCAG_AA_MIN_CONTRAST && crDark >= crLight) {
    return {
      textHex: DARK_TEXT_HEX,
      contrastRatio: crDark,
    };
  }

  if (crLight >= WCAG_AA_MIN_CONTRAST && crLight >= crDark) {
    return {
      textHex: LIGHT_TEXT_HEX,
      contrastRatio: crLight,
    };
  }

  // Mid-tone crossover fallback ensuring strict WCAG 2.1 AA >= 4.5:1 compliance
  const crPureWhite = getContrastRatio(PURE_WHITE_TEXT_HEX, bgHex);
  const crPureBlack = getContrastRatio(PURE_BLACK_TEXT_HEX, bgHex);

  if (crPureBlack >= crPureWhite) {
    return {
      textHex: PURE_BLACK_TEXT_HEX,
      contrastRatio: crPureBlack,
    };
  }

  return {
    textHex: PURE_WHITE_TEXT_HEX,
    contrastRatio: crPureWhite,
  };
}

/**
 * Get complete accessible styling metadata for a cell in the Burning Activity Calendar.
 */
export function getAccessibleCellStyle(palette: PaletteType, t: number): ColorCellStyle {
  const clampedT = Math.max(0.0, Math.min(1.0, Number.isFinite(t) ? t : 0.0));
  const bgHex = interpolatePaletteHex(palette, clampedT);
  const { textHex, contrastRatio } = getAccessibleTextColor(bgHex);

  return {
    backgroundHex: bgHex,
    textHex,
    contrastRatio,
    normalizedT: clampedT,
  };
}

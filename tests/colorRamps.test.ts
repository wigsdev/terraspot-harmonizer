import { describe, it, expect } from 'vitest';
import type { PaletteType } from '../src/types';
import {
  ACCESSIBLE_PALETTES,
  DARK_TEXT_HEX,
  LIGHT_TEXT_HEX,
  WCAG_AA_MIN_CONTRAST,
  getAccessibleCellStyle,
  getAccessibleTextColor,
  getContrastRatio,
  getPaletteCssGradient,
  getRelativeLuminance,
  hexToRgb,
  interpolatePaletteHex,
  interpolatePaletteRgb,
  normalizeDivergingAnomaly,
  normalizeValue,
  rgbToHex,
} from '../src/engine/colorRamps';

describe('TerraSpot Accessible Color Ramps & Contrast Engine (src/engine/colorRamps.ts)', () => {
  const PALETTES: PaletteType[] = ['inferno', 'viridis', 'cividis', 'diverging'];

  describe('Palette Stop Exactness (FR-007)', () => {
    it('defines wcag_certified and colorblind_safe metadata on all ACCESSIBLE_PALETTES', () => {
      for (const p of PALETTES) {
        expect(ACCESSIBLE_PALETTES[p].wcag_certified).toBe(true);
        expect(ACCESSIBLE_PALETTES[p].stops).toHaveLength(5);
        expect(ACCESSIBLE_PALETTES[p].colorblind_safe).toContain('deuteranopia');
      }
    });

    it('interpolates RGB channels accurately with interpolatePaletteRgb', () => {
      const rgb = interpolatePaletteRgb('inferno', 0.5);
      expect(rgb.r).toBe(147);
      expect(rgb.g).toBe(38);
      expect(rgb.b).toBe(103);
    });

    it('matches exact canonical 5-stop hex anchors for Inferno', () => {
      expect(interpolatePaletteHex('inferno', 0.0)).toBe('#000004');
      expect(interpolatePaletteHex('inferno', 0.25)).toBe('#420a68');
      expect(interpolatePaletteHex('inferno', 0.5)).toBe('#932667');
      expect(interpolatePaletteHex('inferno', 0.75)).toBe('#dd513a');
      expect(interpolatePaletteHex('inferno', 1.0)).toBe('#fcffa4');
    });

    it('matches exact canonical 5-stop hex anchors for Viridis', () => {
      expect(interpolatePaletteHex('viridis', 0.0)).toBe('#440154');
      expect(interpolatePaletteHex('viridis', 0.25)).toBe('#3b528b');
      expect(interpolatePaletteHex('viridis', 0.5)).toBe('#21918c');
      expect(interpolatePaletteHex('viridis', 0.75)).toBe('#5ec962');
      expect(interpolatePaletteHex('viridis', 1.0)).toBe('#fde725');
    });

    it('matches exact canonical 5-stop hex anchors for Cividis', () => {
      expect(interpolatePaletteHex('cividis', 0.0)).toBe('#00204d');
      expect(interpolatePaletteHex('cividis', 0.25)).toBe('#414d6b');
      expect(interpolatePaletteHex('cividis', 0.5)).toBe('#7c7b78');
      expect(interpolatePaletteHex('cividis', 0.75)).toBe('#bba868');
      expect(interpolatePaletteHex('cividis', 1.0)).toBe('#ffea46');
    });

    it('matches exact canonical 5-stop hex anchors for Diverging', () => {
      expect(interpolatePaletteHex('diverging', 0.0)).toBe('#2166ac');
      expect(interpolatePaletteHex('diverging', 0.25)).toBe('#67a9cf');
      expect(interpolatePaletteHex('diverging', 0.5)).toBe('#f7f7f7');
      expect(interpolatePaletteHex('diverging', 0.75)).toBe('#ef8a62');
      expect(interpolatePaletteHex('diverging', 1.0)).toBe('#b2182b');
    });
  });

  describe('Symmetric Diverging Anomaly Normalization (FR-007)', () => {
    it('maps percentage departures symmetrically around 0% (median baseline = 0.5)', () => {
      expect(normalizeDivergingAnomaly(-100)).toBe(0.0);
      expect(normalizeDivergingAnomaly(-50)).toBe(0.25);
      expect(normalizeDivergingAnomaly(0)).toBe(0.5);
      expect(normalizeDivergingAnomaly(50)).toBe(0.75);
      expect(normalizeDivergingAnomaly(100)).toBe(1.0);
    });

    it('clamps out-of-range departure values gracefully', () => {
      expect(normalizeDivergingAnomaly(-250)).toBe(0.0);
      expect(normalizeDivergingAnomaly(350)).toBe(1.0);
    });

    it('handles non-finite anomaly inputs safely by defaulting to 0.5', () => {
      expect(normalizeDivergingAnomaly(NaN)).toBe(0.5);
      expect(normalizeDivergingAnomaly(Infinity)).toBe(0.5);
      expect(normalizeDivergingAnomaly(-Infinity)).toBe(0.5);
    });
  });

  describe('Domain Normalization & Conversion Primitives (FR-007, SC-003)', () => {
    it('normalizes values within [min, max] domain onto [0, 1]', () => {
      expect(normalizeValue(0, 0, 100)).toBe(0.0);
      expect(normalizeValue(50, 0, 100)).toBe(0.5);
      expect(normalizeValue(100, 0, 100)).toBe(1.0);
      expect(normalizeValue(-20, 0, 100)).toBe(0.0);
      expect(normalizeValue(150, 0, 100)).toBe(1.0);
    });

    it('handles degenerate min >= max or non-finite inputs by returning 0.0', () => {
      expect(normalizeValue(50, 100, 100)).toBe(0.0);
      expect(normalizeValue(50, 100, 20)).toBe(0.0);
      expect(normalizeValue(NaN, 0, 100)).toBe(0.0);
      expect(normalizeValue(50, NaN, 100)).toBe(0.0);
      expect(normalizeValue(50, 0, Infinity)).toBe(0.0);
    });

    it('converts hex to RGB and RGB to hex bidirectionally', () => {
      const rgbInfernoMax = hexToRgb('#fcffa4');
      expect(rgbInfernoMax).toEqual({ r: 252, g: 255, b: 164 });
      expect(rgbToHex(rgbInfernoMax)).toBe('#fcffa4');

      const rgb3Digit = hexToRgb('#fff');
      expect(rgb3Digit).toEqual({ r: 255, g: 255, b: 255 });
      expect(rgbToHex(rgb3Digit)).toBe('#ffffff');
    });

    it('clamps interpolation t to [0, 1] when inputs are outside bounds', () => {
      const hexBelow = interpolatePaletteHex('inferno', -0.5);
      expect(hexBelow).toBe('#000004');

      const hexAbove = interpolatePaletteHex('inferno', 1.5);
      expect(hexAbove).toBe('#fcffa4');

      const hexNan = interpolatePaletteHex('inferno', NaN);
      expect(hexNan).toBe('#000004');
    });

    it('generates valid CSS gradient strings for UI legends', () => {
      const gradient = getPaletteCssGradient('viridis');
      expect(gradient).toContain('linear-gradient(to right');
      expect(gradient).toContain('#440154 0%');
      expect(gradient).toContain('#fde725 100%');
    });
  });

  describe('WCAG 2.1 AA Relative Luminance & Contrast Safety (FR-008, SC-004)', () => {
    it('computes expected relative luminance for reference colors', () => {
      const lBlack = getRelativeLuminance('#000000');
      const lWhite = getRelativeLuminance('#ffffff');
      expect(lBlack).toBe(0.0);
      expect(lWhite).toBe(1.0);

      const crMax = getContrastRatio('#000000', '#ffffff');
      expect(crMax).toBe(21.0);

      const crMin = getContrastRatio('#ffffff', '#ffffff');
      expect(crMin).toBe(1.0);
    });

    it('guarantees WCAG 2.1 AA contrast ratio (>= 4.5:1) across all 4 palettes for 101 sampled steps', () => {
      let totalSamples = 0;
      let passingSamples = 0;

      for (const palette of PALETTES) {
        for (let i = 0; i <= 100; i++) {
          const t = i / 100.0;
          totalSamples++;

          const cellStyle = getAccessibleCellStyle(palette, t);
          expect(cellStyle.textHex).toMatch(/^#(0B0F17|F8FAFC|000000|FFFFFF)$/);
          expect(cellStyle.contrastRatio).toBeGreaterThanOrEqual(WCAG_AA_MIN_CONTRAST);

          if (cellStyle.contrastRatio >= WCAG_AA_MIN_CONTRAST) {
            passingSamples++;
          }
        }
      }

      expect(totalSamples).toBe(404);
      expect(passingSamples).toBe(404);
    });

    it('selects light text for dark backgrounds and dark text for light backgrounds', () => {
      // Very dark background (#000004) -> light text (#F8FAFC)
      const darkBgStyle = getAccessibleTextColor('#000004');
      expect(darkBgStyle.textHex).toBe(LIGHT_TEXT_HEX);
      expect(darkBgStyle.contrastRatio).toBeGreaterThan(15.0);

      // Very light background (#fcffa4) -> dark text (#0B0F17)
      const lightBgStyle = getAccessibleTextColor('#fcffa4');
      expect(lightBgStyle.textHex).toBe(DARK_TEXT_HEX);
      expect(lightBgStyle.contrastRatio).toBeGreaterThan(12.0);
    });
  });
});

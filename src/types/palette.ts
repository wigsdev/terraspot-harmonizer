/**
 * WCAG 2.1 AA certified colorblind-safe palettes.
 * Adheres to docs/design-system.md.
 */

export type PaletteType = 'inferno' | 'viridis' | 'cividis' | 'diverging';

export type AccessibleTextColor = '#0B0F17' | '#F8FAFC' | '#000000' | '#FFFFFF';

export interface ColorStop {
  offset: number; // 0.0 to 1.0
  hex: string;
}

export interface AccessiblePalette {
  id: PaletteType;
  name: string;
  wcag_certified: boolean;
  colorblind_safe: ('deuteranopia' | 'protanopia' | 'tritanopia')[];
  stops: ColorStop[];
}

export interface RgbColor {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export interface ColorCellStyle {
  backgroundHex: string;
  textHex: AccessibleTextColor;
  contrastRatio: number;
  normalizedT: number;
}

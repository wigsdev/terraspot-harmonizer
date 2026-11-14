/**
 * WCAG 2.1 AA certified colorblind-safe palettes.
 * Adheres to docs/design-system.md.
 */

export type PaletteType = 'inferno' | 'viridis' | 'cividis' | 'diverging';

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

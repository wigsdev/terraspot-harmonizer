/**
 * Interface Contract: RegionContext
 * Feature: 004-navigation-kpis-shell
 */

import type { RegionCube, RegionsCatalogDocument } from '../../../src/types/region';
import type { PaletteType } from '../../../src/types/palette';

export interface RegionSummary {
  id: string;
  name: string;
  country: string;
  typical_fire_regime: string;
}

export interface RegionContextType {
  selectedRegionId: string;
  currentRegion: RegionCube | null;
  regionsList: RegionSummary[];
  activePalette: PaletteType;
  catalog: RegionsCatalogDocument | null;
  isLoading: boolean;
  error: string | null;
  setRegionId: (id: string) => void;
  setPalette: (palette: PaletteType) => void;
  reloadCatalog: () => Promise<void>;
}

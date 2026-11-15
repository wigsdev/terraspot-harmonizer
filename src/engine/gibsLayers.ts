/**
 * NASA EOSDIS GIBS WMTS & Cartographic Basemap Layer Engine.
 * Adheres to specs/005-map-aoi-gibs/contracts/gibs-wmts.contract.ts.
 */

import type { GIBSWMTSLayerDefinition, MapLayerId } from '../types';

export const MAP_LAYERS: Record<MapLayerId, GIBSWMTSLayerDefinition> = {
  dark_matter: {
    id: 'dark_matter',
    labelKey: 'darkMatter',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a> &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16,
    minZoom: 1,
    subdomains: [],
    isSatellite: false,
  },
  modis_truecolor: {
    id: 'modis_truecolor',
    labelKey: 'modisTrueColor',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    attribution:
      'Imagery &copy; <a href="https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs" target="_blank" rel="noreferrer">NASA EOSDIS GIBS</a>',
    maxZoom: 9,
    minZoom: 1,
    isSatellite: true,
  },
  viirs_truecolor: {
    id: 'viirs_truecolor',
    labelKey: 'viirsTrueColor',
    url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
    attribution:
      'Imagery &copy; <a href="https://www.earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs" target="_blank" rel="noreferrer">NASA EOSDIS GIBS</a>',
    maxZoom: 9,
    minZoom: 1,
    isSatellite: true,
  },
};

/**
 * Resolves the concrete tile URL template for a layer and target date string (YYYY-MM-DD).
 */
export function buildTileUrl(layerId: MapLayerId, dateStr: string): string {
  const layer = MAP_LAYERS[layerId];
  if (!layer) {
    return MAP_LAYERS.dark_matter.url;
  }
  if (!layer.isSatellite) {
    return layer.url;
  }
  return layer.url.replace('{time}', dateStr);
}

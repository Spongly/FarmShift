// ============================================================
// NASA GIBS WMTS Layer Configuration & Tile Helpers
// Global Imagery Browse Services (GIBS) for interactive maps
// All layers verified against live NASA EPSG:3857 WMTS server
// ============================================================

export interface SatelliteLayerOption {
  id: string;
  nameEn: string;
  nameNe: string;
  descriptionEn: string;
  descriptionNe: string;
  layerId: string;
  format: 'image/jpeg' | 'image/png';
  tileMatrixSet: string;
  maxNativeZoom: number;
  attribution: string;
  resolution: string;
  instrument: string;
  category: 'satellite' | 'soil' | 'temperature' | 'precipitation';
}

export const NASA_GIBS_LAYERS: SatelliteLayerOption[] = [
  {
    id: 'true_color',
    nameEn: 'True Color (MODIS Terra)',
    nameNe: 'वास्तविक उपग्रह तस्बिर (MODIS Terra)',
    descriptionEn: 'Daily natural color surface reflection from NASA Terra satellite.',
    descriptionNe: 'नासा टेरा उपग्रहबाट दैनिक प्राकृतिक रङ सतह प्रतिबिम्ब।',
    layerId: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    format: 'image/jpeg',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    maxNativeZoom: 9,
    attribution: 'NASA EOSDIS GIBS / MODIS Terra',
    resolution: '250m',
    instrument: 'MODIS (Terra)',
    category: 'satellite',
  },
  {
    id: 'smap_surface_sm',
    nameEn: 'SMAP Surface Soil Moisture',
    nameNe: 'सतहको माटो चिस्यान (NASA SMAP)',
    descriptionEn: 'NASA SMAP Level-4 analyzed surface soil moisture (0–5 cm depth, m³/m³).',
    descriptionNe: 'नासा SMAP उपग्रहबाट विश्लेषण गरिएको माटोको सतह चिस्यान (०-५ से.मी.)।',
    layerId: 'SMAP_L4_Analyzed_Surface_Soil_Moisture',
    format: 'image/png',
    tileMatrixSet: 'GoogleMapsCompatible_Level6',
    maxNativeZoom: 6,
    attribution: 'NASA EOSDIS GIBS / SMAP Radiometer & Radar',
    resolution: '9 km',
    instrument: 'SMAP L-Band Radiometer',
    category: 'soil',
  },
  {
    id: 'smap_root_sm',
    nameEn: 'SMAP Root-Zone Soil Moisture',
    nameNe: 'जरा क्षेत्रको माटो चिस्यान (Root-Zone SMAP)',
    descriptionEn: 'NASA SMAP Level-4 analyzed root-zone soil wetness (0–100 cm depth).',
    descriptionNe: 'नासा SMAP बाट विश्लेषण गरिएको जरा तहको गहिरो चिस्यान (०-१ मिटर गहिराइ)।',
    layerId: 'SMAP_L4_Analyzed_Root_Zone_Soil_Moisture',
    format: 'image/png',
    tileMatrixSet: 'GoogleMapsCompatible_Level6',
    maxNativeZoom: 6,
    attribution: 'NASA EOSDIS GIBS / SMAP Land Model',
    resolution: '9 km',
    instrument: 'SMAP L-Band / Catchment Land Model',
    category: 'soil',
  },
  {
    id: 'lst_modis',
    nameEn: 'Land Surface Temp Day (MODIS LST)',
    nameNe: 'जमिन सतह तापक्रम (MODIS LST)',
    descriptionEn: 'Daytime surface skin temperature, capturing soil heat stress and microclimate warming.',
    descriptionNe: 'दिउँसोको जमिन सतह तापक्रम जसले माटोको तापीय तनाव र गर्मी देखाउँछ।',
    layerId: 'MODIS_Terra_Land_Surface_Temp_Day',
    format: 'image/png',
    tileMatrixSet: 'GoogleMapsCompatible_Level7',
    maxNativeZoom: 7,
    attribution: 'NASA EOSDIS GIBS / MODIS LST',
    resolution: '1 km',
    instrument: 'MODIS (Terra)',
    category: 'temperature',
  },
  {
    id: 'gpm_imerg',
    nameEn: 'GPM IMERG Precipitation (Daily)',
    nameNe: 'GPM IMERG वर्षा दर (दैनिक)',
    descriptionEn: 'Global Precipitation Measurement constellation daily rain rate accumulation.',
    descriptionNe: 'नासा GPM उपग्रहबाट दैनिक वर्षा मापन तथ्याङ्क।',
    layerId: 'IMERG_Precipitation_Rate',
    format: 'image/png',
    tileMatrixSet: 'GoogleMapsCompatible_Level6',
    maxNativeZoom: 6,
    attribution: 'NASA EOSDIS GIBS / GPM IMERG',
    resolution: '0.1° (~10 km)',
    instrument: 'GPM Microwave & Radar Imager',
    category: 'precipitation',
  },
  {
    id: 'viirs_true_color',
    nameEn: 'VIIRS True Color (Suomi NPP)',
    nameNe: 'VIIRS वास्तविक तस्बिर (Suomi NPP)',
    descriptionEn: 'High-resolution natural color reflection from VIIRS instrument on Suomi NPP.',
    descriptionNe: 'नासा VIIRS क्यामेराबाट उच्च-रिजोल्युसन प्राकृतिक रङ तस्बिर।',
    layerId: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    format: 'image/jpeg',
    tileMatrixSet: 'GoogleMapsCompatible_Level9',
    maxNativeZoom: 9,
    attribution: 'NASA EOSDIS GIBS / VIIRS SNPP',
    resolution: '375m',
    instrument: 'VIIRS (Suomi NPP)',
    category: 'satellite',
  },
];

// Helper to construct GIBS WMTS tile URL
export function getGibsWmtsUrl(layer: SatelliteLayerOption, dateStr = '2024-05-01'): string {
  // GIBS REST URL format:
  // https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/{tileMatrixSet}/{z}/{y}/{x}.{format}
  const ext = layer.format === 'image/jpeg' ? 'jpeg' : 'png';
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer.layerId}/default/${dateStr}/${layer.tileMatrixSet}/{z}/{y}/{x}.${ext}`;
}

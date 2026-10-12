import type {
  NepalesePreset,
  Crop,
  SoilTexture,
  DrainageClass,
} from '../types';

// ============================================================
// NEPALESE LOCATION PRESETS
// Source: Nepal Government, MoALD district profiles 2023
// ============================================================

export const NEPAL_PRESETS: NepalesePreset[] = [
  {
    name: 'Kathmandu Valley',
    district: 'Kathmandu',
    province: 'Bagmati',
    latitude: 27.7172,
    longitude: 85.3240,
    description: 'Mid-hill urban valley, ~1350 m elevation. Mixed peri-urban agriculture.',
    primaryCrops: ['Rice', 'Wheat', 'Maize', 'Vegetables'],
    agroclimaticZone: 'Mid-Hill',
  },
  {
    name: 'Chitwan District',
    district: 'Chitwan',
    province: 'Bagmati',
    latitude: 27.5291,
    longitude: 84.3542,
    description: 'Terai lowland, ~250 m elevation. Major rice and wheat belt.',
    primaryCrops: ['Rice', 'Wheat', 'Maize', 'Mustard', 'Lentil'],
    agroclimaticZone: 'Terai',
  },
  {
    name: 'Pokhara Valley',
    district: 'Kaski',
    province: 'Gandaki',
    latitude: 28.2096,
    longitude: 83.9856,
    description: 'Mid-hill lake valley, ~820 m elevation. High rainfall region.',
    primaryCrops: ['Rice', 'Maize', 'Vegetables', 'Soybean'],
    agroclimaticZone: 'Mid-Hill',
  },
  {
    name: 'Rupandehi (Terai)',
    district: 'Rupandehi',
    province: 'Lumbini',
    latitude: 27.5050,
    longitude: 83.4554,
    description: 'Terai flatlands, ~100 m elevation. Dense agricultural zone near Lumbini.',
    primaryCrops: ['Rice', 'Wheat', 'Mustard', 'Lentil', 'Chickpea'],
    agroclimaticZone: 'Terai',
  },
  {
    name: 'Dhankuta (Hills)',
    district: 'Dhankuta',
    province: 'Koshi',
    latitude: 26.9786,
    longitude: 87.3479,
    description: 'Eastern mid-hills, ~1050 m elevation. Mixed cropping system.',
    primaryCrops: ['Maize', 'Millet', 'Potato', 'Vegetables'],
    agroclimaticZone: 'Mid-Hill',
  },
  {
    name: 'Mustang (High Mountain)',
    district: 'Mustang',
    province: 'Gandaki',
    latitude: 28.9969,
    longitude: 83.7572,
    description: 'High mountain rain-shadow area, ~2800 m elevation. Very dry climate.',
    primaryCrops: ['Buckwheat', 'Potato', 'Barley'],
    agroclimaticZone: 'High Mountain',
  },
];

// ============================================================
// CROP KNOWLEDGE DATABASE
// Sources:
// - NARC (Nepal Agricultural Research Council) Technical Bulletins
// - MoALD Nepal Agriculture Statistics 2023/24
// - FAO Country Profile Nepal 2022
// - CIMMYT Nepal Maize Research 2021
// - Thresholds are literature-derived approximations for planning
//   purposes only — local conditions vary. See methodology page.
// ============================================================

export const CROPS: Crop[] = [
  {
    id: 'rice-transplanted',
    name: 'Transplanted Rice',
    localName: 'Dhan (Ropai)',
    scientificName: 'Oryza sativa L.',
    category: 'cereal',
    description: 'Dominant Kharif cereal, transplanted in lowlands and mid-hills. Major food crop of Nepal.',
    calendar: {
      sowingMonths: [5, 6],          // May-June nursery
      harvestMonths: [10, 11],       // Oct-Nov
      durationDays: { min: 120, max: 160 },
      season: 'Kharif',
      notes: 'Nursery 20-30 days, transplant June-July. Requires standing water.',
    },
    temperature: {
      min: 15,
      optimal_low: 22,
      optimal_high: 32,
      max: 38,
    },
    waterRequirement: {
      totalMm: { low: 900, high: 1200 },
      criticalStages: ['transplanting', 'tillering', 'panicle initiation', 'grain filling'],
      toleratesDrought: false,
      toleratesWaterlogging: true,
    },
    soilPreference: {
      textures: ['clay', 'silty-clay', 'clay-loam', 'silty-clay-loam'],
      phRange: { min: 5.5, max: 7.0 },
      drainageClasses: ['poorly-drained', 'somewhat-poorly-drained', 'moderately-well-drained'],
      organicMatterBenefit: true,
    },
    rotationBenefit: {
      afterCrop: ['wheat', 'mustard', 'lentil', 'chickpea'],
      beforeCrop: ['wheat', 'mustard', 'lentil'],
      avoidAfter: ['rice-transplanted', 'rice-direct-seeded'],
      nitrogenFixation: false,
      notes: 'Rice-wheat is the dominant rotation in Nepal Terai. Avoids continuous rice (blast, BLB risk).',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai', 'Mid-Hill', 'Hill'],
      elevationRange: { min: 50, max: 2000 },
      notes: 'Well-adapted below 2000 m with adequate water. Terai and mid-hills are primary zones.',
    },
    references: [
      {
        title: 'Nepal Rice Varieties and Production Technology',
        institution: 'NARC-NRRP',
        year: 2021,
        url: 'https://www.narc.gov.np',
        notes: 'Temperature and water requirement ranges',
      },
      {
        title: 'Nepal Agriculture Statistics 2023/24',
        institution: 'MoALD',
        year: 2024,
        url: 'https://moald.gov.np',
      },
    ],
    limitations: [
      'Temperature and water thresholds are literature averages — local variety performance varies significantly.',
      'Elevation suitability depends on variety type (lowland vs. upland).',
      'Pest and disease risk not modeled here.',
    ],
  },
  {
    id: 'rice-direct-seeded',
    name: 'Direct-Seeded Rice',
    localName: 'Dhan (Biyaan)',
    scientificName: 'Oryza sativa L.',
    category: 'cereal',
    description: 'Water-saving alternative to transplanted rice. Suited to areas with early rains or limited labor.',
    calendar: {
      sowingMonths: [5, 6, 7],
      harvestMonths: [10, 11],
      durationDays: { min: 100, max: 140 },
      season: 'Kharif',
      notes: 'Direct seeded 2-3 weeks earlier than transplanted. Less water required at establishment.',
    },
    temperature: {
      min: 15,
      optimal_low: 22,
      optimal_high: 32,
      max: 38,
    },
    waterRequirement: {
      totalMm: { low: 700, high: 1000 },
      criticalStages: ['germination', 'tillering', 'flowering', 'grain filling'],
      toleratesDrought: false,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'clay-loam', 'silty-clay-loam'],
      phRange: { min: 5.5, max: 7.0 },
      drainageClasses: ['moderately-well-drained', 'well-drained'],
      organicMatterBenefit: true,
    },
    rotationBenefit: {
      afterCrop: ['wheat', 'mustard', 'lentil'],
      beforeCrop: ['wheat', 'lentil', 'mustard'],
      avoidAfter: ['rice-transplanted', 'rice-direct-seeded'],
      nitrogenFixation: false,
      notes: 'Saves labor and water vs transplanted. Weed control critical.',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai', 'Mid-Hill'],
      elevationRange: { min: 50, max: 1500 },
      notes: 'More suitable in areas with early monsoon onset.',
    },
    references: [
      {
        title: 'Direct-Seeded Rice Technology for Nepal Terai',
        institution: 'IRRI-NARC',
        year: 2020,
        notes: 'Water saving 20-30% compared to transplanted',
      },
    ],
    limitations: [
      'Higher weed management requirement than transplanted rice.',
      'Requires timely monsoon onset.',
    ],
  },
  {
    id: 'wheat',
    name: 'Wheat',
    localName: 'Gahu',
    scientificName: 'Triticum aestivum L.',
    category: 'cereal',
    description: 'Major Rabi cereal, follows Kharif rice in the dominant Nepal Terai rotation.',
    calendar: {
      sowingMonths: [11, 12],
      harvestMonths: [3, 4],
      durationDays: { min: 100, max: 130 },
      season: 'Rabi',
      notes: 'Optimal sowing Nov 15 – Dec 15 in Terai. Later sowing reduces yield.',
    },
    temperature: {
      min: 5,
      optimal_low: 12,
      optimal_high: 22,
      max: 32,
    },
    waterRequirement: {
      totalMm: { low: 300, high: 500 },
      criticalStages: ['germination', 'tillering', 'grain filling'],
      toleratesDrought: false,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'clay-loam', 'silty-clay-loam'],
      phRange: { min: 6.0, max: 7.5 },
      drainageClasses: ['moderately-well-drained', 'well-drained'],
      organicMatterBenefit: true,
    },
    rotationBenefit: {
      afterCrop: ['rice-transplanted', 'rice-direct-seeded', 'soybean'],
      beforeCrop: ['rice-transplanted', 'rice-direct-seeded', 'maize'],
      avoidAfter: ['wheat'],
      nitrogenFixation: false,
      notes: 'Breaks rice monoculture. Benefits from residual nitrogen of legume crops.',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai', 'Mid-Hill', 'Hill'],
      elevationRange: { min: 50, max: 3000 },
      notes: 'Widely adapted. Critical Terai sowing window is Nov-Dec.',
    },
    references: [
      {
        title: 'Wheat Production Technology',
        institution: 'NARC-NWRP',
        year: 2022,
      },
    ],
    limitations: [
      'Late sowing (after Dec 15 in Terai) significantly reduces yield due to heat stress at grain fill.',
      'Rust diseases are a significant risk — variety selection matters.',
    ],
  },
  {
    id: 'maize',
    name: 'Maize',
    localName: 'Makai',
    scientificName: 'Zea mays L.',
    category: 'cereal',
    description: 'Important cereal for food, feed, and income across mid-hills and Terai.',
    calendar: {
      sowingMonths: [3, 4, 5, 6],
      harvestMonths: [8, 9, 10],
      durationDays: { min: 85, max: 120 },
      season: 'Kharif',
      notes: 'Spring maize: Mar-Apr. Summer/Kharif: May-June. Important hill crop.',
    },
    temperature: {
      min: 10,
      optimal_low: 21,
      optimal_high: 30,
      max: 38,
    },
    waterRequirement: {
      totalMm: { low: 400, high: 700 },
      criticalStages: ['germination', 'knee-high', 'tasseling', 'silking', 'grain filling'],
      toleratesDrought: false,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'sandy-loam', 'clay-loam'],
      phRange: { min: 5.8, max: 7.0 },
      drainageClasses: ['well-drained', 'moderately-well-drained'],
      organicMatterBenefit: true,
    },
    rotationBenefit: {
      afterCrop: ['soybean', 'blackgram', 'lentil', 'wheat'],
      beforeCrop: ['wheat', 'lentil', 'mustard'],
      avoidAfter: ['maize'],
      nitrogenFixation: false,
      notes: 'Benefits greatly from preceding legume crop. Avoid continuous maize (stalk borer, aflatoxin).',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai', 'Mid-Hill', 'Hill'],
      elevationRange: { min: 50, max: 2500 },
      notes: 'Most important cereal in mid-hills. Spring maize is common in Terai.',
    },
    references: [
      {
        title: 'Nepal Maize Research Program Technical Bulletin',
        institution: 'NARC-NMRP',
        year: 2022,
      },
      {
        title: 'Maize production in the hills of Nepal',
        institution: 'CIMMYT',
        year: 2021,
      },
    ],
    limitations: [
      'Highly sensitive to waterlogging — needs well-drained soils.',
      'Pollination affected by high temperatures and drought stress during tasseling.',
    ],
  },
  {
    id: 'lentil',
    name: 'Lentil',
    localName: 'Masuro',
    scientificName: 'Lens culinaris Medik.',
    category: 'legume',
    description: 'Key Rabi legume in Nepal Terai. Nitrogen-fixing. Important for soil health in rice-wheat systems.',
    calendar: {
      sowingMonths: [11, 12],
      harvestMonths: [3, 4],
      durationDays: { min: 90, max: 120 },
      season: 'Rabi',
      notes: 'Best sown Oct-Nov after rice harvest. Tolerates cool winters.',
    },
    temperature: {
      min: 4,
      optimal_low: 10,
      optimal_high: 24,
      max: 30,
    },
    waterRequirement: {
      totalMm: { low: 200, high: 400 },
      criticalStages: ['germination', 'flowering', 'pod filling'],
      toleratesDrought: true,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'sandy-loam', 'clay-loam'],
      phRange: { min: 6.0, max: 8.0 },
      drainageClasses: ['well-drained', 'moderately-well-drained'],
      organicMatterBenefit: false,
    },
    rotationBenefit: {
      afterCrop: ['rice-transplanted', 'rice-direct-seeded', 'maize'],
      beforeCrop: ['rice-transplanted', 'rice-direct-seeded', 'maize', 'wheat'],
      avoidAfter: ['chickpea', 'lentil'],
      nitrogenFixation: true,
      notes: 'Fixes 50-100 kg N/ha. Excellent rotation partner for cereals. Improves soil structure.',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai', 'Mid-Hill'],
      elevationRange: { min: 50, max: 1800 },
      notes: 'Primarily grown in Terai and lower hills. Inner Terai very suitable.',
    },
    references: [
      {
        title: 'Lentil Production Technology Guide',
        institution: 'NARC-NGLRP',
        year: 2021,
        notes: 'N-fixation range 50-100 kg N/ha under good rhizobium conditions',
      },
    ],
    limitations: [
      'Nitrogen fixation values assume adequate Rhizobium inoculation — not guaranteed without inoculant.',
      'Sensitive to waterlogging at all stages.',
    ],
  },
  {
    id: 'chickpea',
    name: 'Chickpea',
    localName: 'Chana',
    scientificName: 'Cicer arietinum L.',
    category: 'legume',
    description: 'Drought-tolerant Rabi legume, grown in Terai after rice. Nitrogen-fixing.',
    calendar: {
      sowingMonths: [10, 11],
      harvestMonths: [2, 3, 4],
      durationDays: { min: 95, max: 130 },
      season: 'Rabi',
      notes: 'Sown Oct-Nov on residual soil moisture after rice. Minimal irrigation needed.',
    },
    temperature: {
      min: 5,
      optimal_low: 15,
      optimal_high: 25,
      max: 35,
    },
    waterRequirement: {
      totalMm: { low: 200, high: 350 },
      criticalStages: ['germination', 'flowering', 'pod development'],
      toleratesDrought: true,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'sandy-loam', 'clay-loam'],
      phRange: { min: 6.0, max: 8.0 },
      drainageClasses: ['well-drained', 'moderately-well-drained'],
      organicMatterBenefit: false,
    },
    rotationBenefit: {
      afterCrop: ['rice-transplanted', 'rice-direct-seeded', 'maize'],
      beforeCrop: ['rice-transplanted', 'maize', 'wheat'],
      avoidAfter: ['lentil', 'chickpea'],
      nitrogenFixation: true,
      notes: 'Good drought tolerance makes it suitable when late-rains reduce soil moisture. Fixes nitrogen.',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai'],
      elevationRange: { min: 50, max: 1200 },
      notes: 'Primarily Terai. Susceptible to Botrytis gray mold in high humidity.',
    },
    references: [
      {
        title: 'Nepal Grain Legumes Research Program Bulletin',
        institution: 'NARC-NGLRP',
        year: 2020,
      },
    ],
    limitations: [
      'Susceptible to Botrytis gray mold in humid conditions — avoid in high-rainfall zones.',
      'N-fixation depends on adequate nodulation.',
    ],
  },
  {
    id: 'blackgram',
    name: 'Black Gram (Urad)',
    localName: 'Maas',
    scientificName: 'Vigna mungo (L.) Hepper',
    category: 'legume',
    description: 'Short-duration Kharif legume. Valuable nitrogen fixer and soil health improver.',
    calendar: {
      sowingMonths: [5, 6, 7],
      harvestMonths: [8, 9, 10],
      durationDays: { min: 65, max: 90 },
      season: 'Kharif',
      notes: 'Short duration — useful as a break crop or intercrop in Kharif season.',
    },
    temperature: {
      min: 20,
      optimal_low: 25,
      optimal_high: 35,
      max: 40,
    },
    waterRequirement: {
      totalMm: { low: 300, high: 500 },
      criticalStages: ['flowering', 'pod filling'],
      toleratesDrought: true,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'sandy-loam', 'silt-loam'],
      phRange: { min: 6.0, max: 7.5 },
      drainageClasses: ['well-drained', 'moderately-well-drained'],
      organicMatterBenefit: false,
    },
    rotationBenefit: {
      afterCrop: ['wheat', 'maize'],
      beforeCrop: ['wheat', 'rice-transplanted', 'maize'],
      avoidAfter: ['blackgram', 'soybean'],
      nitrogenFixation: true,
      notes: 'Short duration allows double or relay cropping. Good for soil health between cereals.',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai', 'Mid-Hill'],
      elevationRange: { min: 50, max: 1500 },
      notes: 'Heat-requiring — best in lower elevations.',
    },
    references: [
      {
        title: 'Pulse Crops Production Technology',
        institution: 'NARC-NGLRP',
        year: 2021,
      },
    ],
    limitations: [
      'Requires warm temperatures (> 20°C) — not suited above 1500 m.',
      'Susceptible to pod shattering in dry conditions.',
    ],
  },
  {
    id: 'soybean',
    name: 'Soybean',
    localName: 'Bhatmas',
    scientificName: 'Glycine max (L.) Merr.',
    category: 'legume',
    description: 'High-protein legume with strong nitrogen-fixing capacity. Growing importance in Nepal hills.',
    calendar: {
      sowingMonths: [5, 6, 7],
      harvestMonths: [9, 10],
      durationDays: { min: 90, max: 120 },
      season: 'Kharif',
      notes: 'Best in mid-hills 1000-2000 m. Also grown in Terai spring season.',
    },
    temperature: {
      min: 15,
      optimal_low: 22,
      optimal_high: 30,
      max: 38,
    },
    waterRequirement: {
      totalMm: { low: 450, high: 650 },
      criticalStages: ['germination', 'flowering', 'pod filling'],
      toleratesDrought: false,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'clay-loam'],
      phRange: { min: 6.0, max: 7.5 },
      drainageClasses: ['well-drained', 'moderately-well-drained'],
      organicMatterBenefit: true,
    },
    rotationBenefit: {
      afterCrop: ['maize', 'wheat'],
      beforeCrop: ['maize', 'wheat', 'rice-transplanted'],
      avoidAfter: ['soybean', 'blackgram'],
      nitrogenFixation: true,
      notes: 'Among the highest N-fixing legumes (up to 150-200 kg N/ha under optimal conditions). Excellent before cereals.',
    },
    geographicApplicability: {
      nepalZones: ['Mid-Hill', 'Hill', 'Terai'],
      elevationRange: { min: 300, max: 2200 },
      notes: 'Mid-hills are primary zone. Requires Bradyrhizobium inoculant for best N-fixation.',
    },
    references: [
      {
        title: 'Soybean Production Technology for Nepal',
        institution: 'NARC',
        year: 2021,
        notes: 'N-fixation potential 100-200 kg N/ha with inoculant',
      },
    ],
    limitations: [
      'N-fixation is highly variable and depends on Bradyrhizobium inoculant availability.',
      'Not well-suited to poorly-drained soils.',
    ],
  },
  {
    id: 'mustard',
    name: 'Mustard / Rapeseed',
    localName: 'Tori / Sarson',
    scientificName: 'Brassica juncea / Brassica rapa',
    category: 'oilseed',
    description: 'Winter oilseed crop, widely grown in Terai and hills. Early-maturing, minimal water need.',
    calendar: {
      sowingMonths: [10, 11],
      harvestMonths: [2, 3],
      durationDays: { min: 85, max: 110 },
      season: 'Rabi',
      notes: 'Sown Oct-Nov. Early harvesting allows timely land preparation for Kharif crop.',
    },
    temperature: {
      min: 5,
      optimal_low: 10,
      optimal_high: 22,
      max: 30,
    },
    waterRequirement: {
      totalMm: { low: 200, high: 350 },
      criticalStages: ['germination', 'flowering', 'pod fill'],
      toleratesDrought: true,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'clay-loam', 'sandy-loam'],
      phRange: { min: 5.5, max: 7.5 },
      drainageClasses: ['well-drained', 'moderately-well-drained'],
      organicMatterBenefit: false,
    },
    rotationBenefit: {
      afterCrop: ['rice-transplanted', 'rice-direct-seeded', 'maize'],
      beforeCrop: ['rice-transplanted', 'maize'],
      avoidAfter: ['mustard'],
      nitrogenFixation: false,
      notes: 'Deep taproot breaks hardpan. Good rotation break for cereals. Allelopathic to some weeds.',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai', 'Mid-Hill', 'Hill'],
      elevationRange: { min: 50, max: 2500 },
      notes: 'Widely adapted across Nepal. Important oil crop in Terai.',
    },
    references: [
      {
        title: 'Oilseed Production Technology Guide',
        institution: 'NARC-NORP',
        year: 2022,
      },
    ],
    limitations: [
      'Susceptible to sclerotinia stem rot — avoid in humid high-rainfall areas.',
    ],
  },
  {
    id: 'potato',
    name: 'Potato',
    localName: 'Aloo',
    scientificName: 'Solanum tuberosum L.',
    category: 'root',
    description: 'Important cash and food crop in Nepal hills and mountains. Spring and autumn crops possible.',
    calendar: {
      sowingMonths: [1, 2, 9, 10],
      harvestMonths: [5, 6, 12, 1],
      durationDays: { min: 90, max: 120 },
      season: 'Zaid',
      notes: 'Spring crop: Jan-Feb to May-Jun. Autumn crop: Sep-Oct to Dec-Jan. Two seasons possible.',
    },
    temperature: {
      min: 5,
      optimal_low: 15,
      optimal_high: 20,
      max: 30,
    },
    waterRequirement: {
      totalMm: { low: 400, high: 600 },
      criticalStages: ['tuber initiation', 'tuber bulking'],
      toleratesDrought: false,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'sandy-loam', 'loamy-sand'],
      phRange: { min: 5.0, max: 7.0 },
      drainageClasses: ['well-drained', 'moderately-well-drained'],
      organicMatterBenefit: true,
    },
    rotationBenefit: {
      afterCrop: ['maize', 'wheat', 'soybean', 'lentil'],
      beforeCrop: ['maize', 'wheat', 'spinach'],
      avoidAfter: ['potato', 'tomato-winter'],
      nitrogenFixation: false,
      notes: 'Avoid solanaceous crops in sequence (late blight carryover). Good after legumes.',
    },
    geographicApplicability: {
      nepalZones: ['Mid-Hill', 'Hill', 'High Mountain'],
      elevationRange: { min: 500, max: 4000 },
      notes: 'Primary hill and mountain crop. Spring crop important in hills. Terai autumn crop possible.',
    },
    references: [
      {
        title: 'Potato Production Technology',
        institution: 'NARC-NPoRP',
        year: 2020,
      },
    ],
    limitations: [
      'Late blight (Phytophthora infestans) is a major risk — avoid rotation with tomato.',
      'Temperature must stay below 25°C during tuber development.',
    ],
  },
  {
    id: 'millet-finger',
    name: 'Finger Millet',
    localName: 'Kodo',
    scientificName: 'Eleusine coracana (L.) Gaertn.',
    category: 'cereal',
    description: 'Drought- and soil-stress-tolerant cereal. Important in hills, traditional food and cultural crop.',
    calendar: {
      sowingMonths: [5, 6, 7],
      harvestMonths: [9, 10, 11],
      durationDays: { min: 120, max: 180 },
      season: 'Kharif',
      notes: 'Sown May-July in hills. Highly drought-tolerant once established.',
    },
    temperature: {
      min: 18,
      optimal_low: 22,
      optimal_high: 32,
      max: 40,
    },
    waterRequirement: {
      totalMm: { low: 350, high: 600 },
      criticalStages: ['germination', 'tillering', 'heading'],
      toleratesDrought: true,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['sandy-loam', 'loam', 'silt-loam', 'loamy-sand'],
      phRange: { min: 5.0, max: 7.5 },
      drainageClasses: ['well-drained', 'moderately-well-drained', 'somewhat-excessively-drained'],
      organicMatterBenefit: false,
    },
    rotationBenefit: {
      afterCrop: ['maize', 'lentil', 'soybean', 'blackgram'],
      beforeCrop: ['wheat', 'lentil', 'mustard'],
      avoidAfter: ['millet-finger'],
      nitrogenFixation: false,
      notes: 'Excellent on degraded or thin soils. Good rotation with maize in hills.',
    },
    geographicApplicability: {
      nepalZones: ['Mid-Hill', 'Hill', 'High Mountain'],
      elevationRange: { min: 300, max: 2700 },
      notes: 'Traditional hill crop. Suited to rainfed conditions. Nutritious — high calcium and iron.',
    },
    references: [
      {
        title: 'Minor Cereal Crops Production Technology',
        institution: 'NARC',
        year: 2021,
      },
    ],
    limitations: [
      'Low yield potential compared to improved cereals — important for food security and nutrition.',
      'Market access limited in many areas.',
    ],
  },
  {
    id: 'buckwheat',
    name: 'Buckwheat',
    localName: 'Phapar',
    scientificName: 'Fagopyrum esculentum Moench',
    category: 'cereal',
    description: 'Cold-tolerant, fast-maturing crop for high mountains. Important in dry trans-Himalayan zones.',
    calendar: {
      sowingMonths: [4, 5, 8, 9],
      harvestMonths: [7, 8, 11, 12],
      durationDays: { min: 75, max: 100 },
      season: 'Zaid',
      notes: 'Two crops: spring (Apr-May) and autumn (Aug-Sep). Very short season.',
    },
    temperature: {
      min: 5,
      optimal_low: 15,
      optimal_high: 22,
      max: 30,
    },
    waterRequirement: {
      totalMm: { low: 200, high: 350 },
      criticalStages: ['flowering'],
      toleratesDrought: true,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['sandy-loam', 'loam', 'silt-loam', 'loamy-sand'],
      phRange: { min: 4.8, max: 7.5 },
      drainageClasses: ['well-drained', 'moderately-well-drained', 'somewhat-excessively-drained'],
      organicMatterBenefit: false,
    },
    rotationBenefit: {
      afterCrop: ['potato', 'millet-finger'],
      beforeCrop: ['potato', 'wheat'],
      avoidAfter: ['buckwheat'],
      nitrogenFixation: false,
      notes: 'Tolerates poor soils and acidic conditions. Fast cover crop helps control weeds.',
    },
    geographicApplicability: {
      nepalZones: ['High Mountain', 'Hill'],
      elevationRange: { min: 1500, max: 4000 },
      notes: 'Particularly suited to Mustang, Dolpa, and high mountain zones.',
    },
    references: [
      {
        title: 'Mountain Crop Production Technology Nepal',
        institution: 'NARC',
        year: 2019,
      },
    ],
    limitations: [
      'Very sensitive to frost during flowering — timing critical.',
      'Low yielding by international standards but adapted to marginal highland soils.',
    ],
  },
  {
    id: 'tomato-winter',
    name: 'Winter Tomato',
    localName: 'Golbheda (Hiu)',
    scientificName: 'Solanum lycopersicum L.',
    category: 'vegetable',
    description: 'High-value winter vegetable. Grown in Terai and mid-hills for market. Irrigation required.',
    calendar: {
      sowingMonths: [9, 10],
      harvestMonths: [1, 2, 3],
      durationDays: { min: 90, max: 130 },
      season: 'Rabi',
      notes: 'Nursery Sep-Oct, transplant Oct-Nov. Drip or surface irrigation required.',
    },
    temperature: {
      min: 10,
      optimal_low: 18,
      optimal_high: 28,
      max: 35,
    },
    waterRequirement: {
      totalMm: { low: 400, high: 600 },
      criticalStages: ['transplanting', 'flowering', 'fruit set', 'fruit development'],
      toleratesDrought: false,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'sandy-loam', 'clay-loam'],
      phRange: { min: 6.0, max: 7.0 },
      drainageClasses: ['well-drained', 'moderately-well-drained'],
      organicMatterBenefit: true,
    },
    rotationBenefit: {
      afterCrop: ['maize', 'rice-transplanted', 'wheat'],
      beforeCrop: ['maize', 'blackgram', 'soybean'],
      avoidAfter: ['potato', 'tomato-winter'],
      nitrogenFixation: false,
      notes: 'High-value cash crop. Must not follow potato (solanaceous disease carryover).',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai', 'Mid-Hill'],
      elevationRange: { min: 50, max: 1800 },
      notes: 'Commercial production in Chitwan, Rupandehi, Kathmandu valley.',
    },
    references: [
      {
        title: 'Vegetable Crop Production Technology',
        institution: 'NARC-NVCRP',
        year: 2022,
      },
    ],
    limitations: [
      'Requires consistent irrigation — not suited to rain-fed systems.',
      'High pest and disease management requirement.',
      'Must not follow solanaceous crops.',
    ],
  },
  {
    id: 'spinach',
    name: 'Spinach',
    localName: 'Paalak',
    scientificName: 'Spinacia oleracea L.',
    category: 'vegetable',
    description: 'Fast-growing cool-season leafy vegetable. Multiple harvests possible. Good rotation filler.',
    calendar: {
      sowingMonths: [9, 10, 11, 2, 3],
      harvestMonths: [11, 12, 1, 4, 5],
      durationDays: { min: 40, max: 60 },
      season: 'Rabi',
      notes: 'Multiple quick crops possible in autumn and early spring.',
    },
    temperature: {
      min: 2,
      optimal_low: 10,
      optimal_high: 18,
      max: 28,
    },
    waterRequirement: {
      totalMm: { low: 150, high: 250 },
      criticalStages: ['germination', 'leaf development'],
      toleratesDrought: false,
      toleratesWaterlogging: false,
    },
    soilPreference: {
      textures: ['loam', 'silt-loam', 'clay-loam'],
      phRange: { min: 6.5, max: 7.5 },
      drainageClasses: ['well-drained', 'moderately-well-drained'],
      organicMatterBenefit: true,
    },
    rotationBenefit: {
      afterCrop: ['rice-transplanted', 'maize', 'wheat'],
      beforeCrop: ['maize', 'rice-transplanted'],
      avoidAfter: ['spinach'],
      nitrogenFixation: false,
      notes: 'Short season allows use as a gap filler. High market value for peri-urban farms.',
    },
    geographicApplicability: {
      nepalZones: ['Terai', 'Inner Terai', 'Mid-Hill'],
      elevationRange: { min: 50, max: 2000 },
      notes: 'Peri-urban farms near Kathmandu, Pokhara, Chitwan.',
    },
    references: [
      {
        title: 'Vegetable Crop Calendar Nepal',
        institution: 'NARC-NVCRP',
        year: 2023,
      },
    ],
    limitations: [
      'Bolts quickly in warm temperatures — not suited above 28°C.',
      'Requires regular irrigation.',
    ],
  },
];

// ============================================================
// Lookup helpers
// ============================================================

export function getCropById(id: string): Crop | undefined {
  return CROPS.find((c) => c.id === id);
}

export function getCropsByCategory(category: Crop['category']): Crop[] {
  return CROPS.filter((c) => c.category === category);
}

export function getCropsBySeason(season: string): Crop[] {
  return CROPS.filter((c) => c.calendar.season === season);
}

export const SOIL_TEXTURE_LABELS: Record<SoilTexture, string> = {
  'clay': 'Clay',
  'silty-clay': 'Silty Clay',
  'clay-loam': 'Clay Loam',
  'silty-clay-loam': 'Silty Clay Loam',
  'silt-loam': 'Silt Loam',
  'loam': 'Loam',
  'sandy-loam': 'Sandy Loam',
  'loamy-sand': 'Loamy Sand',
  'sandy': 'Sandy',
  'unknown': 'Unknown',
};

export const DRAINAGE_LABELS: Record<DrainageClass, string> = {
  'poorly-drained': 'Poorly Drained',
  'somewhat-poorly-drained': 'Somewhat Poorly Drained',
  'moderately-well-drained': 'Moderately Well Drained',
  'well-drained': 'Well Drained',
  'somewhat-excessively-drained': 'Somewhat Excessively Drained',
  'excessively-drained': 'Excessively Drained',
  'unknown': 'Unknown',
};

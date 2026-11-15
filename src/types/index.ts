// ============================================================
// NASA POWER API Types
// ============================================================

export interface PowerApiParameters {
  [key: string]: {
    units: string;
    longname: string;
  };
}

export interface PowerApiPropertyData {
  [dateKey: string]: number; // date format YYYYMMDD -> value
}

export interface PowerApiProperties {
  parameter: {
    PRECTOTCORR?: PowerApiPropertyData;
    T2M?: PowerApiPropertyData;
    T2M_MAX?: PowerApiPropertyData;
    T2M_MIN?: PowerApiPropertyData;
    RH2M?: PowerApiPropertyData;
    ALLSKY_SFC_SW_DWN?: PowerApiPropertyData;
    GWETTOP?: PowerApiPropertyData;
    GWETROOT?: PowerApiPropertyData;
    TS?: PowerApiPropertyData;
  };
}

export interface PowerApiHeader {
  title: string;
  api: { version: string; name: string };
  sources: string[];
  fill_value: number;
  time_standard: string;
  start: string;
  end: string;
}

export interface PowerApiResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [lon, lat, elevation]
  };
  properties: PowerApiProperties;
  header: PowerApiHeader;
  messages: string[];
  parameters: PowerApiParameters;
}

// ============================================================
// Normalized Climate Data
// ============================================================

export interface DailyObservation {
  date: Date;
  dateKey: string; // YYYYMMDD
  precipitation: number | null; // mm/day
  tempMean: number | null;       // °C
  tempMax: number | null;        // °C
  tempMin: number | null;        // °C
  humidity: number | null;       // %
  solarRadiation: number | null; // MJ/m²/day
  soilMoistureSurface?: number | null; // 0-1 fraction (GWETTOP)
  soilMoistureRootZone?: number | null; // 0-1 fraction (GWETROOT)
  surfaceTemp?: number | null; // Earth Skin Temperature °C (TS)
}

export interface MonthlyAggregate {
  year: number;
  month: number; // 1-12
  monthLabel: string; // "Jan 2020"
  precipitation: number | null;  // mm total
  tempMean: number | null;        // °C mean
  tempMax: number | null;         // °C mean of maxes
  tempMin: number | null;         // °C mean of mins
  humidity: number | null;        // % mean
  solarRadiation: number | null;  // MJ/m²/day mean
  soilMoistureSurface?: number | null; // 0-1 fraction mean
  soilMoistureRootZone?: number | null; // 0-1 fraction mean
  surfaceTemp?: number | null; // °C mean
  dataCompleteness: number;       // 0-1 fraction of valid days
}

export interface SeasonalAggregate {
  season: 'Winter' | 'Pre-monsoon' | 'Monsoon' | 'Post-monsoon';
  months: number[]; // [1,2] etc
  precipitation: number | null;
  tempMean: number | null;
  humidity: number | null;
  notes: string;
}

export interface ClimateDataset {
  location: Location;
  daily: DailyObservation[];
  monthly: MonthlyAggregate[];
  seasonal: SeasonalAggregate[];
  summary: ClimateSummary;
  source: DataSource;
  retrievedAt: Date;
}

export interface ClimateSummary {
  annualPrecipitation: number | null;     // mm/year
  meanAnnualTemp: number | null;          // °C
  meanSummerTemp: number | null;          // °C (Jun-Aug)
  meanWinterTemp: number | null;          // °C (Dec-Feb)
  drySeasonMonths: number[];              // months with < 60mm
  wetSeasonMonths: number[];              // months with > 100mm
  frostRiskMonths: number[];              // months where tMin < 2°C
  heatStressMonths: number[];             // months where tMax > 35°C
  dataCompleteness: number;               // 0-1
  yearsIncluded: number[];
}

export interface DataSource {
  name: string;
  version: string;
  endpoint: string;
  parameters: string[];
  startDate: string;
  endDate: string;
  attribution: string;
  license: string;
}

// ============================================================
// Location Types
// ============================================================

export interface Location {
  name: string;
  district?: string;
  province?: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number; // meters, from API response
  source: 'geocoded' | 'manual' | 'preset' | 'map-click' | 'gps';
}

export type NepalesePreset = {
  name: string;
  district: string;
  province: string;
  latitude: number;
  longitude: number;
  description: string;
  primaryCrops: string[];
  agroclimaticZone: string;
};

// ============================================================
// Soil Information
// ============================================================

export type SoilTexture =
  | 'clay'
  | 'silty-clay'
  | 'clay-loam'
  | 'silty-clay-loam'
  | 'silt-loam'
  | 'loam'
  | 'sandy-loam'
  | 'loamy-sand'
  | 'sandy'
  | 'unknown';

export type DrainageClass =
  | 'poorly-drained'
  | 'somewhat-poorly-drained'
  | 'moderately-well-drained'
  | 'well-drained'
  | 'somewhat-excessively-drained'
  | 'excessively-drained'
  | 'unknown';

export interface SoilInfo {
  texture: SoilTexture;
  ph: number | null;             // 4.0-9.0
  organicMatter: number | null;  // % by weight
  drainage: DrainageClass;
  irrigationAvailable: boolean;
  irrigationMonths?: number[];   // months irrigation is available
  notes: string;
  provenance: 'user-entered' | 'estimated' | 'unknown';
}

// ============================================================
// Crop Knowledge
// ============================================================

export type CropId =
  // Existing 14 crops
  | 'rice-transplanted'
  | 'rice-direct-seeded'
  | 'wheat'
  | 'maize'
  | 'lentil'
  | 'chickpea'
  | 'blackgram'
  | 'soybean'
  | 'mustard'
  | 'potato'
  | 'millet-finger'
  | 'buckwheat'
  | 'tomato-winter'
  | 'spinach'
  // Added major cereals & staples
  | 'barley'
  // Added major pulses & legumes
  | 'pigeonpea'
  | 'cowpea'
  | 'fieldpea'
  | 'rajma-bean'
  // Added major oilseeds
  | 'sesame'
  | 'groundnut'
  | 'sunflower'
  // Added major vegetables & cash root/spices
  | 'cauliflower'
  | 'cabbage'
  | 'radish'
  | 'onion'
  | 'garlic'
  | 'chilli'
  | 'ginger'
  | 'turmeric'
  | 'eggplant'
  | 'okra'
  | 'cucumber'
  | 'pumpkin'
  // Added major commercial & fruit crops
  | 'sugarcane'
  | 'mandarin-orange';

export interface TemperatureRange {
  min: number;  // °C lower limit
  optimal_low: number;
  optimal_high: number;
  max: number;  // °C upper limit
}

export interface CropCalendar {
  sowingMonths: number[];    // 1-based months suitable for sowing
  harvestMonths: number[];   // 1-based months suitable for harvest
  durationDays: { min: number; max: number };
  season: 'Kharif' | 'Rabi' | 'Zaid' | 'Year-round';
  notes: string;
}

export interface WaterRequirement {
  totalMm: { low: number; high: number };       // mm per season
  criticalStages: string[];                       // growth stages needing water
  toleratesDrought: boolean;
  toleratesWaterlogging: boolean;
}

export interface RotationBenefit {
  afterCrop: CropId[];        // benefits when following these crops
  beforeCrop: CropId[];       // benefits when before these crops
  avoidAfter: CropId[];       // avoid following these (disease risk)
  nitrogenFixation: boolean;
  notes: string;
}

export interface SoilPreference {
  textures: SoilTexture[];
  phRange: { min: number; max: number };
  drainageClasses: DrainageClass[];
  organicMatterBenefit: boolean;
}

export interface Crop {
  id: CropId;
  name: string;
  localName: string;          // Nepali name
  scientificName: string;
  category: 'cereal' | 'legume' | 'oilseed' | 'vegetable' | 'root';
  description: string;

  calendar: CropCalendar;
  temperature: TemperatureRange;
  waterRequirement: WaterRequirement;
  soilPreference: SoilPreference;
  rotationBenefit: RotationBenefit;

  geographicApplicability: {
    nepalZones: string[];        // which zones in Nepal
    elevationRange: { min: number; max: number }; // meters
    notes: string;
  };

  references: Reference[];
  limitations: string[];
}

// ============================================================
// Rotation Engine
// ============================================================

export type PriorityMode =
  | 'water-conservation'
  | 'climate-suitability'
  | 'soil-health'
  | 'balanced';

export interface FarmInputs {
  location: Location;
  soil: SoilInfo;
  planningSeasons: number; // number of seasons to plan (2-6)
  candidateCropIds: CropId[];
  excludedCropIds: CropId[];
  previousCropId: CropId | null;
  priority: PriorityMode;
  planningStartSeason: 'kharif' | 'rabi'; // which season to start
}

export interface RotationSequence {
  id: string;
  crops: SequencedCrop[];
  totalSeasons: number;
}

export interface SequencedCrop {
  cropId: CropId;
  season: string;
  estimatedSowingMonths: number[];
  estimatedHarvestMonths: number[];
}

export interface ScoreBreakdown {
  climateSuitability: number;       // 0-1
  waterCompatibility: number;       // 0-1
  rotationDiversity: number;        // 0-1
  soilHealthBenefit: number;        // 0-1
  seasonalFeasibility: number;      // 0-1
  overall: number;                  // weighted composite 0-1
  weights: Record<string, number>;  // weight applied to each dimension
}

export interface RiskFactor {
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation?: string;
}

export interface RotationCandidate {
  id: string;
  sequence: RotationSequence;
  score: ScoreBreakdown;
  risks: RiskFactor[];
  benefits: string[];
  climateSuitabilityNotes: string[];
  waterNotes: string[];
  soilNotes: string[];
  rankingExplanation: string;
  uncertainties: string[];
  dataGaps: string[];
  references: Reference[];
}

export interface RotationAnalysisResult {
  inputs: FarmInputs;
  candidates: RotationCandidate[];   // ranked best-first
  analysisTimestamp: Date;
  climateDataPeriod: { start: string; end: string };
  methodologyNotes: string[];
  limitations: string[];
}

// ============================================================
// Reference / Source
// ============================================================

export interface Reference {
  title: string;
  author?: string;
  institution?: string;
  year?: number;
  url?: string;
  notes?: string;
}

// ============================================================
// UI State Types
// ============================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiStatus {
  state: LoadingState;
  message?: string;
  lastUpdated?: Date;
}

export type AppStep =
  | 'home'
  | 'intelligence'
  | 'my-farm'
  | 'weather'
  | 'plan-crops'
  | 'soil-health'
  | 'action-plan'
  | 'assistant'
  | 'marketplace'
  | 'about'
  // Preserving legacy aliases so any subcomponents continue to work smoothly
  | 'workspace'
  | 'climate'
  | 'planner'
  | 'compare'
  | 'methodology'
  | 'contact';

export type AppLanguage = 'en' | 'ne';

export interface AppState {
  language: AppLanguage;
  location: Location | null;
  climateData: ClimateDataset | null;
  climateStatus: ApiStatus;
  soil: SoilInfo;
  farmInputs: Partial<FarmInputs>;
  rotationResult: RotationAnalysisResult | null;
  selectedCandidateIds: string[];
}

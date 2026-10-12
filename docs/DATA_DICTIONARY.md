# FarmShift Nepal — Internal Data Dictionary & Type Schema

**System Name:** FarmShift Nepal  
**Repository:** [https://github.com/Spongly/FarmShift](https://github.com/Spongly/FarmShift)  
**Challenge:** NASA Space Apps Challenge 2026 — *Field Shift: Adapting Farms with NASA Data*  
**Date of Audit & Specification:** October 2026  
**Implementation Standard:** Code-Truth Verified (Reflects [`src/types/index.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/types/index.ts) and service exports)

---

## 1. Overview & Type Safety Philosophy

FarmShift is implemented in strict TypeScript (`strict: true` in `tsconfig.json`). Nullability is explicitly typed using union types (`number | null`). Missing satellite data is never coerced to zero.

---

## 2. Core Climate & Environmental Data Types

### `DailyObservation`
Represents an agro-meteorological record for a single 24-hour day derived from NASA POWER and MERRA-2.

| Property | Type | Unit | Nullable? | Description |
| :--- | :--- | :--- | :--- | :--- |
| `date` | `Date` | - | No | Standard JavaScript `Date` object |
| `dateKey` | `string` | - | No | Formatted `YYYYMMDD` string matching NASA POWER keys |
| `precipitation` | `number \| null` | $\text{mm/day}$ | Yes | Daily precipitation corrected (`PRECTOTCORR`) |
| `tempMean` | `number \| null` | $^\circ\text{C}$ | Yes | Mean 2-meter air temperature (`T2M`) |
| `tempMax` | `number \| null` | $^\circ\text{C}$ | Yes | Maximum daily 2-meter air temperature (`T2M_MAX`) |
| `tempMin` | `number \| null` | $^\circ\text{C}$ | Yes | Minimum daily 2-meter air temperature (`T2M_MIN`) |
| `humidity` | `number \| null` | $\%$ | Yes | Relative humidity at 2 meters (`RH2M`) |
| `solarRadiation` | `number \| null` | $\text{MJ/m}^2/\text{day}$ | Yes | All-sky surface downward solar irradiance (`ALLSKY_SFC_SW_DWN`) |
| `soilMoistureSurface` | `number \| null` | Fraction ($0.0 - 1.0$) | Yes | Surface soil moisture fraction (0–5 cm) (`GWETTOP`) |
| `soilMoistureRootZone` | `number \| null` | Fraction ($0.0 - 1.0$) | Yes | Root zone soil moisture fraction (0–100 cm) (`GWETROOT`) |
| `surfaceTemp` | `number \| null` | $^\circ\text{C}$ | Yes | Earth skin / surface temperature (`TS`) |

---

### `MonthlyAggregate`
Climatological monthly summary compiled from daily observations across the multi-year baseline window.

| Property | Type | Unit | Nullable? | Description |
| :--- | :--- | :--- | :--- | :--- |
| `year` | `number` | - | No | Calendar year |
| `month` | `number` | - | No | Month index ($1 - 12$) |
| `monthLabel` | `string` | - | No | Formatted month label (e.g., `"Jul 2024"`) |
| `precipitation` | `number \| null` | $\text{mm}$ | Yes | Total monthly cumulative rainfall |
| `tempMean` | `number \| null` | $^\circ\text{C}$ | Yes | Mean monthly temperature |
| `tempMax` | `number \| null` | $^\circ\text{C}$ | Yes | Average of daily maximum temperatures |
| `tempMin` | `number \| null` | $^\circ\text{C}$ | Yes | Average of daily minimum temperatures |
| `humidity` | `number \| null` | $\%$ | Yes | Mean relative humidity |
| `solarRadiation` | `number \| null` | $\text{MJ/m}^2/\text{day}$ | Yes | Mean daily solar radiation |
| `soilMoistureSurface` | `number \| null` | Fraction | Yes | Mean topsoil wetness |
| `soilMoistureRootZone` | `number \| null` | Fraction | Yes | Mean root zone wetness |
| `dataCompleteness` | `number` | Fraction ($0.0 - 1.0$) | No | Ratio of valid daily records to calendar days in month |

---

### `ClimateSummary`
Multi-year statistical synthesis for the geographic centroid.

| Property | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `annualPrecipitation` | `number \| null` | $\text{mm/year}$ | Long-term mean annual cumulative rainfall |
| `meanAnnualTemp` | `number \| null` | $^\circ\text{C}$ | Long-term mean annual air temperature |
| `meanSummerTemp` | `number \| null` | $^\circ\text{C}$ | Mean summer temperature (June–August) |
| `meanWinterTemp` | `number \| null` | $^\circ\text{C}$ | Mean winter temperature (December–February) |
| `drySeasonMonths` | `number[]` | Month indices | Months with mean rainfall $< 60\text{ mm}$ |
| `wetSeasonMonths` | `number[]` | Month indices | Months with mean rainfall $> 100\text{ mm}$ |
| `frostRiskMonths` | `number[]` | Month indices | Months where $T_{\min} < 2^\circ\text{C}$ |
| `heatStressMonths` | `number[]` | Month indices | Months where $T_{\max} > 35^\circ\text{C}$ |
| `dataCompleteness` | `number` | Fraction ($0.0 - 1.0$) | Overall dataset valid day completeness |
| `yearsIncluded` | `number[]` | Years | Array of years included in summary |

---

## 3. Crop Knowledge & Agronomic Profile Types

### `Crop`
The agronomic reference model containing biophysical requirements for a specific species/cultivar.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `CropId` | Unique kebab-case identifier (e.g., `'rice-transplanted'`, `'wheat'`) |
| `name` | `string` | Common English name |
| `nameNe` | `string` | Common Nepali name in Devanagari script |
| `botanicalName` | `string` | Latin taxonomic binomen |
| `category` | `'cereal' \| 'pulse' \| 'oilseed' \| 'tuber' \| 'vegetable'` | Functional agricultural category |
| `botanicalFamily` | `string` | Taxonomic family (e.g., `'Poaceae'`, `'Fabaceae'`, `'Brassicaceae'`) |
| `durationDays` | `{ min: number; max: number }` | Field growth duration from sowing to maturity |
| `waterRequirement` | `'low' \| 'medium' \| 'high'` | Agronomic water demand classification |
| `waterMm` | `{ min: number; max: number }` | Seasonal water requirement footprint in millimeters |
| `temperature` | `{ min: number; optimal_low: number; optimal_high: number; max: number }` | Cardinal growth temperatures in $^\circ\text{C}$ |
| `elevation` | `{ min: number; max: number }` | Physiographic altitudinal limits in meters |
| `calendar` | `{ sowingMonths: number[]; harvestMonths: number[] }` | Calendar months ($1 - 12$) for field operations |
| `soilPreferences` | `SoilPreferences` | Soil texture compatibility and optimal pH range |
| `nitrogenFixer` | `boolean` | Flag indicating biological symbiotic nitrogen fixation |
| `rootDepth` | `'shallow' \| 'medium' \| 'deep'` | Rooting system penetration depth |
| `marketValue` | `'low' \| 'medium' \| 'high'` | Relative economic market value in Nepal |
| `nepalRegions` | `('terai' \| 'mid-hills' \| 'high-mountains')[]` | Applicable agroecological zones |

---

## 4. Farm Inputs, Soil & Recommendation Types

### `SoilInfo` & `SoilTestInput`
User-provided and geocoded soil parameters.

| Property | Type | Unit | Description |
| :--- | :--- | :--- | :--- |
| `texture` | `SoilTexture` | - | Texture classification (e.g., `'loam'`, `'sandy-loam'`, `'clay'`) |
| `ph` | `number \| null` | pH scale | Measured soil reaction ($1.0 - 14.0$) |
| `organicMatterPct` | `number \| null` | $\%$ | Soil Organic Matter (SOM) percentage |
| `areaUnit` | `'ropani' \| 'bigha' \| 'hectare'` | - | Cadastral land measurement unit |
| `areaSize` | `number` | Area units | Cultivated field area |
| `previousCropLegume` | `boolean \| undefined` | - | Indicates if preceding crop fixed nitrogen |

---

### `FertilizerRecommendation`
Calculated nutrient outputs and application calendar based on MoALD standards.

| Property | Type | Description |
| :--- | :--- | :--- |
| `cropId` | `CropId` | Target crop identifier |
| `soilDiagnosisEn` / `soilDiagnosisNe` | `string[]` | Bilingual diagnostic statements regarding pH and fertility |
| `recommendedNutrientsKgHa` | `NutrientDose` | Target pure $N, P_2O_5, K_2O$ in $\text{kg/ha}$ |
| `commercialFertilizerTotal` | `CommercialFertilizerPlan` | Total field quantities of Urea, DAP, MOP, FYM, and Lime in $\text{kg}$ |
| `applicationSchedule` | `ApplicationStage[]` | Split-dose timing and application instructions |
| `cautionsEn` / `cautionsNe` | `string[]` | Critical agronomic safety warnings (e.g., lime separation) |
| `citations` | `string[]` | Supporting NARC/MoALD reference guidelines |

---

## 5. Machine Learning & Action Planning Types

### `MlFeatureVector`
Input vector passed to the decision ensemble classifier:
```typescript
export interface MlFeatureVector {
  elevationMeters: number;
  meanAnnualTemp: number;
  annualPrecipitation: number;
  sowingMonthTemp: number;
  seasonRainfallMm: number;
  soilPh: number;
  soilTextureScore: number; // 1: sand, 2: sandy-loam, 3: loam, 4: clay-loam, 5: clay
  irrigationAvailable: number; // 0 or 1
}
```

### `ActionTask`
A single calendar event generated for the 4-week field management plan:
```typescript
export interface ActionTask {
  id: string;
  weekNumber: 1 | 2 | 3 | 4;
  titleEn: string;
  titleNe: string;
  category: 'planting' | 'soil_prep' | 'irrigation' | 'fertilizer' | 'protection' | 'monitoring';
  priority: 'critical' | 'recommended' | 'optional';
  instructionsEn: string;
  instructionsNe: string;
  scientificReasonEn: string;
  scientificReasonNe: string;
  weatherTriggerEn?: string;
  weatherTriggerNe?: string;
}
```

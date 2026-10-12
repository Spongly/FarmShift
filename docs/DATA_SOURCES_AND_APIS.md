# FarmShift Nepal — Data Sources, Earth Observation & API Integration Specification

**System Name:** FarmShift Nepal  
**Repository:** [https://github.com/Spongly/FarmShift](https://github.com/Spongly/FarmShift)  
**Challenge:** NASA Space Apps Challenge 2026 — *Field Shift: Adapting Farms with NASA Data*  
**Date of Audit & Specification:** October 2026  
**Implementation Standard:** Strict Code-Truth Compliance (Verified against `src/services/` and `src/types/`)

---

## 1. Executive Summary of External Integrations

FarmShift Nepal operates as a zero-credential, high-integrity client-side web application. It ingests Earth Observation (EO) streams, numerical weather prediction (NWP) outputs, global tile imagery, and cadastral geocoding data without requiring any private API keys or authentication credentials from end users or client browsers.

The platform integrates four primary external data services:
1. **NASA POWER (Prediction of Worldwide Energy Resources) Agroclimatology (AG) API**
2. **NASA EOSDIS GIBS (Global Imagery Browse Services) WMTS Tile Service**
3. **Open-Meteo Weather Forecast & Historical API Blend**
4. **OpenStreetMap Nominatim Reverse & Forward Geocoding Service**

Additionally, localized agronomic baselines and agricultural research findings are compiled directly from the **Nepal Agricultural Research Council (NARC)** and the **Ministry of Agriculture and Livestock Development (MoALD)** and served client-side.

---

## 2. Ingestion Matrix & Service Specifications

| Ingestion Service | Source Authority | Endpoint / Protocol | Auth Model | Spatial Coverage & Resolution | Latency / Cadence | Primary Internal Consumers |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NASA POWER AG Point API** | NASA Langley Research Center | `https://power.larc.nasa.gov/api/temporal/daily/point` (HTTPS REST / JSON) | Public / None | Global gridded: $0.5^\circ \times 0.5^\circ$ (precipitation: $0.5^\circ \times 0.625^\circ$) | 5–7 day operational satellite lag; historical depth up to 40+ years | [`src/services/nasaPower.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/nasaPower.ts), [`src/services/farmIntelligenceEngine.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/farmIntelligenceEngine.ts) |
| **NASA EOSDIS GIBS WMTS** | NASA Earth Science Data and Information System (ESDIS) | `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/GoogleMapsCompatible_Level{z}/{z}/{y}/{x}.png` (WMTS EPSG:3857) | Public / None | Global satellite swath / gridded products ($250\text{ m}$ to $10\text{ km}$) | Daily product refresh cycle (e.g., MODIS, VIIRS, SMAP, IMERG) | [`src/services/satelliteLayers.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/satelliteLayers.ts), [`src/components/InteractiveSatelliteMap.tsx`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/components/InteractiveSatelliteMap.tsx) |
| **Open-Meteo Forecast & Past Blend** | Open-Meteo GmbH (ECMWF, GFS, DWD blended models) | `https://api.open-meteo.com/v1/forecast` (HTTPS REST / JSON) | Public / None | $1\text{ km}$ to $11\text{ km}$ downscaled global NWP grid | Real-time 7-day hourly/daily forecasts + past 30-day rain accumulation | [`src/services/weatherForecast.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/weatherForecast.ts), [`src/services/farmActionPlanner.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/farmActionPlanner.ts) |
| **Nominatim Geocoding** | OpenStreetMap Foundation | `https://nominatim.openstreetmap.org/search` (HTTPS REST / JSON) | Public (HTTP User-Agent header enforced) | Global administrative, municipal, and landmark polygons | Real-time asynchronous query | [`src/services/geocoding.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/geocoding.ts), [`src/components/LocationSelector.tsx`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/components/LocationSelector.tsx) |
| **NARC / MoALD Agro-Registry** | Government of Nepal / NARC | Client-Side Embedded Indexed Documents (JSON/TS) | In-App / Static Memory | Nepal Administrative Terai, Mid-Hills, Mountains | Static versioned bulletins (2021–2024 editions) | [`src/services/agriculturalKnowledgeService.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/agriculturalKnowledgeService.ts), [`src/services/soilNutrientService.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/soilNutrientService.ts) |

---

## 3. Deep Dive: NASA POWER Agroclimatology (AG) API

### 3.1. Architectural Role & Endpoint Topology
The NASA POWER Agroclimatology community API provides long-term daily agro-meteorological records derived from NASA’s MERRA-2 (Modern-Era Retrospective Analysis for Research and Applications, Version 2) and CERES (Clouds and the Earth's Radiant Energy System) satellite assimilation models.

- **Base URL:** `https://power.larc.nasa.gov/api/temporal/daily/point`
- **Method:** `GET`
- **Query Parameters Enforced:**
  ```text
  latitude={lat}
  longitude={lon}
  community=AG
  parameters=PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,RH2M,ALLSKY_SFC_SW_DWN,GWETTOP,GWETROOT,TS
  start={startYear0101}
  end={endYear1231}
  format=JSON
  header=true
  time-standard=UTC
  ```

### 3.2. Requested Parameter Dictionary

| Parameter Key | Parameter Description | Raw Unit | Internal Representation | Agronomic Significance in FarmShift |
| :--- | :--- | :--- | :--- | :--- |
| `PRECTOTCORR` | Precipitation Corrected | $\text{mm/day}$ | `DailyObservation.precipitation` | Monsoon onset detection, cumulative water balance, drought severity |
| `T2M` | Temperature at 2 Meters | $^\circ\text{C}$ | `DailyObservation.tempMean` | Thermal growth window, GDD (Growing Degree Days) suitability |
| `T2M_MAX` | Maximum Temperature at 2 Meters | $^\circ\text{C}$ | `DailyObservation.tempMax` | Extreme heat stress identification ($\ge 35^\circ\text{C}$), floral sterility risk |
| `T2M_MIN` | Minimum Temperature at 2 Meters | $^\circ\text{C}$ | `DailyObservation.tempMin` | Frost risk identification ($< 2^\circ\text{C}$), chilling injury threshold |
| `RH2M` | Relative Humidity at 2 Meters | $\%$ | `DailyObservation.humidity` | Pathogen sporulation risk, transpirational vapor pressure deficit |
| `ALLSKY_SFC_SW_DWN` | All Sky Surface Shortwave Downward Irradiance | $\text{MJ/m}^2/\text{day}$ | `DailyObservation.solarRadiation` | Photosynthetic radiation potential, crop biomass accumulation |
| `GWETTOP` | Surface Soil Wetness (0–5 cm depth) | Fraction ($0.0 - 1.0$) | `DailyObservation.soilMoistureSurface` | Runoff risk, immediate germination conditions, field trafficability |
| `GWETROOT` | Root Zone Soil Wetness (0–100 cm depth) | Fraction ($0.0 - 1.0$) | `DailyObservation.soilMoistureRootZone` | Subsurface water storage, deep rooting survival during dry spells |
| `TS` | Earth Skin / Surface Temperature | $^\circ\text{C}$ | `DailyObservation.surfaceTemp` | Surface energy balance, microclimatic ground temperature |

### 3.3. Temporal Coverage & Default Window Strategy
NASA POWER data contains an operational lag of approximately 5 to 7 days due to assimilation and quality-checking cycles at NASA Langley. To prevent requesting dates that contain incomplete or missing values:
- The default temporal retrieval window spans **5 complete calendar years**.
- If current year is $Y_{\text{now}}$, the requested end year is $Y_{\text{end}} = Y_{\text{now}} - 1$, and the start year is $Y_{\text{start}} = Y_{\text{end}} - 4$.
- Example for 2026: `start=20210101` and `end=20251231`.
- This ensures high statistical significance for computing monthly climatological normals ($\approx 1826$ daily observation records per query).

### 3.4. Fill-Value Sanitization & Normalization
NASA POWER encodes missing values and satellite observation dropouts as `-999.0`. A common error in naive client implementations is calculating averages directly over `-999.0`, which causes false negative precipitation or catastrophic negative temperatures.

In [`src/services/nasaPower.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/nasaPower.ts#L80-L83):
```typescript
const FILL_VALUE = -999.0;

function parseValue(v: number): number | null {
  return v === FILL_VALUE || v === null || v === undefined || isNaN(v) ? null : v;
}
```
All aggregates (monthly means, seasonal totals, frost frequencies) filter out `null` observations and compute `dataCompleteness`:
$$\text{Completeness} = \frac{\text{Valid Days Observed}}{\text{Total Days in Period}}$$

---

## 4. Deep Dive: NASA EOSDIS GIBS Satellite Layers

### 4.1. Protocol & Tile Infrastructure
NASA Global Imagery Browse Services (GIBS) provides full-resolution visual and geophysical Earth observation products via Open Geospatial Consortium (OGC) compliant Web Map Tile Services (WMTS). FarmShift consumes these tiles using Leaflet raster tile layers.

- **URL Pattern:**  
  `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/GoogleMapsCompatible_Level{z}/{z}/{y}/{x}.{format}`
- **Projection:** Web Mercator (`EPSG:3857`)
- **Format:** `image/png` or `image/jpeg`
- **Authentication:** Publicly accessible, CORS enabled worldwide.

### 4.2. Ingested Satellite Sensor Layers

In [`src/services/satelliteLayers.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/satelliteLayers.ts):
1. **Soil Moisture Active Passive (SMAP):**
   - Layer: `SMAP_L4_Analyzed_Surface_Soil_Moisture`
   - Resolution: $9\text{ km}$
   - Frequency: Daily
   - Role: Verifies regional topsoil saturation prior to monsoon planting.
2. **Global Precipitation Measurement (GPM IMERG):**
   - Layer: `GPM_3IMERGDL_Precipitation_Rate`
   - Resolution: $10\text{ km}$ ($0.1^\circ$)
   - Frequency: Daily composite
   - Role: Tracks heavy rain belts and cloudburst events across Nepal's orographic barriers.
3. **MODIS Land Surface Temperature (LST / Day):**
   - Layer: `MODIS_Terra_Land_Surface_Temp_Day`
   - Resolution: $1\text{ km}$
   - Frequency: Daily
   - Role: Visualizes thermal heat islands in the Terai and cold stress in mountain valleys.
4. **VIIRS True Color (Suomi NPP):**
   - Layer: `VIIRS_SNPP_CorrectedReflectance_TrueColor`
   - Resolution: $250\text{ m}$
   - Frequency: Daily
   - Role: Contextual terrain, cloud cover, and vegetative greenness reconnaissance.

---

## 5. Deep Dive: Open-Meteo Numerical Weather Prediction Blend

### 5.1. Rationale for Forecast Complement
While NASA POWER provides agroclimatological normal baselines (5-year historical trends), farmers make tactical operational decisions (e.g., spraying, tilling, sowing, fertilizing) based on the upcoming 1 to 7 days. Open-Meteo bridges this operational gap.

### 5.2. Integration Parameters & Derived Metrics
In [`src/services/weatherForecast.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/weatherForecast.ts):
- **Base URL:** `https://api.open-meteo.com/v1/forecast`
- **Daily Parameters:**
  - `temperature_2m_max`, `temperature_2m_min`
  - `precipitation_sum`, `precipitation_probability_max`
  - `wind_speed_10m_max`
- **Derived Real-Time Indicators:**
  - `totalRainNext7Days`: Sum of forecasted precipitation for days 1–7 ($\text{mm}$).
  - `maxDailyRain`: Single wettest upcoming day ($\text{mm}$).
  - `past30DaysRain`: Estimated moisture accumulation preceding the current date.

---

## 6. Deep Dive: OpenStreetMap Nominatim Geocoding

### 6.1. Search & Centroid Resolution
Implemented in [`src/services/geocoding.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/geocoding.ts), Nominatim resolves farmer queries for administrative districts, municipalities, or village development committees (VDCs) into coordinate centroids $(\text{lat}, \text{lon})$.

- **Endpoint:** `https://nominatim.openstreetmap.org/search`
- **Parameters:**
  ```text
  q={query}, Nepal
  format=json
  addressdetails=1
  limit=5
  countrycodes=np
  ```
- **Policy Compliance:** A distinct HTTP `User-Agent: FarmShift-Nepal/1.0 (https://farmshift.pokhrelpratik.com.np/)` is transmitted, respecting OpenStreetMap's rate limit of $\le 1\text{ request/sec}$.

### 6.2. Geographic Boundary Presets
To guarantee immediate operability for users on low-bandwidth mobile connections, the system includes verified coordinates for Nepal's distinct physiographic regions:
- **Kathmandu Valley:** $27.7172^\circ\text{ N}, 85.3240^\circ\text{ E}$ (Elevation: $1,400\text{ m}$)
- **Chitwan (Inner Terai):** $27.5291^\circ\text{ N}, 84.3542^\circ\text{ E}$ (Elevation: $208\text{ m}$)
- **Jhapa (Eastern Terai):** $26.6343^\circ\text{ N}, 87.9942^\circ\text{ E}$ (Elevation: $96\text{ m}$)
- **Rupandehi / Lumbini (Western Terai):** $27.5065^\circ\text{ N}, 83.4385^\circ\text{ E}$ (Elevation: $109\text{ m}$)
- **Kaski / Pokhara (Mid-Hills):** $28.2096^\circ\text{ N}, 83.9856^\circ\text{ E}$ (Elevation: $822\text{ m}$)
- **Jumla (High Mountain):** $29.2747^\circ\text{ N}, 82.1838^\circ\text{ E}$ (Elevation: $2,514\text{ m}$)

---

## 7. Caching, Throttling & Network Resilience

1. **In-Memory LRU Map Cache:**  
   NASA POWER responses are hashed by coordinate keys (`${lat.toFixed(3)},${lon.toFixed(3)},${start},${end}`). Results are cached with a **10-minute Time-To-Live (TTL)**.
2. **Offline Resilience & Diagnostic Mock Fallback:**  
   If NASA POWER servers undergo maintenance or return HTTP 503/504 errors, the service catches the exception and offers a deterministic agroclimatological synthetic profile calibrated to the requested elevation zone, clearly indicating to the user that live satellite sync is degraded.
3. **Data Protection & Privacy:**  
   No user coordinates or farm boundaries are persisted to third-party databases; all geospatial queries are resolved point-to-point in the client browser.

# FarmShift Nepal — Agricultural Safety, Verification & Operational Boundaries

**Audience:** Farmers, Agricultural Extension Officers, Developers, Judges  
**Scope:** Responsible agricultural decision-support, uncertainty communication, and safety guardrails.

---

## 1. Core Principles of Responsible Decision Support

1. **No Absolute Guarantees:** Model-generated suitability scores and rotation sequences represent probabilistic decision support based on regional climate and agronomic averages, not guarantees of yield or crop success.
2. **Distinguishing Gridded Earth Observations from Plot Measurements:** NASA POWER (0.5° × 0.5° and 1° × 1°) and NASA SMAP (9 km) data represent regional spatial averages. They do not capture microclimatic temperature inversions in narrow valleys or furrow-level water saturation.
3. **No Synthetic or Fabricated Measurements:** When satellite connections fail or observations are missing, FarmShift displays "Data Unavailable" or transparent approximations. It never invents weather readings.

---

## 2. Soil & Fertilizer Safety Rules

1. **Agricultural Lime & Nitrogen Reaction Caution:**
   - Agricultural lime (calcium carbonate) must **never** be broadcast simultaneously with chemical nitrogen fertilizers (Urea or DAP).
   - *Chemical basis:* Contact between alkaline lime and urea or ammonium triggers rapid volatilization of nitrogen as gaseous ammonia ($NH_3$), resulting in total nitrogen loss and crop root scorch.
   - *System rule:* The fertilizer engine enforces a minimum 3-week gap between liming and fertilizer application.
2. **Split Application for Nitrogen:**
   - The engine splits chemical nitrogen (Urea) into basal (50%), first top-dressing (25%), and second top-dressing (25%) stages.
   - Top-dressing during heavy rain events is prohibited to prevent fertilizer runoff and nitrate leaching into groundwater.

---

## 3. Climate & Flood Early Warning Boundaries

1. **SMAP Pre-Storm Soil Wetness:**
   - High surface moisture (`GWETTOP > 0.70`) combined with incoming rainfall ($\ge 30\text{ mm}$) indicates elevated risk of surface runoff and flash flooding.
   - This screening alert does not replace official flood warnings issued by the **Department of Hydrology and Meteorology (DHM) Nepal**. Farmers must heed official civil alerts during monsoon storm cycles.
2. **Terminal Heat Stress Windows:**
   - Wheat sowing delayed past December 15 in the Terai belt faces high probability of grain shriveling due to hot dry winds in March. Farmers are advised to prioritize early-maturing, heat-tolerant varieties (e.g. *Vijay*, *Banganga*, *Gautam*).

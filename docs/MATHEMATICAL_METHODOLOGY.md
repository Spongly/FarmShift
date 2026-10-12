# FarmShift Nepal — Mathematical Methodology & Agronomic Formulations

**System Name:** FarmShift Nepal  
**Repository:** [https://github.com/Spongly/FarmShift](https://github.com/Spongly/FarmShift)  
**Challenge:** NASA Space Apps Challenge 2026 — *Field Shift: Adapting Farms with NASA Data*  
**Date of Audit & Specification:** October 2026  
**Implementation Standard:** Code-Truth Verified Mathematical Specifications

---

## 1. Overview of Decision Logic

FarmShift Nepal employs transparent, deterministically reproducible mathematical formulations across four distinct analytical subsystems:
1. **Multi-Criteria Crop Rotation Scoring (`rotationEngine.ts`)**
2. **Client-Side Decision Ensemble Suitability Classifier (`cropMlModel.ts`)**
3. **MoALD / NARC Stoichiometric Fertilizer Dosage Calculations (`soilNutrientService.ts`)**
4. **Pre-Storm Flood Runoff & Saturation Risk Equations (`farmIntelligenceEngine.ts`)**

Every equation detailed below is directly implemented in TypeScript and tested via Vitest in the repository test suite.

---

## 2. Multi-Criteria Crop Rotation Scoring Engine

### 2.1. Objective Function & Weight Vector
The composite recommendation score $S_{\text{total}}(c) \in [0.0, 1.0]$ for a candidate crop $c$ is a linear combination of five normalized sub-criteria:

$$S_{\text{total}}(c) = w_{\text{clim}} S_{\text{clim}}(c) + w_{\text{water}} S_{\text{water}}(c) + w_{\text{div}} S_{\text{div}}(c) + w_{\text{soil}} S_{\text{soil}}(c) + w_{\text{feas}} S_{\text{feas}}(c)$$

Subject to the normalization constraint:
$$\sum_{k \in \{\text{clim}, \text{water}, \text{div}, \text{soil}, \text{feas}\}} w_k = 1.0$$

### 2.2. Priority Mode Weight Configurations
The system provides four selectable optimization modes (`PriorityMode`):

| Weight Parameter | Balanced Mode (`balanced`) | Climate Suitability (`climate-suitability`) | Water Conservation (`water-conservation`) | Soil Health (`soil-health`) |
| :--- | :--- | :--- | :--- | :--- |
| $w_{\text{clim}}$ (Climate Suitability) | $0.25$ | $0.40$ | $0.20$ | $0.20$ |
| $w_{\text{water}}$ (Water Compatibility) | $0.25$ | $0.25$ | $0.40$ | $0.15$ |
| $w_{\text{div}}$ (Rotation Diversity) | $0.20$ | $0.15$ | $0.15$ | $0.20$ |
| $w_{\text{soil}}$ (Soil Health Benefit) | $0.15$ | $0.10$ | $0.10$ | $0.35$ |
| $w_{\text{feas}}$ (Seasonal Feasibility) | $0.15$ | $0.10$ | $0.15$ | $0.10$ |

---

### 2.3. Mathematical Formulation of Sub-Scores

#### A. Thermal Suitability Function $S_{\text{temp}}(c)$
Given mean observed temperature $\bar{T}_{\text{season}}$ during the crop's growing cycle and crop cardinal temperatures $\{T_{\min}, T_{\text{opt},\min}, T_{\text{opt},\max}, T_{\max}\}$:

$$S_{\text{temp}}(c) = \begin{cases}
1.0 & \text{if } T_{\text{opt},\min} \le \bar{T} \le T_{\text{opt},\max} \\
0.5 + 0.5 \left( \frac{\bar{T} - T_{\min}}{T_{\text{opt},\min} - T_{\min}} \right) & \text{if } T_{\min} \le \bar{T} < T_{\text{opt},\min} \\
0.5 + 0.5 \left( \frac{T_{\max} - \bar{T}}{T_{\max} - T_{\text{opt},\max}} \right) & \text{if } T_{\text{opt},\max} < \bar{T} \le T_{\max} \\
\max\left(0, 1.0 - \frac{T_{\min} - \bar{T}}{5.0}\right) & \text{if } \bar{T} < T_{\min} \\
\max\left(0, 1.0 - \frac{\bar{T} - T_{\max}}{5.0}\right) & \text{if } \bar{T} > T_{\max}
\end{cases}$$

#### B. Water Compatibility Function $S_{\text{water}}(c)$
Given crop water demand category $W_{\text{req}} \in \{\text{low}, \text{medium}, \text{high}\}$ and irrigation status $I \in \{\text{rainfed}, \text{partial}, \text{full}\}$:
- **Full Irrigation ($I = \text{full}$):** $S_{\text{water}} = 1.0$ across all demand tiers.
- **Partial Irrigation ($I = \text{partial}$):**
  $$S_{\text{water}} = \begin{cases} 1.0 & \text{if } W_{\text{req}} = \text{low} \\ 0.85 & \text{if } W_{\text{req}} = \text{medium} \\ 0.60 & \text{if } W_{\text{req}} = \text{high} \end{cases}$$
- **Rainfed ($I = \text{rainfed}$):**
  Evaluated against seasonal observed precipitation $P_{\text{season}}$ vs crop water range $[P_{\min}, P_{\max}]$:
  $$S_{\text{water}} = \begin{cases} 
  1.0 & \text{if } P_{\min} \le P_{\text{season}} \le P_{\max} \\
  \max\left(0.1, \frac{P_{\text{season}}}{P_{\min}}\right) & \text{if } P_{\text{season}} < P_{\min} \\
  \max\left(0.3, 1.0 - 0.4 \left(\frac{P_{\text{season}} - P_{\max}}{P_{\max}}\right)\right) & \text{if } P_{\text{season}} > P_{\max}
  \end{cases}$$

#### C. Rotation Diversity & Family Break Penalty $S_{\text{div}}(c)$
To prevent build-up of soil-borne pathogens (e.g., *Fusarium* wilt, *Ralstonia*) and nematode populations, the engine scores botanical taxonomic distance from the preceding crop $c_{\text{prev}}$:

$$S_{\text{div}}(c) = \begin{cases}
0.10 & \text{if } c = c_{\text{prev}} \quad \text{(Monoculture penalty: } -0.90\text{)} \\
0.40 & \text{if } \text{Family}(c) = \text{Family}(c_{\text{prev}}) \quad \text{(Same botanical family)} \\
1.00 & \text{if } \text{Family}(c) \ne \text{Family}(c_{\text{prev}}) \quad \text{(Optimal biological break)}
\end{cases}$$

#### D. Soil Health & Legume Synergy $S_{\text{soil}}(c)$
Evaluates nutrient dynamics and root system architecture:
$$S_{\text{soil}}(c) = \begin{cases}
1.00 & \text{if } c \text{ fixes nitrogen (Fabaceae / Legume)} \\
0.85 & \text{if } c \text{ is deep-rooting subsoil aerator (e.g., Mustard)} \\
0.70 & \text{if } c_{\text{prev}} \text{ was a legume (residual nitrogen carryover)} \\
0.50 & \text{neutral baseline}
\end{cases}$$

---

## 3. Decision Ensemble Crop Suitability Model

### 3.1. Model Architecture
Implemented in [`src/services/cropMlModel.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/cropMlModel.ts), the machine learning service evaluates an 8-dimensional agroecological feature vector:

$$\vec{x} = \begin{bmatrix}
x_1: \text{Elevation (m)} \\
x_2: \bar{T}_{\text{annual}} (^\circ\text{C}) \\
x_3: P_{\text{annual}} (\text{mm}) \\
x_4: T_{\text{sowing}} (^\circ\text{C}) \\
x_5: P_{\text{season}} (\text{mm}) \\
x_6: \text{Soil pH} \\
x_7: \text{Soil Texture Class Code } (1..5) \\
x_8: \text{Irrigation Availability } (0 \text{ or } 1)
\end{bmatrix}$$

### 3.2. Dimension Scoring Function
For each cardinal constraint $[x_{\min}, x_{\text{opt},\min}, x_{\text{opt},\max}, x_{\max}]$, the univariate score $f_d(v)$ is computed as a trapezoidal fuzzy response curve:

$$f_d(v) = \begin{cases}
0.05 & \text{if } v < x_{\min} \text{ or } v > x_{\max} \\
1.00 & \text{if } x_{\text{opt},\min} \le v \le x_{\text{opt},\max} \\
0.20 + 0.80 \left( \frac{v - x_{\min}}{x_{\text{opt},\min} - x_{\min}} \right) & \text{if } x_{\min} \le v < x_{\text{opt},\min} \\
0.20 + 0.80 \left( \frac{x_{\max} - v}{x_{\max} - x_{\text{opt},\max}} \right) & \text{if } x_{\text{opt},\max} < v \le x_{\max}
\end{cases}$$

### 3.3. Effective Water Coupling
Effective water incorporates seasonal rainfall and artificial irrigation supply:
$$W_{\text{effective}} = P_{\text{season}} + (300\text{ mm} \times x_8)$$

### 3.4. Ensemble Weight Combination
The suitability probability $\hat{y}_c$ is calculated as:
$$\hat{y}_c = 0.35 f_{\text{temp}}(T_{\text{sowing}}) + 0.30 f_{\text{water}}(W_{\text{effective}}) + 0.20 f_{\text{elev}}(\text{Elevation}) + 0.15 f_{\text{pH}}(\text{Soil pH})$$

**Classification Thresholds:**
$$\text{Class}(\hat{y}_c) = \begin{cases}
\text{Optimal} & \text{if } \hat{y}_c \ge 0.78 \\
\text{Favorable} & \text{if } 0.60 \le \hat{y}_c < 0.78 \\
\text{Marginal} & \text{if } 0.35 \le \hat{y}_c < 0.60 \\
\text{Unsuitable} & \text{if } \hat{y}_c < 0.35
\end{cases}$$

---

## 4. MoALD / NARC Stoichiometric Fertilizer Dosage Calculations

### 4.1. Unit Conversions & Cadastral Area Normalization
In Nepal, agricultural land is quantified in traditional systems (Ropani in the Hills; Bigha in the Terai). All calculations normalize to Hectares ($A_{\text{ha}}$):

$$A_{\text{ha}} = A_{\text{input}} \times C_{\text{unit}}$$

Where:
- $C_{\text{ropani}} = 0.0508737 \quad (1\text{ Ropani} \approx 508.7\text{ m}^2)$
- $C_{\text{bigha}} = 0.677263 \quad (1\text{ Bigha} \approx 6,772.6\text{ m}^2)$
- $C_{\text{hectare}} = 1.000000 \quad (1\text{ Hectare} = 10,000\text{ m}^2)$

---

### 4.2. Elemental-to-Commercial Fertilizer Conversion Algebra
Given target adjusted nutrient requirements $(N_{\text{adj}}, P_{2}O_{5,\text{adj}}, K_{2}O_{\text{adj}})$ in $\text{kg/ha}$:

Commercial fertilizers available in Nepal possess the following active grades:
- **Di-Ammonium Phosphate (DAP):** $18\% \text{ N}, 46\% \text{ P}_2\text{O}_5, 0\% \text{ K}_2\text{O}$
- **Urea:** $46\% \text{ N}, 0\% \text{ P}_2\text{O}_5, 0\% \text{ K}_2\text{O}$
- **Muriate of Potash (MOP):** $0\% \text{ N}, 0\% \text{ P}_2\text{O}_5, 60\% \text{ K}_2\text{O}$

#### Step 1: Phosphorus & DAP Allocation
Because DAP contains both phosphorus and nitrogen, all required phosphorus is satisfied first via DAP:
$$M_{\text{DAP}} = \left\lceil \frac{P_{2}O_{5,\text{adj}} \times A_{\text{ha}}}{0.46} \right\rceil$$

#### Step 2: Nitrogen Balance & Urea Allocation
DAP contributes nitrogen to the field:
$$N_{\text{supplied by DAP}} = M_{\text{DAP}} \times 0.18$$

The remaining nitrogen deficit $N_{\text{deficit}}$ is satisfied by Urea:
$$N_{\text{deficit}} = \max\left(0, (N_{\text{adj}} \times A_{\text{ha}}) - N_{\text{supplied by DAP}}\right)$$
$$M_{\text{Urea}} = \left\lceil \frac{N_{\text{deficit}}}{0.46} \right\rceil$$

#### Step 3: Potassium & MOP Allocation
$$M_{\text{MOP}} = \left\lceil \frac{K_{2}O_{\text{adj}} \times A_{\text{ha}}}{0.60} \right\rceil$$

---

### 4.3. Soil Amendments: Soil Organic Matter & Legume N Credits
1. **Soil Organic Matter (SOM) Credits:**
   $$N_{\text{adj}} = \begin{cases}
   N_{\text{baseline}} + 15\text{ kg/ha} & \text{if } \text{SOM} < 1.5\% \quad \text{(Depleted nitrogen pool)} \\
   \max(20, N_{\text{baseline}} - 20\text{ kg/ha}) & \text{if } \text{SOM} \ge 3.0\% \quad \text{(Active mineralization)} \\
   N_{\text{baseline}} & \text{otherwise}
   \end{cases}$$

2. **Preceding Legume Nitrogen Credit:**
   When the preceding rotation crop was a nitrogen-fixing pulse (lentil, chickpea, blackgram, soybean):
   $$N_{\text{adj}} = \max(15, N_{\text{adj}} - 25\text{ kg/ha})$$

3. **Acid Soil Liming ($\text{CaCO}_3$) Formulation:**
   $$M_{\text{Lime}} = \begin{cases}
   2,500\text{ kg/ha} \times A_{\text{ha}} & \text{if } \text{pH} < 5.0 \quad (\approx 125\text{ kg / Ropani}) \\
   1,500\text{ kg/ha} \times A_{\text{ha}} & \text{if } 5.0 \le \text{pH} < 5.5 \quad (\approx 75\text{ kg / Ropani}) \\
   0 & \text{if } \text{pH} \ge 5.5
   \end{cases}$$

---

### 4.4. Complete Worked Example: Wheat on 10 Ropani in Chitwan
- **Location:** Chitwan Inner Terai
- **Crop:** Wheat (`wheat`)
- **Area:** $10\text{ Ropani} \implies A_{\text{ha}} = 10 \times 0.0508737 = 0.5087\text{ ha}$
- **Baseline Requirements:** $N = 100\text{ kg/ha}, P_2O_5 = 50\text{ kg/ha}, K_2O = 40\text{ kg/ha}$
- **Soil Status:** $\text{pH} = 6.2$, $\text{SOM} = 2.1\%$, Preceding crop = Lentil (Legume credit applied)

**Calculations:**
1. **Adjusted Nitrogen:**
   $$N_{\text{adj}} = 100 - 25 = 75\text{ kg/ha}$$
   $$P_{2}O_{5,\text{adj}} = 50\text{ kg/ha}, \quad K_2O_{\text{adj}} = 40\text{ kg/ha}$$
2. **Gross Nutrient Demand for 0.5087 ha:**
   $$N_{\text{total}} = 75 \times 0.5087 = 38.15\text{ kg}$$
   $$P_2O_{5,\text{total}} = 50 \times 0.5087 = 25.44\text{ kg}$$
   $$K_2O_{\text{total}} = 40 \times 0.5087 = 20.35\text{ kg}$$
3. **Fertilizer Totals:**
   - **DAP Required:** $25.44 / 0.46 = 55.3\text{ kg} \implies \mathbf{55\text{ kg DAP}}$
   - **N supplied by DAP:** $55.3 \times 0.18 = 9.95\text{ kg N}$
   - **N remaining:** $38.15 - 9.95 = 28.20\text{ kg N}$
   - **Urea Required:** $28.20 / 0.46 = 61.3\text{ kg} \implies \mathbf{61\text{ kg Urea}}$
   - **MOP Required:** $20.35 / 0.60 = 33.9\text{ kg} \implies \mathbf{34\text{ kg MOP}}$
   - **FYM Compost:** $0.5087 \times 10,000 = \mathbf{5,087\text{ kg}}$
   - **Agricultural Lime:** $\text{pH } 6.2 \ge 5.5 \implies \mathbf{0\text{ kg}}$

---

## 5. Pre-Storm Saturation & Runoff Hazard Formulation

Implemented in [`src/services/farmIntelligenceEngine.ts`](file:///c:/Users/DELL/Documents/GitHub/FarmShift/src/services/farmIntelligenceEngine.ts):

A high-velocity flood and waterlogging alert is triggered when satellite topsoil moisture interacts with forecasted heavy precipitation:

$$\text{Hazard}_{\text{flood}} = \begin{cases}
\text{CRITICAL ALERT} & \text{if } \text{GWETTOP} > 0.70 \text{ AND } P_{\text{forecast, 7d}} \ge 30\text{ mm} \\
\text{WARNING} & \text{if } \text{GWETTOP} > 0.85 \text{ OR } P_{\text{forecast, 7d}} \ge 60\text{ mm} \\
\text{NORMAL} & \text{otherwise}
\end{cases}$$

Where:
- $\text{GWETTOP}$ is NASA MERRA-2/POWER surface soil wetness fraction ($0.0 - 1.0$)
- $P_{\text{forecast, 7d}}$ is Open-Meteo 7-day cumulative rainfall ($\text{mm}$)

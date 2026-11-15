# FarmShift — Adapting Farms with NASA Earth Observations

[![CI](https://github.com/Spongly/farmshift/actions/workflows/ci.yml/badge.svg)](https://github.com/Spongly/farmshift/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-forest.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Grow with the changing climate.**  
> An open-source agricultural intelligence platform combining NASA Earth observations, numerical weather predictions, and transparent agronomic heuristics to support climate-adaptive farming decisions in Nepal.  
> Developed for the **NASA Space Apps Challenge 2026** challenge: *“Field Shift: Adapting Farms with NASA Data”*.

🌐 **Live Website:** [https://farmshift.pokhrelpratik.com.np/](https://farmshift.pokhrelpratik.com.np/)  
👤 **Author:** [Pratik Pokhrel](https://pokhrelpratik.com.np/) (`@Spongly`)  
📂 **Repository:** [https://github.com/Spongly/farmshift](https://github.com/Spongly/farmshift)

---

## 1. Project Overview & Challenge Context

Across the complex topography of Nepal—from the subtropical Terai plains to the high Himalayan valleys—smallholder farmers face shifting monsoon onset dates, extended dry spells, intense unseasonal precipitation, and localized flash flood hazards. Traditional crop calendars struggle to keep pace with these accelerating climatic anomalies.

**FarmShift** translates authoritative NASA Earth observation datasets and high-resolution numerical forecasts into actionable, transparent, and location-specific agricultural intelligence. Instead of relying on opaque black-box algorithms, FarmShift pairs NASA Earth data with transparent rule-based agronomic models informed by published guidance from the Nepal Agricultural Research Council (NARC), the Ministry of Agriculture and Livestock Development (MoALD), and the FAO.

### Primary Capabilities:
1. **NASA-Powered Environmental Intelligence:** Daily soil wetness, rainfall and temperature for any point in Nepal from NASA POWER (MERRA-2 / GEOS), plus NASA GIBS map layers from SMAP, GPM IMERG and MODIS, each labelled with its true source and resolution.
2. **Pre-Storm Flood Early Warning System:** Evaluates pre-storm soil saturation against multi-day numerical precipitation forecasts to alert farmers before catastrophic runoff occurs.
3. **Climate-Resilient Crop Rotation Planning:** Rule-based multi-season rotation pathways for 36 Nepalese crops optimized for water efficiency, thermal envelopes, biological disease disruption, and soil nitrogen replenishment.
4. **Bilingual Accessibility:** Native, seamless toggle between **English** and **नेपाली (Nepali)** across all interfaces, data cards, and advisories.
5. **Direct Farmer-to-Market Vision:** Conceptual groundwork to connect farmers directly with buyers and reduce unnecessary intermediaries, ensuring fair value retention for climate-adaptive production.

---

## 2. Live Demo & Application Preview

Experience the platform live at: **[https://farmshift.pokhrelpratik.com.np/](https://farmshift.pokhrelpratik.com.np/)**

### Key Application Views

| View | Purpose & Functionality |
| :--- | :--- |
| **Public Service Home** | Photo-led editorial portal presenting regional agroecological context (Mid-Hills vs. Terai), instant GPS location detection, and guided step-by-step navigation. |
| **My Farm Workspace** | Geocode any farm in Nepal (via Nominatim OSM) or drop a pin on the interactive Leaflet map. Input edaphic soil parameters (texture, pH, organic matter, and irrigation access). |
| **NASA Intelligence Dashboard** | Multi-layer satellite cartography (GIBS WMTS tiles), 30-day precipitation history, 7-day numerical forecasts, and color-coded agro-meteorological advisories. |
| **Soil & Fertilizer Guidance** | Official Nepal MoALD & NARC dosage calculator determining Urea, DAP, Potash, compost, and agricultural lime per Ropani/Bigha. |
| **Weekly Action Plan** | 4-week task list that follows the crop's season (preparing, growing, harvesting or off-season). Week 1 reacts to the live 7-day forecast using each crop's own heat, cold and water limits; weeks 2–4 follow the crop calendar. |
| **Agricultural Assistant** | Keyword retrieval over a built-in set of passages summarising NARC & MoALD guidance. It only returns stored passages with their source; it does not generate text, so it cannot invent advice. |
| **Rotation Planner & Suitability Index** | Multi-criteria scored rotations, plus a transparent crop suitability index (fixed weights over temperature, water, elevation and pH ranges). It is rule-based, not a trained model. |
| **Climate Explorer** | 5-year climatological normals from NASA POWER, seasonal monsoon distributions, thermal envelopes, and data completeness metrics. |
| **Methodology & Transparency** | Full scientific audit explaining formulas, weights, satellite resolutions, data latency, and model boundaries. |

> ### 📚 Comprehensive Technical Documentation Suite
> Detailed architectural, mathematical, and algorithmic documentation is available in the [`docs/`](docs/) directory:
> - [**Full Technical Report**](docs/FARMSHIFT_TECHNICAL_REPORT.md) — Comprehensive 13-section academic and engineering report
> - [**Data Sources & APIs**](docs/DATA_SOURCES_AND_APIS.md) — Exact specifications for NASA POWER, GIBS, Open-Meteo & Nominatim
> - [**Mathematical Methodology**](docs/MATHEMATICAL_METHODOLOGY.md) — Exact rotation scoring formulas, crop suitability index & fertilizer calculations
> - [**Agricultural Knowledge Assistant**](docs/AI_ASSISTANT_ARCHITECTURE.md) — In-browser retrieval pipeline, keyword ranking & NARC citations
> - [**Internal Data Dictionary**](docs/DATA_DICTIONARY.md) — TypeScript type schemas, units, and null-safety definitions
> - [**Limitations & Validation Roadmap**](docs/LIMITATIONS_AND_VALIDATION.md) — Spatial resolution bounds, safety rules & field test roadmap
> - [**System Architecture**](docs/ARCHITECTURE.md) — Component topology & Mermaid data flow diagrams
> - [**Agricultural Safety Principles**](docs/AGRICULTURAL_SAFETY.md) — Agronomic boundaries, liming separations & flood triggers

---

## 3. NASA Data Sources & Scientific Methodology

FarmShift uses genuine public endpoints only. Data is fetched live or cached in memory. When a value is missing (for example, NASA POWER has not yet published recent soil wetness), the app shows "data unavailable" and issues no advisory instead of filling in a number.

> **A note on sources.** The numbers behind the advisories come from **NASA POWER**, whose soil wetness (`GWETTOP`, `GWETROOT`), precipitation (`PRECTOTCORR`) and skin temperature (`TS`) are products of the **MERRA-2 / GEOS** reanalysis, not direct satellite retrievals. **SMAP, GPM IMERG and MODIS** appear in FarmShift as **NASA GIBS map layers** for visual context. Pulling SMAP L4 values directly is on the roadmap.

### Integrated Earth Observation Datasets

| Source & Mission | Product / Layer | Native Resolution | Retrieval Endpoint & Method | Purpose in FarmShift |
| :--- | :--- | :--- | :--- | :--- |
| **NASA POWER (LaRC)** | Agroclimatology (AG) Daily Point API | 0.5° × 0.5° & 1.0° × 1.0° | `https://power.larc.nasa.gov/api/temporal/daily/point` (REST) | 5-year climatological normals, thermal envelopes, relative humidity, and solar irradiance. |
| **NASA POWER (MERRA-2 / GEOS)** | Surface (`GWETTOP`) & Root-Zone (`GWETROOT`) Soil Wetness, `PRECTOTCORR`, `TS` | 0.5° × 0.625° | NASA POWER daily point API | Topsoil and root-zone wetness, rainfall and skin temperature that drive the irrigation, waterlogging, flood and heat advisories. |
| **NASA SMAP** | Level-4 Surface & Root-Zone Soil Moisture | 9 km grid | NASA GIBS WMTS tile overlay (map layer only) | Visual map of soil moisture around the farm. |
| **NASA GPM IMERG** | Precipitation Rate | 0.1° × 0.1° (~10 km) | NASA GIBS WMTS tile overlay (map layer only) | Visual map of recent rainfall. |
| **NASA MODIS / VIIRS** | Land Surface Temperature & True Color Reflectance | 250 m – 1 km | NASA GIBS WMTS tile overlay (map layer only) | Land surface temperature map and true-color satellite basemap. |
| **Open-Meteo API** | High-Resolution Numerical Weather Prediction Blend | ~1 km – 5 km | `https://api.open-meteo.com/v1/forecast` (REST) | Forward 7-day forecast (temp, rain, ET₀, wind) + past 30-day observed rainfall for real-time latency bridge. |
| **OpenStreetMap / Nominatim** | Administrative Geocoding & Reverse Geocoding | Point coordinates | `https://nominatim.openstreetmap.org/` (REST) | Converts coordinates into Nepalese administrative districts, municipalities, and local presets. |

### Rule-Based Rotation Engine Heuristics

Rather than opaque machine learning predictions, FarmShift implements a multi-criteria scoring engine (`src/services/rotationEngine.ts`):

$$\text{Total Score} = w_{\text{clim}} \cdot S_{\text{clim}} + w_{\text{water}} \cdot S_{\text{water}} + w_{\text{soil}} \cdot S_{\text{soil}} + w_{\text{div}} \cdot S_{\text{div}}$$

- **Climate Suitability ($S_{\text{clim}}$):** Evaluates thermal minimums, optimal temperature envelopes, and thermal stress thresholds for each crop against local monthly climatology.
- **Water Demand Matching ($S_{\text{water}}$):** Compares cumulative seasonal rainfall against documented crop evapotranspiration footprints (e.g., transplanted rice requiring 900–1200 mm vs. rainfed lentil requiring 200–400 mm).
- **Biological Diversity & Disease Disruption ($S_{\text{div}}$):** Heavily penalizes consecutive monocultures; incentivizes alternating cereals, legumes, and brassicas to disrupt pest and pathogen life cycles.
- **Soil Health & Nitrogen Dynamics ($S_{\text{soil}}$):** Rewards biological nitrogen-fixing legumes (lentil, soybean, black gram, chickpea) that enrich soil nitrogen reserves for succeeding feeder crops.

### Pre-Storm Flood Early Warning Principle

NASA's SMAP mission showed that knowing how wet the soil is *before* a storm arrives improves flood warnings. FarmShift applies the same principle using NASA POWER's modelled soil wetness.
- When surface soil wetness exceeds **70%** (`GWETTOP > 0.70`), the soil can absorb very little more water.
- Incoming precipitation ($\ge 30\text{ mm}$ or heavy rain days $\ge 25\text{ mm}$) immediately turns into high-velocity surface runoff, triggering a **Critical Flash Flood & Erosion Warning**.

---

## 4. Technology Stack

### Frontend & Application Architecture
- **Framework:** [React 18.3](https://react.dev/) with [TypeScript 5.6](https://www.typescriptlang.org/) (strict mode)
- **Build System & Dev Server:** [Vite 6.0](https://vitejs.dev/)
- **Styling & Design System:** [Tailwind CSS 3.4](https://tailwindcss.com/) with a custom editorial token palette (`paper`, `ink`, `forest`, `sienna`)
- **Cartography & Geospatial:** [Leaflet 1.9](https://leafletjs.com/) and [React-Leaflet 4.2](https://react-leaflet.js.org/) with NASA EOSDIS GIBS WMTS raster tile overlays
- **Data Visualization:** [Recharts 2.15](https://recharts.org/) for climatological normals, thermal envelopes, and rainfall trends
- **Icons & UI Utilities:** [Lucide React](https://lucide.dev/), `clsx`, `date-fns`

### Testing & Code Quality
- **Test Runner:** [Vitest 2.1](https://vitest.dev/) with JSDOM
- **Linter & Static Analysis:** [ESLint 9](https://eslint.org/) (flat configuration) with `@typescript-eslint`
- **Continuous Integration:** GitHub Actions workflow executing type checking, automated tests, linting, and production builds on every push and pull request.

---

## 5. Repository Structure

```text
farmshift/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml          # GitHub bug report issue template
│   │   └── feature_request.yml     # Feature request issue template
│   ├── PULL_REQUEST_TEMPLATE.md    # Pull request guideline checklist
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI workflow (build, test, lint, typecheck)
├── docs/
│   └── screenshots/
│       └── README.md               # Visual captures guide and archive
├── public/
│   ├── images/                     # Homepage photography
│   │   ├── climate-monsoon.jpg
│   │   ├── nasa-himalaya-truecolor.jpg   # NASA GIBS, MODIS Terra true colour
│   │   ├── nasa-midhills-truecolor.jpg   # NASA GIBS, MODIS Terra true colour
│   │   ├── nasa-ndvi-nepal.jpg           # NASA GIBS, MODIS Terra NDVI (8-day)
│   │   ├── nasa-terai-falsecolor.jpg     # NASA GIBS, MODIS Terra bands 7-2-1
│   │   └── soil-water.jpg
│   ├── logo-badge.png              # Official FarmShift identity badges
│   ├── logo-symbol-forest.png
│   └── logo-symbol-white.png
├── scripts/
│   └── extract-logo.ps1            # Asset extraction utility
├── src/
│   ├── assets/                     # Bundled SVG and graphic assets
│   ├── components/                 # Reusable and view-level components
│   │   ├── ui/                     # Accessible UI atoms (Card, Button, Badge, SectionHeader)
│   │   ├── ClimateExplorer.tsx     # NASA POWER historical climatology viewer
│   │   ├── ComparisonWorkspace.tsx # Multi-season rotation comparison matrix
│   │   ├── FarmIntelligenceDashboard.tsx # NASA satellite analytics & flood early warning
│   │   ├── GuidedFarmPlanner.tsx   # Interactive farm location and soil input wizard
│   │   ├── InteractiveSatelliteMap.tsx # Leaflet map with NASA GIBS WMTS overlays
│   │   ├── LocationSelector.tsx    # Administrative geocoding & preset picker
│   │   ├── MapView.tsx             # Interactive Leaflet coordinate selector
│   │   ├── MethodologyView.tsx     # Scientific disclosure, data provenance & limitations
│   │   ├── RotationPlanner.tsx     # Crop rotation pathway generator
│   │   ├── ServiceHome.tsx         # Public editorial homepage & regional articles
│   │   └── SoilModule.tsx          # Soil texture, pH, and edaphic properties module
│   ├── context/
│   │   └── AppContext.tsx          # Global application state and preferences provider
│   ├── data/
│   │   ├── cropData.ts             # 14 Nepalese crop agronomic profiles & regional presets
│   │   └── translations.ts         # Complete bilingual English & Nepali localization dictionary
│   ├── services/
│   │   ├── exportService.ts        # CSV rotation export engine
│   │   ├── farmIntelligenceEngine.ts # Rule-based agro-meteorological advisory engine
│   │   ├── geocoding.ts            # Nominatim OpenStreetMap client with rate limiting
│   │   ├── nasaPower.ts            # NASA POWER AG REST API client & cache layer
│   │   ├── rotationEngine.ts       # Multi-criteria crop rotation evaluation engine
│   │   ├── satelliteLayers.ts      # NASA GIBS WMTS layer configs & tile URL builders
│   │   └── weatherForecast.ts      # Open-Meteo 7-day forecast & 30-day rain client
│   ├── types/
│   │   └── index.ts                # TypeScript domain models and interfaces
│   ├── App.tsx                     # Top-level application shell, header, and routing
│   ├── main.tsx                    # React application entry point
│   └── index.css                   # Tailwind styles and Leaflet stylesheet imports
├── tests/
│   ├── farmIntelligence.test.ts    # Unit tests for intelligence engine, WMO codes & flood alerts
│   └── rotationEngine.test.ts      # Unit tests for crop rotation multi-criteria heuristics
├── .env.example                    # Environment variable template (zero required keys)
├── .gitignore                      # Git exclusion rules
├── CODE_OF_CONDUCT.md              # Contributor Covenant Code of Conduct
├── CONTRIBUTING.md                 # Contribution guidelines and workflow
├── eslint.config.js                # ESLint flat configuration file
├── LICENSE                         # MIT License
├── package.json                    # Project dependencies and npm scripts
├── README.md                       # Comprehensive project documentation
├── tsconfig.json                   # TypeScript project references configuration
└── vite.config.ts                  # Vite build tool configuration
```

---

## 6. Getting Started Locally

### Prerequisites
- **Node.js:** v18.0.0 or higher (v20+ LTS recommended)
- **npm:** v9.0.0 or higher
- An active internet connection (to retrieve live NASA POWER and Open-Meteo data)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Spongly/farmshift.git
   cd farmshift
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional):**
   FarmShift runs completely out-of-the-box using open, public endpoints without requiring any API keys. If you wish to set custom variables:
   ```bash
   cp .env.example .env
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 7. Testing, Linting & Production Build

### Running Automated Unit Tests
Run the Vitest test suite covering rotation heuristics, WMO weather decoding, GIBS WMTS URLs, and flood warning triggers:
```bash
npm test
```

For interactive test watch mode:
```bash
npm run test:watch
```

### Type Checking & Linting
Validate TypeScript types and ESLint rules:
```bash
npm run type-check
npm run lint
```

### Production Build
Generate an optimized production bundle:
```bash
npm run build
```
The static build artifacts are generated in the `dist/` folder. Preview the production build locally:
```bash
npm run preview
```

---

## 8. Deployment Guide

FarmShift is a static Single-Page Application (SPA) that can be deployed to any modern static hosting platform (e.g., Cloudflare Pages, Vercel, Netlify, or GitHub Pages).

### Build Details
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18+ or 20+

### Production Notes & SPA Routing
Because FarmShift uses client-side state navigation and hash/history routing, ensure your host redirects all incoming routes to `index.html`. For example:
- **Cloudflare Pages / Netlify:** Create a `public/_redirects` file with `/*  /index.html  200`.
- **Vercel:** Include a `vercel.json` with a rewrite rule to `/index.html`.

---

## 9. Data Limitations & Responsible Use

> [!WARNING]  
> **Scientific Disclosure:**  
> FarmShift is a strategic decision-support tool designed for informational and educational purposes. Remotely sensed satellite observations (e.g., NASA POWER, SMAP, GPM IMERG) represent spatial grid cells ranging from 250 m to 0.5° (~50 km) and cannot substitute for on-site soil testing, localized microclimate variations, or expert consultation with local agricultural extension officers. FarmShift does not guarantee crop yields, weather outcomes, or financial profits.

---

## 10. Roadmap & Future Work

- [x] NASA POWER 5-year climatological normals ingestion
- [x] Multi-criteria crop rotation engine for 36 Nepalese crops
- [x] NASA GIBS WMTS raster layer overlay integration (SMAP, MODIS, GPM)
- [x] Pre-storm flood early warning system based on NASA POWER soil wetness
- [x] Complete bilingual English & Nepali localization
- [ ] Direct SMAP L4 soil moisture values (NASA Earthdata) in place of modelled wetness
- [ ] Validation of the suitability index against MoALD district yield statistics
- [ ] Integration of hyper-local SoilGrids edaphic layers
- [ ] Direct farmer-to-buyer agricultural marketplace interface
- [ ] Offline-first Progressive Web App (PWA) support with SMS fallback for low-connectivity rural zones
- [ ] Expanded agronomic models for high-altitude Himalayan horticulture (apples, buckwheat)

---

## 11. Contributing & Security

Contributions are warmly welcomed! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, development workflow, and testing expectations.

For security concerns, please refer to our [SECURITY.md](SECURITY.md).

---

## 12. License & Acknowledgements

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### Acknowledgements & Data Attribution
- **NASA Earth Science Division & EOSDIS:** NASA POWER Agroclimatology Project, SMAP Science Team, GPM IMERG, and GIBS WMTS tile services.
- **Nepal Agricultural Research Council (NARC):** Published research bulletins and national commodity crop calendars.
- **Ministry of Agriculture and Livestock Development (MoALD), Nepal:** Agroclimatic statistical bulletins.
- **Open-Meteo:** Open-access meteorological and soil forecast data.
- **OpenStreetMap Contributors:** Nominatim geocoding and CartoDB Positron basemap tiles.

### Image Credits
The four `nasa-*.jpg` homepage images were exported from **NASA Global Imagery Browse Services (GIBS)**, part of NASA's Earth Science Data and Information System (ESDIS). They are MODIS Terra products: corrected reflectance true colour and bands 7-2-1 for 8 November 2026, and the 8-day NDVI composite for 20 October 2026. NASA imagery is generally free to reuse with credit. `climate-monsoon.jpg` and `soil-water.jpg` are stock photographs whose source and licence still need to be recorded here.

---

**FarmShift Nepal** • Built with ❤️ for Nepalese farmers and the **NASA Space Apps Challenge 2026**.

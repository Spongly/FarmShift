# FarmShift Nepal — Architectural & Codebase Audit Report

**Date:** October 12, 2026  
**Auditor:** Senior Full-Stack & Agricultural Data Scientist  
**Repository:** https://github.com/Spongly/FarmShift  
**Target Platform:** FarmShift Nepal (NASA Space Apps Challenge 2026)

---

## 1. Executive Summary & Baseline State

The FarmShift repository is an agricultural climate-tech application built for Nepal smallholders. 
The baseline audit confirms:
- **Build & Quality Baseline:** `npm run build` succeeds cleanly (`dist/` generated with 2,255 modules transformed). Vitest test suite currently passes 8/8 tests.
- **Frontend Stack:** React 18.3.1, TypeScript 5.6.2, Vite 6.0.1, Tailwind CSS 3.4.14, Leaflet 1.9.4, Recharts 2.15.4, Lucide React.
- **Data Layers:** Active direct client integration with NASA POWER Agroclimatology API (`https://power.larc.nasa.gov/api/temporal/daily/point`), Open-Meteo 7-day forecast API, and NASA GIBS WMTS raster imagery.

---

## 2. Inventory of Strengths & Established Foundations

1. **Zero Fake NASA Endpoints:**
   - Real point coordinates query the official NASA Langley Research Center POWER endpoint for `PRECTOTCORR`, `T2M`, `T2M_MAX`, `T2M_MIN`, `RH2M`, `ALLSKY_SFC_SW_DWN`, `GWETTOP`, `GWETROOT`, and `TS`.
   - Fill values (`-999.0`) are parsed to `null` to prevent zero-contamination.
2. **Transparent Multi-Criteria Rotation Engine:**
   - Heuristics implemented in `rotationEngine.ts` evaluate thermal suitability, moisture availability, biological disease interruption, and legume nitrogen credits.
3. **Bilingual Localization (English & Nepali):**
   - Complete localized dictionaries in `translations.ts` cover navigation, weather metrics, and Nepali crop vernacular.
4. **Pre-Storm Flood Early Warning:**
   - `farmIntelligenceEngine.ts` links high pre-storm soil moisture (>70%) with upcoming rainfall forecasts to trigger early runoff warnings.

---

## 3. Discovered Deficiencies, Gaps & Architectural Opportunities

| Area | Finding | Severity | Proposed Fix / Upgrade |
| :--- | :--- | :--- | :--- |
| **Soil & Fertilizer Guidance** | Soil module collected texture and pH but lacked crop-specific NPK nutrient deficiency diagnostics and calculation of compost/urea/DAP/MOP application rates. | **HIGH** | Build a dedicated `soilNutrientService.ts` implementing official NARC & MoALD soil test interpretation formulas and fertilizer dosage calculators. |
| **Agricultural Knowledge Base & RAG** | Agronomic knowledge was hardcoded in static arrays without an extensible document store, indexed search, or passage retrieval for evidence grounding. | **HIGH** | Build an in-browser Document & Evidence Registry (`agriculturalKnowledgeService.ts`) indexing official NARC/MoALD technical bulletins with TF-IDF/semantic scoring. |
| **Agricultural AI Assistant** | No conversational AI assistant existed to answer farmer questions in Nepali/English with evidence citations and farm context grounding. | **HIGH** | Implement `AgriculturalAssistant` component powered by local retrieval-augmented generation (RAG) with optional LLM provider integration. |
| **Machine Learning Layer** | Previous scoring was purely heuristic rule weights; lacked an empirical machine learning model baseline evaluating multi-factor crop suitability. | **MEDIUM** | Implement a client-side Random Forest / Decision Ensemble classifier in TypeScript with reproducible weights trained on environmental features. |
| **Weekly Actionable Farm Plan** | Recommendations presented multi-season rotation pathways but lacked an immediate, calendar-driven weekly task schedule (planting, weeding, irrigation, top-dressing). | **MEDIUM** | Implement `farmActionPlanner.ts` generating dynamic 4-week agronomic task schedules linked to current forecasts. |
| **Data Provenance & Source Metadata** | Some environmental indicators lacked explicit spatial resolution and sensor metadata badges. | **LOW** | Add standardized metadata cards detailing spatial resolution, latency, and sensor satellite missions. |

---

## 4. Implementation Plan

1. **Stage 1 — Agricultural Knowledge & Document Ingestion Registry:**
   - Create `src/services/agriculturalKnowledgeService.ts` with indexed bulletins from NARC, MoALD, and FAO.
   - Support passage search by crop, district, soil type, and nutrient.
2. **Stage 2 — Soil Testing & Crop-Specific Fertilizer Service:**
   - Create `src/services/soilNutrientService.ts` calculating NPK requirements, organic manure recommendations, and lime requirements for acidic hill soils.
3. **Stage 3 — Machine Learning Crop Classifier:**
   - Create `src/services/cropMlModel.ts` implementing a trained decision ensemble predicting crop suitability probabilities alongside rule heuristics.
4. **Stage 4 — Actionable Weekly Farming Plan Generator:**
   - Create `src/services/farmActionPlanner.ts` translating climate risks, selected crops, and soil status into a 4-week task calendar.
5. **Stage 5 — Evidence-Grounded Agricultural AI Assistant:**
   - Create `src/components/AgriculturalAssistant.tsx` supporting bilingual queries with retrieved document citations and zero fabricated advice.
6. **Stage 6 — UI Integration & Test Verification:**
   - Integrate new modules into `App.tsx` and write unit tests in `tests/` covering fertilizer math, RAG retrieval, and ML predictions.

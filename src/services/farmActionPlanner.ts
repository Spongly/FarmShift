// ============================================================
// FarmShift Nepal — Actionable Weekly Farming Plan Generator
// Converts climate risks, soil data & crop choice into a 4-week task calendar
// ============================================================

import type { CropId, SoilInfo } from '../types';
import type { WeatherForecastData } from './weatherForecast';

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

export interface WeeklyFarmPlan {
  cropId: CropId;
  generatedDate: string;
  currentSeasonalPhaseEn: string;
  currentSeasonalPhaseNe: string;
  weeklyTasks: ActionTask[];
  operationalSummaryEn: string;
  operationalSummaryNe: string;
}

export function generateWeeklyFarmPlan(
  cropId: CropId,
  soil: SoilInfo,
  forecast: WeatherForecastData | null
): WeeklyFarmPlan {
  const tasks: ActionTask[] = [];
  const rainNextWeek = forecast?.summary?.totalRainNext7Days ?? 0;

  // --- WEEK 1: Soil Preparation & Basal Amendments ---
  tasks.push({
    id: 'task_w1_soil_prep',
    weekNumber: 1,
    titleEn: 'Field Tillage & Organic Manure Incorporation',
    titleNe: 'खेत जोताई र कम्पोस्ट/गोबरमल मिश्रण',
    category: 'soil_prep',
    priority: 'critical',
    instructionsEn:
      'Perform primary deep plowing to a depth of 15-20 cm. Broadcast well-rotted farmyard manure (FYM) or compost and incorporate thoroughly into the topsoil.',
    instructionsNe:
      'खेतलाई १५-२० से.मी. गहिराइसम्म जोतेर राम्ररी पाकेको गोबरमल वा कम्पोस्ट माटोमा मिलाउनुहोस्।',
    scientificReasonEn:
      'Organic matter improves water holding capacity in sandy soils and loosens heavy clay, buffering soil against drought and compaction.',
    scientificReasonNe:
      'गोबरमलले बलौटे माटोमा पानी सोस्ने क्षमता बढाउँछ र चिम्ट्याइलो माटोलाई खुकुलो बनाउँछ।',
  });

  if (soil.ph !== null && soil.ph < 5.5) {
    tasks.push({
      id: 'task_w1_lime',
      weekNumber: 1,
      titleEn: 'Agricultural Lime Application',
      titleNe: 'कृषि चुन प्रयोग',
      category: 'fertilizer',
      priority: 'critical',
      instructionsEn:
        'Broadcast agricultural lime across the field and disc-harrow into the soil. Allow 3 weeks before seed sowing.',
      instructionsNe:
        'अम्लीयपना घटाउन खेतभरि कृषि चुन छरेर माटोमा मिलाउनुहोस्। बीउ रोप्नुभन्दा ३ हप्ता अगावै यो कार्य गर्नुहोस्।',
      scientificReasonEn:
        'Soil pH is below 5.5. Liming neutralizes toxic aluminum and unlocks fixed phosphorus.',
      scientificReasonNe:
        'माटोको अम्लीयपना घटाएर फस्फोरस लगायतका खाद्यतत्वहरू बिरुवालाई उपलब्ध गराउँछ।',
    });
  }

  // --- WEEK 2: Sowing & Moisture Management ---
  if (rainNextWeek > 35) {
    tasks.push({
      id: 'task_w2_drainage',
      weekNumber: 2,
      titleEn: 'Excavate Field Drainage Channels',
      titleNe: 'खेतमा निकास नाला निर्माण',
      category: 'protection',
      priority: 'critical',
      instructionsEn:
        `Incoming rainfall (${Math.round(rainNextWeek)} mm forecast over 7 days). Clear drainage furrows at 4-meter intervals to avoid seed rotting.`,
      instructionsNe:
        `आगामी हप्ता भारी वर्षा (${Math.round(rainNextWeek)} मि.मि.) हुने पूर्वानुमान छ। बीउ कुहिनबाट बचाउन खेतको वरिपरि निकास नाली खोल्नुहोस्।`,
      scientificReasonEn:
        'Prevents waterlogging and hypoxia around the germinating seed embryo.',
      scientificReasonNe:
        'उम्रिन लागेको बीउलाई अक्सिजनको कमी र कुहिनबाट बचाउँछ।',
      weatherTriggerEn: `Forecast rain: ${Math.round(rainNextWeek)} mm`,
      weatherTriggerNe: `पूर्वानुमानित वर्षा: ${Math.round(rainNextWeek)} मि.मि.`,
    });
  } else {
    tasks.push({
      id: 'task_w2_sowing',
      weekNumber: 2,
      titleEn: 'Seed Sowing & Basal DAP/Potash Application',
      titleNe: 'बीउ छर्ने तथा आधारभूत रासायनिक मल प्रयोग',
      category: 'planting',
      priority: 'critical',
      instructionsEn:
        'Sow treated seeds in lines at recommended spacing. Apply recommended basal dose of DAP and Muriate of Potash at the time of sowing.',
      instructionsNe:
        'उपचार गरिएको बीउलाई सिफारिस गरिएको दूरीमा लाइनमा रोप्नुहोस्। साथै डीएपी र पोटास मल बीउको छेउमा पर्ने गरी हाल्नुहोस्।',
      scientificReasonEn:
        'Line sowing allows optimal solar radiation interception and makes subsequent mechanical weeding efficient.',
      scientificReasonNe:
        'लाइनमा रोप्दा बिरुवाले पर्याप्त घाम पाउँछ र गोडमेल गर्न सजिलो हुन्छ।',
    });
  }

  // --- WEEK 3: Germination & Early Irrigation ---
  tasks.push({
    id: 'task_w3_irrigation',
    weekNumber: 3,
    titleEn: 'Germination Inspection & Crown Root Irrigation',
    titleNe: 'अङ्कुरण निरीक्षण र प्रारम्भिक हल्का सिंचाइ',
    category: 'irrigation',
    priority: 'recommended',
    instructionsEn:
      rainNextWeek < 10
        ? 'Soil surface is dry. Provide a light supplementary irrigation to ensure uniform seedling emergence.'
        : 'Rainfall is adequate. Hold off on manual irrigation to prevent soil crusting.',
    instructionsNe:
      rainNextWeek < 10
        ? 'माटो सुक्खा देखिएकोले बीउ राम्ररी उम्रिनका लागि हल्का सिंचाइ दिनुहोस्।'
        : 'पर्याप्त वर्षा हुने भएकाले थप सिंचाइ रोक्नुहोस्।',
    scientificReasonEn:
      'Crown root initiation and early vegetative growth require moist but aerobic soil conditions.',
    scientificReasonNe:
      'बिरुवाको सुरुवाती जराको विकासका लागि माटोमा चिस्यान र हावा दुबै आवश्यक हुन्छ।',
  });

  // --- WEEK 4: Weed Control & First Top-Dressing ---
  tasks.push({
    id: 'task_w4_weeding_topdress',
    weekNumber: 4,
    titleEn: 'First Mechanical Weeding & Urea Top-Dressing',
    titleNe: 'पहिलो गोडमेल र युरिया मलको टप-ड्रेसिङ',
    category: 'fertilizer',
    priority: 'recommended',
    instructionsEn:
      'Weed thoroughly to eliminate weed competition. Top-dress one-fourth of the total Urea requirement into moist soil.',
    instructionsNe:
      'झारपात उखेलेर सफा गर्नुहोस् र माटोमा चिस्यान छँदै युरिया मलको पहिलो भाग छर्नुहोस्।',
    scientificReasonEn:
      'Weeds compete aggressively for nitrogen and sunlight during early vegetative elongation.',
    scientificReasonNe:
      'सुरुवाती वृद्धिको बेला झारले बालीको खाद्यतत्व र प्रकाश खोस्न नपाओस् भनेर गोडमेल गरिन्छ।',
  });

  return {
    cropId,
    generatedDate: new Date().toISOString().split('T')[0],
    currentSeasonalPhaseEn: 'Pre-Planting to Early Vegetative Phase',
    currentSeasonalPhaseNe: 'रोपाईं पूर्व तथा प्रारम्भिक वृद्धि अवस्था',
    weeklyTasks: tasks,
    operationalSummaryEn: `Weekly calendar tailored for ${cropId.replace('-', ' ')} with current 7-day rainfall forecast (${Math.round(rainNextWeek)} mm) and soil conditions.`,
    operationalSummaryNe: `${cropId.replace('-', ' ')} बालीका लागि आगामी ७ दिनको वर्षा पूर्वानुमान (${Math.round(rainNextWeek)} मि.मि.) र माटो अनुसार तयार पारिएको कार्यतालिका।`,
  };
}

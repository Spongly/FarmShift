// ============================================================
// FarmShift Nepal — Actionable Weekly Farming Plan Generator
// Builds a 4-week task calendar from three things:
//   1. where the crop is in its season (crop calendar + today's month)
//   2. the live 7-day forecast (drives week 1 only; it cannot see further)
//   3. the farmer's soil inputs
// ============================================================

import type { Crop, CropId, SoilInfo } from '../types';
import type { WeatherForecastData } from './weatherForecast';
import { CROPS } from '../data/cropData';

export type CropStage = 'off_season' | 'pre_sowing' | 'growing' | 'harvest';

export interface ActionTask {
  id: string;
  weekNumber: 1 | 2 | 3 | 4;
  titleEn: string;
  titleNe: string;
  category: 'planting' | 'soil_prep' | 'irrigation' | 'fertilizer' | 'protection' | 'monitoring' | 'harvest';
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
  stage: CropStage;
  currentSeasonalPhaseEn: string;
  currentSeasonalPhaseNe: string;
  weeklyTasks: ActionTask[];
  operationalSummaryEn: string;
  operationalSummaryNe: string;
}

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_NE = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];

const STAGE_LABELS: Record<CropStage, { en: string; ne: string }> = {
  off_season: { en: 'Off-Season: Preparing for the Next Crop', ne: 'बेमौसम: अर्को बालीको तयारी' },
  pre_sowing: { en: 'Land Preparation & Sowing Window', ne: 'खेत तयारी तथा बीउ रोप्ने समय' },
  growing: { en: 'Growing Season: Crop in the Field', ne: 'वृद्धि अवस्था: बाली खेतमा छ' },
  harvest: { en: 'Harvest & Post-Harvest Window', ne: 'बाली भित्र्याउने तथा भण्डारण समय' },
};

/** Where the crop is in its season for a given calendar month (1-12). */
export function getCropStage(crop: Crop, month: number): CropStage {
  const { sowingMonths, harvestMonths } = crop.calendar;
  if (sowingMonths.includes(month)) return 'pre_sowing';
  if (harvestMonths.includes(month)) return 'harvest';

  // Between the last sowing month and the first harvest month, wrapping past December.
  const lastSowing = sowingMonths[sowingMonths.length - 1];
  const firstHarvest = harvestMonths[0];
  for (let m = (lastSowing % 12) + 1, i = 0; i < 12 && m !== firstHarvest; m = (m % 12) + 1, i++) {
    if (m === month) return 'growing';
  }
  return 'off_season';
}

export function generateWeeklyFarmPlan(
  cropId: CropId,
  soil: SoilInfo,
  forecast: WeatherForecastData | null,
  options: { today?: Date; stage?: CropStage } = {}
): WeeklyFarmPlan {
  const crop = CROPS.find((c) => c.id === cropId) ?? CROPS[0];
  const today = options.today ?? new Date();
  const month = today.getMonth() + 1;
  const stage = options.stage ?? getCropStage(crop, month);

  const tasks: ActionTask[] = [];
  const isLegume = crop.rotationBenefit.nitrogenFixation;
  const isSandy = soil.texture === 'sandy' || soil.texture === 'loamy-sand';
  const drainsPoorly =
    soil.drainage === 'poorly-drained' || soil.drainage === 'somewhat-poorly-drained' || soil.texture === 'clay' || soil.texture === 'silty-clay';
  const inField = stage === 'pre_sowing' || stage === 'growing';

  // ----------------------------------------------------------
  // WEEK 1 — weather-driven tasks from the live 7-day forecast
  // ----------------------------------------------------------
  if (forecast) {
    const rain = forecast.summary.totalRainNext7Days;
    const rainMm = Math.round(rain);
    const heavyDay = forecast.daily.find((d) => d.precipitationSum >= 25);

    if (rain > 35 || heavyDay) {
      const sensitive = !crop.waterRequirement.toleratesWaterlogging || drainsPoorly;
      tasks.push({
        id: 'task_w1_drainage',
        weekNumber: 1,
        titleEn: stage === 'harvest' ? 'Protect the Harvest from Incoming Rain' : 'Open Field Drainage Channels',
        titleNe: stage === 'harvest' ? 'आउँदो वर्षाबाट बाली जोगाउनुहोस्' : 'खेतमा निकास नाली खोल्नुहोस्',
        category: 'protection',
        priority: sensitive || stage === 'harvest' ? 'critical' : 'recommended',
        instructionsEn:
          stage === 'harvest'
            ? `About ${rainMm} mm of rain is forecast this week. Harvest mature produce before the rain and keep cut crop and grain under cover and off the ground.`
            : `About ${rainMm} mm of rain is forecast this week. Clear drainage furrows every 4 metres and open the field outlets${sensitive ? '; this crop or soil does not cope well with standing water' : ''}. Hold back fertilizer and sprays until the rain passes.`,
        instructionsNe:
          stage === 'harvest'
            ? `यो हप्ता करिब ${rainMm} मि.मि. वर्षाको पूर्वानुमान छ। पाकेको बाली वर्षाअघि नै भित्र्याउनुहोस् र काटेको बाली तथा अन्न ओत लागेको, जमिनभन्दा माथि राख्नुहोस्।`
            : `यो हप्ता करिब ${rainMm} मि.मि. वर्षाको पूर्वानुमान छ। प्रत्येक ४ मिटरमा निकास नाली सफा गर्नुहोस् र खेतको निकास खोल्नुहोस्${sensitive ? '; यो बाली वा माटोले जमेको पानी सहन सक्दैन' : ''}। वर्षा नरोकिएसम्म मल र विषादी नछर्नुहोस्।`,
        scientificReasonEn: 'Standing water starves roots of oxygen, and rain washes away freshly applied fertilizer and sprays.',
        scientificReasonNe: 'जमेको पानीले जरालाई अक्सिजन पुग्न दिँदैन, र वर्षाले भर्खर हालेको मल तथा विषादी बगाउँछ।',
        weatherTriggerEn: heavyDay ? `${Math.round(heavyDay.precipitationSum)} mm on ${heavyDay.date}` : `Forecast rain: ${rainMm} mm`,
        weatherTriggerNe: heavyDay ? `${heavyDay.date} मा ${Math.round(heavyDay.precipitationSum)} मि.मि.` : `पूर्वानुमानित वर्षा: ${rainMm} मि.मि.`,
      });
    } else if (rain < 10 && inField) {
      tasks.push({
        id: 'task_w1_dry_week',
        weekNumber: 1,
        titleEn: soil.irrigationAvailable ? 'Irrigate: Dry Week Ahead' : 'Conserve Soil Moisture: Dry Week Ahead',
        titleNe: soil.irrigationAvailable ? 'सिँचाइ गर्नुहोस्: सुक्खा हप्ता आउँदैछ' : 'माटोको चिस्यान जोगाउनुहोस्: सुक्खा हप्ता आउँदैछ',
        category: 'irrigation',
        priority: crop.waterRequirement.toleratesDrought ? 'recommended' : 'critical',
        instructionsEn: soil.irrigationAvailable
          ? `Only ${rainMm} mm of rain is forecast. ${stage === 'pre_sowing' ? 'Give a light irrigation before sowing so the seed lands in moist soil' : 'Irrigate in the early morning or evening'}${isSandy ? ', little and often because sandy soil drains fast' : ''}.`
          : stage === 'pre_sowing'
            ? `Only ${rainMm} mm of rain is forecast and no irrigation is available. Prepare the field now but sow right after the next rain, not into dry soil.`
            : `Only ${rainMm} mm of rain is forecast and no irrigation is available. Mulch between rows with straw or dry leaves and avoid disturbing the soil.`,
        instructionsNe: soil.irrigationAvailable
          ? `केवल ${rainMm} मि.मि. वर्षाको पूर्वानुमान छ। ${stage === 'pre_sowing' ? 'बीउ ओसिलो माटोमा परोस् भनेर रोप्नुअघि हल्का सिँचाइ गर्नुहोस्' : 'बिहान सबेरै वा साँझ सिँचाइ गर्नुहोस्'}${isSandy ? '; बलौटे माटोमा पानी छिटो सोसिने भएकाले थोरै-थोरै तर पटक-पटक दिनुहोस्' : ''}।`
          : stage === 'pre_sowing'
            ? `केवल ${rainMm} मि.मि. वर्षाको पूर्वानुमान छ र सिँचाइ सुविधा छैन। खेत अहिले तयार गर्नुहोस् तर सुक्खा माटोमा नरोपी अर्को वर्षापछि तुरुन्तै रोप्नुहोस्।`
            : `केवल ${rainMm} मि.मि. वर्षाको पूर्वानुमान छ र सिँचाइ सुविधा छैन। लाइनको बीचमा पराल वा सुकेका पातको छापो राख्नुहोस् र माटो नखलबल्याउनुहोस्।`,
        scientificReasonEn: crop.waterRequirement.toleratesDrought
          ? 'This crop tolerates short dry spells, but steady moisture still protects yield.'
          : 'This crop is sensitive to water stress; a dry week can cut yield, especially at a critical growth stage.',
        scientificReasonNe: crop.waterRequirement.toleratesDrought
          ? 'यो बालीले छोटो खडेरी सहन सक्छ, तर नियमित चिस्यानले उत्पादन जोगाउँछ।'
          : 'यो बाली पानीको अभावप्रति संवेदनशील छ; सुक्खा हप्ताले उत्पादन घटाउन सक्छ।',
        weatherTriggerEn: `Forecast rain: ${rainMm} mm`,
        weatherTriggerNe: `पूर्वानुमानित वर्षा: ${rainMm} मि.मि.`,
      });
    }

    // Temperature limits come from the crop's own tolerance range.
    if (inField && forecast.summary.highestTemp > crop.temperature.max) {
      const t = Math.round(forecast.summary.highestTemp);
      tasks.push({
        id: 'task_w1_heat',
        weekNumber: 1,
        titleEn: 'Heat Stress Protection',
        titleNe: 'गर्मीको तनावबाट बचाउ',
        category: 'protection',
        priority: 'critical',
        instructionsEn: `Temperatures up to ${t}°C are forecast, above this crop's ${crop.temperature.max}°C limit. Irrigate lightly in the early morning, mulch the soil and shade young seedlings.`,
        instructionsNe: `${t}°C सम्म तापक्रम पुग्ने पूर्वानुमान छ, जुन यो बालीको ${crop.temperature.max}°C सीमाभन्दा माथि हो। बिहान सबेरै हल्का सिँचाइ गर्नुहोस्, छापो राख्नुहोस् र कलिला बेर्नालाई छहारी दिनुहोस्।`,
        scientificReasonEn: 'Heat above the crop limit causes flower drop and poor grain or fruit set.',
        scientificReasonNe: 'बालीको सीमाभन्दा बढी गर्मीले फूल झर्छ र दाना वा फल राम्ररी लाग्दैन।',
        weatherTriggerEn: `Forecast high: ${t}°C`,
        weatherTriggerNe: `अधिकतम तापक्रम: ${t}°C`,
      });
    }
    if (inField && forecast.summary.lowestTemp < crop.temperature.min) {
      const t = Math.round(forecast.summary.lowestTemp);
      tasks.push({
        id: 'task_w1_cold',
        weekNumber: 1,
        titleEn: 'Cold & Frost Protection',
        titleNe: 'चिसो र तुसारोबाट बचाउ',
        category: 'protection',
        priority: 'critical',
        instructionsEn: `Night temperatures down to ${t}°C are forecast, below this crop's ${crop.temperature.min}°C limit. Irrigate lightly in the evening and cover nursery beds with straw or plastic.`,
        instructionsNe: `रातिको तापक्रम ${t}°C सम्म झर्ने पूर्वानुमान छ, जुन यो बालीको ${crop.temperature.min}°C सीमाभन्दा तल हो। साँझ हल्का सिँचाइ गर्नुहोस् र ब्याडलाई पराल वा प्लास्टिकले छोप्नुहोस्।`,
        scientificReasonEn: 'Moist soil holds more heat overnight, and covers stop frost from forming on young tissue.',
        scientificReasonNe: 'सुक्खा माटोभन्दा ओसिलो माटोले राति बढी ताप जोगाउँछ, र छोपेपछि कलिला मुनामा तुसारो पर्दैन।',
        weatherTriggerEn: `Forecast low: ${t}°C`,
        weatherTriggerNe: `न्यूनतम तापक्रम: ${t}°C`,
      });
    }

    // Best day this week for spraying, top-dressing or harvesting: dry and calm.
    const calmDay = forecast.daily.find((d) => d.precipitationSum < 1 && d.windSpeedMax < 20);
    if (calmDay && stage !== 'off_season') {
      tasks.push({
        id: 'task_w1_field_day',
        weekNumber: 1,
        titleEn: `Best Field-Work Day: ${calmDay.date}`,
        titleNe: `खेतको कामका लागि उत्तम दिन: ${calmDay.date}`,
        category: 'monitoring',
        priority: 'optional',
        instructionsEn:
          stage === 'harvest'
            ? 'This is the first dry, calm day in the forecast. Plan cutting, threshing and sun-drying around it.'
            : stage === 'pre_sowing'
              ? 'This is the first dry, calm day in the forecast. Do ploughing, manure spreading or sowing then.'
              : 'This is the first dry, calm day in the forecast. Do any spraying, top-dressing or weeding then.',
        instructionsNe:
          stage === 'harvest'
            ? 'पूर्वानुमानमा यो पहिलो सुक्खा र शान्त दिन हो। बाली काट्ने, चुट्ने र घाममा सुकाउने काम यसै दिन मिलाउनुहोस्।'
            : stage === 'pre_sowing'
              ? 'पूर्वानुमानमा यो पहिलो सुक्खा र शान्त दिन हो। जोत्ने, मल छर्ने वा बीउ रोप्ने काम यसै दिन गर्नुहोस्।'
              : 'पूर्वानुमानमा यो पहिलो सुक्खा र शान्त दिन हो। विषादी छर्ने, मल हाल्ने वा गोडमेल गर्ने काम यसै दिन गर्नुहोस्।',
        scientificReasonEn: 'Rain washes sprays and fertilizer off, and wind makes spray drift onto neighbouring plots.',
        scientificReasonNe: 'वर्षाले विषादी र मल बगाउँछ, र हावाले विषादी छिमेकी खेतमा पुर्‍याउँछ।',
        weatherTriggerEn: `${calmDay.precipitationSum.toFixed(0)} mm rain, wind ${Math.round(calmDay.windSpeedMax)} km/h`,
        weatherTriggerNe: `${calmDay.precipitationSum.toFixed(0)} मि.मि. वर्षा, हावा ${Math.round(calmDay.windSpeedMax)} कि.मि./घण्टा`,
      });
    }
  }

  // ----------------------------------------------------------
  // WEEKS 1-4 — crop-calendar tasks for the current stage
  // ----------------------------------------------------------
  const splitNoteEn = isSandy ? ' On sandy soil, split it into two smaller doses a week apart.' : '';
  const splitNoteNe = isSandy ? ' बलौटे माटोमा यसलाई एक हप्ताको फरकमा दुई सानो भागमा बाँडेर दिनुहोस्।' : '';

  if (stage === 'pre_sowing') {
    tasks.push({
      id: 'task_w1_soil_prep',
      weekNumber: 1,
      titleEn: 'Field Tillage & Organic Manure Incorporation',
      titleNe: 'खेत जोताई र कम्पोस्ट/गोबरमल मिश्रण',
      category: 'soil_prep',
      priority: 'critical',
      instructionsEn:
        'Plough to a depth of 15-20 cm. Spread well-rotted farmyard manure (FYM) or compost and mix it thoroughly into the topsoil.',
      instructionsNe: 'खेतलाई १५-२० से.मी. गहिराइसम्म जोतेर राम्ररी पाकेको गोबरमल वा कम्पोस्ट माटोमा मिलाउनुहोस्।',
      scientificReasonEn:
        'Organic matter improves water holding capacity in sandy soils and loosens heavy clay, buffering soil against drought and compaction.',
      scientificReasonNe: 'गोबरमलले बलौटे माटोमा पानी सोस्ने क्षमता बढाउँछ र चिम्ट्याइलो माटोलाई खुकुलो बनाउँछ।',
    });

    if (soil.ph !== null && soil.ph < 5.5) {
      tasks.push({
        id: 'task_w1_lime',
        weekNumber: 1,
        titleEn: 'Agricultural Lime Application',
        titleNe: 'कृषि चुन प्रयोग',
        category: 'fertilizer',
        priority: 'critical',
        instructionsEn: 'Broadcast agricultural lime across the field and mix it into the soil. Allow 3 weeks before sowing.',
        instructionsNe: 'अम्लीयपना घटाउन खेतभरि कृषि चुन छरेर माटोमा मिलाउनुहोस्। बीउ रोप्नुभन्दा ३ हप्ता अगावै यो कार्य गर्नुहोस्।',
        scientificReasonEn: `Soil pH is ${soil.ph}, below 5.5. Liming neutralizes toxic aluminum and unlocks fixed phosphorus.`,
        scientificReasonNe: `माटोको pH ${soil.ph} छ, जुन ५.५ भन्दा कम हो। चुनले अम्लीयपना घटाएर फस्फोरस लगायतका खाद्यतत्व बिरुवालाई उपलब्ध गराउँछ।`,
      });
    }

    tasks.push({
      id: 'task_w2_sowing',
      weekNumber: 2,
      titleEn: isLegume ? 'Seed Inoculation, Sowing & Basal Fertilizer' : 'Seed Sowing & Basal DAP/Potash Application',
      titleNe: isLegume ? 'बीउ उपचार, रोपाइँ र आधारभूत मल' : 'बीउ छर्ने तथा आधारभूत रासायनिक मल प्रयोग',
      category: 'planting',
      priority: 'critical',
      instructionsEn: isLegume
        ? 'Treat seed with Rhizobium inoculant if available, then sow in lines at the recommended spacing. Apply basal DAP and potash; legumes need little or no urea.'
        : 'Sow treated seeds in lines at recommended spacing. Apply the recommended basal dose of DAP and Muriate of Potash at sowing.',
      instructionsNe: isLegume
        ? 'उपलब्ध भए बीउलाई राइजोबियमले उपचार गरी सिफारिस दूरीमा लाइनमा रोप्नुहोस्। डीएपी र पोटास आधारभूत मलका रूपमा हाल्नुहोस्; कोसेबालीलाई युरिया थोरै वा नचाहिन सक्छ।'
        : 'उपचार गरिएको बीउलाई सिफारिस गरिएको दूरीमा लाइनमा रोप्नुहोस्। साथै डीएपी र पोटास मल बीउको छेउमा पर्ने गरी हाल्नुहोस्।',
      scientificReasonEn: isLegume
        ? 'Rhizobium bacteria on legume roots fix nitrogen from the air, so the crop feeds itself and the soil.'
        : 'Line sowing lets every plant catch sunlight and makes later weeding much easier.',
      scientificReasonNe: isLegume
        ? 'कोसेबालीको जरामा रहने राइजोबियम जीवाणुले हावाको नाइट्रोजन माटोमा जम्मा गर्छ।'
        : 'लाइनमा रोप्दा बिरुवाले पर्याप्त घाम पाउँछ र गोडमेल गर्न सजिलो हुन्छ।',
    });

    tasks.push({
      id: 'task_w3_germination',
      weekNumber: 3,
      titleEn: 'Germination Check & Gap Filling',
      titleNe: 'अङ्कुरण निरीक्षण र खाली ठाउँ भर्ने',
      category: 'monitoring',
      priority: 'recommended',
      instructionsEn:
        'Walk the field and re-sow any gaps. Keep the topsoil moist but not waterlogged; check the forecast again before irrigating.',
      instructionsNe: 'खेत घुमेर बीउ नउम्रेका ठाउँमा फेरि रोप्नुहोस्। माटोको सतह ओसिलो राख्नुहोस् तर पानी नजमाउनुहोस्; सिँचाइ गर्नुअघि पूर्वानुमान फेरि हेर्नुहोस्।',
      scientificReasonEn: 'An even plant stand early on decides yield; seedlings need moist but airy soil to root.',
      scientificReasonNe: 'सुरुमै बिरुवाको समान सङ्ख्याले उत्पादन निर्धारण गर्छ; जरा विकासका लागि चिस्यान र हावा दुवै चाहिन्छ।',
    });

    tasks.push(weedingTask(4, isLegume, splitNoteEn, splitNoteNe));
  }

  if (stage === 'growing') {
    tasks.push({
      id: 'task_w1_scouting',
      weekNumber: 1,
      titleEn: 'Pest & Disease Scouting',
      titleNe: 'कीरा र रोगको निरीक्षण',
      category: 'monitoring',
      priority: 'recommended',
      instructionsEn:
        'Check 10 plants in each corner and the centre of the plot, including leaf undersides. Remove badly affected plants and note what you see.',
      instructionsNe: 'खेतको चारै कुना र बीचमा १०-१० बिरुवा, पातको तल्लो भागसमेत जाँच्नुहोस्। धेरै बिग्रेका बिरुवा हटाउनुहोस् र देखेको कुरा टिप्नुहोस्।',
      scientificReasonEn: 'Pests and diseases caught early can be controlled with far less pesticide.',
      scientificReasonNe: 'कीरा र रोग सुरुमै पत्ता लागे थोरै विषादीले नै नियन्त्रण गर्न सकिन्छ।',
    });

    tasks.push(weedingTask(2, isLegume, splitNoteEn, splitNoteNe));

    const stages = crop.waterRequirement.criticalStages.join(', ');
    tasks.push({
      id: 'task_w3_critical_water',
      weekNumber: 3,
      titleEn: 'Water at Critical Growth Stages',
      titleNe: 'महत्त्वपूर्ण वृद्धि अवस्थामा पानी',
      category: 'irrigation',
      priority: 'recommended',
      instructionsEn: `This crop needs water most at: ${stages}. If the crop is at one of these stages, do not let the soil dry out${soil.irrigationAvailable ? '' : '; without irrigation, mulch and weed to save moisture'}.`,
      instructionsNe: `यो बालीलाई यी अवस्थामा सबैभन्दा बढी पानी चाहिन्छ: ${stages}। बाली यीमध्ये कुनै अवस्थामा छ भने माटो सुक्न नदिनुहोस्${soil.irrigationAvailable ? '' : '; सिँचाइ नभए छापो र गोडमेलले चिस्यान जोगाउनुहोस्'}।`,
      scientificReasonEn: 'Water stress at a critical stage causes yield loss that later watering cannot recover.',
      scientificReasonNe: 'महत्त्वपूर्ण अवस्थामा पानी नपुगे पछि सिँचाइ गरेर पनि उत्पादन फर्काउन सकिँदैन।',
    });

    tasks.push({
      id: 'task_w4_second_scouting',
      weekNumber: 4,
      titleEn: 'Second Scouting & Harvest Planning',
      titleNe: 'दोस्रो निरीक्षण र बाली भित्र्याउने योजना',
      category: 'monitoring',
      priority: 'optional',
      instructionsEn: `Repeat the pest check. Harvest usually falls in ${monthList(crop.calendar.harvestMonths, MONTHS_EN)}; arrange labour, drying space and storage sacks ahead of time.`,
      instructionsNe: `कीरा र रोगको जाँच दोहोर्‍याउनुहोस्। बाली सामान्यतया ${monthList(crop.calendar.harvestMonths, MONTHS_NE)} मा भित्र्याइन्छ; ज्यामी, सुकाउने ठाउँ र बोराको व्यवस्था अगावै मिलाउनुहोस्।`,
      scientificReasonEn: 'A crop harvested late or stored damp loses both quality and price.',
      scientificReasonNe: 'ढिलो भित्र्याएको वा ओसिलो भण्डारण गरिएको बालीको गुणस्तर र मूल्य दुवै घट्छ।',
    });
  }

  if (stage === 'harvest') {
    const isGrain = crop.category === 'cereal' || crop.category === 'legume' || crop.category === 'oilseed';
    tasks.push({
      id: 'task_w1_harvest',
      weekNumber: 1,
      titleEn: 'Harvest at Maturity',
      titleNe: 'पाकेपछि बाली भित्र्याउनुहोस्',
      category: 'harvest',
      priority: 'critical',
      instructionsEn: 'Harvest once the crop is mature, in the morning after the dew dries. Do not leave cut crop lying in the field overnight.',
      instructionsNe: 'बाली पाकेपछि बिहान शीत सुकेपछि काट्नुहोस्। काटेको बाली रातभर खेतमा नछोड्नुहोस्।',
      scientificReasonEn: 'Over-mature crops shatter, lodge or rot, and night moisture starts mould.',
      scientificReasonNe: 'धेरै पाकेको बाली झर्छ, ढल्छ वा कुहिन्छ, र रातिको ओसले ढुसी लगाउँछ।',
    });

    tasks.push({
      id: 'task_w2_storage',
      weekNumber: 2,
      titleEn: isGrain ? 'Drying & Safe Storage' : 'Grading & Cool Storage',
      titleNe: isGrain ? 'सुकाउने र सुरक्षित भण्डारण' : 'छनोट र चिसो भण्डारण',
      category: 'harvest',
      priority: 'critical',
      instructionsEn: isGrain
        ? 'Sun-dry on a tarpaulin or clean floor until the grain is hard when bitten (about 12-13% moisture). Store in clean, airtight bags or bins raised off the floor.'
        : 'Sort out damaged produce, keep the rest shaded and well ventilated, and sell or store quickly.',
      instructionsNe: isGrain
        ? 'दाना टोक्दा कडा नभएसम्म (करिब १२-१३% चिस्यान) त्रिपाल वा सफा भुइँमा घाममा सुकाउनुहोस्। सफा, हावा नछिर्ने बोरा वा भकारीमा भुइँभन्दा माथि राख्नुहोस्।'
        : 'बिग्रेका उपज छुट्याउनुहोस्, बाँकीलाई छहारी र हावा लाग्ने ठाउँमा राख्नुहोस्, र छिट्टै बेच्नुहोस् वा भण्डारण गर्नुहोस्।',
      scientificReasonEn: isGrain
        ? 'Grain stored damp grows mould and attracts storage insects.'
        : 'Damaged produce spreads rot to healthy produce, and heat speeds up spoilage.',
      scientificReasonNe: isGrain ? 'ओसिलो अन्नमा ढुसी लाग्छ र भण्डारणका कीरा लाग्छन्।' : 'बिग्रेको उपजले राम्रोलाई पनि कुहाउँछ, र गर्मीले छिटो बिगार्छ।',
    });

    tasks.push({
      id: 'task_w3_residue',
      weekNumber: 3,
      titleEn: 'Residue Management: Do Not Burn',
      titleNe: 'बालीको अवशेष व्यवस्थापन: नजलाउनुहोस्',
      category: 'soil_prep',
      priority: 'recommended',
      instructionsEn: 'Chop straw and stubble and plough it in, compost it, or keep it as mulch or fodder. Remove and destroy only diseased plants.',
      instructionsNe: 'पराल र ठुटा टुक्र्याएर माटोमा मिलाउनुहोस्, कम्पोस्ट बनाउनुहोस्, वा छापो र घाँसका रूपमा राख्नुहोस्। रोग लागेका बिरुवा मात्र हटाएर नष्ट गर्नुहोस्।',
      scientificReasonEn: 'Residue returns carbon and nutrients to the soil; burning wastes them and pollutes the air.',
      scientificReasonNe: 'अवशेषले माटोमा कार्बन र खाद्यतत्व फर्काउँछ; जलाउँदा ती खेर जान्छन् र वायु प्रदूषण हुन्छ।',
    });

    const next = crop.rotationBenefit.beforeCrop.map((id) => CROPS.find((c) => c.id === id)).filter((c): c is Crop => !!c);
    tasks.push({
      id: 'task_w4_next_crop',
      weekNumber: 4,
      titleEn: 'Plan the Next Crop',
      titleNe: 'अर्को बालीको योजना',
      category: 'planting',
      priority: 'recommended',
      instructionsEn: next.length
        ? `Good crops to follow ${crop.name}: ${next.map((c) => c.name).join(', ')}. Compare them in the Rotation Planner.`
        : 'Choose a crop from a different family for the next season. Compare options in the Rotation Planner.',
      instructionsNe: next.length
        ? `${crop.localName} पछि लगाउन उपयुक्त बाली: ${next.map((c) => c.localName).join(', ')}। बाली चक्र योजनामा तुलना गर्नुहोस्।`
        : 'अर्को सिजनका लागि फरक परिवारको बाली छान्नुहोस्। बाली चक्र योजनामा विकल्प तुलना गर्नुहोस्।',
      scientificReasonEn: crop.rotationBenefit.notes || 'Changing crop family breaks pest and disease cycles and balances soil nutrients.',
      scientificReasonNe: 'बालीको परिवार फेर्दा कीरा र रोगको चक्र टुट्छ र माटोको खाद्यतत्व सन्तुलित रहन्छ।',
    });
  }

  if (stage === 'off_season') {
    const nextSowing = crop.calendar.sowingMonths.find((m) => m > month) ?? crop.calendar.sowingMonths[0];
    tasks.push({
      id: 'task_w1_soil_test',
      weekNumber: 1,
      titleEn: 'Collect a Soil Sample for Testing',
      titleNe: 'माटो परीक्षणका लागि नमुना सङ्कलन',
      category: 'soil_prep',
      priority: 'recommended',
      instructionsEn: 'Take soil from 8-10 spots across the plot at 0-15 cm depth, mix it, and send about half a kilogram to the nearest soil testing lab.',
      instructionsNe: 'खेतका ८-१० ठाउँबाट ०-१५ से.मी. गहिराइको माटो निकालेर मिसाउनुहोस् र करिब आधा किलो नजिकको माटो परीक्षण प्रयोगशालामा पठाउनुहोस्।',
      scientificReasonEn: 'A soil test shows the real pH and nutrient levels, so you buy only the fertilizer and lime you need.',
      scientificReasonNe: 'माटो परीक्षणले वास्तविक pH र खाद्यतत्व देखाउँछ, जसले गर्दा चाहिने मल र चुन मात्र किन्न सकिन्छ।',
    });
    tasks.push({
      id: 'task_w2_compost',
      weekNumber: 2,
      titleEn: 'Prepare Compost or Sow a Green Manure',
      titleNe: 'कम्पोस्ट तयारी वा हरियो मल बाली',
      category: 'soil_prep',
      priority: 'recommended',
      instructionsEn: 'Start a compost pit with crop residue and manure, or sow a quick green manure such as dhaincha and plough it in before the next crop.',
      instructionsNe: 'बालीको अवशेष र गोबरले कम्पोस्ट खाडल सुरु गर्नुहोस्, वा ढैँचा जस्तो छिटो बढ्ने हरियो मल बाली छरेर अर्को बालीअघि जोतेर मिलाउनुहोस्।',
      scientificReasonEn: 'Bare fallow soil loses organic matter; compost and green manure rebuild it for free.',
      scientificReasonNe: 'खाली बाँझो माटोले प्राङ्गारिक पदार्थ गुमाउँछ; कम्पोस्ट र हरियो मलले त्यो निःशुल्क फर्काउँछ।',
    });
    tasks.push({
      id: 'task_w3_inputs',
      weekNumber: 3,
      titleEn: 'Arrange Seed & Inputs',
      titleNe: 'बीउ र सामग्रीको व्यवस्था',
      category: 'planting',
      priority: 'recommended',
      instructionsEn: `Sowing for ${crop.name} opens in ${MONTHS_EN[nextSowing - 1]}. Buy certified seed and fertilizer early, and test old seed for germination on damp cloth.`,
      instructionsNe: `${crop.localName} रोप्ने समय ${MONTHS_NE[nextSowing - 1]} मा सुरु हुन्छ। प्रमाणित बीउ र मल अगावै किन्नुहोस्, र पुरानो बीउ भिजेको कपडामा राखेर उम्रने क्षमता जाँच्नुहोस्।`,
      scientificReasonEn: 'Certified seed gives an even stand, and inputs are cheaper and easier to find before the season rush.',
      scientificReasonNe: 'प्रमाणित बीउ समान रूपमा उम्रन्छ, र सिजन सुरु हुनुअघि सामग्री सस्तो र सजिलै पाइन्छ।',
    });
    tasks.push({
      id: 'task_w4_repairs',
      weekNumber: 4,
      titleEn: 'Repair Bunds, Terraces & Channels',
      titleNe: 'आली, गरा र कुलो मर्मत',
      category: 'protection',
      priority: 'optional',
      instructionsEn: 'Rebuild broken bunds and terrace walls and clear irrigation and drainage channels while the field is empty.',
      instructionsNe: 'खेत खाली भएको बेला भत्केका आली र गराका पर्खाल बनाउनुहोस् र सिँचाइ तथा निकासका कुलो सफा गर्नुहोस्।',
      scientificReasonEn: 'Sound bunds and channels hold water where it is needed and carry off the excess in heavy rain.',
      scientificReasonNe: 'बलिया आली र कुलोले चाहिएको ठाउँमा पानी अड्याउँछन् र भारी वर्षामा बढी पानी बगाउँछन्।',
    });
  }

  const rainEn = forecast ? `the 7-day forecast (${Math.round(forecast.summary.totalRainNext7Days)} mm rain)` : 'no live forecast';
  const rainNe = forecast ? `७ दिनको पूर्वानुमान (${Math.round(forecast.summary.totalRainNext7Days)} मि.मि. वर्षा)` : 'प्रत्यक्ष पूर्वानुमान उपलब्ध छैन';

  return {
    cropId,
    generatedDate: today.toISOString().split('T')[0],
    stage,
    currentSeasonalPhaseEn: STAGE_LABELS[stage].en,
    currentSeasonalPhaseNe: STAGE_LABELS[stage].ne,
    weeklyTasks: tasks,
    operationalSummaryEn: `Plan for ${crop.name} in ${MONTHS_EN[month - 1]}. Week 1 uses ${rainEn}; weeks 2-4 follow the crop calendar, so check again each week.`,
    operationalSummaryNe: `${MONTHS_NE[month - 1]} महिनामा ${crop.localName} का लागि योजना। पहिलो हप्तामा ${rainNe} प्रयोग गरिएको छ; हप्ता २-४ बाली पात्रोअनुसार छन्, त्यसैले प्रत्येक हप्ता फेरि हेर्नुहोस्।`,
  };
}

function monthList(months: number[], names: string[]): string {
  return months.map((m) => names[m - 1]).join(', ');
}

function weedingTask(weekNumber: 2 | 4, isLegume: boolean, splitNoteEn: string, splitNoteNe: string): ActionTask {
  return {
    id: `task_w${weekNumber}_weeding_topdress`,
    weekNumber,
    titleEn: isLegume ? 'Weeding & Root Nodule Check' : 'Weeding & Urea Top-Dressing',
    titleNe: isLegume ? 'गोडमेल र जराको गिर्खा जाँच' : 'गोडमेल र युरिया मलको टप-ड्रेसिङ',
    category: 'fertilizer',
    priority: 'recommended',
    instructionsEn: isLegume
      ? 'Weed thoroughly. Pull up one plant and cut a root nodule: pink or red inside means it is fixing nitrogen, so no urea is needed.'
      : `Weed thoroughly, then top-dress one-fourth of the total urea requirement into moist soil.${splitNoteEn}`,
    instructionsNe: isLegume
      ? 'राम्ररी गोडमेल गर्नुहोस्। एउटा बिरुवा उखेलेर जराको गिर्खा काट्नुहोस्: भित्र गुलाबी वा रातो भए नाइट्रोजन जम्मा भइरहेको छ, युरिया चाहिँदैन।'
      : `झारपात उखेलेर सफा गर्नुहोस् र माटोमा चिस्यान छँदै युरिया मलको एक चौथाइ भाग छर्नुहोस्।${splitNoteNe}`,
    scientificReasonEn: isLegume
      ? 'Active nodules supply the crop with nitrogen; adding urea switches them off and wastes money.'
      : 'Weeds compete hard for nitrogen and sunlight during early growth, and urea on dry soil is lost to the air.',
    scientificReasonNe: isLegume
      ? 'सक्रिय गिर्खाले बालीलाई नाइट्रोजन दिन्छ; युरिया थप्दा तिनले काम गर्न छोड्छन् र पैसा खेर जान्छ।'
      : 'सुरुवाती वृद्धिमा झारले बालीको खाद्यतत्व र प्रकाश खोस्छ, र सुक्खा माटोमा हालेको युरिया हावामा उड्छ।',
  };
}

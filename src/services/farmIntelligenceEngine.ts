// ============================================================
// Farm Intelligence & Recommendation Engine
// Converts satellite observations (SMAP, GPM, MODIS, NASA POWER)
// and multi-day weather predictions into actionable, transparent farming advice.
// ============================================================

import type { ClimateDataset } from '../types';
import type { WeatherForecastData } from './weatherForecast';

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'positive';
export type InsightCategory = 'irrigation' | 'drainage' | 'flood' | 'drought' | 'heat_stress' | 'disease_risk' | 'field_work';

export interface ActionableInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  titleEn: string;
  titleNe: string;
  descriptionEn: string;
  descriptionNe: string;
  recommendedActionEn: string;
  recommendedActionNe: string;
  evidence: {
    indicatorEn: string;
    indicatorNe: string;
    observedValue: string;
    threshold: string;
    source: string;
  };
}

export interface FarmIntelligenceReport {
  overallRisk: 'low' | 'moderate' | 'high' | 'severe';
  riskScore: number; // 0 - 100
  summaryEn: string;
  summaryNe: string;
  insights: ActionableInsight[];
  soilMoistureStatus: {
    statusEn: 'Dry / Moisture Deficit' | 'Optimal Field Capacity' | 'Excess Wetness / Waterlogged';
    statusNe: 'सुक्खा / ओसको कमी' | 'उचित चिस्यान (पर्याप्त)' | 'अत्यधिक ओसिलो / पानी जमेको';
    surfaceFraction: number; // 0 - 1
    rootZoneFraction: number; // 0 - 1
  };
  temperatureStatus: {
    heatStressDaysNextWeek: number;
    frostRiskNextWeek: boolean;
    maxForecastTemp: number;
    minForecastTemp: number;
  };
  precipitationStatus: {
    recentAccumulationMm: number;
    forecastNext7DaysMm: number;
    heavyRainDays: number;
  };
  floodEarlyWarning: {
    level: 'safe' | 'advisory' | 'warning' | 'critical';
    titleEn: string;
    titleNe: string;
    messageEn: string;
    messageNe: string;
    saturationPct: number;
    forecastRainMm: number;
  };
}

export function generateFarmIntelligenceReport(
  climateData: ClimateDataset | null,
  forecast: WeatherForecastData | null,
  cropName?: string,
  soilType?: string
): FarmIntelligenceReport {
  const insights: ActionableInsight[] = [];
  let riskScore = 15;

  // 1. Evaluate Soil Moisture from NASA POWER observations or forecast fallback
  // In NASA POWER, GWETTOP is surface soil wetness (0-1 fraction)
  const recentDays = climateData?.daily.slice(-30) || [];
  const latestDay = recentDays.length > 0 ? recentDays[recentDays.length - 1] : null;

  const surfaceWetness = latestDay?.soilMoistureSurface ?? (forecast?.daily[0]?.soilMoisture0to1cm ? forecast.daily[0].soilMoisture0to1cm * 2.2 : 0.45);
  const rootZoneWetness = latestDay?.soilMoistureRootZone ?? (forecast?.daily[0]?.soilMoisture3to9cm ? forecast.daily[0].soilMoisture3to9cm * 2.0 : 0.50);

  let soilStatusEn: 'Dry / Moisture Deficit' | 'Optimal Field Capacity' | 'Excess Wetness / Waterlogged' = 'Optimal Field Capacity';
  let soilStatusNe: 'सुक्खा / ओसको कमी' | 'उचित चिस्यान (पर्याप्त)' | 'अत्यधिक ओसिलो / पानी जमेको' = 'उचित चिस्यान (पर्याप्त)';

  if (surfaceWetness < 0.28 || rootZoneWetness < 0.32) {
    soilStatusEn = 'Dry / Moisture Deficit';
    soilStatusNe = 'सुक्खा / ओसको कमी';
    riskScore += 25;

    insights.push({
      id: 'irrigation_deficit',
      category: 'irrigation',
      severity: surfaceWetness < 0.20 ? 'critical' : 'warning',
      titleEn: 'Soil Moisture Deficit Detected',
      titleNe: 'माटोमा चिस्यानको कमी (सिँचाइ आवश्यकता)',
      descriptionEn: `Root-zone soil wetness is low at ${(rootZoneWetness * 100).toFixed(0)}%. Crops may experience water stress and reduced nutrient uptake.`,
      descriptionNe: `जरा क्षेत्रको माटोमा चिस्यान ${(rootZoneWetness * 100).toFixed(0)}% मात्र छ। बालीमा पानीको अभाव भएर वृद्धि रोकिन सक्छ।`,
      recommendedActionEn: 'Schedule light irrigation during early morning or late afternoon to prevent evaporation losses. Apply mulch if available.',
      recommendedActionNe: 'बिहान सबेरै वा साँझपख हल्का सिँचाइ गर्नुहोस् ताकि पानी बाफिएर खेर नजाओस्। सम्भव भए छापो (मल्च) प्रयोग गर्नुहोस्।',
      evidence: {
        indicatorEn: 'Root-Zone Wetness',
        indicatorNe: 'जरा क्षेत्रको चिस्यान',
        observedValue: `${(rootZoneWetness * 100).toFixed(0)}%`,
        threshold: '< 32% (wilting margin)',
        source: 'NASA SMAP / MERRA-2 Land Model via NASA POWER',
      },
    });
  } else if (surfaceWetness > 0.82 || rootZoneWetness > 0.85) {
    soilStatusEn = 'Excess Wetness / Waterlogged';
    soilStatusNe = 'अत्यधिक ओसिलो / पानी जमेको';
    riskScore += 20;

    insights.push({
      id: 'soil_waterlogged',
      category: 'drainage',
      severity: 'warning',
      titleEn: 'High Soil Saturation / Waterlogging Alert',
      titleNe: 'माटो अत्यधिक ओसिलो / पानी जम्ने जोखिम',
      descriptionEn: `Surface soil wetness is at ${(surfaceWetness * 100).toFixed(0)}%. Root aeration may be restricted, increasing root rot risks.`,
      descriptionNe: `सतहको चिस्यान ${(surfaceWetness * 100).toFixed(0)}% पुगेको छ। जरामा हावा नछिरेर सड्ने जोखिम हुनसक्छ।`,
      recommendedActionEn: 'Ensure clear drainage furrows around the plot. Avoid heavy equipment on wet soil to prevent compaction.',
      recommendedActionNe: 'खेतमा निकासका नालीहरू सफा राख्नुहोस् ताकि पानी नजमोस्। हिलो माटोमा भारी मेसिन नलगाउनुहोस्।',
      evidence: {
        indicatorEn: 'Surface Soil Wetness',
        indicatorNe: 'सतहको चिस्यान',
        observedValue: `${(surfaceWetness * 100).toFixed(0)}%`,
        threshold: '> 82% (field saturation)',
        source: 'NASA SMAP / MERRA-2 Land Model',
      },
    });
  } else {
    insights.push({
      id: 'soil_optimal',
      category: 'irrigation',
      severity: 'positive',
      titleEn: 'Optimal Soil Moisture Conditions',
      titleNe: 'माटोको चिस्यान अवस्था सन्तोषजनक',
      descriptionEn: `Soil moisture is at ${(rootZoneWetness * 100).toFixed(0)}%, within healthy field capacity for crop root development.`,
      descriptionNe: `माटोमा चिस्यान ${(rootZoneWetness * 100).toFixed(0)}% छ, जुन बालीको जरा विकास र पोषणका लागि उपयुक्त छ।`,
      recommendedActionEn: 'Maintain current moisture levels. Hold off unneeded irrigation to conserve water.',
      recommendedActionNe: 'हालको सिँचाइ रोक्नुहोस् र अनावश्यक पानी बचत गर्नुहोस्।',
      evidence: {
        indicatorEn: 'Root-Zone Wetness',
        indicatorNe: 'जरा क्षेत्रको चिस्यान',
        observedValue: `${(rootZoneWetness * 100).toFixed(0)}%`,
        threshold: '35% - 80% (optimal)',
        source: 'NASA SMAP Model Data',
      },
    });
  }

  // 2. Evaluate Weather Forecast, SMAP Pre-Storm Soil Saturation & Flood Warnings
  const totalForecastRain = forecast?.summary.totalRainNext7Days ?? 0;
  const rainyDays = forecast?.summary.rainyDaysCount ?? 0;
  const heavyRainDay = forecast?.daily.find((d) => d.precipitationSum >= 25);
  const anyModerateRain = forecast?.daily.some((d) => d.precipitationSum >= 15);

  // NASA SMAP Flood Early Warning Principle:
  // "SMAP high fidelity measurements of soil moisture improve flood warnings by assessing how wet the soil is before a rainstorm."
  if ((surfaceWetness > 0.70 || rootZoneWetness > 0.72) && (heavyRainDay || (anyModerateRain && totalForecastRain >= 30))) {
    riskScore += 35;
    insights.push({
      id: 'smap_flash_flood_warning',
      category: 'flood',
      severity: 'critical',
      titleEn: 'SMAP Pre-Storm Soil Saturation: High Flash Flood Warning',
      titleNe: 'नासा SMAP पूर्व-तूफान माटो संतृप्ति: तीव्र बाढी र कटान चेतावनी',
      descriptionEn: `Soil is already near saturation (${(surfaceWetness * 100).toFixed(0)}% surface wetness) prior to incoming rainfall (${totalForecastRain.toFixed(0)} mm next 7 days). Rainwater cannot infiltrate the saturated ground, causing immediate high-velocity surface runoff, flash flooding, and soil erosion.`,
      descriptionNe: `आगामी वर्षा सुरु हुनुअगावै माटो पहिल्यै उच्च ओसिलो (${(surfaceWetness * 100).toFixed(0)}%) छ। पानी जमिनमुनि सोसिन नसक्दा तत्काल तीव्र बहावको बाढी आउने, कान्ला भत्किने र माटो बगाउने उच्च जोखिम छ।`,
      recommendedActionEn: 'Move machinery and vulnerable livestock to elevated ground immediately. Unblock all field diversion canals. Secure terraced bunds against collapse.',
      recommendedActionNe: 'कृषि औजार र वस्तुभाउ तत्काल सुरक्षित अग्लो स्थानमा सार्नुहोस्। मुख्य निकासका नाली र कुलाहरू तुरुन्त खोल्नुहोस्। गराका डिलहरू बलियो बनाउनुहोस्।',
      evidence: {
        indicatorEn: 'Pre-Storm SMAP Saturation + Forecast Rain',
        indicatorNe: 'वर्षापूर्व SMAP चिस्यान + वर्षा पूर्वानुमान',
        observedValue: `${(surfaceWetness * 100).toFixed(0)}% wetness + ${totalForecastRain.toFixed(0)} mm rain`,
        threshold: 'Surface Wetness > 70% with Rain Forecast >= 30 mm',
        source: 'NASA SMAP Level-4 Soil Moisture + Numerical Prediction',
      },
    });
  } else if (heavyRainDay) {
    riskScore += 25;
    insights.push({
      id: 'heavy_rain_warning',
      category: 'flood',
      severity: 'warning',
      titleEn: `Heavy Rainfall Advisory on ${heavyRainDay.date}`,
      titleNe: `${heavyRainDay.date} मा भारी वर्षाको सतर्कता`,
      descriptionEn: `Forecast indicates ${heavyRainDay.precipitationSum.toFixed(0)} mm rain on ${heavyRainDay.date}. Risk of local waterlogging in low-lying plots.`,
      descriptionNe: `${heavyRainDay.date} का दिन लगभग ${heavyRainDay.precipitationSum.toFixed(0)} मि.मि. वर्षा हुने देखिन्छ। होचो जमिनमा पानी जम्ने सम्भावना छ।`,
      recommendedActionEn: 'Clear field drainage channels today. Delay fertilizer and pesticide spraying to prevent runoff wash-off.',
      recommendedActionNe: 'आजै निकासका नाली सफा गर्नुहोस्। वर्षाले बगाउने भएकाले मलखाद वा विषादी छर्कन केही दिन रोक्नुहोस्।',
      evidence: {
        indicatorEn: 'Daily Precipitation Forecast',
        indicatorNe: 'दैनिक वर्षा पूर्वानुमान',
        observedValue: `${heavyRainDay.precipitationSum.toFixed(1)} mm`,
        threshold: '>= 25 mm/day',
        source: 'Open-Meteo Numerical Weather Prediction',
      },
    });
  } else if (totalForecastRain > 40) {
    insights.push({
      id: 'moderate_rain_ahead',
      category: 'field_work',
      severity: 'info',
      titleEn: `Favorable Monsoon/Rainfall Ahead (${totalForecastRain} mm)`,
      titleNe: `पर्याप्त वर्षाको सम्भावना (आगामी ७ दिनमा ${totalForecastRain} मि.मि.)`,
      descriptionEn: `Good soil recharging expected over the next 7 days across ${rainyDays} rainy days.`,
      descriptionNe: `आगामी ७ दिनमा लगभग ${totalForecastRain} मि.मि. वर्षा हुने भएकाले माटोमा प्राकृतिक चिस्यान भरिनेछ।`,
      recommendedActionEn: 'Harvest mature vegetables or grains before prolonged rains start if already ripe.',
      recommendedActionNe: 'पाकिसकेको बाली भए झरी सुरु हुनु अगावै भित्र्याउनुहोस्।',
      evidence: {
        indicatorEn: '7-Day Accumulated Rain',
        indicatorNe: '७ दिने कुल वर्षा',
        observedValue: `${totalForecastRain} mm`,
        threshold: '> 40 mm',
        source: 'ECMWF / DWD Numerical Blend',
      },
    });
  } else if (totalForecastRain < 3 && surfaceWetness < 0.35) {
    riskScore += 15;
    insights.push({
      id: 'dry_spell_window',
      category: 'irrigation',
      severity: 'warning',
      titleEn: 'Dry Spell Expected in Next 7 Days',
      titleNe: 'आगामी ७ दिन सुक्खा रहने सम्भावना',
      descriptionEn: `Less than 3 mm of rain is predicted over the coming week with dry surface soil.`,
      descriptionNe: `आगामी साता ३ मि.मि. भन्दा कम पानी पर्ने र माटो सुक्खा रहने देखिन्छ।`,
      recommendedActionEn: 'Plan supplementary irrigation cycles now before crops show leaf-wilting signs.',
      recommendedActionNe: 'बाली ओइलाउनु अगावै समयमै सिँचाइको प्रबन्ध मिलाउनुहोस्।',
      evidence: {
        indicatorEn: '7-Day Precipitation Sum',
        indicatorNe: '७ दिने वर्षा',
        observedValue: `${totalForecastRain} mm`,
        threshold: '< 5 mm',
        source: 'Open-Meteo Weather Forecast',
      },
    });
  }

  // 3. Evaluate Temperature & Heat/Cold Stress
  const maxTemp = forecast?.summary.highestTemp ?? latestDay?.tempMax ?? 28;
  const minTemp = forecast?.summary.lowestTemp ?? latestDay?.tempMin ?? 15;
  const surfaceTemp = latestDay?.surfaceTemp ?? maxTemp;

  if (maxTemp >= 34 || surfaceTemp >= 38) {
    riskScore += 20;
    insights.push({
      id: 'heat_stress_alert',
      category: 'heat_stress',
      severity: 'critical',
      titleEn: 'Thermal Heat Stress Alert',
      titleNe: 'उच्च तापक्रम तथा तापीय तनावको जोखिम',
      descriptionEn: `Maximum air temperature reaches ${maxTemp.toFixed(1)}°C with elevated surface skin temperature (${surfaceTemp.toFixed(1)}°C). High risk of flower drop and pollen sterility.`,
      descriptionNe: `हावाको तापक्रम ${maxTemp.toFixed(1)}°C र जमिनको सतहको तापक्रम ${surfaceTemp.toFixed(1)}°C पुगेको छ। यसले फूल झर्ने र परागकण सुक्ने समस्या ल्याउन सक्छ।`,
      recommendedActionEn: 'Provide frequent light irrigation during early mornings to lower microclimate temperature. Erect shade netting for sensitive seedlings.',
      recommendedActionNe: 'बिहानपख हल्का सिँचाइ गरेर खेतको तापक्रम घटाउनुहोस्। संवेदनशील तरकारी बेर्नालाई जाली वा छाप्रोको व्यवस्था गर्नुहोस्।',
      evidence: {
        indicatorEn: 'Max Air / Land Surface Temp',
        indicatorNe: 'अधिकतम हावा / जमिन तापक्रम',
        observedValue: `${maxTemp}°C / ${surfaceTemp.toFixed(1)}°C`,
        threshold: '>= 34°C air / >= 38°C surface',
        source: 'NASA MODIS Land Surface Temp & Forecast',
      },
    });
  } else if (minTemp <= 4) {
    riskScore += 25;
    insights.push({
      id: 'frost_risk_alert',
      category: 'heat_stress',
      severity: 'critical',
      titleEn: 'Frost / Cold Injury Risk Alert',
      titleNe: 'तुसारो / अत्यधिक चिसोको जोखिम',
      descriptionEn: `Night temperatures projected to dip near ${minTemp.toFixed(1)}°C. High risk of frost damage to young vegetable shoots.`,
      descriptionNe: `रातिको न्यूनतम तापक्रम ${minTemp.toFixed(1)}°C सम्म झर्ने देखिन्छ। कलिला तरकारीका मुनामा तुसारो पर्ने खतरा छ।`,
      recommendedActionEn: 'Irrigate fields in the late evening to release latent heat overnight, or cover delicate nursery beds with plastic or straw.',
      recommendedActionNe: 'साँझपख खेतमा हल्का पानी हाल्नुहोस् जसले जमिनलाई तातो राख्न मद्दत गर्छ, वा बेर्नालाई पराल/प्लास्टिकले ढाक्नुहोस्।',
      evidence: {
        indicatorEn: 'Min Forecast Temperature',
        indicatorNe: 'न्यूनतम तापक्रम',
        observedValue: `${minTemp}°C`,
        threshold: '<= 4°C',
        source: 'Numerical Temperature Model',
      },
    });
  }

  // 4. Disease & Humidity Risk
  const currentHumidity = forecast?.current.relativeHumidity ?? latestDay?.humidity ?? 65;
  if (currentHumidity > 85 && (forecast?.current.temperature ?? 22) > 20) {
    insights.push({
      id: 'fungal_disease_risk',
      category: 'disease_risk',
      severity: 'warning',
      titleEn: 'High Fungal Disease & Blight Risk',
      titleNe: 'ढुसीजन्य रोग तथा डढुवाको जोखिम',
      descriptionEn: `High relative humidity (${currentHumidity}%) combined with warm temperature creates favorable conditions for blast, rust, and blight pathogens.`,
      descriptionNe: `उच्च हावाको आद्रता (${currentHumidity}%) र तातो मौसमले ढुसी, खिया र डढुवा रोग फैलन अनुकूल वातावरण बनाएको छ।`,
      recommendedActionEn: 'Inspect crop underside leaves regularly. Ensure adequate crop row spacing for airflow. Keep organic fungicides (Trichoderma) ready.',
      recommendedActionNe: 'पातको मुनि ढुसी लागेको छ कि नियमित जाँच्नुहोस्। बिरुवाहरूबीच हावा आवतजावत हुने खाली ठाउँ राख्नुहोस् र जैविक ढुसीनाशक तयारी अवस्थामा राख्नुहोस्।',
      evidence: {
        indicatorEn: 'Relative Humidity',
        indicatorNe: 'सापेक्षित आद्रता',
        observedValue: `${currentHumidity}%`,
        threshold: '> 85% with Temp > 20°C',
        source: 'NASA POWER AG / Sensor Observation',
      },
    });
  }

  // Determine overall risk level
  const clampedScore = Math.min(100, Math.max(5, riskScore));
  let overallRisk: 'low' | 'moderate' | 'high' | 'severe' = 'low';
  if (clampedScore >= 70) overallRisk = 'severe';
  else if (clampedScore >= 50) overallRisk = 'high';
  else if (clampedScore >= 30) overallRisk = 'moderate';

  const summaryEn = `Agro-environmental risk level is ${overallRisk.toUpperCase()} (${clampedScore}/100). ${insights.length} active advisories identified based on NASA satellite observations and regional numerical weather forecast.`;
  const summaryNe = `कृषि-वातावरणीय जोखिम स्तर: ${overallRisk === 'low' ? 'न्यून' : overallRisk === 'moderate' ? 'मध्यम' : overallRisk === 'high' ? 'उच्च' : 'गम्भीर'} (${clampedScore}/१००)। नासा उपग्रह तथ्याङ्क र मौसम पूर्वानुमानका आधारमा ${insights.length} वटा व्यावहारिक सुझावहरू तयार पारिएका छन्।`;

  return {
    overallRisk,
    riskScore: clampedScore,
    summaryEn,
    summaryNe,
    insights,
    soilMoistureStatus: {
      statusEn: soilStatusEn,
      statusNe: soilStatusNe,
      surfaceFraction: surfaceWetness,
      rootZoneFraction: rootZoneWetness,
    },
    temperatureStatus: {
      heatStressDaysNextWeek: forecast?.daily.filter((d) => d.tempMax >= 34).length ?? 0,
      frostRiskNextWeek: (forecast?.daily.filter((d) => d.tempMin <= 4).length ?? 0) > 0,
      maxForecastTemp: maxTemp,
      minForecastTemp: minTemp,
    },
    precipitationStatus: {
      recentAccumulationMm: forecast?.summary.recent30DaysRainfall ?? recentDays.reduce((acc, d) => acc + (d.precipitation || 0), 0),
      forecastNext7DaysMm: totalForecastRain,
      heavyRainDays: forecast?.daily.filter((d) => d.precipitationSum >= 25).length ?? 0,
    },
    floodEarlyWarning: (() => {
      const satPct = Math.round(surfaceWetness * 100);
      const isSaturated = surfaceWetness > 0.70 || rootZoneWetness > 0.72;
      const hasHeavyRain = !!heavyRainDay;
      const significantRainOnSaturatedSoil = isSaturated && (hasHeavyRain || (anyModerateRain && totalForecastRain >= 30));

      if (significantRainOnSaturatedSoil) {
        return {
          level: 'critical' as const,
          titleEn: 'Flash Flood Warning — Saturated Soil + Heavy Rain',
          titleNe: 'तीव्र बाढी चेतावनी — माटो संतृप्त + भारी वर्षा',
          messageEn: `Soil is already ${satPct}% saturated. Incoming rainfall (${totalForecastRain.toFixed(0)} mm over 7 days) cannot infiltrate, creating high flash-flood and erosion risk.`,
          messageNe: `माटो पहिल्यै ${satPct}% ओसिलो छ। आगामी ७ दिनमा ${totalForecastRain.toFixed(0)} मि.मि. वर्षाले पानी जमिनमुनि सोसिन नसक्दा तीव्र बाढी र भू-क्षय हुने उच्च जोखिम छ।`,
          saturationPct: satPct,
          forecastRainMm: totalForecastRain,
        };
      } else if (hasHeavyRain) {
        return {
          level: 'warning' as const,
          titleEn: 'Heavy Rainfall Warning — Localized Flood Risk',
          titleNe: 'भारी वर्षा चेतावनी — स्थानीय बाढीको जोखिम',
          messageEn: `A day with ${heavyRainDay!.precipitationSum.toFixed(0)} mm rainfall is forecast. Low-lying fields may experience waterlogging.`,
          messageNe: `${heavyRainDay!.precipitationSum.toFixed(0)} मि.मि. भारी वर्षा हुने दिन छ। होचो जमिनमा पानी जम्ने सम्भावना छ।`,
          saturationPct: satPct,
          forecastRainMm: totalForecastRain,
        };
      } else if (totalForecastRain > 40) {
        return {
          level: 'advisory' as const,
          titleEn: 'Moderate Rainfall Advisory',
          titleNe: 'मध्यम वर्षा सतर्कता',
          messageEn: `Accumulated rainfall of ${totalForecastRain.toFixed(0)} mm expected over 7 days. Monitor drainage and field conditions.`,
          messageNe: `आगामी ७ दिनमा जम्मा ${totalForecastRain.toFixed(0)} मि.मि. वर्षा अपेक्षित छ। निकास र खेतको अवस्था निगरानी गर्नुहोस्।`,
          saturationPct: satPct,
          forecastRainMm: totalForecastRain,
        };
      } else {
        return {
          level: 'safe' as const,
          titleEn: 'No Flood Risk Detected',
          titleNe: 'बाढीको जोखिम छैन',
          messageEn: 'Current soil moisture and forecast precipitation are within safe limits.',
          messageNe: 'हालको माटोको चिस्यान र वर्षा पूर्वानुमान सुरक्षित सीमाभित्र छ।',
          saturationPct: satPct,
          forecastRainMm: totalForecastRain,
        };
      }
    })(),
  };
}

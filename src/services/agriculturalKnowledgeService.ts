// ============================================================
// FarmShift Nepal — Agricultural Knowledge & Document Ingestion
// Indexed knowledge repository from NARC, MoALD, and FAO
// ============================================================

export interface DocumentPassage {
  id: string;
  sourceId: string;
  sourceTitle: string;
  institution: 'NARC' | 'MoALD' | 'FAO' | 'CIMMYT' | 'IRRI';
  publicationYear: number;
  url: string;
  cropTags: string[];
  topicTags: ('soil' | 'fertilizer' | 'water' | 'disease' | 'climate' | 'planting')[];
  districtApplicability: string[];
  contentEn: string;
  contentNe: string;
  safetyCaution?: string;
}

export interface DocumentSource {
  id: string;
  title: string;
  titleNe: string;
  institution: string;
  publicationYear: number;
  officialUrl: string;
  description: string;
}

export const TRUSTED_SOURCES: DocumentSource[] = [
  {
    id: 'narc_nrrp_2022',
    title: 'Rice Production Technology and Variety Release Guide',
    titleNe: 'धान उत्पादन प्रविधि तथा जात सिफारिस निर्देशिका',
    institution: 'National Rice Research Program (NRRP) / NARC',
    publicationYear: 2022,
    officialUrl: 'https://narc.gov.np/rice-technology',
    description: 'Comprehensive guidelines for transplanted and direct-seeded rice in Terai and Mid-hills.',
  },
  {
    id: 'narc_nwrp_2023',
    title: 'Wheat Agronomy & Nutrient Management Manual',
    titleNe: 'गहुँ बालीको उत्पादन प्रविधि तथा मलखाद व्यवस्थापन',
    institution: 'National Wheat Research Program (NWRP) / NARC',
    publicationYear: 2023,
    officialUrl: 'https://narc.gov.np/wheat-research',
    description: 'Optimal sowing windows, terminal heat stress mitigation, and balanced NPK fertilizer guidance.',
  },
  {
    id: 'narc_nglrp_2021',
    title: 'Grain Legumes (Lentil, Chickpea & Soybean) Cultivation Bulletin',
    titleNe: 'दलहन बाली (मसुरो, चना, भटमास) खेती प्रविधि',
    institution: 'National Grain Legumes Research Program (NGLRP) / NARC',
    publicationYear: 2021,
    officialUrl: 'https://narc.gov.np/grain-legumes',
    description: 'Biological nitrogen fixation, Rhizobium inoculation, and winter pulse water conservation.',
  },
  {
    id: 'moald_fertilizer_guideline_2022',
    title: 'National Fertilizer Recommendation & Soil Test Interpretation Guideline',
    titleNe: 'राष्ट्रिय मलखाद सिफारिस तथा माटो परीक्षण व्याख्या निर्देशिका',
    institution: 'Ministry of Agriculture and Livestock Development (MoALD)',
    publicationYear: 2022,
    officialUrl: 'https://moald.gov.np/soil-management',
    description: 'Official Nepal government recommended NPK doses per Ropani and Bigha for major crops.',
  },
  {
    id: 'fao_nepal_climate_resilience',
    title: 'Climate-Smart Crop Rotations in the Eastern Gangetic Plains',
    titleNe: 'जलवायु-अनुकूल बाली चक्र तथा माटो संरक्षण',
    institution: 'FAO & CIMMYT Nepal',
    publicationYear: 2023,
    officialUrl: 'https://www.fao.org/nepal/resources',
    description: 'Zero tillage, residue retention, and legume-cereal rotations to withstand erratic monsoons.',
  },
];

export const KNOWLEDGE_PASSAGES: DocumentPassage[] = [
  {
    id: 'pass_rice_transplanting_01',
    sourceId: 'narc_nrrp_2022',
    sourceTitle: 'Rice Production Technology Guide (NARC)',
    institution: 'NARC',
    publicationYear: 2022,
    url: 'https://narc.gov.np/rice-technology',
    cropTags: ['rice-transplanted', 'rice-direct-seeded'],
    topicTags: ['planting', 'water'],
    districtApplicability: ['Chitwan', 'Rupandehi', 'Jhapa', 'Morang', 'Kathmandu'],
    contentEn:
      'Seedling age at transplanting should be 21 to 25 days for medium-duration varieties. In areas where monsoon onset is delayed, direct-seeded rice (DSR) using zero-tillage saves 20-30% irrigation water and avoids nursery mortality.',
    contentNe:
      'मध्यम अवधिका जातहरूको लागि बीउ उम्रेको २१ देखि २५ दिनमा रोपाईं गर्नुपर्छ। मनसुन ढिला भएको अवस्थामा शून्य जोताई प्रविधिबाट सिधै छर्ने धान (DSR) खेती गर्दा २०-३०% सिंचाइ पानीको बचत हुन्छ।',
    safetyCaution: 'Do not transplant older seedlings (>30 days) as tillering capacity drops drastically.',
  },
  {
    id: 'pass_wheat_heat_stress_02',
    sourceId: 'narc_nwrp_2023',
    sourceTitle: 'Wheat Agronomy & Nutrient Management Manual',
    institution: 'NARC',
    publicationYear: 2023,
    url: 'https://narc.gov.np/wheat-research',
    cropTags: ['wheat'],
    topicTags: ['climate', 'planting'],
    districtApplicability: ['Chitwan', 'Rupandehi', 'Bara', 'Parsa', 'Banke'],
    contentEn:
      'In the Terai region, sowing wheat after December 15 exposes the grain-filling stage to terminal heat stress (>32°C in March), reducing test weight and yield by up to 1.5% per day of delay. Sowing between November 15 and December 5 is optimal.',
    contentNe:
      'तराई भेगमा मंसिर ३० (डिसेम्बर १५) पछि गहुँ छर्दा चैत महिनामा तापक्रम अत्यधिक बढेर दाना पुष्टिन नपाई उत्पादन प्रति दिन १.५% सम्म घट्न सक्छ। कात्तिक अन्तिम देखि मंसिर २० भित्र छर्नु सर्वोत्तम हुन्छ।',
    safetyCaution: 'Provide light supplementary irrigation during the heading and milking stages if temperatures exceed 30°C.',
  },
  {
    id: 'pass_lentil_nitrogen_03',
    sourceId: 'narc_nglrp_2021',
    sourceTitle: 'Grain Legumes Cultivation Bulletin',
    institution: 'NARC',
    publicationYear: 2021,
    url: 'https://narc.gov.np/grain-legumes',
    cropTags: ['lentil', 'chickpea'],
    topicTags: ['soil', 'fertilizer'],
    districtApplicability: ['Chitwan', 'Rupandehi', 'Kailali', 'Dang'],
    contentEn:
      'Lentils inoculated with Rhizobium leguminosarum fix between 50 and 80 kg of atmospheric nitrogen per hectare. A starter fertilizer dose of 20 kg N and 40 kg P2O5 per hectare is sufficient; excessive chemical nitrogen inhibits root nodulation.',
    contentNe:
      'राइजोबियम जीवाणु उपचार गरिएको मसुरोले प्रति हेक्टर ५० देखि ८० किलोग्राम वायुमण्डलीय नाइट्रोजन माटोमा स्थिर गर्छ। यसका लागि सुरुवाती मात्राको रूपमा २० केजी नाइट्रोजन र ४० केजी फस्फोरस मात्र पर्याप्त हुन्छ।',
  },
  {
    id: 'pass_soil_acidity_liming_04',
    sourceId: 'moald_fertilizer_guideline_2022',
    sourceTitle: 'National Fertilizer Recommendation Guideline',
    institution: 'MoALD',
    publicationYear: 2022,
    url: 'https://moald.gov.np/soil-management',
    cropTags: ['maize', 'potato', 'mustard', 'spinach'],
    topicTags: ['soil', 'fertilizer'],
    districtApplicability: ['Kathmandu', 'Kaski', 'Dhankuta', 'Makwanpur'],
    contentEn:
      'For mid-hill soils with pH below 5.5, apply agricultural lime (calcium carbonate) at 2 to 4 tons/ha (approx. 100-200 kg per Ropani) once every 3 years. Agricultural lime should be broadcast and incorporated 3-4 weeks before planting.',
    contentNe:
      'मध्य पहाडी क्षेत्रमा ५.५ भन्दा कम पीएच भएको अम्लीय माटोमा प्रति रोपनी १०० देखि २०० केजी कृषि चुन ३ वर्षमा एक पटक प्रयोग गर्नुपर्छ। चुन छरेपछि माटोमा राम्ररी मिलाएर ३-४ हप्तापछि मात्र बीउ रोप्नुपर्छ।',
    safetyCaution: 'Never mix agricultural lime directly with urea or DAP simultaneously as it causes nitrogen volatilization as ammonia gas.',
  },
  {
    id: 'pass_maize_waterlogging_05',
    sourceId: 'fao_nepal_climate_resilience',
    sourceTitle: 'Climate-Smart Crop Rotations in Eastern Gangetic Plains',
    institution: 'CIMMYT',
    publicationYear: 2023,
    url: 'https://www.fao.org/nepal/resources',
    cropTags: ['maize'],
    topicTags: ['water', 'climate'],
    districtApplicability: ['Chitwan', 'Jhapa', 'Kaski'],
    contentEn:
      'Maize is extremely sensitive to waterlogging. Continuous standing water for more than 24-48 hours causes root hypoxia, leaf chlorosis, and yield loss exceeding 50%. Ridge and furrow planting significantly mitigates monsoon flooding.',
    contentNe:
      'मकै बाली खेतमा पानी जम्ने अवस्थाप्रति धेरै संवेदनशील हुन्छ। २४ देखि ४८ घण्टासम्म पानी जमेमा जरा कुहिएर ५०% भन्दा बढी उत्पादन घट्न सक्छ। भित्ते वा ड्याङ बनाएर रोप्दा वर्षाको पानी सहजै निकास हुन्छ।',
  },
  {
    id: 'pass_potato_late_blight_06',
    sourceId: 'narc_nglrp_2021',
    sourceTitle: 'Vegetable & Tuber Health Bulletin',
    institution: 'NARC',
    publicationYear: 2022,
    url: 'https://narc.gov.np/vegetables',
    cropTags: ['potato', 'tomato-winter'],
    topicTags: ['disease', 'climate'],
    districtApplicability: ['Kathmandu', 'Kaski', 'Mustang', 'Dhankuta'],
    contentEn:
      'Late blight (Phytophthora infestans) erupts when relative humidity exceeds 85% with continuous cloudy weather and temperatures between 12°C and 22°C. Avoid planting potato immediately following tomato or other solanaceous crops.',
    contentNe:
      'आलुमा डढुवा रोग (लेत ब्लाइट) सापेक्षिक आर्द्रता ८५% भन्दा माथि र तापक्रम १२ देखि २२ डिग्री हुँदा तीव्र रूपमा फैलिन्छ। गोलभेँडा लगाएको खेतमा तुरुन्तै आलु नलगाउनुहोस्।',
  },
  {
    id: 'pass_mustard_aphid_07',
    sourceId: 'narc_nwrp_2023',
    sourceTitle: 'Winter Oilseeds Technology Bulletin',
    institution: 'NARC',
    publicationYear: 2022,
    url: 'https://narc.gov.np/oilseeds',
    cropTags: ['mustard'],
    topicTags: ['disease', 'planting'],
    districtApplicability: ['Chitwan', 'Rupandehi', 'Dang', 'Bara'],
    contentEn:
      'Sowing mustard before October 25 significantly escapes severe mustard aphid (Lipaphis erysimi) outbreaks during peak flowering in January. Delayed sowing past mid-November results in heavy aphid infestation.',
    contentNe:
      'कात्तिक १० (अक्टोबर २५) अगावै तोरी छर्दा पुस-माघ महिनामा लाग्ने लाही किरा (माहुरी किरा) को प्रकोपबाट जोगिन सकिन्छ। ढिलो गरी तोरी छर्दा लाही किराले फूल र कोसा सखाप पार्छ।',
  },
];

// ============================================================
// Retrieval Engine (TF-IDF & Metadata Scorer)
// ============================================================

export interface SearchFilters {
  cropId?: string;
  topic?: 'soil' | 'fertilizer' | 'water' | 'disease' | 'climate' | 'planting';
  district?: string;
  query?: string;
}

export function searchKnowledgeBase(filters: SearchFilters): DocumentPassage[] {
  const { cropId, topic, district, query } = filters;
  const terms = query ? query.toLowerCase().split(/\s+/).filter((t) => t.length > 2) : [];

  return KNOWLEDGE_PASSAGES.map((passage) => {
    let score = 0;

    // Crop match
    if (cropId && passage.cropTags.includes(cropId)) {
      score += 40;
    }

    // Topic match
    if (topic && passage.topicTags.includes(topic)) {
      score += 30;
    }

    // District / regional match
    if (district && passage.districtApplicability.some((d) => d.toLowerCase() === district.toLowerCase())) {
      score += 20;
    }

    // Query keyword match
    if (terms.length > 0) {
      const fullText = (
        passage.contentEn + ' ' +
        passage.contentNe + ' ' +
        passage.sourceTitle + ' ' +
        passage.cropTags.join(' ')
      ).toLowerCase();

      terms.forEach((term) => {
        if (fullText.includes(term)) {
          score += 15;
        }
      });
    }

    return { passage, score };
  })
    .filter((item) => (query || cropId || topic || district ? item.score > 0 : true))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.passage);
}

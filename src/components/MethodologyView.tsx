import React from 'react';
import { Card, SectionHeader } from './ui';
import { BookOpen, Database, Scale, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function MethodologyView() {
  const { state } = useApp();
  const ne = state.language === 'ne';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SectionHeader
        mono={ne ? 'तथ्याङ्क स्रोत तथा विधि' : 'DATA PROVENANCE & ENGINE FORMULATION'}
        title={ne ? 'वैज्ञानिक विधि तथा तथ्याङ्क पारदर्शिता' : 'Scientific Methodology & Data Transparency'}
        subtitle={
          ne
            ? 'नासाका डेटासेट, कृषि-जलवायु चरहरू, नियम-आधारित बाली चक्र तर्क, र मोडेलका सीमाहरूबारे पूर्ण जानकारी।'
            : 'Full disclosure on NASA datasets, agroclimatic variables, rule-based rotation heuristics, and inherent model boundaries.'
        }
      />

      {/* 1. NASA Earth Observations */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-forest" />
          <h3 className="text-base font-semibold text-ink">
            {ne ? '१. नासा भू-उपग्रह तथ्याङ्क (NASA POWER)' : '1. NASA Earth Observations (NASA POWER)'}
          </h3>
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          {ne
            ? 'फार्मसिफ्ट नेपाल सिधै नासाको Prediction Of Worldwide Energy Resources (POWER) Agroclimatology (AG) API सँग जोडिएको छ। छानिएको खेतको स्थानका भौगोलिक निर्देशांक प्रयोग गरी वास्तविक तथ्याङ्क मगाइन्छ — कुनै नकली वा कृत्रिम तथ्याङ्क प्रयोग गरिँदैन।'
            : 'FarmShift Nepal connects directly to the NASA Prediction Of Worldwide Energy Resources (POWER) Agroclimatology (AG) temporal API. Data is queried using the coordinate centroid of the selected farm location without mock proxies or synthetic fillers.'}
        </p>

        <div className="bg-paper-100 p-3 rounded border border-paper-200 space-y-2 text-xs">
          <div className="font-semibold text-ink">
            {ne ? 'प्रयोग गरिएका मापदण्डहरू:' : 'Integrated Parameters:'}
          </div>
          <ul className="list-disc pl-5 space-y-1 text-ink-muted">
            <li>
              <strong>PRECTOTCORR & GPM IMERG:</strong>{' '}
              {ne
                ? 'सुधारित वर्षा मापन (मिमी/दिन) — नासा GPM उपग्रह र MERRA-2 प्रणालीबाट।'
                : 'Precipitation Corrected (mm/day) derived from NASA GPM IMERG and MERRA-2 observations.'}
            </li>
            <li>
              <strong>GWETTOP & GWETROOT (NASA SMAP):</strong>{' '}
              {ne
                ? 'माटोको सतह (०-५ से.मी.) र जरा क्षेत्रको चिस्यान अनुपात (०-१) — नासा SMAP मोडेलबाट।'
                : 'Surface (0-5 cm) and root-zone soil wetness fraction (0-1) derived from NASA SMAP land surface model.'}
            </li>
            <li>
              <strong>TS & MODIS LST:</strong>{' '}
              {ne
                ? 'पृथ्वीको जमिन सतह तापक्रम (°C) — माटो तापीय तनाव र क्यानोपी तापक्रम मापन।'
                : 'Earth skin surface temperature (°C) capturing soil heat stress and canopy thermal loads.'}
            </li>
            <li>
              <strong>T2M / T2M_MAX / T2M_MIN:</strong>{' '}
              {ne
                ? 'दैनिक औसत, अधिकतम र न्यूनतम वायु तापक्रम २ मिटर उचाइमा (°C)।'
                : 'Daily mean, maximum, and minimum air temperatures at 2 meters above displacement height (°C).'}
            </li>
            <li>
              <strong>RH2M:</strong>{' '}
              {ne
                ? '२ मिटर उचाइको सापेक्षिक आर्द्रता (%) — ढुसी रोगको जोखिम मूल्याङ्कनका लागि महत्त्वपूर्ण।'
                : 'Relative humidity at 2 meters (%), critical for evaluating fungal disease risks and vapor pressure deficits.'}
            </li>
            <li>
              <strong>ALLSKY_SFC_SW_DWN:</strong>{' '}
              {ne
                ? 'सूर्यको प्रकाश विकिरण (MJ/m²/दिन) — प्रकाश संश्लेषणको सम्भाव्यता मापन।'
                : 'All Sky Surface Shortwave Downward Irradiance (MJ/m²/day) reflecting photosynthetic solar potential.'}
            </li>
          </ul>
        </div>
      </Card>

      {/* 2. Rotation Engine */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-forest" />
          <h3 className="text-base font-semibold text-ink">
            {ne ? '२. बहु-मापदण्ड नियम-आधारित विश्लेषण प्रणाली' : '2. Multi-Criteria Rule Engine Formulation'}
          </h3>
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          {ne
            ? 'सिफारिसहरू अपारदर्शी मेसिन लर्निङ मोडेलको सट्टा एउटा पारदर्शी र परीक्षणयोग्य नियम प्रणालीद्वारा निर्धारण गरिन्छन्:'
            : 'Recommendations are governed by an auditable, transparent rule engine rather than opaque black-box machine learning models:'}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 border border-paper-300 rounded bg-paper-50">
            <span className="font-semibold text-ink block mb-1">
              {ne ? 'जलवायु अनुकूलता' : 'Climate Suitability'}
            </span>
            {ne
              ? 'प्रत्येक बालीको प्रकाशित न्यूनतम, अनुकूलतम र ताप-तनाव सीमासँग दैनिक र मासिक तापक्रम तुलना गरिन्छ।'
              : 'Evaluates daily & monthly temperature bounds against published minimum, optimal, and thermal stress thresholds for each crop.'}
          </div>
          <div className="p-3 border border-paper-300 rounded bg-paper-50">
            <span className="font-semibold text-ink block mb-1">
              {ne ? 'पानीको माग र आपूर्ति' : 'Water Demand Matching'}
            </span>
            {ne
              ? 'मौसमी संचित वर्षालाई बालीको पानी आवश्यकतासँग तुलना गरिन्छ (उदाहरण: रोपाइँ धानलाई ९००–१२०० मिमी, मुसुरोलाई २००–४०० मिमी)।'
              : 'Compares seasonal cumulative precipitation with crop water footprints (e.g. 900–1200 mm for transplanted rice vs 200–400 mm for lentil).'}
          </div>
          <div className="p-3 border border-paper-300 rounded bg-paper-50">
            <span className="font-semibold text-ink block mb-1">
              {ne ? 'जैविक तथा पारिवारिक विविधता' : 'Biological & Family Diversity'}
            </span>
            {ne
              ? 'एकोहोरो खेतीलाई दण्ड दिइन्छ; अन्नबाली, दलहन र तरकारीको पालो-पालो गर्दा माटोजन्य रोगहरू कम हुन्छन्।'
              : 'Penalizes consecutive monocultures; incentivizes alternating cereals, legumes, and brassicas to disrupt soil-borne pathogens.'}
          </div>
          <div className="p-3 border border-paper-300 rounded bg-paper-50">
            <span className="font-semibold text-ink block mb-1">
              {ne ? 'माटो स्वास्थ्य र नाइट्रोजन' : 'Soil Health & Nitrogen Dynamics'}
            </span>
            {ne
              ? 'जैविक नाइट्रोजन सङ्कलन गर्ने दलहन बाली (मुसुरो, भटमास, मास, चना) समावेश गर्दा अर्को बालीका लागि माटोको उर्वराशक्ति बढ्छ।'
              : 'Rewards biological nitrogen-fixing pulses (lentil, soybean, black gram, chickpea) that replenish nitrogen reservoirs for succeeding crops.'}
          </div>
        </div>
      </Card>

      {/* 3. Agronomic Sources */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-forest" />
          <h3 className="text-base font-semibold text-ink">
            {ne ? '३. नेपाली कृषि अनुसन्धान स्रोतहरू' : '3. Regional Agronomic Sources'}
          </h3>
        </div>
        <p className="text-sm text-ink-secondary leading-relaxed">
          {ne
            ? 'बाली क्यालेन्डर मिति, तापक्रम सीमा र उचाइ दायरा नेपाली कृषि अनुसन्धान संस्थाका प्राविधिक बुलेटिनहरूबाट लिइएका छन्:'
            : 'Crop calendar dates, thermal boundaries, and elevation envelopes are derived from verified technical bulletins issued by Nepalese agricultural research institutions:'}
        </p>
        <ul className="text-xs text-ink-muted space-y-2 list-disc pl-5">
          <li>
            <strong>Nepal Agricultural Research Council (NARC):</strong>{' '}
            {ne
              ? 'राष्ट्रिय धान, गहुँ, मकै र दलहन अनुसन्धान कार्यक्रम (NRRP, NWRP, NMRP, NGLRP)।'
              : 'National Rice Research Program (NRRP), National Wheat Research Program (NWRP), National Maize Research Program (NMRP), National Grain Legumes Research Program (NGLRP).'}
          </li>
          <li>
            <strong>Ministry of Agriculture and Livestock Development (MoALD):</strong>{' '}
            {ne
              ? 'नेपाली कृषि सांख्यिकी जानकारी (२०२३/२४)।'
              : 'Statistical Information on Nepalese Agriculture (2023/24).'}
          </li>
          <li>
            <strong>Food and Agriculture Organization (FAO):</strong>{' '}
            {ne
              ? 'बाली पानी आवश्यकता र सिँचाइ तालिका दिशानिर्देश (Irrigation and Drainage Paper 56)।'
              : 'Crop Water Requirements and Irrigation Scheduling Guidelines (Irrigation and Drainage Paper 56).'}
          </li>
          <li>
            <strong>CIMMYT Nepal:</strong>{' '}
            {ne
              ? 'पूर्वी गंगा मैदानमा संरक्षण कृषि र दिगो सघनीकरण।'
              : 'Conservation Agriculture and Sustainable Intensification in the Eastern Gangetic Plains.'}
          </li>
        </ul>
      </Card>

      {/* 4. Boundaries & Limitations */}
      <Card padding="lg" className="space-y-3 border-sienna-200 bg-sienna-50/30">
        <div className="flex items-center gap-2 text-sienna">
          <AlertCircle className="w-5 h-5" />
          <h3 className="text-base font-semibold">
            {ne ? '४. मोडेलका सीमाहरू र जिम्मेवार प्रयोग' : '4. Model Boundaries & Responsible Usage'}
          </h3>
        </div>
        <p className="text-xs text-ink-secondary leading-relaxed">
          {ne ? (
            <>
              <strong>फार्मसिफ्ट नेपाल के होइन:</strong> यो प्लेटफर्म एउटा सहायक निर्णय उपकरण हो, उत्पादन ग्यारेन्टी दिने प्रणाली होइन। NASA POWER को स्थानीय रिजोलुसन (~०.५° देखि १°) व्यापक क्षेत्रीय मौसम ढाँचा दर्साउँछ, तर साँघुरो उपत्यकामा तुसारो, खेतको माटोको विशिष्टता वा स्थानीय सूक्ष्म जलवायु यसले दर्साउन नसक्न पनि सक्छ।
            </>
          ) : (
            <>
              <strong>What FarmShift Nepal is not:</strong> This platform is a strategic decision-support heuristic, not a guaranteed yield predictor. NASA POWER spatial resolution (~0.5° to 1°) captures broad regional climate patterns but cannot account for hyper-local microclimates, flash frost in narrow valleys, or individual field fertility gradients without on-site soil testing.
            </>
          )}
        </p>
      </Card>
    </div>
  );
}

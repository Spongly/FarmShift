// ============================================================
// Translations for FarmShift Nepal (English & Nepali)
// Plain-language, respectful, public-service agricultural terminology
// Styled following the official European Union public service hierarchy
// ============================================================

export type Language = 'en' | 'ne';

export const TRANSLATIONS = {
  en: {
    // Top banner & Navigation
    nav: {
      brand: 'FarmShift Nepal',
      subtitle: 'Climate and crop planning for Nepal',
      officialBanner: 'An open agricultural information service built with NASA Earth observations',
      home: 'Home',
      myFarm: 'My Farm',
      intelligence: 'NASA Intelligence',
      climate: 'Climate Information',
      planner: 'Crop Planning',
      soilHealth: 'Soil & Fertilizer',
      actionPlan: 'Weekly Plan',
      assistant: 'AI Assistant',
      about: 'About',
      contact: 'Contact',
      startPlanning: 'Start planning',
      languageToggle: 'नेपाली',
    },

    // Homepage
    home: {
      // Hero Section (Reference: EU Editorial Hero)
      heroBadge: 'Agricultural Public Service',
      headline: 'Better crop planning starts with understanding your land.',
      subheadline: 'Explore climate information and compare crop-rotation options for your farm.',
      ctaPrimary: 'Plan my crops',
      ctaSecondary: 'How FarmShift works',
      heroImageCaption: 'Terraced agricultural fields in the mid-hills of Nepal, where shifting monsoon patterns impact crop rotation.',

      // Main Services Section (3 Key Services with genuine photography)
      servicesTitle: 'Our Services',
      servicesSubtitle: 'Clear, practical tools designed to help Nepalese farmers make informed seasonal decisions.',

      service1Title: 'Plan your crops',
      service1Desc: 'Explore crop-rotation options based on your farm information and farming priorities.',
      service1Action: 'Start crop planning',

      service2Title: 'Understand your climate',
      service2Desc: 'Explore available rainfall and temperature information for your location.',
      service2Action: 'View climate data',

      service3Title: 'Learn about soil and water',
      service3Desc: 'Understand the farm conditions that matter when comparing crop plans.',
      service3Action: 'Check soil & water factors',

      // How It Works (Numbered public-service process)
      howItWorksTitle: 'How FarmShift works',
      howItWorksSubtitle: 'A transparent, four-step approach from your local coordinates to verified crop rotations.',
      step1Title: '1. Choose your farm location',
      step1Desc: 'Select your district or point directly to your land on the map of Nepal.',
      step2Title: '2. Tell us about your farm',
      step2Desc: 'Provide basic land information such as soil feel and irrigation availability.',
      step3Title: '3. Explore climate information',
      step3Desc: 'Inspect real historical rainfall, heat, and seasonal weather patterns from NASA satellites.',
      step4Title: '4. Compare crop plans',
      step4Desc: 'Review feasible multi-season rotation pathways tailored for water conservation and soil fertility.',

      // Nepal Agriculture Section (Photo-led storytelling & context)
      nepalAgriTitle: 'Agriculture in Nepal: Cultivating Across Varied Terrains',
      nepalAgriSubtitle: 'From the fertile alluvial plains of the Terai to terraced hillsides, Nepal’s diverse agroecological zones require distinct cropping strategies.',
      nepalHillsTitle: 'Hill & Mountain Farming',
      nepalHillsDesc: 'Terraced slopes rely heavily on seasonal monsoons and organic matter conservation. Diverse rotations of maize, millet, pulses, and winter wheat help stabilize slopes and prevent soil erosion.',
      nepalPlainsTitle: 'Terai Lowlands & Inner Valleys',
      nepalPlainsDesc: 'The granary belt of Nepal features intensive cereal-pulse rotations like rice-wheat and rice-lentil. Rising heat stress and erratic rainfall make water-efficient cycle management critical.',

      // Data and Methodology Section (Credible Research & Transparency)
      methodologyTitle: 'Data Sources & Scientific Transparency',
      methodologyDesc: 'FarmShift connects directly to NASA Prediction Of Worldwide Energy Resources (POWER) for historical daily solar irradiance, temperature, and precipitation observations. Crop calendars and edaphic constraints are aligned with the Nepal Agricultural Research Council (NARC) and Ministry of Agriculture and Livestock Development (MoALD).',
      methodologyAction: 'Learn about data sources and methodology',
      methodologyDisclaimer: 'FarmShift is an independent open service developed for the NASA Space Apps Challenge 2026. It is not an official government portal.',

      // Active Farm Notice
      activeFarmNotice: 'Active farm location:',
    },

    // Guided Workflow
    workflow: {
      title: 'Farm Planning Guide',
      subtitle: 'Complete these four steps to generate and compare multi-season crop rotations',
      step1Label: '1. Location',
      step2Label: '2. Farm & Soil',
      step3Label: '3. Priorities',
      step4Label: '4. Crop Pool',
      next: 'Continue to Next Step',
      back: 'Go Back',
      saveAndReview: 'Generate Crop Rotation Plans',
    },

    // Step 1: Location
    location: {
      title: 'Where is your farm located?',
      subtitle: 'Choose your district or select your place on the map so we can retrieve local climate history.',
      searchPlaceholder: 'Search municipality, village, or district (e.g. Chitwan, Dang, Kaski)...',
      presetsTitle: 'Common Agricultural Regions in Nepal:',
      selectedLocation: 'Selected Location:',
      advancedCoords: 'Advanced: Enter latitude & longitude coordinates',
      latLabel: 'Latitude (°N)',
      lonLabel: 'Longitude (°E)',
      applyCoords: 'Apply Coordinates',
      noLocationSelected: 'Please select a location above or click a point on the map.',
      selectLocationPrompt: 'Click on the map or pick a region to set your farm location.',
      useMyLocation: 'Use My Current Location',
      detectingLocation: 'Detecting your location...',
      locationDetectedSuccess: 'Location detected successfully! Proceeding to next step...',
      locationPermissionDenied: 'Location access was denied. Please allow location permissions in your browser or select manually.',
      locationUnavailable: 'Unable to retrieve location. Please select from map or search.',
      locationTimeout: 'Location request timed out. Please try again or select manually.',
    },

    // Step 2: Farm Details
    farm: {
      title: 'Tell us about your farm',
      subtitle: 'Answer basic questions about your land. You do not need technical soil tests to continue.',
      soilType: 'What kind of soil do you have?',
      soilHelp: 'If you are not sure, choose "Loamy / Mixed" or "I do not know".',
      drainage: 'How easily does water drain from your field?',
      drainageHelp: 'Does water stay standing during heavy monsoon rains?',
      irrigation: 'Do you have irrigation available during dry months?',
      irrigationYes: 'Yes, irrigation available (canal, boring, well, pump)',
      irrigationNo: 'No, rain-fed only (dependent on seasonal rains)',
      advancedSoil: 'Advanced: Soil pH and organic matter (if you had a soil test)',
      phLabel: 'Soil pH (usually 5.5 to 7.5)',
      omLabel: 'Organic Matter % (usually 1.0% to 3.0%)',
    },

    // Step 3: Priorities
    priority: {
      title: 'What matters most to you?',
      subtitle: 'Choose your primary goal for the upcoming cropping cycles.',
      balanced: 'Balanced plan (Recommended)',
      balancedDesc: 'Balances food yield, water consumption, soil preservation, and biological diversity evenly.',
      water: 'Use less water (Drought-resilient)',
      waterDesc: 'Selects crops with lower water footprints, best for rainfed lands or water-scarce dry seasons.',
      climate: 'Climate & Heat resilient',
      climateDesc: 'Prioritizes varieties suited to shifting monsoon rains and elevated temperatures.',
      soil: 'Improve soil health & fertility',
      soilDesc: 'Includes nitrogen-fixing pulses (lentils, soybeans) to restore tired soils.',
      seasonsLabel: 'How many seasons would you like to plan for?',
      startSeasonLabel: 'Which season are you starting with?',
      kharif: 'Monsoon / Kharif (Asar – Kartik / Jun – Oct)',
      rabi: 'Winter / Rabi (Mangsir – Chaitra / Nov – Mar)',
      zaid: 'Spring / Pre-Monsoon (Baisakh – Jestha / Apr – Jun)',
    },

    // Step 4: Crop Selection & Planner View
    planner: {
      step1Tag: 'STEP 1 OF 2 • ROTATION PARAMETERS',
      title: 'Plan Rotation Sequence & Constraints',
      subtitle: 'Define candidate crop pool, seasonal duration, and climate-soil optimization objectives.',
      priorityLabel: 'Strategic Priority',
      priorityCalibrate: 'Calibrates scoring weights across criteria.',
      horizonLabel: 'Planning Horizon (Seasons)',
      horizonHelp: 'Number of sequential cropping cycles.',
      season2: '2 Seasons (1 Year Cycle)',
      season3: '3 Seasons (1.5 Years)',
      season4: '4 Seasons (2 Years Standard)',
      season6: '6 Seasons (3 Years Multi-cycle)',
      initialSeasonLabel: 'Initial Cycle Season',
      initialSeasonHelp: 'Baseline season starting point.',
      candidatePoolTitle: 'Candidate Crops Pool',
      candidatePoolSubtitle: 'Select crops feasible for your farm. The engine evaluates viable sequence combinations.',
      selectStandardSet: 'Select Standard Nepal Set',
      computeButton: 'Compute Resilient Crop Rotations',

      // Step 2: Results
      step2Tag: 'STEP 2 OF 2 • RANKED STRATEGIES',
      resultsTitle: 'Generated Sequences',
      resultsSubtitle: 'Sequences evaluated against multi-factor climate matching, water risks, biological diversity, and soil benefits.',
      noSequencesTitle: 'No Feasible Sequences',
      noSequencesText: 'No valid crop sequence could be scheduled with the selected candidates and seasonal rules. Try adding more crops or adjusting the start season.',
      overallMatch: 'Overall Compatibility:',
      engineAssessment: 'Engine Assessment:',
      climateMatch: 'Climate Match',
      waterCompatibility: 'Water Compatibility',
      soilBenefit: 'Soil & Nitrogen Benefit',
      addToCompare: '+ Add to Compare',
      selectedForCompare: 'Selected for Compare',
      compareAction: 'Compare Selected Strategies Side-by-Side',
      selectLocationAlert: 'Please select a farm location first to run crop rotation planning.',
    },

    // Crop Selection names & categories
    crops: {
      title: 'Which crops are you open to growing?',
      subtitle: 'Select crops commonly grown in your area or keep standard verified crops selected.',
      selectAll: 'Select standard crops',
      clearAll: 'Clear all',
      selectedCount: 'selected crops',
      cereal: 'Cereal',
      legume: 'Legume',
      oilseed: 'Oilseed',
      cash: 'Cash / Root',
      vegetable: 'Vegetable',
      root: 'Root Crop',
    },

    // Weather & Climate Tab
    weather: {
      title: 'Weather & Climate Information',
      subtitle: 'Real satellite-derived temperature and rainfall observations from NASA POWER.',
      fetchButton: 'Query NASA Observations',
      loading: 'Connecting to NASA satellites...',
      normalsTitle: 'Monthly Rainfall and Temperature Patterns',
      tempMax: 'High Temp (°C)',
      tempMin: 'Low Temp (°C)',
      tempMean: 'Mean Temp (°C)',
      precip: 'Rainfall (mm)',
      solar: 'Solar Radiation (MJ/m²)',
      summaryTitle: 'Annual Climate Summary for Selected Location',
    },

    // Footer
    footer: {
      tagline: 'FarmShift Nepal — Climate and crop planning for Nepal',
      aboutTitle: 'About FarmShift',
      aboutDesc: 'A public-interest digital service connecting NASA satellite observations with verified Nepalese agronomic science to empower smallholder farmers and agricultural officers.',
      quickLinks: 'Navigation',
      resources: 'Data & Methodology',
      sources: 'NASA POWER API (LaRC)',
      standards: 'NARC & MoALD Agronomic Calendars',
      cartography: 'OpenStreetMap Contributors',
      disclaimer: 'FarmShift is an independent NASA Space Apps Challenge 2026 entry, not an official government portal.',
      copyright: '© 2026 FarmShift Nepal. Open public service.',
    },

    // Common UI buttons & status
    common: {
      loading: 'Loading...',
      error: 'An error occurred. Please try again.',
      openMap: 'Open interactive map',
      clear: 'Clear',
      optional: '(Optional)',
      dontKnow: "I don't know / Not sure",
      learnMore: 'Learn more',
      viewMethodology: 'Scientific Methodology & Sources',
    },
  },

  ne: {
    // Top banner & Navigation
    nav: {
      brand: 'फार्मसिफ्ट नेपाल',
      subtitle: 'नेपालका लागि जलवायु तथा बाली योजना',
      officialBanner: 'नासा (NASA) को भू-उपग्रह तथ्याङ्कबाट सञ्चालित खुला कृषि सूचना सेवा',
      home: 'गृहपृष्ठ',
      myFarm: 'मेरो खेत',
      intelligence: 'नासा भू-उपग्रह विश्लेषण',
      climate: 'जलवायु जानकारी',
      planner: 'बाली योजना',
      soilHealth: 'माटो र मलखाद',
      actionPlan: 'कार्यतालिका',
      assistant: 'एआई सल्लाहकार',
      about: 'हाम्रो बारेमा',
      contact: 'सम्पर्क',
      startPlanning: 'योजना सुरु गर्नुहोस्',
      languageToggle: 'English',
    },

    // Homepage
    home: {
      // Hero Section
      heroBadge: 'सार्वजनिक कृषि सेवा',
      headline: 'आफ्नो खेत बुझेर राम्रो बाली योजना बनाऔँ।',
      subheadline: 'मौसमको जानकारी र तपाईंको खेतको विवरणका आधारमा उपयुक्त बाली चक्रका विकल्पहरू तुलना गर्नुहोस्।',
      ctaPrimary: 'बाली योजना सुरु गर्नुहोस्',
      ctaSecondary: 'फार्मसिफ्टले कसरी काम गर्छ?',
      heroImageCaption: 'नेपालको पहाडी भूभागमा अवस्थित गरा-बारी, जहाँ मनसुनको फेरबदलले बाली चक्रमा प्रत्यक्ष प्रभाव पार्छ।',

      // Main Services Section
      servicesTitle: 'हाम्रा मुख्य सेवाहरू',
      servicesSubtitle: 'नेपाली किसानहरूलाई मौसमी निर्णय लिन मद्दत गर्ने व्यावहारिक र स्पष्ट साधनहरू।',

      service1Title: 'बाली योजना बनाउनुहोस्',
      service1Desc: 'तपाईंको खेतको माटो, सिँचाइ र प्राथमिकताका आधारमा उपयुक्त बाली चक्र विकल्पहरू तुलना गर्नुहोस्।',
      service1Action: 'बाली योजना सुरु गर्नुहोस्',

      service2Title: 'आफ्नो मौसम बुझ्नुहोस्',
      service2Desc: 'आफ्नो स्थानको वर्षा, तापक्रम र खडेरी सम्बन्धी नासा भू-उपग्रहका ऐतिहासिक विवरणहरू हेर्नुहोस्।',
      service2Action: 'मौसम विवरण हेर्नुहोस्',

      service3Title: 'माटो र पानीको अवस्था जान्नुहोस्',
      service3Desc: 'बाली चक्र छनोट गर्दा ध्यान दिनुपर्ने माटोको प्रकार, निकास र पानीको आवश्यकता बुझ्नुहोस्।',
      service3Action: 'माटो र पानी परीक्षण गर्नुहोस्',

      // How It Works
      howItWorksTitle: 'फार्मसिफ्टले कसरी काम गर्छ?',
      howItWorksSubtitle: 'स्थान छनोटदेखि वैज्ञानिक बाली चक्र प्राप्त गर्नेसम्मका चार सरल चरणहरू।',
      step1Title: '१. आफ्नो खेतको स्थान छान्नुहोस्',
      step1Desc: 'आफ्नो जिल्ला वा गाउँ खोज्नुहोस् वा नेपालको नक्सामा सिधै क्लिक गर्नुहोस्।',
      step2Title: '२. खेतको सामान्य जानकारी दिनुहोस्',
      step2Desc: 'माटोको किसिम र हिउँदमा सिँचाइको सुविधा छ/छैन भन्ने साधारण विवरण भर्नुहोस्।',
      step3Title: '३. जलवायु सम्बन्धी जानकारी हेर्नुहोस्',
      step3Desc: 'नासा उपग्रहबाट प्राप्त वर्षा, तापक्रम र खडेरीको इतिहास हेर्नुहोस्।',
      step4Title: '४. बाली चक्रका विकल्प तुलना गर्नुहोस्',
      step4Desc: 'पानीको बचत, माटोको सुधार र राम्रो उत्पादन दिने बहु-सिजन बाली चक्र सिफारिस पाउनुहोस्।',

      // Nepal Agriculture Section
      nepalAgriTitle: 'नेपालको कृषि: विविधता र भौगोलिक विशेषता',
      nepalAgriSubtitle: 'तराईको समथर अन्नभण्डारदेखि पहाडका भिराला गरासम्म, नेपालको हावापानी अनुसार फरक बाली रणनीतिको आवश्यकता पर्छ।',
      nepalHillsTitle: 'पहाडी तथा हिमाली खेती प्रणाली',
      nepalHillsDesc: 'भिराला गराहरू वर्षाको मनसुन र प्राङ्गारिक मलमा बढी निर्भर हुन्छन्। मकै, कोदो, दलहन र हिउँदे गहुँको उपयुक्त चक्रले माटोको क्षयीकरण रोक्न मद्दत गर्छ।',
      nepalPlainsTitle: 'तराई र भित्री मधेशको खेती',
      nepalPlainsDesc: 'नेपालको मुख्य अन्न उत्पादन हुने क्षेत्रमा धान-गहुँ र धान-दाल जस्ता सघन बाली प्रणाली चल्छन्। बढ्दो गर्मी र पानीको अभावमा नयाँ बाली चक्र आवश्यक भएको छ।',

      // Data and Methodology Section
      methodologyTitle: 'तथ्याङ्कको स्रोत तथा वैज्ञानिक आधार',
      methodologyDesc: 'फार्मसिफ्ट नासा (NASA POWER) प्रणालीसँग सिधै जोडिएर वास्तविक मौसम र वर्षा विवरण प्राप्त गर्दछ। बाली क्यालेन्डर र कृषि मापदण्ड नेपाल कृषि अनुसन्धान परिषद् (NARC) र कृषि मन्त्रालयका आधिकारिक स्रोतमा आधारित छन्।',
      methodologyAction: 'वैज्ञानिक आधार तथा तथ्याङ्क स्रोत पढ्नुहोस्',
      methodologyDisclaimer: 'फार्मसिफ्ट नासा स्पेस एप्स च्यालेन्ज २०२६ को लागि निर्मित एक स्वतन्त्र खुला सेवा हो, यो कुनै सरकारी कार्यालय होइन।',

      // Active Farm Notice
      activeFarmNotice: 'छानिएको खेतको स्थान:',
    },

    // Guided Workflow
    workflow: {
      title: 'बाली चक्र योजना निर्देशिका',
      subtitle: 'आफ्नो खेतका लागि उपयुक्त बाली योजना बनाउन तलका चार चरणहरू पूरा गर्नुहोस्',
      step1Label: '१. खेतको स्थान',
      step2Label: '२. खेत र माटो',
      step3Label: '३. प्राथमिकता',
      step4Label: '४. बाली छनोट',
      next: 'अर्को चरणमा जानुहोस्',
      back: 'पछाडि जानुहोस्',
      saveAndReview: 'बाली चक्र विकल्पहरू हेर्नुहोस्',
    },

    // Step 1: Location
    location: {
      title: 'तपाईंको खेत कहाँ पर्छ?',
      subtitle: 'आफ्नो जिल्ला वा स्थानीय तह छान्नुहोस् वा तलको नक्सामा थिच्नुहोस्।',
      searchPlaceholder: 'स्थान, गाउँ वा जिल्ला खोज्नुहोस् (जस्तै: चितवन, दाङ, कास्की, रुपन्देही)...',
      presetsTitle: 'नेपालका प्रमुख कृषि क्षेत्रहरू:',
      selectedLocation: 'छानिएको स्थान:',
      advancedCoords: 'थप विकल्प: अक्षांश र देशान्तर सिधै राख्नुहोस्',
      latLabel: 'अक्षांश (Latitude °N)',
      lonLabel: 'देशान्तर (Longitude °E)',
      applyCoords: 'स्थान लागू गर्नुहोस्',
      noLocationSelected: 'कृपया माथिबाट स्थान छान्नुहोस् वा नक्सामा क्लिक गर्नुहोस्।',
      selectLocationPrompt: 'आफ्नो खेतको मौसम जान्न नक्सामा क्लिक गर्नुहोस् वा सूचीबाट छान्नुहोस्।',
      useMyLocation: 'मेरो हालको स्थान पत्ता लगाउनुहोस्',
      detectingLocation: 'तपाईंको स्थान पत्ता लगाइँदैछ...',
      locationDetectedSuccess: 'स्थान सफलतापूर्वक पत्ता लाग्यो! अर्को चरणमा अगाडि बढ्दैछ...',
      locationPermissionDenied: 'स्थान (Location) अनुमति अस्वीकार भयो। कृपया ब्राउजरमा स्थान अनुमति दिनुहोस् वा सिधै खोज्नुहोस्।',
      locationUnavailable: 'स्थान पत्ता लगाउन सकिएन। कृपया नक्साबाट वा सूचीबाट छान्नुहोस्।',
      locationTimeout: 'स्थान पत्ता लगाउने समय समाप्त भयो। कृपया पुन: प्रयास गर्नुहोस्।',
    },

    // Step 2: Farm Details
    farm: {
      title: 'आफ्नो खेतको बारेमा बताउनुहोस्',
      subtitle: 'सामान्य जानकारी मात्र आवश्यक छ। प्राविधिक माटो परीक्षण नभए पनि फरक पर्दैन।',
      soilType: 'तपाईंको खेतको माटो कस्तो छ?',
      soilHelp: 'निश्चित नभएमा "दोमट / मध्यम माटो" वा "थाहा छैन" छान्नुहोस्।',
      drainage: 'वर्षा हुँदा खेतमा पानी कसरी नजम्छ?',
      drainageHelp: 'वर्षातको समयमा खेतमा धेरै दिन पानी जम्ने समस्या छ कि छैन?',
      irrigation: 'हिउँद वा खडेरीको समयमा सिँचाइको सुविधा छ?',
      irrigationYes: 'हो, सिँचाइको सुविधा छ (कुलो, बोरिङ, इनार वा पम्प)',
      irrigationNo: 'छैन, आकाशे पानीमा मात्र निर्भर (सिँचाइ छैन)',
      advancedSoil: 'थप विकल्प: माटोको pH र प्राङ्गारिक पदार्थ (परीक्षण गरेको भए मात्र)',
      phLabel: 'माटोको pH मान (सामान्यतया ५.५ देखि ७.५)',
      omLabel: 'प्राङ्गारिक पदार्थ % (सामान्यतया १% देखि ३%)',
    },

    // Step 3: Priorities
    priority: {
      title: 'तपाईंको मुख्य उद्देश्य के हो?',
      subtitle: 'आगामी बालीहरूका लागि आफ्नो प्राथमिकता छान्नुहोस्।',
      balanced: 'सन्तुलित योजना (सिफारिस गरिएको)',
      balancedDesc: 'उत्पादन, पानीको बचत, माटोको सुरक्षा र किरा नियन्त्रण सबैको सन्तुलन मिलाउँछ।',
      water: 'कम पानी लाग्ने (खडेरी सहन सक्ने)',
      waterDesc: 'सिँचाइ कम भएका ठाउँका लागि उपयुक्त कम पानी चाहिने बालीहरूलाई प्राथमिकता दिन्छ।',
      climate: 'गर्मी र मौसम सहन सक्ने',
      climateDesc: 'बढ्दो गर्मी र अनियमित वर्षा सामना गर्न सक्ने बालीहरू छनोट गर्छ।',
      soil: 'माटोको उर्वराशक्ति बढाउने',
      soilDesc: 'दलहन बाली (दाल, भटमास आदि) समावेश गरेर माटोमा नाइट्रोजनको मात्रा बढाउँछ।',
      seasonsLabel: 'कतिवटा सिजनका लागि योजना बनाउने?',
      startSeasonLabel: 'कुन सिजनबाट योजना सुरु गर्ने?',
      kharif: 'बर्खे / वर्षे बाली (असार – कात्तिक / गर्मी मौसम)',
      rabi: 'हिउँदे बाली (मङ्सिर – चैत / जाडो मौसम)',
      zaid: 'चैते / बसन्ते बाली (वैशाख – जेठ)',
    },

    // Step 4: Crop Selection & Planner View
    planner: {
      step1Tag: 'चरण १ / २ • बाली चक्रका मापदण्ड',
      title: 'बाली चक्रको क्रम र मापदण्ड छनोट',
      subtitle: 'खेतमा लगाउन सकिने बालीहरू, योजना सिजनको अवधि, र प्राथमिकता उद्देश्य निर्धारण गर्नुहोस्।',
      priorityLabel: 'रणनीतिक प्राथमिकता',
      priorityCalibrate: 'विभिन्न मापदण्डहरूमा मूल्याङ्कनको भार मिलाउँछ।',
      horizonLabel: 'योजना अवधि (सिजन सङ्ख्या)',
      horizonHelp: 'लगातार गरिने बाली चक्रहरूको सङ्ख्या।',
      season2: '२ सिजन (१ वर्षको बाली चक्र)',
      season3: '३ सिजन (१.५ वर्षको बाली चक्र)',
      season4: '४ सिजन (२ वर्ष - मानक सिफारिस)',
      season6: '६ सिजन (३ वर्ष - पूर्ण बहु-चक्र)',
      initialSeasonLabel: 'सुरुवाती सिजन',
      initialSeasonHelp: 'योजना सुरु गरिने पहिलो बाली सिजन।',
      candidatePoolTitle: 'बालीहरूको समूह',
      candidatePoolSubtitle: 'आफ्नो खेतमा लगाउन सकिने बालीहरू छान्नुहोस्। प्रणालीले उपयुक्त संयोजन तयार पार्छ।',
      selectStandardSet: 'नेपालका प्रमुख बालीहरू छान्नुहोस्',
      computeButton: 'उपयुक्त बाली चक्रहरूको विश्लेषण गर्नुहोस्',

      // Step 2: Results
      step2Tag: 'चरण २ / २ • उत्कृष्ट सिफारिसहरू',
      resultsTitle: 'तयार पारिएका बाली चक्रहरू',
      resultsSubtitle: 'मौसम अनुकूलता, पानीको जोखिम, जैविक विविधता, र माटो सुधारका आधारमा मूल्याङ्कन गरिएका विकल्पहरू।',
      noSequencesTitle: 'कुनै पनि उपयुक्त बाली चक्र भेटिएन',
      noSequencesText: 'छानिएका बाली र मौसमी नियम अनुसार कुनै चक्र तयार हुन सकेन। थप बालीहरू समावेश गर्नुहोस् वा सुरुवाती सिजन फेर्नुहोस्।',
      overallMatch: 'समग्र अनुकूलता:',
      engineAssessment: 'प्रणाली मूल्याङ्कन:',
      climateMatch: 'मौसम अनुकूलता',
      waterCompatibility: 'पानीको उपलब्धता',
      soilBenefit: 'माटो र नाइट्रोजन लाभ',
      addToCompare: '+ तुलना गर्न थप्नुहोस्',
      selectedForCompare: 'तुलनाका लागि छानियो',
      compareAction: 'छानिएका बाली चक्रहरू आमने-सामने तुलना गर्नुहोस्',
      selectLocationAlert: 'बाली चक्र विश्लेषण गर्न कृपया पहिले खेतको स्थान छान्नुहोस्।',
    },

    // Crop Selection names & categories
    crops: {
      title: 'तपाईं कुन कुन बाली लगाउन इच्छुक हुनुहुन्छ?',
      subtitle: 'तपाईंको क्षेत्रमा हुने बालीहरू छान्नुहोस् वा सिफारिस गरिएका बालीहरू रहन दिनुहोस्।',
      selectAll: 'सबै साधारण बाली छान्नुहोस्',
      clearAll: 'सबै खाली गर्नुहोस्',
      selectedCount: 'छानिएका बालीहरू',
      cereal: 'अन्नबाली',
      legume: 'दलहन / कोसेबाली',
      oilseed: 'तेलहन',
      cash: 'नगदे / कन्दमूल',
      vegetable: 'तरकारी बाली',
      root: 'कन्दमूल बाली',
    },

    // Weather & Climate Tab
    weather: {
      title: 'मौसम तथा जलवायु विवरण',
      subtitle: 'नासा (NASA) भू-उपग्रहबाट प्राप्त वर्षा र तापक्रमको आधिकारिक इतिहास।',
      fetchButton: 'नासाको मौसम तथ्याङ्क हेर्नुहोस्',
      loading: 'नासा प्रणालीसँग जोडिँदैछ...',
      normalsTitle: 'मासिक वर्षा र तापक्रमको अवस्था',
      tempMax: 'अधिकतम तापक्रम (°C)',
      tempMin: 'न्यूनतम तापक्रम (°C)',
      tempMean: 'औसत तापक्रम (°C)',
      precip: 'वर्षा (मिमी)',
      solar: 'घामको ताप (MJ/m²)',
      summaryTitle: 'वार्षिक जलवायु सारांश',
    },

    // Footer
    footer: {
      tagline: 'फार्मसिफ्ट नेपाल — नेपालका लागि जलवायु तथा बाली योजना',
      aboutTitle: 'फार्मसिफ्टको बारेमा',
      aboutDesc: 'नासाको भू-उपग्रह तथ्याङ्क र नेपालका प्रमाणित कृषि मापदण्डलाई जोडेर किसान तथा प्राविधिकहरूलाई सशक्त बनाउने खुला सार्वजनिक सेवा।',
      quickLinks: 'वेबसाइट नेभिगेसन',
      resources: 'तथ्याङ्क तथा विधि',
      sources: 'नासा (NASA POWER API)',
      standards: 'नेपाल कृषि अनुसन्धान परिषद् (NARC) मापदण्ड',
      cartography: 'ओपनस्ट्रिटम्याप (OpenStreetMap)',
      disclaimer: 'फार्मसिफ्ट नासा स्पेस एप्स च्यालेन्ज २०२६ को लागि निर्मित स्वतन्त्र खुला सेवा हो।',
      copyright: '© २०२६ फार्मसिफ्ट नेपाल। खुला सार्वजनिक सेवा।',
    },

    // Common UI buttons & status
    common: {
      loading: 'लोड हुँदैछ...',
      error: 'त्रुटि देखा पर्यो। कृपया पुन: प्रयास गर्नुहोस्।',
      openMap: 'नक्सा खोल्नुहोस्',
      clear: 'हटाउनुहोस्',
      optional: '(ऐच्छिक)',
      dontKnow: 'थाहा छैन / निश्चित छैन',
      learnMore: 'थप जान्नुहोस्',
      viewMethodology: 'वैज्ञानिक आधार तथा तथ्याङ्क स्रोत',
    },
  },
};

// ============================================================
// Nepali Crop Names, Local Season & Category Dictionaries
// ============================================================

export const NEPALI_CROP_NAMES: Record<string, { nepaliName: string; localSubtitle: string }> = {
  'rice-transplanted': {
    nepaliName: 'रोपाइँ धान',
    localSubtitle: 'धान (रोपाइँ)',
  },
  'rice-direct-seeded': {
    nepaliName: 'छरुवा धान',
    localSubtitle: 'धान (धुले/बियान)',
  },
  'wheat': {
    nepaliName: 'गहुँ',
    localSubtitle: 'गहुँ (हिउँदे)',
  },
  'maize': {
    nepaliName: 'मकै',
    localSubtitle: 'मकै (वर्षे/हिउँदे)',
  },
  'lentil': {
    nepaliName: 'मुसुरो',
    localSubtitle: 'मुसुरो दाल',
  },
  'chickpea': {
    nepaliName: 'चना',
    localSubtitle: 'चना दाल',
  },
  'blackgram': {
    nepaliName: 'मास',
    localSubtitle: 'मास दाल (कालो दाल)',
  },
  'soybean': {
    nepaliName: 'भटमास',
    localSubtitle: 'भटमास (पहेंलो/कालो)',
  },
  'mustard': {
    nepaliName: 'तोरी',
    localSubtitle: 'तोरी / सरस्यूँ',
  },
  'potato': {
    nepaliName: 'आलु',
    localSubtitle: 'आलु (हिउँदे/वर्षे)',
  },
  'millet-finger': {
    nepaliName: 'कोदो',
    localSubtitle: 'कोदो (मरुवा)',
  },
  'buckwheat': {
    nepaliName: 'फापर',
    localSubtitle: 'फापर (तीते/मीठे)',
  },
  'tomato-winter': {
    nepaliName: 'गोलभेँडा',
    localSubtitle: 'गोलभेँडा (टमाटर)',
  },
  'spinach': {
    nepaliName: 'पालुङ्गो',
    localSubtitle: 'पालुङ्गो / सागपात',
  },
  'barley': {
    nepaliName: 'जौ',
    localSubtitle: 'जौ / उवा',
  },
  'pigeonpea': {
    nepaliName: 'रहर',
    localSubtitle: 'रहर दाल',
  },
  'cowpea': {
    nepaliName: 'बोडी',
    localSubtitle: 'बोडी (टाँटे/घ्यु)',
  },
  'fieldpea': {
    nepaliName: 'केराउ',
    localSubtitle: 'केराउ (मटर)',
  },
  'rajma-bean': {
    nepaliName: 'राजमा',
    localSubtitle: 'राजमा सिमी',
  },
  'sesame': {
    nepaliName: 'तिल',
    localSubtitle: 'तिल (कालो/सेतो)',
  },
  'groundnut': {
    nepaliName: 'बदाम',
    localSubtitle: 'भुइँकटहर बदाम (मूँगफली)',
  },
  'sunflower': {
    nepaliName: 'सूर्यमुखी',
    localSubtitle: 'सूर्यमुखी तेलहन',
  },
  'cauliflower': {
    nepaliName: 'काउली',
    localSubtitle: 'फूलकाउली',
  },
  'cabbage': {
    nepaliName: 'बन्दागोभी',
    localSubtitle: 'पातगोभी / बन्दा',
  },
  'radish': {
    nepaliName: 'मूला',
    localSubtitle: 'मूला (सेतो/रातो)',
  },
  'onion': {
    nepaliName: 'प्याज',
    localSubtitle: 'प्याज (हिउँदे/बसन्ते)',
  },
  'garlic': {
    nepaliName: 'लसुन',
    localSubtitle: 'लसुन मसला',
  },
  'chilli': {
    nepaliName: 'खुर्सानी',
    localSubtitle: 'हरियो/रातो खुर्सानी',
  },
  'ginger': {
    nepaliName: 'अदुवा',
    localSubtitle: 'अदुवा (सुठो)',
  },
  'turmeric': {
    nepaliName: 'बेसार',
    localSubtitle: 'हलेदो / बेसार',
  },
  'eggplant': {
    nepaliName: 'भन्टा',
    localSubtitle: 'बैगुन / भन्टा',
  },
  'okra': {
    nepaliName: 'भिन्डी',
    localSubtitle: 'रामतोरिया / भिन्डी',
  },
  'cucumber': {
    nepaliName: 'काँक्रो',
    localSubtitle: 'काँक्रो (स्थानीय/हाइब्रिड)',
  },
  'pumpkin': {
    nepaliName: 'फर्सी',
    localSubtitle: 'पाकेको/हरियो फर्सी',
  },
  'sugarcane': {
    nepaliName: 'उखु',
    localSubtitle: 'उखु नगदे बाली',
  },
  'mandarin-orange': {
    nepaliName: 'सुन्तला',
    localSubtitle: 'सुन्तला फलफूल',
  },
};

export const NEPALI_SEASONS: Record<string, string> = {
  'Kharif': 'बर्खे (वर्षात)',
  'Kharif (Summer)': 'बर्खे (असार–कात्तिक)',
  'Rabi': 'हिउँदे (जाडो)',
  'Rabi (Winter)': 'हिउँदे (मङ्सिर–चैत)',
  'Zaid': 'चैते / बसन्ते',
};

export const NEPALI_CATEGORIES: Record<string, string> = {
  'cereal': 'अन्नबाली',
  'legume': 'दलहन बाली',
  'oilseed': 'तेलहन बाली',
  'cash': 'नगदे बाली',
  'root': 'कन्दमूल बाली',
  'vegetable': 'तरकारी बाली',
};

export const NEPALI_MONTHS: Record<number, string> = {
  1: 'जनवरी',
  2: 'फेब्रुअरी',
  3: 'मार्च',
  4: 'अप्रिल',
  5: 'मे',
  6: 'जुन',
  7: 'जुलाई',
  8: 'अगस्ट',
  9: 'सेप्टेम्बर',
  10: 'अक्टोबर',
  11: 'नोभेम्बर',
  12: 'डिसेम्बर',
};

export function translateBenefit(benefit: string, lang: Language): string {
  if (lang !== 'ne') return benefit;
  if (benefit.includes('Nitrogen fixation')) {
    return 'दलहन बालीबाट प्राकृतिक नाइट्रोजन प्राप्त भई रासायनिक मलको आवश्यकता घट्छ।';
  }
  if (benefit.includes('benefits from the preceding')) {
    return 'अघिल्लो बालीको अवशेष र माटोको अनुकूलताबाट पछिल्लो बालीलाई पोषण लाभ मिल्छ।';
  }
  if (benefit.includes('Good crop diversity')) {
    return 'बाली विविधताले माटोमा किरा र ढुसीजन्य रोगको प्रकोप नियन्त्रण गर्न मद्दत गर्छ।';
  }
  return benefit;
}

export function translateRisk(risk: string, lang: Language): string {
  if (lang !== 'ne') return risk;
  if (risk.includes('Climate conditions appear poorly suited')) {
    return 'बाली लाग्ने मौसममा हावापानी तथा तापक्रम त्यति अनुकूल नदेखिन सक्छ।';
  }
  if (risk.includes('Climate suitability is moderate')) {
    return 'मौसम अनुकूलता मध्यम छ — अत्यधिक तापक्रम वा वर्षाको उतारचढावमा ध्यान दिनुहोस्।';
  }
  if (risk.includes('Water availability may be significantly below')) {
    return 'यस बालीलाई चाहिने पानीको तुलनामा प्राकृतिक वर्षा वा सिँचाइ निकै कम हुन सक्छ।';
  }
  if (risk.includes('Climate data not loaded')) {
    return 'नासाको मौसम विवरण लोड नभएकोले अनुमानित बाली गुणका आधारमा मात्र विश्लेषण गरिएको छ।';
  }
  if (risk.includes('Soil drainage may cause waterlogging')) {
    return 'माटोमा पानी जम्ने भएकाले यो बालीमा जरा कुहिने वा निकासको समस्या हुन सक्छ।';
  }
  return risk;
}



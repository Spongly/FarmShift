import React from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../data/translations';
import { 
  Sprout, 
  MapPin, 
  ArrowRight, 
  CloudRain, 
  CheckCircle2, 
  RotateCw, 
  ShieldCheck, 
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  Droplets,
  Sun,
  Compass,
  Loader2
} from 'lucide-react';
import { NEPAL_PRESETS } from '../data/cropData';
import { presetToLocation, reverseGeocodeCoordinates, coordinatesToLocation } from '../services/geocoding';

interface ServiceHomeProps {
  onStartPlanning: () => void;
  onExploreWeather: () => void;
  onExploreSoil: () => void;
  onViewMethodology: () => void;
}

export function ServiceHome({
  onStartPlanning,
  onExploreWeather,
  onExploreSoil,
  onViewMethodology,
}: ServiceHomeProps) {
  const { state, setLocation } = useApp();
  const { language, location } = state;
  const t = TRANSLATIONS[language];

  const [detecting, setDetecting] = React.useState(false);
  const [geoError, setGeoError] = React.useState<string | null>(null);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(language === 'ne' ? 'ब्राउजरमा जीपीएस उपलब्ध छैन।' : 'Geolocation not supported.');
      return;
    }

    setDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const loc = await reverseGeocodeCoordinates(latitude, longitude);
          setLocation(loc);
        } catch {
          const fallbackLoc = coordinatesToLocation(latitude, longitude);
          fallbackLoc.source = 'gps';
          setLocation(fallbackLoc);
        } finally {
          setDetecting(false);
          // Automatically proceed to planning workflow with this location!
          onStartPlanning();
        }
      },
      (err) => {
        setDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError(language === 'ne' ? 'स्थान अनुमति दिइएन।' : 'Location permission denied.');
        } else {
          setGeoError(language === 'ne' ? 'स्थान पत्ता लागेन।' : 'Location detection failed.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* ============================================================
          1. HERO SECTION (Editorial Public Service Split Layout)
          Reference: European Union Homepage Hero Structure
          ============================================================ */}
      <section className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Text Column: Structured Public Service Content */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 border border-stone-200 rounded text-xs font-semibold text-forest-800">
                <span className="w-2 h-2 rounded-full bg-forest-600" />
                <span>{t.home.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ink tracking-tight leading-[1.15]">
                {t.home.headline}
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-2xl">
                {t.home.subheadline}
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onStartPlanning}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-md bg-forest-700 hover:bg-forest-800 active:bg-forest-900 text-white font-bold text-sm sm:text-base shadow-sm transition-colors focus:outline-forest focus:ring-2 focus:ring-offset-2"
                >
                  <span>{t.home.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={detecting}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-md bg-forest-50 hover:bg-forest-100 border border-forest-300 text-forest-900 font-bold text-sm transition-all shadow-xs"
                >
                  {detecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-forest-700" />
                  ) : (
                    <Compass className="w-4 h-4 text-forest-700" />
                  )}
                  <span>
                    {detecting
                      ? (language === 'ne' ? 'स्थान खोज्दै...' : 'Detecting...')
                      : (language === 'ne' ? 'मेरो स्थानबाट सुरु गर्नुहोस्' : 'Use My Current Location')}
                  </span>
                </button>

                <a
                  href="#how-it-works"
                  className="flex items-center gap-1.5 px-3 py-3.5 rounded-md text-forest-800 hover:text-forest-900 font-semibold text-sm hover:bg-stone-100 transition-colors"
                >
                  <span>{t.home.ctaSecondary}</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {geoError && (
                <p className="text-xs text-sienna font-medium">{geoError}</p>
              )}

              {/* Active farm status indicator */}
              {location ? (
                <div className="flex items-center gap-2 text-xs text-forest-800 bg-forest-50 p-3 rounded border border-forest-200/80">
                  <MapPin className="w-4 h-4 text-forest-700 shrink-0" />
                  <span>
                    <strong>{t.home.activeFarmNotice}</strong> {location.name}
                    {location.district && <span> ({location.district})</span>}
                  </span>
                </div>
              ) : (
                <div className="text-2xs text-ink-muted">
                  {language === 'ne' 
                    ? 'कुनै दर्ता आवश्यक छैन • जीपीएसबाट सिधै आफ्नो खेतको मौसम र माटो योजना हेर्नुहोस्'
                    : 'No account required • Instant GPS auto-setup for local climate and crop planning'}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Authentic Nepalese Agricultural Photography */}
          <div className="lg:col-span-5 relative min-h-[280px] sm:min-h-[360px] lg:min-h-full bg-stone-100 border-t lg:border-t-0 lg:border-l border-stone-200">
            <img
              src="/images/hero-terrace.jpg"
              alt="Terraced agricultural hillsides in Nepal"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="eager"
            />
            {/* Editorial Caption Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-stone-900/85 backdrop-blur-xs text-white p-3 text-2xs leading-snug">
              <span className="font-semibold text-stone-200 block sm:inline">
                {language === 'ne' ? 'नेपालको पहाडी गरा: ' : 'Nepal Hill Terraces: '}
              </span>
              <span className="text-stone-300">{t.home.heroImageCaption}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. MAIN SERVICES SECTION (3 Photo-Led Public Service Cards)
          Reference: EU Main Policies & Services Grid
          ============================================================ */}
      <section className="space-y-6">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            {t.home.servicesTitle}
          </h2>
          <p className="text-sm text-ink-secondary mt-1">
            {t.home.servicesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Service 1: Plan your crops */}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col justify-between shadow-xs hover:border-forest-600 transition-colors group">
            <div>
              <div className="h-48 overflow-hidden bg-stone-100 relative">
                <img
                  src="/images/crop-planning.jpg"
                  alt="Farmer tending crops in Nepal"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-forest-800 text-2xs font-bold uppercase tracking-wider px-2 py-1 rounded shadow-xs">
                  {language === 'ne' ? 'बाली चक्र' : 'Crop Rotation'}
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-bold text-ink group-hover:text-forest-800 transition-colors">
                  {t.home.service1Title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {t.home.service1Desc}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={onStartPlanning}
                className="w-full flex items-center justify-between py-2.5 px-4 rounded bg-stone-50 hover:bg-forest-50 text-forest-800 text-xs font-bold border border-stone-200 hover:border-forest-200 transition-colors"
              >
                <span>{t.home.service1Action}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Service 2: Understand your climate */}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col justify-between shadow-xs hover:border-forest-600 transition-colors group">
            <div>
              <div className="h-48 overflow-hidden bg-stone-100 relative">
                <img
                  src="/images/climate-monsoon.jpg"
                  alt="Monsoon rainfall and clouds in Nepal"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-forest-800 text-2xs font-bold uppercase tracking-wider px-2 py-1 rounded shadow-xs">
                  {language === 'ne' ? 'जलवायु र वर्षा' : 'Climate & Rain'}
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-bold text-ink group-hover:text-forest-800 transition-colors">
                  {t.home.service2Title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {t.home.service2Desc}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={onExploreWeather}
                className="w-full flex items-center justify-between py-2.5 px-4 rounded bg-stone-50 hover:bg-forest-50 text-forest-800 text-xs font-bold border border-stone-200 hover:border-forest-200 transition-colors"
              >
                <span>{t.home.service2Action}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Service 3: Learn about soil and water */}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden flex flex-col justify-between shadow-xs hover:border-forest-600 transition-colors group">
            <div>
              <div className="h-48 overflow-hidden bg-stone-100 relative">
                <img
                  src="/images/soil-water.jpg"
                  alt="Agricultural soil and irrigation water in Nepal"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-white/95 text-forest-800 text-2xs font-bold uppercase tracking-wider px-2 py-1 rounded shadow-xs">
                  {language === 'ne' ? 'माटो र सिँचाइ' : 'Soil & Irrigation'}
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-bold text-ink group-hover:text-forest-800 transition-colors">
                  {t.home.service3Title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {t.home.service3Desc}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={onExploreSoil}
                className="w-full flex items-center justify-between py-2.5 px-4 rounded bg-stone-50 hover:bg-forest-50 text-forest-800 text-xs font-bold border border-stone-200 hover:border-forest-200 transition-colors"
              >
                <span>{t.home.service3Action}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. HOW IT WORKS (Structured 4-Step Process)
          Reference: EU Public Service Step Guides
          ============================================================ */}
      <section id="how-it-works" className="bg-white border border-stone-200 rounded-xl p-6 sm:p-10 space-y-8 shadow-xs">
        <div className="max-w-3xl">
          <span className="text-2xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2 py-1 rounded inline-block mb-1">
            {language === 'ne' ? 'निर्देशिका' : 'Step-by-step guidance'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            {t.home.howItWorksTitle}
          </h2>
          <p className="text-sm text-ink-secondary mt-1">
            {t.home.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="space-y-3 relative">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                1
              </span>
              <h3 className="font-bold text-base text-ink">{t.home.step1Title}</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed pl-11">
              {t.home.step1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 relative">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                2
              </span>
              <h3 className="font-bold text-base text-ink">{t.home.step2Title}</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed pl-11">
              {t.home.step2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 relative">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                3
              </span>
              <h3 className="font-bold text-base text-ink">{t.home.step3Title}</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed pl-11">
              {t.home.step3Desc}
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 relative">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold flex items-center justify-center text-sm shrink-0">
                4
              </span>
              <h3 className="font-bold text-base text-ink">{t.home.step4Title}</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed pl-11">
              {t.home.step4Desc}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onStartPlanning}
            className="flex items-center gap-2 px-6 py-2.5 rounded bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-xs transition-colors"
          >
            <span>{t.home.ctaPrimary}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============================================================
          4. NEPAL AGRICULTURE SECTION (Photo-Led Editorial Storytelling)
          Hills vs Plains Context
          ============================================================ */}
      <section className="space-y-6">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            {t.home.nepalAgriTitle}
          </h2>
          <p className="text-sm text-ink-secondary mt-1 max-w-3xl">
            {t.home.nepalAgriSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hills Article */}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-56 overflow-hidden bg-stone-100">
                <img
                  src="/images/nepal-hills.jpg"
                  alt="Terraced agricultural hills in Nepal"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6 space-y-2">
                <span className="text-2xs font-semibold text-forest-700 uppercase tracking-wider">
                  {language === 'ne' ? 'पहाडी कृषि' : 'Agroecological Region: Mid-Hills'}
                </span>
                <h3 className="text-lg font-bold text-ink">
                  {t.home.nepalHillsTitle}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {t.home.nepalHillsDesc}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  const pokhara = NEPAL_PRESETS.find((p) => p.name.includes('Pokhara')) || NEPAL_PRESETS[0];
                  setLocation(presetToLocation(pokhara));
                  onStartPlanning();
                }}
                className="text-xs font-bold text-forest-800 hover:text-forest-900 flex items-center gap-1 hover:underline"
              >
                <span>{language === 'ne' ? 'पहाडी क्षेत्रको योजना हेर्नुहोस् (पोखरा/काठमाडौं)' : 'Load Hill Region Example (Pokhara / Kathmandu)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Plains / Terai Article */}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-56 overflow-hidden bg-stone-100">
                <img
                  src="/images/nepal-plains.jpg"
                  alt="Agricultural plains and rice crops in Nepal Terai"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-6 space-y-2">
                <span className="text-2xs font-semibold text-forest-700 uppercase tracking-wider">
                  {language === 'ne' ? 'तराई कृषि' : 'Agroecological Region: Terai'}
                </span>
                <h3 className="text-lg font-bold text-ink">
                  {t.home.nepalPlainsTitle}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                  {t.home.nepalPlainsDesc}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => {
                  const chitwan = NEPAL_PRESETS.find((p) => p.name.includes('Chitwan')) || NEPAL_PRESETS[1];
                  setLocation(presetToLocation(chitwan));
                  onStartPlanning();
                }}
                className="text-xs font-bold text-forest-800 hover:text-forest-900 flex items-center gap-1 hover:underline"
              >
                <span>{language === 'ne' ? 'तराई क्षेत्रको योजना हेर्नुहोस् (चितवन/रुपन्देही)' : 'Load Terai Region Example (Chitwan / Rupandehi)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. DATA AND METHODOLOGY (Public Service Transparency)
          Reference: EU Transparency & Open Data Standards
          ============================================================ */}
      <section className="bg-stone-100 border border-stone-300/80 rounded-xl p-6 sm:p-10 space-y-6">
        <div className="flex items-start gap-4">
          <ShieldCheck className="w-7 h-7 text-forest-700 shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-ink">
              {t.home.methodologyTitle}
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
              {t.home.methodologyDesc}
            </p>
            <p className="text-2xs text-ink-muted pt-2 border-t border-stone-200">
              {t.home.methodologyDisclaimer}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-200">
          <div className="flex flex-wrap items-center gap-4 text-2xs text-ink-secondary font-medium">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              {language === 'ne' ? 'नासा (NASA POWER) उपग्रह तथ्याङ्क' : 'NASA POWER Ingestion'}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              {language === 'ne' ? 'नार्क (NARC) कृषि क्यालेन्डर' : 'NARC Crop Calendars'}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
              {language === 'ne' ? 'ओपनस्ट्रिटम्याप (OpenStreetMap) नक्सा' : 'OpenStreetMap Geocoding'}
            </span>
          </div>

          <button
            onClick={onViewMethodology}
            className="flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-950 underline"
          >
            <span>{t.home.methodologyAction}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
}

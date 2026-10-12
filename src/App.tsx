import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { TRANSLATIONS } from './data/translations';
import { ServiceHome } from './components/ServiceHome';
import { GuidedFarmPlanner } from './components/GuidedFarmPlanner';
import { ClimateExplorer } from './components/ClimateExplorer';
import { RotationPlanner } from './components/RotationPlanner';
import { ComparisonWorkspace } from './components/ComparisonWorkspace';
import { MethodologyView } from './components/MethodologyView';
import { FarmIntelligenceDashboard } from './components/FarmIntelligenceDashboard';
import { 
  Sprout, 
  MapPin, 
  CloudRain, 
  RotateCw, 
  BookText, 
  Globe, 
  Menu, 
  X,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Compass,
  Loader2,
  Satellite
} from 'lucide-react';
import { reverseGeocodeCoordinates, coordinatesToLocation } from './services/geocoding';
import type { AppStep } from './types';

export function App() {
  const { state, setLanguage, setLocation } = useApp();
  const { language, location } = state;
  const t = TRANSLATIONS[language];

  // Primary navigation: 'home' | 'my-farm' | 'climate' | 'planner' | 'about'
  const [currentStep, setCurrentStep] = useState<AppStep>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-location permission banner state
  const [showLocationBanner, setShowLocationBanner] = useState<boolean>(() => {
    // Only show if no location is selected and user hasn't explicitly dismissed this session
    return !location && sessionStorage.getItem('farmshift_location_dismissed') !== 'true';
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationFeedback, setLocationFeedback] = useState<string | null>(null);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationFeedback(language === 'ne' ? 'ब्राउजरमा स्थान सुविधा उपलब्ध छैन।' : 'Geolocation not supported.');
      return;
    }

    setDetectingLocation(true);
    setLocationFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const loc = await reverseGeocodeCoordinates(latitude, longitude);
          setLocation(loc);
          setLocationFeedback(
            language === 'ne' 
              ? `स्थान पत्ता लाग्यो: ${loc.name}! योजना सुरु गर्दै...` 
              : `Found location: ${loc.name}! Launching planner...`
          );
        } catch {
          const fallbackLoc = coordinatesToLocation(latitude, longitude);
          fallbackLoc.source = 'gps';
          setLocation(fallbackLoc);
        } finally {
          setDetectingLocation(false);
          // Wait briefly for user visual satisfaction, then jump directly to planning!
          setTimeout(() => {
            setShowLocationBanner(false);
            navigateTo('my-farm');
          }, 800);
        }
      },
      (err) => {
        setDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationFeedback(
            language === 'ne' 
              ? 'स्थान अनुमति पाइएन। तपाईं नक्सा वा सूचीबाट पनि छान्न सक्नुहुन्छ।' 
              : 'Location permission was denied. You can still select manually.'
          );
        } else {
          setLocationFeedback(
            language === 'ne' 
              ? 'स्थान पत्ता लगाउन सकिएन।' 
              : 'Could not detect location.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const dismissLocationBanner = () => {
    setShowLocationBanner(false);
    sessionStorage.setItem('farmshift_location_dismissed', 'true');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ne' : 'en');
  };

  const navigateTo = (step: AppStep) => {
    setCurrentStep(step);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen bg-stone-50 text-ink flex flex-col font-sans selection:bg-forest-100 selection:text-forest`}>
      {/* ============================================================
          1. OFFICIAL PUBLIC SERVICE HEADER (Reference: EU Header)
          - Top official identity strip
          - Clear brand + Agricultural symbol + descriptor
          - Predictable navigation + Language switcher + CTA
          ============================================================ */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-50">
        {/* Top Public Service Identification Strip */}
        <div className="bg-stone-100 border-b border-stone-200/80 px-4 sm:px-6 py-1.5 text-2xs text-ink-secondary">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-600 inline-block" />
              <span className="font-medium">
                {t.nav.officialBanner}
              </span>
            </div>

            {/* Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-white hover:bg-stone-200 border border-stone-300 text-xs font-bold text-forest-800 transition-colors shrink-0"
              title="Toggle English / नेपाली"
            >
              <Globe className="w-3.5 h-3.5 text-forest-700" />
              <span>{t.nav.languageToggle}</span>
            </button>
          </div>
        </div>

        {/* Main Header & Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-18 py-2.5 flex items-center justify-between gap-4">
          {/* Logo & Brand Descriptor */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
            onClick={() => navigateTo('home')}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-forest-700 p-1.5 flex items-center justify-center shadow-xs group-hover:bg-forest-800 transition-colors shrink-0">
              <img
                src="/logo-symbol-white.png"
                alt="FarmShift Nepal Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-ink leading-tight whitespace-nowrap">
                {t.nav.brand}
              </span>
              <p className="text-[11px] sm:text-xs text-ink-muted leading-tight whitespace-nowrap">
                {t.nav.subtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => navigateTo('home')}
              className={`px-3 py-2 rounded transition-colors whitespace-nowrap ${
                currentStep === 'home'
                  ? 'bg-forest-50 text-forest-800 font-bold border-b-2 border-forest-700'
                  : 'text-ink-secondary hover:text-ink hover:bg-stone-100'
              }`}
            >
              {t.nav.home}
            </button>

            <button
              onClick={() => navigateTo('my-farm')}
              className={`px-3 py-2 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentStep === 'my-farm' || currentStep === 'workspace'
                  ? 'bg-forest-50 text-forest-800 font-bold border-b-2 border-forest-700'
                  : 'text-ink-secondary hover:text-ink hover:bg-stone-100'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-forest-600" />
              <span>{t.nav.myFarm}</span>
            </button>

            <button
              onClick={() => navigateTo('intelligence')}
              className={`px-3 py-2 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentStep === 'intelligence'
                  ? 'bg-forest-50 text-forest-800 font-bold border-b-2 border-forest-700'
                  : 'text-ink-secondary hover:text-ink hover:bg-stone-100'
              }`}
            >
              <Satellite className="w-3.5 h-3.5 text-forest-600" />
              <span>{t.nav.intelligence}</span>
            </button>

            <button
              onClick={() => navigateTo('climate')}
              className={`px-3 py-2 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentStep === 'climate' || currentStep === 'weather'
                  ? 'bg-forest-50 text-forest-800 font-bold border-b-2 border-forest-700'
                  : 'text-ink-secondary hover:text-ink hover:bg-stone-100'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5 text-forest-600" />
              <span>{t.nav.climate}</span>
            </button>

            <button
              onClick={() => navigateTo('planner')}
              className={`px-3 py-2 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentStep === 'planner' || currentStep === 'plan-crops' || currentStep === 'compare'
                  ? 'bg-forest-50 text-forest-800 font-bold border-b-2 border-forest-700'
                  : 'text-ink-secondary hover:text-ink hover:bg-stone-100'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-forest-600" />
              <span>{t.nav.planner}</span>
            </button>

            <button
              onClick={() => navigateTo('about')}
              className={`px-3 py-2 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                currentStep === 'about' || currentStep === 'methodology'
                  ? 'bg-forest-50 text-forest-800 font-bold border-b-2 border-forest-700'
                  : 'text-ink-secondary hover:text-ink hover:bg-stone-100'
              }`}
            >
              <BookText className="w-3.5 h-3.5 text-forest-600" />
              <span>{t.nav.about}</span>
            </button>
          </nav>

          {/* Action / Current Selected Pill */}
          <div className="flex items-center gap-2.5 shrink-0">
            {location && (
              <div 
                onClick={() => navigateTo('my-farm')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs text-ink hover:border-forest-600 cursor-pointer transition-colors"
                title={location.name}
              >
                <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                <span className="font-semibold truncate max-w-[130px]">{location.name}</span>
              </div>
            )}

            <button
              onClick={() => navigateTo('my-farm')}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <Sprout className="w-4 h-4" />
              <span>{t.nav.startPlanning}</span>
            </button>

            {/* Mobile menu toggle button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-ink-secondary hover:text-ink hover:bg-stone-100 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-fade-in">
            <button
              onClick={() => navigateTo('home')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-semibold flex items-center justify-between ${
                currentStep === 'home' ? 'bg-forest-50 text-forest-800' : 'text-ink hover:bg-stone-100'
              }`}
            >
              <span>{t.nav.home}</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => navigateTo('my-farm')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-semibold flex items-center justify-between ${
                currentStep === 'my-farm' || currentStep === 'workspace' ? 'bg-forest-50 text-forest-800' : 'text-ink hover:bg-stone-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-600" />
                {t.nav.myFarm}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => navigateTo('intelligence')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-semibold flex items-center justify-between ${
                currentStep === 'intelligence' ? 'bg-forest-50 text-forest-800' : 'text-ink hover:bg-stone-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-forest-600" />
                {t.nav.intelligence}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => navigateTo('climate')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-semibold flex items-center justify-between ${
                currentStep === 'climate' || currentStep === 'weather' ? 'bg-forest-50 text-forest-800' : 'text-ink hover:bg-stone-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-forest-600" />
                {t.nav.climate}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => navigateTo('planner')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-semibold flex items-center justify-between ${
                currentStep === 'planner' || currentStep === 'plan-crops' || currentStep === 'compare' ? 'bg-forest-50 text-forest-800' : 'text-ink hover:bg-stone-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-forest-600" />
                {t.nav.planner}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={() => navigateTo('about')}
              className={`w-full text-left px-3 py-2.5 rounded text-sm font-semibold flex items-center justify-between ${
                currentStep === 'about' || currentStep === 'methodology' ? 'bg-forest-50 text-forest-800' : 'text-ink hover:bg-stone-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <BookText className="w-4 h-4 text-forest-600" />
                {t.nav.about}
              </span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <div className="pt-2 border-t border-stone-200">
              <button
                onClick={toggleLanguage}
                className="w-full text-center py-2.5 rounded bg-stone-100 text-forest-800 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span>{language === 'en' ? 'नेपालीमा हेर्नुहोस् (नेपाली)' : 'Switch to English'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================
          LOCATION PERMISSION PROMPT BANNER
          Asks user for location permission to automatically select place and proceed
          ============================================================ */}
      {showLocationBanner && !location && (
        <div className="bg-forest-900 text-white border-b border-forest-800 px-4 sm:px-6 py-3 shadow-md animate-fade-in relative z-40">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Compass className="w-4 h-4 text-forest-200" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold leading-tight">
                  {language === 'ne'
                    ? 'तपाईंको खेतको स्थान स्वतः पत्ता लगाएर बाली योजना सुरु गर्ने?'
                    : 'Allow FarmShift to detect your location for instant crop & climate planning?'}
                </p>
                <p className="text-2xs sm:text-xs text-forest-200 mt-0.5">
                  {language === 'ne'
                    ? 'ब्राउजरको स्थान अनुमति दिएमा तपाईंको खेतको हावापानी र माटो अनुसार तुरुन्तै योजना खुल्नेछ।'
                    : 'Using your GPS lets FarmShift automatically fetch NASA climate records and prepare rotation plans.'}
                </p>
                {locationFeedback && (
                  <p className="text-2xs text-amber-300 font-semibold mt-1">
                    {locationFeedback}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={requestUserLocation}
                disabled={detectingLocation}
                className="flex items-center gap-1.5 px-4 py-2 rounded bg-forest-600 hover:bg-forest-500 active:bg-forest-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                {detectingLocation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5 text-white" />
                )}
                <span>
                  {detectingLocation
                    ? (language === 'ne' ? 'पत्ता लगाइँदैछ...' : 'Detecting...')
                    : (language === 'ne' ? 'मेरो स्थान पत्ता लगाउनुहोस्' : 'Yes, Use My Location')}
                </span>
              </button>

              <button
                type="button"
                onClick={dismissLocationBanner}
                className="p-1.5 text-forest-300 hover:text-white rounded hover:bg-forest-800/80 transition-colors cursor-pointer"
                aria-label={language === 'ne' ? 'बन्द गर्नुहोस्' : 'Dismiss'}
                title={language === 'ne' ? 'पछि हातैले छान्ने' : 'Choose manually later'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          2. MAIN CONTENT AREA
          ============================================================ */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full">
        {/* VIEW 1: PHOTO-LED EDITORIAL HOMEPAGE (EU Reference) */}
        {currentStep === 'home' && (
          <ServiceHome
            onStartPlanning={() => navigateTo('my-farm')}
            onExploreWeather={() => navigateTo('climate')}
            onExploreSoil={() => navigateTo('my-farm')}
            onViewMethodology={() => navigateTo('about')}
          />
        )}

        {/* VIEW 2: GUIDED MY FARM WORKFLOW (Location & Soil inputs) */}
        {(currentStep === 'my-farm' || currentStep === 'workspace') && (
          <GuidedFarmPlanner
            onPlanComplete={() => navigateTo('planner')}
            onExploreWeather={() => navigateTo('climate')}
          />
        )}

        {/* VIEW 2B: DEDICATED NASA SATELLITE INTELLIGENCE DASHBOARD */}
        {currentStep === 'intelligence' && (
          <FarmIntelligenceDashboard
            onNavigateToCropPlanner={() => navigateTo('planner')}
          />
        )}

        {/* VIEW 3: CLIMATE INFORMATION (NASA POWER Ingestion) */}
        {(currentStep === 'climate' || currentStep === 'weather') && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
                  {language === 'ne' ? 'नासा भू-उपग्रह तथ्याङ्क' : 'NASA Earth Observations'}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-ink mt-1">
                  {t.weather.title}
                </h1>
                <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                  {t.weather.subtitle}
                </p>
              </div>

              <button
                onClick={() => navigateTo('my-farm')}
                className="text-xs font-semibold text-forest-800 hover:text-forest-900 flex items-center gap-1 border border-stone-300 px-3 py-1.5 rounded bg-white hover:bg-stone-50"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{language === 'ne' ? 'खेतको स्थान परिवर्तन गर्नुहोस्' : 'Change Farm Location'}</span>
              </button>
            </div>

            <ClimateExplorer />
            
            <div className="flex justify-between items-center pt-4 border-t border-stone-200">
              <button
                onClick={() => navigateTo('my-farm')}
                className="text-xs font-semibold text-ink-secondary hover:text-ink px-4 py-2 rounded bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                ← {language === 'ne' ? 'खेतको विवरणमा फर्कनुहोस्' : 'Back to My Farm'}
              </button>

              <button
                onClick={() => navigateTo('planner')}
                className="flex items-center gap-2 px-6 py-2.5 rounded bg-forest-700 hover:bg-forest-800 text-white font-bold text-sm shadow-xs transition-colors"
              >
                <span>{language === 'ne' ? 'बाली चक्र योजनामा जानुहोस्' : 'Proceed to Rotation Plans'}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: CROP PLANNING & COMPARISON MATRIX */}
        {(currentStep === 'planner' || currentStep === 'plan-crops' || currentStep === 'compare') && (
          <div className="space-y-8">
            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
                  {language === 'ne' ? 'बाली चक्र विश्लेषण' : 'Crop Rotation Analysis'}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-ink mt-1">
                  {language === 'ne' ? 'सिफारिस गरिएका बाली चक्र विकल्पहरू' : 'Recommended Crop Rotation Options'}
                </h1>
                <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                  {language === 'ne'
                    ? 'तपाईंको खेत, माटो र मौसमका आधारमा तयार गरिएका बहु-सिजन बाली चक्रहरू।'
                    : 'Multi-season cropping pathways evaluated against water demand, climate heat, and soil replenishing.'}
                </p>
              </div>

              <button
                onClick={() => navigateTo('my-farm')}
                className="text-xs font-semibold text-forest-800 hover:text-forest-900 flex items-center gap-1 border border-stone-300 px-3 py-1.5 rounded bg-white hover:bg-stone-50"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{language === 'ne' ? 'खेतका प्राथमिकता फेर्नुहोस्' : 'Adjust Farm Inputs'}</span>
              </button>
            </div>

            {/* Rotations list and sequence generator */}
            <RotationPlanner onProceedToComparison={() => navigateTo('compare')} />

            {/* Matrix comparison workspace */}
            <div className="pt-4 border-t border-stone-200">
              <ComparisonWorkspace />
            </div>
          </div>
        )}

        {/* VIEW 5: ABOUT FARMSHIFT & METHODOLOGY */}
        {(currentStep === 'about' || currentStep === 'methodology') && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-xs">
              <span className="text-2xs font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
                {language === 'ne' ? 'पारदर्शिता र तथ्याङ्क' : 'Transparency & Data Integrity'}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-ink mt-1">
                {language === 'ne' ? 'फार्मसिफ्टको बारेमा तथा वैज्ञानिक आधार' : 'About FarmShift & Scientific Methodology'}
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                {language === 'ne'
                  ? 'नासा भू-उपग्रह, मौसम मोडेल र नेपालका कृषि मापदण्डहरू कसरी प्रयोग हुन्छन् भन्ने खुला जानकारी।'
                  : 'Full disclosure on NASA datasets, agroclimatic variables, rule-based heuristics, and inherent boundaries.'}
              </p>
            </div>

            <MethodologyView />
          </div>
        )}
      </main>

      {/* ============================================================
          3. STRUCTURED, TRUSTWORTHY FOOTER (Reference: EU Portal Footer)
          ============================================================ */}
      <footer className="border-t border-stone-300 bg-white py-10 sm:py-12 text-xs text-ink-secondary mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-stone-200">
            {/* Column 1: Brand & Identity */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-forest-700 p-1 flex items-center justify-center">
                  <img
                    src="/logo-symbol-white.png"
                    alt="FarmShift Nepal"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-bold text-base text-ink">
                  {t.nav.brand}
                </span>
              </div>
              <p className="text-xs text-ink-secondary leading-relaxed">
                {t.footer.aboutDesc}
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
                {t.footer.quickLinks}
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => navigateTo('home')} className="hover:text-forest-800 hover:underline">
                    {t.nav.home}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('my-farm')} className="hover:text-forest-800 hover:underline">
                    {t.nav.myFarm}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('climate')} className="hover:text-forest-800 hover:underline">
                    {t.nav.climate}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('planner')} className="hover:text-forest-800 hover:underline">
                    {t.nav.planner}
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('about')} className="hover:text-forest-800 hover:underline">
                    {t.nav.about}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Data Sources & Standards */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
                {t.footer.resources}
              </h4>
              <ul className="space-y-1.5 text-xs text-ink-muted">
                <li>• {t.footer.sources}</li>
                <li>• {t.footer.standards}</li>
                <li>• {t.footer.cartography}</li>
                <li>
                  <button onClick={() => navigateTo('about')} className="text-forest-800 font-semibold hover:underline">
                    {language === 'ne' ? 'पद्धति तथा सीमितताहरू →' : 'Methodology & Limitations →'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Language & Service Notice */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-ink">
                {language === 'ne' ? 'भाषा विकल्प' : 'Language Selection'}
              </h4>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-stone-100 hover:bg-stone-200 border border-stone-300 font-semibold text-xs text-forest-800 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'नेपालीमा हेर्नुहोस् (नेपाली)' : 'Switch to English'}</span>
              </button>
              <p className="text-2xs text-ink-muted leading-relaxed pt-2">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>

          {/* Bottom Copyright & Terms bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-2xs text-ink-muted">
            <p>{t.footer.copyright}</p>
            <p>
              {language === 'ne'
                ? 'नासा स्पेस एप्स च्यालेन्ज २०२६ • “फिल्ड शिफ्ट: नासा तथ्याङ्कबाट खेती अनुकूलन”'
                : 'NASA Space Apps Challenge 2026 • “Field Shift: Adapting Farms with NASA Data”'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

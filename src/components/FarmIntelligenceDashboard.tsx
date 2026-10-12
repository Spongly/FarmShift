import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button } from './ui';
import { fetchClimateData } from '../services/nasaPower';
import { fetchWeatherForecast, type WeatherForecastData } from '../services/weatherForecast';
import { NASA_GIBS_LAYERS, type SatelliteLayerOption } from '../services/satelliteLayers';
import { generateFarmIntelligenceReport, type FarmIntelligenceReport } from '../services/farmIntelligenceEngine';
import { InteractiveSatelliteMap } from './InteractiveSatelliteMap';
import { 
  Satellite, 
  CloudRain, 
  Droplets, 
  Thermometer, 
  RefreshCw, 
  Layers, 
  Download, 
  ShieldAlert, 
  CheckCircle, 
  Info, 
  ChevronRight, 
  TrendingUp,
  Waves
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface FarmIntelligenceDashboardProps {
  onNavigateToCropPlanner?: () => void;
}

export function FarmIntelligenceDashboard({ onNavigateToCropPlanner }: FarmIntelligenceDashboardProps) {
  const { state, setClimateLoading, setClimateData, setClimateError } = useApp();
  const { location, climateData, climateStatus, language, soil } = state;

  const [forecast, setForecast] = useState<WeatherForecastData | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);

  const [selectedLayer, setSelectedLayer] = useState<SatelliteLayerOption>(
    NASA_GIBS_LAYERS.find((layer) => layer.id === 'smap_surface_sm') ?? NASA_GIBS_LAYERS[0]
  );
  const [selectedLayerDate, setSelectedLayerDate] = useState<string>('2024-05-01');
  const [chartView, setChartView] = useState<'moisture_temp' | 'rainfall_accumulation' | 'forecast_7day'>('moisture_temp');

  // Load Climate + Forecast data when location changes
  useEffect(() => {
    if (!location) return;

    if (!climateData && climateStatus.state !== 'loading') {
      loadNasaPowerData();
    }

    loadForecastData();
  }, [location?.latitude, location?.longitude]);

  const loadNasaPowerData = async () => {
    if (!location) return;
    setClimateLoading();
    const res = await fetchClimateData(location);
    if (res.success) {
      setClimateData(res.data);
    } else {
      setClimateError(res.error.message);
    }
  };

  const loadForecastData = async () => {
    if (!location) return;
    setForecastLoading(true);
    setForecastError(null);
    try {
      const data = await fetchWeatherForecast(location.latitude, location.longitude);
      setForecast(data);
    } catch (err: any) {
      setForecastError(err.message || 'Failed to load weather forecast.');
    } finally {
      setForecastLoading(false);
    }
  };

  // Generate Farm Intelligence Report
  const intelligenceReport: FarmIntelligenceReport = generateFarmIntelligenceReport(
    climateData,
    forecast,
    undefined,
    soil.texture
  );

  // Export Historical Trends to CSV
  const handleExportCsv = () => {
    if (!climateData) return;
    const headers = [
      'Date',
      'Rainfall_mm',
      'T2M_Mean_C',
      'T2M_Max_C',
      'T2M_Min_C',
      'Soil_Moisture_Surface_Fraction',
      'Soil_Moisture_RootZone_Fraction',
      'Land_Surface_Temp_C',
      'Relative_Humidity_Pct',
      'Solar_Radiation_MJ_m2'
    ];

    const rows = climateData.daily.map((d) => [
      d.dateKey || (d.date instanceof Date ? d.date.toISOString().slice(0, 10) : String(d.date)),
      d.precipitation != null ? d.precipitation.toFixed(2) : '',
      d.tempMean != null ? d.tempMean.toFixed(2) : '',
      d.tempMax != null ? d.tempMax.toFixed(2) : '',
      d.tempMin != null ? d.tempMin.toFixed(2) : '',
      d.soilMoistureSurface != null ? d.soilMoistureSurface.toFixed(3) : '',
      d.soilMoistureRootZone != null ? d.soilMoistureRootZone.toFixed(3) : '',
      d.surfaceTemp != null ? d.surfaceTemp.toFixed(2) : '',
      d.humidity != null ? d.humidity.toFixed(1) : '',
      d.solarRadiation != null ? d.solarRadiation.toFixed(2) : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `farmshift_nasa_data_${location?.name || 'nepal'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!location) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Card padding="lg" className="text-center py-12 border-dashed border-2 border-stone-300">
          <Satellite className="w-12 h-12 text-forest-700 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-ink">
            {language === 'ne' ? 'भू-उपग्रह अनुगमनका लागि खेतको स्थान चयन गर्नुहोस्' : 'Select Farm Location for Satellite Intelligence'}
          </h2>
          <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">
            {language === 'ne'
              ? 'नासा (NASA SMAP, GPM IMERG, MODIS) र मौसम पूर्वानुमानको तथ्याङ्क प्राप्त गर्न कृपया आफ्नो जिल्ला वा स्थान चयन गर्नुहोस्।'
              : 'Choose your district or farm coordinates to view real-time NASA Earth observations, soil moisture dynamics, and localized agro-meteorological advisories.'}
          </p>
        </Card>
      </div>
    );
  }

  // Recent 60 days slice for high-resolution trend chart
  const recentDays = climateData?.daily.slice(-60) || [];
  const chartData = recentDays.map((d) => {
    const dStr = d.dateKey ? `${d.dateKey.slice(4, 6)}-${d.dateKey.slice(6, 8)}` : (d.date instanceof Date ? d.date.toISOString().slice(5, 10) : '01-01');
    return {
      date: dStr,
      rainfall: d.precipitation ?? 0,
      tempMax: d.tempMax ?? 0,
      tempMin: d.tempMin ?? 0,
      soilSurface: d.soilMoistureSurface != null ? Math.round(d.soilMoistureSurface * 100) : null,
      soilRootZone: d.soilMoistureRootZone != null ? Math.round(d.soilMoistureRootZone * 100) : null,
      surfaceTemp: d.surfaceTemp != null ? Math.round(d.surfaceTemp * 10) / 10 : null,
    };
  });

  // Forecast 7-day chart data
  const forecastChartData = (forecast?.daily || []).map((d) => ({
    date: d.date.slice(5),
    tMax: d.tempMax,
    tMin: d.tempMin,
    rain: d.precipitationSum,
    soil0to1: d.soilMoisture0to1cm ? Math.round(d.soilMoisture0to1cm * 100) : null,
    weatherDesc: language === 'ne' ? d.weatherDescriptionNe : d.weatherDescriptionEn,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="bg-forest-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-sm">
              <Satellite className="w-3.5 h-3.5" />
              <span>NASA Earth Observations & Agricultural Decision Support</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {language === 'ne'
                ? `नासा भू-उपग्रह कृषि विश्लेषण: ${location.name}`
                : `NASA Satellite Farm Intelligence: ${location.name}`}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl">
              {language === 'ne'
                ? `अक्षांश: ${location.latitude.toFixed(4)}°, देशान्तर: ${location.longitude.toFixed(4)}° • उचाइ: ${location.elevation ? location.elevation + ' मिटर' : 'नेपाल'}। नासा SMAP, GPM IMERG, र MODIS बाट प्राप्त आधिकारिक तथ्याङ्क।`
                : `Coordinates: ${location.latitude.toFixed(4)}°N, ${location.longitude.toFixed(4)}°E • Elevation: ${location.elevation ? location.elevation + 'm' : 'Nepal'}. Driven by NASA SMAP, GPM IMERG, and MODIS observations.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                loadNasaPowerData();
                loadForecastData();
              }}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${climateStatus.state === 'loading' || forecastLoading ? 'animate-spin' : ''}`} />
              {language === 'ne' ? 'तथ्याङ्क ताजा गर्नुहोस्' : 'Refresh Data'}
            </Button>
            {climateData && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleExportCsv}
                className="bg-emerald-600/90 text-white border-transparent hover:bg-emerald-500"
              >
                <Download className="w-4 h-4 mr-1.5" />
                {language === 'ne' ? 'CSV डाउनलोड' : 'Export CSV'}
              </Button>
            )}
          </div>
        </div>

        {/* Provenance and Disclaimer Note */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {language === 'ne'
                ? 'भू-उपग्रह तथ्याङ्कले क्षेत्रीय ग्रिड (~१०-५० कि.मी.) प्रतिनिधित्व गर्दछ, स्थानीय खेतको सूक्ष्म-जलवायु अनुसार अवलोकन गर्न सल्लाह दिइन्छ।'
                : 'Satellite observations represent regional grid cells (~10–50 km). Use local farm microclimate observations alongside this data.'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <span>NASA POWER: <strong>v2.0 (Agroclimatology)</strong></span>
            <span>•</span>
            <span>Forecast: <strong>ECMWF/ICON Blend</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Key Real-Time Satellite & Forecast Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Soil Moisture (SMAP / MERRA-2) */}
        <Card padding="md" className="border-t-4 border-t-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {language === 'ne' ? 'माटोको चिस्यान (SMAP)' : 'Soil Moisture (SMAP)'}
            </span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-ink">
            {(intelligenceReport.soilMoistureStatus.rootZoneFraction * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-ink-muted mt-1 font-medium">
            {language === 'ne' ? 'जरा क्षेत्रको ओस' : 'Root-Zone Wetness'} • {language === 'ne' ? intelligenceReport.soilMoistureStatus.statusNe : intelligenceReport.soilMoistureStatus.statusEn}
          </div>
          <div className="mt-3 text-[11px] text-stone-500 bg-stone-50 p-2 rounded border border-stone-200">
            {language === 'ne'
              ? `सतहको चिस्यान: ${(intelligenceReport.soilMoistureStatus.surfaceFraction * 100).toFixed(0)}% (०-५ से.मी.)`
              : `Surface Wetness: ${(intelligenceReport.soilMoistureStatus.surfaceFraction * 100).toFixed(0)}% (0-5 cm)`}
          </div>
        </Card>

        {/* Metric 2: Rainfall (GPM IMERG & Forecast) */}
        <Card padding="md" className="border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {language === 'ne' ? 'वर्षा (GPM / पूर्वानुमान)' : 'Precipitation (GPM / Fcst)'}
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-ink">
            {forecastLoading || forecastError
              ? '—'
              : <>{intelligenceReport.precipitationStatus.forecastNext7DaysMm.toFixed(1)} <span className="text-sm font-semibold">mm</span></>}
          </div>
          <div className="text-xs text-ink-muted mt-1 font-medium">
            {forecastError
              ? (language === 'ne' ? 'पूर्वानुमान लोड हुन सकेन' : 'Forecast unavailable')
              : (language === 'ne' ? 'आगामी ७ दिने कुल वर्षा' : '7-Day Forecast Accumulation')}
          </div>
          <div className="mt-3 text-[11px] text-stone-500 bg-stone-50 p-2 rounded border border-stone-200">
            {language === 'ne'
              ? `पछिल्लो ३० दिनको वास्तविक वर्षा: ${intelligenceReport.precipitationStatus.recentAccumulationMm.toFixed(0)} mm`
              : `Past 30-Day Observed Rain: ${intelligenceReport.precipitationStatus.recentAccumulationMm.toFixed(0)} mm`}
          </div>
        </Card>

        {/* Metric 3: Land Surface & Air Temperature */}
        <Card padding="md" className="border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {language === 'ne' ? 'सतह तथा हावाको तापक्रम' : 'Surface & Air Temp'}
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-ink">
            {forecast?.current.temperature.toFixed(1) ?? '22.0'}°C
          </div>
          <div className="text-xs text-ink-muted mt-1 font-medium">
            {language === 'ne' ? 'वर्तमान हावाको तापक्रम' : 'Current Air Temp'} • {forecast?.summary.highestTemp ?? '28'}°C {language === 'ne' ? 'अधिकतम' : 'Max'}
          </div>
          <div className="mt-3 text-[11px] text-stone-500 bg-stone-50 p-2 rounded border border-stone-200">
            {language === 'ne'
              ? `भू-सतह तापक्रम (MODIS LST): ${intelligenceReport.temperatureStatus.maxForecastTemp}°C`
              : `Land Surface Skin Temp: ${intelligenceReport.temperatureStatus.maxForecastTemp}°C`}
          </div>
        </Card>

        {/* Metric 4: Agro-Climatic Risk Level */}
        <Card padding="md" className={`border-t-4 ${
          intelligenceReport.overallRisk === 'severe' ? 'border-t-red-500' :
          intelligenceReport.overallRisk === 'high' ? 'border-t-orange-500' :
          intelligenceReport.overallRisk === 'moderate' ? 'border-t-amber-500' : 'border-t-emerald-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              {language === 'ne' ? 'कृषि जोखिम सूचकांक' : 'Agro-Risk Index'}
            </span>
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-ink">
            {intelligenceReport.riskScore} <span className="text-sm font-semibold text-ink-muted">/ 100</span>
          </div>
          <div className="text-xs text-ink-muted mt-1 font-medium">
            {language === 'ne' 
              ? `जोखिम स्तर: ${intelligenceReport.overallRisk === 'low' ? 'न्यून' : intelligenceReport.overallRisk === 'moderate' ? 'मध्यम' : intelligenceReport.overallRisk === 'high' ? 'उच्च' : 'गम्भीर'}`
              : `Risk Level: ${intelligenceReport.overallRisk.toUpperCase()}`}
          </div>
          <div className="mt-3 text-[11px] text-stone-500 bg-stone-50 p-2 rounded border border-stone-200">
            {language === 'ne'
              ? `${intelligenceReport.insights.length} वटा व्यावहारिक सुझावहरू सक्रिय छन्`
              : `${intelligenceReport.insights.length} active agro-meteorological advisories`}
          </div>
        </Card>
      </div>

      {/* Prominent Flood Early Warning System Card */}
      {intelligenceReport.floodEarlyWarning.level !== 'safe' && (
        <div className={`rounded-xl border p-5 shadow-sm transition-all ${
          intelligenceReport.floodEarlyWarning.level === 'critical'
            ? 'bg-red-50 border-red-300 text-red-950'
            : intelligenceReport.floodEarlyWarning.level === 'warning'
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-lg shrink-0 ${
                intelligenceReport.floodEarlyWarning.level === 'critical'
                  ? 'bg-red-600 text-white'
                  : intelligenceReport.floodEarlyWarning.level === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}>
                <Waves className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    intelligenceReport.floodEarlyWarning.level === 'critical'
                      ? 'bg-red-200 text-red-900'
                      : intelligenceReport.floodEarlyWarning.level === 'warning'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-blue-200 text-blue-900'
                  }`}>
                    {language === 'ne' ? 'नासा SMAP बाढी पूर्वचेतावनी' : 'NASA SMAP FLOOD EARLY WARNING'}
                  </span>
                  <span className="text-xs font-semibold text-stone-600">
                    {intelligenceReport.floodEarlyWarning.level.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold">
                  {language === 'ne' ? intelligenceReport.floodEarlyWarning.titleNe : intelligenceReport.floodEarlyWarning.titleEn}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed opacity-90 max-w-3xl">
                  {language === 'ne' ? intelligenceReport.floodEarlyWarning.messageNe : intelligenceReport.floodEarlyWarning.messageEn}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xs p-3 rounded-lg border border-stone-200/60 shrink-0 self-start md:self-center">
              <div className="text-center px-2">
                <div className="text-xs text-stone-500 font-medium">
                  {language === 'ne' ? 'माटो संतृप्ति' : 'Soil Saturation'}
                </div>
                <div className="text-base font-black text-ink">
                  {intelligenceReport.floodEarlyWarning.saturationPct}%
                </div>
              </div>
              <div className="h-8 w-px bg-stone-300" />
              <div className="text-center px-2">
                <div className="text-xs text-stone-500 font-medium">
                  {language === 'ne' ? 'आगामी वर्षा' : '7-Day Rain'}
                </div>
                <div className="text-base font-black text-ink">
                  {intelligenceReport.floodEarlyWarning.forecastRainMm.toFixed(0)} mm
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actionable Agricultural Recommendations Section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-forest-700" />
              {language === 'ne' ? 'भू-उपग्रहमा आधारित किसान सल्लाह र सुझावहरू' : 'Actionable Agricultural Intelligence Advisories'}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {language === 'ne' ? intelligenceReport.summaryNe : intelligenceReport.summaryEn}
            </p>
          </div>
          {onNavigateToCropPlanner && (
            <Button size="sm" variant="primary" onClick={onNavigateToCropPlanner} className="self-start sm:self-auto">
              {language === 'ne' ? 'बाली चक्र योजना बनाउनुहोस्' : 'Plan Crop Rotation'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        <div className="p-6 divide-y divide-stone-100">
          {intelligenceReport.insights.length === 0 ? (
            <div className="py-6 text-center text-sm text-stone-500">
              {language === 'ne' ? 'हाल कुनै गम्भीर वातावरणीय जोखिम पहिचान गरिएको छैन।' : 'No critical environmental risks identified for the current period.'}
            </div>
          ) : (
            intelligenceReport.insights.map((insight) => (
              <div key={insight.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full uppercase tracking-wide ${
                        insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        insight.severity === 'warning' ? 'bg-amber-100 text-amber-800' :
                        insight.severity === 'positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.category === 'flood' ? <Waves className="w-3 h-3 text-red-600" /> : null}
                        <span>{insight.severity}</span>
                        {insight.category === 'flood' ? <span>• FLOOD EARLY WARNING</span> : null}
                      </span>
                      <h3 className="text-base font-bold text-ink">
                        {language === 'ne' ? insight.titleNe : insight.titleEn}
                      </h3>
                    </div>

                    <p className="text-sm text-stone-600">
                      {language === 'ne' ? insight.descriptionNe : insight.descriptionEn}
                    </p>

                    {/* Practical recommendation box */}
                    <div className={`rounded-lg p-3 text-xs font-medium mt-2 flex items-start gap-2 ${
                      insight.category === 'flood'
                        ? 'bg-red-50/80 border border-red-200 text-red-950'
                        : 'bg-emerald-50/70 border border-emerald-200/60 text-emerald-950'
                    }`}>
                      <span className={`font-bold uppercase tracking-wider shrink-0 ${
                        insight.category === 'flood' ? 'text-red-800' : 'text-emerald-800'
                      }`}>
                        {language === 'ne' ? 'सुझाव:' : 'Action:'}
                      </span>
                      <span>{language === 'ne' ? insight.recommendedActionNe : insight.recommendedActionEn}</span>
                    </div>
                  </div>

                  {/* Evidence & Provenance Pill */}
                  <div className="w-full md:w-64 bg-stone-50 rounded-lg p-3 border border-stone-200 text-xs shrink-0 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {language === 'ne' ? 'प्रमाण र थ्रेसहोल्ड' : 'Evidence & Threshold'}
                    </div>
                    <div className="flex justify-between text-stone-700">
                      <span className="text-stone-500">{language === 'ne' ? insight.evidence.indicatorNe : insight.evidence.indicatorEn}:</span>
                      <span className="font-bold">{insight.evidence.observedValue}</span>
                    </div>
                    <div className="flex justify-between text-stone-700">
                      <span className="text-stone-500">{language === 'ne' ? 'सीमा (थ्रेसहोल्ड):' : 'Trigger limit:'}</span>
                      <span>{insight.evidence.threshold}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-200">
                      {insight.evidence.source}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interactive NASA GIBS Satellite Map Layer Preview */}
      <div className="@container bg-white rounded-xl border border-stone-200 shadow-sm p-3 @[32rem]:p-6 space-y-4">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <Layers className="w-5 h-5 text-forest-700 shrink-0" />
              {language === 'ne' ? 'नासा GIBS उपग्रह पत्र (Layers)' : 'NASA GIBS Satellite Layer Explorer'}
            </h2>
            <p className="text-xs text-ink-muted">
              {language === 'ne'
                ? 'नासा EOSDIS Global Imagery Browse Services (GIBS) बाट उपग्रह तस्बिरहरू अवलोकन गर्नुहोस्।'
                : 'Browse near-real-time and historical imagery layers directly from NASA EOSDIS GIBS.'}
            </p>
          </div>

          <div className="-mx-1 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]">
            <div className="flex items-center gap-2 min-w-max px-1">
              {NASA_GIBS_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setSelectedLayer(layer)}
                  className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap touch-manipulation ${
                    selectedLayer.id === layer.id
                      ? 'bg-forest-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {language === 'ne' ? layer.nameNe : layer.nameEn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Layer Info Strip */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-semibold text-stone-800">
              {language === 'ne' ? selectedLayer.descriptionNe : selectedLayer.descriptionEn}
            </div>
            <div className="text-stone-500">
              {language === 'ne' ? 'उपकरण:' : 'Instrument:'} {selectedLayer.instrument} • {language === 'ne' ? 'रिजोल्युसन:' : 'Resolution:'} {selectedLayer.resolution} • {selectedLayer.attribution}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">{language === 'ne' ? 'मिति:' : 'Observation Date:'}</span>
            <input
              type="date"
              value={selectedLayerDate}
              onChange={(e) => setSelectedLayerDate(e.target.value)}
              className="text-xs border border-stone-300 rounded px-2 py-1 bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
          </div>
        </div>

        {/* Real Interactive Leaflet Satellite WMTS Map */}
        <InteractiveSatelliteMap
          location={location}
          selectedLayer={selectedLayer}
          dateStr={selectedLayerDate}
          language={language}
        />
      </div>

      {/* Historical Trend Charts & CSV Section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-forest-700" />
              {language === 'ne' ? 'तथ्याङ्क प्रवृत्ति तथा ऐतिहासिक विश्लेषण' : 'Trend Analysis & Historical NASA Observations'}
            </h2>
            <p className="text-xs text-ink-muted">
              {language === 'ne'
                ? 'माटोको चिस्यान, वर्षा र तापक्रमको समय-श्रृङ्खला (Time Series) विश्लेषण।'
                : 'Continuous multi-parameter time series for soil moisture, precipitation, and thermal dynamics.'}
            </p>
          </div>

          {/* Chart View Toggle */}
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg">
            <button
              onClick={() => setChartView('moisture_temp')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                chartView === 'moisture_temp' ? 'bg-white text-ink shadow-sm' : 'text-stone-600 hover:text-ink'
              }`}
            >
              {language === 'ne' ? 'चिस्यान र जमिन तापक्रम' : 'Moisture & Surface Temp'}
            </button>
            <button
              onClick={() => setChartView('rainfall_accumulation')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                chartView === 'rainfall_accumulation' ? 'bg-white text-ink shadow-sm' : 'text-stone-600 hover:text-ink'
              }`}
            >
              {language === 'ne' ? 'दैनिक वर्षा र अधिकतम ताप' : 'Daily Rain & Air Temp'}
            </button>
            <button
              onClick={() => setChartView('forecast_7day')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                chartView === 'forecast_7day' ? 'bg-white text-ink shadow-sm' : 'text-stone-600 hover:text-ink'
              }`}
            >
              {language === 'ne' ? '७-दिने पूर्वानुमान' : '7-Day Forecast'}
            </button>
          </div>
        </div>

        {/* Chart Rendering */}
        <div className="h-80 w-full pt-2">
          {chartView === 'moisture_temp' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#0284c7' }} />
                <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} unit="°C" tick={{ fontSize: 11, fill: '#d97706' }} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `${value} ${name.includes('Temp') || name.includes('तापक्रम') ? '°C' : '%'}`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="soilSurface"
                  name={language === 'ne' ? 'सतह चिस्यान % (SMAP)' : 'Surface Moisture % (SMAP)'}
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="soilRootZone"
                  name={language === 'ne' ? 'जरा चिस्यान % (Root-Zone)' : 'Root-Zone Moisture %'}
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="surfaceTemp"
                  name={language === 'ne' ? 'जमिन सतह तापक्रम °C (TS)' : 'Earth Skin Temp °C (TS)'}
                  stroke="#d97706"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {chartView === 'rainfall_accumulation' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" unit="mm" tick={{ fontSize: 11, fill: '#059669' }} />
                <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} unit="°C" tick={{ fontSize: 11, fill: '#dc2626' }} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `${value} ${name.includes('Rain') || name.includes('वर्षा') ? 'mm' : '°C'}`,
                    name
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="rainfall"
                  name={language === 'ne' ? 'दैनिक वर्षा mm (GPM)' : 'Daily Rain mm (GPM)'}
                  fill="#38bdf8"
                  radius={[3, 3, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tempMax"
                  name={language === 'ne' ? 'अधिकतम तापक्रम °C' : 'Max Air Temp °C'}
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tempMin"
                  name={language === 'ne' ? 'न्यूनतम तापक्रम °C' : 'Min Air Temp °C'}
                  stroke="#2563eb"
                  strokeWidth={1.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {chartView === 'forecast_7day' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis yAxisId="left" unit="mm" tick={{ fontSize: 11, fill: '#0284c7' }} />
                <YAxis yAxisId="right" orientation="right" unit="°C" tick={{ fontSize: 11, fill: '#ea580c' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg border border-stone-200 shadow-md text-xs space-y-1">
                          <p className="font-bold text-ink">{label} ({data.weatherDesc})</p>
                          <p className="text-blue-600 font-semibold">Rainfall: {data.rain} mm</p>
                          <p className="text-orange-600">Temp: {data.tMin}°C to {data.tMax}°C</p>
                          {data.soil0to1 && <p className="text-emerald-700">Soil Moisture (0-1cm): {data.soil0to1}%</p>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="rain"
                  name={language === 'ne' ? 'पूर्वानुमानित वर्षा (mm)' : 'Forecast Rain (mm)'}
                  fill="#60a5fa"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tMax"
                  name={language === 'ne' ? 'अधिकतम तापक्रम (°C)' : 'Max Temp (°C)'}
                  stroke="#ea580c"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="tMin"
                  name={language === 'ne' ? 'न्यूनतम तापक्रम (°C)' : 'Min Temp (°C)'}
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

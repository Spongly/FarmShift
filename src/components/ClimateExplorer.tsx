import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { fetchClimateData, computeMonthlyNormals } from '../services/nasaPower';
import { NEPALI_MONTHS } from '../data/translations';
import { Card, Button, StatusBadge, Alert } from './ui';
import { CloudRain, RefreshCw } from 'lucide-react';

export function ClimateExplorer() {
  const { setClimateLoading, setClimateData, setClimateError } = useApp();
  const { location, climateData, climateStatus, language } = useApp().state;
  const [activeTab, setActiveTab] = useState<'normals' | 'summary'>('normals');

  const handleFetchData = async () => {
    if (!location) return;
    setClimateLoading();
    const result = await fetchClimateData(location);
    if (result.success) {
      setClimateData(result.data);
    } else {
      setClimateError(result.error.message);
    }
  };

  if (!location) {
    return (
      <Card padding="lg" className="text-center py-12">
        <CloudRain className="w-10 h-10 text-stone-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-ink">
          {language === 'ne' ? 'कुनै पनि खेतको स्थान छानिएको छैन' : 'No Location Selected'}
        </h3>
        <p className="text-sm text-ink-muted mt-1 max-w-sm mx-auto">
          {language === 'ne'
            ? 'नासा (NASA POWER) भू-उपग्रहबाट मौसमको तथ्याङ्क प्राप्त गर्न कृपया पहिले नक्साबाट वा खोजी गरेर खेतको स्थान छान्नुहोस्।'
            : 'Select or search for a farm location on the map to query NASA POWER Earth observations.'}
        </p>
      </Card>
    );
  }

  // Pre-format normals with bilingual month labels
  const rawNormals = climateData ? computeMonthlyNormals(climateData.monthly) : [];
  const normals = rawNormals.map((item) => ({
    ...item,
    displayMonth: language === 'ne' ? (NEPALI_MONTHS[item.month] ?? item.monthShort) : item.monthShort,
  }));

  // Helper for seasonal names in Nepali
  const getSeasonTitle = (seasonName: string) => {
    if (language !== 'ne') return seasonName;
    if (seasonName.toLowerCase().includes('monsoon') && !seasonName.toLowerCase().includes('pre') && !seasonName.toLowerCase().includes('post')) {
      return 'बर्खे / मनसुन (Monsoon)';
    }
    if (seasonName.toLowerCase().includes('winter')) {
      return 'हिउँद (Winter)';
    }
    if (seasonName.toLowerCase().includes('pre-monsoon') || seasonName.toLowerCase().includes('spring')) {
      return 'पूर्व-मनसुन / वसन्त (Pre-Monsoon)';
    }
    if (seasonName.toLowerCase().includes('post-monsoon') || seasonName.toLowerCase().includes('autumn')) {
      return 'शरद / मनसुन पछिको समय (Post-Monsoon)';
    }
    return seasonName;
  };

  const getSeasonNotes = (seasonName: string, defaultNotes: string) => {
    if (language !== 'ne') return defaultNotes;
    const lower = seasonName.toLowerCase();
    if (lower.includes('winter')) {
      return 'मङ्सिर–माघ (डिसेम्बर–फेब्रुअरी): चिसो र सुक्खा मौसम। हिउँदे (रवि) बालीहरूको वृद्धि हुने समय।';
    }
    if (lower.includes('pre-monsoon') || lower.includes('spring')) {
      return 'फागुन–वैशाख (मार्च–मे): तापक्रम बढ्ने र स्थानीय मेघगर्जनसहित हल्का वर्षा हुने समय।';
    }
    if (lower.includes('monsoon') && !lower.includes('pre') && !lower.includes('post')) {
      return 'जेठ–भदौ (जुन–सेप्टेम्बर): वर्षभरिको ७०–८०% वर्षा हुने मुख्य मनसुनी मौसम। वर्षे (खरिब) बालीको समय।';
    }
    if (lower.includes('post-monsoon') || lower.includes('autumn')) {
      return 'असोज–कात्तिक (अक्टोबर–नोभेम्बर): वर्षा रोकिने, बाली भित्र्याउने र हिउँदे खेतीका लागि जमिन तयार गर्ने समय।';
    }
    return defaultNotes;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <Card padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
              {language === 'ne' ? 'नासा भू-उपग्रह विश्लेषण' : 'CLIMATE INTELLIGENCE'}
            </span>
            <StatusBadge
              status={
                climateStatus.state === 'loading'
                  ? 'loading'
                  : climateStatus.state === 'success'
                  ? 'success'
                  : climateStatus.state === 'error'
                  ? 'error'
                  : 'idle'
              }
              label={
                climateStatus.state === 'loading'
                  ? language === 'ne' ? 'नासाबाट तथ्याङ्क लिँदै...' : 'Querying NASA POWER...'
                  : climateStatus.state === 'success'
                  ? language === 'ne' ? 'नासा तथ्याङ्क प्राप्त भयो' : 'NASA Data Synced'
                  : climateStatus.state === 'error'
                  ? language === 'ne' ? 'जोडिन असफल' : 'Sync Error'
                  : language === 'ne' ? 'तथ्याङ्क लोड गर्न बाँकी' : 'Awaiting Query'
              }
            />
          </div>
          <h2 className="text-lg font-bold text-ink mt-1.5">
            {location.name} {language === 'ne' ? 'मौसम तथा वातावरणीय प्रोफाइल' : 'Environmental Profile'}
          </h2>
          <p className="text-xs text-ink-muted">
            {language === 'ne' ? 'भौगोलिक स्थान:' : 'Coordinates:'} {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            {location.elevation ? ` • ${language === 'ne' ? 'उचाइ:' : 'Elevation:'} ~${location.elevation} m` : ''}
          </p>
        </div>

        <Button
          variant={climateData ? 'secondary' : 'primary'}
          size="sm"
          loading={climateStatus.state === 'loading'}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleFetchData}
        >
          {climateData
            ? language === 'ne' ? 'नासा तथ्याङ्क पुनः लोड गर्नुहोस्' : 'Refresh NASA POWER'
            : language === 'ne' ? 'नासा मौसम तथ्याङ्क हेर्नुहोस्' : 'Load NASA Climate Data'}
        </Button>
      </Card>

      {climateStatus.state === 'error' && (
        <Alert
          type="error"
          title={language === 'ne' ? 'नासा तथ्याङ्क प्राप्त हुन सकेन' : 'NASA POWER Query Failed'}
        >
          {climateStatus.message}
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={handleFetchData}>
              {language === 'ne' ? 'पुनः प्रयास गर्नुहोस्' : 'Retry Query'}
            </Button>
          </div>
        </Alert>
      )}

      {climateData && (
        <>
          {/* Key Indicators Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card padding="sm" className="bg-white border-stone-200">
              <span className="text-2xs text-ink-muted font-bold uppercase tracking-wider block">
                {language === 'ne' ? 'वार्षिक कुल वर्षा' : 'Annual Rain'}
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-ink mt-0.5">
                {climateData.summary.annualPrecipitation ?? '--'} <span className="text-xs font-normal text-ink-secondary">{language === 'ne' ? 'मिमी' : 'mm'}</span>
              </div>
              <span className="text-2xs text-ink-subtle mt-0.5 block">
                {language === 'ne' ? 'ऐतिहासिक औसत वर्षा' : 'Observed mean'}
              </span>
            </Card>

            <Card padding="sm" className="bg-white border-stone-200">
              <span className="text-2xs text-ink-muted font-bold uppercase tracking-wider block">
                {language === 'ne' ? 'औसत तापक्रम' : 'Mean Temp'}
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-ink mt-0.5">
                {climateData.summary.meanAnnualTemp ?? '--'} <span className="text-xs font-normal text-ink-secondary">°C</span>
              </div>
              <span className="text-2xs text-ink-subtle mt-0.5 block">
                {language === 'ne' ? 'वार्षिक सतह वायु तापक्रम' : 'Annual 2m air temp'}
              </span>
            </Card>

            <Card padding="sm" className="bg-white border-stone-200">
              <span className="text-2xs text-ink-muted font-bold uppercase tracking-wider block">
                {language === 'ne' ? 'गर्मी / जाडो औसत' : 'Summer / Winter'}
              </span>
              <div className="text-lg sm:text-xl font-bold font-mono text-ink mt-0.5">
                {climateData.summary.meanSummerTemp ?? '--'}° / {climateData.summary.meanWinterTemp ?? '--'}°
              </div>
              <span className="text-2xs text-ink-subtle mt-0.5 block">
                {language === 'ne' ? 'बर्खे / हिउँदे सन्तुलन' : 'Kharif / Rabi balance'}
              </span>
            </Card>

            <Card padding="sm" className="bg-white border-stone-200">
              <span className="text-2xs text-ink-muted font-bold uppercase tracking-wider block">
                {language === 'ne' ? 'तथ्याङ्कको शुद्धता' : 'Data Integrity'}
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-forest-700 mt-0.5">
                {Math.round(climateData.summary.dataCompleteness * 100)}%
              </div>
              <span className="text-2xs text-ink-subtle mt-0.5 block">
                {language === 'ne' ? 'नासा भू-उपग्रह अवलोकन' : 'Valid NASA observations'}
              </span>
            </Card>
          </div>

          {/* Interactive Chart Section */}
          <Card padding="md" className="space-y-4 bg-white border-stone-200 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">
                  {language === 'ne' ? 'मासिक वर्षा र तापक्रमको चक्र' : 'Monthly Climate Normals & Distribution'}
                </h3>
                <p className="text-2xs sm:text-xs text-ink-secondary">
                  {language === 'ne'
                    ? 'स्तम्भ बारमा वर्षा (मिमी) र रेखाहरूमा अधिकतम, औसत र न्यूनतम तापक्रम (°C)'
                    : 'Precipitation (bars) with Mean / Max / Min temperatures (lines)'}
                </p>
              </div>

              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-md text-xs font-semibold">
                <button
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === 'normals' ? 'bg-white text-forest-900 shadow-2xs font-bold' : 'text-ink-secondary hover:text-ink'
                  }`}
                  onClick={() => setActiveTab('normals')}
                >
                  {language === 'ne' ? 'मासिक चक्र' : 'Monthly Cycle'}
                </button>
                <button
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === 'summary' ? 'bg-white text-forest-900 shadow-2xs font-bold' : 'text-ink-secondary hover:text-ink'
                  }`}
                  onClick={() => setActiveTab('summary')}
                >
                  {language === 'ne' ? 'मौसमी विवरण' : 'Seasonal Breakdown'}
                </button>
              </div>
            </div>

            {activeTab === 'normals' && (
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={normals} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                    <XAxis
                      dataKey="displayMonth"
                      tick={{ fill: '#44403C', fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="rain"
                      orientation="left"
                      tick={{ fill: '#44403C', fontSize: 11 }}
                      unit={language === 'ne' ? 'mm' : 'mm'}
                    />
                    <YAxis
                      yAxisId="temp"
                      orientation="right"
                      tick={{ fill: '#44403C', fontSize: 11 }}
                      unit="°C"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E7E5E4',
                        fontSize: '12px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                      }}
                      formatter={(val: any, name: string) => {
                        const unit = name.includes('°C') ? '°C' : 'mm';
                        return [`${val} ${unit}`, name];
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                    />
                    <Bar
                      yAxisId="rain"
                      dataKey="precipitation"
                      name={language === 'ne' ? 'वर्षा (मिमी)' : 'Rainfall (mm)'}
                      fill="#5A9030"
                      radius={[3, 3, 0, 0]}
                    />
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tempMax"
                      name={language === 'ne' ? 'अधिकतम तापक्रम (°C)' : 'Max Temp (°C)'}
                      stroke="#B33847"
                      strokeWidth={1.8}
                      dot={false}
                    />
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tempMean"
                      name={language === 'ne' ? 'औसत तापक्रम (°C)' : 'Mean Temp (°C)'}
                      stroke="#1C1917"
                      strokeWidth={2.2}
                      dot={{ r: 2.5 }}
                    />
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="tempMin"
                      name={language === 'ne' ? 'न्यूनतम तापक्रम (°C)' : 'Min Temp (°C)'}
                      stroke="#2563EB"
                      strokeWidth={1.8}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                {climateData.seasonal.map((season) => (
                  <div key={season.season} className="p-4 border border-stone-200 rounded-lg bg-stone-50 space-y-2">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold text-xs text-ink">
                        {getSeasonTitle(season.season)}
                      </span>
                    </div>
                    <div className="text-sm font-mono font-bold text-forest-800">
                      {language === 'ne' ? 'कुल वर्षा:' : 'Rain:'} {season.precipitation ?? '--'} mm
                    </div>
                    <div className="text-xs text-ink-secondary">
                      {language === 'ne' ? 'औसत तापक्रम:' : 'Mean Temp:'} {season.tempMean ?? '--'}°C
                    </div>
                    <p className="text-2xs text-ink-muted leading-relaxed pt-1 border-t border-stone-200">
                      {getSeasonNotes(season.season, season.notes)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Scientific Provenance Note */}
            <div className="pt-3 text-2xs text-ink-muted flex flex-col sm:flex-row justify-between gap-2 border-t border-stone-200">
              <span>
                {language === 'ne'
                  ? 'तथ्याङ्क स्रोत: नासा (NASA POWER CERES/MERRA-2) कृषि मौसम मोडेल'
                  : 'Dataset: NASA POWER CERES/MERRA2 native resolution agroclimatology'}
              </span>
              <span className="font-mono">
                {language === 'ne' ? 'अवधि:' : 'Window:'} {climateData.source.startDate} – {climateData.source.endDate}
              </span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

import React from 'react';
import { useApp } from '../context/AppContext';
import { CROPS } from '../data/cropData';
import { TRANSLATIONS, NEPALI_CROP_NAMES, NEPALI_SEASONS, NEPALI_CATEGORIES } from '../data/translations';
import { runRotationEngine } from '../services/rotationEngine';
import { predictCropSuitability, encodeSoilTexture } from '../services/cropMlModel';
import { Card, SectionHeader, Button, Select, Label, ScoreBar, Alert } from './ui';
import type { CropId, PriorityMode } from '../types';
import { ArrowRight, Sparkles, Check, Cpu } from 'lucide-react';

export function RotationPlanner({ onProceedToComparison }: { onProceedToComparison?: () => void }) {
  const {
    state,
    setCandidate,
    setPriority,
    setPlanningSeasons,
    setStartSeason,
    setRotationResult,
    toggleCandidateSelection,
  } = useApp();

  const { farmInputs, location, climateData, soil, rotationResult, selectedCandidateIds, language } = state;
  const t = TRANSLATIONS[language];
  const p = t.planner;

  const candidateIds = farmInputs.candidateCropIds ?? [];
  const priority = farmInputs.priority ?? 'balanced';
  const planningSeasons = farmInputs.planningSeasons ?? 4;
  const startSeason = farmInputs.planningStartSeason ?? 'kharif';

  // Helper to get bilingual crop name and category
  const getCropDisplay = (cropId: string, englishName: string, category: string, localName: string) => {
    if (language === 'ne') {
      const nep = NEPALI_CROP_NAMES[cropId];
      return {
        title: nep?.nepaliName ?? localName ?? englishName,
        subtitle: nep?.localSubtitle ?? englishName,
        category: NEPALI_CATEGORIES[category] ?? category,
      };
    }
    return {
      title: englishName,
      subtitle: localName,
      category: category.toUpperCase(),
    };
  };

  const getSeasonDisplay = (seasonStr: string) => {
    if (language === 'ne') {
      return NEPALI_SEASONS[seasonStr] ?? seasonStr;
    }
    return seasonStr;
  };

  // Toggle crop selection
  const handleToggleCrop = (cropId: CropId) => {
    const isSelected = candidateIds.includes(cropId);
    setCandidate(cropId, !isSelected);
  };

  // Select all or recommended presets
  const handleSelectDefaultSet = () => {
    const defaultIds: CropId[] = [
      'rice-transplanted',
      'wheat',
      'maize',
      'lentil',
      'mustard',
      'soybean',
    ];
    defaultIds.forEach((id) => setCandidate(id, true));
  };

  const handleRunAnalysis = () => {
    if (!location) return;
    const defaultIds: CropId[] = ['rice-transplanted', 'wheat', 'lentil', 'maize', 'mustard', 'soybean'];
    const inputs: import('../types').FarmInputs = {
      location,
      soil,
      planningSeasons,
      candidateCropIds: candidateIds.length > 0 ? (candidateIds as CropId[]) : defaultIds,
      excludedCropIds: [],
      previousCropId: farmInputs.previousCropId ?? null,
      priority,
      planningStartSeason: startSeason,
    };
    const result = runRotationEngine(inputs, climateData);
    setRotationResult(result);
  };

  return (
    <div className="space-y-6">
      {/* 1. Configuration Panel */}
      <Card padding="md" className="space-y-5">
        <SectionHeader
          mono={p.step1Tag}
          title={p.title}
          subtitle={p.subtitle}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-stone-200 py-4">
          <div>
            <Label htmlFor="plan-priority">{p.priorityLabel}</Label>
            <Select
              id="plan-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityMode)}
            >
              <option value="balanced">
                {language === 'ne' ? 'सन्तुलित योजना (Balanced Multi-Objective)' : 'Balanced Multi-Objective'}
              </option>
              <option value="water-conservation">
                {language === 'ne' ? 'पानीको बचत / खडेरी सहन सक्ने (Water Conservation)' : 'Water Conservation (Drought Resilient)'}
              </option>
              <option value="climate-suitability">
                {language === 'ne' ? 'मौसम तथा गर्मी अनुकूल (Climate & Heat)' : 'Climate & Heat Suitability'}
              </option>
              <option value="soil-health">
                {language === 'ne' ? 'माटो सुधार र नाइट्रोजन वृद्धि (Soil Health)' : 'Soil Health & Nitrogen Building'}
              </option>
            </Select>
            <p className="text-2xs text-ink-muted mt-1">{p.priorityCalibrate}</p>
          </div>

          <div>
            <Label htmlFor="plan-seasons">{p.horizonLabel}</Label>
            <Select
              id="plan-seasons"
              value={planningSeasons}
              onChange={(e) => setPlanningSeasons(parseInt(e.target.value, 10))}
            >
              <option value={2}>{p.season2}</option>
              <option value={3}>{p.season3}</option>
              <option value={4}>{p.season4}</option>
              <option value={6}>{p.season6}</option>
            </Select>
            <p className="text-2xs text-ink-muted mt-1">{p.horizonHelp}</p>
          </div>

          <div>
            <Label htmlFor="plan-start">{p.initialSeasonLabel}</Label>
            <Select
              id="plan-start"
              value={startSeason}
              onChange={(e) => setStartSeason(e.target.value as 'kharif' | 'rabi')}
            >
              <option value="kharif">{t.priority.kharif}</option>
              <option value="rabi">{t.priority.rabi}</option>
            </Select>
            <p className="text-2xs text-ink-muted mt-1">{p.initialSeasonHelp}</p>
          </div>
        </div>

        {/* Crop Candidate Pool */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div>
              <Label className="mb-0">
                {p.candidatePoolTitle} ({candidateIds.length} {language === 'ne' ? 'छानिएका' : 'selected'})
              </Label>
              <p className="text-2xs text-ink-muted">{p.candidatePoolSubtitle}</p>
            </div>
            <button
              onClick={handleSelectDefaultSet}
              className="text-xs text-forest-700 hover:text-forest-900 hover:underline font-semibold self-start sm:self-auto"
            >
              {p.selectStandardSet}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
            {CROPS.map((crop) => {
              const isSelected = candidateIds.includes(crop.id);
              const display = getCropDisplay(crop.id, crop.name, crop.category, crop.localName);
              const seasonDisplay = getSeasonDisplay(crop.calendar.season);

              return (
                <button
                  key={crop.id}
                  onClick={() => handleToggleCrop(crop.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-forest-600 bg-forest-50/80 text-forest-900 shadow-xs ring-1 ring-forest-600/20'
                      : 'border-stone-200 hover:border-stone-300 bg-white text-ink'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xs font-medium text-ink-muted">{display.category}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-forest-700" />}
                  </div>
                  <div className="text-xs font-bold mt-1 leading-tight">{display.title}</div>
                  <div className="text-2xs text-ink-secondary mt-0.5">{display.subtitle}</div>
                  <div className="text-3xs text-ink-muted mt-1 pt-1 border-t border-stone-100 flex items-center justify-between">
                    <span>{seasonDisplay}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            size="md"
            variant="primary"
            disabled={!location}
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleRunAnalysis}
          >
            {p.computeButton}
          </Button>
        </div>
      </Card>

      {/* 2. Analytical Results Section */}
      {rotationResult && (
        <div className="space-y-4">
          <SectionHeader
            mono={p.step2Tag}
            title={`${p.resultsTitle} (${rotationResult.candidates.length} ${language === 'ne' ? 'विकल्पहरू' : 'Candidate Pathways'})`}
            subtitle={p.resultsSubtitle}
          />

          {rotationResult.candidates.length === 0 ? (
            <Alert type="warning" title={p.noSequencesTitle}>
              {p.noSequencesText}
            </Alert>
          ) : (
            <div className="space-y-3">
              {rotationResult.candidates.map((candidate, idx) => {
                const isSelectedForComparison = selectedCandidateIds.includes(candidate.id);
                return (
                  <Card key={candidate.id} padding="md" className="border-l-4 border-l-forest-600 hover:shadow-xs transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Sequence pathway */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 bg-stone-100 rounded font-bold text-ink">
                            #{idx + 1}
                          </span>
                          <span className="text-xs text-ink-muted">{p.overallMatch}</span>
                          <span className="font-mono font-bold text-sm text-forest-700">
                            {Math.round(candidate.score.overall * 100)}%
                          </span>
                        </div>

                        {/* Sequence Flow */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {candidate.sequence.crops.map((sc, i) => {
                            const c = CROPS.find((cr) => cr.id === sc.cropId);
                            const cropName = c ? getCropDisplay(c.id, c.name, c.category, c.localName).title : sc.cropId;
                            const seasonName = getSeasonDisplay(sc.season);

                            return (
                              <React.Fragment key={i}>
                                <div className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded text-xs">
                                  <div className="font-bold text-ink">{cropName}</div>
                                  <div className="text-2xs text-ink-secondary">{seasonName}</div>
                                </div>
                                {i < candidate.sequence.crops.length - 1 && (
                                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* ML Prediction Badge */}
                        {(() => {
                          const firstCrop = candidate.sequence.crops[0]?.cropId;
                          if (!firstCrop) return null;
                          const ml = predictCropSuitability(firstCrop, {
                            elevationMeters: location?.elevation ?? 1200,
                            meanAnnualTemp: climateData?.summary.meanAnnualTemp ?? 20,
                            annualPrecipitation: climateData?.summary.annualPrecipitation ?? 1200,
                            sowingMonthTemp: 22,
                            seasonRainfallMm: 600,
                            soilPh: soil.ph ?? 6.2,
                            soilTextureScore: encodeSoilTexture(soil.texture),
                            irrigationAvailable: soil.irrigationAvailable ? 1 : 0,
                          });
                          return (
                            <div className="flex items-center gap-1.5 pt-1 text-3xs text-ink-muted">
                              <Cpu className="w-3 h-3 text-forest-700" />
                              <span>ML Suitability:</span>
                              <span className="font-bold text-forest-800 font-mono">
                                {Math.round(ml.predictedProbability * 100)}% ({ml.suitabilityClass})
                              </span>
                            </div>
                          );
                        })()}

                        {/* Assessment note */}
                        <p className="text-xs text-ink-muted pt-1">
                          <strong className="text-ink-secondary">{p.engineAssessment}</strong>{' '}
                          {language === 'ne' 
                            ? `रणनीतिक प्राथमिकता अनुसार मूल्याङ्कन। समग्र अनुकूलता अङ्क: ${(candidate.score.overall * 100).toFixed(0)}/१००।`
                            : candidate.rankingExplanation}
                        </p>
                      </div>

                      {/* Right: Scores breakdown & Comparison toggle */}
                      <div className="w-full md:w-64 space-y-2 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-stone-200 md:pl-4">
                        <ScoreBar label={p.climateMatch} value={candidate.score.climateSuitability} />
                        <ScoreBar label={p.waterCompatibility} value={candidate.score.waterCompatibility} />
                        <ScoreBar label={p.soilBenefit} value={candidate.score.soilHealthBenefit} />

                        <div className="pt-2 flex justify-between items-center">
                          <button
                            onClick={() => toggleCandidateSelection(candidate.id)}
                            className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                              isSelectedForComparison
                                ? 'bg-forest-700 text-white border-forest-700 font-semibold'
                                : 'bg-white text-ink border-stone-300 hover:bg-stone-50'
                            }`}
                          >
                            {isSelectedForComparison ? p.selectedForCompare : p.addToCompare}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {selectedCandidateIds.length >= 2 && onProceedToComparison && (
            <div className="sticky bottom-4 z-20 flex justify-end">
              <Button
                variant="primary"
                size="md"
                className="shadow-md"
                onClick={onProceedToComparison}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {p.compareAction} ({selectedCandidateIds.length})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

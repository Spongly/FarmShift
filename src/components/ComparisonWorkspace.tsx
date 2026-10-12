import React from 'react';
import { useApp } from '../context/AppContext';
import { CROPS } from '../data/cropData';
import { NEPALI_CROP_NAMES, NEPALI_SEASONS, translateBenefit, translateRisk } from '../data/translations';
import { Card, SectionHeader, ScoreBar, Alert, Button } from './ui';
import { Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { downloadCSV } from '../services/exportService';

export function ComparisonWorkspace() {
  const { state, toggleCandidateSelection } = useApp();
  const { rotationResult, selectedCandidateIds, language } = state;
  const ne = language === 'ne';

  if (!rotationResult || rotationResult.candidates.length === 0) {
    return (
      <Card padding="lg" className="text-center py-12">
        <h3 className="text-base font-semibold text-ink">
          {ne ? 'कुनै बाली चक्र तयार गरिएको छैन' : 'No Rotations Generated Yet'}
        </h3>
        <p className="text-sm text-ink-muted mt-1 max-w-sm mx-auto">
          {ne
            ? 'पहिले बाली योजना खण्डमा गएर उपयुक्त बाली चक्रका रणनीतिहरू तयार गर्नुहोस्।'
            : 'Run the Rotation Planner engine first to generate and compare candidate rotation pathways.'}
        </p>
      </Card>
    );
  }

  // If none explicitly selected, pick top 2 or 3
  const candidatesToCompare =
    selectedCandidateIds.length > 0
      ? rotationResult.candidates.filter((c) => selectedCandidateIds.includes(c.id))
      : rotationResult.candidates.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header and Export Action */}
      <Card padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <SectionHeader
            mono={ne ? 'तुलनात्मक विश्लेषण तथा गुण-दोष' : 'SYNTHESIS & TRADE-OFFS'}
            title={ne ? 'बाली चक्र तुलना तालिका' : 'Rotation Comparison Matrix'}
            subtitle={
              ne
                ? 'मौसम अनुकूलता, पानीको माग र माटोको उर्वराशक्तिका आधारमा आमने-सामने तुलना गर्नुहोस्।'
                : 'Side-by-side trade-off inspection across climate suitability, water demand, and soil enhancement.'
            }
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() => downloadCSV(state)}
        >
          {ne ? 'निर्णय सारांश डाउनलोड गर्नुहोस् (CSV)' : 'Export Decision Summary (CSV)'}
        </Button>
      </Card>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidatesToCompare.map((cand, idx) => (
          <Card key={cand.id} padding="md" className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start border-b border-paper-300 pb-2">
                <span className="mono-label text-forest font-semibold">
                  {ne ? `विकल्प ${idx + 1}` : `Option ${idx + 1}`}
                </span>
                <span className="font-mono text-sm font-bold text-ink">
                  {Math.round(cand.score.overall * 100)} / 100
                </span>
              </div>

              {/* Crop Path */}
              <div>
                <span className="text-2xs text-ink-muted uppercase font-mono">
                  {ne ? 'बाली चक्रको क्रम' : 'Crop Trajectory'}
                </span>
                <div className="space-y-1.5 mt-1">
                  {cand.sequence.crops.map((sc, i) => {
                    const c = CROPS.find((cr) => cr.id === sc.cropId);
                    const nepaliCrop = NEPALI_CROP_NAMES[sc.cropId];
                    const cropDisplayName = ne && nepaliCrop ? nepaliCrop.nepaliName : (c?.name ?? sc.cropId);
                    const seasonDisplayName = ne ? (NEPALI_SEASONS[sc.season] ?? sc.season) : sc.season;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-paper-100 rounded border border-paper-200 text-xs"
                      >
                        <span className="font-medium text-ink">{cropDisplayName}</span>
                        <span className="text-2xs text-ink-subtle">{seasonDisplayName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-criteria Score Bars */}
              <div className="space-y-2 pt-2 border-t border-paper-300">
                <ScoreBar
                  label={ne ? 'मौसम अनुकूलता' : 'Climate Suitability'}
                  value={cand.score.climateSuitability}
                />
                <ScoreBar
                  label={ne ? 'पानी व्यवस्थापन' : 'Water Optimization'}
                  value={cand.score.waterCompatibility}
                />
                <ScoreBar
                  label={ne ? 'बाली विविधता' : 'Rotation Diversity'}
                  value={cand.score.rotationDiversity}
                />
                <ScoreBar
                  label={ne ? 'माटो सुधार र नाइट्रोजन' : 'Soil Health & N-Fixing'}
                  value={cand.score.soilHealthBenefit}
                />
                <ScoreBar
                  label={ne ? 'मौसमी सम्भाव्यता' : 'Seasonal Feasibility'}
                  value={cand.score.seasonalFeasibility}
                />
              </div>

              {/* Benefits and Trade-offs */}
              <div className="pt-2 border-t border-paper-300 space-y-2">
                <span className="text-2xs text-ink-muted uppercase font-mono">
                  {ne ? 'मुख्य फाइदाहरू' : 'Key Merits'}
                </span>
                <ul className="text-xs text-ink-secondary space-y-1">
                  {cand.benefits.slice(0, 2).map((b, bi) => (
                    <li key={bi} className="flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                      <span>{translateBenefit(b, language)}</span>
                    </li>
                  ))}
                </ul>

                {cand.risks.length > 0 && (
                  <>
                    <span className="text-2xs text-ink-muted uppercase font-mono pt-1 block">
                      {ne ? 'जोखिम तथा ध्यान दिनुपर्ने कुरा' : 'Trade-Offs & Risks'}
                    </span>
                    <ul className="text-xs text-sienna space-y-1">
                      {cand.risks.slice(0, 2).map((r, ri) => (
                        <li key={ri} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-sienna shrink-0 mt-0.5" />
                          <span>{translateRisk(r.description, language)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-paper-300">
              <button
                onClick={() => toggleCandidateSelection(cand.id)}
                className="text-2xs text-ink-muted hover:text-sienna underline"
              >
                {ne ? 'तुलनाबाट हटाउनुहोस्' : 'Remove from comparison view'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Uncertainty Notice */}
      <Alert
        type="info"
        title={ne ? 'वैज्ञानिक पारदर्शिता तथा कृषि सावधानी' : 'Scientific Transparency & Advisory Caution'}
      >
        {ne
          ? 'भू-उपग्रह अवलोकनले क्षेत्रीय सम्भाव्यताको मार्गदर्शन प्रदान गर्दछ। खेतमा बाली लगाउँदा स्थानीय बीउको उपलब्धता, हालको माटोको चिस्यान र कृषि प्राविधिकको सल्लाहलाई पनि ध्यान दिनुहोस्।'
          : 'Earth observation indices provide regional probabilistic guidance rather than plot-level guarantees. Verify planting decisions against local seed availability, current soil moisture, and regional extension advice.'}
      </Alert>
    </div>
  );
}

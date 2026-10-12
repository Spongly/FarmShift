import { describe, it, expect } from 'vitest';
import { runRotationEngine, scoreRotationDiversity } from '../src/services/rotationEngine';
import { CROPS } from '../src/data/cropData';
import type { FarmInputs, SequencedCrop } from '../src/types';

describe('Crop Rotation Engine Unit Tests', () => {
  const dummyInputs: FarmInputs = {
    location: {
      name: 'Chitwan Test Field',
      latitude: 27.5291,
      longitude: 84.3542,
      country: 'Nepal',
      source: 'preset',
    },
    soil: {
      texture: 'loam',
      ph: 6.5,
      organicMatter: 2.0,
      drainage: 'well-drained',
      irrigationAvailable: true,
      notes: '',
      provenance: 'user-entered',
    },
    planningSeasons: 4,
    candidateCropIds: ['rice-transplanted', 'wheat', 'lentil', 'maize', 'mustard'],
    excludedCropIds: [],
    previousCropId: null,
    priority: 'balanced',
    planningStartSeason: 'kharif',
  };

  it('generates ranked candidates when valid inputs are provided', () => {
    const result = runRotationEngine(dummyInputs, null);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0].score.overall).toBeGreaterThanOrEqual(0);
    expect(result.candidates[0].score.overall).toBeLessThanOrEqual(1);
  });

  it('rewards sequences incorporating leguminous crops in rotation diversity', () => {
    const sequenceWithLegume: SequencedCrop[] = [
      { cropId: 'rice-transplanted', season: 'Kharif', estimatedSowingMonths: [6], estimatedHarvestMonths: [10] },
      { cropId: 'lentil', season: 'Rabi', estimatedSowingMonths: [11], estimatedHarvestMonths: [3] },
    ];

    const sequenceMonoculture: SequencedCrop[] = [
      { cropId: 'rice-transplanted', season: 'Kharif', estimatedSowingMonths: [6], estimatedHarvestMonths: [10] },
      { cropId: 'rice-transplanted', season: 'Kharif', estimatedSowingMonths: [6], estimatedHarvestMonths: [10] },
    ];

    const scoreLegume = scoreRotationDiversity(sequenceWithLegume);
    const scoreMono = scoreRotationDiversity(sequenceMonoculture);

    expect(scoreLegume.score).toBeGreaterThan(scoreMono.score);
  });

  it('responds dynamically to changing priority weights', () => {
    const waterPriorityResult = runRotationEngine(
      { ...dummyInputs, priority: 'water-conservation' },
      null
    );
    const soilPriorityResult = runRotationEngine(
      { ...dummyInputs, priority: 'soil-health' },
      null
    );

    expect(waterPriorityResult.inputs.priority).toBe('water-conservation');
    expect(soilPriorityResult.inputs.priority).toBe('soil-health');
  });
});

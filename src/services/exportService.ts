// ============================================================
// Export Report Generator
// Produces a CSV-based planning summary
// ============================================================

import type { AppState } from '../types';
import { getCropById } from '../data/cropData';
import { computeMonthlyNormals } from './nasaPower';

export function generateExportCSV(state: AppState): string {
  const { location, climateData, soil, rotationResult } = state;
  const lines: string[] = [];

  // Header
  lines.push('FarmShift Nepal — Planning Summary Export');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Note: All estimates are approximate and based on historical observations. Not a guarantee of crop performance.`);
  lines.push('');

  // Location
  lines.push('=== FARM LOCATION ===');
  if (location) {
    lines.push(`Name,${csvEscape(location.name)}`);
    lines.push(`District,${csvEscape(location.district ?? 'Not specified')}`);
    lines.push(`Province,${csvEscape(location.province ?? 'Not specified')}`);
    lines.push(`Latitude,${location.latitude.toFixed(4)}°`);
    lines.push(`Longitude,${location.longitude.toFixed(4)}°`);
    if (location.elevation) lines.push(`Elevation (from API),${location.elevation} m`);
    lines.push(`Location Source,${location.source}`);
  } else {
    lines.push('No location selected');
  }
  lines.push('');

  // Soil
  lines.push('=== SOIL INFORMATION ===');
  lines.push(`Texture,${csvEscape(soil.texture)}`);
  lines.push(`pH,${soil.ph !== null ? soil.ph : 'Not provided'}`);
  lines.push(`Organic Matter,${soil.organicMatter !== null ? soil.organicMatter + '%' : 'Not provided'}`);
  lines.push(`Drainage,${csvEscape(soil.drainage)}`);
  lines.push(`Irrigation Available,${soil.irrigationAvailable ? 'Yes' : 'No'}`);
  lines.push(`Provenance,${csvEscape(soil.provenance)}`);
  if (soil.notes) lines.push(`Notes,${csvEscape(soil.notes)}`);
  lines.push('');

  // Climate data
  lines.push('=== CLIMATE DATA ===');
  if (climateData) {
    lines.push(`Source,${csvEscape(climateData.source.name)}`);
    lines.push(`API Version,${csvEscape(climateData.source.version)}`);
    lines.push(`Data Period,${climateData.source.startDate} to ${climateData.source.endDate}`);
    lines.push(`Elevation (from API),${location?.elevation ?? 'N/A'} m`);
    lines.push(`Annual Precipitation (est.),${climateData.summary.annualPrecipitation ?? 'N/A'} mm/year`);
    lines.push(`Mean Annual Temperature (est.),${climateData.summary.meanAnnualTemp ?? 'N/A'} °C`);
    lines.push(`Mean Summer Temp (Jun-Aug),${climateData.summary.meanSummerTemp ?? 'N/A'} °C`);
    lines.push(`Mean Winter Temp (Dec-Feb),${climateData.summary.meanWinterTemp ?? 'N/A'} °C`);
    lines.push(`Data Completeness,${(climateData.summary.dataCompleteness * 100).toFixed(1)}%`);
    lines.push(`Attribution,${csvEscape(climateData.source.attribution)}`);
    lines.push('');

    // Monthly normals
    lines.push('=== MONTHLY CLIMATE NORMALS (averaged across data period) ===');
    lines.push('Month,Precip (mm),Temp Mean (°C),Temp Max (°C),Temp Min (°C),Humidity (%),Solar (MJ/m²/d)');
    const normals = computeMonthlyNormals(climateData.monthly);
    for (const n of normals) {
      lines.push(
        `${n.monthShort},${n.precipitation ?? 'N/A'},${n.tempMean ?? 'N/A'},${n.tempMax ?? 'N/A'},${n.tempMin ?? 'N/A'},${n.humidity ?? 'N/A'},${n.solarRadiation ?? 'N/A'}`
      );
    }
  } else {
    lines.push('Climate data not loaded');
  }
  lines.push('');

  // Rotation analysis
  lines.push('=== ROTATION ANALYSIS ===');
  if (rotationResult) {
    lines.push(`Analysis Timestamp,${rotationResult.analysisTimestamp.toISOString()}`);
    lines.push(`Priority Mode,${csvEscape(rotationResult.inputs.priority)}`);
    lines.push(`Planning Seasons,${rotationResult.inputs.planningSeasons}`);
    lines.push(`Candidates Analyzed,${rotationResult.candidates.length}`);
    lines.push('');

    if (rotationResult.candidates.length > 0) {
      lines.push('=== RANKED ROTATION CANDIDATES ===');
      lines.push(
        'Rank,Sequence,Overall Score,Climate Score,Water Score,Diversity Score,Soil Score,Feasibility Score,Key Risks'
      );

      rotationResult.candidates.forEach((c, idx) => {
        const seqStr = c.sequence.crops
          .map((s) => {
            const crop = getCropById(s.cropId);
            const nepaliCrop = state.language === 'ne' ? crop?.localName : undefined;
            return `${crop?.name ?? s.cropId}${nepaliCrop ? ` (${nepaliCrop})` : ''} [${s.season}]`;
          })
          .join(' → ');
        const risksStr = c.risks.map((r) => r.description.slice(0, 50)).join('; ');

        lines.push(
          [
            idx + 1,
            csvEscape(seqStr),
            (c.score.overall * 100).toFixed(0),
            (c.score.climateSuitability * 100).toFixed(0),
            (c.score.waterCompatibility * 100).toFixed(0),
            (c.score.rotationDiversity * 100).toFixed(0),
            (c.score.soilHealthBenefit * 100).toFixed(0),
            (c.score.seasonalFeasibility * 100).toFixed(0),
            csvEscape(risksStr),
          ].join(',')
        );
      });

      lines.push('');
      lines.push('=== TOP RECOMMENDATION DETAILS ===');
      const top = rotationResult.candidates[0];
      lines.push(`Sequence,${csvEscape(top.sequence.crops.map((s) => getCropById(s.cropId)?.name ?? s.cropId).join(' → '))}`);
      lines.push(`Ranking Explanation,${csvEscape(top.rankingExplanation)}`);
      lines.push('');
      lines.push('Key Benefits:');
      top.benefits.forEach((b) => lines.push(`,${csvEscape(b)}`));
      lines.push('Key Uncertainties:');
      top.uncertainties.forEach((u) => lines.push(`,${csvEscape(u)}`));
      lines.push('Data Gaps:');
      top.dataGaps.forEach((d) => lines.push(`,${csvEscape(d)}`));
    }

    lines.push('');
    lines.push('=== METHODOLOGY NOTES ===');
    rotationResult.methodologyNotes.forEach((n) => lines.push(`,${csvEscape(n)}`));

    lines.push('');
    lines.push('=== LIMITATIONS ===');
    rotationResult.limitations.forEach((l) => lines.push(`,${csvEscape(l)}`));
  } else {
    lines.push('No rotation analysis performed');
  }

  lines.push('');
  lines.push('=== DATA SOURCES ===');
  lines.push('NASA POWER API,https://power.larc.nasa.gov/api/temporal/');
  lines.push('Nominatim Geocoding,https://nominatim.openstreetmap.org/');
  lines.push('Nepal Agricultural Research Council,https://www.narc.gov.np/');
  lines.push('Ministry of Agriculture and Livestock Development Nepal,https://moald.gov.np/');
  lines.push('OpenStreetMap Contributors,https://www.openstreetmap.org/copyright');

  return lines.join('\n');
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(state: AppState): void {
  const csv = generateExportCSV(state);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const locationName = state.location?.name ?? 'unknown-location';
  const date = new Date().toISOString().slice(0, 10);
  link.download = `farmshift-nepal-${locationName.replace(/[^a-zA-Z0-9]/g, '-')}-${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

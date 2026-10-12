import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type {
  AppState,
  Location,
  SoilInfo,
  FarmInputs,
  ClimateDataset,
  RotationAnalysisResult,
  CropId,
  PriorityMode,
} from '../types';

// ============================================================
// Initial State
// ============================================================

const DEFAULT_SOIL: SoilInfo = {
  texture: 'unknown',
  ph: null,
  organicMatter: null,
  drainage: 'unknown',
  irrigationAvailable: false,
  notes: '',
  provenance: 'user-entered',
};

const INITIAL_STATE: AppState = {
  language: 'ne',
  location: null,
  climateData: null,
  climateStatus: { state: 'idle' },
  soil: DEFAULT_SOIL,
  farmInputs: {
    planningSeasons: 4,
    candidateCropIds: [],
    excludedCropIds: [],
    previousCropId: null,
    priority: 'balanced',
    planningStartSeason: 'kharif',
  },
  rotationResult: null,
  selectedCandidateIds: [],
};

// ============================================================
// Persistent Storage (localStorage)
// ============================================================

const STORAGE_KEY = 'farmshift_nepal_app_state_v1';

interface PersistedState {
  language?: import('../types').AppLanguage;
  location?: Location | null;
  soil?: SoilInfo;
  farmInputs?: Partial<FarmInputs>;
}

function loadPersistedState(): Partial<AppState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: PersistedState = JSON.parse(raw);
    const result: Partial<AppState> = {};

    if (parsed.language === 'en' || parsed.language === 'ne') {
      result.language = parsed.language;
    }

    if (parsed.location && typeof parsed.location.latitude === 'number' && typeof parsed.location.longitude === 'number') {
      result.location = parsed.location;
    }

    if (parsed.soil) {
      result.soil = { ...DEFAULT_SOIL, ...parsed.soil };
    }

    if (parsed.farmInputs) {
      result.farmInputs = {
        planningSeasons: typeof parsed.farmInputs.planningSeasons === 'number' ? parsed.farmInputs.planningSeasons : 4,
        candidateCropIds: Array.isArray(parsed.farmInputs.candidateCropIds) ? parsed.farmInputs.candidateCropIds : [],
        excludedCropIds: Array.isArray(parsed.farmInputs.excludedCropIds) ? parsed.farmInputs.excludedCropIds : [],
        previousCropId: parsed.farmInputs.previousCropId ?? null,
        priority: parsed.farmInputs.priority ?? 'balanced',
        planningStartSeason: parsed.farmInputs.planningStartSeason ?? 'kharif',
      };
    }

    return result;
  } catch (e) {
    console.warn('Failed to parse persistent storage for FarmShift:', e);
    return {};
  }
}

function getInitialState(): AppState {
  const persisted = loadPersistedState();
  return {
    ...INITIAL_STATE,
    ...persisted,
    soil: persisted.soil ? { ...DEFAULT_SOIL, ...persisted.soil } : DEFAULT_SOIL,
    farmInputs: persisted.farmInputs ? { ...INITIAL_STATE.farmInputs, ...persisted.farmInputs } : INITIAL_STATE.farmInputs,
  };
}

// ============================================================
// Actions
// ============================================================

type AppAction =
  | { type: 'SET_LANGUAGE'; language: import('../types').AppLanguage }
  | { type: 'SET_LOCATION'; location: Location }
  | { type: 'CLEAR_LOCATION' }
  | { type: 'SET_CLIMATE_LOADING' }
  | { type: 'SET_CLIMATE_DATA'; data: ClimateDataset }
  | { type: 'SET_CLIMATE_ERROR'; message: string }
  | { type: 'CLEAR_CLIMATE' }
  | { type: 'UPDATE_SOIL'; soil: Partial<SoilInfo> }
  | { type: 'UPDATE_FARM_INPUTS'; inputs: Partial<FarmInputs> }
  | { type: 'SET_ROTATION_RESULT'; result: RotationAnalysisResult }
  | { type: 'CLEAR_ROTATION_RESULT' }
  | { type: 'TOGGLE_CANDIDATE_SELECTION'; id: string }
  | { type: 'SELECT_CANDIDATE'; id: string }
  | { type: 'CLEAR_CANDIDATE_SELECTION' };

// ============================================================
// Reducer
// ============================================================

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.language,
      };

    case 'SET_LOCATION':
      return {
        ...state,
        location: action.location,
        climateData: null,
        climateStatus: { state: 'idle' },
        rotationResult: null,
      };

    case 'CLEAR_LOCATION':
      return {
        ...state,
        location: null,
        climateData: null,
        climateStatus: { state: 'idle' },
        rotationResult: null,
      };

    case 'SET_CLIMATE_LOADING':
      return {
        ...state,
        climateStatus: { state: 'loading' },
      };

    case 'SET_CLIMATE_DATA':
      return {
        ...state,
        climateData: action.data,
        climateStatus: {
          state: 'success',
          message: `Data loaded: ${action.data.daily.length} daily observations.`,
          lastUpdated: new Date(),
        },
        // Update location with elevation if available
        location: state.location
          ? { ...state.location, elevation: action.data.location.elevation }
          : state.location,
      };

    case 'SET_CLIMATE_ERROR':
      return {
        ...state,
        climateStatus: {
          state: 'error',
          message: action.message,
        },
      };

    case 'CLEAR_CLIMATE':
      return {
        ...state,
        climateData: null,
        climateStatus: { state: 'idle' },
      };

    case 'UPDATE_SOIL':
      return {
        ...state,
        soil: { ...state.soil, ...action.soil },
      };

    case 'UPDATE_FARM_INPUTS':
      return {
        ...state,
        farmInputs: { ...state.farmInputs, ...action.inputs },
      };

    case 'SET_ROTATION_RESULT':
      return {
        ...state,
        rotationResult: action.result,
        selectedCandidateIds: [],
      };

    case 'CLEAR_ROTATION_RESULT':
      return {
        ...state,
        rotationResult: null,
        selectedCandidateIds: [],
      };

    case 'TOGGLE_CANDIDATE_SELECTION': {
      const existing = state.selectedCandidateIds.includes(action.id);
      return {
        ...state,
        selectedCandidateIds: existing
          ? state.selectedCandidateIds.filter((id) => id !== action.id)
          : [...state.selectedCandidateIds, action.id].slice(0, 4), // max 4 selected
      };
    }

    case 'SELECT_CANDIDATE':
      return {
        ...state,
        selectedCandidateIds: state.selectedCandidateIds.includes(action.id)
          ? state.selectedCandidateIds
          : [...state.selectedCandidateIds, action.id],
      };

    case 'CLEAR_CANDIDATE_SELECTION':
      return { ...state, selectedCandidateIds: [] };

    default:
      return state;
  }
}

// ============================================================
// Context
// ============================================================

interface AppContextValue {
  state: AppState;
  setLanguage: (lang: import('../types').AppLanguage) => void;
  setLocation: (location: Location) => void;
  clearLocation: () => void;
  setClimateLoading: () => void;
  setClimateData: (data: ClimateDataset) => void;
  setClimateError: (message: string) => void;
  clearClimate: () => void;
  updateSoil: (soil: Partial<SoilInfo>) => void;
  updateFarmInputs: (inputs: Partial<FarmInputs>) => void;
  setRotationResult: (result: RotationAnalysisResult) => void;
  clearRotationResult: () => void;
  toggleCandidateSelection: (id: string) => void;
  clearCandidateSelection: () => void;
  setCandidate: (cropId: CropId, add: boolean) => void;
  setPriority: (priority: PriorityMode) => void;
  setPlanningSeasons: (n: number) => void;
  setStartSeason: (s: 'kharif' | 'rabi') => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getInitialState);

  // Sync core state to localStorage whenever location, soil, language, or farm inputs change
  useEffect(() => {
    try {
      const toPersist: PersistedState = {
        language: state.language,
        location: state.location,
        soil: state.soil,
        farmInputs: {
          planningSeasons: state.farmInputs.planningSeasons,
          candidateCropIds: state.farmInputs.candidateCropIds,
          excludedCropIds: state.farmInputs.excludedCropIds,
          previousCropId: state.farmInputs.previousCropId,
          priority: state.farmInputs.priority,
          planningStartSeason: state.farmInputs.planningStartSeason,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    } catch (e) {
      console.warn('Failed to persist FarmShift state to localStorage:', e);
    }
  }, [state.language, state.location, state.soil, state.farmInputs]);

  const setLanguage = useCallback((language: import('../types').AppLanguage) => {
    dispatch({ type: 'SET_LANGUAGE', language });
  }, []);

  const setLocation = useCallback((location: Location) => {
    dispatch({ type: 'SET_LOCATION', location });
  }, []);

  const clearLocation = useCallback(() => {
    dispatch({ type: 'CLEAR_LOCATION' });
  }, []);

  const setClimateLoading = useCallback(() => {
    dispatch({ type: 'SET_CLIMATE_LOADING' });
  }, []);

  const setClimateData = useCallback((data: ClimateDataset) => {
    dispatch({ type: 'SET_CLIMATE_DATA', data });
  }, []);

  const setClimateError = useCallback((message: string) => {
    dispatch({ type: 'SET_CLIMATE_ERROR', message });
  }, []);

  const clearClimate = useCallback(() => {
    dispatch({ type: 'CLEAR_CLIMATE' });
  }, []);

  const updateSoil = useCallback((soil: Partial<SoilInfo>) => {
    dispatch({ type: 'UPDATE_SOIL', soil });
  }, []);

  const updateFarmInputs = useCallback((inputs: Partial<FarmInputs>) => {
    dispatch({ type: 'UPDATE_FARM_INPUTS', inputs });
  }, []);

  const setRotationResult = useCallback((result: RotationAnalysisResult) => {
    dispatch({ type: 'SET_ROTATION_RESULT', result });
  }, []);

  const clearRotationResult = useCallback(() => {
    dispatch({ type: 'CLEAR_ROTATION_RESULT' });
  }, []);

  const toggleCandidateSelection = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_CANDIDATE_SELECTION', id });
  }, []);

  const clearCandidateSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_CANDIDATE_SELECTION' });
  }, []);

  const setCandidate = useCallback((cropId: CropId, add: boolean) => {
    const current = state.farmInputs.candidateCropIds ?? [];
    if (add) {
      if (!current.includes(cropId)) {
        dispatch({
          type: 'UPDATE_FARM_INPUTS',
          inputs: { candidateCropIds: [...current, cropId] },
        });
      }
    } else {
      dispatch({
        type: 'UPDATE_FARM_INPUTS',
        inputs: { candidateCropIds: current.filter((id) => id !== cropId) },
      });
    }
  }, [state.farmInputs.candidateCropIds]);

  const setPriority = useCallback((priority: PriorityMode) => {
    dispatch({ type: 'UPDATE_FARM_INPUTS', inputs: { priority } });
  }, []);

  const setPlanningSeasons = useCallback((planningSeasons: number) => {
    dispatch({ type: 'UPDATE_FARM_INPUTS', inputs: { planningSeasons } });
  }, []);

  const setStartSeason = useCallback((planningStartSeason: 'kharif' | 'rabi') => {
    dispatch({ type: 'UPDATE_FARM_INPUTS', inputs: { planningStartSeason } });
  }, []);

  const value: AppContextValue = {
    state,
    setLanguage,
    setLocation,
    clearLocation,
    setClimateLoading,
    setClimateData,
    setClimateError,
    clearClimate,
    updateSoil,
    updateFarmInputs,
    setRotationResult,
    clearRotationResult,
    toggleCandidateSelection,
    clearCandidateSelection,
    setCandidate,
    setPriority,
    setPlanningSeasons,
    setStartSeason,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}

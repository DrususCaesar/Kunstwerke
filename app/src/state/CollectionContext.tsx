import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react';
import { SAMPLE_WORKS } from '../data/sampleWorks';
import { recognizeArtwork, type RecognitionResult } from '../services/recognition';
import type { GalleryView, Screen, ScanMode, ScanStep, Tab, Werk } from '../types';

/**
 * Zentraler App-Zustand — s. Handoff README → "State Management".
 * TODO(Produktivversion): `works` durch Supabase-Queries ersetzen
 * (src/services/backend.ts), Offline-Fälle lokal cachen und bei
 * Internetverbindung syncen (Konzept Abschnitt 4.1, 7).
 */
interface CollectionState {
  works: Werk[];
  tab: Tab;
  screen: Screen;
  selectedWorkId: number | null;
  selectedArtistCall: string | null;
  galleryView: GalleryView;
  activeChips: string[];
  searchQuery: string;
  scanMode: ScanMode;
  scanStep: ScanStep;
  scanResult: RecognitionResult | null;
  editingId: number | null;
  toast: string | null;
  nextId: number;
}

const initialState: CollectionState = {
  works: SAMPLE_WORKS,
  tab: 'scan',
  screen: 'tab',
  selectedWorkId: null,
  selectedArtistCall: null,
  galleryView: 'masonry',
  activeChips: [],
  searchQuery: '',
  scanMode: null,
  scanStep: null,
  scanResult: null,
  editingId: null,
  toast: null,
  nextId: 100,
};

type EditableField = 'title' | 'artistCall';

type Action =
  | { type: 'SELECT_TAB'; tab: Tab }
  | { type: 'OPEN_DETAIL'; id: number }
  | { type: 'OPEN_ARTIST'; call: string }
  | { type: 'CLOSE_SCREEN' }
  | { type: 'START_SCAN'; mode: Exclude<ScanMode, null> }
  | { type: 'SCAN_RESULT_READY'; result: RecognitionResult }
  | { type: 'START_BULK_IMPORT' }
  | { type: 'ADD_WORK'; work: Werk; goToKorrektur: boolean }
  | { type: 'TOGGLE_CHIP'; label: string }
  | { type: 'TOGGLE_GALLERY_VIEW' }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'CONFIRM_WORK'; id: number }
  | { type: 'TOGGLE_EDIT'; id: number }
  | { type: 'UPDATE_WORK_FIELD'; id: number; field: EditableField; value: string }
  | { type: 'SHOW_TOAST'; message: string }
  | { type: 'HIDE_TOAST' };

function reducer(state: CollectionState, action: Action): CollectionState {
  switch (action.type) {
    case 'SELECT_TAB':
      return { ...state, tab: action.tab, screen: 'tab' };
    case 'OPEN_DETAIL':
      return { ...state, screen: 'detail', selectedWorkId: action.id };
    case 'OPEN_ARTIST':
      return { ...state, screen: 'artist', selectedArtistCall: action.call };
    case 'CLOSE_SCREEN':
      return { ...state, screen: 'tab', scanStep: null, scanResult: null };
    case 'START_SCAN':
      return { ...state, scanMode: action.mode, scanStep: 'scanning', scanResult: null };
    case 'SCAN_RESULT_READY':
      if (state.scanStep !== 'scanning') return state; // Nutzer hat den Screen bereits verlassen
      return { ...state, scanStep: 'result', scanResult: action.result };
    case 'START_BULK_IMPORT':
      return { ...state, screen: 'korrektur' };
    case 'ADD_WORK':
      return {
        ...state,
        works: [action.work, ...state.works],
        scanStep: null,
        scanMode: null,
        scanResult: null,
        nextId: state.nextId + 1,
        screen: action.goToKorrektur ? 'korrektur' : state.screen,
      };
    case 'TOGGLE_CHIP':
      return {
        ...state,
        activeChips: state.activeChips.includes(action.label)
          ? state.activeChips.filter((c) => c !== action.label)
          : [...state.activeChips, action.label],
      };
    case 'TOGGLE_GALLERY_VIEW':
      return { ...state, galleryView: state.galleryView === 'masonry' ? 'list' : 'masonry' };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    case 'CONFIRM_WORK':
      return { ...state, works: state.works.map((w) => (w.id === action.id ? { ...w, status: 'vollständig' } : w)) };
    case 'TOGGLE_EDIT':
      return { ...state, editingId: state.editingId === action.id ? null : action.id };
    case 'UPDATE_WORK_FIELD':
      return {
        ...state,
        works: state.works.map((w) => (w.id === action.id ? { ...w, [action.field]: action.value } : w)),
      };
    case 'SHOW_TOAST':
      return { ...state, toast: action.message };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

interface CollectionActions {
  selectTab(tab: Tab): void;
  openDetail(id: number): void;
  openArtist(call: string): void;
  closeScreen(): void;
  startSingleScan(): void;
  startDoubleScan(): void;
  startBulkImport(): void;
  confirmScanResult(): void;
  editScanResult(): void;
  toggleChip(label: string): void;
  toggleGalleryView(): void;
  setSearchQuery(query: string): void;
  confirmWork(id: number): void;
  toggleEdit(id: number): void;
  updateWorkField(id: number, field: EditableField, value: string): void;
}

interface CollectionContextValue {
  state: CollectionState;
  actions: CollectionActions;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimer = useRef<number | undefined>(undefined);
  const scanRequestId = useRef(0);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    dispatch({ type: 'SHOW_TOAST', message });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2200);
  };

  const startScan = (mode: Exclude<ScanMode, null>) => {
    dispatch({ type: 'START_SCAN', mode });
    const requestId = ++scanRequestId.current;
    recognizeArtwork(mode).then((result) => {
      if (requestId !== scanRequestId.current) return; // veraltete Anfrage — Screen verlassen
      dispatch({ type: 'SCAN_RESULT_READY', result });
    });
  };

  const actions: CollectionActions = {
    selectTab: (tab) => dispatch({ type: 'SELECT_TAB', tab }),
    openDetail: (id) => dispatch({ type: 'OPEN_DETAIL', id }),
    openArtist: (call) => dispatch({ type: 'OPEN_ARTIST', call }),
    closeScreen: () => dispatch({ type: 'CLOSE_SCREEN' }),
    startSingleScan: () => startScan('single'),
    startDoubleScan: () => startScan('double'),
    startBulkImport: () => dispatch({ type: 'START_BULK_IMPORT' }),
    confirmScanResult: () => {
      if (!state.scanResult) return;
      const work: Werk = {
        ...state.scanResult,
        id: state.nextId,
        status: state.scanResult.confidence === 'sicher' ? 'vollständig' : 'zu prüfen',
        dateAdded: 'gerade eben',
      };
      dispatch({ type: 'ADD_WORK', work, goToKorrektur: false });
      showToast('Werk hinzugefügt');
    },
    editScanResult: () => {
      if (!state.scanResult) return;
      const work: Werk = {
        ...state.scanResult,
        id: state.nextId,
        status: 'zu prüfen',
        dateAdded: 'gerade eben',
      };
      dispatch({ type: 'ADD_WORK', work, goToKorrektur: true });
    },
    toggleChip: (label) => dispatch({ type: 'TOGGLE_CHIP', label }),
    toggleGalleryView: () => dispatch({ type: 'TOGGLE_GALLERY_VIEW' }),
    setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', query }),
    confirmWork: (id) => {
      dispatch({ type: 'CONFIRM_WORK', id });
      showToast('Werk bestätigt');
    },
    toggleEdit: (id) => dispatch({ type: 'TOGGLE_EDIT', id }),
    updateWorkField: (id, field, value) => dispatch({ type: 'UPDATE_WORK_FIELD', id, field, value }),
  };

  return <CollectionContext.Provider value={{ state, actions }}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextValue {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used within a CollectionProvider');
  return ctx;
}

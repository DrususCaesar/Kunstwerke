import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react';
import { recognizeArtwork, type RecognitionResult } from '../services/recognition';
import { capturePhoto, pickPhotos } from '../services/camera';
import { fileToCompressedPhoto } from '../lib/image';
import type { GalleryView, Screen, ScanMode, ScanStep, Tab, Werk } from '../types';

/**
 * Zentraler App-Zustand — s. Handoff README → "State Management".
 * `works` liegt (mangels Supabase-Anbindung, s. src/services/backend.ts)
 * persistiert in localStorage statt nur im Arbeitsspeicher, damit Einträge
 * einen Reload überleben.
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
}

const WORKS_STORAGE_KEY = 'kunstwerke:works:v1';
const GALLERY_VIEW_STORAGE_KEY = 'kunstwerke:default-gallery-view:v1';

function loadPersistedWorks(): Werk[] {
  try {
    const raw = localStorage.getItem(WORKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistWorks(works: Werk[]) {
  try {
    localStorage.setItem(WORKS_STORAGE_KEY, JSON.stringify(works));
  } catch {
    // Speicher voll oder nicht verfügbar (privates Fenster etc.) — Persistenz
    // ist best-effort, die App bleibt für die laufende Sitzung nutzbar.
  }
}

function loadDefaultGalleryView(): GalleryView {
  try {
    return localStorage.getItem(GALLERY_VIEW_STORAGE_KEY) === 'list' ? 'list' : 'masonry';
  } catch {
    return 'masonry';
  }
}

function makeInitialState(): CollectionState {
  return {
    works: loadPersistedWorks(),
    tab: 'scan',
    screen: 'tab',
    selectedWorkId: null,
    selectedArtistCall: null,
    galleryView: loadDefaultGalleryView(),
    activeChips: [],
    searchQuery: '',
    scanMode: null,
    scanStep: null,
    scanResult: null,
    editingId: null,
    toast: null,
  };
}

type EditableField = 'title' | 'artistCall';

type Action =
  | { type: 'SELECT_TAB'; tab: Tab }
  | { type: 'OPEN_DETAIL'; id: number }
  | { type: 'OPEN_ARTIST'; call: string }
  | { type: 'CLOSE_SCREEN' }
  | { type: 'START_SCAN'; mode: Exclude<ScanMode, null> }
  | { type: 'SCAN_RESULT_READY'; result: RecognitionResult }
  | { type: 'CANCEL_SCAN' }
  | { type: 'ADD_WORK'; work: Werk; goToKorrektur: boolean }
  | { type: 'IMPORT_WORKS'; works: Werk[] }
  | { type: 'TOGGLE_CHIP'; label: string }
  | { type: 'TOGGLE_GALLERY_VIEW' }
  | { type: 'SET_GALLERY_VIEW'; view: GalleryView }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'CONFIRM_WORK'; id: number }
  | { type: 'TOGGLE_EDIT'; id: number }
  | { type: 'UPDATE_WORK_FIELD'; id: number; field: EditableField; value: string }
  | { type: 'RESTORE_WORKS'; works: Werk[] }
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
    case 'CANCEL_SCAN':
      return { ...state, scanMode: null, scanStep: null, scanResult: null };
    case 'ADD_WORK':
      return {
        ...state,
        works: [action.work, ...state.works],
        scanStep: null,
        scanMode: null,
        scanResult: null,
        screen: action.goToKorrektur ? 'korrektur' : state.screen,
      };
    case 'IMPORT_WORKS':
      return { ...state, works: [...action.works, ...state.works], screen: 'korrektur' };
    case 'TOGGLE_CHIP':
      return {
        ...state,
        activeChips: state.activeChips.includes(action.label)
          ? state.activeChips.filter((c) => c !== action.label)
          : [...state.activeChips, action.label],
      };
    case 'TOGGLE_GALLERY_VIEW':
      return { ...state, galleryView: state.galleryView === 'masonry' ? 'list' : 'masonry' };
    case 'SET_GALLERY_VIEW':
      return { ...state, galleryView: action.view };
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
    case 'RESTORE_WORKS':
      return { ...state, works: action.works };
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
  importFromLibrary(): void;
  confirmScanResult(): void;
  editScanResult(): void;
  toggleChip(label: string): void;
  toggleGalleryView(): void;
  setGalleryView(view: GalleryView): void;
  setSearchQuery(query: string): void;
  confirmWork(id: number): void;
  toggleEdit(id: number): void;
  updateWorkField(id: number, field: EditableField, value: string): void;
  restoreWorks(works: Werk[]): void;
  showToast(message: string): void;
}

interface CollectionContextValue {
  state: CollectionState;
  actions: CollectionActions;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);
  const toastTimer = useRef<number | undefined>(undefined);
  const scanRequestId = useRef(0);
  // Lazy statt useRef(Date.now()) — vermeidet einen unreinen Aufruf während des Renderns.
  const idCounter = useRef(0);
  const nextId = () => {
    if (idCounter.current === 0) idCounter.current = Date.now();
    return ++idCounter.current;
  };

  useEffect(() => {
    persistWorks(state.works);
  }, [state.works]);

  useEffect(() => {
    try {
      localStorage.setItem(GALLERY_VIEW_STORAGE_KEY, state.galleryView);
    } catch {
      // best-effort, s. persistWorks
    }
  }, [state.galleryView]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    dispatch({ type: 'SHOW_TOAST', message });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2200);
  };

  const startScan = async (mode: Exclude<ScanMode, null>) => {
    const photo = await capturePhoto();
    if (!photo) return; // Nutzer hat die Kamera abgebrochen

    let photoDataUrl: string;
    let aspect: string;
    try {
      const compressed = await fileToCompressedPhoto(photo);
      photoDataUrl = compressed.dataUrl;
      aspect = compressed.aspect;
    } catch (e) {
      console.error('Foto konnte nicht verarbeitet werden', e);
      return;
    }

    let tafelPhotoDataUrl: string | undefined;
    if (mode === 'double') {
      const tafelPhoto = await capturePhoto();
      if (tafelPhoto) {
        try {
          tafelPhotoDataUrl = (await fileToCompressedPhoto(tafelPhoto)).dataUrl;
        } catch (e) {
          console.error('Tafel-Foto konnte nicht verarbeitet werden', e);
        }
      }
    }

    dispatch({ type: 'START_SCAN', mode });
    const requestId = ++scanRequestId.current;
    recognizeArtwork(mode).then((result) => {
      if (requestId !== scanRequestId.current) return; // veraltete Anfrage — Screen verlassen
      dispatch({
        type: 'SCAN_RESULT_READY',
        result: { ...result, aspect, photoDataUrl, tafelPhotoDataUrl, hasTafel: !!tafelPhotoDataUrl },
      });
    });
  };

  const actions: CollectionActions = {
    selectTab: (tab) => dispatch({ type: 'SELECT_TAB', tab }),
    openDetail: (id) => dispatch({ type: 'OPEN_DETAIL', id }),
    openArtist: (call) => dispatch({ type: 'OPEN_ARTIST', call }),
    closeScreen: () => dispatch({ type: 'CLOSE_SCREEN' }),
    startSingleScan: () => void startScan('single'),
    startDoubleScan: () => void startScan('double'),
    importFromLibrary: async () => {
      const files = await pickPhotos();
      if (!files.length) return;
      const newWorks: Werk[] = [];
      for (const file of files) {
        try {
          const { dataUrl, aspect } = await fileToCompressedPhoto(file);
          newWorks.push({
            id: nextId(),
            artistFull: '',
            artistCall: 'Unbekannt',
            isNotname: true,
            title: 'Unbenanntes Werk',
            year: '',
            epoch: '',
            genre: '',
            museum: '',
            room: '',
            city: '',
            material: '',
            tags: [],
            notes: '',
            status: 'zu prüfen',
            confidence: 'Vorschlag, bitte prüfen',
            hasTafel: false,
            aspect,
            photoDataUrl: dataUrl,
            dateAdded: 'gerade eben',
          });
        } catch (e) {
          console.error('Foto aus der Mediathek konnte nicht verarbeitet werden', e);
        }
      }
      if (newWorks.length) dispatch({ type: 'IMPORT_WORKS', works: newWorks });
    },
    confirmScanResult: () => {
      if (!state.scanResult) return;
      const work: Werk = { ...state.scanResult, id: nextId(), status: 'zu prüfen', dateAdded: 'gerade eben' };
      dispatch({ type: 'ADD_WORK', work, goToKorrektur: false });
      showToast('Werk hinzugefügt');
    },
    editScanResult: () => {
      if (!state.scanResult) return;
      const work: Werk = { ...state.scanResult, id: nextId(), status: 'zu prüfen', dateAdded: 'gerade eben' };
      dispatch({ type: 'ADD_WORK', work, goToKorrektur: true });
    },
    toggleChip: (label) => dispatch({ type: 'TOGGLE_CHIP', label }),
    toggleGalleryView: () => dispatch({ type: 'TOGGLE_GALLERY_VIEW' }),
    setGalleryView: (view) => dispatch({ type: 'SET_GALLERY_VIEW', view }),
    setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', query }),
    confirmWork: (id) => {
      dispatch({ type: 'CONFIRM_WORK', id });
      showToast('Werk bestätigt');
    },
    toggleEdit: (id) => dispatch({ type: 'TOGGLE_EDIT', id }),
    updateWorkField: (id, field, value) => dispatch({ type: 'UPDATE_WORK_FIELD', id, field, value }),
    restoreWorks: (works) => {
      dispatch({ type: 'RESTORE_WORKS', works });
      showToast('Sicherung wiederhergestellt');
    },
    showToast,
  };

  return <CollectionContext.Provider value={{ state, actions }}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextValue {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used within a CollectionProvider');
  return ctx;
}

import { createContext, useContext, useEffect, useReducer, useRef, type ReactNode } from 'react';
import { recognizeArtwork, type RecognitionResult } from '../services/recognition';
import { capturePhoto, pickPhotos } from '../services/camera';
import { fileToCompressedPhoto, cropPhoto } from '../lib/image';
import { getCurrentLocationBestEffort } from '../services/geolocation';
import { isLocationCaptureEnabled } from '../lib/settings';
import { fetchArtistPortrait } from '../services/artistPortrait';
import { pairPhotosByCaptureTime } from '../lib/pairing';
import type { SammlungSubTab, Screen, ScanMode, ScanStep, Tab, Werk, WerkCollection } from '../types';

/**
 * Zentraler App-Zustand — s. Handoff README → "State Management".
 * `works`/`collections`/`artistPortraits` liegen (mangels Supabase-Anbindung,
 * s. src/services/backend.ts) persistiert in localStorage statt nur im
 * Arbeitsspeicher, damit Einträge einen Reload überleben.
 */
interface CollectionState {
  works: Werk[];
  collections: WerkCollection[];
  /** Künstlername → Porträt-URL (Wikipedia) oder null = gesucht, kein Treffer. */
  artistPortraits: Record<string, string | null>;
  tab: Tab;
  screen: Screen;
  selectedWorkId: number | null;
  selectedArtistCall: string | null;
  selectedCollectionId: string | null;
  sammlungSubTab: SammlungSubTab;
  activeChips: string[];
  searchQuery: string;
  scanMode: ScanMode;
  scanStep: ScanStep;
  scanResult: RecognitionResult | null;
  editingId: number | null;
  toast: string | null;
}

const WORKS_STORAGE_KEY = 'kunstwerke:works:v1';
const COLLECTIONS_STORAGE_KEY = 'kunstwerke:collections:v1';
const PORTRAITS_STORAGE_KEY = 'kunstwerke:artist-portraits:v1';

function loadJson<T>(key: string, fallback: T, isValid: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function persistJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Speicher voll oder nicht verfügbar (privates Fenster etc.) — Persistenz
    // ist best-effort, die App bleibt für die laufende Sitzung nutzbar.
  }
}

const isArray = (v: unknown): v is unknown[] => Array.isArray(v);
const isRecord = (v: unknown): v is Record<string, string | null> => !!v && typeof v === 'object' && !Array.isArray(v);

function makeInitialState(): CollectionState {
  return {
    works: loadJson<Werk[]>(WORKS_STORAGE_KEY, [], isArray as (v: unknown) => v is Werk[]),
    collections: loadJson<WerkCollection[]>(COLLECTIONS_STORAGE_KEY, [], isArray as (v: unknown) => v is WerkCollection[]),
    artistPortraits: loadJson(PORTRAITS_STORAGE_KEY, {}, isRecord),
    tab: 'home',
    screen: 'tab',
    selectedWorkId: null,
    selectedArtistCall: null,
    selectedCollectionId: null,
    sammlungSubTab: 'bibliothek',
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
  | { type: 'OPEN_SETTINGS' }
  | { type: 'OPEN_COLLECTION'; id: string }
  | { type: 'CLOSE_SCREEN' }
  | { type: 'START_SCAN'; mode: Exclude<ScanMode, null> }
  | { type: 'SCAN_RESULT_READY'; result: RecognitionResult }
  | { type: 'ADD_WORK'; work: Werk; goToKorrektur: boolean }
  | { type: 'IMPORT_WORKS'; works: Werk[] }
  | { type: 'TOGGLE_CHIP'; label: string }
  | { type: 'SET_SAMMLUNG_SUB_TAB'; tab: SammlungSubTab }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'CONFIRM_WORK'; id: number }
  | { type: 'TOGGLE_EDIT'; id: number }
  | { type: 'UPDATE_WORK_FIELD'; id: number; field: EditableField; value: string }
  | { type: 'SWAP_WORK_TAFEL_PHOTO'; id: number }
  | { type: 'RESTORE_WORKS'; works: Werk[] }
  | { type: 'CREATE_COLLECTION'; collection: WerkCollection }
  | { type: 'DELETE_COLLECTION'; id: string }
  | { type: 'TOGGLE_WORK_IN_COLLECTION'; collectionId: string; workId: number }
  | { type: 'SET_ARTIST_PORTRAIT'; call: string; url: string | null }
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
    case 'OPEN_SETTINGS':
      return { ...state, screen: 'settings' };
    case 'OPEN_COLLECTION':
      return { ...state, screen: 'collection', selectedCollectionId: action.id };
    case 'CLOSE_SCREEN':
      return { ...state, screen: 'tab', scanStep: null, scanResult: null };
    case 'START_SCAN':
      return { ...state, scanMode: action.mode, scanStep: 'scanning', scanResult: null };
    case 'SCAN_RESULT_READY':
      if (state.scanStep !== 'scanning') return state; // Nutzer hat den Screen bereits verlassen
      return { ...state, scanStep: 'result', scanResult: action.result };
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
    case 'SET_SAMMLUNG_SUB_TAB':
      return { ...state, sammlungSubTab: action.tab };
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
    case 'SWAP_WORK_TAFEL_PHOTO':
      return {
        ...state,
        works: state.works.map((w) =>
          w.id === action.id && w.tafelPhotoDataUrl
            ? {
                ...w,
                photoDataUrl: w.tafelPhotoDataUrl,
                aspect: w.tafelAspect ?? w.aspect,
                tafelPhotoDataUrl: w.photoDataUrl,
                tafelAspect: w.aspect,
              }
            : w
        ),
      };
    case 'RESTORE_WORKS':
      return { ...state, works: action.works };
    case 'CREATE_COLLECTION':
      return { ...state, collections: [...state.collections, action.collection] };
    case 'DELETE_COLLECTION':
      return { ...state, collections: state.collections.filter((c) => c.id !== action.id) };
    case 'TOGGLE_WORK_IN_COLLECTION':
      return {
        ...state,
        collections: state.collections.map((c) =>
          c.id === action.collectionId
            ? {
                ...c,
                workIds: c.workIds.includes(action.workId)
                  ? c.workIds.filter((id) => id !== action.workId)
                  : [...c.workIds, action.workId],
              }
            : c
        ),
      };
    case 'SET_ARTIST_PORTRAIT':
      return { ...state, artistPortraits: { ...state.artistPortraits, [action.call]: action.url } };
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
  openSettings(): void;
  openCollection(id: string): void;
  closeScreen(): void;
  startSingleScan(): void;
  startDoubleScan(): void;
  importFromLibrary(): void;
  confirmScanResult(): void;
  editScanResult(): void;
  toggleChip(label: string): void;
  setSammlungSubTab(tab: SammlungSubTab): void;
  setSearchQuery(query: string): void;
  confirmWork(id: number): void;
  toggleEdit(id: number): void;
  updateWorkField(id: number, field: EditableField, value: string): void;
  swapWorkTafelPhoto(id: number): void;
  restoreWorks(works: Werk[]): void;
  createCollection(name: string): void;
  deleteCollection(id: string): void;
  toggleWorkInCollection(collectionId: string, workId: number): void;
  ensureArtistPortrait(call: string): void;
  showToast(message: string): void;
}

interface CollectionContextValue {
  state: CollectionState;
  actions: CollectionActions;
}

const CollectionContext = createContext<CollectionContextValue | null>(null);

/** Notnamen/Platzhalter haben kein reales Wikipedia-Porträt — Anfrage lohnt sich nicht. */
function isRealArtistName(artistCall: string, isNotname: boolean): boolean {
  return !isNotname && artistCall.trim().length > 0 && artistCall !== 'Unbekannt';
}

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
  const pendingPortraitFetches = useRef(new Set<string>());

  useEffect(() => persistJson(WORKS_STORAGE_KEY, state.works), [state.works]);
  useEffect(() => persistJson(COLLECTIONS_STORAGE_KEY, state.collections), [state.collections]);
  useEffect(() => persistJson(PORTRAITS_STORAGE_KEY, state.artistPortraits), [state.artistPortraits]);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    dispatch({ type: 'SHOW_TOAST', message });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2200);
  };

  const ensureArtistPortrait = (call: string) => {
    if (call in state.artistPortraits) return; // schon gesucht (Treffer oder nicht)
    if (pendingPortraitFetches.current.has(call)) return;
    pendingPortraitFetches.current.add(call);
    fetchArtistPortrait(call).then((url) => {
      pendingPortraitFetches.current.delete(call);
      dispatch({ type: 'SET_ARTIST_PORTRAIT', call, url });
    });
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
    let tafelAspect: string | undefined;
    if (mode === 'double') {
      const tafelPhoto = await capturePhoto();
      if (tafelPhoto) {
        try {
          const compressedTafel = await fileToCompressedPhoto(tafelPhoto);
          tafelPhotoDataUrl = compressedTafel.dataUrl;
          tafelAspect = compressedTafel.aspect;
        } catch (e) {
          console.error('Tafel-Foto konnte nicht verarbeitet werden', e);
        }
      }
    }

    dispatch({ type: 'START_SCAN', mode });
    const requestId = ++scanRequestId.current;
    const [outcome, location] = await Promise.all([
      recognizeArtwork({ primaryDataUrl: photoDataUrl, tafelDataUrl: tafelPhotoDataUrl }),
      isLocationCaptureEnabled() ? getCurrentLocationBestEffort() : Promise.resolve(null),
    ]);
    if (requestId !== scanRequestId.current) return; // veraltete Anfrage — Screen verlassen

    if (outcome.crop) {
      try {
        const cropped = await cropPhoto(photoDataUrl, outcome.crop);
        photoDataUrl = cropped.dataUrl;
        aspect = cropped.aspect;
      } catch (e) {
        console.error('Zuschnitt konnte nicht angewendet werden', e);
      }
    }

    dispatch({
      type: 'SCAN_RESULT_READY',
      result: {
        ...outcome.fields,
        aspect,
        photoDataUrl,
        tafelPhotoDataUrl,
        tafelAspect,
        hasTafel: !!tafelPhotoDataUrl,
        location: location ?? undefined,
      },
    });
  };

  const actions: CollectionActions = {
    selectTab: (tab) => dispatch({ type: 'SELECT_TAB', tab }),
    openDetail: (id) => dispatch({ type: 'OPEN_DETAIL', id }),
    openArtist: (call) => dispatch({ type: 'OPEN_ARTIST', call }),
    openSettings: () => dispatch({ type: 'OPEN_SETTINGS' }),
    openCollection: (id) => dispatch({ type: 'OPEN_COLLECTION', id }),
    closeScreen: () => dispatch({ type: 'CLOSE_SCREEN' }),
    startSingleScan: () => void startScan('single'),
    startDoubleScan: () => void startScan('double'),
    importFromLibrary: async () => {
      const files = await pickPhotos();
      if (!files.length) return;
      const location = isLocationCaptureEnabled() ? await getCurrentLocationBestEffort() : null;
      // Zeitlich nah aufgenommene Fotos zu einem Werk+Tafel-Eintrag verknüpfen
      // statt jedes Foto als eigenes Werk zu behandeln — Konzept 4.2.
      const pairs = pairPhotosByCaptureTime(files);

      const results = await Promise.all(
        pairs.map(async (pair): Promise<Werk | null> => {
          try {
            let { dataUrl: photoDataUrl, aspect } = await fileToCompressedPhoto(pair.primary);
            let tafelPhotoDataUrl: string | undefined;
            let tafelAspect: string | undefined;
            if (pair.tafel) {
              const compressedTafel = await fileToCompressedPhoto(pair.tafel);
              tafelPhotoDataUrl = compressedTafel.dataUrl;
              tafelAspect = compressedTafel.aspect;
            }

            const outcome = await recognizeArtwork({ primaryDataUrl: photoDataUrl, tafelDataUrl: tafelPhotoDataUrl });
            if (outcome.crop) {
              try {
                const cropped = await cropPhoto(photoDataUrl, outcome.crop);
                photoDataUrl = cropped.dataUrl;
                aspect = cropped.aspect;
              } catch (e) {
                console.error('Zuschnitt konnte nicht angewendet werden', e);
              }
            }

            return {
              ...outcome.fields,
              id: nextId(),
              status: 'zu prüfen',
              hasTafel: !!tafelPhotoDataUrl,
              aspect,
              photoDataUrl,
              tafelPhotoDataUrl,
              tafelAspect,
              dateAdded: 'gerade eben',
              location: location ?? undefined,
            };
          } catch (e) {
            console.error('Foto aus der Mediathek konnte nicht verarbeitet werden', e);
            return null;
          }
        })
      );

      const newWorks = results.filter((w): w is Werk => w !== null);
      if (newWorks.length) dispatch({ type: 'IMPORT_WORKS', works: newWorks });
    },
    swapWorkTafelPhoto: (id) => dispatch({ type: 'SWAP_WORK_TAFEL_PHOTO', id }),
    confirmScanResult: () => {
      if (!state.scanResult) return;
      const work: Werk = { ...state.scanResult, id: nextId(), status: 'zu prüfen', dateAdded: 'gerade eben' };
      dispatch({ type: 'ADD_WORK', work, goToKorrektur: false });
      if (isRealArtistName(work.artistCall, work.isNotname)) ensureArtistPortrait(work.artistCall);
      showToast('Werk hinzugefügt');
    },
    editScanResult: () => {
      if (!state.scanResult) return;
      const work: Werk = { ...state.scanResult, id: nextId(), status: 'zu prüfen', dateAdded: 'gerade eben' };
      dispatch({ type: 'ADD_WORK', work, goToKorrektur: true });
    },
    toggleChip: (label) => dispatch({ type: 'TOGGLE_CHIP', label }),
    setSammlungSubTab: (tab) => dispatch({ type: 'SET_SAMMLUNG_SUB_TAB', tab }),
    setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', query }),
    confirmWork: (id) => {
      dispatch({ type: 'CONFIRM_WORK', id });
      const work = state.works.find((w) => w.id === id);
      if (work && isRealArtistName(work.artistCall, work.isNotname)) ensureArtistPortrait(work.artistCall);
      showToast('Werk bestätigt');
    },
    toggleEdit: (id) => dispatch({ type: 'TOGGLE_EDIT', id }),
    updateWorkField: (id, field, value) => dispatch({ type: 'UPDATE_WORK_FIELD', id, field, value }),
    restoreWorks: (works) => {
      dispatch({ type: 'RESTORE_WORKS', works });
      showToast('Sicherung wiederhergestellt');
    },
    createCollection: (name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      dispatch({ type: 'CREATE_COLLECTION', collection: { id: `col_${nextId()}`, name: trimmed, workIds: [] } });
    },
    deleteCollection: (id) => dispatch({ type: 'DELETE_COLLECTION', id }),
    toggleWorkInCollection: (collectionId, workId) => dispatch({ type: 'TOGGLE_WORK_IN_COLLECTION', collectionId, workId }),
    ensureArtistPortrait,
    showToast,
  };

  return <CollectionContext.Provider value={{ state, actions }}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextValue {
  const ctx = useContext(CollectionContext);
  if (!ctx) throw new Error('useCollection must be used within a CollectionProvider');
  return ctx;
}

const LOCATION_CAPTURE_KEY = 'kunstwerke:capture-location:v1';

/** Ob beim Scan/Import der Standort erfasst wird (Basis für "Ihre Scankarte"). */
export function isLocationCaptureEnabled(): boolean {
  try {
    return localStorage.getItem(LOCATION_CAPTURE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setLocationCaptureEnabled(enabled: boolean) {
  try {
    localStorage.setItem(LOCATION_CAPTURE_KEY, enabled ? 'on' : 'off');
  } catch {
    // best-effort, s. state/CollectionContext.tsx persistJson
  }
}

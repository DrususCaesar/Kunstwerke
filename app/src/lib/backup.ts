import type { Werk } from '../types';

/**
 * Lokale Sicherung als JSON-Datei — Ersatz für die Backup-Erinnerung aus dem
 * Design, solange keine Supabase-Cloud-Sicherung angebunden ist (Konzept 5, 9).
 */

const LAST_BACKUP_KEY = 'kunstwerke:last-backup-at:v1';

export function exportBackup(works: Werk[]) {
  const payload = { exportedAt: new Date().toISOString(), works };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kunstwerke-sicherung-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  try {
    localStorage.setItem(LAST_BACKUP_KEY, payload.exportedAt);
  } catch {
    // best-effort
  }
}

export function readLastBackupAt(): Date | null {
  try {
    const raw = localStorage.getItem(LAST_BACKUP_KEY);
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}

/** Öffnet den Datei-Dialog und liest eine zuvor exportierte Sicherung ein. */
export function importBackup(): Promise<Werk[] | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    // s. services/camera.ts — auf iOS/iPadOS Safari muss das <input> im DOM
    // hängen, damit .click() den nativen Dialog zuverlässig öffnet.
    input.style.position = 'fixed';
    input.style.top = '-1000px';
    input.style.left = '-1000px';
    document.body.appendChild(input);

    input.onchange = async () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) {
        resolve(null);
        return;
      }
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const works = Array.isArray(parsed) ? parsed : parsed?.works;
        resolve(Array.isArray(works) ? works : null);
      } catch (e) {
        console.error('Sicherung konnte nicht gelesen werden', e);
        resolve(null);
      }
    };
    input.click();
  });
}

import { useMemo, useState, type ReactNode } from 'react';
import { useCollection } from '../state/CollectionContext';
import { collectionStats } from '../lib/selectors';
import { exportBackup, importBackup, readLastBackupAt } from '../lib/backup';
import { isLocationCaptureEnabled, setLocationCaptureEnabled } from '../lib/settings';
import { CircleButton } from '../components/CircleButton';
import { SCREEN_TOP_PADDING } from '../lib/layout';

const BACKUP_DUE_AFTER_DAYS = 14;

function formatBackupDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isBackupDue(lastBackupAt: Date | null): boolean {
  if (!lastBackupAt) return true;
  const days = (Date.now() - lastBackupAt.getTime()) / (1000 * 60 * 60 * 24);
  return days > BACKUP_DUE_AFTER_DAYS;
}

export function SettingsScreen() {
  const { state, actions } = useCollection();
  const stats = useMemo(() => collectionStats(state.works), [state.works]);
  const [lastBackupAt, setLastBackupAt] = useState<Date | null>(() => readLastBackupAt());
  const [locationEnabled, setLocationEnabled] = useState(() => isLocationCaptureEnabled());

  const due = isBackupDue(lastBackupAt);

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-app)', zIndex: 30, overflowY: 'auto', animation: 'fadeUp 0.25s ease' }}>
      <div style={{ padding: `${SCREEN_TOP_PADDING} 20px 4px`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <CircleButton onClick={actions.closeScreen} variant="onCard">
          ‹
        </CircleButton>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: 'var(--text-primary)' }}>
          Einstellungen &amp; Statistiken
        </div>
      </div>

      <div style={{ padding: '18px 20px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--accent-gold)' }}>{stats.total}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Werke erfasst</div>
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, color: 'var(--accent-gold)' }}>{stats.museums}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>Museen besucht</div>
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: 14, gridColumn: 'span 2' }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>Meistvertretene Epoche</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--text-primary)' }}>{stats.topEpoch}</div>
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-quaternary)',
            marginBottom: 8,
          }}
        >
          Erfassungen nach Monat
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 56, marginBottom: 26 }}>
          {stats.chart.map((bar) => (
            <div
              key={bar.label}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <div
                style={{
                  width: '100%',
                  borderRadius: '3px 3px 0 0',
                  background: 'oklch(0.78 0.13 75 / 0.55)',
                  height: bar.height,
                }}
              />
              <span style={{ fontSize: 8, color: 'var(--text-quaternary)' }}>{bar.label}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: 'var(--bg-card)',
          }}
        >
          <SettingsRow
            label="Export als PDF-Katalog"
            trailing="›"
            onClick={async () => {
              if (state.works.length === 0) {
                actions.showToast('Noch keine Werke zum Exportieren');
                return;
              }
              // Dynamischer Import hält jsPDF aus dem Haupt-Bundle heraus —
              // die meisten Sitzungen exportieren nie einen Katalog.
              const { exportCollectionAsPdf } = await import('../lib/pdfCatalog');
              exportCollectionAsPdf(state.works);
            }}
          />
          <SettingsRow label="Freigabe & Zugriffsrechte" trailing="›" disabledHint="benötigt Supabase" />
          <SettingsRow
            label="Backup-Erinnerung"
            trailing={due ? 'Fällig' : `Zuletzt: ${formatBackupDate(lastBackupAt!)}`}
            trailingColor={due ? 'var(--accent-terracotta)' : 'var(--text-quaternary)'}
            onClick={() => {
              exportBackup(state.works);
              setLastBackupAt(new Date());
              actions.showToast('Sicherung heruntergeladen');
            }}
          />
          <SettingsRow
            label="Sicherung wiederherstellen"
            trailing="›"
            onClick={async () => {
              const works = await importBackup();
              if (works) actions.restoreWorks(works);
              else actions.showToast('Datei konnte nicht gelesen werden');
            }}
          />
          <SettingsRow
            label="Standort bei Scan erfassen"
            trailing={
              <Toggle
                on={locationEnabled}
                onClick={() => {
                  const next = !locationEnabled;
                  setLocationEnabled(next);
                  setLocationCaptureEnabled(next);
                }}
              />
            }
            isLast
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-quaternary)', lineHeight: 1.5, marginTop: 10 }}>
          Grundlage für "Ihre Scankarte" und "Museen in der Nähe" auf der Home-Seite. Sync über mehrere Geräte folgt, sobald Supabase verbunden ist.
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: 42,
        height: 24,
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        cursor: 'pointer',
        background: on ? 'var(--accent-gold)' : 'var(--bg-input-border)',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.15s ease',
        }}
      />
    </button>
  );
}

function SettingsRow({
  label,
  trailing,
  trailingColor = 'var(--text-quaternary)',
  onClick,
  disabledHint,
  isLast = false,
}: {
  label: string;
  trailing: ReactNode;
  trailingColor?: string;
  onClick?: () => void;
  disabledHint?: string;
  isLast?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '13px 14px',
        borderBottom: isLast ? undefined : '1px solid oklch(0.28 0.014 50)',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
        {label}
        {disabledHint && <span style={{ color: 'var(--text-quaternary)', fontSize: 11 }}> · {disabledHint}</span>}
      </span>
      <span style={{ fontSize: trailing === 'Fällig' || String(trailing).startsWith('Zuletzt') ? 11 : undefined, color: trailingColor }}>
        {trailing}
      </span>
    </div>
  );
}

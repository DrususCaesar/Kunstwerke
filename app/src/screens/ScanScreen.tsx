import { useCollection } from '../state/CollectionContext';
import { PlaceholderArt, MonoLabel } from '../components/PlaceholderArt';
import { ArtistName } from '../components/ArtistName';
import { Badge, confidenceVariant } from '../components/Badge';
import { IconSingleScan, IconDoubleScan } from '../components/icons';

export function ScanScreen() {
  const { state, actions } = useCollection();
  const recentScans = state.works.slice(0, 3);

  return (
    <div style={{ padding: '6px 20px 24px' }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: 'var(--text-primary)' }}>Scankarte</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 4, marginBottom: 22 }}>
        Kunstwerk fotografieren und automatisch erfassen
      </div>

      {!state.scanStep && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <button
              onClick={actions.startSingleScan}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'flex-start',
                padding: 16,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-strong)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: 'var(--accent-gold-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSingleScan />
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>Einzelscan</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>Ein Foto des Werks</div>
            </button>
            <button
              onClick={actions.startDoubleScan}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'flex-start',
                padding: 16,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-strong)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: 'var(--accent-terracotta-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconDoubleScan />
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>Doppelscan</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>Werk + Tafel verknüpfen</div>
            </button>
          </div>

          <button
            onClick={actions.importFromLibrary}
            style={{
              width: '100%',
              padding: 13,
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1px dashed var(--bg-input-border)',
              color: 'var(--text-secondary)',
              fontSize: 12.5,
              cursor: 'pointer',
              marginBottom: 28,
            }}
          >
            Aus Fotomediathek importieren (Mehrfachauswahl)
          </button>

          <div
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-quaternary)',
              marginBottom: 10,
            }}
          >
            Zuletzt erfasst
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentScans.map((w) => (
              <div
                key={w.id}
                onClick={() => actions.openDetail(w.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 0',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <PlaceholderArt
                  seed={w.id}
                  photoDataUrl={w.photoDataUrl}
                  alt={w.title}
                  style={{ width: 38, height: 38, flexShrink: 0 }}
                  radius={7}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {w.title}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-quaternary)' }}>{w.dateAdded}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {state.scanStep === 'scanning' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '50px 10px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '2.5px solid var(--border-strong)',
              borderTopColor: 'var(--accent-gold)',
              animation: 'spin 0.9s linear infinite',
            }}
          />
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Foto wird analysiert …</div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center', maxWidth: 220, lineHeight: 1.5 }}>
            Künstler, Titel und weitere Angaben werden nach Möglichkeit automatisch erkannt — offene Felder trägst du im nächsten Schritt selbst ein
          </div>
        </div>
      )}

      {state.scanStep === 'result' && state.scanResult && (
        <div style={{ animation: 'fadeUp 0.3s ease' }}>
          <PlaceholderArt
            seed={999}
            photoDataUrl={state.scanResult.photoDataUrl}
            alt="Soeben aufgenommenes Werkfoto"
            aspect={state.scanResult.aspect}
            radius={12}
            style={{ marginBottom: 14 }}
          >
            <MonoLabel>WERKFOTO · SOEBEN AUFGENOMMEN</MonoLabel>
          </PlaceholderArt>
          <div style={{ marginBottom: 12 }}>
            <Badge label={state.scanResult.confidence} variant={confidenceVariant(state.scanResult.confidence)} dot={false} />
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
            {state.scanResult.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            <ArtistName werk={state.scanResult} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, marginBottom: 20 }}>
            {state.scanResult.year || state.scanResult.museum
              ? [state.scanResult.year, state.scanResult.museum].filter(Boolean).join(' · ')
              : 'Angaben noch offen'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={actions.confirmScanResult}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--accent-gold)',
                color: 'var(--accent-gold-text-on)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Übernehmen
            </button>
            <button
              onClick={actions.editScanResult}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--bg-input-border)',
                background: 'transparent',
                color: 'var(--text-outline-btn)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Bearbeiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useCollection } from '../state/CollectionContext';
import { groupByArtist } from '../lib/selectors';
import { PlaceholderArt, MonoLabel } from '../components/PlaceholderArt';
import { ArtistName } from '../components/ArtistName';
import { ScanMap, type MapPoint } from '../components/ScanMap';
import { IconGear, IconPin } from '../components/icons';
import { placeholderBg } from '../lib/placeholder';
import { fetchNearbyMuseums, type NearbyMuseum } from '../services/nearbyMuseums';

function greetingForNow(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function roundKey(lat: number, lng: number): string {
  return `${lat.toFixed(3)},${lng.toFixed(3)}`;
}

export function HomeScreen() {
  const { state, actions } = useCollection();
  const [greeting] = useState(greetingForNow);
  const artists = useMemo(() => groupByArtist(state.works), [state.works]);
  const recent = state.works.slice(0, 10);
  const hero = state.works[0];

  useEffect(() => {
    artists.forEach((a) => {
      if (!a.isNotname) actions.ensureArtistPortrait(a.call);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artists]);

  const mapPoints: MapPoint[] = useMemo(
    () =>
      state.works
        .filter((w) => w.location)
        .map((w) => ({ lat: w.location!.lat, lng: w.location!.lng, seed: w.id, photoDataUrl: w.photoDataUrl })),
    [state.works]
  );
  const placeCount = useMemo(() => new Set(mapPoints.map((p) => roundKey(p.lat, p.lng))).size, [mapPoints]);

  const [nearby, setNearby] = useState<NearbyMuseum[] | null>(null);
  const latestLocation = state.works.find((w) => w.location)?.location;
  useEffect(() => {
    if (!latestLocation) {
      setNearby(null);
      return;
    }
    let cancelled = false;
    fetchNearbyMuseums(latestLocation).then((result) => {
      if (!cancelled) setNearby(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestLocation?.lat, latestLocation?.lng]);

  return (
    <div style={{ padding: '6px 20px 24px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500, color: 'var(--text-primary)' }}>
          {greeting}
        </div>
        <button
          onClick={actions.openSettings}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <IconGear />
        </button>
      </div>

      {hero ? (
        <div onClick={() => actions.openDetail(hero.id)} style={{ cursor: 'pointer' }}>
          <PlaceholderArt seed={hero.id} photoDataUrl={hero.photoDataUrl} alt={hero.title} aspect="4/3" radius={16}>
            <MonoLabel>WERKFOTO</MonoLabel>
          </PlaceholderArt>
          <div style={{ marginTop: 10 }}>
            <span
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--accent-gold)',
                fontWeight: 600,
              }}
            >
              Zuletzt hinzugefügt
            </span>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 19,
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
                marginTop: 3,
              }}
            >
              {hero.title}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              <ArtistName werk={hero} /> {hero.year && `· ${hero.year}`}
            </div>
            {hero.museum && <div style={{ fontSize: 11.5, color: 'var(--text-quaternary)', marginTop: 2 }}>{hero.museum}</div>}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            textAlign: 'center',
            border: '1px solid var(--border-strong)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>
            Noch keine Werke erfasst
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginBottom: 16, lineHeight: 1.5 }}>
            Fotografiere dein erstes Kunstwerk, um deine Sammlung zu starten.
          </div>
          <button
            onClick={() => actions.selectTab('scan')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--accent-gold)',
              color: 'var(--accent-gold-text-on)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Jetzt scannen
          </button>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <SectionHeader
            title="Kürzliche Scans"
            actions={[
              { label: 'Scannen', onClick: () => actions.selectTab('scan') },
              { label: 'Alle anzeigen', onClick: () => actions.selectTab('sammlung') },
            ]}
          />
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {recent.map((w) => (
              <div key={w.id} onClick={() => actions.openDetail(w.id)} style={{ flexShrink: 0, width: 76, cursor: 'pointer' }}>
                <PlaceholderArt seed={w.id} photoDataUrl={w.photoDataUrl} alt={w.title} radius={10} style={{ width: 76, height: 76 }} />
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--text-primary)',
                    marginTop: 5,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {w.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {artists.length > 0 && (
        <div>
          <SectionHeader title="Deine Top-Künstler" actions={[{ label: 'Statistiken', onClick: actions.openSettings }]} />
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {artists.slice(0, 8).map((a) => {
              const portrait = state.artistPortraits[a.call];
              return (
                <div
                  key={a.call}
                  onClick={() => actions.openArtist(a.call)}
                  style={{
                    flexShrink: 0,
                    width: 128,
                    height: 160,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    background: portrait ? undefined : placeholderBg(a.call.length * 7),
                  }}
                >
                  {portrait && (
                    <img src={portrait} alt={a.call} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      fontSize: 10,
                    }}
                  >
                    {a.count} {a.count === 1 ? 'Scan' : 'Scans'}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 'auto 0 0 0',
                      padding: '20px 10px 10px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                    }}
                  >
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>{a.call}</div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10.5, marginTop: 2 }}>Mehr erfahren →</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <SectionHeader title="Ihre Scankarte" />
        <ScanMap points={mapPoints} />
        <div style={{ fontSize: 11.5, color: 'var(--text-quaternary)', marginTop: 8 }}>
          {mapPoints.length === 0 ? 'Noch keine Standorte erfasst' : `${placeCount} ${placeCount === 1 ? 'Ort' : 'Orte'} · ${mapPoints.length} Scans`}
        </div>
      </div>

      {latestLocation && (
        <div>
          <SectionHeader title="Museen in der Nähe" />
          {nearby === null ? (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Lädt …</div>
          ) : nearby.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Keine Museen in der Nähe gefunden.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {nearby.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 0',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    <IconPin />
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-quaternary)' }}>{m.distanceKm.toFixed(1)} km</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, actions }: { title: string; actions?: { label: string; onClick: () => void }[] }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' }}>{title}</div>
      {actions && (
        <div style={{ display: 'flex', gap: 12 }}>
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: 11.5, cursor: 'pointer' }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import type { CSSProperties, ReactNode } from 'react';
import { placeholderBg } from '../lib/placeholder';

interface PlaceholderArtProps {
  seed: number;
  aspect?: string;
  radius?: number | string;
  padding?: number | string;
  children?: ReactNode;
  style?: CSSProperties;
  /** Echtes Foto (data: URL) — wenn gesetzt, ersetzt es den gestreiften Platzhalter 1:1. */
  photoDataUrl?: string;
  alt?: string;
}

/** Werkfoto-/Tafelfoto-Fläche: echtes Foto, wenn vorhanden — sonst der gestreifte Platzhalter. */
export function PlaceholderArt({ seed, aspect, radius = 10, padding, children, style, photoDataUrl, alt }: PlaceholderArtProps) {
  if (photoDataUrl) {
    return (
      <div
        style={{
          borderRadius: radius,
          aspectRatio: aspect,
          overflow: 'hidden',
          ...style,
        }}
      >
        <img src={photoDataUrl} alt={alt ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    );
  }

  return (
    <div
      style={{
        background: placeholderBg(seed),
        borderRadius: radius,
        aspectRatio: aspect,
        padding,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function MonoLabel({ children, size = 10 }: { children: ReactNode; size?: number }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: size,
        letterSpacing: '0.06em',
        color: 'oklch(0.6 0.02 55)',
        textTransform: 'uppercase',
        textAlign: 'center',
        lineHeight: 1.7,
      }}
    >
      {children}
    </span>
  );
}

import type { CSSProperties, ReactNode } from 'react';

interface CircleButtonProps {
  onClick?: () => void;
  children: ReactNode;
  variant?: 'onImage' | 'onCard';
  fontSize?: number;
  style?: CSSProperties;
}

/** 34px runder Icon-Button — halbtransparent auf Hero-Bildern, deckend auf Kartenhintergrund. */
export function CircleButton({ onClick, children, variant = 'onImage', fontSize = 18, style }: CircleButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: variant === 'onImage' ? 'rgba(0,0,0,0.45)' : 'var(--bg-card-light)',
        border: 'none',
        color: '#fff',
        fontSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

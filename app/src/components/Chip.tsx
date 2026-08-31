interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12,
        padding: '7px 13px',
        borderRadius: 'var(--radius-pill)',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        border: `1px solid ${active ? 'var(--accent-gold)' : 'var(--border-strong)'}`,
        background: active ? 'var(--accent-gold-bg)' : 'var(--bg-card)',
        color: active ? 'var(--accent-gold)' : 'var(--text-secondary)',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

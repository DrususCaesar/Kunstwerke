type BadgeVariant = 'gold' | 'terracotta';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  dot?: boolean;
}

const VARIANT_STYLE: Record<BadgeVariant, { color: string; bg: string }> = {
  gold: { color: 'var(--accent-gold)', bg: 'var(--accent-gold-bg)' },
  terracotta: { color: 'var(--accent-terracotta)', bg: 'var(--accent-terracotta-bg)' },
};

export function statusVariant(status: string): BadgeVariant {
  return status === 'vollständig' ? 'gold' : 'terracotta';
}

export function confidenceVariant(confidence: string): BadgeVariant {
  return confidence === 'sicher' ? 'gold' : 'terracotta';
}

/** Status-/Konfidenz-Pille mit optionalem Punkt (Punkt nur in der Werk-Detailansicht). */
export function Badge({ label, variant, dot = false }: BadgeProps) {
  const { color, bg } = VARIANT_STYLE[variant];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignSelf: 'flex-start',
        gap: dot ? 6 : 5,
        alignItems: 'center',
        padding: dot ? '5px 11px' : '4px 9px',
        borderRadius: 'var(--radius-pill)',
        background: bg,
        flexShrink: 0,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
      <span style={{ fontSize: dot ? 11.5 : 10, color, fontWeight: 500, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
}

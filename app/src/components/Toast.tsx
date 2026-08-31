export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 96,
        left: '50%',
        background: 'oklch(0.28 0.016 50)',
        color: 'var(--text-primary)',
        fontSize: 12.5,
        padding: '10px 18px',
        borderRadius: 'var(--radius-pill)',
        boxShadow: 'var(--shadow-toast)',
        zIndex: 50,
        animation: 'toastIn 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  );
}

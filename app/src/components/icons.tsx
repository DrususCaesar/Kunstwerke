/** Inline SVG icons, reproduced 1:1 from the design handoff (search ICON_ in the .dc.html source). */

type IconProps = { size?: number };

export function IconScan({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={(size * 18) / 22} viewBox="0 0 22 18">
      <rect x="0.6" y="3" width="20.8" height="14" rx="2.5" stroke="currentColor" fill="none" strokeWidth="1.4" />
      <circle cx="11" cy="10.3" r="3.8" stroke="currentColor" fill="none" strokeWidth="1.4" />
      <rect x="7.5" y="0.5" width="7" height="2.6" rx="0.7" fill="currentColor" />
    </svg>
  );
}

export function IconGrid({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <rect x="0.5" y="0.5" width="8" height="8" rx="1.6" stroke="currentColor" fill="none" strokeWidth="1.4" />
      <rect x="11.5" y="0.5" width="8" height="8" rx="1.6" stroke="currentColor" fill="none" strokeWidth="1.4" />
      <rect x="0.5" y="11.5" width="8" height="8" rx="1.6" stroke="currentColor" fill="none" strokeWidth="1.4" />
      <rect x="11.5" y="11.5" width="8" height="8" rx="1.6" stroke="currentColor" fill="none" strokeWidth="1.4" />
    </svg>
  );
}

export function IconPerson({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={(size * 20) / 18} viewBox="0 0 18 20">
      <circle cx="9" cy="5" r="4.3" stroke="currentColor" fill="none" strokeWidth="1.4" />
      <path d="M1 19c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke="currentColor" fill="none" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconSearch({ size = 19 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 19 19">
      <circle cx="8.2" cy="8.2" r="7" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <line x1="13.3" y1="13.3" x2="18" y2="18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconHome({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <path
        d="M2 9.5 10 2.5l8 7v8.2a1 1 0 0 1-1 1h-4.4v-6h-5.2v6H3a1 1 0 0 1-1-1z"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCompass({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" stroke="currentColor" fill="none" strokeWidth="1.4" />
      <path d="M13.2 6.8 11 11l-4.2 2.2L9 9z" stroke="currentColor" fill="none" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMore({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20">
      <rect x="1" y="1" width="18" height="18" rx="4" stroke="currentColor" fill="none" strokeWidth="1.4" />
      <circle cx="6" cy="10" r="1.2" fill="currentColor" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" />
      <circle cx="14" cy="10" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconGear({ size = 19 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 19 19">
      <circle cx="9.5" cy="9.5" r="2.6" stroke="currentColor" fill="none" strokeWidth="1.3" />
      <path
        d="M9.5 1.8v2.1M9.5 15.1v2.1M17.2 9.5h-2.1M3.9 9.5H1.8M15 4l-1.5 1.5M5.5 13.5 4 15M15 15l-1.5-1.5M5.5 5.5 4 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconPin({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <path
        d="M7 13S2 8.6 2 5.3a5 5 0 0 1 10 0C12 8.6 7 13 7 13Z"
        stroke="currentColor"
        fill="none"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="5.3" r="1.6" stroke="currentColor" fill="none" strokeWidth="1.1" />
    </svg>
  );
}

export function IconSingleScan() {
  return (
    <svg width="17" height="14" viewBox="0 0 17 14">
      <rect x="0.5" y="2.5" width="16" height="11" rx="2" stroke="var(--accent-gold)" fill="none" strokeWidth="1.2" />
      <circle cx="8.5" cy="8" r="3" stroke="var(--accent-gold)" fill="none" strokeWidth="1.2" />
      <rect x="5.5" y="0.5" width="5" height="2" rx="0.5" fill="var(--accent-gold)" />
    </svg>
  );
}

export function IconDoubleScan() {
  return (
    <svg width="19" height="14" viewBox="0 0 19 14">
      <rect x="0.5" y="2.5" width="10" height="11" rx="2" stroke="var(--accent-terracotta)" fill="none" strokeWidth="1.2" />
      <rect x="12" y="4.5" width="6.5" height="7" rx="1.5" stroke="var(--accent-terracotta)" fill="none" strokeWidth="1.2" />
    </svg>
  );
}

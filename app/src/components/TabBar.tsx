import type { Tab } from '../types';
import { IconScan, IconGrid, IconPerson, IconSearch, IconMore } from './icons';

// Reihenfolge auf Wunsch: Scan in der Mitte, Sammlung direkt rechts davon.
const TAB_DEF: { id: Tab; label: string; Icon: (props: { size?: number }) => React.JSX.Element }[] = [
  { id: 'kuenstler', label: 'Künstler', Icon: IconPerson },
  { id: 'suche', label: 'Suche', Icon: IconSearch },
  { id: 'scan', label: 'Scankarte', Icon: IconScan },
  { id: 'sammlung', label: 'Sammlung', Icon: IconGrid },
  { id: 'mehr', label: 'Mehr', Icon: IconMore },
];

interface TabBarProps {
  active: Tab;
  onSelect: (tab: Tab) => void;
}

export function TabBar({ active, onSelect }: TabBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '9px 6px calc(env(safe-area-inset-bottom, 0px) + 14px)',
        background: 'oklch(0.185 0.013 50)',
        borderTop: '1px solid var(--border-strong)',
        flexShrink: 0,
      }}
    >
      {TAB_DEF.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              color: isActive ? 'var(--accent-gold)' : 'var(--text-tertiary)',
            }}
          >
            <Icon />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

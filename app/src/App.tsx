import { CollectionProvider, useCollection } from './state/CollectionContext';
import { TabBar } from './components/TabBar';
import { Toast } from './components/Toast';
import { HomeScreen } from './screens/HomeScreen';
import { ScanScreen } from './screens/ScanScreen';
import { SammlungScreen } from './screens/SammlungScreen';
import { EntdeckenScreen } from './screens/EntdeckenScreen';
import { WorkDetailScreen } from './screens/WorkDetailScreen';
import { ArtistDetailScreen } from './screens/ArtistDetailScreen';
import { KorrekturScreen } from './screens/KorrekturScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CollectionDetailScreen } from './screens/CollectionDetailScreen';
import { SCREEN_TOP_PADDING } from './lib/layout';

function TabContent() {
  const { state } = useCollection();
  switch (state.tab) {
    case 'home':
      return <HomeScreen />;
    case 'scan':
      return <ScanScreen />;
    case 'sammlung':
      return <SammlungScreen />;
    case 'entdecken':
      return <EntdeckenScreen />;
    default:
      return null;
  }
}

/**
 * Bildschirm-Navigation — s. Handoff README → "Interactions & Behavior".
 * Push-Screens (Werk-/Künstler-Detail, Korrekturmaske, Einstellungen,
 * Sammlungs-Detail) überdecken den gesamten Screen inkl. Tab-Bar; ‹ kehrt
 * zum zuletzt aktiven Tab zurück.
 */
function AppShell() {
  const { state, actions } = useCollection();

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-app)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {state.screen === 'detail' && <WorkDetailScreen />}
      {state.screen === 'artist' && <ArtistDetailScreen />}
      {state.screen === 'korrektur' && <KorrekturScreen />}
      {state.screen === 'settings' && <SettingsScreen />}
      {state.screen === 'collection' && <CollectionDetailScreen />}

      {state.screen === 'tab' && (
        <>
          <div style={{ flex: 1, overflowY: 'auto', paddingTop: SCREEN_TOP_PADDING }}>
            <TabContent />
          </div>
          <TabBar active={state.tab} onSelect={actions.selectTab} />
        </>
      )}

      <Toast message={state.toast} />
    </div>
  );
}

export default function App() {
  return (
    <CollectionProvider>
      <div style={{ height: '100dvh', width: '100%', display: 'flex', justifyContent: 'center', background: 'var(--bg-app)' }}>
        <div style={{ width: '100%', maxWidth: 480, height: '100%', position: 'relative' }}>
          <AppShell />
        </div>
      </div>
    </CollectionProvider>
  );
}

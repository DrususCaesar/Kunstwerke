import { CollectionProvider, useCollection } from './state/CollectionContext';
import { TabBar } from './components/TabBar';
import { Toast } from './components/Toast';
import { ScanScreen } from './screens/ScanScreen';
import { GalleryScreen } from './screens/GalleryScreen';
import { ArtistsScreen } from './screens/ArtistsScreen';
import { SearchScreen } from './screens/SearchScreen';
import { MoreScreen } from './screens/MoreScreen';
import { WorkDetailScreen } from './screens/WorkDetailScreen';
import { ArtistDetailScreen } from './screens/ArtistDetailScreen';
import { KorrekturScreen } from './screens/KorrekturScreen';
import { SCREEN_TOP_PADDING } from './lib/layout';

function TabContent() {
  const { state } = useCollection();
  switch (state.tab) {
    case 'scan':
      return <ScanScreen />;
    case 'sammlung':
      return <GalleryScreen />;
    case 'kuenstler':
      return <ArtistsScreen />;
    case 'suche':
      return <SearchScreen />;
    case 'mehr':
      return <MoreScreen />;
    default:
      return null;
  }
}

/**
 * Bildschirm-Navigation — s. Handoff README → "Interactions & Behavior".
 * Push-Screens (Werk-Detail, Künstler-Detail, Korrekturmaske) überdecken
 * den gesamten Screen inkl. Tab-Bar; ‹ kehrt zum zuletzt aktiven Tab zurück.
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

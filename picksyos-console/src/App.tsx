import { useEffect, useSyncExternalStore } from 'react';
import { AppHeader } from './components/AppHeader';
import { IncidentPanel } from './components/IncidentPanel';
import { EmptyPane } from './components/Orientation';
import { Tour } from './components/Tour';
import { ParcelPage } from './components/ParcelPage';
import { DisclaimerBar } from './components/primitives';
import { Queue } from './components/Queue';
import { StationPage } from './components/StationPage';
import type { ConsoleEngine } from './domain/engine';
import { TOAST_MAX } from './domain/constants';
import { EngineContext, useEngine } from './EngineContext';

/** Off-screen changes only. At most 3 show (newest first); the rest collapse into "+N more". */
function Toasts() {
  const e = useEngine();
  const all = e.ui.toasts.map((t, i) => ({ t, i }));
  const visible = all.slice(-TOAST_MAX).reverse();
  const more = all.length - visible.length;
  return (
    <div aria-live="polite" className="toasts">
      {visible.map(({ t, i }) => (
        <div key={`${t.incId}-${t.text}`} role="status" className="toast">
          <span>{t.text}</span>
          <button type="button" className="link-btn" onClick={() => e.viewToast(i)}>
            Göster
          </button>
        </div>
      ))}
      {more > 0 && <div className="toast toast--more">+{more} olay daha</div>}
    </div>
  );
}

function Main() {
  const e = useEngine();
  const R = e.route;
  if (R.view === 'station') return <StationPage id={R.id} from={R.from} />;
  if (R.view === 'parcel') return <ParcelPage id={R.id} from={R.from} />;
  const sel = R.incident ? e.db.incidents[R.incident] : undefined;
  const phone = e.isPhone;
  return (
    <>
      <h1 className="sr-only">Olay kuyruğu</h1>
      {(!phone || !sel) && <Queue />}
      {(!phone || sel) && (
        <section aria-label="Olay ayrıntısı" className="detail">
          {sel ? (
            <IncidentPanel key={sel.id} inc={sel} />
          ) : (
            <EmptyPane />
          )}
        </section>
      )}
    </>
  );
}

export function App({ engine }: { engine: ConsoleEngine }) {
  useSyncExternalStore(engine.subscribe, engine.getVersion);
  useEffect(() => engine.start(), [engine]);
  const theme = engine.ui.theme;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <EngineContext.Provider value={engine}>
      <div className="app">
        <AppHeader />
        <main className="main">
          <Main />
          <Toasts />
        </main>
        <DisclaimerBar />
        <Tour />
      </div>
    </EngineContext.Provider>
  );
}

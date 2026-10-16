import { parcelModel } from '../domain/selectors';
import { useEngine } from '../EngineContext';
import { Icon } from './Icon';
import { usePageFocus } from './usePageFocus';
import { ActionBar, ResultNotice } from './ActionBar';
import { EventList, IncidentLink } from './lists';
import { Breadcrumb, Chip, ParcelFlags, SectionTitle } from './primitives';
import { NotFound } from './StationPage';

export function ParcelPage({ id, from }: { id: string; from: string | null }) {
  const e = useEngine();
  const p = parcelModel(e, id, from);
  const title = usePageFocus(id);
  if (!p) return <NotFound what="Paket" id={id} />;
  return (
    <div className="page">
      <div className="page__inner">
        <Breadcrumb items={p.crumbs} />
        <div className="page__head">
          <h1 ref={title} tabIndex={-1} className="title mono">{p.id}</h1>
          <ParcelFlags flags={p.flags} />
          <div className="page__meta page__meta--row">
            <a href={p.stationHref} className="mono strong">
              {p.stationId}
            </a>
            <span>{p.comp}</span>
            <span aria-hidden="true">·</span>
            <span>Alıcı •• {p.digits}</span>
          </div>
        </div>

        {p.waitingFor && (
          <p className="page__wait">
            <Icon name="clock" size={14} strokeWidth={1.6} />
            {p.waitingFor}
          </p>
        )}

        {p.result && <ResultNotice r={p.result} />}

        <div className="page__actions">
          <span className="label">İşlemler</span>
          {p.actions.length ? (
            <ActionBar actions={p.actions} pending={p.pending} touch={e.isPhone} />
          ) : (
            <span className="body-2">{p.noActionsText}</span>
          )}
        </div>

        <div className="stats">
          <div className="stat">
            <span className="label">Geliş</span>
            <span className="stat__v mono">{p.arrived}</span>
          </div>
          <div className="stat">
            <span className="label">Bekletme sonu</span>
            <span className="stat__v mono">{p.hold}</span>
          </div>
        </div>

        <div className="split split--parcel">
          <div className="stack">
            <div className="block block--pad">
              <SectionTitle>Bildirimler</SectionTitle>
              <ul className="notifs">
                {p.notifs.map((n) => (
                  <li key={n.key}>
                    <span className="notifs__ch">{n.ch}</span>
                    <span className="mono muted sm">{n.time}</span>
                    {n.ok ? (
                      <Chip tone="ok" icon="check" square small>
                        İletildi
                      </Chip>
                    ) : (
                      <Chip tone="err" icon="x" square small>
                        İletilmedi
                      </Chip>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="block block--list">
              <SectionTitle>Bağlı olaylar</SectionTitle>
              {p.incidents.map((i) => (
                <IncidentLink key={i.id} i={i} />
              ))}
              {!p.incidents.length && <div className="block__empty">Bağlı olay yok.</div>}
            </div>
          </div>
          <div className="block block--pad">
            <SectionTitle>Paket geçmişi</SectionTitle>
            <EventList events={p.history} wide />
          </div>
        </div>
      </div>
    </div>
  );
}

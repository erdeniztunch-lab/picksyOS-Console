import { stationModel } from '../domain/selectors';
import { useEngine } from '../EngineContext';
import { usePageFocus } from './usePageFocus';
import { ActionBar, ResultNotice } from './ActionBar';
import { Icon } from './Icon';
import { EventList, IncidentLink, ParcelRow } from './lists';
import { Breadcrumb, Freshness, SectionTitle, StationStateChip, cx } from './primitives';

export function StationPage({ id, from }: { id: string; from: string | null }) {
  const e = useEngine();
  const s = stationModel(e, id, from);
  const title = usePageFocus(id);
  if (!s) return <NotFound what="İstasyon" id={id} />;
  return (
    <div className="page">
      <div className="page__inner page__inner--wide">
        <Breadcrumb items={s.crumbs} />
        <div className="page__head">
          <div className="page__title-row">
            <h1 ref={title} tabIndex={-1} className="title mono">{s.id}</h1>
            <StationStateChip state={s.state} />
            <Freshness value={s.fresh} />
          </div>
          <span className="page__meta">{s.meta}</span>
        </div>

        {/* Stale values are greyed and dashed, never shown as healthy. */}
        <div className={cx('stats', s.stale && 'stats--stale')}>
          {s.stats.map((f) => (
            <div key={f.k} className="stat">
              <span className="label">{f.k}</span>
              <span className={cx('stat__v', f.mono && 'mono', f.tone && `tone-${f.tone}`)}>{f.v}</span>
              {f.sub && <span className="mono muted xs">{f.sub}</span>}
            </div>
          ))}
        </div>

        {s.tasks.length > 0 && (
          <div className="notice notice--info task-banner" role="status">
            <Icon name="clock" size={14} strokeWidth={1.6} className="notice__icon" />
            <div className="task-banner__body">
              {s.tasks.map((t) => (
                <a key={t.incId} href={t.href} className={t.breached ? 'task-banner__line tone-err' : 'task-banner__line'}>
                  {t.text}
                  {t.breached ? ' · aşıldı' : ''}
                </a>
              ))}
              {s.taskNote && <span className="task-banner__note">{s.taskNote}</span>}
            </div>
          </div>
        )}

        {s.result && <ResultNotice r={s.result} />}

        <div className="page__actions">
          {s.actions.length ? (
            <ActionBar actions={s.actions} pending={s.pending} touch={e.isPhone} />
          ) : (
            <span className="body-2">{s.noActionsText}</span>
          )}
        </div>

        <div className="split split--station">
          <div className="stack">
            <div className="block block--list">
              <SectionTitle count={s.incidents.length}>Açık olaylar</SectionTitle>
              {s.incidents.map((i) => (
                <IncidentLink key={i.id} i={i} withDeadline />
              ))}
              {!s.incidents.length && <div className="block__empty">Bu istasyonda açık olay yok.</div>}
            </div>
            <div className="block block--pad">
              <SectionTitle extra={<span className="muted sm">son 20</span>}>İstasyon geçmişi</SectionTitle>
              <EventList events={s.history} wide />
            </div>
          </div>
          <div className="block block--list">
            <SectionTitle
              count={s.parcelCount}
              extra={
                <>
                  <span className="block__meta">{s.blockedText}</span>
                </>
              }
            >
              Bekleyen paketler
            </SectionTitle>
            {s.parcels.map((p) => (
              <ParcelRow key={p.id} p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotFound({ what, id }: { what: string; id: string }) {
  return (
    <div className="page">
      <div className="page__inner">
        <Breadcrumb items={[{ label: 'Kuyruk', href: '#/queue' }, { label: id }]} />
        <p className="empty-page">
          {what} {id} bu demoda yok. <a href="#/queue">Kuyruğa dön</a>
        </p>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { queueModel, type FilterChipView, type RowView, type SectionView } from '../domain/selectors';
import { useEngine } from '../EngineContext';
import { Icon, type IconName } from './Icon';
import { Chip, DeadlineCountdown, IncidentStatusChip, OwnerChip, PriorityBadge, cx } from './primitives';

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v));

function FilterChip<T>({ f, touch, onToggle }: { f: FilterChipView<T>; touch: boolean; onToggle: () => void }) {
  return (
    <button type="button" aria-pressed={f.pressed} className={cx('filter', f.pressed && 'is-on', touch && 'filter--touch')} onClick={onToggle}>
      {f.pressed && <Icon name="check" size={10} strokeWidth={1.8} />}
      {f.label}
      <span className="mono filter__count">{f.count}</span>
    </button>
  );
}

const LEAD: Partial<Record<RowView['status'], [IconName, string]>> = {
  inProgress: ['spin', 'lead--info'],
  awaitingField: ['clock', 'lead--info'],
  recovered: ['recover', 'lead--ok'],
  resolved: ['check', 'lead--ok'],
};

function QueueRow({ r, tour }: { r: RowView; tour?: string }) {
  const e = useEngine();
  const lead = LEAD[r.status] ?? ['ring', ''];
  const ref = useRef<HTMLButtonElement>(null);
  const scroll = e.scrollReq;
  const focusReq = e.focusRowReq;
  useEffect(() => {
    if (focusReq && focusReq.id === r.id) ref.current?.focus({ preventScroll: false });
  }, [focusReq?.seq]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (scroll && scroll.id === r.id) ref.current?.scrollIntoView({ block: 'center', behavior: e.reducedMotion ? 'auto' : 'smooth' });
  }, [scroll?.seq]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <button
      ref={ref}
      data-tour={tour}
      type="button"
      className={cx(
        'row',
        r.selected && 'is-selected',
        r.moved && 'is-moved',
        'tone' in r.deadline && r.deadline.tone === 'breached' && 'is-breached',
      )}
      aria-current={r.selected || undefined}
      aria-label={r.spokenName}
      aria-describedby={r.chips.length ? `why-${r.id} chips-${r.id}` : `why-${r.id}`}
      onClick={() => e.select(r.id)}
    >
      <span className="row__lead">
        {r.ranked ? (
          <PriorityBadge band={r.band} />
        ) : (
          <span className={cx('lead', lead[1])}>
            <Icon name={lead[0]} size={12} />
          </span>
        )}
      </span>
      <span className="row__title">
        <span className="strong">{r.type}</span>
        <span className="mono row__station">{r.station}</span>
        <span className="muted">{r.city}</span>
        <span className="mono muted xs">{r.id}</span>
      </span>
      <span className="row__deadline">
        <DeadlineCountdown value={r.deadline} />
      </span>
      <span id={`why-${r.id}`} className="row__why">
        {r.whyLead && <span className="row__why-lead">{r.whyLead}</span>}
        {r.whyLead && r.why && ' · '}
        {r.why}
      </span>
      {r.chips.length > 0 && (
        <span id={`chips-${r.id}`} className="row__chips">
          {r.chips.map((c, i) => {
            if (c.kind === 'status') return <IncidentStatusChip key={i} status={c.status} size="sm" />;
            if (c.kind === 'owner') return <OwnerChip key={i} owner={c.owner} small />;
            return (
              <Chip key={i} tone="unk" icon="clock" small>
                Sinyal gecikiyor
              </Chip>
            );
          })}
        </span>
      )}
    </button>
  );
}

function SkeletonRow({ w1, w2 }: { w1: string; w2: string }) {
  return (
    <div className="row row--skeleton" aria-hidden="true">
      <span className="sk sk--band" />
      <span className="sk" style={{ width: w1 }} />
      <span className="sk sk--deadline" />
      <span className="sk sk--why" style={{ width: w2 }} />
    </div>
  );
}

function QueueSection({ s, onClear }: { s: SectionView; onClear: () => void }) {
  const e = useEngine();
  return (
    <div role="group" aria-label={s.title}>
      <div className="section" data-tour={s.key === 'need' ? 'queue' : undefined}>
        <h2 className="section__h">
        <button
          type="button"
          className="section__toggle"
          aria-expanded={s.open}
          onClick={() => e.setUi({ collapsed: { ...e.ui.collapsed, [s.key]: !e.ui.collapsed[s.key] } })}
        >
          <Icon name={s.open ? 'chevDown' : 'chevRight'} size={10} strokeWidth={1.6} className="section__chev" />
          <span className="label-strong">{s.title}</span>
          <span className="mono muted sm">{s.count}</span>
        </button>
        </h2>
        {s.note && <span className="section__note">{s.note}</span>}
      </div>
      {s.open && (
        <>
          {s.loading && (
            <>
              <SkeletonRow w1="60%" w2="85%" />
              <SkeletonRow w1="50%" w2="70%" />
              <SkeletonRow w1="65%" w2="80%" />
            </>
          )}
          {s.rows.map((r, i) => (
            <QueueRow key={r.id} r={r} tour={s.key === 'need' && i === 0 ? 'top-row' : undefined} />
          ))}
          {s.isEmpty && (
            <div className={cx('empty', s.allDone && 'empty--done')} role={s.allDone ? 'status' : undefined}>
              {s.allDone && <Icon name="check" size={14} strokeWidth={2} className="empty__mark" />}
              <span>{s.emptyText}</span>
              {s.hasClear && (
                <button type="button" className="link-btn" onClick={onClear}>
                  Filtreyi temizle
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function Queue() {
  const e = useEngine();
  const q = queueModel(e);
  const touch = e.isPhone;
  const clear = () => e.setQ({ type: [], band: [] });
  // The chips fold into one disclosure on every width, so the queue starts right under the header.
  // The bar keeps the band counts as quiet text, so that information never disappears.
  const collapse = true;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const active = q.typeFilter.length + q.bandFilter.length;
  const showFilters = q.hasFilter || q.bandChips.some((c) => c.count > 0);
  return (
    <section aria-label="Olay kuyruğu" className="queue">
      {showFilters && collapse && (
        <div className="filters filters--bar">
          <button type="button" className={cx('filter', touch && 'filter--touch', 'filters__toggle')} aria-expanded={filtersOpen} aria-controls="queue-filters" onClick={() => setFiltersOpen(!filtersOpen)}>
            <Icon name={filtersOpen ? 'chevDown' : 'chevRight'} size={10} strokeWidth={1.6} />
            Filtrele{active ? ` (${active})` : ''}
          </button>
          <span className="filters__summary" aria-label="Bantlara göre bekleyen olaylar">
            {q.bandChips.map((c) => (
              <span key={c.value} className="mono">
                {c.label} {c.count}
              </span>
            ))}
          </span>
          {q.hasFilter && (
            <button type="button" className="quiet-link" onClick={clear}>
              Filtreleri temizle
            </button>
          )}
        </div>
      )}
      {showFilters && (!collapse || filtersOpen) && (
      <div id="queue-filters" className="filters">
        <div className="filters__row">
          <span className="label filters__label">Tür</span>
          {q.typeChips.map((f) => (
            <FilterChip key={f.value} f={f} touch={touch} onToggle={() => e.setQ({ type: toggle(q.typeFilter, f.value) })} />
          ))}
        </div>
        <div className="filters__row">
          <span className="label filters__label">Bant</span>
          {q.bandChips.map((f) => (
            <FilterChip key={f.value} f={f} touch={touch} onToggle={() => e.setQ({ band: toggle(q.bandFilter, f.value) })} />
          ))}
          {q.hasFilter && (
            <button type="button" className="quiet-link" onClick={clear}>
              Filtreleri temizle
            </button>
          )}
        </div>
      </div>
      )}
      {q.stress && (
        <div className="stress-banner" role="note">
          <span>Yük testi açık: 40 ek olay eklendi. Demo kontrolleri → Sıfırla bunları kaldırır.</span>
        </div>
      )}
      <div className="queue__scroll">
        {q.sections.map((s) => (
          <QueueSection key={s.key} s={s} onClear={clear} />
        ))}
      </div>
    </section>
  );
}

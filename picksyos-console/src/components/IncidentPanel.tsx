import { useEffect, useRef, useState } from 'react';
import { panelModel, type Fact, type PanelModel } from '../domain/selectors';
import type { Incident } from '../domain/types';
import { useEngine } from '../EngineContext';
import { ActionBar, ActionButton, ResultNotice } from './ActionBar';
import { Button } from './Button';
import { DoneCard, NextIncidentButton } from './DoneCard';
import { FlowSteps } from './FlowSteps';
import { TaskCard } from './TaskCard';
import { Icon } from './Icon';
import { EventList, ParcelRow } from './lists';
import {
  DeadlineBar,
  DeadlineCountdown,
  Freshness,
  IncidentStatusChip,
  OwnerChip,
  PriorityBadge,
  SectionTitle,
  StationStateChip,
  cx,
} from './primitives';

function FactItem({ f }: { f: Fact }) {
  return (
    <div className={cx('fact', f.kind === 'deadline' && 'fact--deadline')}>
      <span className="label">{f.k}</span>
      {f.kind === 'deadline' ? (
        <>
          <DeadlineCountdown value={f.countdown} size="lg" />
          <DeadlineBar bar={f.bar} />
        </>
      ) : (
        <span className={cx('fact__v', f.kind === 'mono' && 'mono', f.kind === 'text' && f.muted && 'muted')}>{f.v}</span>
      )}
    </div>
  );
}

function IncidentHeader({ p, touch }: { p: PanelModel; touch: boolean }) {
  const e = useEngine();
  const head = useRef<HTMLHeadingElement>(null);
  const seq = e.focusHeadSeq;
  useEffect(() => {
    if (seq) head.current?.focus({ preventScroll: true });
  }, [seq]);
  return (
    <div className="inc-head">
      <div className="inc-head__meta">
        <span className="mono muted">{p.id}</span>
        {p.ranked && <PriorityBadge band={p.band} />}
        <IncidentStatusChip status={p.status} />
        {p.owner && <OwnerChip owner={p.owner} />}
        {p.stress && <span className="owner-chip">Yük testi</span>}
        {p.canAck && (
          <Button
            size={touch ? 'touch' : 'sm'}
            state={p.ackBusy ? 'processing' : 'idle'}
            className="inc-head__ack"
            onClick={() => !p.ackBusy && e.act(p.id, 'ack')}
            title="Kısayol: A"
            aria-keyshortcuts="A"
          >
            {p.ackBusy ? 'Üstleniliyor…' : 'Üstlen'}
          </Button>
        )}
      </div>
      <h2 ref={head} tabIndex={-1} className="heading">
        {p.type}
      </h2>
      <FlowSteps steps={p.flow} />
    </div>
  );
}

/** Why it is urgent, beside how long is left: the two things that decide what to do. */
function Assessment({ p }: { p: PanelModel }) {
  if (!p.ranked && !p.facts.length) return null;
  return (
    <div className="assess">
      {p.ranked && (
        <div className="why">
          <span className="label">Neden {p.band}</span>
          <ul>
            {p.why.map((w, i) => (
              <li key={w} className={i === 0 ? 'why__lead' : undefined}>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
      {p.facts.map((f) => (
        <FactItem key={f.k} f={f} />
      ))}
    </div>
  );
}

/** Reference details at the foot of the card; every value carries its own label. */
function Details({ p }: { p: PanelModel }) {
  const d = p.details;
  return (
    <dl className="details">
      <div>
        <dt className="label">İstasyon</dt>
        <dd>
          <a href={d.stationHref} className="mono strong">
            {d.stationId}
          </a>{' '}
          <span className="muted">{d.place}</span>
        </dd>
      </div>
      <div className="details__wide">
        <dt className="label">İstasyon durumu</dt>
        <dd className="details__state">
          <StationStateChip state={d.state} />
          <span className="muted">{d.meaning}</span>
        </dd>
      </div>
      <div>
        <dt className="label">Son sinyal</dt>
        <dd>
          <Freshness value={d.signal} />
        </dd>
      </div>
      <div>
        <dt className="label">Açılış</dt>
        <dd className="mono">{d.opened}</dd>
      </div>
      {d.owner && (
        <div>
          <dt className="label">Sorumlu</dt>
          <dd className={d.owner.muted ? 'muted' : undefined}>{d.owner.v}</dd>
        </div>
      )}
    </dl>
  );
}

function ActionsBlock({ p, phone }: { p: PanelModel; phone: boolean }) {
  return (
    <div className={cx('actions-block', phone ? 'actions-block--phone' : 'actions-block--flat')}>
      {p.rec && !(phone && p.pending) && (
        <div className="rec">
          <span className="label rec__label">Önerilen sonraki adım</span>
          <span className="rec__reason">{p.rec}</span>
        </div>
      )}
      {p.lockedRec && (
        <div className="rec-locked">
          <span className="label">Önerilen sonraki adım</span>
          <span className="rec-locked__title">
            <Icon name="lock" size={14} />
            {p.lockedRec.title}
          </span>
          <span className="rec__reason">{p.lockedRec.reason}</span>
          <ActionButton a={p.lockedRec.action} touch={phone} />
        </div>
      )}
      {phone && p.done?.next && <NextIncidentButton d={p.done} touch wide />}
      {p.lockedRec && p.actions.length > 0 && <span className="label">Bunu yapabilirsiniz</span>}
      {p.note && (
        <div className={`notice notice--${p.note.tone === 'ok' ? 'success' : 'info'}`}>
          <Icon name={p.note.icon} size={14} strokeWidth={1.6} className="notice__icon" />
          <span className="notice__text">{p.note.text}</span>
        </div>
      )}
      <ActionBar actions={p.actions} pending={p.pending} touch={phone} collapsible={phone} shortcutFor={p.recId} />
    </div>
  );
}

export function IncidentPanel({ inc }: { inc: Incident }) {
  const e = useEngine();
  const p = panelModel(e, inc);
  // History and signals are evidence, not the decision: folded by default.
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const phone = e.isPhone;
  return (
    <div className="panel">
      {phone && (
        <Button size="touch" className="back-btn" onClick={() => e.select(null)}>
          <Icon name="chevLeft" size={12} strokeWidth={1.6} />
          Kuyruğa dön
        </Button>
      )}
      {/* Decision zone: everything needed to decide and act, in one card. Evidence follows as quiet sections. */}
      <section className="decision" aria-label="Karar">
      <IncidentHeader p={p} touch={phone} />

      {p.ownerNotice && (
        <div className="notice notice--ownership notice--row">
          <span className="notice__text">{p.ownerNotice.text}</span>
          {p.ownerNotice.canTake && (
            <Button
              size={phone ? 'touch' : 'sm'}
              state={p.ownerNotice.busy ? 'processing' : 'idle'}
              className="btn--surface"
              onClick={() => !p.ownerNotice!.busy && e.act(p.id, 'takeOver')}
            >
              {p.ownerNotice.busy ? 'Devralınıyor…' : 'Devral'}
            </Button>
          )}
        </div>
      )}

      {p.done ? <DoneCard d={p.done} touch={phone} /> : <Assessment p={p} />}


      {p.result && <ResultNotice r={p.result} />}

      {p.task && <TaskCard t={p.task} touch={phone} />}

      {!phone && <ActionsBlock p={p} phone={false} />}

      <Details p={p} />
      </section>

      {p.context && (
        <div className="context">
          <span>Bağlam:</span>
          <span>{p.context.text}</span>
          <a href={p.context.href} className="mono">
            ({p.context.id})
          </a>
        </div>
      )}

      {p.parcels && (
        <div className="block block--list">
          <SectionTitle
            count={p.parcels.showCount ? p.parcels.count : undefined}
            extra={
              <>
                <span className="block__meta">{p.parcels.blockedText}</span>
              </>
            }
          >
            {p.parcels.title}
          </SectionTitle>
          {p.parcels.rows.map((r) => (
            <ParcelRow key={r.id} p={r} />
          ))}
          {p.parcels.hasMore && (
            <button
              type="button"
              className="more-btn"
              onClick={() => e.setUi({ showAll: { ...e.ui.showAll, [p.id]: !p.parcels!.showAll } })}
            >
              {p.parcels.showAll ? 'Daha az göster' : `Tümünü göster (${p.parcels.count})`}
            </button>
          )}
        </div>
      )}

      <div className="block evidence">
        <button
          type="button"
          className="evidence__toggle"
          aria-expanded={evidenceOpen}
          aria-controls={`evidence-${p.id}`}
          onClick={() => setEvidenceOpen(!evidenceOpen)}
        >
          <Icon name={evidenceOpen ? 'chevDown' : 'chevRight'} size={10} strokeWidth={1.6} />
          <span className="label-strong">Geçmiş ve sinyaller</span>
          <span className="mono muted sm">
            {p.signals.length} sinyal · {p.timeline.length} kayıt
          </span>
        </button>
        {evidenceOpen && (
          <div id={`evidence-${p.id}`} className="evidence__body">
            {p.signals.length > 0 && (
              <div className="block--pad">
                <SectionTitle count={p.signals.length}>Gruplanmış sinyaller</SectionTitle>
                <ul className="signals">
                  {p.signals.map((s) => (
                    <li key={s.key}>
                      <span className="mono muted sm">{s.time}</span>
                      <span>{s.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="block--pad">
              <SectionTitle>Zaman çizelgesi</SectionTitle>
              <EventList events={p.timeline} />
            </div>
          </div>
        )}
      </div>

      {phone && (p.actions.length > 0 || p.rec || p.lockedRec || p.note || p.pending || p.done?.next) && <ActionsBlock p={p} phone />}
    </div>
  );
}

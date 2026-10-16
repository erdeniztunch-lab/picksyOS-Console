import { useEffect, useRef } from 'react';
import type { DoneView } from '../domain/selectors';
import { useEngine } from '../EngineContext';
import { Button } from './Button';
import { Icon } from './Icon';
import { PriorityBadge } from './primitives';

/** "Sıradaki olay: P1 INC-102 · İstasyon çevrimdışı ›" — follows the live ranking at render time. */
export function NextIncidentButton({ d, touch, wide }: { d: DoneView; touch: boolean; wide?: boolean }) {
  const e = useEngine();
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Right after a close, focus is on the page or the panel heading: hand it to the next step,
    // so Enter continues the work. Never pulls focus from anywhere else.
    const a = document.activeElement;
    if (d.justClosed && (!a || a === document.body || a.matches('.inc-head .heading'))) ref.current?.focus({ preventScroll: true });
  }, [d.justClosed, d.id]);
  if (!d.next) return null;
  const n = d.next;
  return (
    <Button
      ref={ref}
      variant={touch ? 'primary' : 'ink'}
      size={touch ? 'touch' : 'md'}
      className={wide ? 'done__next done__next--wide' : 'done__next'}
      aria-label={`Sıradaki olay: ${n.band ? n.band + ', ' : ''}${n.id}, ${n.type}`}
      onClick={() => e.select(n.id)}
    >
      <span>Sıradaki olay:</span>
      {n.band && <PriorityBadge band={n.band} />}
      <span className="mono">{n.id}</span>
      <span className="done__next-type">· {n.type}</span>
      <Icon name="chevRight" size={12} strokeWidth={1.8} />
    </Button>
  );
}

/**
 * Shown once an incident is closed: what was done, how long it took, who closed it, and the way
 * to the next piece of work. On phone the next-incident button lives in the bottom sheet instead.
 */
export function DoneCard({ d, touch }: { d: DoneView; touch: boolean }) {
  const e = useEngine();
  return (
    <div className="done" role={d.fresh ? 'status' : undefined}>
      <div className="done__head">
        <span className="done__mark" aria-hidden="true">
          <Icon name="check" size={14} strokeWidth={2} />
        </span>
        <h3 className="done__title">Olay kapandı</h3>
        <span className="mono muted sm">{d.at}</span>
      </div>
      {d.result && <p className="done__result">{d.result}</p>}
      <dl className="done__facts">
        <div>
          <dt className="label">Sonuç</dt>
          <dd>{d.outcome}</dd>
        </div>
        <div>
          <dt className="label">Süre</dt>
          <dd className="mono">{d.duration}</dd>
        </div>
        <div>
          <dt className="label">Kapatan</dt>
          <dd>{d.by}</dd>
        </div>
      </dl>
      <div className="done__row">
        {!d.next ? (
          <span className="done__all">
            <Icon name="check" size={12} strokeWidth={2} />
            Tüm olaylar kapandı · {d.stations} istasyon izleniyor
          </span>
        ) : (
          !touch && <NextIncidentButton d={d} touch={false} />
        )}
        <button type="button" className="link-btn done__reveal" onClick={() => e.revealResolved(d.id)}>
          Kuyrukta göster
        </button>
      </div>
    </div>
  );
}

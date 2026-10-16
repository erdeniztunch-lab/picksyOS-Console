import type { EventView, IncidentLinkView, ParcelRowView } from '../domain/selectors';
import { DeadlineCountdown, IncidentStatusChip, ParcelFlags, PriorityBadge, cx } from './primitives';

/** Timeline / history rows: time · actor · text · outcome. */
export function EventList({ events, wide }: { events: EventView[]; wide?: boolean }) {
  return (
    <ol className="events">
      {events.map((e) => (
        <li key={e.key} className={cx('event', wide && 'event--wide')}>
          <span className="mono muted sm">{e.time}</span>
          <span className="event__actor">{e.actor}</span>
          <span className="event__text">
            <span>{e.text}</span>
            {e.outcome && <span className={cx('outcome', e.bad ? 'outcome--bad' : e.sim ? 'outcome--sim' : 'outcome--ok')}>{e.outcome}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ParcelRow({ p }: { p: ParcelRowView }) {
  return (
    <a href={p.href} className="parcel-row">
      <span className="parcel-row__id">
        <span className="mono strong">{p.id}</span>
        <span className="muted">{p.comp}</span>
      </span>
      <span className="mono muted xs">Bekletme sonu {p.hold}</span>
      <span className="parcel-row__flags">
        <ParcelFlags flags={p.flags} />
      </span>
    </a>
  );
}

export function IncidentLink({ i, withDeadline }: { i: IncidentLinkView; withDeadline?: boolean }) {
  return (
    <a href={i.href} className={cx('inc-link', withDeadline && 'inc-link--deadline')}>
      {i.ranked ? <PriorityBadge band={i.band} /> : <span className="band-spacer" />}
      <span className="inc-link__main">
        <span className="strong">{i.type}</span>
        <span className="mono muted xs">{i.id}</span>
        <IncidentStatusChip status={i.status} size="sm" />
      </span>
      {withDeadline && <DeadlineCountdown value={i.deadline} />}
    </a>
  );
}

import type { ReactNode } from 'react';
import type { DeadlineBarView, FreshnessView } from '../domain/selectors';
import type { Band, CountdownView, IncidentStatus, ParcelLabel as ParcelLabelId, StationState } from '../domain/types';
import { Icon, type IconName } from './Icon';

export type Tone = 'ok' | 'warn' | 'err' | 'errLine' | 'info' | 'unk' | 'neutral' | 'quiet' | 'owner' | 'tag';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

interface ChipProps {
  tone: Tone;
  icon: IconName;
  children: ReactNode;
  /** Square corners (labels) instead of pill (states). */
  square?: boolean;
  small?: boolean;
}

export function Chip({ tone, icon, children, square, small }: ChipProps) {
  return (
    <span className={cx('chip', `chip--${tone}`, square && 'chip--square', small && 'chip--sm')}>
      <Icon name={icon} size={small ? 10 : 11} />
      {children}
    </span>
  );
}

export function ConceptLabel({ kind, text, small }: { kind: 'illustrative' | 'proposed' | 'demoControl'; text?: string; small?: boolean }) {
  const def = { illustrative: 'Temsilî', proposed: 'Önerilen', demoControl: 'Demo kontrolü' }[kind];
  return <span className={cx('concept', `concept--${kind}`, small && 'concept--sm')}>{text ?? def}</span>;
}

export function DisclaimerBar() {
  return (
    <footer role="note" className="disclaimer">
      Bağımsız bir konsept çalışmasıdır. Delivery One ile bağlantılı değildir ve onayını taşımaz. Veriler temsilîdir.
    </footer>
  );
}

/** Priority is weight, not hue: P1 solid, P2 outlined, P3 hairline. */
export function PriorityBadge({ band }: { band: Band }) {
  return <span className={`band band--${band}`}>{band}</span>;
}

const STATUS: Record<IncidentStatus, [Tone, IconName, string]> = {
  open: ['neutral', 'ring', 'Açık'],
  acknowledged: ['info', 'ack', 'Üstlenildi'],
  inProgress: ['info', 'spin', 'İşlem sürüyor'],
  awaitingField: ['info', 'clock', 'Saha ekibi bekleniyor'],
  recovered: ['ok', 'recover', 'Düzeldi'],
  resolved: ['ok', 'check', 'Kapandı'],
};

export function IncidentStatusChip({ status, size = 'md' }: { status: IncidentStatus; size?: 'md' | 'sm' }) {
  const [tone, icon, full] = STATUS[status];
  // Queue rows read "In progress" (product brief, loading and processing).
  const label = size === 'sm' && status === 'inProgress' ? 'İşlemde' : full;
  return (
    <Chip tone={tone} icon={icon} small={size === 'sm'}>
      {label}
    </Chip>
  );
}

const STATION: Record<StationState, [Tone, IconName, string]> = {
  online: ['ok', 'dot', 'Çevrimiçi'],
  degraded: ['warn', 'tri', 'Kısmi arıza'],
  signalDelayed: ['unk', 'clock', 'Sinyal gecikiyor'],
  offline: ['err', 'x', 'Çevrimdışı'],
  outOfService: ['errLine', 'slash', 'Hizmet dışı'],
};

export function StationStateChip({ state }: { state: StationState }) {
  const [tone, icon, label] = STATION[state];
  return (
    <Chip tone={tone} icon={icon}>
      {label}
    </Chip>
  );
}

const PARCEL: Record<ParcelLabelId, [Tone, IconName, string]> = {
  ready: ['ok', 'dot', 'Teslim almaya hazır'],
  readyUnknown: ['unk', 'clock', 'Hazır · erişim bilinmiyor'],
  blockedOffline: ['err', 'lock', 'Engelli: istasyon çevrimdışı'],
  blockedOutOfService: ['err', 'lock', 'Engelli: hizmet dışı'],
  blockedRetrieval: ['err', 'lock', 'Engelli: teslim arızası'],
  codeNotDelivered: ['warn', 'tri', 'Kod iletilmedi'],
  holdExpired: ['warn', 'clock', 'Bekletme süresi doldu'],
  pickedUp: ['quiet', 'check', 'Teslim alındı'],
  markedForReturn: ['quiet', 'ret', 'İadeye ayrıldı'],
};

export function ParcelLabel({ label }: { label: ParcelLabelId }) {
  const [tone, icon, text] = PARCEL[label];
  return (
    <Chip tone={tone} icon={icon} square>
      {text}
    </Chip>
  );
}

export function ParcelFlags({ flags }: { flags: { label: ParcelLabelId }[] }) {
  return (
    <span className="flags">
      {flags.map((f) => (
        <ParcelLabel key={f.label} label={f.label} />
      ))}
    </span>
  );
}

export function OwnerChip({ owner, small }: { owner: string; small?: boolean }) {
  return (
    <span className={cx('owner-chip', small && 'owner-chip--sm')}>
      <span className="sr-only">Sorumlu: </span>
      {owner}
    </span>
  );
}

/** Normal / soon (≤30 min, warn + clock) / breached (err tint + triangle). */
export function DeadlineCountdown({ value, size = 'md' }: { value: CountdownView | { resolvedAt: string }; size?: 'md' | 'lg' }) {
  if ('resolvedAt' in value) return <span className={cx('deadline', 'deadline--resolved', size === 'lg' && 'deadline--lg')}>{value.resolvedAt}</span>;
  return (
    <span className={cx('deadline', `deadline--${value.tone}`, size === 'lg' && 'deadline--lg')}>
      {value.tone === 'breached' && <Icon name="tri" size={11} strokeWidth={1.6} />}
      {value.tone === 'soon' && <Icon name="clock" size={11} strokeWidth={1.6} />}
      {value.tone === 'breached' && <span className="deadline__word">Aşıldı</span>}
      {value.text}
    </span>
  );
}

/** Panel-only: contract (or internal) time used vs. left, with its source and a spoken equivalent. */
export function DeadlineBar({ bar }: { bar: DeadlineBarView }) {
  return (
    <div className={cx('dbar', `dbar--${bar.tone}`)}>
      <div className="dbar__track" role="img" aria-label={bar.label}>
        <span className="dbar__fill" style={{ width: `${Math.round(bar.used * 1000) / 10}%` }} />
      </div>
      <span className="dbar__source">{bar.source}</span>
    </div>
  );
}

export function Freshness({ value }: { value: FreshnessView }) {
  return (
    <span className={`fresh fresh--${value.kind}`}>
      {value.kind === 'delayed' && <Icon name="clock" />}
      {value.text}
    </span>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Konum" className="crumbs">
      {items.map((c, i) => (
        <span key={i} className="crumbs__item">
          {i > 0 && <span className="crumbs__sep" aria-hidden="true">›</span>}
          {c.href ? (
            <a href={c.href}>{c.label}</a>
          ) : (
            <span aria-current="page" className="crumbs__current">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function SectionTitle({ children, count, extra }: { children: ReactNode; count?: number | string; extra?: ReactNode }) {
  return (
    <div className="block__head">
      <span className="label-strong">{children}</span>
      {count !== undefined && <span className="mono muted sm">{count}</span>}
      {extra}
    </div>
  );
}

export { cx };

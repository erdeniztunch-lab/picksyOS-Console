import { ACTIONS, PARCEL_ACTIONS, TASK_STAGE, TYPES } from './constants';
import type { ConsoleEngine } from './engine';
import { MIN, durShort, durTxt, hm, spokenDuration } from './format';
import type {
  ActionView,
  Band,
  CountdownView,
  Derived,
  Incident,
  IncidentStatus,
  IncidentType,
  LogEvent,
  Parcel,
  ParcelFlag,
  Result,
  SectionKey,
  StationState,
  TargetKey,
  ActionId,
  TaskStage,
} from './types';

const BAND_INDEX: Record<Band, number> = { P1: 0, P2: 1, P3: 2 };
const STATUS_WORD: Record<IncidentStatus, string> = {
  open: 'Açık',
  acknowledged: 'Üstlenildi',
  inProgress: 'İşlem sürüyor',
  awaitingField: 'Saha ekibi bekleniyor',
  recovered: 'Düzeldi',
  resolved: 'Kapandı',
};

// ---------- queue ----------

interface Partitioned {
  D: Record<string, Derived>;
  need: Incident[];
  inHand: Incident[];
  recovered: Incident[];
  resolved: Incident[];
  counts: Record<Band, number>;
}

export function partition(e: ConsoleEngine): Partitioned {
  return e.memo('partition', () => partitionNow(e));
}

function partitionNow(e: ConsoleEngine): Partitioned {
  const D: Record<string, Derived> = {};
  const all = e.incidents();
  all.forEach((i) => (D[i.id] = e.derive(i)));
  const need = all
    .filter((i) => i.status === 'open' || i.status === 'acknowledged')
    .sort((a, b) => {
      const x = D[a.id];
      const y = D[b.id];
      const p1 =
        x.band === 'P1'
          ? (y.waiting ? 1 : 0) - (x.waiting ? 1 : 0) || (x.waiting && y.waiting ? a.openedAt - b.openedAt : 0)
          : 0;
      return (
        BAND_INDEX[x.band] - BAND_INDEX[y.band] ||
        p1 ||
        x.leftMin - y.leftMin ||
        y.blocked - x.blocked ||
        a.openedAt - b.openedAt
      );
    });
  const byDeadline = (a: Incident, b: Incident) => a.deadlineAt - b.deadlineAt;
  const inHand = all.filter((i) => i.status === 'inProgress' || i.status === 'awaitingField').sort(byDeadline);
  const recovered = all.filter((i) => i.status === 'recovered').sort(byDeadline);
  const resolved = all.filter((i) => i.status === 'resolved').sort((a, b) => (b.resolvedAt ?? 0) - (a.resolvedAt ?? 0));
  const counts: Record<Band, number> = { P1: 0, P2: 0, P3: 0 };
  need.forEach((i) => counts[D[i.id].band]++);
  return { D, need, inHand, recovered, resolved, counts };
}

/** Section + band per incident, used to flash rows that move. */
export function queuePositions(e: ConsoleEngine): Record<string, string> {
  const { D, need, inHand, recovered, resolved } = partition(e);
  const pos: Record<string, string> = {};
  need.forEach((i) => (pos[i.id] = 'need' + D[i.id].band));
  inHand.forEach((i) => (pos[i.id] = 'hand'));
  recovered.forEach((i) => (pos[i.id] = 'rec'));
  resolved.forEach((i) => (pos[i.id] = 'res'));
  return pos;
}

export function headerSummary(e: ConsoleEngine) {
  const { counts } = partition(e);
  const states = Object.values(e.db.stations).map((s) => ({ id: s.id, ss: e.stState(s) }));
  const delayed = states.filter((s) => s.ss === 'signalDelayed');
  return {
    p1: counts.P1,
    p2: counts.P2,
    p3: counts.P3,
    offline: states.filter((s) => s.ss === 'offline').length,
    delayed: delayed.length,
    firstDelayed: delayed[0]?.id ?? null,
    clock: hm(e.now()),
  };
}

export type RowChip =
  | { kind: 'status'; status: IncidentStatus }
  | { kind: 'owner'; owner: string }
  | { kind: 'delayed' };

export interface RowView {
  id: string;
  ranked: boolean;
  band: Band;
  status: IncidentStatus;
  type: string;
  station: string;
  city: string;
  /** Ranked rows: the deciding reason, shown first in medium weight. */
  whyLead: string;
  why: string;
  deadline: CountdownView | { resolvedAt: string };
  chips: RowChip[];
  selected: boolean;
  moved: boolean;
  /** Short structured accessible name: "P1, Retrieval failure, WAL-01, deadline in 1 hour 56 minutes". */
  spokenName: string;
}

export interface SectionView {
  key: SectionKey;
  title: string;
  count: number;
  open: boolean;
  note: string;
  rows: RowView[];
  loading: boolean;
  isEmpty: boolean;
  emptyText: string;
  /** Nothing open anywhere: the empty text is the end of the work, shown with a check. */
  allDone: boolean;
  hasClear: boolean;
}

export interface FilterChipView<T> {
  value: T;
  label: string;
  count: number;
  pressed: boolean;
}

export function queueModel(e: ConsoleEngine) {
  return e.memo('queue', () => queueModelNow(e));
}

function queueModelNow(e: ConsoleEngine) {
  const { D, need, inHand, recovered, resolved, counts } = partition(e);
  const R = e.route;
  const ui = e.ui;
  const tf: IncidentType[] = R.view === 'queue' ? R.type : [];
  const bf: Band[] = R.view === 'queue' ? R.band : [];
  const tOk = (i: Incident) => !tf.length || tf.includes(i.type);
  const bOk = (i: Incident) => !bf.length || bf.includes(D[i.id].band);
  const selId = R.view === 'queue' ? R.incident : null;
  const states = Object.values(e.db.stations).map((s) => e.stState(s));
  const fresh = states.filter((ss) => ss === 'online' || ss === 'degraded' || ss === 'outOfService').length;
  const delayed = states.filter((ss) => ss === 'signalDelayed').length;
  const offline = states.filter((ss) => ss === 'offline').length;
  const networkLine = [
    `${fresh} istasyon güncel`,
    delayed ? `${delayed} sinyal gecikiyor` : '',
    offline ? `${offline} çevrimdışı` : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const rowVM = (inc: Incident, ranked: boolean, sec: SectionKey): RowView => {
    const d = D[inc.id];
    let why: string;
    let whyLead = '';
    if (ranked) {
      whyLead = d.lead;
      why = d.why
        .slice(1)
        .filter((w) => w !== d.deadlineWhy)
        .join(' · ');
    }
    else if (inc.status === 'inProgress') why = ACTIONS[inc.running!].ing;
    else if (inc.status === 'awaitingField') {
      const t = inc.task!;
      why = `${t.id} · ${TASK_STAGE[t.status]} · son süre ${hm(t.due)}`;
    } else if (inc.status === 'recovered') why = `Sorun ${hm(inc.recoveredAt!)} itibarıyla düzeldi · Kapatmayı onayla`;
    else why = `Sonuç: ${inc.outcome} · ${inc.resolvedBy}`;
    const chips: RowChip[] = [];
    if (inc.status !== 'open' && sec !== 'resolved') chips.push({ kind: 'status', status: inc.status });
    if (inc.owner && inc.owner !== 'Siz' && inc.status !== 'resolved') chips.push({ kind: 'owner', owner: inc.owner });
    if (d.ss === 'signalDelayed') chips.push({ kind: 'delayed' });
    return {
      id: inc.id,
      ranked,
      band: d.band,
      status: inc.status,
      type: TYPES[inc.type],
      station: inc.stationId,
      city: d.st.city,
      whyLead,
      why,
      deadline: inc.status === 'resolved' ? { resolvedAt: hm(inc.resolvedAt!) } : e.countdown(inc),
      chips,
      selected: selId === inc.id,
      moved: e.isMoved(inc.id),
      spokenName: [
        ranked ? d.band : STATUS_WORD[inc.status],
        TYPES[inc.type],
        inc.stationId,
        inc.status === 'resolved' ? `${hm(inc.resolvedAt!)} itibarıyla kapandı` : e.countdown(inc).spoken,
      ].join(', '),
    };
  };

  const needF = need.filter((i) => tOk(i) && bOk(i));
  const filtered = !!(tf.length || bf.length);
  const filterLabel = bf.length ? bf.join(', ') : tf.map((t) => TYPES[t]).join(', ');
  const allClosed = !need.length && !inHand.length && !recovered.length;
  const emptyNeed = allClosed
    ? `Tüm olaylar kapandı · ${Object.keys(e.db.stations).length} istasyon izleniyor`
    : filtered
    ? tf.length && bf.length
      ? 'Eşleşen olay yok.'
      : `${filterLabel} olay yok.`
    : `Müdahale bekleyen olay yok. ${networkLine}.`;

  const mk = (key: SectionKey, title: string, list: Incident[], note: string, showEmpty: boolean, emptyText: string): SectionView => {
    const rows = list.map((i) => rowVM(i, key === 'need', key));
    return {
      key,
      title,
      count: list.length,
      open: !ui.collapsed[key],
      note,
      rows: ui.loading ? [] : rows,
      loading: ui.loading,
      isEmpty: !ui.loading && !rows.length && showEmpty,
      emptyText,
      allDone: key === 'need' && allClosed,
      hasClear: key === 'need' && filtered && !allClosed,
    };
  };

  const sections: SectionView[] = [
    mk('need', 'Müdahale bekliyor', needF, '', true, emptyNeed),
    mk('inHand', 'İşlemde', inHand.filter(tOk), '', true, 'İşlemde olay yok.'),
  ];
  const rf = recovered.filter(tOk);
  if (rf.length) sections.push(mk('recovered', 'Kendiliğinden düzeldi: kapatmayı onayla', rf, '', false, ''));
  sections.push(mk('resolved', 'Bugün kapananlar', resolved.filter(tOk), '', true, 'Henüz yok.'));

  const visIds: string[] = [];
  sections.forEach((s) => s.open && s.rows.forEach((r) => visIds.push(r.id)));

  const typeChips: FilterChipView<IncidentType>[] = (Object.keys(TYPES) as IncidentType[]).map((t) => ({
    value: t,
    label: TYPES[t],
    count: need.filter((i) => i.type === t).length,
    pressed: tf.includes(t),
  }));
  const bandChips: FilterChipView<Band>[] = (['P1', 'P2', 'P3'] as Band[]).map((b) => ({
    value: b,
    label: b,
    count: counts[b],
    pressed: bf.includes(b),
  }));

  return { sections, visIds, typeChips, bandChips, typeFilter: tf, bandFilter: bf, hasFilter: filtered, stress: e.db.stress };
}

// ---------- shared view pieces ----------

export interface EventView {
  key: number;
  time: string;
  actor: string;
  text: string;
  outcome: string | null;
  bad: boolean;
  /** A simulated step (field service): neutral tag. */
  sim: boolean;
}

export function eventsView(e: ConsoleEngine, pick: (ev: LogEvent) => boolean, withDay = false, limit = Infinity): EventView[] {
  return e.db.events
    .filter(pick)
    .sort((a, b) => b.t - a.t || b.seq - a.seq)
    .slice(0, limit)
    .map((ev) => ({
      key: ev.seq,
      time: withDay ? e.dt(ev.t).replace('Bugün ', '') : hm(ev.t),
      actor: ev.actor,
      text: ev.text,
      outcome: ev.outcome ?? null,
      bad: ev.outcome === 'Başarısız' || ev.outcome === 'İletilmedi',
      sim: ev.outcome === 'Simüle',
    }));
}

export interface FreshnessView {
  kind: 'fresh' | 'delayed' | 'offline';
  text: string;
}

export function freshness(e: ConsoleEngine, ss: StationState, lastSeen: number): FreshnessView {
  const ago = Math.round((e.now() - lastSeen) / MIN);
  if (ss === 'signalDelayed') return { kind: 'delayed', text: `son veri ${hm(lastSeen)} (${ago} dk önce)` };
  if (ss === 'offline') return { kind: 'offline', text: `Son sinyal ${hm(lastSeen)} (${durShort(ago)} önce)` };
  return { kind: 'fresh', text: `Son sinyal ${hm(lastSeen)} (güncel)` };
}

export interface ParcelRowView {
  id: string;
  comp: string;
  hold: string;
  flags: ParcelFlag[];
  href: string;
}

export function parcelRow(e: ConsoleEngine, p: Parcel, from: string | null): ParcelRowView {
  return { id: p.id, comp: p.comp, hold: e.dt(p.hold), flags: e.parcelFlags(p), href: `#/parcels/${p.id}${from ? '?from=' + from : ''}` };
}

export interface IncidentLinkView {
  id: string;
  type: string;
  ranked: boolean;
  band: Band;
  status: IncidentStatus;
  deadline: CountdownView | { resolvedAt: string };
  href: string;
}

export function incidentLink(e: ConsoleEngine, inc: Incident): IncidentLinkView {
  return {
    id: inc.id,
    type: TYPES[inc.type],
    ranked: inc.status === 'open' || inc.status === 'acknowledged',
    band: e.derive(inc).band,
    status: inc.status,
    deadline: inc.status === 'resolved' ? { resolvedAt: hm(inc.resolvedAt!) } : e.countdown(inc),
    href: '#/queue?incident=' + inc.id,
  };
}

export interface ResultView extends Result {
  key: TargetKey;
  /** 'button' after a submit failure (Retry is the way forward); 'link' after an action failure. */
  retryStyle: 'button' | 'link' | null;
  /** Success that moved the incident to Resolved today: offer to show it there. */
  reveal: boolean;
}

export function resultView(target: { result: Result | null }, key: TargetKey, resolved = false): ResultView | null {
  const r = target.result;
  if (!r) return null;
  const retryStyle = !r.retry ? null : r.kind === 'submitFailed' ? 'button' : r.kind === 'failure' ? 'link' : null;
  return { ...r, key, retryStyle, reveal: r.kind === 'success' && resolved };
}

export type PendingView =
  | { mode: 'owner'; key: TargetKey; text: string }
  | {
      mode: 'confirm';
      key: TargetKey;
      aid: ActionId;
      title: string;
      text: string;
      /** What will be sent, line by line (field visit request). */
      summary: { k: string; v: string; tone?: 'err' }[];
      needsNote: boolean;
      /** Optional note field (field visit request). */
      optionalNote: boolean;
      noteLabel: string;
      noteHint: string;
      confirmLabel: string;
      note: string;
      disabled: boolean;
    };

export function pendingView(e: ConsoleEngine, keys: TargetKey[]): PendingView | null {
  const pd = e.ui.pending;
  if (!pd || !keys.includes(pd.key)) return null;
  if (pd.mode === 'owner') {
    const inc = e.db.incidents[pd.key];
    const text = inc?.owner ? `Bu olay ${hm(inc.ownerSince ?? inc.openedAt)} itibarıyla ${inc.owner} üzerinde. Devralırsanız kayda geçer.` : '';
    return { mode: 'owner', key: pd.key, text };
  }
  const def = ACTIONS[pd.aid];
  const needsNote = !!def.note;
  const inc: Incident | undefined = e.db.incidents[pd.key];
  const request = pd.aid === 'requestField' && !!inc;
  const cancel = pd.aid === 'cancelField';
  return {
    mode: 'confirm',
    key: pd.key,
    aid: pd.aid,
    title: def.label,
    text: e.confirmText(pd.key, pd.aid),
    summary: request ? requestSummary(e, inc!) : [],
    needsNote,
    optionalNote: request,
    noteLabel: cancel ? 'İptal nedeni (zorunlu)' : request ? 'Saha ekibine not (isteğe bağlı)' : 'Not (zorunlu)',
    noteHint: cancel ? 'İptal için bir neden yazın.' : 'Onaylamak için not ekleyin.',
    confirmLabel: request ? 'Talebi gönder' : 'Onayla',
    note: e.ui.note,
    disabled: needsNote && !e.ui.note.trim(),
  };
}

/** The field visit request, built only from what the model already knows. */
function requestSummary(e: ConsoleEngine, inc: Incident): { k: string; v: string; tone?: 'err' }[] {
  const d = e.derive(inc);
  const st = d.st;
  const failed = e.db.events.filter((ev) => ev.inc === inc.id && ev.outcome === 'Başarısız').sort((a, b) => b.t - a.t)[0];
  const base = inc.type === 'offline' ? `${hm(e.lastSeen(st))} itibarıyla çevrimdışı` : `Paket kapağa ulaşmadı · ${hm(inc.openedAt)}`;
  const impact = [`${d.blocked} paket engelli`];
  if (d.noPickups) impact.push('teslim alma yapılamıyor');
  if (d.waiting) impact.push('alıcı istasyonda bekliyor');
  const breached = inc.deadlineAt < e.now();
  return [
    { k: 'İstasyon', v: `${st.id} · ${st.model} · ${st.city} · ${st.customer}` },
    { k: 'Sorun', v: failed ? `${base} · ${failed.text} (${hm(failed.t)})` : base },
    { k: 'Etki', v: impact.join(' · ') },
    { k: 'Son süre', v: `${hm(inc.deadlineAt)} · ${e.srcText(inc)}`, tone: breached ? 'err' : undefined },
  ];
}

// ---------- incident panel ----------

/** Contract (or internal) time used vs. left, for the panel's deadline bar. */
export interface DeadlineBarView {
  /** 0–1 share of the target already used; 1 once breached. */
  used: number;
  tone: CountdownView['tone'];
  /** Text equivalent for screen readers. */
  label: string;
  source: string;
  sourceTag: 'illustrative' | 'proposed';
}

export function deadlineBar(e: ConsoleEngine, inc: Incident): DeadlineBarView {
  const total = inc.targetH * 60;
  const now = e.now();
  const leftMin = (inc.deadlineAt - now) / MIN;
  const tone = e.countdown(inc).tone;
  const used = Math.min(1, Math.max(0, (now - inc.openedAt) / MIN / total));
  const label =
    leftMin < 0
      ? `Son süre ${spokenDuration(Math.floor(-leftMin))} aşıldı`
      : `${spokenDuration(total)} hedefin ${spokenDuration(Math.ceil(leftMin))} kaldı`;
  const contract = inc.source === 'contract';
  return {
    used: leftMin < 0 ? 1 : used,
    tone,
    label,
    source: contract ? `Sözleşme hedefi ${inc.targetH} sa` : `İç hedef ${inc.targetH} sa`,
    sourceTag: contract ? 'illustrative' : 'proposed',
  };
}

export type Fact =
  | { kind: 'deadline'; k: string; countdown: CountdownView; bar: DeadlineBarView }
  | { kind: 'mono' | 'text'; k: string; v: string; muted?: boolean };

export interface PanelNote {
  tone: 'info' | 'ok';
  icon: 'clock' | 'recover' | 'check';
  text: string;
}

export function panelModel(e: ConsoleEngine, inc: Incident) {
  const d = e.derive(inc);
  const st = d.st;
  const ranked = inc.status === 'open' || inc.status === 'acknowledged';
  const p0: Parcel | undefined = e.db.parcels[inc.parcelIds[0]];
  const plist = inc.type === 'offline' ? e.db.byStation[st.id].map((x) => e.db.parcels[x]).filter((p) => p.status === 'ready') : p0 ? [p0] : [];
  const showAll = !!e.ui.showAll[inc.id];

  // The deadline is the one fact beside the reasons; closed incidents show the done card instead.
  const facts: Fact[] = [];
  if (inc.status !== 'resolved' && inc.status !== 'awaitingField') {
    facts.push({
      kind: 'deadline',
      k: `Son süre ${hm(inc.deadlineAt)}`,
      countdown: e.countdown(inc),
      bar: deadlineBar(e, inc),
    });
  }
  // Reference details, each with its own label so a value never stands alone.
  const ls = e.lastSeen(st);
  const ago = Math.round((e.now() - ls) / MIN);
  const details = {
    stationId: st.id,
    stationHref: `#/stations/${st.id}?from=${inc.id}`,
    place: st.city,
    state: d.ss,
    meaning: STATION_MEANING[d.ss],
    signal: {
      kind: freshness(e, d.ss, ls).kind,
      text: d.ss === 'signalDelayed' || d.ss === 'offline' ? `${hm(ls)} · ${durShort(ago)} önce` : `${hm(ls)} · güncel`,
    } as FreshnessView,
    opened: hm(inc.openedAt),
    owner: inc.status === 'resolved' ? null : { v: inc.owner || 'Yok', muted: !inc.owner },
  };

  let note: PanelNote | null = null;
  if (inc.status === 'recovered') note = { tone: 'ok', icon: 'recover', text: `Sorun ${hm(inc.recoveredAt!)} itibarıyla düzeldi. Kapatmayı onaylayın.` };

  const ctx = inc.type !== 'offline' ? e.incidents().find((i) => i.type === 'offline' && i.stationId === inc.stationId && i.status !== 'resolved') : undefined;
  const ownedByOther = !!inc.owner && inc.owner !== 'Siz';
  const pd = e.ui.pending;
  const r = e.rec(inc);

  // When the recommended action is locked for this role, show it as a locked card and
  // promote the first available action to primary. Presentation only: the allowed set is unchanged.
  let actions = e.actionsFor(inc).map((a) => e.actionView(inc.id, a, inc));
  const recView = r ? actions.find((a) => a.aid === r.id) : undefined;
  let lockedRec: { title: string; reason: string; action: ActionView } | null = null;
  if (r && recView?.locked) {
    lockedRec = { title: `${ACTIONS[r.id].label} · süpervizör gerekir`, reason: r.reason, action: recView };
    actions = actions.filter((a) => a !== recView);
    const firstOk = actions.find((a) => !a.disabled);
    actions = actions.map((a) => (a === firstOk ? { ...a, primary: true } : a));
  }

  // Closed: the done card says what happened and points to the next incident in the live ranking.
  let done: DoneView | null = null;
  if (inc.status === 'resolved') {
    const { need, inHand, recovered } = partition(e);
    const n = [...need, ...inHand, ...recovered].find((i) => i.id !== inc.id);
    const nr = n && (n.status === 'open' || n.status === 'acknowledged');
    done = {
      id: inc.id,
      at: hm(inc.resolvedAt!),
      outcome: inc.outcome ?? '',
      by: inc.resolvedBy ?? '',
      duration: durTxt(Math.max(1, Math.round((inc.resolvedAt! - inc.openedAt) / MIN))),
      result: inc.result && (inc.result.kind === 'success' || inc.result.kind === 'info') ? inc.result.text.replace(/\s*Olay kapandı\.?$/, '') || null : null,
      fresh: !!inc.result && (inc.result.kind === 'success' || inc.result.kind === 'info'),
      justClosed: e.now() - inc.resolvedAt! < 5000,
      next: n ? { id: n.id, type: TYPES[n.type], band: nr ? e.derive(n).band : null } : null,
      stations: Object.keys(e.db.stations).length,
    };
  }

  // The deadline already has its own fact, so the reasons leave it out (as in the queue row).
  const why = d.why.filter((w) => w !== d.deadlineWhy);

  return {
    id: inc.id,
    type: TYPES[inc.type],
    ranked,
    band: d.band,
    why: why.length ? why : d.why,
    flow: flowSteps(inc),
    details,
    done,
    status: inc.status,
    owner: ownedByOther ? inc.owner : null,
    stress: inc.stress,
    canAck: inc.status === 'open',
    ackBusy: e.busy?.key === inc.id && e.busy.aid === 'ack',
    facts,
    ownerNotice:
      ownedByOther && !done && !(pd && pd.key === inc.id && pd.mode === 'owner')
        ? {
            text: inc.ownerNote || `Bu olay ${hm(inc.ownerSince ?? inc.openedAt)} itibarıyla ${inc.owner} üzerinde.`,
            // Take over: Acknowledged, In hand or Recovered (actions catalog).
            canTake: ['acknowledged', 'inProgress', 'awaitingField', 'recovered'].includes(inc.status),
            busy: e.busy?.key === inc.id && e.busy.aid === 'takeOver',
          }
        : null,
    result: done ? null : resultView(inc, inc.id),
    rec: r && !lockedRec ? r.reason : null,
    recId: r && !lockedRec ? r.id : null,
    lockedRec,
    note,
    actions: (done ? actions.map((a) => ({ ...a, primary: false })) : actions).filter((a) => a.aid !== 'cancelField'),
    pending: pd?.aid === 'cancelField' ? null : pendingView(e, [inc.id]),
    task: taskView(e, inc, actions.filter((a) => a.aid === 'cancelField')),
    context: ctx ? { text: 'İstasyon da çevrimdışı', id: ctx.id, href: '#/queue?incident=' + ctx.id } : null,
    parcels: plist.length
      ? {
          title: plist.length === 1 ? 'Etkilenen paket' : 'Etkilenen paketler',
          count: plist.length,
          showCount: plist.length > 1,
          blockedText: `· ${d.blocked} engelli`,
          rows: plist.slice(0, showAll ? Infinity : 5).map((p) => parcelRow(e, p, inc.id)),
          hasMore: plist.length > 5,
          showAll,
        }
      : null,
    signals: inc.signals.map((s, i) => ({ key: i, time: hm(s.t), text: s.text })),
    timeline: eventsView(e, (ev) => ev.inc === inc.id),
  };
}

export type PanelModel = ReturnType<typeof panelModel>;

export interface TaskView {
  id: string;
  stage: TaskStage;
  stageLabel: string;
  stages: FlowStep[];
  deadline: Extract<Fact, { kind: 'deadline' }>;
  requested: string;
  note: string;
  /** The station came back on its own while the visit is still open. */
  recovered: boolean;
  actions: ActionView[];
  pending: PendingView | null;
}

const TASK_ORDER: TaskStage[] = ['requested', 'accepted', 'onSite', 'completed'];

/** The open field task, as a work item: stage, due time, who asked, and the way to cancel it. */
export function taskView(e: ConsoleEngine, inc: Incident, actions: ActionView[]): TaskView | null {
  const t = inc.task;
  if (!t || (inc.status !== 'awaitingField' && inc.status !== 'recovered')) return null;
  const at: Record<TaskStage, number | null> = { requested: t.requestedAt, accepted: t.acceptedAt, onSite: t.onSiteAt, completed: t.completedAt, cancelled: null };
  const reached = TASK_ORDER.indexOf(t.status);
  const stages: FlowStep[] = TASK_ORDER.map((s, i) => ({
    key: s,
    label: TASK_STAGE[s],
    state: i <= reached ? 'done' : i === reached + 1 ? 'current' : 'todo',
    sub: i <= reached && at[s] != null ? hm(at[s]!) : i === reached + 1 ? 'bekleniyor' : '',
  }));
  const pd = e.ui.pending;
  return {
    id: t.id,
    stage: t.status,
    stageLabel: TASK_STAGE[t.status],
    stages,
    deadline: { kind: 'deadline', k: `Son süre ${hm(t.due)}`, countdown: e.countdown(inc), bar: deadlineBar(e, inc) },
    requested: `${t.by} · ${hm(t.requestedAt)}`,
    note: t.note,
    recovered: inc.status === 'recovered',
    actions,
    pending: pd?.aid === 'cancelField' ? pendingView(e, [inc.id]) : null,
  };
}

export interface DoneView {
  id: string;
  at: string;
  outcome: string;
  by: string;
  duration: string;
  /** The action's own result line, when this session closed it. */
  result: string | null;
  /** Closed in this session (not a seeded, read-only one). */
  fresh: boolean;
  /** Closed in the last few seconds: the moment to hand focus to the next incident. */
  justClosed: boolean;
  next: { id: string; type: string; band: Band | null } | null;
  stations: number;
}

const STATION_MEANING: Record<StationState, string> = {
  online: 'Tam kullanılabilir',
  degraded: 'Kısmen kullanılabilir · açık bir teslim arızası var',
  signalDelayed: 'Durum bilinmiyor · veri gecikiyor',
  offline: 'Kullanılamıyor · teslim alma yapılamıyor',
  outOfService: 'Kullanılamıyor · hizmet dışı',
};

// ---------- flow steps ----------

export type FlowState = 'done' | 'current' | 'running' | 'todo' | 'skip';
export interface FlowStep {
  key: string;
  label: string;
  state: FlowState;
  sub: string;
  /** The sub line reports a failure (error tone, not the accent). */
  failed?: boolean;
}

/** Tespit → Sahiplen → Aksiyon → Sonuç → Kapandı, read from the incident status. Presentation only. */
export function flowSteps(inc: Incident): FlowStep[] {
  const s = inc.status;
  const failed = s === 'acknowledged' && inc.result?.kind === 'failure';
  const self = !inc.owner;
  const own: FlowState = s === 'open' ? 'current' : s === 'recovered' && self ? 'skip' : 'done';
  const act: FlowState =
    s === 'open' ? 'todo' : s === 'acknowledged' ? 'current' : s === 'inProgress' ? 'running' : s === 'recovered' ? 'skip' : 'done';
  const res: FlowState = s === 'awaitingField' ? 'current' : s === 'recovered' || s === 'resolved' ? 'done' : 'todo';
  const close: FlowState = s === 'recovered' ? 'current' : s === 'resolved' ? 'done' : 'todo';
  return [
    { key: 'detect', label: 'Tespit', state: 'done', sub: hm(inc.openedAt) },
    { key: 'own', label: 'Sahiplen', state: own, sub: own === 'current' ? 'ilk işlemle otomatik' : own === 'done' && inc.owner ? inc.owner : '' },
    { key: 'act', label: 'Aksiyon', state: act, failed, sub: failed ? 'son deneme başarısız' : act === 'running' ? 'sürüyor' : act === 'skip' ? 'gerekmedi' : '' },
    { key: 'result', label: 'Sonuç', state: res, sub: s === 'awaitingField' && inc.task ? `saha ekibi · ${TASK_STAGE[inc.task.status].toLocaleLowerCase('tr')}` : s === 'recovered' ? 'kendiliğinden düzeldi' : '' },
    { key: 'close', label: 'Kapandı', state: close, sub: s === 'recovered' ? 'onayınız bekleniyor' : s === 'resolved' ? hm(inc.resolvedAt!) : '' },
  ];
}

// ---------- station page ----------

const AVAILABILITY: Record<StationState, string> = {
  online: 'Tam',
  degraded: 'Kısmi',
  signalDelayed: 'Bilinmiyor',
  offline: 'Yok',
  outOfService: 'Yok',
};

export interface Crumb {
  label: string;
  href?: string;
}

export function stationModel(e: ConsoleEngine, id: string, from: string | null) {
  const st = e.db.stations[id];
  if (!st) return null;
  const ss = e.stState(st);
  const stale = ss === 'signalDelayed' || ss === 'offline';
  const ls = e.lastSeen(st);
  const held = e.db.byStation[id].map((x) => e.db.parcels[x]).filter((p) => p.status === 'ready');
  const sorted = held.slice().sort((a, b) => e.parcelRank(a) - e.parcelRank(b) || a.arrived - b.arrived);
  const blocked = held.filter((p) => e.parcelRank(p) === 0).length;
  const incs = e.incidents().filter((i) => i.stationId === id && i.status !== 'resolved');
  const key = 'st:' + id;
  const slot = e.stationAction(id);
  const asOf = stale ? 'son veri ' + hm(ls) : '';
  const crumbs: Crumb[] = [{ label: 'Kuyruk', href: e.lastQ || '#/queue' }];
  if (from) crumbs.push({ label: from, href: '#/queue?incident=' + from });
  crumbs.push({ label: id });
  return {
    id,
    key,
    meta: `${st.model} · ${st.customer} · ${st.city}`,
    state: ss,
    stale,
    fresh: freshness(e, ss, ls),
    stats: [
      { k: 'Erişilebilirlik', v: AVAILABILITY[ss], mono: false, tone: ss === 'signalDelayed' ? 'unk' : ss === 'offline' || ss === 'outOfService' ? 'err' : null, sub: asOf },
      { k: 'Bekleyen paket', v: String(held.length), mono: true, tone: stale ? 'unk' : null, sub: asOf },
      { k: 'Sözleşme hedefi', v: st.target + ' sa', mono: true, tone: null, sub: '' },
      { k: 'LTE yedeği', v: st.lte ? 'Var' : 'Yok', mono: false, tone: null, sub: '' },
      { k: 'Raporlama aralığı', v: '60 sn', mono: true, tone: null, sub: '' },
    ] as { k: string; v: string; mono: boolean; tone: 'unk' | 'err' | null; sub: string }[],
    result: resultView(st, key),
    actions: slot ? [e.actionView(key, slot)] : [],
    noActionsText:
      ss === 'offline'
        ? 'Çevrimdışıyken istasyon işlemi yapılamaz. Olayı üzerinden ilerleyin.'
        : 'Sinyal gecikirken istasyon işlemi yapılamaz. İzlemede kalın: 10 dk sonra çevrimdışı sayılır.',
    pending: pendingView(e, [key]),
    incidents: incs.map((i) => incidentLink(e, i)),
    tasks: incs
      .filter((i) => i.task)
      .map((i) => ({
        incId: i.id,
        href: '#/queue?incident=' + i.id,
        text: `Saha ziyareti ${i.task!.id} · ${TASK_STAGE[i.task!.status]} · son süre ${hm(i.task!.due)}`,
        breached: i.task!.due < e.now(),
      })),
    taskNote: incs.some((i) => i.task && i.type === 'offline') ? 'İstasyon yeniden çevrimiçi olduğunda paketlerin engeli kalkar.' : '',
    parcelCount: held.length,
    blockedText: `· ${blocked} engelli`,
    parcels: sorted.map((p) => parcelRow(e, p, from)),
    history: eventsView(e, (ev) => ev.st === id, true, 20),
    crumbs,
  };
}

// ---------- parcel page ----------

export function parcelModel(e: ConsoleEngine, id: string, from: string | null) {
  const p = e.db.parcels[id];
  if (!p) return null;
  const st = e.db.stations[p.stationId];
  const incs = e
    .incidents()
    .filter((i) => i.parcelIds.includes(id) || (i.type === 'offline' && i.stationId === p.stationId && i.status !== 'resolved' && p.status === 'ready'));
  const terminal = p.status !== 'ready';
  const actions: ActionView[] = [];
  const keys: TargetKey[] = [];
  if (!terminal) {
    incs
      .filter((i) => i.type !== 'offline' && i.status !== 'resolved')
      .forEach((i) => {
        keys.push(i.id);
        e.actionsFor(i)
          .filter((a) => PARCEL_ACTIONS.includes(a.aid))
          .forEach((a) => actions.push(e.actionView(i.id, a, i)));
      });
  }
  const withResult = incs.filter((i) => i.result).sort((a, b) => b.result!.t - a.result!.t)[0];
  const stationInc = !terminal && !actions.length ? incs.find((i) => i.type === 'offline' && i.status !== 'resolved') : undefined;
  const stHref = `#/stations/${st.id}${from ? '?from=' + from : ''}`;
  const crumbs: Crumb[] = [{ label: 'Kuyruk', href: e.lastQ || '#/queue' }];
  if (from) crumbs.push({ label: from, href: '#/queue?incident=' + from });
  crumbs.push({ label: st.id, href: stHref }, { label: id });
  return {
    id,
    flags: e.parcelFlags(p),
    stationId: st.id,
    stationHref: stHref,
    comp: p.comp,
    digits: p.digits,
    result: withResult ? resultView(withResult, withResult.id) : null,
    actions,
    pending: pendingView(e, keys),
    noActionsText:
      p.status === 'pickedUp'
        ? 'İşlem yok: paket teslim alındı.'
        : p.status === 'markedForReturn'
          ? 'İşlem yok: paket iadeye ayrıldı.'
          : stationInc
            ? `Paket işlemi yok: istasyon çevrimdışı. ${stationInc.id} üzerinden ilerleyin.`
            : 'İşlem yok: bu pakete bağlı açık olay yok.',
    waitingFor: (() => {
      if (terminal) return null;
      const w = incs.find((i) => i.task && (i.parcelIds.includes(id) || (i.type === 'offline' && i.stationId === p.stationId)));
      return w ? `${w.task!.id} saha ziyareti bekleniyor` : null;
    })(),
    arrived: e.dt(p.arrived),
    hold: e.dt(p.hold),
    notifs: p.notifs
      .slice()
      .reverse()
      .map((n, i) => ({ key: i, ch: n.ch, time: e.dt(n.t), ok: n.ok })),
    incidents: incs.map((i) => incidentLink(e, i)),
    history: eventsView(e, (ev) => ev.pcl === id, true),
    crumbs,
  };
}

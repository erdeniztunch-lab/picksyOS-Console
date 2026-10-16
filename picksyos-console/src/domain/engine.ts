import {
  ACTIONS,
  INTERNAL_TARGET_HOURS,
  LOADING_MS,
  LOCAL_ACTION_MS,
  NEXT_STEP,
  PHONE_MAX,
  ROW_HIGHLIGHT_MS,
  ROW_HIGHLIGHT_REDUCED_MS,
  SEED_PARCELS,
  STATIONS,
  TARGET_HOURS,
  TASK_ACCEPT_MS,
  TOAST_MS,
} from './constants';
import { DAY, MIN, dayLabel, durShort, durTxt, hm, rng, spokenDuration } from './format';
import { emptyQueue, parseHash, routeHash } from './router';
import { queuePositions, queueModel } from './selectors';
import type {
  ActionId,
  ActionSlot,
  ActionView,
  CountdownView,
  Db,
  Derived,
  Incident,
  IncidentType,
  LogEvent,
  Parcel,
  ParcelFlag,
  QueueRoute,
  Recommendation,
  ResultKind,
  Route,
  Station,
  StationState,
  TargetKey,
  UiState,
} from './types';

export interface ActOpts {
  confirmed?: boolean;
  tookOver?: boolean;
  /** Finish synchronously (scenes). */
  fast?: boolean;
  /** Leave a remote action running forever (scenes). */
  noFinish?: boolean;
  note?: string;
}

type IncidentSeed = Partial<Incident> & {
  id: string;
  type: IncidentType;
  stationId: string;
  opened: number;
  sig?: [number, string][];
};

const TOUR_KEY = 'picksy-tour-done';
const SHORTCUTS_KEY = 'picksy-shortcuts';
export const TOUR_STEPS = 3;

const storage = {
  get(k: string): string | null {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* private mode */
    }
  },
};

/**
 * Owns the demo's in-memory data, UI state and route. React subscribes via
 * useSyncExternalStore; every mutation ends in emit().
 */
export class ConsoleEngine {
  readonly scene: string | null;
  /** 14:00 today: the demo clock's anchor. */
  readonly A: number;
  /** Fixed offset from A while a scene is loaded; null = clock runs. */
  frozen: number | null;
  db!: Db;
  ui: UiState;
  route!: Route;
  lastQ = '#/queue';
  busy: { key: TargetKey; aid: ActionId } | null = null;
  movedAt: Record<string, number> = {};
  /** Bumped to ask the incident panel to focus its heading. */
  focusHeadSeq = 0;
  /** Asks a queue row to scroll into view (after "Show in queue"). */
  scrollReq: { id: string; seq: number } | null = null;
  /** Asks a queue row to take focus (after Esc closes its panel). */
  focusRowReq: { id: string; seq: number } | null = null;
  width: number;
  reducedMotion: boolean;

  private t0: number;
  private prevPos: Record<string, string> = {};
  private timers: number[] = [];
  private rand: () => number = rng(5);
  private gWait = false;
  private version = 0;
  private listeners = new Set<() => void>();
  private memoStore = new Map<string, unknown>();
  private resizeFrame = 0;
  private live = false;

  constructor() {
    const q = new URLSearchParams(location.search);
    this.scene = q.get('scene');
    const a = new Date();
    a.setHours(14, 0, 0, 0);
    this.A = a.getTime();
    this.t0 = Date.now();
    this.frozen = this.scene ? 0 : null;
    const th = q.get('theme') ?? storage.get('picksy-theme');
    this.width = window.innerWidth;
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.ui = {
      theme: th === 'dark' ? 'dark' : 'light',
      role: 'operator',
      pending: null,
      note: '',
      demoOpen: false,
      menuOpen: false,
      toasts: [],
      tip: null,
      failNext: false,
      collapsed: { need: false, inHand: false, recovered: false, resolved: true },
      showAll: {},
      loading: false,
      helpOpen: false,
      tourStep: null,
      shortcuts: storage.get(SHORTCUTS_KEY) !== 'off',
    };
    this.reset(true);
    if (this.scene) {
      this.applyScene(this.scene);
      history.replaceState(null, '', routeHash(this.route));
    }
  }

  // ---------- store plumbing ----------

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  getVersion = () => this.version;

  /** Per-update cache for derived views; emit() clears it, so readers in one render share one computation. */
  memo<T>(key: string, compute: () => T): T {
    if (!this.memoStore.has(key)) this.memoStore.set(key, compute());
    return this.memoStore.get(key) as T;
  }

  emit() {
    if (!this.live) return;
    this.memoStore.clear();
    this.trackMoves();
    this.version++;
    this.listeners.forEach((fn) => fn());
  }

  /** Wires window listeners and the 1 s tick. Returns the cleanup. */
  start(): () => void {
    this.live = true;
    this.prevPos = {};
    this.trackMoves();
    const onHash = () => {
      this.route = parseHash(location.hash);
      if (this.route.view === 'queue') this.lastQ = location.hash;
      this.ui.pending = null;
      this.ui.demoOpen = false;
      this.ui.menuOpen = false;
      this.ui.helpOpen = false;
      this.emit();
    };
    // One update per frame while the window is being resized.
    const onResize = () => {
      if (this.resizeFrame) return;
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = 0;
        this.width = window.innerWidth;
        this.emit();
      });
    };
    const onKey = (e: KeyboardEvent) => this.key(e);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    window.addEventListener('resize', onResize);
    document.addEventListener('keydown', onKey);
    const tick = window.setInterval(() => this.tick(), 1000);
    const firstVisit = !this.scene && !storage.get(TOUR_KEY);
    const loadT = this.ui.loading
      ? window.setTimeout(() => {
          this.ui.loading = false;
          if (firstVisit && this.ui.tourStep == null) this.ui.tourStep = 0;
          this.emit();
        }, LOADING_MS)
      : undefined;
    if (!this.ui.loading && firstVisit && this.ui.tourStep == null) this.ui.tourStep = 0;
    this.version++;
    this.listeners.forEach((fn) => fn());
    return () => {
      this.live = false;
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('keydown', onKey);
      clearInterval(tick);
      clearTimeout(loadT);
    };
  }

  get isPhone() {
    return this.width <= PHONE_MAX;
  }

  now(): number {
    return this.frozen != null ? this.A + this.frozen : this.A + (Date.now() - this.t0);
  }

  isMoved(id: string): boolean {
    const t = this.movedAt[id];
    return !!t && Date.now() - t < (this.reducedMotion ? ROW_HIGHLIGHT_REDUCED_MS : ROW_HIGHLIGHT_MS);
  }

  private trackMoves() {
    const pos = queuePositions(this);
    for (const k of Object.keys(pos)) {
      if (this.prevPos[k] !== undefined && this.prevPos[k] !== pos[k]) this.movedAt[k] = Date.now();
    }
    this.prevPos = pos;
  }

  private tick() {
    if (this.frozen == null && !this.db.pro02done && this.now() >= this.A + 90_000) this.recoverPro02();
    if (this.frozen == null)
      this.incidents().forEach((i) => {
        if (i.task?.status === 'requested' && this.now() - i.task.requestedAt >= TASK_ACCEPT_MS) this.acceptTask(i);
      });
    const t = Date.now();
    this.ui.toasts = this.ui.toasts.filter((x) => x.until > t);
    this.emit();
  }

  // ---------- routing ----------

  setQ(patch: Partial<QueueRoute>, push = false) {
    const r = this.route.view === 'queue' ? this.route : emptyQueue();
    const n: QueueRoute = { ...r, ...patch, view: 'queue' };
    const h = routeHash(n);
    if (push) history.pushState(null, '', h);
    else history.replaceState(null, '', h);
    this.route = n;
    this.lastQ = h;
    this.emit();
  }

  go(h: string) {
    location.hash = h;
  }

  select(id: string | null) {
    this.ui.pending = null;
    this.ui.tip = null;
    if (id) this.focusHeadSeq++;
    this.setQ({ incident: id }, this.isPhone);
  }

  // ---------- UI toggles ----------

  setRole(role: UiState['role']) {
    this.ui.role = role;
    this.ui.pending = null;
    this.emit();
  }

  toggleTheme() {
    this.ui.theme = this.ui.theme === 'dark' ? 'light' : 'dark';
    if (!this.scene) storage.set('picksy-theme', this.ui.theme);
    this.emit();
  }

  // ---------- first-visit tour ----------

  startTour() {
    this.setUi({ tourStep: 0, helpOpen: false, menuOpen: false, demoOpen: false });
  }

  tourNext() {
    const step = this.ui.tourStep;
    if (step == null) return;
    if (step >= TOUR_STEPS - 1) return this.endTour();
    this.setUi({ tourStep: step + 1 });
  }

  endTour() {
    storage.set(TOUR_KEY, '1');
    this.setUi({ tourStep: null });
  }

  setUi(patch: Partial<UiState>) {
    Object.assign(this.ui, patch);
    this.emit();
  }

  // ---------- data ----------

  private log(o: Omit<LogEvent, 't' | 'seq'> & { t?: number }) {
    this.db.events.push({ ...o, t: o.t ?? this.now(), seq: this.db.seq++ });
  }

  private ev(inc: Incident, actor: string, text: string, outcome?: string | null, t?: number) {
    this.log({
      inc: inc.id,
      st: inc.stationId,
      pcl: inc.type !== 'offline' ? inc.parcelIds[0] : undefined,
      actor,
      text,
      outcome,
      t,
    });
  }

  reset(initial: boolean) {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.busy = null;
    this.prevPos = {};
    this.movedAt = {};
    this.rand = rng(5);
    this.t0 = Date.now();
    Object.assign(this.ui, {
      role: 'operator',
      pending: null,
      note: '',
      demoOpen: false,
      menuOpen: false,
      toasts: [],
      tip: null,
      failNext: false,
      collapsed: { need: false, inHand: false, recovered: false, resolved: true },
      showAll: {},
      loading: initial && !this.scene,
    });
    this.seed();
    if (initial) this.route = parseHash(location.hash);
    else {
      this.route = emptyQueue();
      history.pushState(null, '', routeHash(this.route));
    }
    this.lastQ = this.route.view === 'queue' ? routeHash(this.route) : '#/queue';
    this.emit();
  }

  private seed() {
    const at = (m: number) => this.A + m * MIN;
    const r = rng(20261016);
    const db: Db = {
      stations: {},
      parcels: {},
      byStation: {},
      incidents: {},
      order: [],
      events: [],
      seq: 0,
      ft: 32,
      pro02done: false,
      stress: false,
    };
    this.db = db;

    for (const [id, model, c, city, lte, , seen] of STATIONS) {
      db.stations[id] = {
        id,
        model,
        customer: 'Müşteri ' + c,
        city,
        lte,
        target: TARGET_HOURS[c],
        seen: seen == null ? null : seen === 'lag' ? 'lag' : at(seen),
        oos: false,
        result: null,
      };
      db.byStation[id] = [];
    }

    const used = new Set(SEED_PARCELS.map((s) => s[0]));
    const addP = (id: string, st: string, comp: string, arr: number, nf: [number, boolean] | null, digits: string) => {
      const p: Parcel = {
        id,
        stationId: st,
        comp,
        arrived: at(arr),
        hold: at(arr) + 3 * DAY,
        status: 'ready',
        digits,
        notifs: [{ ch: 'SMS', t: nf ? at(nf[0]) : at(arr + 1), ok: nf ? nf[1] : true }],
      };
      db.parcels[id] = p;
      db.byStation[st].push(id);
      this.log({ st, pcl: id, t: p.arrived, actor: 'Sistem', text: 'İstasyona geldi · ' + comp });
      this.log({
        st,
        pcl: id,
        t: p.notifs[0].t,
        actor: 'Sistem',
        text: 'Teslim alma kodu SMS ile gönderildi',
        outcome: p.notifs[0].ok ? 'İletildi' : 'İletilmedi',
      });
    };
    SEED_PARCELS.forEach((s) => addP(...s));

    // Fill each station up to its held count with deterministic filler parcels.
    for (const [id, model, , , , held] of STATIONS) {
      const comps = new Set(db.byStation[id].map((x) => db.parcels[x].comp));
      while (db.byStation[id].length < held) {
        let pid: string;
        do pid = 'PCL-' + String(1 + Math.floor(r() * 999)).padStart(4, '0');
        while (used.has(pid));
        used.add(pid);
        let comp: string;
        do
          comp =
            model === 'Lite'
              ? `Modül ${1 + Math.floor(r() * 3)} · ${['S', 'M', 'L', 'XL'][Math.floor(r() * 4)]}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}`
              : `Göz ${1 + Math.floor(r() * 6)}-${String(1 + Math.floor(r() * 16)).padStart(2, '0')}`;
        while (comps.has(comp));
        comps.add(comp);
        addP(pid, id, comp, -(30 + Math.floor(r() * 4050)), null, String(Math.floor(r() * 100)).padStart(2, '0'));
      }
    }

    const I = (o: IncidentSeed): Incident => {
      const st = db.stations[o.stationId];
      const { opened, sig, ...rest } = o;
      const inc: Incident = {
        parcelIds: [],
        status: 'open',
        owner: null,
        ownerSince: null,
        ownerNote: null,
        outcomes: {},
        sendFails: 0,
        backupFailed: false,
        retryFailed: false,
        task: null,
        result: null,
        running: null,
        resolvedAt: null,
        resolvedBy: null,
        outcome: null,
        recoveredAt: null,
        stress: false,
        source: 'contract',
        openedAt: 0,
        targetH: 0,
        deadlineAt: 0,
        signals: [],
        ...rest,
      };
      inc.openedAt = at(opened);
      inc.targetH = inc.source === 'contract' ? st.target : INTERNAL_TARGET_HOURS;
      inc.deadlineAt = inc.openedAt + inc.targetH * 60 * MIN;
      inc.signals = (sig || []).map(([m, text]) => ({ t: at(m), text }));
      db.incidents[inc.id] = inc;
      db.order.push(inc.id);
      inc.signals.forEach((s) => this.ev(inc, 'Sistem', 'Sinyal: ' + s.text, null, s.t));
      this.ev(inc, 'Sistem', 'Olay açıldı', null, inc.openedAt);
      return inc;
    };

    I({
      id: 'INC-101',
      type: 'retrieval',
      stationId: 'WAL-01',
      parcelIds: ['PCL-0107'],
      opened: -4,
      sig: [[-5, 'Teslim alma kodu kabul edildi'], [-4, 'Teslim zaman aşımı'], [-4, 'Kapak ışık perdesi: paket yok']],
    });
    I({
      id: 'INC-102',
      type: 'offline',
      stationId: 'LIT-03',
      opened: -255,
      outcomes: { backup: false },
      sig: [[-265, '09.35’ten beri sinyal yok'], [-255, 'Kapı sensörleri: veri yok'], [-255, 'Kilit denetleyicisi: veri yok']],
    });
    const i103 = I({ id: 'INC-103', type: 'offline', stationId: 'WAL-02', opened: -170, sig: [[-180, '11.00’den beri sinyal yok']] });
    Object.assign(i103, {
      status: 'awaitingField',
      owner: 'Operatör B',
      ownerSince: at(-170),
      ownerNote: 'Saha ziyaretini 11.10’da Operatör B istedi.',
      task: { id: 'FT-031', due: i103.deadlineAt, by: 'Operatör B', status: 'accepted', requestedAt: at(-170), acceptedAt: at(-168), onSiteAt: null, completedAt: null, note: '' },
    });
    this.ev(i103, 'Operatör B', 'FT-031 saha görevi istendi · son süre 19:10', null, at(-170));
    this.ev(i103, 'Saha ekibi', 'Saha ekibi kabul etti · FT-031', 'Simüle', at(-168));
    I({ id: 'INC-104', type: 'offline', stationId: 'PRO-02', opened: -2, sig: [[-12, '13.48’den beri sinyal yok'], [-12, 'CCTV yayını kesildi']] });
    const i105 = I({
      id: 'INC-105',
      type: 'offline',
      stationId: 'LIT-04',
      opened: -25,
      outcomes: { backup: false },
      sig: [[-35, '13.25’ten beri sinyal yok'], [-36, 'Şebeke elektriği kesildi']],
    });
    Object.assign(i105, { status: 'acknowledged', owner: 'Operatör B', ownerSince: at(-20), ownerNote: 'Operatör B 13.40’ta üstlendi.' });
    this.ev(i105, 'Operatör B', 'Üstlenildi', null, at(-20));
    I({
      id: 'INC-106',
      type: 'notification',
      stationId: 'LIT-04',
      parcelIds: ['PCL-0412'],
      opened: -40,
      source: 'internal',
      outcomes: { resend: false, other: true },
      sig: [[-40, 'SMS iletilmedi']],
    });
    I({ id: 'INC-107', type: 'notification', stationId: 'PRO-01', parcelIds: ['PCL-0233'], opened: -110, source: 'internal', sig: [[-110, 'SMS iletilmedi']] });
    I({ id: 'INC-108', type: 'expired', stationId: 'LIT-02', parcelIds: ['PCL-0301'], opened: -300, source: 'internal', sig: [[-300, 'Bekletme süresi bitti']] });
    const i91 = I({ id: 'INC-091', type: 'retrieval', stationId: 'WAL-03', opened: -238 });
    Object.assign(i91, { status: 'resolved', owner: 'Operatör B', resolvedAt: at(-225), resolvedBy: 'Operatör B', outcome: 'Teslim yeniden denendi, başarılı' });
    this.ev(i91, 'Operatör B', 'Teslimi yeniden dene başlatıldı', null, at(-227));
    this.ev(i91, 'Operatör B', 'Kapandı · Teslim yeniden denendi, başarılı', 'Başarılı', at(-225));
    const i90 = I({ id: 'INC-090', type: 'notification', stationId: 'PRO-03', opened: -150, source: 'internal' });
    Object.assign(i90, { status: 'resolved', owner: 'Operatör B', resolvedAt: at(-138), resolvedBy: 'Operatör B', outcome: 'Kod yeniden gönderildi, iletildi' });
    this.ev(i90, 'Operatör B', 'Kodu yeniden gönder başlatıldı', null, at(-139));
    this.ev(i90, 'Operatör B', 'Kapandı · Kod yeniden gönderildi, iletildi', 'Başarılı', at(-138));
  }

  /** Demo control: adds 40 illustrative incidents. */
  stress() {
    const db = this.db;
    if (db.stress) return;
    db.stress = true;
    const r = rng(7);
    const at = (m: number) => this.A + m * MIN;
    const busy = new Set<string>();
    db.order.forEach((k) => db.incidents[k].parcelIds.forEach((p) => busy.add(p)));
    const ids = Object.keys(db.stations);
    const robo = ['PRO-01', 'PRO-03', 'WAL-01', 'WAL-03'];
    for (let i = 0; i < 40; i++) {
      const retr = i % 4 === 0;
      const stId = retr ? robo[(i / 4) % 4] : ids[i % 12];
      const cand = db.byStation[stId].filter((p) => !busy.has(p) && db.parcels[p].status === 'ready');
      const pid = cand[Math.floor(r() * cand.length)];
      busy.add(pid);
      const st = db.stations[stId];
      const opened = retr ? -(15 + Math.floor(r() * 96)) : -(10 + Math.floor(r() * 450));
      const openedAt = at(opened);
      const targetH = retr ? st.target : INTERNAL_TARGET_HOURS;
      const inc: Incident = {
        id: 'INC-' + (201 + i),
        type: retr ? 'retrieval' : 'notification',
        stationId: stId,
        parcelIds: [pid],
        status: 'open',
        owner: null,
        ownerSince: null,
        ownerNote: null,
        outcomes: {},
        sendFails: 0,
        backupFailed: false,
        retryFailed: false,
        task: null,
        result: null,
        running: null,
        resolvedAt: null,
        resolvedBy: null,
        outcome: null,
        recoveredAt: null,
        stress: true,
        source: retr ? 'contract' : 'internal',
        openedAt,
        targetH,
        deadlineAt: openedAt + targetH * 60 * MIN,
        signals: retr
          ? [
              { t: openedAt, text: 'Teslim zaman aşımı' },
              { t: openedAt, text: 'Kapak ışık perdesi: paket yok' },
            ]
          : [{ t: openedAt, text: 'SMS iletilmedi' }],
      };
      if (!retr) db.parcels[pid].notifs.push({ ch: 'SMS', t: openedAt, ok: false });
      db.incidents[inc.id] = inc;
      db.order.push(inc.id);
      inc.signals.forEach((s) => this.ev(inc, 'Sistem', 'Sinyal: ' + s.text, null, s.t));
      this.ev(inc, 'Sistem', 'Olay açıldı (yük testi)', null, inc.openedAt);
    }
    this.ui.collapsed.inHand = true;
    this.ui.collapsed.resolved = true;
  }

  // ---------- derived ----------

  incidents(): Incident[] {
    return this.db.order.map((k) => this.db.incidents[k]);
  }

  /** Last heartbeat, floored to the demo minute for live stations. */
  lastSeen(st: Station): number {
    const n = this.now();
    const live = n - ((((n - this.A) % MIN) + MIN) % MIN);
    if (st.seen == null) return live;
    if (st.seen === 'lag') return live - 6 * MIN;
    return st.seen;
  }

  /** Fresh ≤3 min, delayed 3–10, offline >10 (illustrative). */
  stState(st: Station): StationState {
    if (st.oos) return 'outOfService';
    const d = (this.now() - this.lastSeen(st)) / MIN;
    if (d > 10) return 'offline';
    if (d > 3) return 'signalDelayed';
    if (this.incidents().some((i) => i.type === 'retrieval' && i.stationId === st.id && i.status !== 'resolved')) return 'degraded';
    return 'online';
  }

  openRetrievalFor(pid: string): Incident | undefined {
    return this.incidents().find((i) => i.type === 'retrieval' && i.status !== 'resolved' && i.parcelIds.includes(pid));
  }

  dt(ms: number): string {
    return dayLabel(ms, this.A) + ' ' + hm(ms);
  }

  srcText(inc: Incident): string {
    return inc.source === 'contract' ? `Sözleşme hedefi ${inc.targetH} sa` : 'İç hedef 8 sa';
  }

  readyCount(stationId: string): number {
    return this.db.byStation[stationId].filter((p) => this.db.parcels[p].status === 'ready').length;
  }

  /** The proposed ranking rule (see RANKING_RULE). */
  derive(inc: Incident): Derived {
    const n = this.now();
    const st = this.db.stations[inc.stationId];
    const ss = this.stState(st);
    const stopped = ss === 'offline' || ss === 'outOfService';
    let blocked = 0;
    if (inc.status !== 'resolved') {
      if (inc.type === 'offline' && stopped) blocked = this.readyCount(st.id);
      if (inc.type === 'retrieval') {
        const p = this.db.parcels[inc.parcelIds[0]];
        // A parcel already blocked by an open Station offline incident is counted only there.
        const underOffline =
          ss === 'offline' && this.incidents().some((i) => i.type === 'offline' && i.stationId === st.id && i.status !== 'resolved');
        if (p && p.status === 'ready' && !underOffline) blocked = 1;
      }
    }
    const noPickups = (inc.type === 'offline' || inc.type === 'retrieval') && stopped && inc.status !== 'resolved';
    const leftMin = (inc.deadlineAt - n) / MIN;
    const waiting = inc.type === 'retrieval' && inc.status !== 'resolved' && n < inc.openedAt + 10 * MIN;
    let band: Derived['band'] = 'P3';
    if (inc.type !== 'expired') {
      if (waiting || leftMin <= 30 || (noPickups && blocked >= 10)) band = 'P1';
      else if (noPickups || leftMin <= 120 || blocked >= 1) band = 'P2';
    }
    // Each reason is built once as a variable, so the deciding one is picked by meaning, not by matching text.
    const pl = (b: number) => `${b} paket engelli`;
    const waitingWhy = waiting ? 'Alıcı istasyonda bekliyor' : null;
    let deadlineWhy: string | null = null;
    if (inc.type !== 'expired') {
      if (leftMin < 0) deadlineWhy = `Son süre ${durTxt(Math.floor(-leftMin))} önce aşıldı`;
      else if (leftMin <= 120) deadlineWhy = `Son süreye ${durTxt(Math.ceil(leftMin))} kaldı`;
    }
    const pickupsWhy = noPickups ? `Teslim alma yapılamıyor · ${pl(blocked)}` : null;
    const blockedWhy = !noPickups && blocked >= 1 ? pl(blocked) : null;
    const typeWhy = inc.type === 'notification' ? 'Kod iletilmedi · paket sorunsuz' : inc.type === 'expired' ? 'Bekletme süresi doldu' : null;
    const why = [waitingWhy, deadlineWhy, pickupsWhy, blockedWhy, typeWhy].filter((w): w is string => !!w);
    // The deciding reason is the first rule that matched the band; it leads the why line.
    let lead: string | null = null;
    if (band === 'P1') lead = waitingWhy ?? (leftMin <= 30 ? deadlineWhy : pickupsWhy);
    else if (band === 'P2') lead = pickupsWhy ?? (leftMin <= 120 ? deadlineWhy : blockedWhy);
    lead = lead ?? why[0] ?? '';
    const ordered = lead ? [lead, ...why.filter((w) => w !== lead)] : why;
    return { band, why: ordered, lead, deadlineWhy, blocked, waiting, leftMin, noPickups, ss, st };
  }

  countdown(inc: Incident): CountdownView {
    const left = inc.deadlineAt - this.now();
    if (left < 0) {
      const over = Math.floor(-left / MIN);
      return { text: '−' + durShort(over), tone: 'breached', spoken: `son süre ${spokenDuration(over)} aşıldı` };
    }
    const m = Math.ceil(left / MIN);
    return { text: durShort(m), tone: m <= 30 ? 'soon' : 'normal', spoken: `son süreye ${spokenDuration(m)} kaldı` };
  }

  parcelFlags(p: Parcel): ParcelFlag[] {
    if (p.status === 'pickedUp') return [{ label: 'pickedUp' }];
    if (p.status === 'markedForReturn') return [{ label: 'markedForReturn' }];
    const ss = this.stState(this.db.stations[p.stationId]);
    const out: ParcelFlag[] = [];
    if (ss === 'offline') out.push({ label: 'blockedOffline' });
    if (ss === 'outOfService') out.push({ label: 'blockedOutOfService' });
    if (this.openRetrievalFor(p.id)) out.push({ label: 'blockedRetrieval' });
    const last = p.notifs[p.notifs.length - 1];
    if (last && !last.ok) out.push({ label: 'codeNotDelivered' });
    if (this.now() > p.hold) out.push({ label: 'holdExpired' });
    if (!out.length) out.push({ label: ss === 'signalDelayed' ? 'readyUnknown' : 'ready' });
    return out;
  }

  parcelRank(p: Parcel): number {
    const f = this.parcelFlags(p)[0].label;
    if (f.startsWith('blocked')) return 0;
    if (f === 'codeNotDelivered') return 1;
    if (f === 'holdExpired') return 2;
    if (f === 'ready' || f === 'readyUnknown') return 3;
    return 4;
  }

  rec(inc: Incident): Recommendation | null {
    const st = this.db.stations[inc.stationId];
    if (inc.status !== 'open' && inc.status !== 'acknowledged') return null;
    if (inc.type === 'retrieval') {
      if (!inc.retryFailed) return { id: 'retry', reason: 'Alıcının kodu kabul edildi ama paket kapağa ulaşmadı.' };
      return st.oos
        ? { id: 'requestField', reason: 'Paket hâlâ sıkışık ve istasyon hizmet dışı. Teknisyen ziyareti gerekiyor.' }
        : { id: 'oos', reason: 'Yeniden denemeye rağmen paket sıkışık. Önce istasyonu hizmet dışı bırak, sonra saha ziyareti iste.' };
    }
    if (inc.type === 'offline') {
      if (st.lte && !inc.backupFailed) return { id: 'backup', reason: 'Bu istasyonda LTE yedek bağlantısı var.' };
      return {
        id: 'requestField',
        reason: st.lte ? 'Yedek bağlantı çalışmadı. İstasyona teknisyen gerekiyor.' : 'Bu istasyonda LTE yedeği yok. İstasyona teknisyen gerekiyor.',
      };
    }
    if (inc.type === 'notification') {
      if (inc.sendFails === 0) return { id: 'resend', reason: 'Teslim alma kodunu içeren son SMS iletilmedi.' };
      if (inc.sendFails === 1) return { id: 'other', reason: 'Yeniden gönderim de iletilmedi. E-postayı dene.' };
      return { id: 'unreachable', reason: 'İki deneme de iletilmedi.' };
    }
    // Recommend per role: an operator cannot mark for return, so the doable step leads.
    const ended = hm(this.db.parcels[inc.parcelIds[0]].hold);
    if (this.ui.role !== 'supervisor') return { id: 'extend', reason: `Bekletme süresi bitti (${ended}). İadeye ayırmak süpervizör onayı gerektirir.` };
    return { id: 'markReturn', reason: `Bekletme süresi bitti (${ended}).` };
  }

  actionsFor(inc: Incident): ActionSlot[] {
    const st = this.db.stations[inc.stationId];
    const p: Parcel | undefined = this.db.parcels[inc.parcelIds[0]];
    const L: ActionSlot[] = [];
    const add = (aid: ActionId, o: Omit<ActionSlot, 'aid'> = {}) => L.push({ aid, ...o });
    const off = (reason: string) => ({ disabled: true, reason });

    if (inc.status === 'open' || inc.status === 'acknowledged' || inc.status === 'inProgress') {
      if (inc.type === 'retrieval') {
        add('retry', p && p.status !== 'ready' ? off('Paket artık istasyonda değil') : {});
        add('oos', st.oos ? off('İstasyon zaten hizmet dışı') : {});
        add('requestField');
      }
      if (inc.type === 'offline') {
        add('backup', !st.lte ? off('Bu istasyonda LTE yedeği yok') : {});
        add('requestField');
      }
      if (inc.type === 'notification') {
        add('resend');
        add('other', inc.sendFails < 1 ? off('İletilmeyen bir yeniden gönderimden sonra açılır') : {});
        add('unreachable', inc.sendFails < 2 ? off('2 başarısız denemeden sonra açılır') : {});
      }
      if (inc.type === 'expired') {
        add('markReturn', this.ui.role !== 'supervisor' ? { locked: true, reason: 'Süpervizör onayı gerekli' } : {});
        add('extend');
      }
    } else if (inc.status === 'awaitingField') {
      // Waiting is the work here: cancel stays available but is not the highlighted next step.
      add('cancelField', inc.task?.status === 'onSite' ? off('Teknisyen sahada. Artık iptal edilemez.') : {});
      if (inc.type === 'offline' && !st.lte) add('backup', off('Bu istasyonda LTE yedeği yok'));
    } else if (inc.status === 'recovered') {
      add('close');
      // Recovered while a field visit is still open: offer to cancel it.
      if (inc.task) add('cancelField', inc.task.status === 'onSite' ? off('Teknisyen sahada. Artık iptal edilemez.') : {});
    }
    else if (inc.status === 'resolved') add('reopen');

    const r = this.rec(inc);
    if (r) {
      const i = L.findIndex((a) => a.aid === r.id);
      if (i > 0) L.unshift(L.splice(i, 1)[0]);
      if (i >= 0) L[0].primary = true;
    } else if (L.length && (inc.status === 'recovered' || inc.status === 'resolved')) L[0].primary = true;

    if (inc.status === 'inProgress' || this.busy?.key === inc.id)
      L.forEach((a) => {
        a.disabled = true;
        a.reason = '';
      });
    return L;
  }

  /**
   * Station-page action (operational model §3): Online/Degraded → Set out of service,
   * Out of service → Return to service. Signal delayed has none; Offline acts through its incident.
   */
  stationAction(stationId: string): ActionSlot | null {
    const st = this.db.stations[stationId];
    const ss = this.stState(st);
    if (ss === 'signalDelayed' || ss === 'offline') return null;
    if (!st.oos) return { aid: 'oos' };
    const openRetr = this.incidents().find((i) => i.stationId === stationId && i.status !== 'resolved' && i.type === 'retrieval');
    return { aid: 'rts', disabled: !!openRetr, reason: openRetr ? `Açık bir teslim arızası var (${openRetr.id})` : '' };
  }

  actionView(key: TargetKey, slot: ActionSlot, inc?: Incident): ActionView {
    const def = ACTIONS[slot.aid];
    const busy = (this.busy?.key === key && this.busy.aid === slot.aid) || inc?.running === slot.aid;
    const dis = !!(slot.disabled || slot.locked) && !busy;
    return {
      key,
      aid: slot.aid,
      label: busy ? def.ing : def.label,
      primary: !!slot.primary,
      busy,
      disabled: dis || busy,
      locked: !!slot.locked,
      reason: slot.reason || '',
      tipOpen: !!slot.locked && this.ui.tip === `${key}:${slot.aid}`,
    };
  }

  confirmText(key: TargetKey, aid: ActionId): string {
    const inc: Incident | undefined = this.db.incidents[key];
    const st = inc ? this.db.stations[inc.stationId] : this.db.stations[key.slice(3)];
    const p = inc && this.db.parcels[inc.parcelIds[0]];
    const ready = this.readyCount(st.id);
    switch (aid) {
      case 'retry':
        return `${p!.id} paketi ${st.id} kapağına gönderilir. Alıcı bekliyor olabilir.`;
      case 'oos':
        return `${st.id} istasyonunda teslim alma ve bırakma durur. Hizmete geri alınana kadar ${ready} paketin tamamı engellenir.`;
      case 'rts':
        return `${st.id} istasyonunda teslim alma ve bırakma yeniden başlar. ${ready} paket tekrar alınabilir olur.`;
      case 'requestField':
        return inc!.deadlineAt < this.now()
          ? `Süre ${durTxt(Math.floor((this.now() - inc!.deadlineAt) / MIN))} önce aşıldı. Daha erken bir zaman yok.`
          : `Talep saha ekibine gönderilir. Son süre ${hm(inc!.deadlineAt)}.`;
      case 'cancelField':
        return `${inc!.task!.id} saha görevi iptal edilir.${inc!.status === 'awaitingField' ? ' Olay “Üstlenildi” durumuna döner.' : ''}`;
      case 'unreachable':
        return `Olay “Alıcıya ulaşılamadı” olarak kapanır. ${p!.id} bekletme süresi bitene kadar istasyonda kalır.`;
      case 'markReturn':
        return `Geri alınamaz. ${p!.id} alıcının erişiminden çıkar ve kargo firmasına geri gider.`;
      case 'extend':
        return `${p!.id} için bekletme ${this.dt(p!.hold + 2 * DAY)} tarihine uzatılır.`;
      default:
        return '';
    }
  }

  // ---------- actions ----------

  clickAction(a: ActionView) {
    if (a.disabled) {
      if (a.locked) this.setUi({ tip: `${a.key}:${a.aid}` });
      return;
    }
    this.act(a.key, a.aid);
  }

  showTip(a: ActionView, on: boolean) {
    const id = `${a.key}:${a.aid}`;
    if (on && a.locked) this.setUi({ tip: id });
    else if (!on && this.ui.tip === id) this.setUi({ tip: null });
  }

  act(key: TargetKey, aid: ActionId, o: ActOpts = {}) {
    const def = ACTIONS[aid];
    const inc: Incident | undefined = this.db.incidents[key];
    const ui = this.ui;
    if (inc && !def.noOwner && inc.owner && inc.owner !== 'Siz' && !o.tookOver) {
      ui.pending = { key, aid, mode: 'owner' };
      return this.emit();
    }
    if (def.confirm && !o.confirmed) {
      ui.pending = { key, aid, mode: 'confirm', tookOver: o.tookOver };
      ui.note = '';
      return this.emit();
    }
    ui.pending = null;
    const target: Incident | Station = inc ?? this.db.stations[key.slice(3)];
    if (ui.failNext) {
      ui.failNext = false;
      target.result = { kind: 'submitFailed', text: 'Gönderilemedi. Hiçbir şey değişmedi.', retry: aid, t: this.now() };
      this.log({
        inc: inc?.id,
        st: inc ? inc.stationId : target.id,
        actor: 'Siz',
        text: def.label + ': istek gönderilemedi',
        outcome: 'Başarısız',
      });
      return this.emit();
    }
    if (inc && inc.status === 'open' && aid !== 'takeOver') {
      inc.owner = 'Siz';
      inc.ownerSince = this.now();
    }
    target.result = null;
    if (def.remote && inc) {
      inc.status = 'inProgress';
      inc.running = aid;
      this.ev(inc, 'Siz', def.label + ' başlatıldı');
      this.emit();
      if (o.fast) this.finish(key, aid);
      else if (!o.noFinish) this.timers.push(window.setTimeout(() => this.finish(key, aid), 3000 + Math.floor(this.rand() * 2000)));
    } else {
      this.busy = { key, aid };
      this.emit();
      const f = () => {
        this.busy = null;
        this.apply(key, aid, o.note);
      };
      if (o.fast) f();
      else this.timers.push(window.setTimeout(f, LOCAL_ACTION_MS));
    }
  }

  confirmPending() {
    const pd = this.ui.pending;
    if (!pd || pd.mode !== 'confirm') return;
    if (ACTIONS[pd.aid].note && !this.ui.note.trim()) return;
    this.act(pd.key, pd.aid, { confirmed: true, tookOver: pd.tookOver, note: this.ui.note });
  }

  takeOverPending() {
    const pd = this.ui.pending;
    if (!pd || pd.mode !== 'owner') return;
    const inc = this.db.incidents[pd.key];
    // A takeover that cannot be sent changes nothing, including the owner.
    if (this.ui.failNext) {
      this.ui.failNext = false;
      this.ui.pending = null;
      inc.result = { kind: 'submitFailed', text: 'Gönderilemedi. Hiçbir şey değişmedi.', retry: pd.aid, t: this.now() };
      this.ev(inc, 'Siz', 'Devral: istek gönderilemedi', 'Başarısız');
      return this.emit();
    }
    const prev = inc.owner;
    inc.owner = 'Siz';
    inc.ownerSince = this.now();
    inc.ownerNote = null;
    this.ev(inc, 'Siz', 'Devralındı · önceki sorumlu: ' + prev);
    this.ui.pending = null;
    this.act(pd.key, pd.aid, { tookOver: true });
  }

  cancelPending() {
    this.setUi({ pending: null });
  }

  private res(target: Incident | Station, kind: ResultKind, text: string, retry?: ActionId, next?: string) {
    target.result = { kind, text, retry, next, t: this.now() };
  }

  /** After a failure: point to the new recommendation, when it changed. */
  private nextStep(inc: Incident, failed: ActionId): string | undefined {
    const r = this.rec(inc);
    const step = r && r.id !== failed ? NEXT_STEP[r.id] : undefined;
    return step ? `Sıradaki adım: ${step}.` : undefined;
  }

  /** Opens "Resolved today" and asks the queue to scroll to the incident's row. */
  revealResolved(id: string) {
    this.ui.collapsed.resolved = false;
    this.scrollReq = { id, seq: (this.scrollReq?.seq ?? 0) + 1 };
    if (this.isPhone) this.setQ({ incident: null }, true);
    else this.emit();
  }

  private resolve(inc: Incident, outcome: string, by: string) {
    inc.status = 'resolved';
    inc.resolvedAt = this.now();
    inc.resolvedBy = by;
    inc.outcome = outcome;
    inc.running = null;
    this.ev(inc, by, 'Kapandı · ' + outcome, 'Başarılı');
  }

  /** Toast when the incident is not the one on screen. */
  private notSel(inc: Incident, text: string) {
    if (this.route.view !== 'queue' || this.route.incident !== inc.id) this.toast(text, inc.id);
  }

  private toast(text: string, incId: string) {
    this.ui.toasts.push({ text, incId, until: this.frozen != null ? Infinity : Date.now() + TOAST_MS });
  }

  viewToast(i: number) {
    const t = this.ui.toasts[i];
    if (!t) return;
    this.ui.toasts = this.ui.toasts.filter((x) => x !== t);
    this.select(t.incId);
  }

  /** Completes a remote action with its scripted outcome. */
  private finish(key: TargetKey, aid: ActionId) {
    const inc = this.db.incidents[key];
    if (!inc || inc.status !== 'inProgress') return;
    inc.running = null;
    const ok = inc.outcomes[aid] !== false;
    const st = this.db.stations[inc.stationId];
    const p = this.db.parcels[inc.parcelIds[0]];
    const fail = () => {
      inc.status = 'acknowledged';
    };
    switch (aid) {
      case 'retry':
        if (ok) {
          p.status = 'pickedUp';
          this.ev(inc, 'Sistem', 'Paket kapağa ulaştı · alıcı teslim aldı');
          this.resolve(inc, 'Teslim yeniden denendi, başarılı', 'Siz');
          this.res(inc, 'success', 'Paket kapağa ulaştı. Olay kapandı.');
        } else {
          fail();
          inc.retryFailed = true;
          this.ev(inc, 'Sistem', 'Paket hâlâ sıkışık', 'Başarısız');
          this.res(inc, 'failure', 'Paket hâlâ sıkışık.', 'retry', this.nextStep(inc, 'retry'));
        }
        break;
      case 'backup':
        if (ok) {
          st.seen = null;
          this.ev(inc, 'Sistem', 'LTE yedeği üzerinden sinyal alındı');
          this.resolve(inc, 'Yedek bağlantı kuruldu', 'Siz');
          this.res(inc, 'success', 'Yedek bağlantı aktif. İstasyon çevrimiçi. Olay kapandı.');
        } else {
          fail();
          inc.backupFailed = true;
          this.ev(inc, 'Sistem', 'LTE yedeğinden yanıt yok', 'Başarısız');
          this.res(inc, 'failure', 'Yedek bağlantı yanıt vermedi.', 'backup', this.nextStep(inc, 'backup'));
        }
        break;
      case 'resend':
      case 'other': {
        const ch = aid === 'resend' ? 'SMS' : 'E-posta';
        const chTxt = ch === 'SMS' ? 'SMS' : 'e-posta';
        p.notifs.push({ ch, t: this.now(), ok });
        this.ev(inc, 'Sistem', `Teslim alma kodu ${ch} ile gönderildi`, ok ? 'İletildi' : 'İletilmedi');
        if (ok) {
          this.resolve(inc, ch === 'SMS' ? 'Kod yeniden gönderildi, iletildi' : 'Kod e-postayla iletildi', 'Siz');
          this.res(inc, 'success', `Kod ${chTxt} ile iletildi. Olay kapandı.`);
        } else {
          fail();
          inc.sendFails++;
          this.res(inc, 'failure', `Kod ${chTxt} ile iletilemedi.`, aid, this.nextStep(inc, aid));
        }
        break;
      }
      case 'markReturn':
        if (ok) {
          p.status = 'markedForReturn';
          this.resolve(inc, 'İadeye ayrıldı', 'Siz');
          this.res(inc, 'success', `${p.id} iadeye ayrıldı. Olay kapandı.`);
        } else {
          fail();
          this.res(inc, 'failure', 'Kargo firması kabul etmedi.', 'markReturn');
        }
        break;
      case 'extend':
        p.hold += 2 * DAY;
        this.ev(inc, 'Sistem', 'Bekletme uzatıldı: ' + this.dt(p.hold));
        this.resolve(inc, 'Bekletme 2 gün uzatıldı', 'Siz');
        this.res(inc, 'success', `Bekletme ${this.dt(p.hold)} tarihine uzatıldı. Paket hazır. Olay kapandı.`);
        break;
    }
    // Status was mutated above; re-read it without the earlier narrowing.
    const done = (inc.status as Incident['status']) === 'resolved';
    this.notSel(inc, `${inc.id} ${done ? 'kapandı' : 'işlemi başarısız'}`);
    this.emit();
  }

  /** Applies a local (non-remote) action. */
  private apply(key: TargetKey, aid: ActionId, note?: string) {
    const inc: Incident | undefined = this.db.incidents[key];
    const st = inc ? this.db.stations[inc.stationId] : this.db.stations[key.slice(3)];
    const tgt = inc ?? st;
    switch (aid) {
      case 'ack':
        inc!.status = 'acknowledged';
        inc!.owner = 'Siz';
        this.ev(inc!, 'Siz', 'Üstlenildi');
        this.res(inc!, 'info', 'Üstlenildi. Olay artık sizde.');
        break;
      case 'takeOver': {
        const prev = inc!.owner;
        inc!.owner = 'Siz';
        inc!.ownerSince = this.now();
        inc!.ownerNote = null;
        this.ev(inc!, 'Siz', 'Devralındı · önceki sorumlu: ' + prev);
        this.res(inc!, 'info', 'Olay artık sizde. Devralma kayda geçti.');
        break;
      }
      case 'requestField': {
        const i = inc!;
        const id = 'FT-0' + this.db.ft++;
        const text = (note || '').trim();
        i.task = { id, due: i.deadlineAt, by: 'Siz', status: 'requested', requestedAt: this.now(), acceptedAt: null, onSiteAt: null, completedAt: null, note: text };
        i.status = 'awaitingField';
        const br = i.deadlineAt < this.now();
        this.ev(i, 'Siz', `${id} saha görevi istendi${text ? ` · not: “${text}”` : ''}`);
        this.res(i, 'info', `${id} saha görevi gönderildi. Son süre ${hm(i.deadlineAt)}${br ? ' (zaten aşıldı)' : ''}.`);
        break;
      }
      case 'cancelField': {
        const i = inc!;
        i.task!.status = 'cancelled';
        this.ev(i, 'Siz', `${i.task!.id} saha görevi iptal edildi · neden: ${(note || '').trim()}`);
        this.res(i, 'info', `${i.task!.id} saha görevi iptal edildi.`);
        i.task = null;
        // A recovered incident stays recovered; one that was waiting goes back to the operator.
        if (i.status === 'awaitingField') i.status = 'acknowledged';
        break;
      }
      case 'close':
        // Closing a recovered incident also withdraws its open field visit, and says so in the log.
        if (inc!.task) {
          inc!.task.status = 'cancelled';
          this.ev(inc!, 'Siz', `${inc!.task.id} saha görevi iptal edildi · olay kapatıldı`);
          inc!.task = null;
        }
        this.resolve(inc!, 'Kendiliğinden düzeldi, onaylandı', 'Siz');
        this.res(inc!, 'success', 'Onaylandı. Olay kapandı.');
        break;
      case 'reopen':
        Object.assign(inc!, { status: 'acknowledged', owner: 'Siz', resolvedAt: null, outcome: null, recoveredAt: null });
        this.ev(inc!, 'Siz', 'Yeniden açıldı');
        this.res(inc!, 'info', 'Yeniden açıldı. Olay artık sizde.');
        break;
      case 'oos':
        st.oos = true;
        this.log({ inc: inc?.id, st: st.id, actor: 'Siz', text: 'Hizmet dışı bırakıldı' });
        this.res(tgt, 'info', `${st.id} hizmet dışı. Teslim alma ve bırakma durdu.`);
        break;
      case 'rts':
        st.oos = false;
        this.log({ st: st.id, actor: 'Siz', text: 'Hizmete alındı' });
        this.res(tgt, 'success', `${st.id} yeniden hizmette.`);
        break;
      case 'unreachable':
        this.ev(inc!, 'Siz', 'Not: ' + (note || ''));
        this.resolve(inc!, 'Alıcıya ulaşılamadı', 'Siz');
        this.res(inc!, 'success', '“Alıcıya ulaşılamadı” olarak kapatıldı.');
        break;
    }
    this.emit();
  }

  /** Simulated: field service accepts the request. */
  private acceptTask(inc: Incident) {
    const t = inc.task!;
    t.status = 'accepted';
    t.acceptedAt = this.now();
    this.ev(inc, 'Saha ekibi', `Saha ekibi kabul etti · ${t.id}`, 'Simüle');
    this.emit();
  }

  /** Demo control: moves an accepted task to On site, and an on-site task to Completed. */
  advanceTask(id: string) {
    const inc = this.db.incidents[id];
    const t = inc?.task;
    if (!t) return;
    if (t.status === 'accepted') {
      t.status = 'onSite';
      t.onSiteAt = this.now();
      this.ev(inc, 'Saha ekibi', `Teknisyen sahada · ${t.id}`, 'Simüle');
      this.emit();
    } else if (t.status === 'onSite') this.finishTask(inc);
  }

  /** Completed: the same effect as before: resolved, station online (unless out of service), parcels unblocked. */
  private finishTask(inc: Incident) {
    const st = this.db.stations[inc.stationId];
    const t = inc.task!;
    t.status = 'completed';
    t.completedAt = this.now();
    this.ev(inc, 'Saha ekibi', `${t.id} saha görevi tamamlandı`, 'Simüle');
    if (inc.type === 'offline') {
      st.seen = null;
      this.ev(inc, 'Sistem', 'İstasyon yeniden çevrimiçi');
    }
    this.resolve(inc, 'Saha görevi tamamlandı', 'Saha ekibi');
    this.res(inc, 'success', `${t.id} saha görevi tamamlandı.${st.oos ? ' İstasyon hâlâ hizmet dışı.' : ''}`);
    this.notSel(inc, inc.type === 'offline' && !st.oos ? `${inc.id} kapandı · ${st.id} yeniden çevrimiçi` : `${inc.id} saha göreviyle kapandı`);
    this.emit();
  }

  /** Scenes only: runs a task through every stage at once. */
  completeTask(id: string) {
    const inc = this.db.incidents[id];
    if (!inc?.task || inc.status !== 'awaitingField') return;
    if (inc.task.status === 'requested') this.acceptTask(inc);
    if (inc.task.status === 'accepted') this.advanceTask(id);
    if (inc.task.status === 'onSite') this.finishTask(inc);
  }

  /** PRO-02's heartbeat returns 90 s into the demo. */
  private recoverPro02() {
    this.db.pro02done = true;
    this.db.stations['PRO-02'].seen = null;
    const inc = this.db.incidents['INC-104'];
    if (inc && (inc.status === 'open' || inc.status === 'acknowledged' || inc.status === 'awaitingField')) {
      inc.status = 'recovered';
      inc.recoveredAt = this.now();
      this.ev(inc, 'Sistem', 'Sinyal geri geldi · sorun kendiliğinden düzeldi');
      this.notSel(inc, 'INC-104 kendiliğinden düzeldi');
    }
    this.emit();
  }

  // ---------- keyboard ----------

  /**
   * ↑/↓ move, Enter opens, A acknowledges, R runs the recommended action, Esc backs out, g q returns to the queue.
   * Single-character keys (A, R, g q) can be turned off in Help (WCAG 2.1.4) and only act from the queue or
   * the incident panel. Arrows only move the selection from the queue, the panel heading or the page itself,
   * so they still scroll the panel when focus is on its content.
   */
  private key(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const tag = (target.tagName || '').toLowerCase();
    const ui = this.ui;
    if (tag === 'textarea' || tag === 'input') {
      if (e.key === 'Escape') this.setUi({ pending: null });
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const inChrome = !!target.closest?.('header, .popover, .tour');
    const charKeysOn = ui.shortcuts && !inChrome;
    if (this.gWait) {
      this.gWait = false;
      if (charKeysOn && (k === 'q' || k === 'Q')) {
        e.preventDefault();
        this.go(this.lastQ || '#/queue');
        return;
      }
    }
    if (charKeysOn && (k === 'g' || k === 'G')) {
      this.gWait = true;
      window.setTimeout(() => (this.gWait = false), 1200);
      return;
    }
    if (k === 'Escape') {
      if (ui.tourStep != null) return this.endTour();
      if (ui.helpOpen) return this.setUi({ helpOpen: false });
      if (ui.pending) ui.pending = null;
      else if (ui.demoOpen || ui.menuOpen) {
        ui.demoOpen = false;
        ui.menuOpen = false;
      } else if (this.route.view === 'queue' && this.route.incident) {
        // Give focus back to the row the operator came from.
        this.focusRowReq = { id: this.route.incident, seq: (this.focusRowReq?.seq ?? 0) + 1 };
        return this.setQ({ incident: null });
      }
      this.emit();
      return;
    }
    if (this.route.view !== 'queue') return;
    const route = this.route;
    if (k === 'ArrowDown' || k === 'ArrowUp') {
      const fromQueue = target === document.body || !!target.closest?.('.queue') || !!target.matches?.('.inc-head .heading');
      if (!fromQueue) return;
      e.preventDefault();
      const ids = queueModel(this).visIds;
      if (!ids.length) return;
      let i = ids.indexOf(route.incident ?? '');
      i = i < 0 ? 0 : Math.max(0, Math.min(ids.length - 1, i + (k === 'ArrowDown' ? 1 : -1)));
      this.select(ids[i]);
      return;
    }
    if (k === 'Enter' && tag !== 'button' && tag !== 'a') {
      const ids = queueModel(this).visIds;
      if (!route.incident && ids.length) this.select(ids[0]);
      else {
        this.focusHeadSeq++;
        this.emit();
      }
      return;
    }
    const inc = route.incident ? this.db.incidents[route.incident] : undefined;
    if (!inc || !charKeysOn || (tag === 'button' && k === ' ')) return;
    if ((k === 'a' || k === 'A') && inc.status === 'open') {
      e.preventDefault();
      this.act(inc.id, 'ack');
    }
    if (k === 'r' || k === 'R') {
      const r = this.rec(inc);
      if (!r) return;
      const a = this.actionsFor(inc).find((x) => x.aid === r.id);
      if (a && !a.disabled && !a.locked) {
        e.preventDefault();
        this.act(inc.id, r.id);
      }
    }
  }

  toggleShortcuts() {
    this.ui.shortcuts = !this.ui.shortcuts;
    storage.set(SHORTCUTS_KEY, this.ui.shortcuts ? 'on' : 'off');
    this.emit();
  }

  // ---------- scenes (?scene=…, used by the Screens board) ----------

  applyScene(name: string) {
    const F: ActOpts = { fast: true, confirmed: true, tookOver: true };
    const run = (k: string, a: ActionId) => this.act(k, a, F);
    const sel = (id: string | null, x: Partial<QueueRoute> = {}) => {
      this.route = { ...emptyQueue(), incident: id, ...x };
    };
    const page = (view: 'station' | 'parcel', id: string, from: string | null = null) => {
      this.route = { view, id, from };
    };
    const done101 = () => run('INC-101', 'retry');
    const fail102 = () => run('INC-102', 'backup');
    const await102 = () => {
      fail102();
      run('INC-102', 'requestField');
    };
    const clearResults = () => this.db.order.forEach((k) => (this.db.incidents[k].result = null));
    const all = () => {
      done101();
      await102();
      this.completeTask('INC-102');
      this.completeTask('INC-103');
      this.frozen = 2 * MIN;
      this.recoverPro02();
      run('INC-104', 'close');
      run('INC-105', 'backup');
      run('INC-105', 'requestField');
      this.completeTask('INC-105');
      run('INC-106', 'resend');
      run('INC-106', 'other');
      run('INC-107', 'resend');
      run('INC-108', 'extend');
      clearResults();
    };
    const ui = this.ui;
    switch (name) {
      case 'load':
        sel(null);
        break;
      case 'loading':
        ui.loading = true;
        sel(null);
        break;
      case 'inc101':
        sel('INC-101');
        break;
      case 'inc101-confirm':
        sel('INC-101');
        ui.pending = { key: 'INC-101', aid: 'retry', mode: 'confirm' };
        break;
      case 'inc101-running':
        sel('INC-101');
        this.act('INC-101', 'retry', { confirmed: true, noFinish: true });
        break;
      case 'inc101-done':
        sel('INC-101');
        done101();
        break;
      case 'inc102-failed':
        sel('INC-102');
        fail102();
        break;
      case 'inc102-field-confirm':
        sel('INC-102');
        fail102();
        ui.pending = { key: 'INC-102', aid: 'requestField', mode: 'confirm' };
        break;
      case 'inc102-awaiting':
        sel('INC-102');
        await102();
        break;
      case 'inc102-accepted':
        sel('INC-102');
        await102();
        this.acceptTask(this.db.incidents['INC-102']);
        break;
      case 'inc102-onsite':
        sel('INC-102');
        await102();
        this.acceptTask(this.db.incidents['INC-102']);
        this.advanceTask('INC-102');
        break;
      case 'st-LIT-03-task':
        await102();
        this.acceptTask(this.db.incidents['INC-102']);
        page('station', 'LIT-03', 'INC-102');
        break;
      case 'pcl-task':
        await102();
        this.acceptTask(this.db.incidents['INC-102']);
        page('parcel', this.db.byStation['LIT-03'][0], 'INC-102');
        break;
      case 'inc104-task-recovered':
        this.frozen = 2 * MIN;
        run('INC-104', 'requestField');
        this.recoverPro02();
        this.db.incidents['INC-104'].result = null;
        sel('INC-104');
        break;
      case 'inc102-complete':
        sel('INC-102');
        await102();
        this.completeTask('INC-102');
        break;
      case 'inc105-owner':
        sel('INC-105');
        ui.pending = { key: 'INC-105', aid: 'backup', mode: 'owner' };
        break;
      case 'inc104-recovered':
        this.frozen = 2 * MIN;
        sel('INC-104');
        this.recoverPro02();
        break;
      case 'inc104-toast':
        this.frozen = 2 * MIN;
        sel(null);
        this.recoverPro02();
        break;
      case 'inc108-locked':
        sel('INC-108');
        ui.tip = 'INC-108:markReturn';
        break;
      case 'inc108-supervisor':
        ui.role = 'supervisor';
        sel('INC-108');
        ui.pending = { key: 'INC-108', aid: 'markReturn', mode: 'confirm' };
        break;
      case 'inc103':
      case 'inc106':
        sel(name.toUpperCase().replace('INC', 'INC-'));
        break;
      case 'inc091':
        ui.collapsed.resolved = false;
        sel('INC-091');
        break;
      case 'submit-failed':
        sel('INC-107');
        ui.failNext = true;
        run('INC-107', 'resend');
        break;
      case 'empty':
        all();
        sel(null);
        ui.collapsed.resolved = true;
        break;
      case 'filtered-empty':
        done101();
        await102();
        clearResults();
        sel(null, { band: ['P1'] });
        break;
      case 'stress':
        this.stress();
        sel(null);
        break;
      case 'stress-filter':
        this.stress();
        sel(null, { type: ['retrieval'], band: ['P1'] });
        break;
      case 'st-LIT-06':
        page('station', 'LIT-06');
        break;
      case 'st-LIT-04':
        page('station', 'LIT-04', 'INC-105');
        break;
      case 'st-WAL-02':
        page('station', 'WAL-02', 'INC-103');
        break;
      case 'st-LIT-03':
        page('station', 'LIT-03', 'INC-102');
        break;
      case 'st-WAL-01-oos':
        done101();
        this.act('st:WAL-01', 'oos', F);
        this.db.stations['WAL-01'].result = null;
        page('station', 'WAL-01');
        break;
      case 'pcl-0412':
        page('parcel', 'PCL-0412', 'INC-105');
        break;
      case 'pcl-0107-picked':
        done101();
        page('parcel', 'PCL-0107', 'INC-101');
        break;
      case 'pcl-0301':
        page('parcel', 'PCL-0301', 'INC-108');
        break;
      case 'pcl-0610':
        page('parcel', 'PCL-0610');
        break;
      default:
        sel(null);
    }
  }
}

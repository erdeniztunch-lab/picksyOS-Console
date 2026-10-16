export type Theme = 'light' | 'dark';
export type Band = 'P1' | 'P2' | 'P3';
export type Role = 'operator' | 'supervisor';
export type IncidentType = 'offline' | 'retrieval' | 'notification' | 'expired';
export type IncidentStatus = 'open' | 'acknowledged' | 'inProgress' | 'awaitingField' | 'recovered' | 'resolved';
export type StationState = 'online' | 'degraded' | 'signalDelayed' | 'offline' | 'outOfService';
export type Availability = 'all' | 'partial' | 'unknown' | 'none';
export type ParcelStatus = 'ready' | 'pickedUp' | 'markedForReturn';
export type ParcelLabel =
  | 'ready'
  | 'readyUnknown'
  | 'blockedOffline'
  | 'blockedOutOfService'
  | 'blockedRetrieval'
  | 'codeNotDelivered'
  | 'holdExpired'
  | 'pickedUp'
  | 'markedForReturn';

export type ActionId =
  | 'ack'
  | 'takeOver'
  | 'retry'
  | 'oos'
  | 'rts'
  | 'backup'
  | 'requestField'
  | 'cancelField'
  | 'close'
  | 'reopen'
  | 'resend'
  | 'other'
  | 'unreachable'
  | 'markReturn'
  | 'extend';

export type ResultKind = 'success' | 'failure' | 'info' | 'submitFailed';
export type SectionKey = 'need' | 'inHand' | 'recovered' | 'resolved';

/** Incident id ("INC-101") or station key ("st:WAL-01"). */
export type TargetKey = string;

export interface Result {
  kind: ResultKind;
  text: string;
  retry?: ActionId;
  /** After an action failure: the step the new recommendation points to ("Next: request a field visit."). */
  next?: string;
  t: number;
}

export interface Station {
  id: string;
  model: 'Lite' | 'Pro' | 'Wall';
  customer: string;
  city: string;
  lte: boolean;
  target: number;
  /** null = live heartbeat, 'lag' = 6 min behind, number = frozen last-seen time. */
  seen: number | null | 'lag';
  oos: boolean;
  result: Result | null;
}

export interface Notification {
  ch: 'SMS' | 'E-posta';
  t: number;
  ok: boolean;
}

export interface Parcel {
  id: string;
  stationId: string;
  comp: string;
  arrived: number;
  hold: number;
  status: ParcelStatus;
  digits: string;
  notifs: Notification[];
}

/** Proposed stages (D17): the real field-service process is unknown (Q6). Every step after the request is simulated. */
export type TaskStage = 'requested' | 'accepted' | 'onSite' | 'completed' | 'cancelled';

export interface FieldTask {
  id: string;
  due: number;
  by: string;
  status: TaskStage;
  requestedAt: number;
  acceptedAt: number | null;
  onSiteAt: number | null;
  completedAt: number | null;
  /** Optional note to the field team, sent with the request. */
  note: string;
}

export interface Signal {
  t: number;
  text: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  stationId: string;
  parcelIds: string[];
  status: IncidentStatus;
  owner: string | null;
  ownerSince: number | null;
  ownerNote: string | null;
  /** Scripted outcome per remote action; false = the action fails. */
  outcomes: Partial<Record<ActionId, boolean>>;
  sendFails: number;
  backupFailed: boolean;
  retryFailed: boolean;
  task: FieldTask | null;
  result: Result | null;
  running: ActionId | null;
  resolvedAt: number | null;
  resolvedBy: string | null;
  outcome: string | null;
  recoveredAt: number | null;
  stress: boolean;
  source: 'contract' | 'internal';
  openedAt: number;
  targetH: number;
  deadlineAt: number;
  signals: Signal[];
}

export interface LogEvent {
  inc?: string;
  st?: string;
  pcl?: string;
  actor: string;
  text: string;
  outcome?: string | null;
  t: number;
  seq: number;
}

export interface Db {
  stations: Record<string, Station>;
  parcels: Record<string, Parcel>;
  byStation: Record<string, string[]>;
  incidents: Record<string, Incident>;
  order: string[];
  events: LogEvent[];
  seq: number;
  ft: number;
  pro02done: boolean;
  stress: boolean;
}

export type QueueRoute = { view: 'queue'; incident: string | null; type: IncidentType[]; band: Band[] };
export type StationRoute = { view: 'station'; id: string; from: string | null };
export type ParcelRoute = { view: 'parcel'; id: string; from: string | null };
export type Route = QueueRoute | StationRoute | ParcelRoute;

export interface Pending {
  key: TargetKey;
  aid: ActionId;
  mode: 'confirm' | 'owner';
  tookOver?: boolean;
}

export interface Toast {
  text: string;
  incId: string;
  until: number;
}

export interface UiState {
  theme: Theme;
  role: Role;
  pending: Pending | null;
  note: string;
  demoOpen: boolean;
  menuOpen: boolean;
  toasts: Toast[];
  /** "<key>:<actionId>" of the locked action whose tooltip is showing. */
  tip: string | null;
  failNext: boolean;
  collapsed: Record<SectionKey, boolean>;
  showAll: Record<string, boolean>;
  loading: boolean;
  helpOpen: boolean;
  /** First-visit tour step (0-based), or null when not showing. */
  tourStep: number | null;
  /** Single-character shortcuts (A, R, g q); off switch in Help. */
  shortcuts: boolean;
}

export interface Derived {
  band: Band;
  /** Every matching reason; the deciding one (lead) comes first. */
  why: string[];
  /** The reason that decides the row's position: the first rule that matched its band. */
  lead: string;
  /** The deadline reason, if any ("Son süreye …" / "… aşıldı"); the queue row leaves it out unless it is the lead. */
  deadlineWhy: string | null;
  blocked: number;
  waiting: boolean;
  leftMin: number;
  noPickups: boolean;
  ss: StationState;
  st: Station;
}

export interface ActionSlot {
  aid: ActionId;
  primary?: boolean;
  disabled?: boolean;
  locked?: boolean;
  reason?: string;
}

export interface ActionView {
  key: TargetKey;
  aid: ActionId;
  label: string;
  primary: boolean;
  busy: boolean;
  disabled: boolean;
  locked: boolean;
  reason: string;
  tipOpen: boolean;
}

export interface CountdownView {
  text: string;
  tone: 'normal' | 'soon' | 'breached';
  /** For screen readers: "deadline in 1 hour 56 minutes", "breached by 15 minutes". */
  spoken: string;
}

export interface ParcelFlag {
  label: ParcelLabel;
}

export interface Recommendation {
  id: ActionId;
  reason: string;
}

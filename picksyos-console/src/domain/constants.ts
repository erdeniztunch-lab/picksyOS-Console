import type { ActionId, IncidentType } from './types';

export const TYPES: Record<IncidentType, string> = {
  offline: 'İstasyon çevrimdışı',
  retrieval: 'Teslim arızası',
  notification: 'Kod bildirimi iletilemedi',
  expired: 'Teslim alma süresi doldu',
};

/** Contract target in hours per customer (illustrative). */
export const TARGET_HOURS: Record<'A' | 'B' | 'C', number> = { A: 2, B: 4, C: 8 };
export const INTERNAL_TARGET_HOURS = 8;

type StationSeed = [
  id: string,
  model: 'Lite' | 'Pro' | 'Wall',
  customer: 'A' | 'B' | 'C',
  city: string,
  lte: boolean,
  held: number,
  /** Minutes before 14:00 the station was last seen; null = live; 'lag' = signal delayed. */
  seen: number | null | 'lag',
];

export const STATIONS: StationSeed[] = [
  ['LIT-01', 'Lite', 'A', 'Ankara', true, 22, null],
  ['LIT-02', 'Lite', 'B', 'Ankara', true, 15, null],
  ['LIT-03', 'Lite', 'B', 'Ankara', true, 18, -265],
  ['LIT-04', 'Lite', 'B', 'Ankara', true, 7, -35],
  ['LIT-05', 'Lite', 'C', 'Ankara', true, 20, null],
  ['LIT-06', 'Lite', 'C', 'Ankara', true, 12, 'lag'],
  ['PRO-01', 'Pro', 'A', 'İstanbul', true, 30, null],
  ['PRO-02', 'Pro', 'B', 'İstanbul', true, 9, -12],
  ['PRO-03', 'Pro', 'C', 'İstanbul', true, 25, null],
  ['WAL-01', 'Wall', 'A', 'İstanbul', true, 40, null],
  ['WAL-02', 'Wall', 'C', 'İstanbul', false, 32, -180],
  ['WAL-03', 'Wall', 'A', 'İstanbul', false, 40, null],
];

type ParcelSeed = [
  id: string,
  stationId: string,
  comp: string,
  /** Arrival, minutes relative to 14:00. */
  arrived: number,
  /** Notification override: [minutes, delivered]. */
  notif: [number, boolean] | null,
  digits: string,
];

export const SEED_PARCELS: ParcelSeed[] = [
  ['PCL-0107', 'WAL-01', 'Göz 3-14', -1300, null, '42'],
  ['PCL-0118', 'WAL-01', 'Göz 5-02', -230, null, '17'],
  ['PCL-0350', 'LIT-03', 'Modül 2 · M-05', -1580, null, '08'],
  ['PCL-0351', 'LIT-03', 'Modül 3 · XL-01', -345, null, '63'],
  ['PCL-0520', 'PRO-02', 'Göz 2-03', -1170, null, '29'],
  ['PCL-0405', 'LIT-04', 'Modül 2 · M-02', -3115, null, '71'],
  ['PCL-0412', 'LIT-04', 'Modül 1 · S-03', -41, [-40, false], '55'],
  ['PCL-0233', 'PRO-01', 'Göz 1-08', -112, [-110, false], '90'],
  ['PCL-0301', 'LIT-02', 'Modül 1 · L-01', -4620, null, '36'],
  ['PCL-0610', 'LIT-06', 'Modül 1 · S-09', -375, null, '14'],
];

export interface ActionDef {
  label: string;
  /** Label while the action runs. */
  ing: string;
  /** Runs against the station or carrier and takes seconds; the incident moves to In hand. */
  remote?: boolean;
  confirm?: boolean;
  note?: boolean;
  supervisor?: boolean;
  /** Skips the "owned by someone else" check. */
  noOwner?: boolean;
}

export const ACTIONS: Record<ActionId, ActionDef> = {
  ack: { label: 'Üstlen', ing: 'Üstleniliyor…' },
  takeOver: { label: 'Devral', ing: 'Devralınıyor…', noOwner: true },
  retry: { label: 'Teslimi yeniden dene', ing: 'Teslim yeniden deneniyor…', remote: true, confirm: true },
  oos: { label: 'İstasyonu hizmet dışı bırak', ing: 'Hizmet dışı bırakılıyor…', confirm: true },
  rts: { label: 'Hizmete al', ing: 'Hizmete alınıyor…', confirm: true },
  backup: { label: 'Yedek bağlantıya geç', ing: 'Yedek bağlantıya geçiliyor…', remote: true },
  requestField: { label: 'Saha ziyareti iste', ing: 'Saha ziyareti isteniyor…', confirm: true },
  cancelField: { label: 'Saha ziyaretini iptal et', ing: 'İptal ediliyor…', confirm: true, note: true },
  close: { label: 'Onayla ve kapat', ing: 'Kapatılıyor…' },
  reopen: { label: 'Yeniden aç', ing: 'Yeniden açılıyor…' },
  resend: { label: 'Kodu yeniden gönder', ing: 'Kod yeniden gönderiliyor…', remote: true },
  other: { label: 'Başka kanaldan gönder', ing: 'E-postayla gönderiliyor…', remote: true },
  unreachable: { label: 'Ulaşılamadı olarak kapat', ing: 'Kapatılıyor…', confirm: true, note: true },
  markReturn: { label: 'İadeye ayır', ing: 'İadeye ayrılıyor…', remote: true, confirm: true, supervisor: true },
  extend: { label: 'Bekletmeyi 2 gün uzat', ing: 'Bekletme uzatılıyor…', remote: true, confirm: true },
};

/** Field task stages as shown on screen (D17, proposed). */
export const TASK_STAGE: Record<import('./types').TaskStage, string> = {
  requested: 'Talep edildi',
  accepted: 'Kabul edildi',
  onSite: 'Sahada',
  completed: 'Tamamlandı',
  cancelled: 'İptal edildi',
};

/** Simulated: field service accepts a request this long after it is sent (illustrative). */
export const TASK_ACCEPT_MS = 10_000;

/** Actions that act on a parcel and so also appear on the parcel page (product brief, View 3). */
export const PARCEL_ACTIONS: ActionId[] = ['retry', 'resend', 'other', 'markReturn', 'extend'];

/**
 * The proposed ranking rule, as shown on screen. It must stay in step with
 * derive() in engine.ts and the comparator in partition() in selectors.ts.
 */
export const RANKING_RULE = {
  lead: 'P1, P2, P3 aşağıdaki kurallara göre belirlenir.',
  bands: [
    {
      band: 'P1',
      text: 'Alıcı istasyonda bekliyor (teslim arızasından sonraki ilk 10 dk), son süre aşıldı ya da en fazla 30 dk kaldı veya teslim alma yapılamıyor ve 10 ya da daha fazla paket engelli.',
    },
    { band: 'P2', text: 'Teslim alma yapılamıyor, son süreye en fazla 2 sa kaldı veya en az 1 paket engelli.' },
    { band: 'P3', text: 'Geri kalan her şey. Teslim alma süresi dolan olaylar her zaman P3’tür.' },
  ],
  order:
    'P1 içinde: bekleyen alıcı 10 dk boyunca en öne geçer (temsilî), sonra son süresi en yakın olan, sonra en çok paketi engellenen gelir. P2 ve P3 içinde: önce son süresi en yakın, sonra en çok paketi engellenen.',
  summary: 'P1 içinde: bekleyen alıcı 10 dk öne geçer, sonra son süresi en yakın, sonra en çok paketi engellenen gelir.',
  note: 'Eşik değerleri temsilîdir.',
} as const;

/** Wording for "Next: …" after an action fails and the recommendation changes. */
export const NEXT_STEP: Partial<Record<ActionId, string>> = {
  requestField: 'saha ziyareti iste',
  oos: 'istasyonu hizmet dışı bırak',
  other: 'kodu başka kanaldan gönder',
  unreachable: 'ulaşılamadı olarak kapat',
};

export const LOCKED_TIP = 'Geri alınamaz: paket alıcının erişiminden çıkar. Süpervizör onayı gerekir.';

export const TOAST_MS = 6000;
export const TOAST_MAX = 3;
export const LOCAL_ACTION_MS = 700;
export const LOADING_MS = 700;
export const ROW_HIGHLIGHT_MS = 1600;
export const ROW_HIGHLIGHT_REDUCED_MS = 2000;
export const PHONE_MAX = 767;

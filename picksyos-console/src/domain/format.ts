export const MIN = 60_000;
export const DAY = 1440 * MIN;

const pad = (n: number) => String(n).padStart(2, '0');

export function hm(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "Today", "D+2", "D-1" relative to the anchor day. */
export function dayLabel(ms: number, anchor: number): string {
  const a = new Date(anchor);
  a.setHours(0, 0, 0, 0);
  const b = new Date(ms);
  b.setHours(0, 0, 0, 0);
  const k = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  return k === 0 ? 'Bugün' : k === -1 ? 'Dün' : k > 0 ? `+${k} gün` : `${-k} gün önce`;
}

const hmCompact = (m: number) => `${Math.floor(m / 60)} sa ${pad(m % 60)} dk`;

/** "1 sa 56 dk" or "22 dk": prose form (why lines). */
export function durTxt(m: number): string {
  return m >= 60 ? hmCompact(m) : `${m} dk`;
}

/** "1 sa 56 dk", "3 sa 00 dk" or "22 dk": compact form for countdowns. */
export function durShort(m: number): string {
  return m >= 60 ? hmCompact(m) : `${m} dk`;
}

/** "1 saat 56 dakika", "15 dakika", "2 saat": for screen readers. */
export function spokenDuration(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return `${r} dakika`;
  return r ? `${h} saat ${r} dakika` : `${h} saat`;
}

/** Mulberry32: deterministic seed data. */
export function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

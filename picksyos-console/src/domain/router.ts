import type { Band, IncidentType, QueueRoute, Route } from './types';

export const emptyQueue = (): QueueRoute => ({ view: 'queue', incident: null, type: [], band: [] });

/**
 * Hash routes:
 *   #/queue?incident=INC-101&type=offline,retrieval&band=P1
 *   #/stations/LIT-03?from=INC-102
 *   #/parcels/PCL-0412?from=INC-105
 *   #/ (or no hash): the case study, before the console
 */
export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const q = new URLSearchParams(qs || '');
  const seg = (path || '').split('/');
  if (!path && !qs) return { view: 'case' };
  if (seg[0] === 'stations' && seg[1]) return { view: 'station', id: seg[1], from: q.get('from') };
  if (seg[0] === 'parcels' && seg[1]) return { view: 'parcel', id: seg[1], from: q.get('from') };
  const list = (k: string) => (q.get(k) || '').split(',').filter(Boolean);
  return {
    view: 'queue',
    incident: q.get('incident'),
    type: list('type') as IncidentType[],
    band: list('band') as Band[],
  };
}

export function routeHash(r: Route): string {
  if (r.view === 'case') return '#/';
  if (r.view === 'station') return `#/stations/${r.id}${r.from ? '?from=' + r.from : ''}`;
  if (r.view === 'parcel') return `#/parcels/${r.id}${r.from ? '?from=' + r.from : ''}`;
  const p: string[] = [];
  if (r.incident) p.push('incident=' + r.incident);
  if (r.type.length) p.push('type=' + r.type.join(','));
  if (r.band.length) p.push('band=' + r.band.join(','));
  return '#/queue' + (p.length ? '?' + p.join('&') : '');
}

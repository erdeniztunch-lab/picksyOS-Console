import { headerSummary, queueModel } from '../domain/selectors';
import { useEngine } from '../EngineContext';
import { Button } from './Button';
import { Icon } from './Icon';
import { ConceptLabel, PriorityBadge } from './primitives';
import { RankingRule } from './RankingRule';

const KEYS: [string[], string][] = [
  [['↑', '↓'], 'kuyrukta gezin'],
  [['Enter'], 'olayı aç'],
  [['A'], 'üstlen'],
  [['R'], 'önerilen adımı çalıştır'],
  [['Esc'], 'onayı ya da paneli kapat'],
  [['g', 'q'], 'kuyruğa dön'],
];

/** "?" Help: the full ranking rule, legends and keys. Reference only; the working screens stay clean. */
export function HelpContent() {
  const e = useEngine();
  return (
    <div className="help">
      <section className="help__part" aria-labelledby="help-rank">
        <h3 id="help-rank" className="label-strong">
          Sıralama nasıl yapılır
        </h3>
        <RankingRule />
      </section>

      <section className="help__part" aria-labelledby="help-bands">
        <h3 id="help-bands" className="label-strong">
          Öncelik bantları
        </h3>
        <p className="help__row">
          <PriorityBadge band="P1" /> dolu
          <PriorityBadge band="P2" /> çerçeveli
          <PriorityBadge band="P3" /> ince çizgili
        </p>
        <p className="caption">Öncelik renkle değil ağırlıkla gösterilir; böylece durum renkleriyle karışmaz.</p>
      </section>

      <section className="help__part" aria-labelledby="help-keys">
        <h3 id="help-keys" className="label-strong">
          Klavye kısayolları
        </h3>
        <dl className="help__defs help__keys">
          {KEYS.map(([keys, what]) => (
            <div key={what}>
              <dt>
                {keys.map((k) => (
                  <kbd key={k}>{k}</kbd>
                ))}
              </dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
        <Button
          size={e.isPhone ? 'touch' : 'sm'}
          aria-pressed={e.ui.shortcuts}
          onClick={() => e.toggleShortcuts()}
        >
          Tek tuş kısayolları (A, R, g q): {e.ui.shortcuts ? 'açık' : 'kapalı'}
        </Button>
      </section>

      <section className="help__part" aria-labelledby="help-concept">
        <h3 id="help-concept" className="label-strong">
          Bu çalışma hakkında
        </h3>
        <p className="help__text">
          Delivery One ile bağlantısı olmayan, bağımsız bir konsept çalışması. İstasyonlar, paketler, sayılar, hedefler ve bekletme
          süreleri temsilîdir; sıralama kuralı, roller ve işlemler öneridir.
        </p>
        <dl className="help__defs">
          <div>
            <dt>
              <ConceptLabel kind="illustrative" />
            </dt>
            <dd>temsilî (gerçek olmayan) değer</dd>
          </div>
          <div>
            <dt>
              <ConceptLabel kind="proposed" />
            </dt>
            <dd>önerilen kural, rol veya işlem</dd>
          </div>
          <div>
            <dt>
              <ConceptLabel kind="demoControl" />
            </dt>
            <dd>simüle edilen olay</dd>
          </div>
        </dl>
      </section>

      <div className="help__foot">
        <Button size={e.isPhone ? 'touch' : 'sm'} onClick={() => e.startTour()}>
          Turu yeniden göster
        </Button>
      </div>
    </div>
  );
}

/** The detail pane while nothing is selected: one action, one status line. */
export function EmptyPane() {
  const e = useEngine();
  const top = queueModel(e).sections.find((s) => s.key === 'need')?.rows[0];
  const s = headerSummary(e);
  const total = Object.keys(e.db.stations).length;
  const fresh = total - s.offline - s.delayed;
  return (
    <div className="empty-pane">
      <h2 className="heading">Açık olay seçilmedi</h2>
      {top ? (
        <div className="empty-pane__start" data-tour="start">
          <Button variant="primary" onClick={() => e.select(top.id)} aria-describedby="empty-top">
            En üstteki olayı aç
          </Button>
          <span id="empty-top" className="empty-pane__top">
            <PriorityBadge band={top.band} />
            <span className="strong">{top.type}</span>
            <span className="mono muted">{top.station}</span>
          </span>
        </div>
      ) : (
        <p className="body-2 empty-pane__done">
          <Icon name="check" size={14} strokeWidth={2} className="empty__mark" />
          Tüm olaylar kapandı. Yeni olaylar kuyruğun en üstünde görünür.
        </p>
      )}
      <p className="empty-pane__status">
        {total} istasyon · {fresh} güncel · <span className="tone-err">{s.offline} çevrimdışı</span> · <span className="tone-unk">{s.delayed} sinyal gecikiyor</span>
      </p>
      <p className="caption">
        <kbd>↑</kbd> <kbd>↓</kbd> gezin · <kbd>Enter</kbd> aç · Tüm sıralama kuralı ve kısayollar Yardım’da.
      </p>
    </div>
  );
}

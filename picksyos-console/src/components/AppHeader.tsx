import { useEffect, useRef } from 'react';
import { TASK_STAGE } from '../domain/constants';
import { headerSummary } from '../domain/selectors';
import { useEngine } from '../EngineContext';
import { Icon } from './Icon';
import { HelpContent } from './Orientation';
import { usePopover } from './usePopover';
import { ConceptLabel, cx } from './primitives';

function useSummaryActions() {
  const e = useEngine();
  const offQueue = e.route.view !== 'queue';
  // On phone the panel replaces the queue, so a summary filter also closes the open incident.
  const sel = e.isPhone ? { incident: null } : {};
  return {
    offline: () => e.setQ({ type: ['offline'], band: [], ...sel }, offQueue),
    delayed: (id: string | null) => id && e.go('#/stations/' + id),
  };
}

function RoleSwitch({ touch }: { touch?: boolean }) {
  const e = useEngine();
  const role = e.ui.role;
  return (
    <div className="role">
      <div role="group" aria-label="Rol" className="segmented">
        {(['operator', 'supervisor'] as const).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={role === r}
            className={cx('segmented__btn', touch && 'segmented__btn--touch', role === r && 'is-on')}
            onClick={() => e.setRole(r)}
          >
            {r === 'operator' ? 'Operatör' : 'Süpervizör'}
          </button>
        ))}
      </div>
      <ConceptLabel kind="proposed" />
    </div>
  );
}

function DemoItems({ touch }: { touch?: boolean }) {
  const e = useEngine();
  const ui = e.ui;
  const close = () => e.setUi({ demoOpen: false, menuOpen: false });
  const open = e.incidents().filter((i) => i.task);
  const items: { label: string; sub: string; disabled: boolean; run: () => void }[] = [];
  open.forEach((i) => {
    const t = i.task!;
    const next = t.status === 'accepted' ? 'Sahada' : t.status === 'onSite' ? 'Tamamlandı' : null;
    items.push({
      label: `Saha görevini ilerlet · ${i.id}`,
      sub: next ? `${t.id}: ${TASK_STAGE[t.status]} → ${next}${t.status === 'onSite' ? '. Olayı kapatır.' : ''}` : `${t.id}: saha ekibinin kabulü bekleniyor.`,
      disabled: !next,
      run: () => {
        close();
        e.advanceTask(i.id);
      },
    });
  });
  if (!open.length) items.push({ label: 'Saha görevini ilerlet', sub: 'Açık saha görevi yok.', disabled: true, run: () => {} });
  items.push({
    label: e.db.stress ? 'Yük testi açık' : 'Yük testi',
    sub: e.db.stress ? '40 temsilî olay eklendi. Sıfırla bunları kaldırır.' : '40 temsilî olay ekler.',
    disabled: e.db.stress,
    run: () => {
      e.stress();
      close();
    },
  });
  items.push({
    label: ui.failNext ? 'Sonraki gönderim başarısız olacak' : 'Sonraki gönderimi başarısız yap',
    sub: ui.failNext ? 'Görmek için herhangi bir işlem çalıştırın.' : '“Gönderilemedi. Hiçbir şey değişmedi.” durumunu bir kez gösterir.',
    disabled: ui.failNext,
    run: () => e.setUi({ failNext: true, demoOpen: false, menuOpen: false }),
  });
  items.push({ label: 'Sıfırla', sub: 'Başlangıç verisini ve 14:00 saatini geri yükler.', disabled: false, run: () => e.reset(false) });

  return (
    <div className="demo">
      <div className="demo__head">
        <span className="label">Simüle olaylar</span>
        <ConceptLabel kind="demoControl" />
      </div>
      {items.map((it) => (
        <button
          key={it.label}
          type="button"
          className={cx('demo__item', touch && 'demo__item--touch')}
          aria-disabled={it.disabled || undefined}
          onClick={() => !it.disabled && it.run()}
        >
          <span className="demo__label">{it.label}</span>
          <span className="demo__sub">{it.sub}</span>
        </button>
      ))}
    </div>
  );
}

/** Desktop Help: the full ranking rule, legends and keys, out of the working screens. */
function HelpMenu() {
  const e = useEngine();
  const open = e.ui.helpOpen;
  const { wrap, trigger, onBlur } = usePopover(open, () => e.setUi({ helpOpen: false }));
  return (
    <div className="demo-menu" ref={wrap} onBlur={onBlur}>
      <button
        ref={trigger}
        type="button"
        className="pill-btn"
        aria-expanded={open}
        aria-controls={open ? 'help-panel' : undefined}
        onClick={() => e.setUi({ helpOpen: !open, demoOpen: false })}
      >
        Yardım
      </button>
      {open && (
        <div id="help-panel" className="popover popover--help">
          <HelpContent />
        </div>
      )}
    </div>
  );
}

/** Desktop: one menu for everything that belongs to the concept rather than the operator's work. */
function ConceptMenu() {
  const e = useEngine();
  const open = e.ui.demoOpen;
  const { wrap, trigger, onBlur } = usePopover(open, () => e.setUi({ demoOpen: false }));
  const themeLabel = e.ui.theme === 'dark' ? 'Açık tema' : 'Koyu tema';
  return (
    <div className="demo-menu" ref={wrap} onBlur={onBlur}>
      <button
        ref={trigger}
        type="button"
        className="pill-btn pill-btn--strong"
        aria-expanded={open}
        aria-controls={open ? 'concept-controls' : undefined}
        onClick={() => e.setUi({ demoOpen: !open })}
      >
        Demo kontrolleri
        <Icon name="chevDown" size={10} />
      </button>
      {open && (
        <div id="concept-controls" className="popover">
          <ConceptControls themeLabel={themeLabel} />
        </div>
      )}
    </div>
  );
}

function ConceptControls({ themeLabel, touch }: { themeLabel: string; touch?: boolean }) {
  const e = useEngine();
  return (
    <div className="concept-controls">
      <div className="concept-controls__row">
        <span className="label">Rol</span>
        <RoleSwitch touch={touch} />
      </div>
      <div className="concept-controls__row">
        <span className="label">Tema</span>
        <button type="button" className={cx('pill-btn', touch && 'pill-btn--touch')} onClick={() => e.toggleTheme()}>
          {themeLabel}
        </button>
      </div>
      <DemoItems touch={touch} />
    </div>
  );
}

export function AppHeader() {
  const e = useEngine();
  // Phone menu: give focus back to its button when Esc closes it.
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const menuWasOpen = useRef(e.ui.menuOpen);
  useEffect(() => {
    const a = document.activeElement;
    if (menuWasOpen.current && !e.ui.menuOpen && (!a || a === document.body)) menuTrigger.current?.focus({ preventScroll: true });
    menuWasOpen.current = e.ui.menuOpen;
  }, [e.ui.menuOpen]);
  const s = headerSummary(e);
  const act = useSummaryActions();
  const themeLabel = e.ui.theme === 'dark' ? 'Açık tema' : 'Koyu tema';

  if (e.isPhone) {
    const open = e.ui.menuOpen;
    const help = e.ui.helpOpen;
    return (
      <header className="hdr hdr--phone">
        <div className="hdr__bar">
          <a href="#/queue" className="brand brand--sm" aria-label="PicksyOS Operations Console, kuyruk">
            PicksyOS<span className="brand__dot">.</span>
          </a>
          <button type="button" className="link-btn hdr__help-link" aria-expanded={help} aria-controls="phone-help" onClick={() => e.setUi({ helpOpen: !help, menuOpen: false })}>
            {help ? 'Yardımı kapat' : 'Yardım'}
          </button>
          <span className="mono hdr__clock" title="Demo saati">
            {s.clock}
          </span>
          <button
            ref={menuTrigger}
            type="button"
            className="icon-btn"
            aria-expanded={open}
            aria-label="Demo kontrolleri: rol, tema ve simülasyonlar"
            onClick={() => e.setUi({ menuOpen: !open })}
          >
            <Icon name={open ? 'close' : 'more'} size={16} strokeWidth={1.8} />
          </button>
        </div>
        <nav aria-label="Ağ durumu" className="sum-grid">
          <button type="button" className="sum-grid__cell sum-grid__err" onClick={act.offline}>
            <span className="sum-grid__word">
              <Icon name="x" size={11} />
              Çevrimdışı
            </span>
            <span className="mono">{s.offline}</span>
          </button>
          <button type="button" className="sum-grid__cell sum-grid__unk" onClick={() => act.delayed(s.firstDelayed)}>
            <span className="sum-grid__word">
              <Icon name="clock" size={11} />
              Gecikiyor
            </span>
            <span className="mono">{s.delayed}</span>
          </button>
        </nav>
        {help && (
          <div id="phone-help" className="hdr__help">
            <HelpContent />
          </div>
        )}
        {open && (
          <div className="hdr__menu" id="concept-controls">
            <h2 className="label-strong">Demo kontrolleri</h2>
            <ConceptControls themeLabel={themeLabel} touch />
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="hdr hdr--desk">
      <a href="#/queue" className="brand">
        PicksyOS Operations Console<span className="brand__dot">.</span>
      </a>
      <nav aria-label="Ağ durumu" className="sum">
        <button type="button" className="sum__btn sum__btn--err" title="Filtre: İstasyon çevrimdışı" onClick={act.offline}>
          <Icon name="x" size={12} />
          <span className="sum__txt">
            Çevrimdışı <span className="mono">{s.offline}</span>
          </span>
        </button>
        <button type="button" className="sum__btn sum__btn--unk" title="Sinyali geciken istasyonu aç" onClick={() => act.delayed(s.firstDelayed)}>
          <Icon name="clock" size={12} />
          <span className="sum__txt">
            Sinyal gecikiyor <span className="mono">{s.delayed}</span>
          </span>
        </button>
      </nav>
      <div className="hdr__tools">
        <span className="mono hdr__clock" title="Demo saati">
          {s.clock}
        </span>
        {e.ui.role === 'supervisor' && <span className="owner-chip">Süpervizör modu</span>}
        <HelpMenu />
        <ConceptMenu />
      </div>
    </header>
  );
}

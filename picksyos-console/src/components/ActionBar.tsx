import { useEffect, useRef, useState } from 'react';
import { LOCKED_TIP } from '../domain/constants';
import type { PendingView, ResultView } from '../domain/selectors';
import type { ActionId, ActionView } from '../domain/types';
import { useEngine } from '../EngineContext';
import { Button, type ButtonState } from './Button';
import { Icon, type IconName } from './Icon';

function actionState(a: ActionView): ButtonState {
  if (a.busy) return 'processing';
  if (a.locked) return 'locked';
  if (a.disabled) return 'disabled';
  return 'idle';
}

export function ActionButton({ a, touch, shortcut }: { a: ActionView; touch: boolean; shortcut?: string }) {
  const engine = useEngine();
  const tipId = `tip-${a.key}-${a.aid}`;
  const reasonId = `reason-${a.key}-${a.aid}`;
  return (
    <div className="action">
      <Button
        variant={a.primary ? 'primary' : 'secondary'}
        size={touch ? 'touch' : 'md'}
        state={actionState(a)}
        onClick={() => engine.clickAction(a)}
        title={shortcut ? `Kısayol: ${shortcut}` : undefined}
        aria-keyshortcuts={shortcut}
        data-tour={a.primary ? 'next-step' : undefined}
        onMouseEnter={() => engine.showTip(a, true)}
        onMouseLeave={() => engine.showTip(a, false)}
        onFocus={() => engine.showTip(a, true)}
        onBlur={() => engine.showTip(a, false)}
        aria-describedby={[a.reason && reasonId, a.tipOpen && tipId].filter(Boolean).join(' ') || undefined}
      >
        {a.label}
      </Button>
      {a.reason && (
        <span id={reasonId} className="action__reason">
          {a.reason}
        </span>
      )}
      {a.tipOpen && (
        <span id={tipId} role="tooltip" className="tooltip tooltip--below">
          {LOCKED_TIP}
        </span>
      )}
    </div>
  );
}

/** Focus the element on mount; on unmount, give focus back to whatever had it (the action that opened the confirm). */
function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  // Captured once at first render, before focus moves (StrictMode re-runs effects in development).
  const [prev] = useState(() => document.activeElement as HTMLElement | null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    return () => {
      const a = document.activeElement;
      if (prev && prev !== ref.current && prev.isConnected && (!a || a === document.body || !a.isConnected)) prev.focus({ preventScroll: true });
    };
  }, [prev]);
  return ref;
}

export function InlineConfirm({ p, touch }: { p: Extract<PendingView, { mode: 'confirm' }>; touch: boolean }) {
  const engine = useEngine();
  const ref = useAutoFocus<HTMLButtonElement>();
  return (
    <div role="group" aria-label={`Onay: ${p.title}`} className="confirm">
      <span className="label">Onay · {p.title}</span>
      <div className="confirm__scroll">
        {p.summary.length > 0 && (
          <dl className="confirm__summary">
            {p.summary.map((r) => (
              <div key={r.k}>
                <dt className="label">{r.k}</dt>
                <dd className={r.tone === 'err' ? 'tone-err' : undefined}>{r.v}</dd>
              </div>
            ))}
          </dl>
        )}
        <span className="confirm__text">{p.text}</span>
        {(p.needsNote || p.optionalNote) && (
          <label className="field">
            {p.noteLabel}
            <textarea
              rows={2}
              value={p.note}
              aria-required={p.needsNote ? 'true' : undefined}
              aria-describedby={p.disabled ? 'confirm-note-reason' : undefined}
              onChange={(ev) => engine.setUi({ note: ev.target.value })}
            />
          </label>
        )}
      </div>
      <div className="confirm__row">
        <Button
          ref={ref}
          variant="ink"
          size={touch ? 'touch' : 'md'}
          state={p.disabled ? 'disabled' : 'idle'}
          className="btn--confirm"
          aria-describedby={p.disabled ? 'confirm-note-reason' : undefined}
          onClick={() => engine.confirmPending()}
        >
          {p.confirmLabel}
        </Button>
        <Button variant="quiet" size={touch ? 'touch' : 'md'} onClick={() => engine.cancelPending()}>
          Vazgeç
        </Button>
        <span className="hint">Esc ile vazgeç</span>
      </div>
      {p.disabled && p.needsNote && (
        <span id="confirm-note-reason" className="action__reason">
          {p.noteHint}
        </span>
      )}
    </div>
  );
}

function OwnerConfirm({ text, touch }: { text: string; touch: boolean }) {
  const engine = useEngine();
  const ref = useAutoFocus<HTMLButtonElement>();
  return (
    <div role="group" aria-label="Devral" className="notice notice--ownership">
      <span className="notice__text">{text}</span>
      <div className="confirm__row">
        <Button ref={ref} variant="ink" size={touch ? 'touch' : 'md'} className="btn--confirm" onClick={() => engine.takeOverPending()}>
          Devral ve devam et
        </Button>
        <Button variant="quiet" size={touch ? 'touch' : 'md'} onClick={() => engine.cancelPending()}>
          Vazgeç
        </Button>
      </div>
    </div>
  );
}

interface ActionBarProps {
  actions: ActionView[];
  pending: PendingView | null;
  touch: boolean;
  /** Phone incident page: primary action plus a "More actions" toggle. */
  collapsible?: boolean;
  /** The recommended action, which R runs from the keyboard. */
  shortcutFor?: ActionId | null;
}

export function ActionBar({ actions, pending, touch, collapsible, shortcutFor }: ActionBarProps) {
  const [more, setMore] = useState(false);
  const running = actions.some((a) => a.busy);
  const primaryIdx = Math.max(0, actions.findIndex((a) => a.primary));
  const collapse = collapsible && actions.length > 1;
  const shown = collapse && !more ? [actions[primaryIdx]] : actions;
  return (
    <>
      {actions.length > 0 && (
        <div className={collapse ? 'actions actions--phone' : 'actions'}>
          {shown.map((a) => (
            <ActionButton key={a.aid} a={a} touch={touch} shortcut={shortcutFor === a.aid && !a.disabled ? 'R' : undefined} />
          ))}
          {collapse && (
            <button
              type="button"
              className="btn btn--secondary btn--touch btn--icon"
              aria-expanded={more}
              aria-label={more ? 'Daha az işlem' : 'Diğer işlemler'}
              onClick={() => setMore(!more)}
            >
              <Icon name={more ? 'close' : 'more'} size={16} strokeWidth={1.8} />
            </button>
          )}
        </div>
      )}
      {running && <span className="hint-text">İşlem sürüyor. Diğer işlemler bekletiliyor.</span>}
      {pending?.mode === 'owner' && <OwnerConfirm text={pending.text} touch={touch} />}
      {pending?.mode === 'confirm' && <InlineConfirm key={`${pending.key}:${pending.title}`} p={pending} touch={touch} />}
    </>
  );
}

const RESULT_STYLE: Record<ResultView['kind'], { icon: IconName; role: 'status' | 'alert' }> = {
  success: { icon: 'check', role: 'status' },
  failure: { icon: 'x', role: 'alert' },
  info: { icon: 'ack', role: 'status' },
  submitFailed: { icon: 'tri', role: 'alert' },
};

/**
 * Inline result. An action failure points forward to the new recommendation, so Retry is a
 * quiet link; a submit failure ("Nothing changed") keeps Retry as its button.
 */
export function ResultNotice({ r }: { r: ResultView }) {
  const engine = useEngine();
  const s = RESULT_STYLE[r.kind];
  const retry = () => engine.act(r.key, r.retry!);
  return (
    <div role={s.role} className={`notice notice--${r.kind}`}>
      <Icon name={s.icon} size={14} strokeWidth={1.6} className="notice__icon" />
      <span className="notice__text">
        {r.text}
        {r.next && <strong className="notice__next"> {r.next}</strong>}
        {r.reveal && (
          <>
            {' '}
            “Bugün kapananlar” listesine taşındı.{' '}
            <button type="button" className="link-btn notice__link" onClick={() => engine.revealResolved(r.key)}>
              Kuyrukta göster
            </button>
          </>
        )}
      </span>
      {r.retryStyle === 'button' && (
        <button type="button" className="btn btn--sm btn--retry" onClick={retry}>
          Yeniden dene
        </button>
      )}
      {r.retryStyle === 'link' && (
        <button type="button" className="link-btn notice__retry" onClick={retry}>
          Yeniden dene
        </button>
      )}
    </div>
  );
}

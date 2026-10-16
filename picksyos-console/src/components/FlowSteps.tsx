import type { FlowState, FlowStep } from '../domain/selectors';
import { Icon, type IconName } from './Icon';
import { cx } from './primitives';

// Shape carries the state as well as hue, and screen readers get the word.
const NODE: Record<FlowState, IconName | null> = { done: 'check', current: 'dot', running: 'spin', todo: null, skip: null };
const WORD: Record<FlowState, string> = {
  done: 'tamamlandı',
  current: 'şu anki adım',
  running: 'sürüyor',
  todo: 'sırada',
  skip: 'gerekmedi',
};

/** Where this incident is in the work: Tespit → Sahiplen → Aksiyon → Sonuç → Kapandı. Derived from status only. */
export function FlowSteps({ steps, label = 'Olay akışı' }: { steps: FlowStep[]; label?: string }) {
  const now = steps.find((s) => s.state === 'current' || s.state === 'running');
  return (
    <>
    <ol className="flow" aria-label={label} style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s) => {
        const icon = NODE[s.state];
        const here = s.state === 'current' || s.state === 'running';
        return (
          <li key={s.key} className={cx('flow__step', `flow__step--${s.state}`)} aria-current={here ? 'step' : undefined}>
            <span className="flow__node" aria-hidden="true">
              {icon && <Icon name={icon} size={12} strokeWidth={1.8} className={s.state === 'running' ? 'icon--spin' : undefined} />}
            </span>
            <span className="flow__label">{s.label}</span>
            {s.sub && <span className={cx('flow__sub', s.failed && 'flow__sub--err')}>{s.sub}</span>}
            <span className="sr-only">, {WORD[s.state]}</span>
          </li>
        );
      })}
    </ol>
    {/* Narrow cards: the step sub-lines would be cut, so the current step reads as one line instead. */}
    {now?.sub && (
      <p className={cx('flow__now', now.failed && 'flow__now--err')} aria-hidden="true">
        {now.label}: {now.sub}
      </p>
    )}
    </>
  );
}

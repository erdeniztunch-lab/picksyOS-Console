import type { TaskView } from '../domain/selectors';
import type { TaskStage } from '../domain/types';
import { ActionBar } from './ActionBar';
import { FlowSteps } from './FlowSteps';
import type { IconName } from './Icon';
import { Chip, DeadlineBar, DeadlineCountdown, type Tone } from './primitives';

const STAGE_CHIP: Record<TaskStage, { tone: Tone; icon: IconName }> = {
  requested: { tone: 'info', icon: 'clock' },
  accepted: { tone: 'info', icon: 'ack' },
  onSite: { tone: 'info', icon: 'pin' },
  completed: { tone: 'ok', icon: 'check' },
  cancelled: { tone: 'neutral', icon: 'slash' },
};

/**
 * The field visit as a work item inside the decision card: its stage, its due time (same countdown
 * and bar as the incident deadline), who asked, and the one way to withdraw it. No lime here.
 */
export function TaskCard({ t, touch }: { t: TaskView; touch: boolean }) {
  const chip = STAGE_CHIP[t.stage];
  return (
    <section className="task" aria-labelledby={`task-${t.id}`}>
      <div className="task__head">
        <h3 id={`task-${t.id}`} className="task__title">
          Saha görevi <span className="mono">{t.id}</span>
        </h3>
        <Chip tone={chip.tone} icon={chip.icon}>
          {t.stageLabel}
        </Chip>
      </div>
      <FlowSteps steps={t.stages} label={`${t.id} aşamaları`} />
      {t.recovered ? (
        <p className="task__prompt">İstasyon kendiliğinden düzeldi. Saha ziyareti iptal edilsin mi?</p>
      ) : (
        <div className="fact fact--deadline task__deadline">
          <span className="label">{t.deadline.k}</span>
          <DeadlineCountdown value={t.deadline.countdown} size="lg" />
          <DeadlineBar bar={t.deadline.bar} />
        </div>
      )}
      <dl className="task__meta">
        <div>
          <dt className="label">Talep eden</dt>
          <dd>{t.requested}</dd>
        </div>
        {t.note && (
          <div>
            <dt className="label">Not</dt>
            <dd>{t.note}</dd>
          </div>
        )}
      </dl>
      {!t.recovered && <p className="task__hint">Sizden işlem gerekmiyor. Saha ekibinin ilerlemesi burada görünür.</p>}
      {(t.actions.length > 0 || t.pending) && <ActionBar actions={t.actions} pending={t.pending} touch={touch} />}
    </section>
  );
}

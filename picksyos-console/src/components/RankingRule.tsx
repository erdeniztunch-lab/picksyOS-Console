import { RANKING_RULE } from '../domain/constants';
import { ConceptLabel, PriorityBadge } from './primitives';

/** The proposed ranking rule, rendered from RANKING_RULE so every place shows the same text. */
export function RankingRule() {
  return (
    <div className="rule">
      <p className="rule__lead">
        {RANKING_RULE.lead} <ConceptLabel kind="proposed" text="Önerilen kural" />
      </p>
      <dl className="rule__bands">
        {RANKING_RULE.bands.map((b) => (
          <div key={b.band} className="rule__band">
            <dt>
              <PriorityBadge band={b.band} />
            </dt>
            <dd>{b.text}</dd>
          </div>
        ))}
      </dl>
      <p className="rule__order">{RANKING_RULE.order}</p>
      <p className="caption">{RANKING_RULE.note}</p>
    </div>
  );
}

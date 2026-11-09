import type { Stage, PipelineContext } from '../core/index.js';
import type { BorrowerRiskEvent, BorrowerRiskState } from '../types.js';
import type { EmiEventStore } from '../event-store.js';

export function createProjectStateStage(store: EmiEventStore): Stage<BorrowerRiskEvent, BorrowerRiskState> {
  return {
    id: 'project-risk-state',
    name: 'CQRS Materialized Risk Projection',
    description: 'Updates borrower risk state and triggers portfolio threshold alerts',
    async run(input: BorrowerRiskEvent, ctx: PipelineContext): Promise<BorrowerRiskState> {
      const state = store.recordEvent(input);

      ctx.logger.info(`Updated risk state for borrower ${state.borrowerId}: status=${state.status}`, {
        score: state.cumulativeRiskScore,
        defaultProb: state.defaultProbability,
      });

      return state;
    },
  };
}

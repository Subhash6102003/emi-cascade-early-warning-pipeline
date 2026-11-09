import { Pipeline } from './core/index.js';
import type { BorrowerRiskEvent, BorrowerRiskState } from './types.js';
import { EmiEventStore } from './event-store.js';
import { createIngestStage } from './stages/ingest-event.js';
import { createProjectStateStage } from './stages/project-state.js';
import type { Stage, PipelineResult } from './core/index.js';

export function createEmiPipeline(store: EmiEventStore) {
  const pipeline = new Pipeline<BorrowerRiskEvent, BorrowerRiskState>('emi-early-warning');

  const stages: Stage<unknown, unknown>[] = [
    createIngestStage(store) as Stage<unknown, unknown>,
    createProjectStateStage(store) as Stage<unknown, unknown>,
  ];

  return {
    async ingestSignal(event: BorrowerRiskEvent): Promise<PipelineResult<BorrowerRiskState>> {
      return pipeline.run(stages, event);
    },
    store,
  };
}

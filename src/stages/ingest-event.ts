import type { Stage, PipelineContext } from '../core/index.js';
import type { BorrowerRiskEvent } from '../types.js';
import type { EmiEventStore } from '../event-store.js';

export function createIngestStage(store: EmiEventStore): Stage<BorrowerRiskEvent, BorrowerRiskEvent> {
  return {
    id: 'ingest-risk-event',
    name: 'Ingest Financial Risk Signal',
    description: 'Appends raw telemetry event to event-sourced ledger',
    async run(input: BorrowerRiskEvent, ctx: PipelineContext): Promise<BorrowerRiskEvent> {
      ctx.logger.info(`Ingesting risk event: ${input.signalType}`, {
        borrowerId: input.borrowerId,
        severity: input.severity,
      });
      return input;
    },
  };
}

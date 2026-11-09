import { describe, it, expect, beforeEach } from 'vitest';
import { EmiEventStore } from '../src/event-store.js';
import { createEmiPipeline } from '../src/pipeline.js';
import type { BorrowerRiskEvent } from '../src/types.js';

describe('B2 — EMI Cascade Early Warning Pipeline', () => {
  let store: EmiEventStore;
  let pipeline: ReturnType<typeof createEmiPipeline>;

  beforeEach(() => {
    store = new EmiEventStore();
    store.setPortfolioBase(100000); // ₹100,000 monthly EMI portfolio
    pipeline = createEmiPipeline(store);
  });

  const makeEvent = (borrowerId: string, signalType: BorrowerRiskEvent['signalType'], severity: number): BorrowerRiskEvent => ({
    eventId: `evt-${Math.random()}`,
    borrowerId,
    loanId: `loan-${borrowerId}`,
    monthlyEmiAmount: 15000,
    signalType,
    severity,
    timestamp: Date.now(),
  });

  it('keeps borrower HEALTHY on single mild signal', async () => {
    const res = await pipeline.ingestSignal(makeEvent('borr-1', 'BALANCE_DROP_SHARP', 2));
    expect(res.status).toBe('success');
    expect(res.output?.status).toBe('HEALTHY');
  });

  it('elevates borrower to WATCHLIST then CRITICAL_RISK as signals compound', async () => {
    // 1st signal: moderate
    const res1 = await pipeline.ingestSignal(makeEvent('borr-2', 'SALARY_DELAYED', 4));
    expect(res1.output?.status).toBe('WATCHLIST');

    // 2nd signal: severe
    const res2 = await pipeline.ingestSignal(makeEvent('borr-2', 'OVERDRAFT_HIT', 6));
    expect(res2.output?.status).toBe('CRITICAL_RISK');
    expect(res2.output?.defaultProbability).toBeGreaterThan(0.6);
  });

  it('triggers portfolio ACTION_REQUIRED when multiple borrowers cascade into critical risk', async () => {
    // Ingest critical events for 6 borrowers
    for (let i = 1; i <= 6; i++) {
      await pipeline.ingestSignal(makeEvent(`borr-cluster-${i}`, 'SALARY_DELAYED', 8));
    }

    const projection = store.getProjection();
    expect(projection.criticalBorrowerCount).toBe(6);
    expect(projection.liquidityBufferHealth).toBe('ACTION_REQUIRED');
  });

  it('recovers borrower score when REGULAR_CREDIT event arrives', async () => {
    await pipeline.ingestSignal(makeEvent('borr-3', 'SALARY_DELAYED', 4)); // Watchlist
    const recovered = await pipeline.ingestSignal(makeEvent('borr-3', 'REGULAR_CREDIT', 1));
    expect(recovered.output?.cumulativeRiskScore).toBeLessThan(25);
    expect(recovered.output?.status).toBe('HEALTHY');
  });
});

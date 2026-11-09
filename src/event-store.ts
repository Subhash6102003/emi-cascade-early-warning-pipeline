import type { BorrowerRiskEvent, BorrowerRiskState, PortfolioProjection } from './types.js';

export class EmiEventStore {
  // Append-only event log
  private eventLog: BorrowerRiskEvent[] = [];

  // Materialized CQRS Read Models
  private borrowerProjections = new Map<string, BorrowerRiskState>();
  private totalMonthlyEmiBook = 0;

  recordEvent(event: BorrowerRiskEvent): BorrowerRiskState {
    this.eventLog.push({ ...event });

    const current = this.borrowerProjections.get(event.borrowerId) ?? {
      borrowerId: event.borrowerId,
      cumulativeRiskScore: 0,
      defaultProbability: 0.05,
      lastSignalTime: event.timestamp,
      status: 'HEALTHY',
    };

    // Calculate score increment based on event severity
    if (event.signalType === 'REGULAR_CREDIT') {
      current.cumulativeRiskScore = Math.max(0, current.cumulativeRiskScore - 15);
    } else {
      current.cumulativeRiskScore = Math.min(100, current.cumulativeRiskScore + event.severity * 8);
    }

    current.defaultProbability = Number((current.cumulativeRiskScore / 100).toFixed(2));
    current.lastSignalTime = event.timestamp;

    if (current.cumulativeRiskScore >= 60) {
      current.status = 'CRITICAL_RISK';
    } else if (current.cumulativeRiskScore >= 25) {
      current.status = 'WATCHLIST';
    } else {
      current.status = 'HEALTHY';
    }

    this.borrowerProjections.set(event.borrowerId, current);
    return { ...current };
  }

  setPortfolioBase(totalEmiBook: number): void {
    this.totalMonthlyEmiBook = totalEmiBook;
  }

  getProjection(): PortfolioProjection {
    let parAmount = 0;
    let criticalCount = 0;

    for (const borrower of this.borrowerProjections.values()) {
      if (borrower.status === 'CRITICAL_RISK') {
        criticalCount++;
        parAmount += 15000; // Average ₹15k EMI proxy per critical borrower
      }
    }

    const parRatio = this.totalMonthlyEmiBook > 0 ? parAmount / this.totalMonthlyEmiBook : 0;

    let bufferHealth: PortfolioProjection['liquidityBufferHealth'] = 'NORMAL';
    if (parRatio > 0.25 || criticalCount > 5) {
      bufferHealth = 'ACTION_REQUIRED';
    } else if (parRatio > 0.1 || criticalCount > 2) {
      bufferHealth = 'ELEVATED_RISK';
    }

    return {
      totalExposure: this.totalMonthlyEmiBook,
      portfolioAtRisk: parAmount,
      criticalBorrowerCount: criticalCount,
      liquidityBufferHealth: bufferHealth,
    };
  }

  getEvents(): readonly BorrowerRiskEvent[] {
    return this.eventLog;
  }

  clear(): void {
    this.eventLog = [];
    this.borrowerProjections.clear();
  }
}

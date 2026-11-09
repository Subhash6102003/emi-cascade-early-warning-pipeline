export type RiskSignalType =
  | 'SALARY_DELAYED'
  | 'BALANCE_DROP_SHARP'
  | 'DISCRETIONARY_SPEND_HALTED'
  | 'OVERDRAFT_HIT'
  | 'REGULAR_CREDIT';

export interface BorrowerRiskEvent {
  eventId: string;
  borrowerId: string;
  loanId: string;
  monthlyEmiAmount: number;
  signalType: RiskSignalType;
  severity: number; // 1 (mild) to 10 (critical)
  timestamp: number;
}

export interface BorrowerRiskState {
  borrowerId: string;
  cumulativeRiskScore: number; // 0 - 100
  defaultProbability: number;
  lastSignalTime: number;
  status: 'HEALTHY' | 'WATCHLIST' | 'CRITICAL_RISK';
}

export interface PortfolioProjection {
  totalExposure: number;
  portfolioAtRisk: number; // PAR amount in ₹
  criticalBorrowerCount: number;
  liquidityBufferHealth: 'NORMAL' | 'ELEVATED_RISK' | 'ACTION_REQUIRED';
}

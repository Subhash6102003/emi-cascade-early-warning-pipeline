# B2 — EMI Cascade Failure: Architecture

## Problem

A sudden macroeconomic or sectoral shock (e.g. tech layoff or supply disruption) causes thousands of borrowers to default on monthly EMI payments on the same day.
Small/mid-tier NBFCs typically discover this 30 days later when the bank debit bounces, resulting in liquidity crises where the NBFC cannot fulfill its own credit obligations.

## Solution Architecture: Event Sourcing + Streaming CQRS Early-Warning Projection

```
Daily Banking Signals (Salary credits, balance velocity, discretionary spend)
             ↓
[1. Event Sourcing Ingestion]  → Append-only immutable stream of borrower events
             ↓
[2. CQRS Materialized View]    → Real-time calculation of Portfolio At Risk (PAR)
             ↓
[3. Early-Warning Triggers]    → Automatically alerts risk officers 25 days before default cliff
```

### Guarantees
- Zero data loss via immutable event stream.
- Sub-second portfolio risk recalculation without full table table scans.
- Tiered automated interventions (re-structuring offers, emergency liquidity reserve drawdowns).

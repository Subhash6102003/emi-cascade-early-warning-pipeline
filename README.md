# EMI Default Wave Early Warning & CQRS Streaming Pipeline

> Event-sourced borrower telemetry and CQRS real-time Portfolio At Risk (PAR) projection to detect systemic default waves 25 days before bank bounces.

**Domain:** Banking & Credit Risk Management  
**Architecture Pattern:** Typed Stage-based Pipeline DAG with Sagas & State Machine  

---

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


---

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 22.0.0
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/systemflow-b2-emi-cascade.git
cd systemflow-b2-emi-cascade

# Install dependencies
npm install
```

### Running Tests & Typechecks

```bash
# Run the complete test suite (includes race condition & concurrency tests)
npm test

# Build production TypeScript output
npm run build

# Run typechecker
npm run typecheck
```

---

## 🏛️ Pipeline DAG Architecture

All pipeline stages are type-safe and execute in ordered succession. If any stage throws a transient error, compensating saga rollbacks run in reverse order to ensure 100% data consistency.

```
src/
├── core/                  # Embedded zero-dependency Pipeline Engine & Saga Rollback
│   ├── pipeline.ts
│   ├── types.ts
│   ├── logger.ts
│   └── errors.ts
├── stages/                # Modular pipeline stages
├── pipeline.ts            # Stage assembly & DAG orchestrator
├── types.ts               # Domain interfaces & state contracts
└── index.ts               # Public library API export
```

---

## 🚀 GitHub Actions CI

Every commit and pull request runs automated build, typecheck, and vitest race condition tests via `.github/workflows/ci.yml`.

## 📄 License
MIT

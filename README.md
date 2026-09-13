# Vouch — Verified Skill Identity, Hackathon Team Formation & Campus Recruitment

Vouch replaces inflated resume claims with standardized assessment integrity, normalized code evidence, and explainable compatibility matching for hackathon teams and campus recruitment.

---

## Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the application.

### 2. Run Tests & Linter
```bash
# Run unit & integration tests
npm run test

# Run ESLint check
npm run lint

# Validate full production build
npm run build
```

---

## Demo Personas & Dataset

The application is pre-populated with realistic demo data accessible directly from the login page or in-app persona switcher:

1. **Arjun Verma** (`candidate`):
   - IIT Bombay, Computer Science & Engineering.
   - Verified Skills: React (88%), TypeScript (82%).
   - Unverified Claims: Rust, Docker.
   - Evidence: GitHub projects (HyperQueue, FiberProfiler), AWS Developer certificate.
2. **Rohan Kulkarni** (`team_leader`):
   - BITS Pilani. Leading Team **NeuralMesh** for ETHGlobal.
   - Verified Skills: Python (90%), SQL (82%).
3. **Sneha Patel** (`recruiter`):
   - Stanford University. Technical Talent Partner at Stripe.
   - Managing frontend systems campus recruitment drive.
4. **Priya Sundaram** (`candidate`):
   - PES University Bengaluru, Data Science.
   - Verified Skills: Python (84%), SQL (78%).
   - Leader of Team **OmniChain Labs** for PennApps.

### Hackathon Teams with Intentional Gaps
- **Team 1: NeuralMesh** (ETHGlobal New York) — Missing **Solidity / Smart Contracts** architect.
- **Team 2: SentinelGuard** (HackMIT 2024) — Missing **PyTorch / ML** engineer.
- **Team 3: OmniChain Labs** (PennApps XXV) — Missing **Frontend Lead (React/Next.js)**.

### Campus Recruitment Drives & Tiered Benchmarks
- **Stripe** (Frontend Systems Engineer): React ≥ 75%, TypeScript ≥ 70%, SQL ≥ 65%.
- **Datadog** (Distributed Systems Engineer): Go ≥ 80%, Docker ≥ 75%, Linux ≥ 70%.

---

## Database Seeding & Production Guard

The repository provides two methods for seeding the database:

### Option A: Direct SQL Import (`scripts/seed.sql`)
Import [`scripts/seed.sql`](scripts/seed.sql) into your local PostgreSQL or Supabase SQL Editor.

### Option B: TypeScript Seeder (`scripts/seed.ts` / `npm run seed`)
```bash
npm run seed
```

#### Production Safety Guard
If `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` points to a remote host (non-localhost), the seeder will abort automatically to prevent unintended database mutations:
```
⚠️ SAFETY WARNING: Remote Supabase database detected!
Target URL: https://cicfbtxrppnckbiuaxuu.supabase.co
```
To explicitly confirm execution against your remote Supabase instance:
```bash
# PowerShell
$env:CONFIRM_LIVE_SEED="true"; npm run seed

# Bash / macOS / Linux
CONFIRM_LIVE_SEED=true npm run seed
```

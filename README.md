# LearnTwin — Learning Digital Twin & Misconception Diagnostics

> "Every platform tells you what you got wrong. LearnTwin tells you why you think wrong."

LearnTwin builds an intelligent, individualized **Learning Digital Twin** of each student. Rather than treating errors as generic score penalties, LearnTwin:
1. **Diagnoses Misconceptions**: Maps distractor choices and free-text explanations to verified false mental models (not just weak topics).
2. **Traces Root Causes on Prerequisite DAGs**: Recursively walks backwards through dependency graphs to discover the upstream blocker (e.g. Call Stack Frames sabotaging Recursion and Backtracking).
3. **Simulates Future Trajectories**: Runs 200 Monte Carlo stochastic paths predicting readiness at your target deadline (P10/P50/P90).
4. **Schedules Forgetting-Aware Reviews**: Ebbinghaus exponential decay tracking schedules micro-refreshers before retention dips below 70%.
5. **Visualizes Path Diffs**: Git-style interactive diffs (Removed = Mastered, Added = New Gap, Reordered = Root Cause Priority).
6. **Multi-Modal Bandit Personalization**: Continuously balances video, article, interactive practice, and worked example modalities to maximize your individual learning velocity.

---

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons
- **Backend**: Node.js, Express, TypeScript, Mongoose ODM, MongoDB Atlas (with automatic in-memory fallback)
- **AI**: Gemini 2.5 Flash (server-side with deterministic fallback)
- **Engine**: Bayesian Knowledge Tracing (BKT), Ebbinghaus Decay, Prerequisite DAG Root-Cause Tracer, Multi-Armed Bandit, Monte Carlo Simulator

---

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set `GEMINI_API_KEY` (optional for AI diagnosis) and `MONGODB_URI` (optional; if omitted or unavailable, LearnTwin automatically runs in resilient in-memory demo mode).

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to explore LearnTwin.

---

## Demo Personas
- **Aarav**: Beginner (3 hrs/week), foundational memory and mutability gaps.
- **Meera**: Intermediate (5 hrs/week), stack frame misconception sabotaging recursion.
- **Rohan**: Advanced (4 hrs/week), interview prep, forgetting-prone on dynamic programming.

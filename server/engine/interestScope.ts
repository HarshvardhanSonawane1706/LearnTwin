/**
 * @license
 * Deterministic Student Interest, Future Scope & Level-Adaptive Field Pivot Engine
 */

import {
  FutureScopeItem,
  InterestDomainInfo,
  InterestEvaluationResult,
  InterestQuestion,
  ResponseLevelTier,
  SuggestedFieldPivot,
} from '../types.js';

export const INTEREST_CATALOG: InterestDomainInfo[] = [
  {
    id: 'ai_ml',
    title: 'Artificial Intelligence & Machine Learning',
    tagline: 'Neural architectures, LLM systems, and applied intelligence',
    description: 'Design predictive models, multimodal pipelines, and reasoning agents.',
    futureScopes: [
      {
        field: 'Multimodal & Agentic AI Engineering',
        horizon: '2026–2030 High Growth',
        outlook: 'Surge in enterprise demand for engineers who build verifiable tool-using AI systems, evaluation harnesses, and low-latency inference.',
        roles: ['Applied AI Engineer', 'ML Systems Engineer', 'AI Evaluation Architect'],
        keySkills: ['Python & PyTorch', 'Vector Retrieval & RAG', 'Probability & Optimization', 'Model Evals'],
        capstoneIdea: 'Build an autonomous code-review or scientific literature verifier with deterministic guardrails.',
      },
      {
        field: 'Edge & On-Device Neural Inference',
        horizon: '3–5 Year Horizon',
        outlook: 'Quantized models running locally on robotics, wearables, and mobile hardware for privacy and sub-10ms latency.',
        roles: ['Edge ML Engineer', 'Inference Optimization Specialist'],
        keySkills: ['Model Quantization', 'Memory Layouts & Profiling', 'ONNX / C++ Runtimes'],
        capstoneIdea: 'Deploy a quantized real-time gesture or anomaly detector running offline in-browser or on microcontroller.',
      },
    ],
  },
  {
    id: 'web_fullstack',
    title: 'Web & Full-Stack Product Engineering',
    tagline: 'Interactive interfaces, APIs, and resilient cloud applications',
    description: 'Build end-to-end digital products combining responsive UX with scalable backend state.',
    futureScopes: [
      {
        field: 'AI-Native Product & Design Engineering',
        horizon: 'Immediate & 2028 Outlook',
        outlook: 'Organizations prioritize engineers who bridge rich client state machines, streaming UIs, and robust backend persistence.',
        roles: ['Full-Stack Product Engineer', 'Design Engineer', 'Platform UI Architect'],
        keySkills: ['TypeScript & React', 'REST / Streaming APIs', 'Relational SQL Modeling', 'Accessibility & Perf'],
        capstoneIdea: 'Ship a collaborative real-time workspace with optimistic updates and offline SQLite/cloud sync.',
      },
      {
        field: 'Local-First & Edge Web Systems',
        horizon: '2026–2030 Frontier',
        outlook: 'Growing shift toward sub-50ms local-first web apps synchronized via conflict-free replicated data.',
        roles: ['Frontend Systems Engineer', 'Sync Engine Developer'],
        keySkills: ['IndexedDB / WebAssembly SQLite', 'State Machines', 'Distributed Consistency'],
        capstoneIdea: 'Create an offline-capable collaborative diagramming or study tracker with automatic background sync.',
      },
    ],
  },
  {
    id: 'data_science',
    title: 'Data Science & Decision Analytics',
    tagline: 'Statistical inference, forecasting, and causal experimentation',
    description: 'Turn noisy real-world telemetry into reliable forecasts and product decisions.',
    futureScopes: [
      {
        field: 'Causal Inference & Experimentation Science',
        horizon: '2026–2030 Strategic Demand',
        outlook: 'Tech, biotech, and fintech teams increasingly require practitioners who separate correlation from true causal lift.',
        roles: ['Decision Scientist', 'Experimentation Lead', 'Quantitative Analyst'],
        keySkills: ['Bayesian Statistics', 'A/B & Uplift Modeling', 'SQL & Data Pipelines', 'Monte Carlo Simulation'],
        capstoneIdea: 'Build a Monte Carlo retention simulator and Bayesian A/B analyzer for noisy cohort metrics.',
      },
      {
        field: 'Real-Time Streaming Analytics',
        horizon: '3–5 Year Horizon',
        outlook: 'Event-driven telemetry pipelines powering live fraud detection, pricing, and personalization.',
        roles: ['Analytics Engineer', 'Data Platform Engineer'],
        keySkills: ['Windowed Aggregations', 'Schema Governance', 'Time-Series Forecasting'],
        capstoneIdea: 'Design a live anomaly detection pipeline over streaming event metrics with calibrated alerts.',
      },
    ],
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Systems Defense',
    tagline: 'Application security, cryptography, and threat resilience',
    description: 'Analyze attack surfaces, harden authentication systems, and protect critical infrastructure.',
    futureScopes: [
      {
        field: 'AI-Era Application Security & Zero-Trust Engineering',
        horizon: '2026–2030 Critical Demand',
        outlook: 'Rising automated exploits make defensive architecture, identity boundaries, and cryptographic verification essential.',
        roles: ['Application Security Engineer', 'Detection & Response Engineer', 'Security Architect'],
        keySkills: ['Auth & JWT/OAuth Hardening', 'Threat Modeling', 'Network & OS Internals', 'Cryptography Basics'],
        capstoneIdea: 'Implement an automated API permission fuzzer and token-replay detector for web services.',
      },
      {
        field: 'Privacy Engineering & Applied Cryptography',
        horizon: '3–5 Year Horizon',
        outlook: 'Verifiable computation, encrypted telemetry, and zero-knowledge identity proofs in regulated industries.',
        roles: ['Cryptography Engineer', 'Privacy Systems Engineer'],
        keySkills: ['Zero-Knowledge Concepts', 'Key Management', 'Secure Enclaves'],
        capstoneIdea: 'Build a verifiable credential verification service using salted hashing and signed audit trails.',
      },
    ],
  },
  {
    id: 'game_3d',
    title: 'Game Dev, 3D Graphics & Spatial Computing',
    tagline: 'Real-time rendering, physics simulation, and interactive worlds',
    description: 'Combine linear algebra, frame-budget optimization, and visual storytelling.',
    futureScopes: [
      {
        field: 'Digital Twins & Spatial Simulation Engines',
        horizon: '2026–2030 Expanding Frontier',
        outlook: 'Real-time 3D engines now power robotics training, industrial digital twins, and medical visualization beyond entertainment.',
        roles: ['Graphics / Shader Engineer', 'Simulation Software Engineer', 'Technical Artist'],
        keySkills: ['Linear Algebra & Vectors', 'WebGL / Three.js / Shaders', 'Spatial Partitioning (BVH/Quadtrees)'],
        capstoneIdea: 'Create an interactive 3D physics sandbox with spatial collision culling running at a locked 60fps.',
      },
      {
        field: 'Procedural World & AI-Assisted Gameplay Systems',
        horizon: '3–5 Year Horizon',
        outlook: 'Hybrid deterministic physics paired with procedural graph generation and dynamic NPC behavior trees.',
        roles: ['Gameplay Systems Programmer', 'Procedural Content Engineer'],
        keySkills: ['Behavior Trees & State Graphs', 'Wave Function Collapse', 'Memory Pooling'],
        capstoneIdea: 'Build a deterministic seeded procedural dungeon/city generator with pathfinding.',
      },
    ],
  },
  {
    id: 'robotics_iot',
    title: 'Robotics, Autonomous Systems & IoT',
    tagline: 'Sensor fusion, control loops, and embodied compute',
    description: 'Connect software intelligence with physical sensors, actuators, and real-time constraints.',
    futureScopes: [
      {
        field: 'Embodied AI & Autonomous Fleet Coordination',
        horizon: '2026–2032 Rapid Acceleration',
        outlook: 'Warehousing, agriculture, drones, and assistive robotics demand engineers skilled in control theory and perception.',
        roles: ['Robotics Software Engineer', 'Autonomy & Planning Engineer', 'Embedded Systems Architect'],
        keySkills: ['Graph Path Planning (A*/BFS)', 'Feedback Control (PID)', 'Sensor Fusion', 'Real-Time State'],
        capstoneIdea: 'Simulate a multi-agent obstacle-avoiding warehouse robot planner using A* and noisy sensor models.',
      },
      {
        field: 'Smart Infrastructure & Edge Telemetry',
        horizon: '3–5 Year Horizon',
        outlook: 'Low-power connected sensor grids managing energy, climate, and predictive industrial maintenance.',
        roles: ['IoT Systems Engineer', 'Firmware & Telemetry Developer'],
        keySkills: ['MQTT / Time-Series Storage', 'Fault Tolerance', 'Low-Power Protocols'],
        capstoneIdea: 'Build a simulated sensor fleet dashboard predicting hardware failures from drift telemetry.',
      },
    ],
  },
  {
    id: 'cloud_devops',
    title: 'Cloud Architecture & Distributed Systems',
    tagline: 'Fault tolerance, consensus, observability, and scale',
    description: 'Architect reliable services that stay fast and consistent under heavy load or partial failure.',
    futureScopes: [
      {
        field: 'Distributed AI Infrastructure & Platform SRE',
        horizon: '2026–2030 Core Infrastructure',
        outlook: 'High-throughput model serving, autoscaling queues, and multi-region resilience drive top engineering demand.',
        roles: ['Distributed Systems Engineer', 'Site Reliability Engineer (SRE)', 'Cloud Platform Architect'],
        keySkills: ['Concurrency & Queues', 'Caching & Rate Limiting', 'Containers & Orchestration', 'Observability'],
        capstoneIdea: 'Implement a token-bucket rate limiter and circuit breaker protecting downstream microservices.',
      },
      {
        field: 'Serverless & Edge Compute Fabrics',
        horizon: '3–5 Year Horizon',
        outlook: 'Zero-cold-start edge workers routing state and compute close to users globally.',
        roles: ['Cloud Infrastructure Developer', 'Edge Runtime Engineer'],
        keySkills: ['Stateless Routing', 'Read Replicas & Caching', 'Latency Profiling'],
        capstoneIdea: 'Design a multi-worker task scheduler with retry backoff and dead-letter recovery.',
      },
    ],
  },
  {
    id: 'fintech_quant',
    title: 'FinTech & Quantitative Computing',
    tagline: 'Algorithmic modeling, risk engines, and payment ledgers',
    description: 'Build precision financial systems, portfolio optimizers, and fraud-resistant ledgers.',
    futureScopes: [
      {
        field: 'Algorithmic Risk & Stochastic Portfolio Engineering',
        horizon: '2026–2030 High Leverage',
        outlook: 'Financial institutions rely on Monte Carlo simulations, low-latency pricing, and real-time risk engines.',
        roles: ['Quantitative Developer', 'Risk Modeling Engineer', 'FinTech Systems Architect'],
        keySkills: ['Monte Carlo Methods', 'Dynamic Programming', 'Idempotent Ledgers', 'Time-Series Analysis'],
        capstoneIdea: 'Build a double-entry idempotent ledger paired with a Monte Carlo portfolio drawdown simulator.',
      },
      {
        field: 'Real-Time Payment Rails & Fraud Intelligence',
        horizon: '3–5 Year Horizon',
        outlook: 'Instant global settlements require sub-second graph fraud scoring and strict transactional invariants.',
        roles: ['Payments Platform Engineer', 'Fraud ML Developer'],
        keySkills: ['ACID Transactions', 'Graph Anomaly Detection', 'Concurrency Control'],
        capstoneIdea: 'Create a transaction graph detector flagging anomalous multi-hop transfer loops.',
      },
    ],
  },
];

export const INTEREST_QUESTIONS: InterestQuestion[] = [
  // AI & ML
  {
    id: 'iq_ai_1',
    interestId: 'ai_ml',
    interestTitle: 'Artificial Intelligence & Machine Learning',
    difficulty: 'foundational',
    prompt: 'A classifier gets 99% accuracy on a dataset where 99% of examples are negative and 1% are positive. What is the main flaw in relying on accuracy here?',
    options: [
      { id: 'a', text: 'A model predicting "negative" for every single input still scores 99% while catching zero positive cases.', isCorrect: true, explanation: 'With severe class imbalance, raw accuracy hides complete failure on the minority class; precision, recall, or PR-AUC are needed.' },
      { id: 'b', text: 'Accuracy cannot be computed when there are fewer than 1,000 samples.', isCorrect: false, explanation: 'Accuracy is mathematically defined for any non-empty dataset, regardless of size.' },
      { id: 'c', text: '99% accuracy always guarantees the model is overfitting the test labels.', isCorrect: false, explanation: 'A constant majority-class baseline is actually underfitting, not overfitting.' },
      { id: 'd', text: 'Positive labels carry twice the weight in standard accuracy formulas.', isCorrect: false, explanation: 'Standard accuracy weights every sample equally.' },
    ],
    cognitiveSignal: 'Evaluation Metric Rigor',
  },
  {
    id: 'iq_ai_2',
    interestId: 'ai_ml',
    interestTitle: 'Artificial Intelligence & Machine Learning',
    difficulty: 'intermediate',
    prompt: 'When building a Retrieval-Augmented Generation (RAG) assistant over technical docs, your top-k vector search retrieves sentences that use similar keywords but miss multi-step constraints. Which upgrade directly addresses this?',
    options: [
      { id: 'a', text: 'Increase the LLM temperature to 1.8 so it guesses missing constraints creatively.', isCorrect: false, explanation: 'Higher temperature increases randomness and hallucinations rather than grounding facts.' },
      { id: 'b', text: 'Combine hybrid retrieval (lexical + dense embeddings) with a cross-encoder reranker and section-aware chunking.', isCorrect: true, explanation: 'Hybrid retrieval catches exact terms/identifiers, section chunking preserves surrounding constraints, and a cross-encoder reranker scores full query-passage interaction.' },
      { id: 'c', text: 'Shrink chunk sizes to 10 tokens so every sentence sits in isolation.', isCorrect: false, explanation: 'Tiny chunks destroy contextual constraints across nearby sentences.' },
      { id: 'd', text: 'Disable embeddings and sort documents alphabetically.', isCorrect: false, explanation: 'Alphabetical sorting ignores semantic and keyword relevance.' },
    ],
    cognitiveSignal: 'Applied AI Pipeline Design',
  },
  {
    id: 'iq_ai_3',
    interestId: 'ai_ml',
    interestTitle: 'Artificial Intelligence & Machine Learning',
    difficulty: 'advanced',
    prompt: 'During autoregressive LLM decoding, why does a Key-Value (KV) cache reduce time complexity per generated token from quadratic to linear?',
    options: [
      { id: 'a', text: 'It compresses the vocabulary table into a single fixed-size hash.', isCorrect: false, explanation: 'KV caching stores attention projection tensors for past tokens, not the vocabulary embeddings.' },
      { id: 'b', text: 'It avoids recomputing K and V projections for all prior context tokens, computing attention only between the new Q token and cached K/V pairs.', isCorrect: true, explanation: 'Without KV cache, generating token t recomputes K/V for all 1..t-1 tokens (O(t^2) total across steps); caching reuses prior K/V states so each step does O(t) attention work.' },
      { id: 'c', text: 'It drops half the transformer layers after the first generated token.', isCorrect: false, explanation: 'Every transformer layer still executes per token.' },
      { id: 'd', text: 'It turns self-attention into a 1D convolution with kernel size 1.', isCorrect: false, explanation: 'Attention still attends over the full context window via cached K/V matrices.' },
    ],
    cognitiveSignal: 'Inference Systems Architecture',
  },

  // Web & Full-Stack
  {
    id: 'iq_web_1',
    interestId: 'web_fullstack',
    interestTitle: 'Web & Full-Stack Product Engineering',
    difficulty: 'foundational',
    prompt: 'Why should an application store salted password hashes (e.g. bcrypt/Argon2) in the database instead of encrypted plaintext or plain SHA-256?',
    options: [
      { id: 'a', text: 'Bcrypt/Argon2 use unique per-user salts and intentionally slow work factors, resisting rainbow tables and brute-force GPU cracking even if the DB leaks.', isCorrect: true, explanation: 'Unique salts prevent precomputed table lookups and adaptive cost slows offline guessing dramatically.' },
      { id: 'b', text: 'Plain SHA-256 produces hashes too long for SQL TEXT columns.', isCorrect: false, explanation: 'SHA-256 is only 64 hex chars; the problem is that SHA-256 is far too fast for passwords.' },
      { id: 'c', text: 'Bcrypt lets the server decrypt the original password whenever a user forgets it.', isCorrect: false, explanation: 'Hashing is one-way; passwords cannot be decrypted.' },
      { id: 'd', text: 'Salting reduces network bandwidth between browser and server.', isCorrect: false, explanation: 'Salting happens on storage/verification and has no bandwidth benefit.' },
    ],
    cognitiveSignal: 'Web Security Foundations',
  },
  {
    id: 'iq_web_2',
    interestId: 'web_fullstack',
    interestTitle: 'Web & Full-Stack Product Engineering',
    difficulty: 'intermediate',
    prompt: 'A React search box fires an API request on every keystroke. Occasionally an older slower request resolves after a newer request, overwriting fresh results with stale ones. What fixes this race condition?',
    options: [
      { id: 'a', text: 'Use an AbortController inside useEffect cleanup (or track a request sequence ID) to ignore/cancel superseded responses.', isCorrect: true, explanation: 'Aborting in-flight requests or discarding out-of-order responses guarantees UI state only reflects the latest query.' },
      { id: 'b', text: 'Switch from fetch() to XMLHttpRequest without cleanup.', isCorrect: false, explanation: 'XMLHttpRequest suffers the exact same out-of-order response race unless aborted or sequenced.' },
      { id: 'c', text: 'Store every search result inside window.localStorage first.', isCorrect: false, explanation: 'Caching does not resolve asynchronous arrival order for uncached queries.' },
      { id: 'd', text: 'Remove the key from React list items.', isCorrect: false, explanation: 'Missing list keys degrade reconciliation and do not affect network races.' },
    ],
    cognitiveSignal: 'Async Client State Engineering',
  },
  {
    id: 'iq_web_3',
    interestId: 'web_fullstack',
    interestTitle: 'Web & Full-Stack Product Engineering',
    difficulty: 'advanced',
    prompt: 'You design an optimistic UI toggle (e.g., liking or bookmarking a module) backed by a REST endpoint. How do you ensure state remains consistent when a user double-clicks offline or a server call fails?',
    options: [
      { id: 'a', text: 'Mutate state in place and never retry failed requests.', isCorrect: false, explanation: 'Silent failure leaves the UI permanently diverged from persisted server state.' },
      { id: 'b', text: 'Snapshot prior state, apply an idempotent mutation key per intent, roll back cleanly on failure, and reconcile with authoritative server state on settlement.', isCorrect: true, explanation: 'Idempotency keys prevent duplicate side effects while snapshot rollback + reconciliation preserves exact consistency.' },
      { id: 'c', text: 'Block the entire browser window with a synchronous XHR call.', isCorrect: false, explanation: 'Synchronous XHR freezes the main thread and is deprecated.' },
      { id: 'd', text: 'Reload the entire HTML page after every click.', isCorrect: false, explanation: 'Full page reloads destroy SPA responsiveness.' },
    ],
    cognitiveSignal: 'Distributed UI Consistency',
  },

  // Data Science
  {
    id: 'iq_ds_1',
    interestId: 'data_science',
    interestTitle: 'Data Science & Decision Analytics',
    difficulty: 'foundational',
    prompt: 'In an observational dataset, users who engage with a premium study badge earn 30% higher scores. Why can you NOT immediately conclude the badge caused the score increase?',
    options: [
      { id: 'a', text: 'Selection bias / confounding: highly motivated students may both earn badges more often AND score higher independently.', isCorrect: true, explanation: 'Confounding variables like baseline motivation drive both treatment exposure and outcome.' },
      { id: 'b', text: 'Percentages cannot be compared across more than 100 students.', isCorrect: false, explanation: 'Sample size affects variance, not the validity of percentage comparisons.' },
      { id: 'c', text: 'Mean scores are always lower than median scores.', isCorrect: false, explanation: 'Mean vs median depends on skewness and does not explain causal bias.' },
      { id: 'd', text: 'Badges only measure categorical strings, not booleans.', isCorrect: false, explanation: 'Encoding type does not alter causal identification.' },
    ],
    cognitiveSignal: 'Causal Reasoning',
  },
  {
    id: 'iq_ds_2',
    interestId: 'data_science',
    interestTitle: 'Data Science & Decision Analytics',
    difficulty: 'intermediate',
    prompt: 'Why is running 20 independent A/B hypothesis tests at p < 0.05 without correction risky for product decisions?',
    options: [
      { id: 'a', text: 'Even if zero features truly work, the family-wise false positive probability rises to ~64% (1 - 0.95^20).', isCorrect: true, explanation: 'Multiple comparisons inflate Type I error unless controlled via Bonferroni, Holm, or Benjamini-Hochberg FDR.' },
      { id: 'b', text: 'p-values become negative numbers when more than 10 tests run.', isCorrect: false, explanation: 'Probabilities always remain in [0, 1].' },
      { id: 'c', text: 'Sample variance shrinks to zero automatically.', isCorrect: false, explanation: 'Running more tests does not eliminate variance.' },
      { id: 'd', text: 'Control and treatment users merge into one bucket.', isCorrect: false, explanation: 'Randomization buckets stay separate.' },
    ],
    cognitiveSignal: 'Statistical Experimentation Rigor',
  },
  {
    id: 'iq_ds_3',
    interestId: 'data_science',
    interestTitle: 'Data Science & Decision Analytics',
    difficulty: 'advanced',
    prompt: 'When forecasting student readiness with a 200-run Monte Carlo simulation instead of a single linear extrapolation, what strategic insight do the P10 and P90 bands reveal?',
    options: [
      { id: 'a', text: 'They quantify tail risk and uncertainty spread—showing whether a deadline still holds even under slower retention/variance scenarios.', isCorrect: true, explanation: 'Confidence percentiles capture downside risk (P10) and upside potential (P90) caused by stochastic forgetting and session variance.' },
      { id: 'b', text: 'They guarantee every student will achieve the P90 score.', isCorrect: false, explanation: 'P90 represents the 90th percentile outcome, not a guarantee.' },
      { id: 'c', text: 'They eliminate the need to measure initial skill mastery.', isCorrect: false, explanation: 'Simulations depend critically on accurate initial state priors.' },
      { id: 'd', text: 'They convert non-linear forgetting curves into straight lines.', isCorrect: false, explanation: 'Monte Carlo preserves non-linear decay dynamics across sampled trajectories.' },
    ],
    cognitiveSignal: 'Stochastic Modeling & Risk',
  },

  // Cybersecurity
  {
    id: 'iq_sec_1',
    interestId: 'cybersecurity',
    interestTitle: 'Cybersecurity & Systems Defense',
    difficulty: 'foundational',
    prompt: 'How do parameterized SQL queries (prepared statements) neutralize classic SQL injection attacks?',
    options: [
      { id: 'a', text: 'They separate SQL syntax/structure from user-supplied parameters so user input is treated strictly as literal data, never executable SQL code.', isCorrect: true, explanation: 'Binding parameters prevents attackers from breaking out of string literals to alter query structure.' },
      { id: 'b', text: 'They delete all quotes and spaces from user names automatically.', isCorrect: false, explanation: 'Stripping characters breaks valid inputs like O\'Connor while failing on numeric/encoding tricks.' },
      { id: 'c', text: 'They encrypt the entire database table on every SELECT.', isCorrect: false, explanation: 'Prepared statements relate to query parsing, not table encryption.' },
      { id: 'd', text: 'They force queries to execute on the client browser.', isCorrect: false, explanation: 'SQL executes on the database/server side.' },
    ],
    cognitiveSignal: 'Injection & Trust Boundary Defense',
  },
  {
    id: 'iq_sec_2',
    interestId: 'cybersecurity',
    interestTitle: 'Cybersecurity & Systems Defense',
    difficulty: 'intermediate',
    prompt: 'An API issues stateless JWT tokens signed with HS256, and a user logs out or changes their password. Why is simply deleting the token from browser localStorage insufficient for high-security endpoints?',
    options: [
      { id: 'a', text: 'Anyone who previously copied that valid JWT can still replay it until its exp timestamp unless checked against a revocation list or short-lived refresh rotation.', isCorrect: true, explanation: 'Stateless JWTs remain cryptographically valid until expiration unless paired with server-side revocation/token-version checks.' },
      { id: 'b', text: 'Deleting from localStorage automatically triggers a SQL injection.', isCorrect: false, explanation: 'Deleting localStorage keys has nothing to do with SQL.' },
      { id: 'c', text: 'HS256 signatures expire instantaneously on browser tab switch.', isCorrect: false, explanation: 'Token expiration depends strictly on the exp claim.' },
      { id: 'd', text: 'JWT headers are encrypted by default with the user email.', isCorrect: false, explanation: 'Standard JWT headers and payloads are Base64Url-encoded, not encrypted.' },
    ],
    cognitiveSignal: 'Identity & Session Architecture',
  },
  {
    id: 'iq_sec_3',
    interestId: 'cybersecurity',
    interestTitle: 'Cybersecurity & Systems Defense',
    difficulty: 'advanced',
    prompt: 'Why should security-critical token or HMAC comparisons use constant-time equality checks instead of a standard `===` string comparison?',
    options: [
      { id: 'a', text: 'Standard comparison short-circuits on the first mismatched byte, leaking prefix correctness through microsecond timing side-channels.', isCorrect: true, explanation: 'Timing side-channel attacks measure response latency variance to recover valid HMAC bytes one position at a time.' },
      { id: 'b', text: 'Standard `===` only checks the first 8 characters of a string.', isCorrect: false, explanation: '`===` checks the entire string, just returning early on mismatch.' },
      { id: 'c', text: 'Constant-time comparison compresses hashes to 64 bits.', isCorrect: false, explanation: 'It operates on full byte buffers without altering hash length.' },
      { id: 'd', text: 'JavaScript converts strings to floats during `===`.', isCorrect: false, explanation: 'Strict equality `===` does not coerce types.' },
    ],
    cognitiveSignal: 'Cryptographic Side-Channel Awareness',
  },

  // Game Dev & 3D
  {
    id: 'iq_3d_1',
    interestId: 'game_3d',
    interestTitle: 'Game Dev, 3D Graphics & Spatial Computing',
    difficulty: 'foundational',
    prompt: 'In a game loop, why should character movement multiply velocity by `deltaTime` (time elapsed since the previous frame)?',
    options: [
      { id: 'a', text: 'To keep physical movement speed consistent regardless of whether the display runs at 30fps, 60fps, or 144fps.', isCorrect: true, explanation: 'Frame-rate independence decouples physics simulation speed from hardware refresh rates.' },
      { id: 'b', text: 'To double the GPU texture resolution automatically.', isCorrect: false, explanation: 'deltaTime scales simulation integration, not texture mipmaps.' },
      { id: 'c', text: 'Because `deltaTime` converts 3D coordinates into 2D screen pixels.', isCorrect: false, explanation: 'Projection matrices convert 3D world space into screen space.' },
      { id: 'd', text: 'To prevent shaders from compiling at startup.', isCorrect: false, explanation: 'Shader compilation happens via WebGL/GPU pipeline, unrelated to deltaTime.' },
    ],
    cognitiveSignal: 'Real-Time Simulation Loop',
  },
  {
    id: 'iq_3d_2',
    interestId: 'game_3d',
    interestTitle: 'Game Dev, 3D Graphics & Spatial Computing',
    difficulty: 'intermediate',
    prompt: 'An interactive scene has 8,000 moving particles checking pairwise collisions (`O(N^2)`), dropping the frame rate below 15fps. What data structure drops collision checks closer to `O(N)` locally?',
    options: [
      { id: 'a', text: 'A spatial hash grid, Quadtree, or BVH (Bounding Volume Hierarchy) to test only nearby spatial cells.', isCorrect: true, explanation: 'Spatial partitioning restricts narrow-phase collision tests to neighboring objects within the same or adjacent cells.' },
      { id: 'b', text: 'Storing all particles in a singly linked list sorted by creation timestamp.', isCorrect: false, explanation: 'Creation time has no correlation with 3D spatial proximity.' },
      { id: 'c', text: 'Increasing monitor brightness.', isCorrect: false, explanation: 'Display luminance has no effect on CPU collision complexity.' },
      { id: 'd', text: 'Converting every triangle into a recursive closure.', isCorrect: false, explanation: 'Extra closures add allocation overhead without spatial pruning.' },
    ],
    cognitiveSignal: 'Spatial Data Structures & Perf',
  },
  {
    id: 'iq_3d_3',
    interestId: 'game_3d',
    interestTitle: 'Game Dev, 3D Graphics & Spatial Computing',
    difficulty: 'advanced',
    prompt: 'Why does GPU instancing (`InstancedMesh`) dramatically outperform issuing 5,000 individual mesh draw calls for trees or asteroids?',
    options: [
      { id: 'a', text: 'It batches thousands of per-instance transform/color matrices into a single GPU draw call, eliminating CPU driver state-change overhead.', isCorrect: true, explanation: 'CPU-to-GPU draw-call dispatch is a major bottleneck; instancing shares geometry/material state across thousands of transforms in one call.' },
      { id: 'b', text: 'It skips vertex transformations completely.', isCorrect: false, explanation: 'Vertex shaders still transform each instance using its instanceMatrix.' },
      { id: 'c', text: 'It forces the CPU to rasterize pixels without using the GPU.', isCorrect: false, explanation: 'Instancing keeps rasterization entirely on the GPU.' },
      { id: 'd', text: 'It disables depth buffering so distant objects draw over near ones.', isCorrect: false, explanation: 'Depth testing still functions normally.' },
    ],
    cognitiveSignal: 'GPU Pipeline Optimization',
  },

  // Robotics & IoT
  {
    id: 'iq_rob_1',
    interestId: 'robotics_iot',
    interestTitle: 'Robotics, Autonomous Systems & IoT',
    difficulty: 'foundational',
    prompt: 'In a warehouse grid with walls and open tiles, which property makes A* search faster than Dijkstra’s algorithm while still finding the shortest path?',
    options: [
      { id: 'a', text: 'An admissible heuristic `h(n)` (like Manhattan or Euclidean distance) prioritizes expanding nodes heading toward the goal.', isCorrect: true, explanation: 'An admissible heuristic never overestimates true remaining cost, guiding exploration toward the target while preserving optimality.' },
      { id: 'b', text: 'A* ignores edge weights and picks neighbors randomly.', isCorrect: false, explanation: 'A* uses exact cost `g(n) + h(n)` in a priority queue, not random selection.' },
      { id: 'c', text: 'A* does not need to track visited nodes.', isCorrect: false, explanation: 'Tracking visited/closed nodes prevents infinite cycles in grids.' },
      { id: 'd', text: 'Dijkstra only works on trees without cycles.', isCorrect: false, explanation: 'Dijkstra works on general non-negative weighted graphs.' },
    ],
    cognitiveSignal: 'Heuristic Path Planning',
  },
  {
    id: 'iq_rob_2',
    interestId: 'robotics_iot',
    interestTitle: 'Robotics, Autonomous Systems & IoT',
    difficulty: 'intermediate',
    prompt: 'A drone altitude PID controller reaches the target height quickly but oscillates violently up and down around it. Which adjustment stabilizes the overshoot?',
    options: [
      { id: 'a', text: 'Increase the Derivative (D) damping gain and reduce excessive Proportional (P) gain.', isCorrect: true, explanation: 'The D term opposes rapid rate-of-change in error, damping overshoot caused by overly aggressive P gain.' },
      { id: 'b', text: 'Multiply the Integral (I) gain by 10x.', isCorrect: false, explanation: 'Excessive I gain causes integral windup and worsens oscillation.' },
      { id: 'c', text: 'Disable the altitude sensor once near the target.', isCorrect: false, explanation: 'Open-loop flight without feedback causes drift or crashes.' },
      { id: 'd', text: 'Invert the sign of gravity in the telemetry log.', isCorrect: false, explanation: 'Log signs do not change physical motor thrust.' },
    ],
    cognitiveSignal: 'Feedback Control Dynamics',
  },
  {
    id: 'iq_rob_3',
    interestId: 'robotics_iot',
    interestTitle: 'Robotics, Autonomous Systems & IoT',
    difficulty: 'advanced',
    prompt: 'Why does an autonomous robot fuse wheel odometry with IMU/LiDAR measurements via a Kalman Filter instead of trusting wheel encoders alone?',
    options: [
      { id: 'a', text: 'Wheel slip causes unbounded cumulative drift over time; Bayesian sensor fusion weights noisy observations by inverse covariance to bound pose uncertainty.', isCorrect: true, explanation: 'Dead reckoning integrates error endlessly, whereas Kalman fusion updates state estimates with bounded exteroceptive observations.' },
      { id: 'b', text: 'Wheel encoders only work when the robot moves backward.', isCorrect: false, explanation: 'Quadrature encoders measure bidirectional rotation.' },
      { id: 'c', text: 'Kalman Filters convert 2D maps into JPEG images.', isCorrect: false, explanation: 'Kalman Filters estimate continuous dynamic state vectors and covariances.' },
      { id: 'd', text: 'IMU sensors have zero noise under all accelerations.', isCorrect: false, explanation: 'IMUs also exhibit bias drift and noise, which is why multi-sensor fusion is required.' },
    ],
    cognitiveSignal: 'Probabilistic State Estimation',
  },

  // Cloud & Distributed Systems
  {
    id: 'iq_cloud_1',
    interestId: 'cloud_devops',
    interestTitle: 'Cloud Architecture & Distributed Systems',
    difficulty: 'foundational',
    prompt: 'Why do distributed APIs use a Circuit Breaker pattern when calling an overloaded downstream payment or AI microservice?',
    options: [
      { id: 'a', text: 'To fail fast when downstream error rates spike, preventing cascading thread/connection exhaustion while giving the failing service room to recover.', isCorrect: true, explanation: 'Fail-fast open circuits stop retry storms from taking down upstream callers.' },
      { id: 'b', text: 'To permanently delete the downstream database.', isCorrect: false, explanation: 'Circuit breakers manage request routing/health, not data deletion.' },
      { id: 'c', text: 'To increase TCP timeout values to 10 minutes per request.', isCorrect: false, explanation: 'Long timeouts tie up worker threads and worsen cascading failures.' },
      { id: 'd', text: 'To convert HTTP into FTP.', isCorrect: false, explanation: 'Circuit breakers are protocol-agnostic resilience wrappers.' },
    ],
    cognitiveSignal: 'Resilience & Fault Isolation',
  },
  {
    id: 'iq_cloud_2',
    interestId: 'cloud_devops',
    interestTitle: 'Cloud Architecture & Distributed Systems',
    difficulty: 'intermediate',
    prompt: 'When 10,000 clients retry a failed service at the exact same fixed 1-second interval, the service crashes again on recovery. What prevents this "thundering herd"?',
    options: [
      { id: 'a', text: 'Exponential backoff with randomized jitter.', isCorrect: true, explanation: 'Exponential growth reduces aggregate load while jitter spreads retry spikes evenly over time.' },
      { id: 'b', text: 'Removing all timeouts from client requests.', isCorrect: false, explanation: 'Infinite waits cause resource leaks.' },
      { id: 'c', text: 'Doubling the fixed 1-second retry count per client.', isCorrect: false, explanation: 'More synchronous retries intensify the spike.' },
      { id: 'd', text: 'Disabling TLS certificates.', isCorrect: false, explanation: 'Disabling TLS breaks transport security without smoothing traffic.' },
    ],
    cognitiveSignal: 'Distributed Traffic Shaping',
  },
  {
    id: 'iq_cloud_3',
    interestId: 'cloud_devops',
    interestTitle: 'Cloud Architecture & Distributed Systems',
    difficulty: 'advanced',
    prompt: 'In an event-driven microservice processing asynchronous queue jobs with "at-least-once" delivery, how do you prevent double-charging a user if a worker crashes right after committing and the message is redelivered?',
    options: [
      { id: 'a', text: 'Enforce idempotent consumers using a unique idempotency key persisted atomically in the same database transaction as the state update.', isCorrect: true, explanation: 'Storing processed event IDs atomically with the side effect guarantees redeliveries are safely deduplicated.' },
      { id: 'b', text: 'Ask clients never to refresh their browser.', isCorrect: false, explanation: 'Queue redelivery happens on broker/worker timeouts regardless of client behavior.' },
      { id: 'c', text: 'Use an unindexed in-memory array inside one container.', isCorrect: false, explanation: 'In-memory state is lost on restart and unshared across horizontally scaled workers.' },
      { id: 'd', text: 'Drop every odd-numbered message at the load balancer.', isCorrect: false, explanation: 'Randomly dropping messages causes silent data loss.' },
    ],
    cognitiveSignal: 'Exactly-Once Semantics Design',
  },

  // FinTech & Quant
  {
    id: 'iq_fin_1',
    interestId: 'fintech_quant',
    interestTitle: 'FinTech & Quantitative Computing',
    difficulty: 'foundational',
    prompt: 'Why should monetary balances in a financial ledger NEVER be stored or summed as IEEE-754 binary floating-point numbers (`0.1 + 0.2`)?',
    options: [
      { id: 'a', text: 'Base-2 floats cannot represent base-10 decimals like 0.1 exactly, causing rounding drift; integer minor units (cents) or fixed-precision Decimal types must be used.', isCorrect: true, explanation: 'Exact integer cents/paise or arbitrary-precision decimal arithmetic preserves penny-exact ledger invariants.' },
      { id: 'b', text: 'Floating-point numbers cannot represent negative balances.', isCorrect: false, explanation: 'Floats have a sign bit and easily represent negatives; the issue is base-10 representation precision.' },
      { id: 'c', text: 'Floats are only supported in Python, not JavaScript or SQL.', isCorrect: false, explanation: 'IEEE-754 floats exist across nearly all languages.' },
      { id: 'd', text: 'Integers execute 1,000x slower than floats in databases.', isCorrect: false, explanation: 'Integer arithmetic is actually faster and exact.' },
    ],
    cognitiveSignal: 'Ledger Precision & Invariants',
  },
  {
    id: 'iq_fin_2',
    interestId: 'fintech_quant',
    interestTitle: 'FinTech & Quantitative Computing',
    difficulty: 'intermediate',
    prompt: 'Two concurrent transfer requests try to debit $80 from an account holding $100. Without concurrency control, both read $100 and succeed, leaving -$60. Which database pattern prevents this?',
    options: [
      { id: 'a', text: 'Wrap the check-and-debit in an ACID transaction using row-level locking (`SELECT ... FOR UPDATE`) or optimistic version checks (`WHERE balance >= 80`).', isCorrect: true, explanation: 'Atomic conditional updates or pessimistic row locks serialize conflicting writes and uphold the non-negative balance invariant.' },
      { id: 'b', text: 'Run two separate `GET` requests from the frontend before calling `POST`.', isCorrect: false, explanation: 'Client-side pre-checks suffer TOCTOU race conditions under concurrent requests.' },
      { id: 'c', text: 'Use a `setTimeout` of 50ms in Node.js.', isCorrect: false, explanation: 'Arbitrary sleeps do not synchronize concurrent requests across workers.' },
      { id: 'd', text: 'Store the balance inside a browser cookie.', isCorrect: false, explanation: 'Client cookies are untrusted and non-atomic.' },
    ],
    cognitiveSignal: 'Transactional Concurrency Safety',
  },
  {
    id: 'iq_fin_3',
    interestId: 'fintech_quant',
    interestTitle: 'FinTech & Quantitative Computing',
    difficulty: 'advanced',
    prompt: 'In quantitative portfolio backtesting, what silent bug invalidates results when you normalize features using the full dataset mean/variance before splitting past and future windows?',
    options: [
      { id: 'a', text: 'Look-ahead bias (data leakage): future return distributions leak into historical trading decisions, artificially inflating Sharpe ratios.', isCorrect: true, explanation: 'Walk-forward evaluation must compute normalization statistics strictly from data available up to time t.' },
      { id: 'b', text: 'Stack overflow in the SQL engine.', isCorrect: false, explanation: 'Normalization bias is a statistical leakage error, not a runtime crash.' },
      { id: 'c', text: 'Under-sampling of positive integers.', isCorrect: false, explanation: 'This describes sampling skew rather than temporal leakage.' },
      { id: 'd', text: 'Memory aliasing of immutable tuples.', isCorrect: false, explanation: 'Immutable tuples cannot suffer in-place aliasing mutations.' },
    ],
    cognitiveSignal: 'Temporal Leakage & Quant Rigor',
  },
];

const NEXT_FIELD_MATRIX: Record<
  string,
  Record<ResponseLevelTier, SuggestedFieldPivot>
> = {
  ai_ml: {
    'Foundational Explorer': {
      suggestedField: 'Data Science & Decision Analytics',
      suggestedInterestId: 'data_science',
      whyThisFitsYourLevel: 'Building intuition in probability, class imbalance, and statistical evaluation will dramatically accelerate your ML model judgment.',
      futureScopeSummary: 'Experimentation & Decision Science bridges foundational math with high-impact analytics roles across AI teams.',
      targetRoles: ['Junior Data Scientist', 'Product Analytics Engineer', 'ML Evaluation Analyst'],
      bridgeSkills: ['Precision/Recall & Confusion Matrices', 'Bayesian Priors', 'Cohort Simulation'],
      growthHorizon: '1–3 Year High-Demand Ramp',
    },
    'Applied Builder': {
      suggestedField: 'AI-Native Full-Stack Product Engineering',
      suggestedInterestId: 'web_fullstack',
      whyThisFitsYourLevel: 'Your applied grasp of retrieval and pipeline design positions you to ship complete interactive AI applications rather than isolated notebooks.',
      futureScopeSummary: 'Engineers who combine LLM/RAG orchestration with streaming TypeScript interfaces and persistent state are leading product launches.',
      targetRoles: ['AI Product Engineer', 'Full-Stack ML Developer', 'Applied AI Builder'],
      bridgeSkills: ['Streaming APIs & Async UI State', 'Structured Evaluation Harnesses', 'SQL Persistence'],
      growthHorizon: '2026–2030 Core Builder Track',
    },
    'Systems & Innovation Architect': {
      suggestedField: 'Distributed AI Infrastructure & Inference Systems',
      suggestedInterestId: 'cloud_devops',
      whyThisFitsYourLevel: 'Your strong architectural grasp of KV-caching and complexity bounds translates directly to high-throughput model serving and distributed orchestration.',
      futureScopeSummary: 'AI Infrastructure Architects design low-latency inference clusters, GPU schedulers, and resilient multi-region serving fabrics.',
      targetRoles: ['ML Infrastructure Architect', 'Inference Optimization Engineer', 'AI Platform SRE'],
      bridgeSkills: ['Batching & Queue Autoscaling', 'Memory Profiling', 'Idempotent Distributed Pipelines'],
      growthHorizon: '2026–2032 Top-Tier Systems Frontier',
    },
  },
  web_fullstack: {
    'Foundational Explorer': {
      suggestedField: 'Cybersecurity & Application Defense',
      suggestedInterestId: 'cybersecurity',
      whyThisFitsYourLevel: 'Grounding yourself early in authentication, salted hashing, and query safety sets you apart from developers who treat security as an afterthought.',
      futureScopeSummary: 'Secure-by-design web engineering is mandatory across enterprise SaaS, FinTech, and consumer platforms.',
      targetRoles: ['Secure Full-Stack Developer', 'Application Security Analyst'],
      bridgeSkills: ['OWASP Top 10 Defense', 'JWT & Session Hygiene', 'Parameterized Queries'],
      growthHorizon: 'Immediate Differentiation Track',
    },
    'Applied Builder': {
      suggestedField: 'Cloud Architecture & Distributed Systems',
      suggestedInterestId: 'cloud_devops',
      whyThisFitsYourLevel: 'Because you already reason cleanly about async races and client-server coordination, scaling into resilient backend microservices is your highest-leverage next step.',
      futureScopeSummary: 'Full-stack engineers who master caching, rate-limiting, and fault isolation seamlessly advance into Staff/Platform roles.',
      targetRoles: ['Platform Full-Stack Engineer', 'Backend Systems Engineer', 'Cloud Developer'],
      bridgeSkills: ['Circuit Breakers & Retries', 'Distributed Caching', 'Queue Workers'],
      growthHorizon: '2026–2030 Senior Engineering Path',
    },
    'Systems & Innovation Architect': {
      suggestedField: 'Spatial Computing, WebGL & Digital Twins',
      suggestedInterestId: 'game_3d',
      whyThisFitsYourLevel: 'Your mastery of idempotency, state reconciliation, and browser runtime boundaries equips you for real-time collaborative 3D and simulation web platforms.',
      futureScopeSummary: 'Browser-native 3D digital twins and collaborative spatial workspaces combine WebGL rendering with distributed state sync.',
      targetRoles: ['Graphics Web Architect', 'Real-Time Simulation Engineer', 'Spatial UI Lead'],
      bridgeSkills: ['Instanced WebGL Rendering', 'Spatial Partitioning', 'Deterministic State Sync'],
      growthHorizon: '2026–2031 Frontier Specialization',
    },
  },
  data_science: {
    'Foundational Explorer': {
      suggestedField: 'Artificial Intelligence & Machine Learning',
      suggestedInterestId: 'ai_ml',
      whyThisFitsYourLevel: 'Pairing your data reasoning foundation with supervised learning mechanics unlocks predictive modeling and intelligent automation.',
      futureScopeSummary: 'Data analysts who master model validation and feature engineering transition cleanly into Applied ML roles.',
      targetRoles: ['Applied ML Analyst', 'Predictive Modeling Specialist'],
      bridgeSkills: ['Train/Val/Test Hygiene', 'Error Analysis', 'Feature Pipelines'],
      growthHorizon: '1–3 Year Skill Multiplier',
    },
    'Applied Builder': {
      suggestedField: 'FinTech & Quantitative Computing',
      suggestedInterestId: 'fintech_quant',
      whyThisFitsYourLevel: 'Your disciplined grasp of hypothesis testing and multiple-comparison control transfers directly to quantitative risk and backtesting.',
      futureScopeSummary: 'Quantitative developers apply rigorous statistical inference to portfolio risk, pricing, and algorithmic decision systems.',
      targetRoles: ['Quantitative Analyst', 'Risk Data Scientist', 'FinTech Modeling Engineer'],
      bridgeSkills: ['Walk-Forward Backtesting', 'Exact Decimal Ledgers', 'Drawdown Risk Metrics'],
      growthHorizon: '2026–2030 High-Compensation Track',
    },
    'Systems & Innovation Architect': {
      suggestedField: 'Autonomous Robotics & Stochastic Control',
      suggestedInterestId: 'robotics_iot',
      whyThisFitsYourLevel: 'Your advanced comfort with Monte Carlo uncertainty and probabilistic distributions maps naturally onto Bayesian sensor fusion and robotic state estimation.',
      futureScopeSummary: 'Probabilistic robotics and autonomous decision systems rely on stochastic simulation under noisy real-world telemetry.',
      targetRoles: ['Autonomy Simulation Scientist', 'Probabilistic Estimation Engineer'],
      bridgeSkills: ['Kalman Filtering', 'Heuristic Graph Planning', 'Real-Time Telemetry Fusion'],
      growthHorizon: '2026–2032 Deep-Tech Frontier',
    },
  },
  cybersecurity: {
    'Foundational Explorer': {
      suggestedField: 'Web & Full-Stack Product Engineering',
      suggestedInterestId: 'web_fullstack',
      whyThisFitsYourLevel: 'Building real full-stack APIs and auth flows firsthand reveals exactly how state, sessions, and database layers interact in production.',
      futureScopeSummary: 'The strongest security practitioners started by shipping and debugging full-stack applications.',
      targetRoles: ['Product Security Engineer', 'Backend Developer'],
      bridgeSkills: ['REST & Auth Flows', 'SQL Relational Design', 'Client State Isolation'],
      growthHorizon: 'Immediate Builder Foundation',
    },
    'Applied Builder': {
      suggestedField: 'Cloud Architecture & Zero-Trust Infrastructure',
      suggestedInterestId: 'cloud_devops',
      whyThisFitsYourLevel: 'Understanding token lifecycles and revocation boundaries makes you an ideal fit for designing zero-trust cloud meshes and resilient APIs.',
      futureScopeSummary: 'Cloud Security & Platform SRE merges infrastructure reliability with strict identity and network segmentation.',
      targetRoles: ['Cloud Security Engineer', 'Platform SRE', 'Identity Architect'],
      bridgeSkills: ['Zero-Trust Service Mesh', 'Rate Limiting & WAF', 'Key Rotation'],
      growthHorizon: '2026–2030 High-Priority Demand',
    },
    'Systems & Innovation Architect': {
      suggestedField: 'FinTech Cryptography & High-Assurance Ledgers',
      suggestedInterestId: 'fintech_quant',
      whyThisFitsYourLevel: 'Your precision on timing side-channels and cryptographic verification aligns directly with adversarial payment systems and verifiable ledgers.',
      futureScopeSummary: 'High-assurance financial rails demand constant-time cryptography, strict concurrency invariants, and tamper-evident audit logs.',
      targetRoles: ['Security Systems Architect', 'FinTech Cryptography Engineer'],
      bridgeSkills: ['Transactional Concurrency', 'Audit Ledger Integrity', 'Hardware Security Modules'],
      growthHorizon: '2026–2032 Elite Assurance Field',
    },
  },
  game_3d: {
    'Foundational Explorer': {
      suggestedField: 'Interactive Web & Design Engineering',
      suggestedInterestId: 'web_fullstack',
      whyThisFitsYourLevel: 'Combining frame-loop intuition with modern web interfaces equips you to build interactive simulations, visualizers, and creative tools.',
      futureScopeSummary: 'Interactive educational simulations and data visualizers blend browser UI architecture with 60fps canvas/WebGL loops.',
      targetRoles: ['Creative Technologist', 'Interactive Simulation Developer'],
      bridgeSkills: ['Canvas / SVG Animations', 'Async State & Controls', 'Accessible UI'],
      growthHorizon: '1–2 Year Product Track',
    },
    'Applied Builder': {
      suggestedField: 'Robotics Simulation & Embodied Digital Twins',
      suggestedInterestId: 'robotics_iot',
      whyThisFitsYourLevel: 'Your command of spatial partitioning (BVH/Quadtrees) and real-time collision directly powers virtual testbeds for drones and autonomous robots.',
      futureScopeSummary: 'Robotics labs train physical agents inside high-throughput 3D physics simulators before deploying to real hardware.',
      targetRoles: ['Robotics Simulation Engineer', 'Spatial Computing Developer'],
      bridgeSkills: ['A* Path Planning', 'Sensor Noise Modeling', 'Control Loop Integration'],
      growthHorizon: '2026–2031 Rapidly Growing Crossover',
    },
    'Systems & Innovation Architect': {
      suggestedField: 'Edge AI & Neural Rendering Acceleration',
      suggestedInterestId: 'ai_ml',
      whyThisFitsYourLevel: 'Your deep understanding of GPU instancing and matrix batching transfers directly into parallel tensor execution and real-time neural graphics.',
      futureScopeSummary: 'Neural rendering, real-time Gaussian splatting, and GPU inference kernels sit at the intersection of 3D graphics and AI systems.',
      targetRoles: ['AI Graphics Systems Engineer', 'GPU Compute Architect'],
      bridgeSkills: ['Tensor & Attention Batching', 'Memory Coalescing', 'Quantized Pipelines'],
      growthHorizon: '2026–2032 Cutting-Edge Research/Eng',
    },
  },
  robotics_iot: {
    'Foundational Explorer': {
      suggestedField: '3D Simulation & Spatial Environments',
      suggestedInterestId: 'game_3d',
      whyThisFitsYourLevel: 'Practicing path planning and physics loops inside 2D/3D virtual worlds lets you iterate 100x faster before deploying onto physical hardware.',
      futureScopeSummary: 'Virtual simulation sandboxes are the standard training ground for autonomous navigation algorithms.',
      targetRoles: ['Simulation Software Developer', 'Autonomy Tools Engineer'],
      bridgeSkills: ['deltaTime Physics Loops', 'Spatial Grids', '2D/3D Visualization'],
      growthHorizon: '1–2 Year Practical Launchpad',
    },
    'Applied Builder': {
      suggestedField: 'Edge AI & Real-Time Computer Vision',
      suggestedInterestId: 'ai_ml',
      whyThisFitsYourLevel: 'Pairing your feedback-control mindset with lightweight ML perception empowers autonomous systems to interpret dynamic environments.',
      futureScopeSummary: 'Embodied intelligence fuses classical PID/planning reliability with learned vision and semantic reasoning.',
      targetRoles: ['Perception & Control Engineer', 'Edge AI Robotics Developer'],
      bridgeSkills: ['Model Evaluation & Latency', 'Hybrid Planning + ML', 'On-Device Inference'],
      growthHorizon: '2026–2031 Core Robotics Track',
    },
    'Systems & Innovation Architect': {
      suggestedField: 'Distributed Fleet Telemetry & Cloud Control Planes',
      suggestedInterestId: 'cloud_devops',
      whyThisFitsYourLevel: 'Your grasp of probabilistic state estimation and noisy multi-sensor fusion scales cleanly to coordinating thousands of autonomous devices over unreliable networks.',
      futureScopeSummary: 'Fleet orchestration platforms manage OTA updates, real-time telemetry ingestion, and fault-tolerant coordination across edge hardware.',
      targetRoles: ['Fleet Systems Architect', 'Edge-Cloud Platform Lead'],
      bridgeSkills: ['Idempotent Telemetry Ingestion', 'Backoff & Partition Tolerance', 'Event Queues'],
      growthHorizon: '2026–2032 Industrial Scale Frontier',
    },
  },
  cloud_devops: {
    'Foundational Explorer': {
      suggestedField: 'Cybersecurity & Zero-Trust Networking',
      suggestedInterestId: 'cybersecurity',
      whyThisFitsYourLevel: 'Learning how tokens, boundaries, and fault isolation protect services prepares you to operate production infrastructure safely.',
      futureScopeSummary: 'Modern DevSecOps embeds automated defense and identity verification directly into cloud pipelines.',
      targetRoles: ['DevSecOps Engineer', 'Cloud Support & Security Specialist'],
      bridgeSkills: ['JWT & Auth Hardening', 'Least-Privilege IAM', 'SQL Safety'],
      growthHorizon: '1–3 Year Infrastructure Path',
    },
    'Applied Builder': {
      suggestedField: 'FinTech Payment Infrastructure & High-Reliability Ledgers',
      suggestedInterestId: 'fintech_quant',
      whyThisFitsYourLevel: 'Your instinct for retries, jitter, and traffic shaping is prized in financial platforms where duplicate charges or downtime are unacceptable.',
      futureScopeSummary: 'Payments and clearing platforms combine distributed resilience with strict transactional accounting guarantees.',
      targetRoles: ['Payments Infrastructure Engineer', 'Core Banking Platform Dev'],
      bridgeSkills: ['Transactional Row Locks', 'Exact Fixed-Point Math', 'Double-Entry Ledgers'],
      growthHorizon: '2026–2030 High-Reliability Demand',
    },
    'Systems & Innovation Architect': {
      suggestedField: 'Large-Scale AI Model Serving & Evaluation Systems',
      suggestedInterestId: 'ai_ml',
      whyThisFitsYourLevel: 'Your mastery of idempotent at-least-once queues and fault isolation directly solves today’s hardest bottleneck: serving and evaluating AI agents reliably at scale.',
      futureScopeSummary: 'AI Platform Architects bridge distributed systems guarantees with GPU-accelerated LLM inference and agent orchestration.',
      targetRoles: ['Principal AI Platform Architect', 'Distributed ML Systems Lead'],
      bridgeSkills: ['KV-Cache Memory Scheduling', 'Hybrid RAG Orchestration', 'Continuous Evals'],
      growthHorizon: '2026–2032 Peak Systems Demand',
    },
  },
  fintech_quant: {
    'Foundational Explorer': {
      suggestedField: 'Data Science & Statistical Decision Modeling',
      suggestedInterestId: 'data_science',
      whyThisFitsYourLevel: 'Strengthening statistical inference and bias detection gives you the mathematical bedrock behind quantitative risk and pricing models.',
      futureScopeSummary: 'Data Science & Experimentation sharpens your ability to separate genuine market/product signals from noise.',
      targetRoles: ['Financial Data Analyst', 'Risk Analytics Associate'],
      bridgeSkills: ['Confounding & Bias Analysis', 'Hypothesis Control', 'Probability Distributions'],
      growthHorizon: '1–3 Year Analytical Foundation',
    },
    'Applied Builder': {
      suggestedField: 'Distributed Ledger & High-Throughput Cloud Systems',
      suggestedInterestId: 'cloud_devops',
      whyThisFitsYourLevel: 'Your grasp of ACID row-locking and concurrency invariants scales directly into building resilient multi-region settlement and clearing pipelines.',
      futureScopeSummary: 'Modern financial rails depend on distributed fault isolation, idempotent queues, and strict consistency.',
      targetRoles: ['Distributed Payments Architect', 'FinTech Backend Engineer'],
      bridgeSkills: ['Idempotent Message Consumers', 'Circuit Breakers', 'Backoff & Rate Limiting'],
      growthHorizon: '2026–2030 Enterprise Demand',
    },
    'Systems & Innovation Architect': {
      suggestedField: 'Stochastic AI Agents & Quantitative Forecast Systems',
      suggestedInterestId: 'ai_ml',
      whyThisFitsYourLevel: 'Your sharp instinct against temporal data leakage and quantitative rigor sets you apart for building verifiable financial forecasting and risk-aware AI systems.',
      futureScopeSummary: 'Next-generation quantitative teams combine walk-forward stochastic modeling with strict, leak-free ML evaluation.',
      targetRoles: ['Quant ML Researcher', 'Algorithmic Intelligence Architect'],
      bridgeSkills: ['Temporal Evaluation Harnesses', 'LLM Document Grounding', 'Low-Latency Inference'],
      growthHorizon: '2026–2032 Elite Quantitative Frontier',
    },
  },
};

export function getInterestDomain(id: string): InterestDomainInfo | undefined {
  return INTEREST_CATALOG.find((d) => d.id === id);
}

export function getFutureScopesForInterests(
  interests: string[],
  customInterest?: string
): FutureScopeItem[] {
  const scopes: FutureScopeItem[] = [];
  const seenFields = new Set<string>();

  for (const id of interests) {
    const domain = getInterestDomain(id);
    if (domain) {
      for (const s of domain.futureScopes) {
        if (!seenFields.has(s.field)) {
          seenFields.add(s.field);
          scopes.push(s);
        }
      }
    }
  }

  if (customInterest && customInterest.trim().length > 1) {
    const clean = customInterest.trim();
    scopes.unshift({
      field: `Applied ${clean} & Intelligent Systems`,
      horizon: '2026–2030 Emerging Specialization',
      outlook: `Combining domain expertise in ${clean} with data modeling, software engineering, and automated evaluation unlocks interdisciplinary leadership roles.`,
      roles: [`${clean} Technologist`, `Applied ${clean} Systems Engineer`, 'Domain AI Specialist'],
      keySkills: ['Problem Decomposition', 'Data & Experimentation', 'Full-Stack Prototyping', 'Domain Modeling'],
      capstoneIdea: `Design an interactive diagnostic or decision-support tool tailored specifically to ${clean}.`,
    });
  }

  if (scopes.length === 0) {
    return INTEREST_CATALOG[0].futureScopes;
  }
  return scopes;
}

export function pickRandomInterestQuestion(
  interests: string[],
  excludeQuestionIds: string[] = [],
  focusInterestId?: string,
  customInterest?: string
): InterestQuestion {
  let targetPool: InterestQuestion[] = [];

  if (focusInterestId) {
    targetPool = INTEREST_QUESTIONS.filter((q) => q.interestId === focusInterestId);
  }

  if (targetPool.length === 0 && interests.length > 0) {
    targetPool = INTEREST_QUESTIONS.filter((q) => interests.includes(q.interestId));
  }

  if (targetPool.length === 0) {
    targetPool = [...INTEREST_QUESTIONS];
  }

  const unseen = targetPool.filter((q) => !excludeQuestionIds.includes(q.id));
  const candidates = unseen.length > 0 ? unseen : targetPool;
  const randomIdx = Math.floor(Math.random() * candidates.length);
  const picked = candidates[randomIdx];

  // If user has a custom interest and no specific catalog focus, slightly personalize title context when falling back
  if (customInterest && customInterest.trim() && interests.length === 0) {
    return {
      ...picked,
      interestTitle: `${customInterest.trim()} (Cross-Domain Probe: ${picked.interestTitle})`,
      source: 'curated',
    };
  }

  return { ...picked, source: 'curated' };
}

export function evaluateInterestResponseDeterministic(
  question: InterestQuestion,
  selectedOptionId: string,
  reasoningText: string = ''
): InterestEvaluationResult {
  const chosen = question.options.find((o) => o.id === selectedOptionId) || question.options[0];
  const isCorrect = Boolean(chosen?.isCorrect);
  const trimmedReasoning = reasoningText.trim();
  const wordCount = trimmedReasoning ? trimmedReasoning.split(/\s+/).length : 0;

  // Compute deterministic response score (0..100)
  const difficultyBase =
    question.difficulty === 'advanced' ? 80 : question.difficulty === 'intermediate' ? 68 : 54;

  let responseScore = isCorrect ? difficultyBase : 28;
  if (wordCount >= 18) responseScore += 15;
  else if (wordCount >= 8) responseScore += 9;
  else if (wordCount >= 3) responseScore += 4;

  // Reward domain-analytical vocabulary in reasoning
  const analyticalMarkers = [
    'because', 'tradeoff', 'trade-off', 'latency', 'complexity', 'cache', 'invariant',
    'bias', 'salt', 'hash', 'concurrent', 'lock', 'atomic', 'variance', 'boundary',
    'scale', 'drift', 'entropy', 'queue', 'idempotent', 'partition', 'overflow',
  ];
  const lowerReason = trimmedReasoning.toLowerCase();
  const markerHits = analyticalMarkers.filter((m) => lowerReason.includes(m)).length;
  responseScore = Math.min(98, Math.max(20, responseScore + Math.min(8, markerHits * 3)));

  let responseLevel: ResponseLevelTier;
  if (responseScore >= 76) {
    responseLevel = 'Systems & Innovation Architect';
  } else if (responseScore >= 52) {
    responseLevel = 'Applied Builder';
  } else {
    responseLevel = 'Foundational Explorer';
  }

  const reasoningQuality =
    wordCount >= 12
      ? 'Detailed mechanistic reasoning provided'
      : wordCount >= 4
      ? 'Concise explanation provided'
      : 'Selection-only response (adding brief reasoning deepens level calibration)';

  const strengthsObserved: string[] = [];
  if (isCorrect) {
    strengthsObserved.push(`Accurate grasp of ${question.cognitiveSignal}`);
  } else {
    strengthsObserved.push(`Curiosity in tackling ${question.difficulty} ${question.interestTitle} scenarios`);
  }
  if (markerHits > 0) {
    strengthsObserved.push('Systems-oriented vocabulary in explanation');
  } else if (wordCount >= 6) {
    strengthsObserved.push('Clear articulation of thought process');
  } else {
    strengthsObserved.push('Quick diagnostic intuition');
  }

  const pivotMap = NEXT_FIELD_MATRIX[question.interestId] || NEXT_FIELD_MATRIX.ai_ml;
  const suggestedPivot = pivotMap[responseLevel];

  return {
    questionId: question.id,
    interestTitle: question.interestTitle,
    isCorrect,
    explanation: chosen?.explanation || 'Response evaluated against domain principles.',
    responseScore,
    responseLevel,
    reasoningQuality,
    strengthsObserved,
    suggestedPivot,
    evaluatedAt: new Date().toISOString(),
  };
}

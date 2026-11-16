import React from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  GitBranch,
  Activity,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const comparisonData = [
    {
      typical: "Binary score: marks question 'Wrong (-1)'",
      learntwin: "Diagnoses the precise flawed mental model (e.g. 'Believes recursive calls share local scope')",
    },
    {
      typical: "Prescribes more exercises on the same difficult topic",
      learntwin: "Traces backwards on the prerequisite DAG to fix the upstream root blocker first",
    },
    {
      typical: "Rigid one-size-fits-all syllabus or random quiz recommendations",
      learntwin: "Topological path synthesis with contextual multi-armed bandit format adaptation",
    },
    {
      typical: "Forgets what you learned until final exams or mock interviews fail",
      learntwin: "Exponential Ebbinghaus retention tracking with proactive micro-reviews before 70% decay",
    },
    {
      typical: "Black-box opaque curriculum changes",
      learntwin: "Visual Git-Style 'Path Diff' showing every added, removed, and reprioritized module",
    },
  ];

  const features = [
    {
      icon: Brain,
      title: "Mental Model Diagnostics",
      description: "Classifies free-text reasoning into documented cognitive misconceptions rather than superficial error counts.",
      badge: "Cognitive Engine",
    },
    {
      icon: GitBranch,
      title: "Root-Cause Prerequisite Trace",
      description: "When you struggle on advanced concepts like Backtracking, walks backward to uncover unmastered stack frames.",
      badge: "DAG Traversal",
    },
    {
      icon: Activity,
      title: "200-Run Monte Carlo Simulation",
      description: "Forecasts probabilistic readiness at your target deadline with empirical P10/P50/P90 confidence intervals.",
      badge: "Stochastic Modeling",
    },
    {
      icon: Clock,
      title: "Forgetting-Aware Scheduling",
      description: "Calculates individual half-life retention curves to prompt 3-question refreshers right before memory slips.",
      badge: "Ebbinghaus Decay",
    },
    {
      icon: Layers,
      title: "Visual Path Diff",
      description: "Git-style visual timeline: green strikethroughs for mastered topics and amber highlights for surfaced prerequisite gaps.",
      badge: "Adaptive Curriculum",
    },
    {
      icon: BarChart3,
      title: "Contextual Multi-Armed Bandit",
      description: "Learns whether video, article, practice, or worked-examples produce the highest mastery gain for your twin.",
      badge: "Personalized Modality",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Next-Generation Learning Digital Twin</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.12] text-balance">
              Every platform tells you what you got wrong.{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
                LearnTwin tells you why you think wrong.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
              Build your personal cognitive digital twin. Diagnose misconceptions, trace root causes on prerequisite graphs, simulate learning trajectories, and watch your roadmap adapt in real time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login?mode=register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Create Account & Explore Interests</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Sign In</span>
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
              >
                <span>How it Works</span>
              </a>
            </div>
          </div>

          {/* Interactive Knowledge Graph Hero Visual */}
          <div className="relative max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Prerequisite Failure Glow Simulation</span>
              </div>
              <div className="text-[11px]">Root Cause: Call Stack Frames → Downstream: Backtracking & Recursion</div>
            </div>

            <div className="relative h-64 md:h-80 w-full flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 700 240">
                <defs>
                  <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#F43F5E" />
                  </linearGradient>
                </defs>

                {/* Edges */}
                <line x1="120" y1="120" x2="280" y2="70" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="120" y1="120" x2="280" y2="170" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
                <line x1="280" y1="70" x2="480" y2="70" stroke="url(#edgeGlow)" strokeWidth="3" />
                <line x1="280" y1="170" x2="480" y2="170" stroke="#CBD5E1" strokeWidth="2" />
                <line x1="480" y1="70" x2="620" y2="120" stroke="#F43F5E" strokeWidth="3" />
                <line x1="480" y1="170" x2="620" y2="120" stroke="#CBD5E1" strokeWidth="2" />

                {/* Node 1: Variables & References */}
                <g transform="translate(120, 120)">
                  <circle r="26" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="2" />
                  <text y="4" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor">Variables</text>
                  <text y="42" textAnchor="middle" fontSize="9" fill="#10B981">92% Mastered</text>
                </g>

                {/* Node 2: Call Stack Frames (Root Blocker) */}
                <g transform="translate(280, 70)">
                  <circle r="30" fill="#F43F5E" fillOpacity="0.2" stroke="#F43F5E" strokeWidth="3" />
                  <text y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill="#F43F5E">Stack Frames</text>
                  <text y="44" textAnchor="middle" fontSize="9" fontWeight="600" fill="#F43F5E">ROOT CAUSE (28%)</text>
                </g>

                {/* Node 3: Mutability & Aliasing */}
                <g transform="translate(280, 170)">
                  <circle r="24" fill="#F59E0B" fillOpacity="0.15" stroke="#F59E0B" strokeWidth="2" />
                  <text y="4" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor">Mutability</text>
                  <text y="40" textAnchor="middle" fontSize="9" fill="#F59E0B">42% Shaky</text>
                </g>

                {/* Node 4: Recursion Anatomy */}
                <g transform="translate(480, 70)">
                  <circle r="26" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="2" />
                  <text y="4" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor">Recursion</text>
                  <text y="42" textAnchor="middle" fontSize="9" fill="#F59E0B">Blocked by Root</text>
                </g>

                {/* Node 5: Arrays & Slicing */}
                <g transform="translate(480, 170)">
                  <circle r="24" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="2" />
                  <text y="4" textAnchor="middle" fontSize="10" fontWeight="600" fill="currentColor">Arrays</text>
                  <text y="40" textAnchor="middle" fontSize="9" fill="#10B981">85% Mastered</text>
                </g>

                {/* Node 6: Backtracking (Failed Symptom) */}
                <g transform="translate(620, 120)">
                  <circle r="30" fill="#F43F5E" fillOpacity="0.2" stroke="#F43F5E" strokeWidth="2" />
                  <text y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor">Backtracking</text>
                  <text y="46" textAnchor="middle" fontSize="9" fill="#F43F5E">Repeated Error Loop</text>
                </g>
              </svg>
            </div>

            <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">LearnTwin Diagnostic:</span>
                <span className="text-slate-600 dark:text-slate-300">
                  Fixing <strong>Call Stack Frames</strong> first eliminates repeated failures in Backtracking and saves an estimated <strong>12 study days</strong>.
                </span>
              </div>
              <Link to="/graph" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline shrink-0">
                Explore Full Graph →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cohort Impact Metrics Strip */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                42%
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Fewer Steps to 85% Mastery vs Fixed Order
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                12.4 Days
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Average Saved per Learner by Fixing Root Causes
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-violet-600 dark:text-violet-400 tabular-nums">
                78%
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Failure Dropout Prevention Rate
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-sky-600 dark:text-sky-400 tabular-nums">
                200 Runs
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                Monte Carlo Stochastic Path Projections
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs LearnTwin Comparison */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            Why Traditional Practice Platforms Fail You
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
            When you fail a problem on standard practice sites, they tell you what you got wrong and dump 10 more problems on the same topic. LearnTwin fixes the root mental model.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            {/* Traditional Platforms */}
            <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-2 mb-6">
                <XCircle className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Typical Practice Platform
                </h3>
              </div>
              <div className="space-y-6">
                {comparisonData.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-mono text-xs text-rose-500 mt-0.5">✕</span>
                    <span>{item.typical}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LearnTwin Digital Twin */}
            <div className="p-6 md:p-8 bg-indigo-50/30 dark:bg-indigo-950/20">
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-200">
                  LearnTwin Cognitive Digital Twin
                </h3>
              </div>
              <div className="space-y-6">
                {comparisonData.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs md:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">✓</span>
                    <span>{item.learntwin}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Feature Cards */}
      <section className="py-20 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
              Architected for Deep Cognitive Retention
            </h2>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
              Six deterministic scientific pillars that turn guesswork into measurable mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-3">
            The 4-Stage Adaptive Feedback Loop
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
            How your digital twin continually monitors, traces, and updates your optimal roadmap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-3xl font-extrabold text-indigo-200 dark:text-indigo-950 mb-2">01</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Diagnose</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Take short diagnostic probes. Enter your natural thought process; our AI classifies the precise mental model error.
            </p>
          </div>

          <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-3xl font-extrabold text-violet-200 dark:text-violet-950 mb-2">02</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Trace</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Walk backwards along the prerequisite DAG. Isolate the exact root-cause blocker causing cascading failures.
            </p>
          </div>

          <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-3xl font-extrabold text-sky-200 dark:text-sky-950 mb-2">03</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Simulate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Run 200 Monte Carlo paths against your hours per week. View P10/P50/P90 confidence bands to ensure on-time readiness.
            </p>
          </div>

          <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="text-3xl font-extrabold text-emerald-200 dark:text-emerald-950 mb-2">04</div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Adapt & Diff</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Watch your curriculum dynamically reorder. Mastered skills graduate; critical root causes jump ahead with full Git-style diffs.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-950 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
            Ready to discover what you really think wrong?
          </h2>
          <p className="text-indigo-200 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Choose a demo persona with pre-loaded gaps or calibrate your own digital twin in under 3 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login?mode=register"
              className="px-6 py-3.5 rounded-xl font-bold bg-white text-indigo-950 hover:bg-indigo-50 shadow-lg hover:scale-105 transition-all text-sm"
            >
              Create Account & Set Interests
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl font-semibold bg-indigo-800/60 hover:bg-indigo-800 text-white border border-indigo-700/60 transition-colors text-sm"
            >
              Sign In to Existing Twin
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-slate-500 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-400">LearnTwin Platform</span>
            <span>·</span>
            <span>Intelligent Cognitive Digital Twin</span>
          </div>
          <div>
            Privacy Note: Learner models and BKT estimates are fully exportable and resettable in Settings.
          </div>
        </div>
      </footer>
    </div>
  );
};

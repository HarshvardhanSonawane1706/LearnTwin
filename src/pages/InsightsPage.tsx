import React, { useState, useEffect } from "react";
import { api } from "../api";
import {
  LineChart,
  BarChart3,
  Sparkles,
  Users,
  TrendingUp,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export const InsightsPage: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [studentCount, setStudentCount] = useState<number>(100);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const runSimulation = async () => {
    setIsRunning(true);
    try {
      const data = await api.runCohortSimulation(studentCount);
      setResults(data);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            Empirical Proof of Efficacy
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Cohort Proof & Synthetic Benchmarks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comparing 100 heterogeneous learners: LearnTwin adaptive path vs conventional fixed-order curriculum
          </p>
        </div>

        <button
          onClick={runSimulation}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
          <span>{isRunning ? "Simulating Cohort..." : "Re-Run 100-Student Cohort"}</span>
        </button>
      </div>

      {/* KPI Proof Strip */}
      {results && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Steps to 85% Mastery
            </div>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {results.stepsSavedPercent}% Fewer
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Adaptive ({results.adaptiveAvgSteps}) vs Fixed ({results.fixedAvgSteps})
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Dropout Prevention
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {results.dropoutsPreventedPercent}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Removes cognitive frustration walls
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              LearnTwin Avg Steps
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {results.adaptiveAvgSteps}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Mean practice sessions to mastery
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Fixed-Order Avg Steps
            </div>
            <div className="text-3xl font-extrabold text-slate-400 tabular-nums">
              {results.fixedAvgSteps}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Suffers from repeat failure loops
            </div>
          </div>
        </div>
      )}

      {/* Distribution Comparison Chart */}
      {results && results.distribution && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-6 max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Student Learning Efficiency Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Number of synthetic learners reaching 85% mastery per step bucket
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <span className="w-3 h-3 rounded bg-indigo-600" /> LearnTwin Adaptive
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700" /> Fixed-Order Baseline
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {results.distribution.map((item: any) => {
              const maxCount = Math.max(
                ...results.distribution.map((d: any) => Math.max(d.adaptive, d.fixed)),
                30
              );

              const adaptWidth = (item.adaptive / maxCount) * 100;
              const fixedWidth = (item.fixed / maxCount) * 100;

              return (
                <div key={item.bucket} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{item.bucket}</span>
                    <span className="tabular-nums">
                      {item.adaptive} students (LearnTwin) vs {item.fixed} (Fixed)
                    </span>
                  </div>

                  {/* Dual comparative bars */}
                  <div className="space-y-1">
                    <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden flex">
                      <div
                        style={{ width: `${adaptWidth}%` }}
                        className="bg-indigo-600 dark:bg-indigo-500 rounded-md transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-bold text-white tabular-nums"
                      >
                        {item.adaptive > 0 ? item.adaptive : ""}
                      </div>
                    </div>
                    <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden flex">
                      <div
                        style={{ width: `${fixedWidth}%` }}
                        className="bg-slate-400 dark:bg-slate-600 rounded-md transition-all duration-700 flex items-center justify-end pr-2 text-[10px] font-bold text-white tabular-nums"
                      >
                        {item.fixed > 0 ? item.fixed : ""}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong>Why LearnTwin Outperforms:</strong> Conventional syllabi mandate that a student struggling on Backtracking or Memoization simply tries more problems on those advanced topics. LearnTwin immediately routes back to Call Stack Memory Frames and Mutability Aliasing, resolves the underlying misconception in 1–2 steps, and prevents compounding failure loops.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

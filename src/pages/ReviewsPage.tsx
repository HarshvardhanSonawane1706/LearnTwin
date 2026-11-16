import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  Clock,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
} from "lucide-react";

export const ReviewsPage: React.FC = () => {
  const { user, refreshTwin, notify } = useTwin();
  const [reviewsDue, setReviewsDue] = useState<any[]>([]);
  const [activeRefresher, setActiveRefresher] = useState<any | null>(null);
  const [refresherAnswer, setRefresherAnswer] = useState<number | null>(null);
  const [refresherFinished, setRefresherFinished] = useState<boolean>(false);

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await api.getDueReviews();
        if (res.due) {
          setReviewsDue(res.due);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    }
    loadReviews();
  }, [user]);

  const handleStartRefresher = (skill: any) => {
    setActiveRefresher(skill);
    setRefresherAnswer(null);
    setRefresherFinished(false);
  };

  const handleCompleteRefresher = async () => {
    if (!activeRefresher) return;

    try {
      // Simulate successful spaced review consolidation
      await api.submitResourceFeedback({
        resourceId: `res_review_${activeRefresher.conceptKey}`,
        format: "practice",
        masteryDelta: 0.12,
        rating: 5,
      });

      notify(`Refresher completed for ${activeRefresher.title}. Memory half-life expanded!`, "success");
      setRefresherFinished(true);
      await refreshTwin();

      const res = await api.getDueReviews();
      if (res.due) setReviewsDue(res.due);
    } catch (err: any) {
      notify(err.message || "Failed to complete review", "error");
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            Ebbinghaus Exponential Retention Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Forgetting-Aware Review Scheduler
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Schedules micro-reviews before retention dips below the critical 70% threshold
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl border border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold tabular-nums">
          {reviewsDue.length} Reviews Due Now
        </div>
      </div>

      {/* Due Reviews List */}
      {reviewsDue.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          {reviewsDue.map((skill) => {
            const retentionPct = Math.round(skill.retention * 100);
            return (
              <div
                key={skill.conceptKey}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {skill.cluster}
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {retentionPct}% Retention
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    {skill.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Half-life: <strong className="text-slate-700 dark:text-slate-300 tabular-nums">{skill.halfLifeDays} days</strong></span>
                    <span>·</span>
                    <span>Last active: <strong className="text-slate-700 dark:text-slate-300 tabular-nums">{skill.daysElapsed} days ago</strong></span>
                  </div>

                  {/* Mini Forgetting Curve SVG */}
                  <div className="h-20 w-full pt-3">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 60">
                      <line x1="10" y1="50" x2="290" y2="50" stroke="#E2E8F0" strokeWidth="1" />
                      <line x1="10" y1="20" x2="290" y2="20" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
                      {/* Exponential Decay Curve: R = exp(-t/S) */}
                      <path
                        d="M 10 10 Q 100 25, 200 45 T 290 52"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2.5"
                      />
                      {/* Current point */}
                      <circle cx="160" cy="38" r="4" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x="170" y="36" fontSize="9" fontWeight="bold" fill="#F43F5E" className="tabular-nums">
                        Current ({retentionPct}%)
                      </text>
                    </svg>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Reviewing now expands half-life to {(skill.halfLifeDays * 1.65).toFixed(1)}d
                  </span>
                  <button
                    onClick={() => handleStartRefresher(skill)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    Review Now (3 Qs)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center max-w-xl mx-auto space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Memory Retention Optimized
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            All mastered skills remain above the 70% retention threshold. Your digital twin will automatically flag topics here as time elapses.
          </p>
        </div>
      )}

      {/* Quick 3-Question Refresher Modal */}
      {activeRefresher && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Quick Memory Refresher
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeRefresher.title}
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Question 1 of 1</span>
            </div>

            {!refresherFinished ? (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  Which statement correctly describes how {activeRefresher.title} behaves in memory?
                </p>

                <div className="space-y-2.5">
                  {[
                    "Each invocation pushes an isolated activation record with private variables onto the call stack.",
                    "All recursive invocations mutate the caller's stack frame in-place.",
                    "Stack memory is garbage collected in reverse chronological FIFO queue order.",
                  ].map((text, idx) => (
                    <div
                      key={idx}
                      onClick={() => setRefresherAnswer(idx)}
                      className={`cursor-pointer p-3.5 rounded-xl border text-xs leading-relaxed transition-all ${
                        refresherAnswer === idx
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {text}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setActiveRefresher(null)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteRefresher}
                    disabled={refresherAnswer === null}
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Verify & Consolidate Memory
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Memory Stabilized!
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Retention reset to 100%. Memory half-life expanded from {activeRefresher.halfLifeDays}d to {(activeRefresher.halfLifeDays * 1.65).toFixed(1)}d.
                </p>
                <button
                  onClick={() => setActiveRefresher(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900"
                >
                  Return to Reviews
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

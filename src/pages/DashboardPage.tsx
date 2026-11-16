import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import { ProgressRing } from "../components/common/ProgressRing";
import {
  Flame,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  GitCompare,
  RotateCcw,
  BookOpen,
  Calendar,
  Layers,
  Clock,
  ChevronRight,
  TrendingUp,
  Compass,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user, twin, goal, interestProfile, refreshTwin } = useTwin();
  const [latestPath, setLatestPath] = useState<any>(null);
  const [reviewsDue, setReviewsDue] = useState<any[]>([]);
  const [diffSummary, setDiffSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [pathRes, reviewsRes, diffRes] = await Promise.all([
          api.getPath(),
          api.getDueReviews(),
          api.getDiffHistory(),
        ]);

        if (pathRes.snapshot) {
          setLatestPath(pathRes.snapshot);
        }
        if (reviewsRes.due) {
          setReviewsDue(reviewsRes.due);
        }
        if (diffRes.snapshots && diffRes.snapshots.length > 0) {
          const latestSnap = diffRes.snapshots[diffRes.snapshots.length - 1];
          setDiffSummary(latestSnap.diffFromPrevious);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const readinessScore = twin?.overallReadiness || 58;
  const streak = twin?.streakDays || 5;

  // Next best action: find first current or upcoming module in path
  const nextModule = latestPath?.modules?.find(
    (m: any) => m.status === "current" || (m.status !== "mastered" && m.status !== "blocked")
  ) || latestPath?.modules?.[0];

  // Top diagnosed misconception
  const topMisconception = twin?.misconceptions?.[0];

  // Topic cluster groupings for mastery heatmap
  const clusters = [
    { name: "Foundations & Memory", keys: ["variables_and_references", "mutability_aliasing", "scope_and_closures", "call_stack_frames"] },
    { name: "Recursion & Backtracking", keys: ["recursion_anatomy", "recursion_base_cases", "backtracking_and_rollback"] },
    { name: "Linear Data Structures", keys: ["big_o_analysis", "arrays_and_slicing", "two_pointers", "linked_lists", "stacks_and_queues", "hash_tables_sets"] },
    { name: "Trees & Graphs", keys: ["tree_fundamentals", "tree_traversals", "binary_search_trees", "graph_traversal_bfs_dfs", "topological_sort"] },
    { name: "Dynamic Programming", keys: ["dp_overlapping_subproblems", "dp_memoization_topdown", "dp_optimal_substructure", "dp_tabulation_bottomup"] },
  ];

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-8">
      {/* Header Greeting Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            Learning Digital Twin Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name || "Student"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Targeting: <strong className="text-slate-700 dark:text-slate-300">{goal?.targetProfile || "Crack Coding Interviews"}</strong> · {goal?.hoursPerWeek || 5} hrs/wk pace
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-amber-200/60 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="tabular-nums">{streak} Day Streak</span>
          </div>

          <Link
            to="/quiz"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Diagnostic Quiz</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Readiness Score Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Twin Readiness Index
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Bayesian Knowledge Tracing (BKT)
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Projected: <strong className="text-slate-800 dark:text-slate-200">Dec 14, 2026</strong></span>
            </div>
          </div>
          <ProgressRing
            progress={readinessScore}
            size={100}
            strokeWidth={8}
            colorScheme={readinessScore >= 75 ? "emerald" : readinessScore >= 50 ? "indigo" : "amber"}
          />
        </div>

        {/* Decaying Skills Alert Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Memory Decay Alert
              </span>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {reviewsDue.length} Due Soon
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              {reviewsDue[0]?.title || "All Skills Stabilized"}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {reviewsDue[0]
                ? `Retention is at ${Math.round(reviewsDue[0].retention * 100)}%. Quick 3-min refresher resets forgetting curve.`
                : "No skills have dropped below 70% retention threshold."}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              to="/reviews"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Review Scheduler</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top Diagnosed Misconception Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Diagnosed False Belief
              </span>
              {topMisconception && (
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                  {Math.round(topMisconception.confidence * 100)}% Confident
                </span>
              )}
            </div>
            <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">
              {topMisconception ? "Active Mental Model Flaw" : "No Critical Misconceptions"}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
              {topMisconception?.description || "Your conceptual models align with canonical computer science principles."}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link
              to="/graph"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Trace Root Cause on Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Student Interests, Future Scope & Adaptive Field Pivot */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Compass className="w-4 h-4" />
              <span>Interests, Future Scope & Next Field Discovery</span>
            </div>
            {interestProfile && (interestProfile.interests.length > 0 || interestProfile.customInterest) ? (
              <>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {interestProfile.lastEvaluation?.suggestedPivot
                    ? `Recommended Next Field (${interestProfile.lastEvaluation.responseLevel}): ${interestProfile.lastEvaluation.suggestedPivot.suggestedField}`
                    : `Future Scope Active: ${interestProfile.futureScopes?.[0]?.field || "Personalized Track"}`}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {interestProfile.lastEvaluation?.suggestedPivot
                    ? interestProfile.lastEvaluation.suggestedPivot.whyThisFitsYourLevel
                    : interestProfile.futureScopes?.[0]?.outlook ||
                      "Explore randomized interest questions to calibrate your response level and unlock adjacent career fields."}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Tell LearnTwin Your Learning Interests
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Select your interests to generate tailored Future Scope projections, practice random interest-aligned questions, and discover adjacent fields based on your response level.
                </p>
              </>
            )}
          </div>

          <Link
            to="/scope"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {interestProfile && (interestProfile.interests.length > 0 || interestProfile.customInterest)
                ? "Explore Questions & Scope"
                : "Set Interests & Future Scope"}
            </span>
          </Link>
        </div>
      </div>

      {/* Next Best Action Card (Topological + Bandit Recommendation) */}
      {nextModule && (
        <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/20 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-600 text-white">
                  Next Best Action
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {nextModule.reason?.summary || "Recommended Milestone"}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {nextModule.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {nextModule.reason?.detail}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Format: <strong className="text-slate-800 dark:text-slate-200 uppercase">{nextModule.recommendedResource?.format?.replace('_', ' ')}</strong></span>
                <span>·</span>
                <span>Duration: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{nextModule.estimatedMinutes} mins</strong></span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                  +{nextModule.formatBoostPercent || 14}% mastery boost for your twin
                </span>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
              <Link
                to="/path"
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] text-center"
              >
                Launch Recommended Resource
              </Link>
              <Link
                to="/diff"
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>View Recent Path Diff</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mastery Heatmap by Topic Cluster */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Cognitive Mastery Heatmap
            </h2>
            <p className="text-xs text-slate-500">
              Real-time skill mastery across the 5 prerequisite clusters
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> ≥80% Mastered</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> 40–79% Shaky</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> &lt;40% Gap</span>
          </div>
        </div>

        <div className="space-y-6">
          {clusters.map((cluster) => {
            return (
              <div key={cluster.name}>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                  {cluster.name}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {cluster.keys.map((key) => {
                    const skill = twin?.skills?.[key];
                    const mastery = skill ? skill.mastery : 0.20;
                    const percent = Math.round(mastery * 100);

                    const colorClass =
                      percent >= 80
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60"
                        : percent >= 45
                        ? "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800/60"
                        : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/60";

                    return (
                      <div
                        key={key}
                        className={`p-2.5 rounded-xl border transition-all ${colorClass}`}
                      >
                        <div className="text-[11px] font-semibold truncate capitalize">
                          {key.replace(/_/g, " ")}
                        </div>
                        <div className="text-xs font-bold tabular-nums mt-1">
                          {percent}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

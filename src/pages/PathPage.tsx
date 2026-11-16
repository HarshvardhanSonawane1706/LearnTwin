import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  GitCompare,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Video,
  FileText,
  Code,
  CheckSquare,
  Star,
  ExternalLink,
  RotateCcw,
} from "lucide-react";

export const PathPage: React.FC = () => {
  const { user, refreshTwin, notify } = useTwin();
  const [snapshot, setSnapshot] = useState<any>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [ratingModal, setRatingModal] = useState<{ open: boolean; module: any } | null>(null);
  const [ratingVal, setRatingVal] = useState<number>(5);

  useEffect(() => {
    async function loadPath() {
      try {
        const res = await api.getPath();
        if (res.snapshot) {
          setSnapshot(res.snapshot);
        }
      } catch (err) {
        console.error("Error loading path:", err);
      }
    }
    loadPath();
  }, [user]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await api.regeneratePath();
      setSnapshot(res.snapshot);
      await refreshTwin();
      notify("Path synthesized against latest twin parameters", "success");
    } catch (err: any) {
      notify(err.message || "Failed to regenerate path", "error");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCompleteModule = async (mod: any) => {
    try {
      // Simulate resource feedback and bandit reinforcement
      await api.submitResourceFeedback({
        resourceId: mod.recommendedResource?.id || "res_default",
        format: mod.recommendedResource?.format || "worked_example",
        masteryDelta: 0.15,
        rating: ratingVal,
      });

      notify(`Completed "${mod.title}". Bandit rewarded for ${mod.recommendedResource?.format} format.`, "success");
      setRatingModal(null);
      await refreshTwin();

      // Refresh path to show progression
      const pathRes = await api.regeneratePath();
      setSnapshot(pathRes.snapshot);
    } catch (err: any) {
      notify(err.message || "Failed to complete module", "error");
    }
  };

  const modules = snapshot?.modules || [];

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "video":
        return <Video className="w-3.5 h-3.5 text-rose-500" />;
      case "article":
        return <FileText className="w-3.5 h-3.5 text-sky-500" />;
      case "practice":
        return <Code className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <CheckSquare className="w-3.5 h-3.5 text-violet-500" />;
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            Topologically Sorted Adaptive Roadmap
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            My Learning Path
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Prerequisite DAG ordered, root-cause prioritized, with bandit-personalized resources
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/diff"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5 text-indigo-500" />
            <span>View Path Diff</span>
          </Link>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Synthesizing..." : "Regenerate Path"}</span>
          </button>
        </div>
      </div>

      {/* Modules Timeline */}
      <div className="space-y-4 max-w-4xl">
        {modules.map((mod: any, index: number) => {
          const isExpanded = expandedIndex === index;
          const isMastered = mod.status === "mastered";
          const isCurrent = mod.status === "current";
          const isRootCause = mod.reason?.category === "root_cause";
          const isMisconception = mod.reason?.category === "active_misconception";
          const isReviewDue = mod.reason?.category === "review_decay";

          let statusTag = "Upcoming Milestone";
          let badgeColor = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
          if (isMastered) {
            statusTag = "Mastered (≥85%)";
            badgeColor = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300";
          } else if (isRootCause) {
            statusTag = "Root Cause Blocker";
            badgeColor = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300";
          } else if (isMisconception) {
            statusTag = "Mental Model Gap";
            badgeColor = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300";
          } else if (isReviewDue) {
            statusTag = "Review Due";
            badgeColor = "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300";
          } else if (isCurrent) {
            statusTag = "Current Focus";
            badgeColor = "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300";
          }

          return (
            <div
              key={mod.conceptKey}
              className={`rounded-2xl border transition-all ${
                isCurrent
                  ? "border-indigo-600/70 bg-white dark:bg-slate-900 shadow-md ring-1 ring-indigo-500/10"
                  : isMastered
                  ? "border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40 opacity-80"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
              }`}
            >
              {/* Card Header Row */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="p-5 cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-400 tabular-nums w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-base font-bold ${isMastered ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                        {mod.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${badgeColor}`}>
                        {statusTag}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>{mod.cluster}</span>
                      <span>·</span>
                      <span>{mod.estimatedMinutes} mins</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{mod.formatBoostPercent || 12}% Boost
                    </span>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {mod.recommendedResource?.format?.replace("_", " ")}
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable Explanation & Resource Deck */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-4 animate-in fade-in">
                  {/* Why this recommendation box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Why this module is scheduled here:</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {mod.reason?.detail}
                    </p>
                    <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2 pt-1 font-mono">
                      <span>Inputs used:</span>
                      {mod.reason?.inputsUsed?.map((inp: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300">
                          {inp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Bandit Resource */}
                  {mod.recommendedResource && (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                            {getFormatIcon(mod.recommendedResource.format)}
                            <span>{mod.recommendedResource.format?.replace("_", " ")}</span>
                          </span>
                          <span className="text-[11px] text-slate-400">· {mod.recommendedResource.durationMin} mins</span>
                          <span className="text-[11px] text-slate-400">· {mod.recommendedResource.authorOrSource}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {mod.recommendedResource.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setRatingModal({ open: true, module: mod })}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                        >
                          Mark Completed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resource Completion & Rating Modal */}
      {ratingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Complete {ratingModal.module.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              How effective was this {ratingModal.module.recommendedResource?.format} resource for your understanding? This updates the Multi-Armed Bandit weights for your twin.
            </p>

            <div className="flex items-center justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingVal(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform"
                >
                  <Star className={`w-7 h-7 ${star <= ratingVal ? "fill-amber-400" : "stroke-slate-300"}`} />
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRatingModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCompleteModule(ratingModal.module)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save & Update Twin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

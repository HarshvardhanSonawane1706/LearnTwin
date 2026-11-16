import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  GitCompare,
  PlusCircle,
  MinusCircle,
  ArrowRightLeft,
  History,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const DiffPage: React.FC = () => {
  const { user } = useTwin();
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDiffs() {
      try {
        const res = await api.getDiffHistory();
        if (res.snapshots && res.snapshots.length > 0) {
          setSnapshots(res.snapshots);
          setSelectedIndex(res.snapshots.length - 1);
        }
      } catch (err) {
        console.error("Failed to load diff history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDiffs();
  }, [user]);

  const currentSnapshot = snapshots[selectedIndex];
  const diff = currentSnapshot?.diffFromPrevious;

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            Git-Style Curriculum Adaptation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Visual Path Diff
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Transparent breakdown of every removed, added, and reordered milestone
          </p>
        </div>

        {/* Diff History Selector */}
        {snapshots.length > 1 && (
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
              className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden"
            >
              {snapshots.map((s, idx) => (
                <option key={s.id} value={idx}>
                  Revision #{idx + 1} · {new Date(s.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {diff ? (
        <div className="space-y-6 max-w-4xl">
          {/* Removed / Mastered Modules */}
          {diff.removed && diff.removed.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                <MinusCircle className="w-4 h-4 text-emerald-600" />
                <span>Removed / Mastered ({diff.removed.length})</span>
              </div>
              <div className="space-y-2">
                {diff.removed.map((item: any) => (
                  <div
                    key={item.conceptKey}
                    className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/60 dark:border-emerald-800/60 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold line-through text-slate-400 dark:text-slate-500">
                        {item.title}
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                        {item.reason}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                      Mastered
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Added / Newly Discovered Gaps */}
          {diff.added && diff.added.length > 0 && (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                <PlusCircle className="w-4 h-4 text-rose-600" />
                <span>Inserted Prerequisite Gaps ({diff.added.length})</span>
              </div>
              <div className="space-y-2">
                {diff.added.map((item: any) => (
                  <div
                    key={item.conceptKey}
                    className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200/60 dark:border-rose-800/60 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                        {item.reason}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                      {item.priority === "high" ? "High Priority Gap" : "Milestone Added"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reordered Dependencies */}
          {diff.reordered && diff.reordered.length > 0 && (
            <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
                <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                <span>Topologically Reordered ({diff.reordered.length})</span>
              </div>
              <div className="space-y-2">
                {diff.reordered.map((item: any) => (
                  <div
                    key={item.conceptKey}
                    className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-indigo-200/60 dark:border-indigo-800/60 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                          (#{item.oldIndex + 1} → #{item.newIndex + 1})
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.reason}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                      Re-Prioritized
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center max-w-xl mx-auto space-y-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Current Plan is Synchronized
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Take a 6-question diagnostic probe to discover mental model nuances; any newly revealed root cause will immediately render as a visual diff here.
          </p>
          <div className="pt-2">
            <Link
              to="/quiz"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <span>Take Diagnostic Probe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

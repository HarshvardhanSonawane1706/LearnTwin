import React, { useState } from "react";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  Settings,
  Download,
  Trash2,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { user, goal, setGoal, theme, toggleTheme, refreshTwin, notify } = useTwin();

  const [hours, setHours] = useState<number>(goal?.hoursPerWeek || 5);
  const [profile, setProfile] = useState<any>(goal?.targetProfile || "Crack Coding Interviews");
  const [deadline, setDeadline] = useState<number>(goal?.deadlineWeeks || 8);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveGoal = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateGoal({
        hoursPerWeek: hours,
        targetProfile: profile,
        deadlineWeeks: deadline,
      });
      setGoal(res.goal);
      notify("Learning goals and twin parameters updated", "success");
      await refreshTwin();
    } catch (err: any) {
      notify(err.message || "Failed to update goals", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTwin = async () => {
    try {
      await api.resetTwin();
      notify("Digital Twin state reset to baseline", "info");
      setConfirmResetOpen(false);
      await refreshTwin();
    } catch (err: any) {
      notify(err.message || "Failed to reset twin", "error");
    }
  };

  const handleExportJson = () => {
    window.location.href = api.getExportUrl();
    notify("Downloading Digital Twin export (JSON)...", "info");
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          Preferences & Governance
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings & Twin Data
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your cognitive parameters, export your digital twin, and inspect algorithmic explainability
        </p>
      </div>

      <div className="max-w-3xl space-y-8">
        {/* Appearance Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Interface Theme
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {theme === "light" ? "Light Mode Active" : "Dark Mode Active"}
              </div>
              <div className="text-xs text-slate-500">
                Optimized high-contrast palette with soft neutral backgrounds
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>Switch to {theme === "light" ? "Dark" : "Light"}</span>
            </button>
          </div>
        </div>

        {/* Goal Calibration Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Objective & Study Velocity
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Target Profile
              </label>
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value as any)}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="Crack Coding Interviews">Crack Coding Interviews (DP, Graphs, Trees)</option>
                <option value="Master DSA Basics">Master DSA Basics (Linear, Recursion, Big-O)</option>
                <option value="Python Backend Mastery">Python Backend Mastery (Memory, Mutability, Scopes)</option>
                <option value="Advanced Algorithms">Advanced Algorithms (Optimization & DAGs)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Weekly Study Hours ({hours} hrs/wk)
                </label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Deadline Horizon ({deadline} weeks)
                </label>
                <input
                  type="range"
                  min="2"
                  max="24"
                  step="1"
                  value={deadline}
                  onChange={(e) => setDeadline(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveGoal}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
              >
                {isSaving ? "Saving..." : "Save Goal Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Data Ownership & Export */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Digital Twin Data Ownership
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your learning digital twin belongs strictly to you. Export your complete parameter state, Bayesian history, diagnosed mental models, and path revisions as a standard JSON file anytime.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Export My Twin (JSON)</span>
            </button>

            <button
              onClick={() => setConfirmResetOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Twin to Baseline</span>
            </button>
          </div>
        </div>

        {/* Algorithmic Explainability & Principles Note */}
        <div className="p-6 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Algorithmic Transparency & Explainability</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Bayesian Knowledge Tracing (BKT)</strong> updates posterior mastery probabilities mathematically after every single answer, balancing slips and lucky guesses.
            </p>
            <p>
              • <strong>Root Cause DAG Traversal</strong> runs deterministic reverse-breadth-first searches on prerequisite graphs to isolate upstream blockers before students experience repeated failures.
            </p>
            <p>
              • <strong>Ebbinghaus Retention</strong> tracks exponential forgetting decay and schedules quick refreshers before retention slips below 70%.
            </p>
            <p>
              • <strong>Contextual Multi-Armed Bandit</strong> personalizes resource formats (video vs worked-examples vs practice) dynamically based on measured mastery gains.
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Reset Digital Twin State?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will reset your Bayesian skill probabilities, clear all diagnosed misconceptions, and revert your learning path back to initial baseline.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleResetTwin}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

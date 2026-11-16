import React, { useState, useEffect } from "react";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  Compass,
  Sparkles,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  Sliders,
  ArrowRight,
} from "lucide-react";

export const SimulatePage: React.FC = () => {
  const { user, goal, setGoal, notify } = useTwin();
  const [candidatePaths, setCandidatePaths] = useState<any[]>([]);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(goal?.hoursPerWeek || 5);
  const [selectedPathId, setSelectedPathId] = useState<string>("path-balanced");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    async function runSim() {
      setIsSimulating(true);
      try {
        const res = await api.simulatePaths(hoursPerWeek);
        if (res.paths) {
          setCandidatePaths(res.paths);
        }
      } catch (err) {
        console.error("Simulation error:", err);
      } finally {
        setIsSimulating(false);
      }
    }

    const timer = setTimeout(runSim, 250);
    return () => clearTimeout(timer);
  }, [hoursPerWeek, user]);

  const handleSelectPath = async (path: any) => {
    setSelectedPathId(path.id);
    try {
      const res = await api.updateGoal({
        hoursPerWeek: path.weeklyHours,
      });
      setGoal(res.goal);
      notify(`Selected ${path.label} (${path.weeklyHours} hrs/wk pace). Roadmap updated.`, "success");
    } catch (err: any) {
      notify(err.message || "Failed to update strategy", "error");
    }
  };

  const activePath = candidatePaths.find((p) => p.id === selectedPathId) || candidatePaths[0];

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            200 Stochastic Monte Carlo Runs
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Path Simulator & Horizon Forecasting
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulates future mastery trajectories under difficulty fluctuations and forgetting decay
          </p>
        </div>

        {/* What-if interactive hours slider */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm min-w-[280px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>What-If Hours/Week</span>
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {hoursPerWeek} hrs/wk
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="18"
            step="1"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* 3 Candidate Strategy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {candidatePaths.map((path) => {
          const isSelected = selectedPathId === path.id;
          return (
            <div
              key={path.id}
              onClick={() => handleSelectPath(path)}
              className={`cursor-pointer rounded-2xl border p-6 transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-600 bg-white dark:bg-slate-900 shadow-md ring-2 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {path.focusStyle} · {path.weeklyHours} hrs/wk
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Plan</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {path.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {path.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Readiness at Deadline:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {path.readinessAtDeadline}%
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Projected Date (85%):</span>
                    <strong className="text-slate-800 dark:text-slate-200 tabular-nums">
                      {path.predictedReadyDate}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectPath(path);
                }}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                <span>{isSelected ? "Current Selected Track" : "Choose This Path"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confidence Band Visualizer (P10 / P50 / P90) */}
      {activePath && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Monte Carlo Projection:
                </span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {activePath.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                P10 (conservative risk), P50 (median expected), and P90 (optimistic mastery acceleration)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-emerald-500" /> P90 Optimistic
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-indigo-600" /> P50 Median Expected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-amber-500" /> P10 Conservative
              </span>
            </div>
          </div>

          {/* SVG Area Chart of 200 Monte Carlo simulations */}
          <div className="h-64 sm:h-72 w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240">
              <defs>
                <linearGradient id="bandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.03" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[25, 50, 75, 85, 100].map((level) => {
                const y = 220 - (level / 100) * 200;
                return (
                  <g key={level}>
                    <line x1="50" y1={y} x2="780" y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="42" y={y + 4} textAnchor="end" fontSize="10" className="fill-slate-400 font-mono">
                      {level}%
                    </text>
                  </g>
                );
              })}

              {/* Target 85% Mastery Threshold Line */}
              <line x1="50" y1="50" x2="780" y2="50" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="775" y="44" textAnchor="end" fontSize="10" fontWeight="bold" fill="#10B981">
                Target Mastery Invariant (85%)
              </text>

              {/* Construct SVG Paths */}
              {(() => {
                const weeks = activePath.weeks || [];
                const stepX = (780 - 60) / Math.max(1, weeks.length - 1);

                // Build P90 points
                const p90Points = activePath.p90.map((val: number, i: number) => {
                  const x = 60 + i * stepX;
                  const y = 220 - (val / 100) * 200;
                  return `${x},${y}`;
                });

                // Build P10 points reversed for area band
                const p10PointsRev = activePath.p10.slice().reverse().map((val: number, i: number) => {
                  const revIdx = weeks.length - 1 - i;
                  const x = 60 + revIdx * stepX;
                  const y = 220 - (val / 100) * 200;
                  return `${x},${y}`;
                });

                // P50 line
                const p50Points = activePath.p50.map((val: number, i: number) => {
                  const x = 60 + i * stepX;
                  const y = 220 - (val / 100) * 200;
                  return `${x},${y}`;
                });

                const areaD = `M ${p90Points.join(" L ")} L ${p10PointsRev.join(" L ")} Z`;
                const lineD = `M ${p50Points.join(" L ")}`;

                return (
                  <>
                    {/* Confidence Area */}
                    <path d={areaD} fill="url(#bandGradient)" />
                    {/* P90 Top edge */}
                    <path d={`M ${p90Points.join(" L ")}`} fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="3 3" />
                    {/* P10 Bottom edge */}
                    <path d={`M ${activePath.p10.map((v: number, i: number) => `${60 + i * stepX},${220 - (v / 100) * 200}`).join(" L ")}`} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
                    {/* P50 Median */}
                    <path d={lineD} fill="none" stroke="#4F46E5" strokeWidth="3.5" />

                    {/* Data markers on P50 */}
                    {activePath.p50.map((val: number, i: number) => {
                      const x = 60 + i * stepX;
                      const y = 220 - (val / 100) * 200;
                      return (
                        <circle key={i} cx={x} cy={y} r="3.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="1.5" />
                      );
                    })}

                    {/* Week labels */}
                    {weeks.map((w: string, i: number) => {
                      const x = 60 + i * stepX;
                      return (
                        <text key={w} x={x} y="235" textAnchor="middle" fontSize="10" className="fill-slate-400 font-mono">
                          {w}
                        </text>
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

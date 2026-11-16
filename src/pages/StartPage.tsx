import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  UserCheck,
  Target,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Calendar,
  Layers,
} from "lucide-react";

export const StartPage: React.FC = () => {
  const { switchPersona, setGoal, notify } = useTwin();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [selectedProfile, setSelectedProfile] = useState<
    "Crack Coding Interviews" | "Master DSA Basics" | "Python Backend Mastery" | "Advanced Algorithms"
  >("Crack Coding Interviews");
  const [deadlineWeeks, setDeadlineWeeks] = useState<number>(8);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const personas = [
    {
      id: "meera" as const,
      name: "Meera Patel",
      level: "Intermediate",
      hours: "5 hrs/week",
      focus: "Gaps in Recursion & Stack Frames",
      description: "Solid on arrays and loops, but recursion causes backtracking failure loops due to a shared scope misconception.",
      badge: "Most Popular Demo",
    },
    {
      id: "aarav" as const,
      name: "Aarav Sharma",
      level: "Beginner",
      hours: "3 hrs/week",
      focus: "Foundational Memory & Mutability",
      description: "Learning Python basics; struggles with mutable default arguments and object references.",
      badge: "Foundations Track",
    },
    {
      id: "rohan" as const,
      name: "Rohan Verma",
      level: "Advanced",
      hours: "4 hrs/week",
      focus: "Interview Prep & Decay Prone",
      description: "Knows DP & Graphs, but unreviewed skills decay quickly. Needs spaced review before interviews.",
      badge: "Sprint Track",
    },
  ];

  const handlePersonaSelect = async (personaId: "aarav" | "meera" | "rohan") => {
    await switchPersona(personaId);
    navigate("/dashboard");
  };

  const handleFinishWizard = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.updateGoal({
        domain: "Python & Data Structures",
        targetProfile: selectedProfile,
        deadlineWeeks,
        hoursPerWeek,
      });
      setGoal(res.goal);
      notify("Learning goals customized successfully!", "success");
      navigate("/dashboard");
    } catch (e: any) {
      notify(e.message || "Failed to update goals", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Twin Calibration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Initialize Your Learning Digital Twin
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Choose a realistic pre-seeded student persona for instant testing, or configure your own personalized goal profile below.
          </p>
        </div>

        {/* Section 1: One-Click Demo Personas */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>One-Click Instant Personas</span>
            </div>
            <span className="text-xs text-slate-500">Zero setup required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {personas.map((p) => (
              <div
                key={p.id}
                onClick={() => handlePersonaSelect(p.id)}
                className="group relative cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {p.level} · {p.hours}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {p.name}
                  </h3>
                  <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">
                    {p.focus}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Activate Twin</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Step-by-Step Goal Wizard */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Customize Target Goal & Velocity
              </h2>
              <p className="text-xs text-slate-500">
                Calibrate the learning path generator and Monte Carlo simulation
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Step {step} of 3</span>
            </div>
          </div>

          {/* Step 1: Target Profile */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Your Objective Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "Crack Coding Interviews",
                    desc: "Focus on Trees, Graphs, DP, and Backtracking patterns.",
                  },
                  {
                    id: "Master DSA Basics",
                    desc: "Solidify Arrays, Stacks, Queues, Recursion, and Big-O.",
                  },
                  {
                    id: "Python Backend Mastery",
                    desc: "Memory management, aliasing, scopes, and data efficiency.",
                  },
                  {
                    id: "Advanced Algorithms",
                    desc: "Competitive programming, DP state reduction, DAGs.",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProfile(item.id as any)}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      selectedProfile === item.id
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.id}
                      </div>
                      {selectedProfile === item.id && (
                        <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <span>Next: Set Study Velocity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Time Commitment */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Weekly Hours Commitment
                  </label>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {hoursPerWeek} hrs / week
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>2 hrs (Paced)</span>
                  <span>5-8 hrs (Standard)</span>
                  <span>15+ hrs (Sprint)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Target Deadline Horizon
                  </label>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {deadlineWeeks} weeks
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="24"
                  step="1"
                  value={deadlineWeeks}
                  onChange={(e) => setDeadlineWeeks(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>2 weeks</span>
                  <span>8 weeks</span>
                  <span>24 weeks</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  <span>Review & Synthesize</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Domain:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Python & Data Structures</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Target Profile:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedProfile}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Study Velocity:</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{hoursPerWeek} hrs / week</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Deadline:</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">{deadlineWeeks} weeks</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleFinishWizard}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Calibrating Twin...</span>
                  ) : (
                    <>
                      <span>Generate My Personalized Twin</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

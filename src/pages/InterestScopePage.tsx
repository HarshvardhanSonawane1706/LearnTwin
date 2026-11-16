import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  InterestDomainInfo,
  InterestEvaluationResult,
  InterestQuestion,
  SuggestedFieldPivot,
} from "../types";
import {
  Compass,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shuffle,
  Briefcase,
  TrendingUp,
  Layers,
  Loader2,
  Brain,
  Target,
  Check,
} from "lucide-react";

export const InterestScopePage: React.FC = () => {
  const { user, interestProfile, setInterestProfile, notify } = useTwin();

  const [catalog, setCatalog] = useState<InterestDomainInfo[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState<string>("");
  const [savingInterests, setSavingInterests] = useState<boolean>(false);

  const [activeFocusField, setActiveFocusField] = useState<string | undefined>(undefined);
  const [activeFocusLabel, setActiveFocusLabel] = useState<string | undefined>(undefined);
  const [question, setQuestion] = useState<InterestQuestion | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [reasoningText, setReasoningText] = useState<string>("");
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<InterestEvaluationResult | null>(null);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getInterestProfile();
        setCatalog(res.catalog || []);
        if (res.profile) {
          setInterestProfile(res.profile);
          setSelectedInterests(res.profile.interests || []);
          setCustomInterest(res.profile.customInterest || "");
          if (res.profile.lastEvaluation) {
            setEvaluation(res.profile.lastEvaluation);
          }
        }
      } catch (err: any) {
        notify(err?.message || "Failed to load interest explorer.", "error");
      } finally {
        setLoadingInitial(false);
      }
    }
    load();
  }, [notify, setInterestProfile]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 3) {
        notify("Select up to 3 core interests for focused recommendations.", "info");
        return prev;
      }
      return [...prev, id];
    });
  };

  const fetchRandomQuestion = async (focusId?: string, focusLabel?: string, preferAi = false) => {
    setLoadingQuestion(true);
    setEvaluation(null);
    setSelectedOptionId("");
    setReasoningText("");
    setActiveFocusField(focusId);
    setActiveFocusLabel(focusLabel);

    try {
      const res = await api.getRandomInterestQuestion({
        focusInterestId: focusId,
        preferAi,
      });
      setQuestion(res.question);
    } catch (err: any) {
      notify(err?.message || "Could not load a random question.", "error");
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSaveInterests = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInterests.length === 0 && customInterest.trim().length < 2) {
      notify("Please choose at least one interest or type a custom topic.", "warning");
      return;
    }

    setSavingInterests(true);
    try {
      const res = await api.saveInterestProfile(selectedInterests, customInterest.trim() || undefined);
      setInterestProfile(res.profile);
      notify("Interests saved and Future Scope updated!", "success");
      await fetchRandomQuestion(undefined, undefined, false);
    } catch (err: any) {
      notify(err?.message || "Failed to save interests.", "error");
    } finally {
      setSavingInterests(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!question || !selectedOptionId || evaluating) return;
    setEvaluating(true);
    try {
      const res = await api.evaluateInterestResponse({
        questionId: question.id,
        selectedOptionId,
        reasoningText,
      });
      setEvaluation(res.evaluation);
      setInterestProfile(res.profile);
    } catch (err: any) {
      notify(err?.message || "Failed to evaluate response.", "error");
    } finally {
      setEvaluating(false);
    }
  };

  const handleExploreSuggestedPivot = async (pivot: SuggestedFieldPivot) => {
    if (!selectedInterests.includes(pivot.suggestedInterestId)) {
      const updatedInterests = [...selectedInterests.slice(-2), pivot.suggestedInterestId];
      setSelectedInterests(updatedInterests);
      try {
        const saved = await api.saveInterestProfile(updatedInterests, customInterest.trim() || undefined);
        setInterestProfile(saved.profile);
      } catch {
        // continue with focused question even if profile cap/save skipped
      }
    }
    await fetchRandomQuestion(pivot.suggestedInterestId, pivot.suggestedField, false);
  };

  if (loadingInitial) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Loading Interest & Future Scope Explorer...</span>
        </div>
      </div>
    );
  }

  const hasSavedInterests =
    Boolean(interestProfile && (interestProfile.interests.length > 0 || interestProfile.customInterest));
  const futureScopes = interestProfile?.futureScopes || [];

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              Interest Discovery & Career Trajectory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance">
              Explore Your Interests, Future Scope & Adaptive Field Pivots
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl">
              Tell LearnTwin what excites you, inspect projected career scope, answer randomized questions tailored to your interests, and unlock next-field recommendations calibrated to your response level.
            </p>
          </div>
          {user && (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Step 1: Select Student Interests */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                01. What are your primary learning interests?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose up to 3 domains (or enter a custom topic) to personalize your Future Scope and randomized questions.
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
              {selectedInterests.length} / 3 selected
            </div>
          </div>

          <form onSubmit={handleSaveInterests} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {catalog.map((domain) => {
                const isSelected = selectedInterests.includes(domain.id);
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => toggleInterest(domain.id)}
                    aria-pressed={isSelected}
                    className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-950/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                        {domain.title}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {domain.tagline}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 pt-2">
              <div className="flex-1">
                <label
                  htmlFor="custom-interest-input"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Custom Interest or Niche Topic (Optional)
                </label>
                <input
                  id="custom-interest-input"
                  type="text"
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="e.g. Bioinformatics, Autonomous Drones, Compiler Design, EdTech"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={savingInterests}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
              >
                {savingInterests ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Scope...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4" />
                    <span>Save Interests & Reveal Future Scope</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Step 2: Suggested Future Scope based on Student Interests */}
        {hasSavedInterests && futureScopes.length > 0 && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  02. Future Scope Tailored to Your Interests
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  High-growth domains, target roles, and skill milestones mapped from your selected interests.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchRandomQuestion(undefined, undefined, false)}
                disabled={loadingQuestion}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors whitespace-nowrap self-start"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Ask Random Question on My Interests</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {futureScopes.map((scope, idx) => (
                <div
                  key={`${scope.field}-${idx}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-medium text-emerald-700 dark:text-emerald-400">
                        {scope.horizon}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {scope.field}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {scope.outlook}
                    </p>
                    <div className="pt-1 space-y-1.5 text-xs">
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-white">Target Roles: </span>
                        <span>{scope.roles.join(" · ")}</span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-white">Key Skills: </span>
                        <span>{scope.keySkills.join(" · ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Capstone Build: </span>
                    {scope.capstoneIdea}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Step 3 & 4: Interactive Random Question & Level-Based Next Field Pivot */}
        {hasSavedInterests && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Random Question Card */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    03. Interest-Based Random Probe
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeFocusLabel
                      ? `Focused on suggested field: ${activeFocusLabel}`
                      : "Randomized conceptual challenge drawn from your chosen interests."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchRandomQuestion(activeFocusField, activeFocusLabel, false)}
                  disabled={loadingQuestion}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                >
                  {loadingQuestion ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  <span>{question ? "New Random Question" : "Load Random Question"}</span>
                </button>
              </div>

              {loadingQuestion ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span>Selecting a tailored question for your interest profile...</span>
                </div>
              ) : !question ? (
                <div className="py-10 text-center space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    Ready to test your intuition? Launch a randomized question matched to your selected interests—then receive a new field & future scope calibrated to your response level.
                  </p>
                  <button
                    type="button"
                    onClick={() => fetchRandomQuestion(undefined, undefined, false)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Ask Me a Random Question</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {question.interestTitle}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{question.difficulty} level</span>
                    <span aria-hidden="true">·</span>
                    <span>{question.cognitiveSignal}</span>
                  </div>

                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {question.prompt}
                  </p>

                  <div className="space-y-2.5">
                    {question.options.map((opt) => {
                      const isSelected = selectedOptionId === opt.id;
                      let optionClasses =
                        "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700";

                      if (evaluation) {
                        if (opt.isCorrect) {
                          optionClasses =
                            "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100";
                        } else if (isSelected && !opt.isCorrect) {
                          optionClasses =
                            "border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100";
                        }
                      } else if (isSelected) {
                        optionClasses =
                          "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40";
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          disabled={Boolean(evaluation)}
                          onClick={() => setSelectedOptionId(opt.id)}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${optionClasses}`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {evaluation ? (
                              opt.isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : isSelected ? (
                                <XCircle className="w-4 h-4 text-rose-600" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                              )
                            ) : (
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? "border-indigo-600 bg-indigo-600"
                                    : "border-slate-300 dark:border-slate-700"
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            )}
                          </div>
                          <span className="text-xs sm:text-sm font-medium leading-relaxed">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {!evaluation && (
                    <div className="pt-2 space-y-2">
                      <label
                        htmlFor="interest-reasoning"
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <Brain className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Explain your reasoning (helps calibrate your response level & next field suggestion)</span>
                      </label>
                      <textarea
                        id="interest-reasoning"
                        rows={2}
                        value={reasoningText}
                        onChange={(e) => setReasoningText(e.target.value)}
                        placeholder="e.g. Because separating structure from parameters prevents injected clauses from altering query logic..."
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {evaluation && (
                    <div
                      className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                        evaluation.isCorrect
                          ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100"
                          : "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-100"
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        {evaluation.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Strong Answer</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Key Insight to Note</span>
                          </>
                        )}
                      </div>
                      <p className="leading-relaxed">{evaluation.explanation}</p>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-3">
                    {!evaluation ? (
                      <button
                        type="button"
                        disabled={!selectedOptionId || evaluating}
                        onClick={handleSubmitResponse}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {evaluating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Evaluating Level...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Response & Get Next Field</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fetchRandomQuestion(activeFocusField, activeFocusLabel, false)}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-all flex items-center gap-2"
                      >
                        <Shuffle className="w-3.5 h-3.5" />
                        <span>Try Another Random Question</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Response Level & Suggested Next Field / Future Scope */}
            <div className="lg:col-span-5 space-y-5">
              {evaluation ? (
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        04. Evaluated Response Level
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {evaluation.responseLevel}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {evaluation.reasoningQuality}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {evaluation.responseScore}%
                      </div>
                      <div className="text-[11px] text-slate-400">Signal Score</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Signals Observed
                    </div>
                    <ul className="space-y-1">
                      {evaluation.strengthsObserved.map((s, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-400">
                      <Target className="w-4 h-4 shrink-0" />
                      <span>Suggested Next Field & Future Scope</span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {evaluation.suggestedPivot.suggestedField}
                    </h4>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Horizon: {evaluation.suggestedPivot.growthHorizon}
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {evaluation.suggestedPivot.whyThisFitsYourLevel}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {evaluation.suggestedPivot.futureScopeSummary}
                    </p>

                    <div className="space-y-1.5 text-xs pt-1">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Roles: </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {evaluation.suggestedPivot.targetRoles.join(" · ")}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">Bridge Skills: </span>
                        <span className="text-slate-600 dark:text-slate-300">
                          {evaluation.suggestedPivot.bridgeSkills.join(" · ")}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExploreSuggestedPivot(evaluation.suggestedPivot)}
                      className="w-full mt-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Quiz Me in This Suggested Field</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    <span>04. Next-Field Pivot Engine</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Answer the interest probe on the left (and optionally explain your reasoning). Based on your demonstrated response level—Foundational Explorer, Applied Builder, or Systems Architect—LearnTwin will recommend another adjacent field and future scope tailored to your growth edge.
                  </p>
                </div>
              )}

              {interestProfile && interestProfile.suggestedPivots.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    Discovered Field Pivots
                  </div>
                  <div className="space-y-2">
                    {interestProfile.suggestedPivots.slice(0, 4).map((p, idx) => (
                      <div
                        key={`${p.suggestedField}-${idx}`}
                        className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {p.suggestedField}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {p.targetRoles.slice(0, 2).join(" · ")}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleExploreSuggestedPivot(p)}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap shrink-0"
                        >
                          Probe →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

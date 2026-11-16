import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Brain,
  RotateCcw,
  GitCompare,
  Lightbulb,
} from "lucide-react";

export const QuizPage: React.FC = () => {
  const { twin, refreshTwin, notify } = useTwin();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [reasoningText, setReasoningText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [accumulatedMisconceptions, setAccumulatedMisconceptions] = useState<any[]>([]);
  const [scoreCount, setScoreCount] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await api.getQuizQuestions();
        if (res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        }
      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    }
    loadQuiz();
  }, []);

  const currentQ = questions[currentIndex];

  const handleOptionSelect = (optId: string) => {
    if (lastResult) return; // Locked once answered
    setSelectedOptionId(optId);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOptionId || !currentQ || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await api.submitQuizAnswer({
        questionId: currentQ.id,
        selectedOptionId,
        reasoningText,
      });

      setLastResult(result);
      if (result.isCorrect) {
        setScoreCount((prev) => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
      } else {
        setScoreCount((prev) => ({ ...prev, total: prev.total + 1 }));
      }

      if (result.detectedMisconception) {
        setAccumulatedMisconceptions((prev) => [...prev, result.detectedMisconception]);
      }

      await refreshTwin();
    } catch (err: any) {
      notify(err.message || "Failed to submit response", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId("");
      setReasoningText("");
      setLastResult(null);
    } else {
      setQuizFinished(true);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Calibrating targeted diagnostic probes...
          </div>
        </div>
      </div>
    );
  }

  // Quiz Finished Summary Screen
  if (quizFinished) {
    return (
      <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              Diagnostic Complete
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Your Learning Digital Twin has absorbed this evidence. Bayesian mastery weights and prerequisite chains have been recalculated.
            </p>

            <div className="inline-flex items-center gap-6 px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-8">
              <div>
                <div className="text-xs text-slate-400">Score</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {scoreCount.correct} / {scoreCount.total}
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <div className="text-xs text-slate-400">New Beliefs Detected</div>
                <div className="text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {accumulatedMisconceptions.length}
                </div>
              </div>
            </div>

            {/* Diagnosed Beliefs Section */}
            {accumulatedMisconceptions.length > 0 && (
              <div className="text-left space-y-4 mb-8">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Beliefs We Detected in Your Thinking
                </div>
                <div className="space-y-3">
                  {accumulatedMisconceptions.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
                          {m.title || "Cognitive Misconception"}
                        </span>
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">
                          {Math.round(m.confidence * 100)}% Confidence
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                        {m.description}
                      </p>
                      {m.fixHint && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>Correction Hint: {m.fixHint}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/diff"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <GitCompare className="w-4 h-4" />
                <span>View Adapted Path Diff</span>
              </Link>
              <Link
                to="/graph"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>View Knowledge Graph</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Diagnostic Probe · Question {currentIndex + 1} of {questions.length}
            </div>
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Concept Target: {currentQ.conceptKey?.replace(/_/g, " ").toUpperCase()}
            </h2>
          </div>
          <div className="text-xs text-slate-400 tabular-nums">
            Score: {scoreCount.correct} / {scoreCount.total}
          </div>
        </div>

        {/* Question Prompt Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.prompt}
          </p>

          {/* Optional Code Snippet */}
          {currentQ.codeSnippet && (
            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{currentQ.codeSnippet}</pre>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt: any) => {
              const isSelected = selectedOptionId === opt.id;
              let stateStyles = "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700";

              if (lastResult) {
                if (opt.isCorrect) {
                  stateStyles = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100";
                } else if (isSelected && !opt.isCorrect) {
                  stateStyles = "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100";
                }
              } else if (isSelected) {
                stateStyles = "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40";
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleOptionSelect(opt.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start gap-3 ${stateStyles}`}
                >
                  <div className="mt-0.5">
                    {lastResult ? (
                      opt.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isSelected ? (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" />
                      )
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-xs md:text-sm font-medium leading-relaxed">
                    {opt.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional Free-Text "Why did you pick this?" field */}
          {!lastResult && selectedOptionId && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                <span>Why did you pick this? (Optional, helps your twin diagnose your mental model)</span>
              </label>
              <textarea
                value={reasoningText}
                onChange={(e) => setReasoningText(e.target.value)}
                placeholder="e.g. I thought recursive calls share the same local variables across frames..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                rows={2}
              />
            </div>
          )}

          {/* Feedback details after answer */}
          {lastResult && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in">
              <div
                className={`p-4 rounded-xl border ${
                  lastResult.isCorrect
                    ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-900 dark:text-emerald-100"
                    : "bg-rose-50/60 dark:bg-rose-950/30 border-rose-500/30 text-rose-900 dark:text-rose-100"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  {lastResult.isCorrect ? "Correct!" : "Diagnosed Misconception:"}
                </div>
                <p className="text-xs leading-relaxed">
                  {lastResult.explanation}
                </p>

                {lastResult.detectedMisconception && (
                  <div className="mt-3 p-3 rounded-lg bg-white/60 dark:bg-slate-900/60 border border-rose-200/60 dark:border-rose-900/40 text-xs">
                    <div className="font-semibold text-rose-600 dark:text-rose-400 mb-0.5">
                      Diagnosed Belief: "{lastResult.detectedMisconception.description}"
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Confidence: {Math.round(lastResult.detectedMisconception.confidence * 100)}% · Twin prerequisite updated.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            {!lastResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOptionId || isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Diagnosing...</span>
                ) : (
                  <>
                    <span>Submit & Diagnose</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <span>{currentIndex + 1 < questions.length ? "Next Probe" : "View Results"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

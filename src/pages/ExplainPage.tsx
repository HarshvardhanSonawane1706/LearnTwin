import React, { useState } from "react";
import { useTwin } from "../context/TwinContext";
import { api } from "../api";
import {
  MessageSquare,
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle2,
  Lightbulb,
  Award,
} from "lucide-react";

export const ExplainPage: React.FC = () => {
  const { twin, refreshTwin, notify } = useTwin();

  const [conceptTitle, setConceptTitle] = useState<string>("Recursion & Call Stack Frames");
  const [studentText, setStudentText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversation, setConversation] = useState<
    Array<{ sender: "junior" | "student"; text: string }>
  >([
    {
      sender: "junior",
      text: "Hey! I keep seeing recursive functions in our codebase, but I don't really understand how memory works when a function calls itself. Can you explain what actually happens to variables?",
    },
  ]);
  const [lastEvaluation, setLastEvaluation] = useState<any>(null);

  const handleSendExplanation = async () => {
    if (!studentText.trim() || isLoading) return;

    const userMsg = studentText;
    setConversation((prev) => [...prev, { sender: "student", text: userMsg }]);
    setStudentText("");
    setIsLoading(true);

    try {
      const evaluation = await api.evaluateExplainBack(conceptTitle, userMsg);
      setLastEvaluation(evaluation);

      // Add junior's AI response
      setConversation((prev) => [
        ...prev,
        { sender: "junior", text: evaluation.juniorReply },
      ]);

      // If good score, reward twin
      if (evaluation.score >= 70) {
        notify(`Great explanation! Clarity score: ${evaluation.score}/100. Twin mastery boosted.`, "success");
        await refreshTwin();
      }
    } catch (err: any) {
      notify(err.message || "Failed to evaluate explanation", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          Feynman Technique AI Simulation
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Explain-Back Mode: The Confused Junior
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Teach a junior engineer in plain English. Your twin measures clarity, catches latent gaps, and solidifies mastery.
        </p>
      </div>

      <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Stage */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-[520px] shadow-sm overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {conversation.map((msg, idx) => {
              const isJunior = msg.sender === "junior";
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${isJunior ? "" : "flex-row-reverse"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
                      isJunior
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {isJunior ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      isJunior
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                <Bot className="w-4 h-4 animate-bounce text-amber-500" />
                <span>Junior is evaluating your explanation...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-2">
            <input
              type="text"
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendExplanation()}
              placeholder="Explain how activation frames and local variables work..."
              className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleSendExplanation}
              disabled={!studentText.trim() || isLoading}
              className="p-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cognitive Evaluation Panel */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Teaching Clarity Score
            </div>

            {lastEvaluation ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {lastEvaluation.score}
                    <span className="text-base text-slate-400">/100</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {lastEvaluation.score >= 80 ? "Exemplary Pedagogical Clarity" : "Good Foundation with Minor Gaps"}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Feedback Analysis:
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {lastEvaluation.clarityFeedback}
                  </p>
                </div>

                {lastEvaluation.identifiedGaps && lastEvaluation.identifiedGaps.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      Topics to clarify further:
                    </div>
                    {lastEvaluation.identifiedGaps.map((gap: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                        <span className="text-amber-500">•</span>
                        <span>{gap}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Teach the confused junior developer by sending an explanation in chat. Gemini will score your pedagogical clarity and update your twin.
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            Feynman Learning Principle: If you cannot explain it simply to a beginner, your mental model still has unaddressed gaps.
          </div>
        </div>
      </div>
    </div>
  );
};

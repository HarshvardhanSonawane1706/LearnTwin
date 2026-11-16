/**
 * @license
 * Server-Side Gemini AI Integration for LearnTwin
 *
 * Capabilities:
 * 1. Misconception free-text classification: maps student's natural language reasoning to mental models
 * 2. Plain-English "Why this recommendation" generator: explains path decisions to students
 * 3. Explain-Back "Confused Junior" dialogue & feedback
 * 4. Interest-adaptive random question synthesis & next-field scope refinement
 *
 * Fallback:
 * If GEMINI_API_KEY is missing, rate-limited, or fails, deterministic heuristic rules take over instantly.
 */

import { GoogleGenAI, Type } from '@google/genai';
import {
  InterestDifficulty,
  InterestQuestion,
  Misconception,
  ResponseLevelTier,
  SuggestedFieldPivot,
} from './types.js';

const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client, falling back to deterministic mode:', err);
  }
}

const DEFAULT_MODEL = 'gemini-4-hydrogen';

/**
 * Classifies free-text reasoning into one of the candidate misconceptions or tags it.
 */
export async function classifyMisconceptionReasoning(
  promptText: string,
  selectedOptionText: string,
  userReasoning: string,
  candidates: Misconception[]
): Promise<{
  matchedMisconceptionId?: string;
  confidence: number;
  extractedBelief: string;
  source: 'gemini' | 'heuristic';
}> {
  if (!userReasoning || userReasoning.trim().length < 3) {
    return {
      confidence: 0,
      extractedBelief: 'No free-text reasoning provided.',
      source: 'heuristic',
    };
  }

  if (aiClient) {
    try {
      const candidateDescriptions = candidates
        .map((c) => `- ID: "${c.id}" | Description: "${c.description}"`)
        .join('\n');

      const response = await aiClient.models.generateContent({
        model: DEFAULT_MODEL,
        contents: `You are an educational psychologist analyzing student misconceptions in computer science.
A student answered a question:
Question: "${promptText}"
Selected answer: "${selectedOptionText}"
Student explanation of why they picked it: "${userReasoning}"

Candidate diagnosed misconceptions:
${candidateDescriptions}

Analyze if the student's text expresses one of these misconceptions or a related flawed mental model.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchedId: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              extractedBelief: { type: Type.STRING },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return {
        matchedMisconceptionId:
          parsed.matchedId && parsed.matchedId !== 'null' ? parsed.matchedId : candidates[0]?.id,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
        extractedBelief: parsed.extractedBelief || userReasoning,
        source: 'gemini',
      };
    } catch (e) {
      console.warn('Gemini classification fallback triggered:', e);
    }
  }

  const lower = userReasoning.toLowerCase();
  for (const cand of candidates) {
    const descLower = cand.description.toLowerCase();
    const keywords = descLower.split(/\s+/).filter((w) => w.length > 4);
    const matchCount = keywords.filter((kw) => lower.includes(kw)).length;

    if (
      matchCount >= 2 ||
      lower.includes('same') ||
      lower.includes('share') ||
      lower.includes('global') ||
      lower.includes('copy') ||
      lower.includes('pointer')
    ) {
      return {
        matchedMisconceptionId: cand.id,
        confidence: 0.78,
        extractedBelief: cand.description,
        source: 'heuristic',
      };
    }
  }

  return {
    matchedMisconceptionId: candidates[0]?.id,
    confidence: 0.65,
    extractedBelief: `Inferred false mental model: "${userReasoning.slice(0, 100)}"`,
    source: 'heuristic',
  };
}

/**
 * Generates an empathetic, plain-English "Why this recommendation" explanation.
 */
export async function generateRecommendationExplanation(
  conceptTitle: string,
  reasonCategory: string,
  userMastery: number,
  blockerTitle?: string,
  misconceptionDesc?: string
): Promise<string> {
  if (aiClient) {
    try {
      const prompt = `Write a concise 2-sentence explanation to a student explaining why "${conceptTitle}" is prioritized next in their learning path.
Reason category: ${reasonCategory}
Student current mastery: ${Math.round(userMastery * 100)}%
${blockerTitle ? `Blocking downstream topic: ${blockerTitle}` : ''}
${misconceptionDesc ? `Active diagnosed misconception: ${misconceptionDesc}` : ''}
Tone: Encouraging, precise, pedagogical. Do not use buzzwords.`;

      const response = await aiClient.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
      });

      if (response.text) {
        return response.text.trim();
      }
    } catch (e) {
      console.warn('Gemini explanation fallback triggered:', e);
    }
  }

  if (blockerTitle) {
    return `We placed ${conceptTitle} next because gaps here directly block your ability to solve ${blockerTitle}. Solidifying this fundamental unblocks your path and saves estimated study time.`;
  }
  if (misconceptionDesc) {
    return `You're working on ${conceptTitle} to clear up the false belief: "${misconceptionDesc}". Re-aligning your mental model here makes subsequent problems intuitive.`;
  }
  if (reasonCategory === 'review_decay') {
    return `It has been several days since you practiced ${conceptTitle}, and memory retention is dipping. A brief 5-minute refresher will reset your forgetting curve.`;
  }
  return `Mastering ${conceptTitle} is a pivotal prerequisite for your target goal. Current progress is at ${Math.round(userMastery * 100)}%.`;
}

/**
 * Explain-Back Junior evaluation
 */
export async function evaluateExplainBack(
  conceptTitle: string,
  studentExplanation: string
): Promise<{
  score: number;
  clarityFeedback: string;
  identifiedGaps: string[];
  juniorReply: string;
}> {
  if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: DEFAULT_MODEL,
        contents: `You are simulating a curious junior developer who is confused about "${conceptTitle}".
The student just explained it to you as follows:
"${studentExplanation}"

Evaluate their explanation with a score between 40 and 98, 1-2 sentences of constructive feedback, a list of missing points, and a friendly junior dev reply.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              clarityFeedback: { type: Type.STRING },
              identifiedGaps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              juniorReply: { type: Type.STRING },
            },
          },
        },
      });

      return JSON.parse((response.text ?? '{}').trim());
    } catch (e) {
      console.warn('Explain-back fallback triggered:', e);
    }
  }

  const wordCount = studentExplanation.split(/\s+/).length;
  const score = Math.min(92, Math.max(55, wordCount * 2 + 40));
  return {
    score,
    clarityFeedback: `Good effort explaining ${conceptTitle}. You clearly touched on the core mechanism. Focus next on how memory frames are freed.`,
    identifiedGaps: ['Base case termination edge-case', 'Stack overflow memory boundaries'],
    juniorReply: `Oh! So when the function calls itself, it gets its own fresh variables on the stack? That makes so much more sense now!`,
  };
}

/**
 * Generates a fresh random diagnostic question tailored to a custom or selected student interest.
 * Returns null if Gemini is unavailable so deterministic pool takes over cleanly.
 */
export async function generateInterestQuestionWithGemini(
  interestId: string,
  interestLabel: string,
  difficulty: InterestDifficulty
): Promise<InterestQuestion | null> {
  if (!aiClient) return null;

  try {
    const response = await aiClient.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Generate one sharp, realistic ${difficulty}-level multiple-choice diagnostic question for a student interested in "${interestLabel}".
Test conceptual understanding and practical judgment (not trivia). Provide 4 distinct options where exactly 1 is correct, plus concise explanations for each option and a short cognitiveSkill label.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prompt: { type: Type.STRING },
            cognitiveSignal: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  isCorrect: { type: Type.BOOLEAN },
                  explanation: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    if (
      !parsed?.prompt ||
      !Array.isArray(parsed.options) ||
      parsed.options.length < 3 ||
      !parsed.options.some((o: any) => o.isCorrect === true)
    ) {
      return null;
    }

    return {
      id: `iq_gem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      interestId,
      interestTitle: interestLabel,
      difficulty,
      prompt: parsed.prompt,
      cognitiveSignal: parsed.cognitiveSignal || 'Conceptual Reasoning',
      options: parsed.options.slice(0, 4).map((o: any, idx: number) => ({
        id: ['a', 'b', 'c', 'd'][idx] || `opt_${idx}`,
        text: String(o.text || ''),
        isCorrect: Boolean(o.isCorrect),
        explanation: String(o.explanation || ''),
      })),
      source: 'gemini',
    };
  } catch (e) {
    console.warn('Gemini interest question generation fallback triggered:', e);
    return null;
  }
}

/**
 * Optionally enriches the next-field pivot explanation using the student's actual response level & reasoning.
 */
export async function refineInterestPivotWithGemini(
  interestLabel: string,
  responseLevel: ResponseLevelTier,
  reasoningText: string,
  basePivot: SuggestedFieldPivot
): Promise<SuggestedFieldPivot> {
  if (!aiClient || !reasoningText || reasoningText.trim().length < 5) {
    return basePivot;
  }

  try {
    const response = await aiClient.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `A student interested in "${interestLabel}" just answered a probe at the "${responseLevel}" response level.
Their explanation was: "${reasoningText.trim()}".
We are suggesting they explore the adjacent field "${basePivot.suggestedField}".
Write a crisp 2-sentence "whyThisFitsYourLevel" rationale referencing their reasoning style, and a 2-sentence "futureScopeSummary" for this field.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whyThisFitsYourLevel: { type: Type.STRING },
            futureScopeSummary: { type: Type.STRING },
          },
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim());
    return {
      ...basePivot,
      whyThisFitsYourLevel: parsed.whyThisFitsYourLevel || basePivot.whyThisFitsYourLevel,
      futureScopeSummary: parsed.futureScopeSummary || basePivot.futureScopeSummary,
    };
  } catch {
    return basePivot;
  }
}

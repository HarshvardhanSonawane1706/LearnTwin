/**
 * @license
 * Prerequisite Knowledge Graph Root-Cause Tracer
 * 
 * When a student struggles on an advanced concept (e.g., Memoization or Backtracking),
 * traditional platforms prescribe more practice on that same topic.
 * LearnTwin walks backwards through the prerequisite Directed Acyclic Graph (DAG)
 * to locate the true root blocker (e.g. Call Stack Frames or Mutability).
 * 
 * Mathematical ranking of candidates:
 * Score(ancestor) = (1 - Mastery) * (1 + 0.5 * MisconceptionConfidence) / (Depth + 0.3)
 */

import { Concept, SkillMastery, StudentMisconception } from '../types.js';

export interface RootCauseTraceResult {
  failingConceptKey: string;
  rootConceptKey: string;
  chain: string[]; // e.g. ['memoization', 'recursion_anatomy', 'stack_frames']
  rootMastery: number;
  failingMastery: number;
  activeMisconception?: {
    id: string;
    description: string;
    confidence: number;
  };
  daysSaved: number;
  explanation: string;
}

export function traceRootCause(
  failingKey: string,
  conceptMap: Map<string, Concept>,
  skills: Record<string, SkillMastery>,
  misconceptions: StudentMisconception[]
): RootCauseTraceResult | null {
  const startConcept = conceptMap.get(failingKey);
  if (!startConcept) return null;

  const failingSkill = skills[failingKey] || { mastery: 0.25, halfLifeDays: 3, lastPracticed: '', reviewDue: false, retention: 0.25 };

  // BFS / DFS backwards traversal through prerequisites
  const queue: Array<{ key: string; depth: number; path: string[] }> = [];
  queue.push({ key: failingKey, depth: 0, path: [failingKey] });

  const visited = new Set<string>();
  visited.add(failingKey);

  let bestCandidate: {
    key: string;
    score: number;
    depth: number;
    path: string[];
    mastery: number;
    misconception?: StudentMisconception;
  } | null = null;

  while (queue.length > 0) {
    const current = queue.shift()!;
    const concept = conceptMap.get(current.key);
    if (!concept) continue;

    for (const prereqKey of concept.prerequisites) {
      if (visited.has(prereqKey)) continue;
      visited.add(prereqKey);

      const prereqConcept = conceptMap.get(prereqKey);
      if (!prereqConcept) continue;

      const pSkill = skills[prereqKey] || { mastery: 0.20, halfLifeDays: 3, lastPracticed: '', reviewDue: false, retention: 0.20 };
      const relatedMisc = misconceptions.find((m) => m.conceptKey === prereqKey && m.confidence >= 0.35);

      const depth = current.depth + 1;
      const path = [...current.path, prereqKey];

      // Calculate weakness score
      const miscBonus = relatedMisc ? relatedMisc.confidence * 0.6 : 0;
      const weakness = (1.0 - pSkill.mastery) + miscBonus;
      // Depth penalty: deeper root ancestors are high value, but need valid weakness
      const score = weakness / (Math.sqrt(depth) + 0.2);

      // We consider it a root blocker if mastery < 0.70 or active misconception exists
      if (pSkill.mastery < 0.70 || relatedMisc) {
        if (!bestCandidate || score > bestCandidate.score) {
          bestCandidate = {
            key: prereqKey,
            score,
            depth,
            path,
            mastery: pSkill.mastery,
            misconception: relatedMisc,
          };
        }
      }

      queue.push({ key: prereqKey, depth, path });
    }
  }

  // If no upstream prerequisite is weak, the issue is directly on the current concept itself
  if (!bestCandidate) {
    const directMisc = misconceptions.find((m) => m.conceptKey === failingKey);
    return {
      failingConceptKey: failingKey,
      rootConceptKey: failingKey,
      chain: [failingKey],
      rootMastery: failingSkill.mastery,
      failingMastery: failingSkill.mastery,
      activeMisconception: directMisc ? {
        id: directMisc.misconceptionId,
        description: directMisc.description,
        confidence: directMisc.confidence,
      } : undefined,
      daysSaved: 4,
      explanation: `The knowledge gap is localized directly to ${startConcept.title}. Remedying its core mechanics resolves this issue.`,
    };
  }

  const rootConcept = conceptMap.get(bestCandidate.key)!;
  // Estimated days saved: based on depth in DAG and compound failure rates
  const baseDaysSaved = Math.round((bestCandidate.depth * 3.2 + (bestCandidate.misconception ? 4 : 2)));
  const daysSaved = Math.min(18, Math.max(5, baseDaysSaved));

  const explanation = bestCandidate.misconception
    ? `Struggles in ${startConcept.title} stem from a verified false mental model in ${rootConcept.title}: "${bestCandidate.misconception.description}". Fixing this foundation unblocks downstream synthesis.`
    : `Weakness in ${startConcept.title} is caused by fragile mastery in prerequisite ${rootConcept.title} (${Math.round(bestCandidate.mastery * 100)}% mastery). Addressing this root blocker prevents repeated failure loops.`;

  return {
    failingConceptKey: failingKey,
    rootConceptKey: bestCandidate.key,
    chain: bestCandidate.path,
    rootMastery: bestCandidate.mastery,
    failingMastery: failingSkill.mastery,
    activeMisconception: bestCandidate.misconception ? {
      id: bestCandidate.misconception.misconceptionId,
      description: bestCandidate.misconception.description,
      confidence: bestCandidate.misconception.confidence,
    } : undefined,
    daysSaved,
    explanation,
  };
}

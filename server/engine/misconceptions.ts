/**
 * @license
 * Misconception Diagnosis Engine
 * 
 * Unlike conventional grading which only flags a binary "Wrong",
 * LearnTwin maps incorrect distractors and free-text explanations to specific
 * systematic false beliefs (mental models).
 * 
 * Update rules:
 * - When a student picks a misconception-tagged option: confidence increases with evidence.
 * - When free-text confirms the misconception: confidence gets an extra boost.
 * - When a student successfully demonstrates mastery on related questions: misconception confidence decays.
 */

import { StudentMisconception, Misconception } from '../types.js';

export function updateMisconceptionBelief(
  currentList: StudentMisconception[],
  targetMisconception: Misconception,
  observed: boolean,
  hasFreeTextConfirmation: boolean = false
): StudentMisconception[] {
  const existingIdx = currentList.findIndex(
    (m) => m.misconceptionId === targetMisconception.id
  );

  const now = new Date().toISOString();

  if (observed) {
    const boost = hasFreeTextConfirmation ? 0.40 : 0.28;
    if (existingIdx >= 0) {
      const existing = currentList[existingIdx];
      const newConfidence = Math.min(0.99, existing.confidence + boost * (1 - existing.confidence));
      const updated: StudentMisconception = {
        ...existing,
        confidence: Math.round(newConfidence * 100) / 100,
        evidenceCount: existing.evidenceCount + 1,
        lastSeen: now,
      };
      const copy = [...currentList];
      copy[existingIdx] = updated;
      return copy;
    } else {
      const newEntry: StudentMisconception = {
        misconceptionId: targetMisconception.id,
        conceptKey: targetMisconception.conceptKey,
        description: targetMisconception.description,
        confidence: Math.round((0.55 + (hasFreeTextConfirmation ? 0.25 : 0)) * 100) / 100,
        evidenceCount: 1,
        lastSeen: now,
      };
      return [...currentList, newEntry];
    }
  } else {
    // Correct answer on related concept weakens the misconception hypothesis
    if (existingIdx >= 0) {
      const existing = currentList[existingIdx];
      const decayedConfidence = Math.max(0.05, existing.confidence * 0.70);
      const copy = [...currentList];
      if (decayedConfidence < 0.15) {
        // Prune if resolved
        copy.splice(existingIdx, 1);
      } else {
        copy[existingIdx] = {
          ...existing,
          confidence: Math.round(decayedConfidence * 100) / 100,
        };
      }
      return copy;
    }
    return currentList;
  }
}

/**
 * Filter for active misconceptions (confidence > 0.4) sorted by severity
 */
export function getActiveMisconceptions(list: StudentMisconception[]): StudentMisconception[] {
  return list
    .filter((m) => m.confidence >= 0.40)
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * @license
 * Forgetting Curve & Spaced Repetition Decay Engine
 * 
 * Implements Ebbinghaus exponential retention decay:
 * R(t) = exp(-t / S)
 * where:
 * - t is days elapsed since last practice
 * - S = halfLifeDays / ln(2)
 * 
 * Retention threshold:
 * If R(t) < 0.70, skill is marked "Review Due" to prevent full memory relapse.
 * 
 * Spaced consolidation:
 * Each successful recall increases memory stability:
 * halfLifeDays_new = halfLifeDays_old * 1.65
 */

import { SkillMastery } from '../types.js';

export interface ForgettingCurvePoint {
  day: number;
  retention: number;
  projectedRetention: number;
}

/**
 * Calculates current retention probability given days elapsed and half-life.
 */
export function calculateRetention(daysElapsed: number, halfLifeDays: number): number {
  if (halfLifeDays <= 0) halfLifeDays = 3.0;
  if (daysElapsed <= 0) return 1.0;

  const S = halfLifeDays / Math.LN2;
  const retention = Math.exp(-daysElapsed / S);
  return Math.round(Math.max(0.05, Math.min(1.0, retention)) * 100) / 100;
}

/**
 * Evaluates skill decay state from ISO practice timestamp.
 */
export function evaluateSkillDecay(
  skill: SkillMastery,
  now: Date = new Date()
): { retention: number; reviewDue: boolean; daysElapsed: number } {
  const lastDate = new Date(skill.lastPracticed || Date.now());
  const diffMs = now.getTime() - lastDate.getTime();
  const daysElapsed = Math.max(0, diffMs / (1000 * 60 * 60 * 24));

  const retention = calculateRetention(daysElapsed, skill.halfLifeDays || 3.0);
  // Review due if retention dips below 70% and baseline mastery was at least 0.40
  const reviewDue = retention < 0.70 && skill.mastery >= 0.40;

  return {
    retention,
    reviewDue,
    daysElapsed: Math.round(daysElapsed * 10) / 10,
  };
}

/**
 * Consolidates memory half-life after a successful practice session.
 */
export function consolidateMemory(
  skill: SkillMastery,
  isSuccessful: boolean
): SkillMastery {
  const currentHalfLife = skill.halfLifeDays || 3.0;
  const newHalfLife = isSuccessful
    ? Math.min(60, Math.round(currentHalfLife * 1.65 * 10) / 10)
    : Math.max(1.5, Math.round(currentHalfLife * 0.75 * 10) / 10);

  return {
    ...skill,
    halfLifeDays: newHalfLife,
    lastPracticed: new Date().toISOString(),
    reviewDue: false,
    retention: 1.0,
  };
}

/**
 * Generates data points for a mini forgetting curve visualization.
 */
export function generateForgettingCurveData(
  halfLifeDays: number,
  daysElapsed: number,
  forecastDays: number = 14
): ForgettingCurvePoint[] {
  const points: ForgettingCurvePoint[] = [];
  const maxDay = Math.max(forecastDays, Math.ceil(daysElapsed) + 4);

  for (let day = 0; day <= maxDay; day += 1) {
    const projected = calculateRetention(day, halfLifeDays);
    points.push({
      day,
      retention: day <= daysElapsed ? projected : projected,
      projectedRetention: projected,
    });
  }

  return points;
}

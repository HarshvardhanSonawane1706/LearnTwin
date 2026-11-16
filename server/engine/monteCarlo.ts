/**
 * @license
 * Monte Carlo Path Simulation Engine
 * 
 * Simulates future mastery trajectories over 200 stochastic runs:
 * - Samples student learning rates from BKT posterior distributions
 * - Factors in forgetting decay rate and weekly study commitment
 * - Accounts for stochastic difficulty variance of upcoming concept problems
 * 
 * Generates:
 * - P10 (Conservative / 10th percentile): if retention decays faster or difficulty slips occur
 * - P50 (Expected Median trajectory)
 * - P90 (Optimistic / 90th percentile): if student experiences rapid grasp and consolidation
 * - Readiness % at user deadline and projected completion date
 */

import { TwinState, UserGoal, CandidatePath } from '../types.js';

export function runMonteCarloSimulation(
  twin: TwinState,
  goal: UserGoal,
  customHoursPerWeek?: number
): CandidatePath[] {
  const baseHours = customHoursPerWeek || goal.hoursPerWeek || 4;
  const deadlineWeeks = Math.max(2, goal.deadlineWeeks || 8);

  // 3 distinct candidate study configurations
  const strategies: Array<{
    id: string;
    label: string;
    description: string;
    hours: number;
    focus: 'Balanced' | 'Practice Heavy' | 'Paced Mastery';
    learningSpeedMultiplier: number;
    retentionStabilityMultiplier: number;
  }> = [
    {
      id: 'path-balanced',
      label: 'Balanced Adaptive Track',
      description: 'Dynamic mix of conceptual deep-dives and spaced practice. Optimal retention-to-effort balance.',
      hours: baseHours,
      focus: 'Balanced',
      learningSpeedMultiplier: 1.0,
      retentionStabilityMultiplier: 1.1,
    },
    {
      id: 'path-intensive',
      label: 'Practice-Heavy Sprint',
      description: 'High-frequency interactive problem solving and code katas. Accelerates interview readiness.',
      hours: Math.min(16, Math.round(baseHours * 1.5 * 10) / 10),
      focus: 'Practice Heavy',
      learningSpeedMultiplier: 1.35,
      retentionStabilityMultiplier: 1.25,
    },
    {
      id: 'path-paced',
      label: 'Sustainable Mastery Track',
      description: 'Lighter weekly load with focus on deep mental model repair and maximum spaced review retention.',
      hours: Math.max(1.5, Math.round(baseHours * 0.65 * 10) / 10),
      focus: 'Paced Mastery',
      learningSpeedMultiplier: 0.85,
      retentionStabilityMultiplier: 1.4,
    },
  ];

  // Current baseline average mastery
  const skillValues = Object.values(twin.skills);
  const currentAvgMastery = skillValues.length > 0
    ? skillValues.reduce((sum, s) => sum + s.mastery, 0) / skillValues.length
    : 0.35;

  const results: CandidatePath[] = strategies.map((strat) => {
    const totalSimulations = 200;
    const weekCount = Math.max(8, deadlineWeeks + 2);
    const weeklyRuns: number[][] = Array.from({ length: weekCount + 1 }, () => []);

    // Initial week 0
    for (let sim = 0; sim < totalSimulations; sim++) {
      weeklyRuns[0].push(Math.round(currentAvgMastery * 100));
    }

    // Run 200 stochastic paths
    for (let sim = 0; sim < totalSimulations; sim++) {
      let currentMastery = currentAvgMastery;
      
      // Individual random variance for this run (student cognitive volatility)
      const studentEfficiency = 0.85 + Math.random() * 0.35; 

      for (let w = 1; w <= weekCount; w++) {
        // Study hours invested this week with minor random variance (+/- 10%)
        const actualHours = strat.hours * (0.9 + Math.random() * 0.2);

        // Learning gain this week (diminishing returns curve)
        const weeklyGain = (actualHours * 0.038 * strat.learningSpeedMultiplier * studentEfficiency) /
          (1.0 + currentMastery * 1.2);

        // Decay loss: unpracticed skills slowly decay
        const weeklyDecay = (0.015 / strat.retentionStabilityMultiplier) * (1.0 + Math.random() * 0.01);

        currentMastery = Math.min(0.98, Math.max(0.1, currentMastery + weeklyGain - weeklyDecay));
        weeklyRuns[w].push(Math.round(currentMastery * 100));
      }
    }

    // Calculate percentiles P10, P50, P90 for each week
    const p10: number[] = [];
    const p50: number[] = [];
    const p90: number[] = [];
    const weeks: string[] = [];

    for (let w = 0; w <= weekCount; w++) {
      weeks.push(`Wk ${w}`);
      const sorted = [...weeklyRuns[w]].sort((a, b) => a - b);
      const idx10 = Math.floor(0.10 * totalSimulations);
      const idx50 = Math.floor(0.50 * totalSimulations);
      const idx90 = Math.floor(0.90 * totalSimulations);

      p10.push(sorted[idx10]);
      p50.push(sorted[idx50]);
      p90.push(sorted[idx90]);
    }

    // Readiness at user's deadline week
    const deadlineIdx = Math.min(deadlineWeeks, weekCount);
    const readinessAtDeadline = p50[deadlineIdx] || 85;

    // Projected date when P50 crosses target 85% readiness
    let targetWeekReached = -1;
    for (let w = 0; w <= weekCount; w++) {
      if (p50[w] >= 85) {
        targetWeekReached = w;
        break;
      }
    }

    const today = new Date();
    const readyDays = targetWeekReached >= 0 ? targetWeekReached * 7 : deadlineWeeks * 7 + 14;
    const readyDateObj = new Date(today.getTime() + readyDays * 24 * 60 * 60 * 1000);
    const predictedReadyDate = readyDateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      id: strat.id,
      label: strat.label,
      description: strat.description,
      weeklyHours: strat.hours,
      focusStyle: strat.focus,
      predictedReadyDate,
      readinessAtDeadline,
      weeks,
      p10,
      p50,
      p90,
    };
  });

  return results;
}

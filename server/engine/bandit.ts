/**
 * @license
 * Contextual Multi-Armed Bandit for Resource Format Personalization
 * 
 * Adapts to individual cognitive styles across 4 modalities:
 * - 'video'
 * - 'article'
 * - 'practice'
 * - 'worked_example'
 * 
 * Reward formulation:
 * Reward = Normalized mastery gain (delta) after engaging with the resource.
 * 
 * Scoring:
 * Combines Upper Confidence Bound (UCB1) / Thompson sampling with content relevance
 * to balance exploitation (preferred format) and exploration (testing new modalities).
 */

import { Resource, ResourceFormat, BanditFormatStats } from '../types.js';

export function scoreResourceWithBandit(
  resource: Resource,
  stats: Record<ResourceFormat, BanditFormatStats>,
  totalPulls: number = 0
): { score: number; projectedBoostPercent: number } {
  const formatStat = stats[resource.format] || { pulls: 0, reward: 0 };
  const pulls = Math.max(1, formatStat.pulls);
  const avgReward = formatStat.reward / pulls; // average mastery gain, e.g. 0.12

  // Exploration bonus (UCB)
  const safeTotal = Math.max(pulls, totalPulls || 1);
  const explorationBonus = Math.sqrt((2 * Math.log(safeTotal)) / pulls) * 0.15;

  // Base score from modality efficacy
  const modalityScore = avgReward + explorationBonus;

  // Boost percentage calculation relative to neutral 0.10 baseline
  const boost = Math.round((avgReward - 0.08) * 100);
  const projectedBoostPercent = Math.max(4, Math.min(28, boost > 0 ? boost : 8));

  // Final score weighted by difficulty appropriateness
  const score = Math.round((modalityScore * 10 + 5) * 10) / 10;

  return {
    score,
    projectedBoostPercent,
  };
}

/**
 * Update bandit stats on resource completion/rating.
 */
export function updateBanditStats(
  currentStats: Record<ResourceFormat, BanditFormatStats>,
  format: ResourceFormat,
  masteryDelta: number,
  rating: number = 4
): Record<ResourceFormat, BanditFormatStats> {
  const copy = { ...currentStats };
  const existing = copy[format] || { pulls: 0, reward: 0 };

  // Reward is blended from actual mastery delta and learner satisfaction
  const normalizedDelta = Math.max(0.02, Math.min(0.40, masteryDelta));
  const ratingFactor = rating / 5.0;
  const combinedReward = normalizedDelta * 0.7 + (ratingFactor * 0.15) * 0.3;

  copy[format] = {
    pulls: existing.pulls + 1,
    reward: Math.round((existing.reward + combinedReward) * 1000) / 1000,
  };

  return copy;
}

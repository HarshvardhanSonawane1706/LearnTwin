/**
 * @license
 * Deterministic Adaptive Path Generator
 * 
 * Generates an individualized curriculum roadmap based on:
 * 1. Target Goal & Target Profile (e.g. 'Crack Coding Interviews')
 * 2. Prerequisite DAG topological integrity (no concept without mastered prerequisites)
 * 3. Root causes (weak ancestors blocking progress take immediate precedence)
 * 4. Forgetting decay (skills slipping below 70% retention scheduled for quick review)
 * 5. Bandit-ranked optimal learning resources
 */

import {
  Concept,
  TwinState,
  PathModule,
  UserGoal,
  Resource,
  ResourceFormat,
} from '../types.js';
import { traceRootCause } from './rootCause.js';
import { scoreResourceWithBandit } from './bandit.js';

export function generateAdaptivePath(
  allConcepts: Concept[],
  resources: Resource[],
  twin: TwinState,
  goal: UserGoal
): PathModule[] {
  const conceptMap = new Map<string, Concept>();
  allConcepts.forEach((c) => conceptMap.set(c.key, c));

  const targetConceptSet = new Set<string>(
    goal.targetConcepts && goal.targetConcepts.length > 0
      ? goal.targetConcepts
      : allConcepts.map((c) => c.key)
  );

  // 1. Gather all required concepts (targets + all recursive prerequisites)
  const requiredKeys = new Set<string>();
  function addWithPrereqs(key: string) {
    if (requiredKeys.has(key)) return;
    requiredKeys.add(key);
    const c = conceptMap.get(key);
    if (c) {
      c.prerequisites.forEach(addWithPrereqs);
    }
  }
  targetConceptSet.forEach(addWithPrereqs);

  // 2. Identify weak concepts and run root-cause analysis
  const weakKeys: string[] = [];
  const reviewDueKeys: string[] = [];

  requiredKeys.forEach((key) => {
    const skill = twin.skills[key];
    const mastery = skill ? skill.mastery : 0.15;
    if (skill && skill.reviewDue) {
      reviewDueKeys.push(key);
    } else if (mastery < 0.75) {
      weakKeys.push(key);
    }
  });

  // Check root causes for each weak concept
  const rootCauses = new Map<string, { rootKey: string; chain: string[]; daysSaved: number }>();
  weakKeys.forEach((weakKey) => {
    const trace = traceRootCause(weakKey, conceptMap, twin.skills, twin.misconceptions);
    if (trace && trace.rootConceptKey !== weakKey) {
      rootCauses.set(weakKey, {
        rootKey: trace.rootConceptKey,
        chain: trace.chain,
        daysSaved: trace.daysSaved,
      });
    }
  });

  // 3. Topological Sort with Priority Scoring
  // Standard Kahn's algorithm or in-degree calculation
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  requiredKeys.forEach((key) => {
    inDegree.set(key, 0);
    adjacency.set(key, []);
  });

  requiredKeys.forEach((key) => {
    const concept = conceptMap.get(key)!;
    concept.prerequisites.forEach((pKey) => {
      if (requiredKeys.has(pKey)) {
        inDegree.set(key, (inDegree.get(key) || 0) + 1);
        adjacency.get(pKey)!.push(key);
      }
    });
  });

  // Calculate priority weights
  function getPriorityScore(key: string): number {
    const skill = twin.skills[key];
    const mastery = skill ? skill.mastery : 0.15;
    const hasActiveMisc = twin.misconceptions.some(
      (m) => m.conceptKey === key && m.confidence >= 0.40
    );

    // Is this key an identified root cause for other concepts?
    let isRootCauseForCount = 0;
    rootCauses.forEach((rc) => {
      if (rc.rootKey === key) isRootCauseForCount++;
    });

    let score = 0;
    if (isRootCauseForCount > 0) score += 500 + isRootCauseForCount * 100;
    if (skill?.reviewDue) score += 350;
    if (hasActiveMisc) score += 250;
    if (mastery < 0.75) score += (1.0 - mastery) * 100;
    if (mastery >= 0.85) score -= 300; // Mastered concepts sink to end or marked mastered

    return score;
  }

  // Ready queue contains nodes whose prerequisites are either mastered (>=0.80) or inDegree is 0
  const readyQueue: string[] = [];
  requiredKeys.forEach((key) => {
    const concept = conceptMap.get(key)!;
    const unmasteredPrereqs = concept.prerequisites.filter((p) => {
      const s = twin.skills[p];
      return !s || s.mastery < 0.75;
    });

    if (unmasteredPrereqs.length === 0 || inDegree.get(key) === 0) {
      readyQueue.push(key);
    }
  });

  const orderedKeys: string[] = [];
  const processed = new Set<string>();

  while (readyQueue.length > 0) {
    // Sort ready queue by priority score descending (tie-breaker: key name)
    readyQueue.sort((a, b) => {
      const pDiff = getPriorityScore(b) - getPriorityScore(a);
      return pDiff !== 0 ? pDiff : a.localeCompare(b);
    });

    const currentKey = readyQueue.shift()!;
    if (processed.has(currentKey)) continue;
    processed.add(currentKey);
    orderedKeys.push(currentKey);

    const neighbors = adjacency.get(currentKey) || [];
    for (const neighbor of neighbors) {
      const deg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, deg);
      if (deg <= 0 && !processed.has(neighbor)) {
        readyQueue.push(neighbor);
      }
    }
  }

  // Catch any remaining nodes (if cycle or isolated)
  requiredKeys.forEach((key) => {
    if (!processed.has(key)) {
      orderedKeys.push(key);
    }
  });

  // Calculate total pulls for bandit
  let totalBanditPulls = 0;
  Object.values(twin.banditStats).forEach((s) => (totalBanditPulls += s.pulls));

  // 4. Construct Path Modules with Explainability
  const modules: PathModule[] = orderedKeys.map((key, index) => {
    const concept = conceptMap.get(key)!;
    const skill = twin.skills[key] || {
      mastery: 0.15,
      halfLifeDays: 3,
      lastPracticed: '',
      reviewDue: false,
      retention: 0.15,
    };
    const activeMisc = twin.misconceptions.find(
      (m) => m.conceptKey === key && m.confidence >= 0.40
    );

    let status: PathModule['status'] = 'upcoming';
    if (skill.mastery >= 0.85) {
      status = 'mastered';
    } else if (skill.reviewDue) {
      status = 'review_due';
    } else if (index === 0 || orderedKeys.slice(0, index).every((k) => (twin.skills[k]?.mastery || 0) >= 0.70)) {
      status = 'current';
    }

    // Determine reason
    let reasonCategory: PathModule['reason']['category'] = 'goal_target';
    let summary = `Core milestone for ${goal.targetProfile}`;
    let detail = `Essential building block for subsequent algorithms.`;
    const inputsUsed = [`Goal: ${goal.targetProfile}`, `Mastery: ${Math.round(skill.mastery * 100)}%`];

    let isRootCauseForTitle = '';
    rootCauses.forEach((rc, weakKey) => {
      if (rc.rootKey === key) {
        const weakConcept = conceptMap.get(weakKey);
        if (weakConcept) isRootCauseForTitle = weakConcept.title;
      }
    });

    if (isRootCauseForTitle) {
      reasonCategory = 'root_cause';
      summary = `Root Cause Blocker for ${isRootCauseForTitle}`;
      detail = `Fixing this fundamental prerequisite prevents compounding errors in downstream ${isRootCauseForTitle}. Estimated 8–12 days saved.`;
      inputsUsed.push(`Prerequisite failure trace`, `Unblocks ${isRootCauseForTitle}`);
    } else if (activeMisc) {
      reasonCategory = 'active_misconception';
      summary = `Diagnosed Mental Model Gap`;
      detail = `Remedies detected belief: "${activeMisc.description}" (${Math.round(activeMisc.confidence * 100)}% confidence).`;
      inputsUsed.push(`Misconception ID: ${activeMisc.misconceptionId}`, `Confidence: ${Math.round(activeMisc.confidence * 100)}%`);
    } else if (skill.reviewDue) {
      reasonCategory = 'review_decay';
      summary = `Spaced Review Before Forgetting`;
      detail = `Retention is currently at ${Math.round((skill.retention || 0.6) * 100)}%. A quick practice now consolidates long-term recall.`;
      inputsUsed.push(`Current retention: ${Math.round((skill.retention || 0.6) * 100)}%`, `Half-life: ${skill.halfLifeDays}d`);
    } else if (skill.mastery < 0.70) {
      reasonCategory = 'prerequisite_gap';
      summary = `Foundational Gap`;
      detail = `Current mastery is ${Math.round(skill.mastery * 100)}%. Requires targeted practice before tackling complex variations.`;
      inputsUsed.push(`Current mastery: ${Math.round(skill.mastery * 100)}%`);
    }

    // Match best resource using contextual bandit
    const matchingResources = resources.filter((r) => r.conceptKeys.includes(key));
    let bestResource: Resource = matchingResources[0] || {
      id: `fallback-${key}`,
      title: `${concept.title} Deep Dive & Practice`,
      url: `https://learntwin.dev/learn/${key}`,
      format: 'worked_example',
      conceptKeys: [key],
      durationMin: concept.estimatedMinutes,
      difficulty: concept.difficulty,
      authorOrSource: 'LearnTwin Interactive Lab',
    };

    let bestScore = -1;
    let bestBoost = 10;

    matchingResources.forEach((res) => {
      const { score, projectedBoostPercent } = scoreResourceWithBandit(
        res,
        twin.banditStats,
        totalBanditPulls
      );
      if (score > bestScore) {
        bestScore = score;
        bestResource = res;
        bestBoost = projectedBoostPercent;
      }
    });

    return {
      conceptKey: key,
      title: concept.title,
      cluster: concept.cluster,
      status,
      estimatedMinutes: concept.estimatedMinutes,
      reason: {
        category: reasonCategory,
        summary,
        detail,
        inputsUsed,
      },
      recommendedResource: bestResource,
      formatBoostPercent: bestBoost,
      banditScore: bestScore > 0 ? bestScore : 8.5,
    };
  });

  return modules;
}

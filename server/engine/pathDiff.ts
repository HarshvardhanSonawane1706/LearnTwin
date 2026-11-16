/**
 * @license
 * Visual Path Diff Engine
 * 
 * Compares an existing PathSnapshot against a newly adapted path.
 * Outputs a git-style delta:
 * - Removed: modules that reached mastery (graduated from active queue)
 * - Added: modules inserted to address newly diagnosed prerequisite gaps or reviews
 * - Reordered: modules shifted earlier or later to optimize dependency learning
 */

import { PathModule, PathDiff } from '../types.js';

export function computePathDiff(
  oldModules: PathModule[],
  newModules: PathModule[]
): PathDiff {
  const oldMap = new Map<string, { module: PathModule; index: number }>();
  oldModules.forEach((m, idx) => oldMap.set(m.conceptKey, { module: m, index: idx }));

  const newMap = new Map<string, { module: PathModule; index: number }>();
  newModules.forEach((m, idx) => newMap.set(m.conceptKey, { module: m, index: idx }));

  const removed: PathDiff['removed'] = [];
  const added: PathDiff['added'] = [];
  const reordered: PathDiff['reordered'] = [];

  // Check removed (present in old but either absent or marked mastered in new)
  oldModules.forEach((oldMod) => {
    const newEntry = newMap.get(oldMod.conceptKey);
    if (!newEntry || (newEntry.module.status === 'mastered' && oldMod.status !== 'mastered')) {
      removed.push({
        conceptKey: oldMod.conceptKey,
        title: oldMod.title,
        reason: newEntry?.module.status === 'mastered'
          ? 'Mastery verified (≥85%) — graduated from active backlog to retention maintenance.'
          : 'Bypassed based on confirmed baseline prerequisite mastery.',
      });
    }
  });

  // Check added (present in new but absent in old)
  newModules.forEach((newMod) => {
    const oldEntry = oldMap.get(newMod.conceptKey);
    if (!oldEntry) {
      const isUrgent = newMod.reason.category === 'root_cause' || newMod.reason.category === 'active_misconception';
      added.push({
        conceptKey: newMod.conceptKey,
        title: newMod.title,
        reason: newMod.reason.detail || `Added as critical milestone for ${newMod.cluster}.`,
        priority: isUrgent ? 'high' : 'normal',
      });
    }
  });

  // Check reordered (present in both, but position significantly shifted)
  newModules.forEach((newMod, newIdx) => {
    const oldEntry = oldMap.get(newMod.conceptKey);
    if (oldEntry && Math.abs(oldEntry.index - newIdx) >= 1) {
      let reason = `Shifted from position #${oldEntry.index + 1} to #${newIdx + 1}.`;
      if (newIdx < oldEntry.index) {
        reason = newMod.reason.category === 'root_cause'
          ? `Prioritized earlier: diagnosed as prerequisite root cause for downstream topics.`
          : `Moved forward to resolve dependency gap before higher-order synthesis.`;
      } else {
        reason = `Deferred until foundational prerequisites are solidified.`;
      }

      reordered.push({
        conceptKey: newMod.conceptKey,
        title: newMod.title,
        oldIndex: oldEntry.index,
        newIndex: newIdx,
        reason,
      });
    }
  });

  return {
    removed,
    added,
    reordered,
  };
}

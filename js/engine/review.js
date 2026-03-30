import {REVIEW_MISSION_TAG_MAP} from '../config.js';
import {generateTask} from './taskGenerator.js';

export function scheduleReview(state, misconceptionTag, missionId = null, priority = 1) {
  const id = `${Date.now()}-${misconceptionTag}`;
  const item = {
    id,
    tag: misconceptionTag,
    missionId,
    priority,
    dueAt: Date.now(),
    reasonTextKey: misconceptionTag
  };

  state.reviewQueue = state.reviewQueue || [];
  if (!state.reviewQueue.some((entry) => entry.tag === misconceptionTag && entry.missionId === missionId)) {
    state.reviewQueue.push(item);
  }
}

export function pullDueReviewTasks(state, limit = 3) {
  const now = Date.now();
  const queue = Array.isArray(state.reviewQueue) ? state.reviewQueue : [];
  const due = queue.filter((entry) => (entry.dueAt || 0) <= now);
  due.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  return due.slice(0, limit);
}

export function consumeReviewOutcome(state, taskId, result) {
  if (!Array.isArray(state.reviewQueue)) {
    state.reviewQueue = [];
  }

  state.reviewQueue = state.reviewQueue.filter((entry) => entry.id !== taskId);
  if (result.correct) {
    return;
  }

  state.reviewQueue.push({
    id: `${Date.now()}-${taskId}`,
    tag: result.misconceptionTags?.[0] || 'generic-retry',
    missionId: null,
    priority: 2,
    dueAt: Date.now() + 1000 * 60 * 12,
    reasonTextKey: 'gentagelse'
  });
}

export function buildReviewTask(state, entry) {
  if (!entry) {
    return null;
  }

  const missionId = entry.missionSuggestion || entry.missionId || REVIEW_MISSION_TAG_MAP[entry.tag] || state.missionCatalog?.[0];
  const task = generateTask(state.session || {}, missionId, {
    forceType: 'quick_review'
  });

  return {
    ...task,
    id: entry.id || task.id,
    tag: entry.tag || 'generic'
  };
}

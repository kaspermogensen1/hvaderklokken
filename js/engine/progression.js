import {REVIEW_MISSION_TAG_MAP} from '../config.js';

export function ensureMissionState(state, missionId, missionCatalog = []) {
  if (!state.missions[missionId]) {
    const index = missionCatalog.indexOf(missionId);
    state.missions[missionId] = {
      status: index <= 0 ? 'unlocked' : 'locked',
      attempts: 0,
      correct: 0,
      totalTimeMs: 0,
      misconceptionCounts: {},
      lastRunAt: 0,
      masteryScore: 0,
      reviewDueAt: 0
    };
  }
  return state.missions[missionId];
}

export function missionState(state, missionId, missionCatalog = []) {
  return ensureMissionState(state, missionId, missionCatalog);
}

const computeMissionStatus = (missionDef, missionEntry) => {
  if (!missionDef) {
    return missionEntry.status;
  }

  const required = missionDef.requiredMastery || 70;
  if (missionEntry.attempts >= 6 && missionEntry.masteryScore >= required) {
    return 'completed';
  }

  if (missionEntry.attempts > 0) {
    return 'in_progress';
  }

  return missionEntry.status;
}

export function canUnlockNext(state, missionId, missionCatalog = []) {
  const missionIndex = state.missionCatalog?.indexOf(missionId) ?? missionCatalog.indexOf(missionId);
  const ordered = state.missionCatalog?.length ? state.missionCatalog : missionCatalog;
  if (!ordered.length) {
    return false;
  }

  if (missionIndex < 0) {
    return false;
  }

  const missionDef = state.missionDefs?.find((entry) => entry.id === missionId) || state._missionDefs?.find((entry) => entry.id === missionId);
  const entry = missionState(state, missionId);
  const status = computeMissionStatus(missionDef || {}, entry);

  return status === 'completed';
}

const ensureSkill = (state, skillId) => {
  if (!state.skills[skillId]) {
    state.skills[skillId] = {
      attempts: 0,
      correct: 0,
      mastery: 0,
      lastSeenAt: Date.now()
    };
  }
  return state.skills[skillId];
};

export function computeMastery(skillId, state) {
  const skill = state.skills?.[skillId];
  if (!skill || !skill.attempts) {
    return 0;
  }
  return Math.round((skill.correct / skill.attempts) * 100);
}

export function recordAttempt(taskId, missionId, result, misconceptionTags = [], state, task = {}) {
  const missionDef = state._missionDefs?.find((entry) => entry.id === missionId) || null;
  const missionEntry = ensureMissionState(state, missionId, state.missionCatalog || []);

  missionEntry.attempts += 1;
  missionEntry.lastRunAt = Date.now();
  if (result.correct) {
    missionEntry.correct += 1;
  }

  missionEntry.masteryScore = missionEntry.attempts > 0
    ? Math.round((missionEntry.correct / missionEntry.attempts) * 100)
    : missionEntry.masteryScore;

  if (task?.skills?.length) {
    task.skills.forEach((skillId) => {
      const skill = ensureSkill(state, skillId);
      skill.attempts += 1;
      if (result.correct) {
        skill.correct += 1;
      }
      skill.mastery = computeMastery(skillId, state);
      skill.lastSeenAt = Date.now();
    });
  }

  missionEntry.status = computeMissionStatus(missionDef || {}, missionEntry);
  const currentMissionIndex = state.missionCatalog.indexOf(missionId);

  if (misconceptionTags.length) {
    misconceptionTags.forEach((tag) => {
      const target = (state.misconceptions[tag] = state.misconceptions[tag] || {count: 0, streak: 0, lastAt: 0});
      target.count += 1;
      target.lastAt = Date.now();
      target.streak = (target.lastDate && target.lastAt - target.lastDate < 1000 * 60 * 60 * 3)
        ? (target.streak || 0) + 1
        : 1;
      target.lastDate = Date.now();
      missionEntry.misconceptionCounts[tag] = (missionEntry.misconceptionCounts[tag] || 0) + 1;
      if ((missionDef && target.count >= 2) || result.correct === false) {
        const queueItem = {
          id: `${taskId}-${tag}`,
          tag,
          missionId,
          priority: Math.min(10, Math.floor(target.streak + target.count)),
          dueAt: Date.now(),
          reasonTextKey: tag,
          missionSuggestion: REVIEW_MISSION_TAG_MAP[tag] || missionId
        };
        state.reviewQueue = state.reviewQueue || [];
        const exists = state.reviewQueue.some((entry) => entry.tag === tag && entry.missionId === missionId);
        if (!exists) {
          state.reviewQueue.push(queueItem);
        }
      }
    });
  }

  if (missionEntry.status === 'completed' && currentMissionIndex >= 0 && state.missionCatalog[currentMissionIndex + 1]) {
    const nextId = state.missionCatalog[currentMissionIndex + 1];
    ensureMissionState(state, nextId, state.missionCatalog);
    if (state.missions[nextId].status === 'locked') {
      state.missions[nextId].status = 'unlocked';
    }
  }

  return missionEntry;
}

export function evaluateStreak(state, resultCorrect) {
  const today = new Date().toISOString().slice(0, 10);
  if (resultCorrect) {
    if (state.streaks.lastDate === today) {
      state.streaks.current += 1;
    } else if (state.streaks.lastDate) {
      state.streaks.current = 1;
    } else {
      state.streaks.current = 1;
    }
  } else {
    state.streaks.current = 0;
  }
  state.streaks.best = Math.max(state.streaks.best, state.streaks.current);
  state.streaks.lastDate = today;
}

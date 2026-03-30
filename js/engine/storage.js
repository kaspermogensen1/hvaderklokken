import {APP_VERSION, STORAGE_KEY, LEGACY_STORAGE_KEYS, DEFAULT_SETTINGS} from '../config.js';
import {createDefaultLearningPathState} from './lessonEngine.js';

const createDefaultState = () => ({
  version: APP_VERSION,
  profile: {
    nickname: 'Lærling',
    avatar: 'clock',
    createdAt: Date.now(),
    lastActiveAt: Date.now()
  },
  settings: {
    ...DEFAULT_SETTINGS,
    theme: 'default'
  },
  missions: {},
  skills: {},
  misconceptions: {},
  streaks: {
    current: 0,
    best: 0,
    lastDate: ''
  },
  rewards: {
    stars: 0,
    gears: 0,
    unlockedBadges: [],
    unlockedThemes: ['default']
  },
  reviewQueue: [],
  placement: {
    completed: false,
    missionSuggestion: 'm1'
  },
  learningPath: createDefaultLearningPathState(),
  session: {
    taskCounter: 0,
    taskGeneratorSeed: Date.now() & 0xffffffff
  },
  missionCatalog: []
});

export function migrateState(raw) {
  if (!raw || typeof raw !== 'object') {
    return createDefaultState();
  }

  const base = createDefaultState();
  return {
    ...base,
    ...raw,
    profile: {
      ...base.profile,
      ...(raw.profile || {})
    },
    settings: {
      ...base.settings,
      ...(raw.settings || {})
    },
    missions: {
      ...base.missions,
      ...(raw.missions || {})
    },
    skills: {
      ...base.skills,
      ...(raw.skills || {})
    },
    misconceptions: {
      ...base.misconceptions,
      ...(raw.misconceptions || {})
    },
    streaks: {
      ...base.streaks,
      ...(raw.streaks || {})
    },
    rewards: {
      ...base.rewards,
      ...(raw.rewards || {})
    },
    placement: {
      ...base.placement,
      ...(raw.placement || {})
    },
    learningPath: {
      ...base.learningPath,
      ...(raw.learningPath || {}),
      completedLessons: Array.isArray(raw.learningPath?.completedLessons)
        ? raw.learningPath.completedLessons
        : base.learningPath.completedLessons,
      completedCheckpoints: raw.learningPath?.completedCheckpoints && typeof raw.learningPath.completedCheckpoints === 'object'
        ? raw.learningPath.completedCheckpoints
        : base.learningPath.completedCheckpoints
    },
    reviewQueue: Array.isArray(raw.reviewQueue) ? raw.reviewQueue : base.reviewQueue
  };
}

export function loadState() {
  try {
    const keysToRead = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    for (const key of keysToRead) {
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }
      return migrateState(JSON.parse(raw));
    }
    return createDefaultState();
  } catch (err) {
    return createDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  LEGACY_STORAGE_KEYS.forEach((key) => {
    if (key !== STORAGE_KEY) {
      localStorage.removeItem(key);
    }
  });
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  LEGACY_STORAGE_KEYS.forEach((key) => {
    if (key !== STORAGE_KEY) {
      localStorage.removeItem(key);
    }
  });
  const state = createDefaultState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function ensureMissionEntries(state, missions = []) {
  const ordered = [...missions];
  state.missionCatalog = ordered.map((mission) => mission.id);

  ordered.forEach((mission, index) => {
    if (!state.missions[mission.id]) {
      state.missions[mission.id] = {
        status: index === 0 ? 'unlocked' : 'locked',
        attempts: 0,
        correct: 0,
        totalTimeMs: 0,
        misconceptionCounts: {},
        lastRunAt: 0,
        masteryScore: 0,
        reviewDueAt: 0
      };
    }
  });

  return state;
}

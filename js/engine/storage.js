import {APP_VERSION, STORAGE_KEY, DEFAULT_SETTINGS} from '../config.js';

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
    reviewQueue: Array.isArray(raw.reviewQueue) ? raw.reviewQueue : base.reviewQueue
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    return migrateState(JSON.parse(raw));
  } catch (err) {
    return createDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
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

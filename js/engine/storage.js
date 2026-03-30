import {APP_VERSION, STORAGE_KEY, LEGACY_STORAGE_KEYS, DEFAULT_SETTINGS} from '../config.js';
import {createDefaultLearningPathState, createDefaultTrackProgress} from './lessonEngine.js';

function createDefaultPlacementState() {
  return {
    byTrack: {
      analog: {
        completed: false,
        missionSuggestion: 'm1',
        lessonSuggestion: 'l0'
      },
      digital: {
        completed: false,
        missionSuggestion: 'dm1',
        lessonSuggestion: 'd0'
      }
    }
  };
}

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
  placement: createDefaultPlacementState(),
  learningPath: createDefaultLearningPathState(),
  session: {
    taskCounter: 0,
    taskGeneratorSeed: Date.now() & 0xffffffff
  },
  missionCatalog: []
});

function normalizeTrackState(rawTrack, fallbackTrack) {
  return {
    ...fallbackTrack,
    ...(rawTrack || {}),
    completedLessons: Array.isArray(rawTrack?.completedLessons) ? rawTrack.completedLessons : fallbackTrack.completedLessons,
    skippedLessons: Array.isArray(rawTrack?.skippedLessons) ? rawTrack.skippedLessons : fallbackTrack.skippedLessons,
    skippedSteps: Array.isArray(rawTrack?.skippedSteps) ? rawTrack.skippedSteps : fallbackTrack.skippedSteps,
    completedCheckpoints: rawTrack?.completedCheckpoints && typeof rawTrack.completedCheckpoints === 'object'
      ? rawTrack.completedCheckpoints
      : fallbackTrack.completedCheckpoints
  };
}

function migrateLearningPath(rawLearningPath) {
  const base = createDefaultLearningPathState();
  if (!rawLearningPath || typeof rawLearningPath !== 'object') {
    return base;
  }

  if (rawLearningPath.trackStates) {
    return {
      ...base,
      ...rawLearningPath,
      trackStates: {
        analog: normalizeTrackState(rawLearningPath.trackStates.analog, base.trackStates.analog),
        digital: normalizeTrackState(rawLearningPath.trackStates.digital, base.trackStates.digital)
      }
    };
  }

  return {
    ...base,
    activeTrack: rawLearningPath.activeTrack || 'analog',
    hasChosenTrack: rawLearningPath.hasSeenBeginnerIntro || rawLearningPath.activeTrack === 'analog',
    lastVisitedMode: rawLearningPath.lastVisitedMode || base.lastVisitedMode,
    trackStates: {
      analog: normalizeTrackState({
        entryChoice: rawLearningPath.entryChoice || '',
        hasSeenIntro: rawLearningPath.hasSeenBeginnerIntro || false,
        currentLessonId: rawLearningPath.currentLessonId || base.trackStates.analog.currentLessonId,
        currentStepIndex: rawLearningPath.currentStepIndex ?? base.trackStates.analog.currentStepIndex,
        completedLessons: rawLearningPath.completedLessons || [],
        completedCheckpoints: rawLearningPath.completedCheckpoints || {}
      }, base.trackStates.analog),
      digital: normalizeTrackState(null, base.trackStates.digital)
    }
  };
}

function migratePlacement(rawPlacement) {
  const base = createDefaultPlacementState();
  if (!rawPlacement || typeof rawPlacement !== 'object') {
    return base;
  }

  if (rawPlacement.byTrack) {
    return {
      ...base,
      ...rawPlacement,
      byTrack: {
        analog: {
          ...base.byTrack.analog,
          ...(rawPlacement.byTrack.analog || {})
        },
        digital: {
          ...base.byTrack.digital,
          ...(rawPlacement.byTrack.digital || {})
        }
      }
    };
  }

  return {
    ...base,
    byTrack: {
      analog: {
        ...base.byTrack.analog,
        completed: rawPlacement.completed || false,
        missionSuggestion: rawPlacement.missionSuggestion || base.byTrack.analog.missionSuggestion
      },
      digital: {
        ...base.byTrack.digital
      }
    }
  };
}

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
    placement: migratePlacement(raw.placement),
    learningPath: migrateLearningPath(raw.learningPath),
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

  const firstByTrack = {};
  ordered.forEach((mission, index) => {
    if (firstByTrack[mission.track] == null) {
      firstByTrack[mission.track] = index;
    }

    if (!state.missions[mission.id]) {
      state.missions[mission.id] = {
        status: index === firstByTrack[mission.track] ? 'unlocked' : 'locked',
        attempts: 0,
        correct: 0,
        skippedCount: 0,
        totalTimeMs: 0,
        misconceptionCounts: {},
        lastRunAt: 0,
        masteryScore: 0,
        reviewDueAt: 0
      };
    } else {
      state.missions[mission.id].skippedCount = state.missions[mission.id].skippedCount || 0;
    }
  });

  return state;
}

export function createFreshTrackProgress(track) {
  return createDefaultTrackProgress(track);
}

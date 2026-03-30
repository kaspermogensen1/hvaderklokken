import {STRINGS, FEEDBACK_MESSAGES} from '../copy.js';
import {classifyError} from './misconceptions.js';
import {toCanonical, toDanishPhrase, toDigital12, toDigital24, parseDanishPhrase} from './timeModel.js';
import {OPTION_LABELS} from '../../data/taskPresets.js';

let MISSION_DEFS = [];

const TASK_TYPE_BY_MISSION = {
  m1: ['read_clock', 'set_clock', 'match_representation'],
  m2: ['read_clock', 'set_clock', 'match_representation', 'missing_piece'],
  m3: ['read_clock', 'set_clock', 'error_detective', 'match_representation'],
  m4: ['read_clock', 'set_clock', 'missing_piece', 'quick_review'],
  m5: ['read_clock', 'set_clock', 'error_detective', 'match_representation'],
  m6: ['match_representation', 'set_clock', 'read_clock', 'boss_mission']
};

const LEVEL_MINUTES = {
  m1: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
  m2: [0, 30],
  m3: [15, 45],
  m4: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
  m5: [1, 3, 7, 8, 12, 17, 22, 28, 32, 37, 43, 47, 52, 57],
  m6: [0, 15, 30, 45, 8, 22, 43, 57]
};

const TYPE_FEEDBACK = {
  read_clock: ['readCorrect', 'readIncorrect'],
  set_clock: ['setCorrect', 'setIncorrect'],
  match_representation: ['matchCorrect', 'matchIncorrect'],
  error_detective: ['errorCorrect', 'errorIncorrect'],
  missing_piece: ['missingCorrect', 'missingIncorrect'],
  quick_review: ['reviewCorrect', 'reviewIncorrect'],
  boss_mission: ['bossCorrect', 'bossIncorrect']
};

function hashString(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = Math.imul(state, 1664525) + 1013904223;
    state >>>= 0;
    return state / 4294967296;
  };
}

function shuffle(items, rng) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pick(items, rng) {
  return items[Math.floor(rng() * items.length)];
}

function missionById(missionId) {
  return MISSION_DEFS.find((item) => item.id === missionId) || MISSION_DEFS[0] || null;
}

function buildExpected(totalMinutes, format, value) {
  return {totalMinutes, format, value};
}

function choiceOptions(correctValue, distractors, rng) {
  const values = shuffle(Array.from(new Set([correctValue, ...distractors])), rng).slice(0, 4);
  return values.map((label, index) => ({id: `option-${index}`, index, label}));
}

function normalizedExpectedValue(expected) {
  if (expected.value != null) {
    return expected.value;
  }

  if (expected.format === 'danish_phrase') {
    return toDanishPhrase(expected.totalMinutes);
  }
  if (expected.format === 'digital12') {
    return toDigital12(expected.totalMinutes, true);
  }
  if (expected.format === 'digital24') {
    return toDigital24(expected.totalMinutes, true);
  }
  return expected.totalMinutes;
}

function minutePoolForMission(missionId) {
  return LEVEL_MINUTES[missionId] || LEVEL_MINUTES.m1;
}

function createTarget(mission, rng) {
  const hours = mission?.id === 'm6' ? Array.from({length: 24}, (_, index) => index) : Array.from({length: 12}, (_, index) => index + 1);
  const hour = pick(hours, rng);
  const minute = pick(minutePoolForMission(mission?.id), rng);
  if (mission?.id === 'm6' && hour > 11) {
    return toCanonical(hour, minute);
  }
  return toCanonical(hour % 12, minute);
}

function distractorTimes(target, mission, rng) {
  const pool = new Set();
  const candidates = [-120, -60, -30, -15, 15, 30, 45, 60, 90, 120];
  while (pool.size < 3) {
    const delta = pick(candidates, rng);
    pool.add((target + delta + 1440) % 1440);
  }
  return [...pool];
}

function buildReadClockTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const value = toDanishPhrase(totalMinutes);
  return {
    type: 'read_clock',
    promptText: 'Hvad er tiden på uret?',
    showClock: true,
    showHelpers: true,
    answerMode: 'choice',
    expected: buildExpected(totalMinutes, 'danish_phrase', value),
    options: choiceOptions(
      value,
      distractorTimes(totalMinutes, mission, rng).map((time) => toDanishPhrase(time)),
      rng
    )
  };
}

function buildSetClockTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const initialTime = distractorTimes(totalMinutes, mission, rng)[0];
  return {
    type: 'set_clock',
    promptText: `Sæt uret til ${toDanishPhrase(totalMinutes)} (${toDigital24(totalMinutes, true)}).`,
    showClock: true,
    showHelpers: true,
    answerMode: 'clock',
    initialTime,
    expected: buildExpected(totalMinutes, 'canonical', totalMinutes),
    options: []
  };
}

function buildMatchTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const phrase = toDanishPhrase(totalMinutes);
  return {
    type: 'match_representation',
    promptText: `Hvilket dansk udtryk passer til ${toDigital12(totalMinutes, true)} / ${toDigital24(totalMinutes, true)}?`,
    showClock: true,
    showHelpers: true,
    answerMode: 'choice',
    expected: buildExpected(totalMinutes, 'danish_phrase', phrase),
    options: choiceOptions(
      phrase,
      distractorTimes(totalMinutes, mission, rng).map((time) => toDanishPhrase(time)),
      rng
    )
  };
}

function buildErrorTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const wrongClock = (totalMinutes + pick([15, 30, 45, -15, -30, -45], rng) + 1440) % 1440;
  const minuteChanged = wrongClock % 60 !== totalMinutes % 60;
  const errorType = minuteChanged ? 'Minutviseren' : 'Timeviseren';
  return {
    type: 'error_detective',
    promptText: `Uret viser ${toDanishPhrase(wrongClock)}, men det er forkert. Hvad skal rettes?`,
    showClock: true,
    showHelpers: true,
    answerMode: 'choice',
    wrongClock,
    expected: buildExpected(totalMinutes, 'error_type', errorType),
    options: ['Minutviseren', 'Timeviseren', 'Begge hænder', 'Ingen'].map((label, index) => ({
      id: `option-${index}`,
      index,
      label
    }))
  };
}

function buildMissingTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const phraseMode = rng() > 0.5;
  if (phraseMode) {
    const value = toDanishPhrase(totalMinutes);
    return {
      type: 'missing_piece',
      promptText: `Uret viser ${toDigital12(totalMinutes, true)}. Hvad siger man på dansk?`,
      showClock: true,
      showHelpers: true,
      answerMode: 'choice',
      expected: buildExpected(totalMinutes, 'danish_phrase', value),
      options: choiceOptions(
        value,
        distractorTimes(totalMinutes, mission, rng).map((time) => toDanishPhrase(time)),
        rng
      )
    };
  }

  const value = toDigital12(totalMinutes, true);
  return {
    type: 'missing_piece',
    promptText: `Uret viser ${toDanishPhrase(totalMinutes)}. Hvad er den rigtige 12-tals tid?`,
    showClock: true,
    showHelpers: true,
    answerMode: 'choice',
    expected: buildExpected(totalMinutes, 'digital12', value),
    options: choiceOptions(
      value,
      distractorTimes(totalMinutes, mission, rng).map((time) => toDigital12(time, true)),
      rng
    )
  };
}

function buildQuickReviewTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const value = toDigital24(totalMinutes, true);
  return {
    type: 'quick_review',
    promptText: `Hurtig gentagelse: Hvilken 24-tals tid passer til ${toDanishPhrase(totalMinutes)}?`,
    showClock: true,
    showHelpers: true,
    answerMode: 'choice',
    expected: buildExpected(totalMinutes, 'digital24', value),
    options: choiceOptions(
      value,
      distractorTimes(totalMinutes, mission, rng).map((time) => toDigital24(time, true)),
      rng
    )
  };
}

function buildBossTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  return {
    type: 'boss_mission',
    promptText: `Boss-opgave: Stil uret så det bliver ${toDanishPhrase(totalMinutes)}.`,
    showClock: true,
    showHelpers: false,
    answerMode: 'clock',
    initialTime: distractorTimes(totalMinutes, mission, rng)[0],
    expected: buildExpected(totalMinutes, 'canonical', totalMinutes),
    options: []
  };
}

const FACTORIES = {
  read_clock: buildReadClockTask,
  set_clock: buildSetClockTask,
  match_representation: buildMatchTask,
  error_detective: buildErrorTask,
  missing_piece: buildMissingTask,
  quick_review: buildQuickReviewTask,
  boss_mission: buildBossTask
};

export function setMissionDefinitions(missions) {
  MISSION_DEFS = Array.isArray(missions) ? missions : [];
}

export function selectTaskVariant(taskType, difficultyBand = 1, seed = 1) {
  if (taskType) {
    return taskType;
  }
  const rng = createSeededRandom(seed + difficultyBand);
  const keys = ['read_clock', 'set_clock', 'match_representation'];
  return pick(keys, rng);
}

export function generateTask(sessionState, missionId, options = {}) {
  const mission = missionById(missionId);
  const counter = sessionState?.taskCounter || 0;
  const baseSeed = (sessionState?.taskGeneratorSeed || 1) + hashString(`${missionId}-${counter}`);
  const rng = createSeededRandom(baseSeed);
  const allowedTypes = TASK_TYPE_BY_MISSION[mission?.id] || TASK_TYPE_BY_MISSION.m1;
  const type = options.forceType || pick(allowedTypes, rng);
  const task = (FACTORIES[type] || FACTORIES.read_clock)(mission, rng);

  if (sessionState) {
    sessionState.taskCounter = counter + 1;
    sessionState.taskGeneratorSeed = (baseSeed + 1) >>> 0;
  }

  return {
    id: `${mission?.id || 'm1'}-${counter}`,
    missionId: mission?.id || missionId,
    skills: mission?.skills || [],
    taskLabel: OPTION_LABELS[type] || 'Opgave',
    ...task
  };
}

export function evaluateAnswer(task, answer) {
  const expectedValue = normalizedExpectedValue(task.expected || {});
  let correct = false;
  let actual = null;

  if (task.answerMode === 'clock') {
    actual = answer?.time ?? null;
    correct = actual === expectedValue;
  } else {
    actual = answer?.selected?.label ?? null;
    correct = actual != null && actual === expectedValue;
  }

  let actualTotalMinutes = answer?.time ?? null;
  if (actualTotalMinutes == null && actual != null) {
    if (task.expected?.format === 'danish_phrase') {
      actualTotalMinutes = parseDanishPhrase(actual);
    } else if (task.expected?.format === 'digital12' || task.expected?.format === 'digital24') {
      const match = actual.match(/^(\d{1,2}):(\d{2})$/);
      if (match) {
        actualTotalMinutes = toCanonical(Number(match[1]), Number(match[2]));
      }
    }
  }

  let misconception = null;
  if (!correct) {
    misconception = classifyError(
      task.expected,
      {totalMinutes: actualTotalMinutes ?? task.wrongClock ?? null},
      {type: task.type, missionId: task.missionId}
    );
    if (!misconception) {
      const fallbackTag = task.type === 'read_clock' || task.type === 'error_detective'
        ? 'minute-hour-confusion'
        : 'analog_digital_split';
      misconception = {
        tag: fallbackTag,
        correctiveHint: STRINGS.misconceptions[fallbackTag]?.hint || STRINGS.feedback.genericIncorrect
      };
    }
  }

  const feedbackKey = TYPE_FEEDBACK[task.type] || TYPE_FEEDBACK.read_clock;
  return {
    correct,
    score: correct ? 1 : 0,
    misconceptionTags: misconception?.tag ? [misconception.tag] : [],
    feedback: {
      correct,
      message: FEEDBACK_MESSAGES[correct ? feedbackKey[0] : feedbackKey[1]] || (correct ? STRINGS.feedback.genericCorrect : STRINGS.feedback.genericIncorrect),
      misconceptionHint: correct ? STRINGS.feedback.genericCorrect : (misconception?.correctiveHint || STRINGS.misconceptions[misconception?.tag]?.hint || STRINGS.feedback.genericIncorrect)
    }
  };
}

export function evaluate(task, answer) {
  return evaluateAnswer(task, answer);
}

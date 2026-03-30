import {STRINGS, FEEDBACK_MESSAGES} from '../copy.js';
import {classifyError} from './misconceptions.js';
import {
  DAY_SEGMENTS,
  compareMoments,
  fromCanonical,
  getDaySegmentInfo,
  judgeEarlyLate,
  parseDanishPhrase,
  parseDigitalTime,
  toCanonical,
  toDanishPhrase,
  toDigital12,
  toDigital24,
  toSpokenWithContext
} from './timeModel.js';
import {OPTION_LABELS} from '../../data/taskPresets.js';

let MISSION_DEFS = [];

const LEVEL_MINUTES = {
  m1: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
  m2: [0, 30],
  m3: [15, 45],
  m4: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
  m5: [1, 3, 7, 8, 12, 17, 22, 28, 32, 37, 43, 47, 52, 57],
  m6: [0, 15, 30, 45, 8, 22, 43, 57],
  dm1: [0, 5, 7, 20, 45],
  dm2: [0, 15, 30, 45],
  dm3: [0, 10, 15, 20, 30, 45, 50],
  dm4: [0, 5, 10, 15, 20, 30, 45],
  dm5: [0, 15, 30, 45],
  dm6: [0, 15, 30, 45, 5, 20]
};

const TYPE_FEEDBACK = {
  read_clock: ['readCorrect', 'readIncorrect'],
  set_clock: ['setCorrect', 'setIncorrect'],
  match_representation: ['matchCorrect', 'matchIncorrect'],
  error_detective: ['errorCorrect', 'errorIncorrect'],
  missing_piece: ['missingCorrect', 'missingIncorrect'],
  quick_review: ['reviewCorrect', 'reviewIncorrect'],
  boss_mission: ['bossCorrect', 'bossIncorrect'],
  read_digital_time: ['digitalReadCorrect', 'digitalReadIncorrect'],
  set_digital_time: ['digitalSetCorrect', 'digitalSetIncorrect'],
  select_digital_time: ['digitalSelectCorrect', 'digitalSelectIncorrect'],
  compare_times: ['compareCorrect', 'compareIncorrect'],
  judge_early_late: ['earlyLateCorrect', 'earlyLateIncorrect'],
  classify_day_segment: ['daySegmentCorrect', 'daySegmentIncorrect'],
  match_daily_context: ['contextCorrect', 'contextIncorrect'],
  translate_digital_to_spoken: ['digitalSpokenCorrect', 'digitalSpokenIncorrect']
};

const DAILY_CONTEXTS = [
  {label: 'morgenmad', bestTime: toCanonical(7, 15), options: [toCanonical(7, 15), toCanonical(12, 15), toCanonical(18, 15), toCanonical(21, 15)]},
  {label: 'skole', bestTime: toCanonical(8, 0), options: [toCanonical(6, 45), toCanonical(8, 0), toCanonical(14, 0), toCanonical(20, 0)]},
  {label: 'skolefri og fritid', bestTime: toCanonical(15, 30), options: [toCanonical(7, 30), toCanonical(11, 30), toCanonical(15, 30), toCanonical(22, 30)]},
  {label: 'aftensmad', bestTime: toCanonical(18, 0), options: [toCanonical(7, 45), toCanonical(12, 0), toCanonical(18, 0), toCanonical(22, 0)]},
  {label: 'sengetid', bestTime: toCanonical(20, 30), options: [toCanonical(6, 30), toCanonical(11, 30), toCanonical(16, 30), toCanonical(20, 30)]}
];

const EARLY_LATE_SCENARIOS = [
  {label: 'Skolen', targetTime: toCanonical(8, 0)},
  {label: 'Bussen', targetTime: toCanonical(7, 30)},
  {label: 'Fodbold', targetTime: toCanonical(16, 0)},
  {label: 'Aftensmad', targetTime: toCanonical(18, 0)}
];

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

function isDigitalMission(mission) {
  return mission?.track === 'digital' || String(mission?.id || '').startsWith('dm');
}

function createTarget(mission, rng) {
  const hours = isDigitalMission(mission)
    ? Array.from({length: 24}, (_, index) => index)
    : (mission?.id === 'm6' ? Array.from({length: 24}, (_, index) => index) : Array.from({length: 12}, (_, index) => index + 1));
  const hour = pick(hours, rng);
  const minute = pick(minutePoolForMission(mission?.id), rng);
  if (isDigitalMission(mission) || mission?.id === 'm6') {
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

function weightedTaskPool(mission) {
  const distribution = mission?.taskDistribution || {};
  const pool = [];
  Object.entries(distribution).forEach(([type, frequency]) => {
    for (let count = 0; count < frequency; count += 1) {
      pool.push(type);
    }
  });
  return pool.length ? pool : ['read_clock', 'set_clock', 'match_representation'];
}

function digitalDescriptor(totalMinutes) {
  const {h24, m} = fromCanonical(totalMinutes);
  return `${h24} timer og ${m} minutter`;
}

function confusingMinuteValue(minute) {
  if (minute === 0) {
    return 30;
  }
  if (minute < 10) {
    return minute * 10;
  }
  const reversed = Number(String(minute).split('').reverse().join(''));
  return reversed === minute ? (minute + 5) % 60 : reversed;
}

function readDigitalDistractors(totalMinutes) {
  const {h24, m} = fromCanonical(totalMinutes);
  const wrongHour = h24 >= 10 ? Number(String(h24).slice(-1)) : (h24 + 10) % 24;
  return [
    `${m} timer og ${h24} minutter`,
    `${h24} timer og ${confusingMinuteValue(m)} minutter`,
    `${wrongHour} timer og ${m} minutter`
  ];
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
  if (isDigitalMission(mission)) {
    const value = toDigital24(totalMinutes, true);
    return {
      type: 'quick_review',
      promptText: `Hurtig gentagelse: Hvilken 24-timers tid passer til ${toSpokenWithContext(totalMinutes)}?`,
      showClock: false,
      showHelpers: false,
      answerMode: 'choice',
      expected: buildExpected(totalMinutes, 'digital24', value),
      options: choiceOptions(
        value,
        distractorTimes(totalMinutes, mission, rng).map((time) => toDigital24(time, true)),
        rng
      )
    };
  }

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

function buildReadDigitalTimeTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const value = digitalDescriptor(totalMinutes);
  return {
    type: 'read_digital_time',
    track: 'digital',
    promptText: `Hvad betyder ${toDigital24(totalMinutes, true)}?`,
    showClock: false,
    showHelpers: false,
    answerMode: 'choice',
    expected: buildExpected(totalMinutes, 'literal', value),
    options: choiceOptions(value, readDigitalDistractors(totalMinutes), rng)
  };
}

function buildSetDigitalTimeTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const promptText = mission?.difficultyBand <= 1
    ? `Skriv den digitale tid for ${digitalDescriptor(totalMinutes)}.`
    : `Skriv den digitale tid for ${toSpokenWithContext(totalMinutes)}.`;
  return {
    type: 'set_digital_time',
    track: 'digital',
    promptText,
    showClock: false,
    showHelpers: false,
    showReadout: true,
    answerMode: 'digital_input',
    expected: buildExpected(totalMinutes, 'canonical', totalMinutes),
    options: []
  };
}

function buildSelectDigitalTimeTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const value = toDigital24(totalMinutes, true);
  const promptText = mission?.difficultyBand <= 1
    ? `Hvilken digital tid passer til ${digitalDescriptor(totalMinutes)}?`
    : `Hvilken digital tid passer til ${toSpokenWithContext(totalMinutes)}?`;
  return {
    type: 'select_digital_time',
    track: 'digital',
    promptText,
    showClock: false,
    showHelpers: false,
    answerMode: 'choice',
    expected: buildExpected(totalMinutes, 'digital24', value),
    options: choiceOptions(
      value,
      distractorTimes(totalMinutes, mission, rng).map((time) => toDigital24(time, true)),
      rng
    )
  };
}

function buildCompareTimesTask(mission, rng) {
  const left = createTarget(mission, rng);
  const delta = pick([-20, -15, -10, -5, 0, 5, 10, 15, 20], rng);
  const right = (left + delta + 1440) % 1440;
  const relation = compareMoments(left, right);
  return {
    type: 'compare_times',
    track: 'digital',
    promptText: `Er ${toDigital24(left, true)} før eller efter ${toDigital24(right, true)}?`,
    showClock: false,
    answerMode: 'choice',
    expected: buildExpected(left, 'literal', relation),
    compareLeft: left,
    compareRight: right,
    options: ['Før', 'Efter', 'Samme tid'].map((label, index) => ({id: `option-${index}`, index, label}))
  };
}

function buildEarlyLateTask(mission, rng) {
  const scenario = pick(EARLY_LATE_SCENARIOS, rng);
  const delta = pick([-10, -5, 0, 5, 10], rng);
  const actualTime = (scenario.targetTime + delta + 1440) % 1440;
  const label = judgeEarlyLate(actualTime, scenario.targetTime);
  return {
    type: 'judge_early_late',
    track: 'digital',
    promptText: `${scenario.label} starter ${toDigital24(scenario.targetTime, true)}. Du kommer ${toDigital24(actualTime, true)}. Er du tidligt, til tiden eller sent?`,
    showClock: false,
    answerMode: 'choice',
    expected: buildExpected(actualTime, 'literal', label),
    targetTime: scenario.targetTime,
    actualTime,
    options: ['Tidligt', 'Til tiden', 'Sent'].map((option, index) => ({id: `option-${index}`, index, label: option}))
  };
}

function randomSegmentTime(segment, rng) {
  const exactHours = [];
  for (let hour = Math.floor(segment.start / 60); hour <= Math.floor(segment.end / 60); hour += 1) {
    [0, 15, 30, 45].forEach((minute) => {
      const total = toCanonical(hour, minute);
      if (total >= segment.start && total <= segment.end) {
        exactHours.push(total);
      }
    });
  }
  return pick(exactHours, rng);
}

function buildDaySegmentTask(rng) {
  const segment = pick(DAY_SEGMENTS, rng);
  const totalMinutes = randomSegmentTime(segment, rng);
  return {
    type: 'classify_day_segment',
    track: 'digital',
    promptText: `Hvilken del af dagen er ${toDigital24(totalMinutes, true)}?`,
    showClock: false,
    answerMode: 'choice',
    expected: buildExpected(totalMinutes, 'literal', segment.label),
    options: DAY_SEGMENTS.map((entry, index) => ({id: `option-${index}`, index, label: entry.label}))
  };
}

function buildDailyContextTask(rng) {
  const scenario = pick(DAILY_CONTEXTS, rng);
  if (rng() > 0.5) {
    const value = toDigital24(scenario.bestTime, true);
    return {
      type: 'match_daily_context',
      track: 'digital',
      promptText: `Hvilket tidspunkt passer bedst til ${scenario.label}?`,
      showClock: false,
      answerMode: 'choice',
      expected: buildExpected(scenario.bestTime, 'digital24', value),
      options: choiceOptions(
        value,
        scenario.options.filter((time) => time !== scenario.bestTime).map((time) => toDigital24(time, true)),
        rng
      )
    };
  }

  const value = scenario.label;
  return {
    type: 'match_daily_context',
    track: 'digital',
    promptText: `Hvilken situation passer bedst til ${toDigital24(scenario.bestTime, true)}?`,
    showClock: false,
    answerMode: 'choice',
    expected: buildExpected(scenario.bestTime, 'literal', value),
    options: choiceOptions(
      value,
      shuffle(DAILY_CONTEXTS.filter((entry) => entry.label !== scenario.label).map((entry) => entry.label), rng).slice(0, 3),
      rng
    )
  };
}

function buildTranslateDigitalToSpokenTask(mission, rng) {
  const totalMinutes = createTarget(mission, rng);
  const value = toSpokenWithContext(totalMinutes);
  const distractors = distractorTimes(totalMinutes, mission, rng).map((time) => toSpokenWithContext(time));
  return {
    type: 'translate_digital_to_spoken',
    track: 'digital',
    promptText: `Hvilket dansk udtryk passer til ${toDigital24(totalMinutes, true)}?`,
    showClock: false,
    answerMode: 'choice',
    expected: buildExpected(totalMinutes, 'literal', value),
    options: choiceOptions(value, distractors, rng)
  };
}

const FACTORIES = {
  read_clock: buildReadClockTask,
  set_clock: buildSetClockTask,
  match_representation: buildMatchTask,
  error_detective: buildErrorTask,
  missing_piece: buildMissingTask,
  quick_review: buildQuickReviewTask,
  boss_mission: buildBossTask,
  read_digital_time: buildReadDigitalTimeTask,
  set_digital_time: buildSetDigitalTimeTask,
  select_digital_time: buildSelectDigitalTimeTask,
  compare_times: buildCompareTimesTask,
  judge_early_late: buildEarlyLateTask,
  classify_day_segment: () => buildDaySegmentTask(createSeededRandom(Date.now())),
  match_daily_context: () => buildDailyContextTask(createSeededRandom(Date.now())),
  translate_digital_to_spoken: buildTranslateDigitalToSpokenTask
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
  const allowedTypes = weightedTaskPool(mission);
  const type = options.forceType || pick(allowedTypes, rng);
  const factory = FACTORIES[type] || FACTORIES.read_clock;
  const task = (type === 'classify_day_segment' || type === 'match_daily_context')
    ? (type === 'classify_day_segment' ? buildDaySegmentTask(rng) : buildDailyContextTask(rng))
    : factory(mission, rng);

  if (sessionState) {
    sessionState.taskCounter = counter + 1;
    sessionState.taskGeneratorSeed = (baseSeed + 1) >>> 0;
  }

  return {
    id: `${mission?.id || 'm1'}-${counter}`,
    missionId: mission?.id || missionId,
    track: mission?.track || (String(missionId).startsWith('dm') ? 'digital' : 'analog'),
    skills: mission?.skills || [],
    taskLabel: OPTION_LABELS[type] || 'Opgave',
    ...task
  };
}

function inferActualTotalMinutes(task, actual) {
  if (typeof actual !== 'string') {
    return null;
  }
  if (task.expected?.format === 'danish_phrase' || task.type === 'translate_digital_to_spoken') {
    return parseDanishPhrase(actual);
  }
  if (task.expected?.format === 'digital12' || task.expected?.format === 'digital24') {
    return parseDigitalTime(actual);
  }
  return parseDigitalTime(actual);
}

export function evaluateAnswer(task, answer) {
  if (answer?.skipped) {
    return {
      correct: false,
      skipped: true,
      score: 0,
      misconceptionTags: [],
      feedback: {
        correct: false,
        message: STRINGS.feedback.skipped,
        misconceptionHint: STRINGS.feedback.skippedHint
      }
    };
  }

  const expectedValue = normalizedExpectedValue(task.expected || {});
  let correct = false;
  let actual = null;

  if (task.answerMode === 'clock' || task.answerMode === 'digital_input') {
    actual = answer?.time ?? null;
    correct = actual === expectedValue;
  } else {
    actual = answer?.selected?.label ?? null;
    correct = actual != null && actual === expectedValue;
  }

  let actualTotalMinutes = answer?.time ?? null;
  if (actualTotalMinutes == null && actual != null) {
    actualTotalMinutes = inferActualTotalMinutes(task, actual);
  }

  let misconception = null;
  if (!correct) {
    misconception = classifyError(
      task.expected,
      {totalMinutes: actualTotalMinutes ?? task.wrongClock ?? null, value: actual},
      {type: task.type, missionId: task.missionId, track: task.track}
    );
    if (!misconception) {
      const fallbackTag = task.track === 'digital'
        ? 'digital_hour_minute_order'
        : (task.type === 'read_clock' || task.type === 'error_detective' ? 'minute-hour-confusion' : 'analog_digital_split');
      misconception = {
        tag: fallbackTag,
        correctiveHint: STRINGS.misconceptions[fallbackTag]?.hint || STRINGS.feedback.genericIncorrect
      };
    }
  }

  const feedbackKey = TYPE_FEEDBACK[task.type] || TYPE_FEEDBACK.read_clock;
  return {
    correct,
    skipped: false,
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

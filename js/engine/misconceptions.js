import {
  fromCanonical,
  getDaySegment,
  judgeEarlyLate,
  toSpokenWithContext
} from './timeModel.js';

export const MISCONCEPTION_TAGS = [
  'minute-hour-confusion',
  'num8means40',
  'hourHandOnWholeNumberOnly',
  'halv_to_misread',
  'quarter_past_to_confusion',
  'analog_digital_split',
  'h24_context_error',
  'digital_hour_minute_order',
  'leading_zero_confusion',
  'before_after_reversal',
  'early_late_reversal',
  'day_segment_confusion',
  'digital_analog_bridge_confusion'
];

function classifyAnalogError(expectedTime, actualTime, context) {
  if (!expectedTime || !actualTime) {
    return null;
  }

  const eHour = expectedTime.h24;
  const aHour = actualTime.h24;
  const eMin = expectedTime.m;
  const aMin = actualTime.m;

  if (eMin === 40 && aMin === 8) {
    return {
      tag: 'num8means40',
      messageId: 'num8means40',
      correctiveHint: '8 minutter er stadig tæt på toppen, mens 40 ligger længere fremme.'
    };
  }

  if (eMin === 30 && aMin === 30 && Math.abs(eHour - aHour) === 1) {
    return {
      tag: 'halv_to_misread',
      messageId: 'halv_to_misread',
      correctiveHint: '"Halv to" betyder en halv-time før to, altså 1:30.'
    };
  }

  if ((eMin === 15 && aMin === 45) || (eMin === 45 && aMin === 15)) {
    return {
      tag: 'quarter_past_to_confusion',
      messageId: 'quarter_past_to_confusion',
      correctiveHint: '15 minutter er kvart over; 45 minutter er kvart i.'
    };
  }

  if ((eMin === 30 && aMin === 0) || (eMin === 0 && aMin === 30)) {
    return {
      tag: 'hourHandOnWholeNumberOnly',
      messageId: 'hourHandOnWholeNumberOnly',
      correctiveHint: 'Selv når det er halv, skal timehånden være mellem to tal.'
    };
  }

  if (eMin !== aMin && eHour === aHour) {
    return {
      tag: 'minute-hour-confusion',
      messageId: 'minute-hour-confusion',
      correctiveHint: 'Kontroller om det er minut- eller timehånden, der skal justeres.'
    };
  }

  if (eHour !== aHour && Math.floor(eMin / 5) === Math.floor(aMin / 5)) {
    return {
      tag: 'minute-hour-confusion',
      messageId: 'minute-hour-confusion',
      correctiveHint: 'Prøv at knytte den korte og lange hånd sammen med det samme tidspunkt.'
    };
  }

  if (context.type === 'match_representation') {
    return {
      tag: 'analog_digital_split',
      messageId: 'analog_digital_split',
      correctiveHint: 'Analogt og digitalt er to måder at vise den samme tid.'
    };
  }

  return {
    tag: 'h24_context_error',
    messageId: 'h24_context_error',
    correctiveHint: 'Tænk på 12-timers og 24-timers former som samme øjeblik.'
  };
}

function classifyDigitalError(expected, actual, context) {
  if (context.type === 'read_digital_time') {
    return {
      tag: expected?.totalMinutes != null && fromCanonical(expected.totalMinutes).h24 < 10 ? 'leading_zero_confusion' : 'digital_hour_minute_order',
      messageId: 'digital_hour_minute_order',
      correctiveHint: 'Tallene før kolon er timer. Tallene efter kolon er minutter.'
    };
  }

  if (context.type === 'compare_times') {
    return {
      tag: 'before_after_reversal',
      messageId: 'before_after_reversal',
      correctiveHint: 'Se først på timerne. Hvis de er ens, sammenligner du minutterne.'
    };
  }

  if (context.type === 'judge_early_late') {
    return {
      tag: 'early_late_reversal',
      messageId: 'early_late_reversal',
      correctiveHint: 'Før starttiden er tidligt. Efter starttiden er sent.'
    };
  }

  if (context.type === 'classify_day_segment' || context.type === 'match_daily_context') {
    return {
      tag: 'day_segment_confusion',
      messageId: 'day_segment_confusion',
      correctiveHint: 'Brug dagens rytme: morgen, formiddag, eftermiddag og aften.'
    };
  }

  if (context.type === 'translate_digital_to_spoken') {
    return {
      tag: 'digital_analog_bridge_confusion',
      messageId: 'digital_analog_bridge_confusion',
      correctiveHint: `${toSpokenWithContext(expected.totalMinutes)} er samme tidspunkt i både tale og tal.`
    };
  }

  if (expected?.totalMinutes != null && actual?.totalMinutes != null) {
    const expectedSegment = getDaySegment(expected.totalMinutes);
    const actualSegment = getDaySegment(actual.totalMinutes);
    if (expectedSegment !== actualSegment) {
      return {
        tag: 'day_segment_confusion',
        messageId: 'day_segment_confusion',
        correctiveHint: 'Se på hvilken del af dagen tidspunktet ligger i.'
      };
    }

    if (judgeEarlyLate(actual.totalMinutes, expected.totalMinutes) !== 'Til tiden') {
      return {
        tag: 'before_after_reversal',
        messageId: 'before_after_reversal',
        correctiveHint: 'Sammenlign først timerne og derefter minutterne.'
      };
    }
  }

  return {
    tag: 'digital_hour_minute_order',
    messageId: 'digital_hour_minute_order',
    correctiveHint: 'Timerne kommer før kolon. Minutterne kommer bagefter.'
  };
}

export function classifyError(expected, actual, context = {}) {
  if (context.track === 'digital' || String(context.type || '').startsWith('digital_') || [
    'read_digital_time',
    'set_digital_time',
    'select_digital_time',
    'compare_times',
    'judge_early_late',
    'classify_day_segment',
    'match_daily_context',
    'translate_digital_to_spoken'
  ].includes(context.type)) {
    return classifyDigitalError(expected, actual, context);
  }

  if (!expected || !actual) {
    return null;
  }

  const expectedTime = expected.totalMinutes != null ? fromCanonical(expected.totalMinutes) : null;
  const actualTime = actual.totalMinutes != null ? fromCanonical(actual.totalMinutes) : null;
  return classifyAnalogError(expectedTime, actualTime, context);
}

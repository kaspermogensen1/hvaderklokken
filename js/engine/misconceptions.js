import {fromCanonical} from './timeModel.js';

export const MISCONCEPTION_TAGS = [
  'minute-hour-confusion',
  'num8means40',
  'hourHandOnWholeNumberOnly',
  'halv_to_misread',
  'quarter_past_to_confusion',
  'analog_digital_split',
  'h24_context_error'
];

export function classifyError(expected, actual, context = {}) {
  if (!expected || !actual) {
    return null;
  }

  const expectedTime = expected.totalMinutes != null ? fromCanonical(expected.totalMinutes) : null;
  const actualTime = actual.totalMinutes != null ? fromCanonical(actual.totalMinutes) : null;

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

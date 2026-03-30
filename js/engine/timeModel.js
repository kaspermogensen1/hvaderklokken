const HOUR_WORDS = {
  0: 'tolv',
  1: 'et',
  2: 'to',
  3: 'tre',
  4: 'fire',
  5: 'fem',
  6: 'seks',
  7: 'syv',
  8: 'otte',
  9: 'ni',
  10: 'ti',
  11: 'elleve',
  12: 'tolv'
};

export const DAY_SEGMENTS = [
  {key: 'nat', label: 'Nat', phrase: 'om natten', start: 0, end: 299},
  {key: 'morgen', label: 'Morgen', phrase: 'om morgenen', start: 300, end: 539},
  {key: 'formiddag', label: 'Formiddag', phrase: 'om formiddagen', start: 540, end: 719},
  {key: 'eftermiddag', label: 'Eftermiddag', phrase: 'om eftermiddagen', start: 720, end: 1019},
  {key: 'aften', label: 'Aften', phrase: 'om aftenen', start: 1020, end: 1439}
];

const normalize24 = (hours24) => {
  const wrapped = ((hours24 % 24) + 24) % 24;
  return wrapped;
};

const normalizeMinutes = (minutes) => {
  const wrapped = ((minutes % 60) + 60) % 60;
  return wrapped;
};

export const normalizeTotalMinutes = (totalMinutes) => {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  return wrapped;
};

const pad2 = (value) => String(value).padStart(2, '0');

const normalizeAngle = (angle) => {
  const wrapped = ((angle % 360) + 360) % 360;
  return wrapped;
};

export function toCanonical(hours24, minutes) {
  return normalize24(hours24) * 60 + normalizeMinutes(minutes);
}

export function fromCanonical(totalMinutes) {
  const total = normalizeTotalMinutes(totalMinutes);
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const h12 = h24 % 12;
  const ampm = h24 < 12 ? 'am' : 'pm';
  return {
    h24,
    m,
    h12: h12 === 0 ? 12 : h12,
    ampm,
    totalMinutes: total
  };
}

export function anglesFromTime(totalMinutes) {
  const canon = normalizeTotalMinutes(totalMinutes);
  const {h24, m} = fromCanonical(canon);
  const h12Zero = h24 % 12;
  const minuteDeg = (m * 6) % 360;
  const hourDeg = ((h12Zero * 30) + (m * 0.5)) % 360;
  return {
    hourDeg,
    minuteDeg
  };
}

const roundMinuteByStep = (minute, step) => {
  const scaled = Math.round(minute / step);
  const snapped = (scaled * step) % 60;
  return snapped;
};

export function timeFromAngles(hourDeg, minuteDeg, snapMode = 'exact') {
  const minuteBase = Math.round(normalizeAngle(minuteDeg) / 6);
  const step = snapMode === 'five' ? 5 : snapMode === 'quarter' ? 15 : 1;
  const minute = roundMinuteByStep(minuteBase, step);
  const hourRaw = Math.floor((normalizeAngle(hourDeg) - minute * 0.5 + 360) / 30) % 12;
  return hourRaw * 60 + minute;
}

export function toDigital12(totalMinutes, withLeadingZero = false) {
  const {h12, m} = fromCanonical(totalMinutes);
  const hour = withLeadingZero ? String(h12).padStart(2, '0') : String(h12);
  return `${hour}:${String(m).padStart(2, '0')}`;
}

export function toDigital24(totalMinutes, withLeadingZero = false) {
  const {h24, m} = fromCanonical(totalMinutes);
  const hour = withLeadingZero ? pad2(h24) : String(h24);
  return `${hour}:${String(m).padStart(2, '0')}`;
}

export function parseDigitalTime(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const match = value.trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
    return null;
  }

  return toCanonical(hours, minutes);
}

export function toDanishPhrase(totalMinutes) {
  const canon = normalizeTotalMinutes(totalMinutes);
  const {h24, m} = fromCanonical(canon);
  const hour = h24 % 12;
  const hourWord = HOUR_WORDS[hour === 0 ? 12 : hour];
  const nextHour = (hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12;
  const nextHourWord = HOUR_WORDS[nextHour];

  if (m === 0) {
    return `klokken ${hourWord}`;
  }

  if (m === 15) {
    return `kvart over ${hourWord}`;
  }

  if (m === 30) {
    return `halv ${nextHourWord}`;
  }

  if (m === 45) {
    return `kvart i ${nextHourWord}`;
  }

  if (m < 30) {
    return `${m} minutter over ${hourWord}`;
  }

  const before = 60 - m;
  return `${before} minutter i ${nextHourWord}`;
}

export function getDaySegmentInfo(totalMinutes) {
  const canonical = normalizeTotalMinutes(totalMinutes);
  return DAY_SEGMENTS.find((segment) => canonical >= segment.start && canonical <= segment.end) || DAY_SEGMENTS[0];
}

export function getDaySegment(totalMinutes) {
  return getDaySegmentInfo(totalMinutes).key;
}

export function getDaySegmentLabel(totalMinutes, mode = 'label') {
  const segment = getDaySegmentInfo(totalMinutes);
  return mode === 'phrase' ? segment.phrase : segment.label;
}

export function toSpokenWithContext(totalMinutes) {
  return `${toDanishPhrase(totalMinutes)} ${getDaySegmentLabel(totalMinutes, 'phrase')}`;
}

export function differenceInMinutes(left, right) {
  return normalizeTotalMinutes(left) - normalizeTotalMinutes(right);
}

export function compareMoments(left, right) {
  if (left === right) {
    return 'Samme tid';
  }
  return left < right ? 'Før' : 'Efter';
}

export function judgeEarlyLate(actual, target) {
  if (actual === target) {
    return 'Til tiden';
  }
  return actual < target ? 'Tidligt' : 'Sent';
}

export function parseDanishPhrase(phrase) {
  const normalized = phrase.trim().toLowerCase();

  const hourMatch = Object.entries(HOUR_WORDS).find(([, value]) => normalized.endsWith(value) || normalized.includes(` ${value}`));
  if (!hourMatch) {
    return 0;
  }

  const [hourString] = hourMatch;
  const hour = Number(hourString) % 12;

  if (normalized.startsWith('klokken ')) {
    return hour * 60;
  }

  if (normalized.includes('halv ')) {
    return ((hour + 11) % 12) * 60 + 30;
  }

  if (normalized.includes('kvart over ')) {
    return hour * 60 + 15;
  }

  if (normalized.includes('kvart i ')) {
    return ((hour + 11) % 12) * 60 + 45;
  }

  const overMatch = normalized.match(/^(\d{1,2}) minutter over /);
  if (overMatch) {
    return hour * 60 + Number(overMatch[1]);
  }

  const beforeMatch = normalized.match(/^(\d{1,2}) minutter i /);
  if (beforeMatch) {
    return ((hour + 11) % 12) * 60 + (60 - Number(beforeMatch[1]));
  }

  return 0;
}

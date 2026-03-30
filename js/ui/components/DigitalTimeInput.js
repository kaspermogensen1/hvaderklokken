import {toDigital24} from '../../engine/timeModel.js';

function digitsFromTime(totalMinutes) {
  return toDigital24(totalMinutes, true).replace(':', '');
}

function isValidNextDigit(currentDigits, digit) {
  const next = `${currentDigits}${digit}`;

  if (next.length === 1) {
    return Number(digit) <= 2;
  }

  if (next.length === 2) {
    const first = Number(next[0]);
    const second = Number(next[1]);
    return first === 2 ? second <= 3 : second <= 9;
  }

  if (next.length === 3) {
    return Number(next[2]) <= 5;
  }

  return next.length <= 4;
}

function formatDigits(digits) {
  const padded = digits.padEnd(4, '_');
  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
}

export function createDigitalTimeInput(options = {}) {
  const config = {
    initialTime: null,
    onChange: null,
    ...options
  };

  let digits = typeof config.initialTime === 'number' ? digitsFromTime(config.initialTime) : '';

  const wrap = document.createElement('div');
  wrap.className = 'digital-time-input';

  const display = document.createElement('div');
  display.className = 'digital-time-display';

  const hint = document.createElement('p');
  hint.className = 'muted digital-time-hint';
  hint.textContent = 'Skriv tiden med timer først og minutter bagefter.';

  const keypad = document.createElement('div');
  keypad.className = 'digital-time-keypad';

  const emitChange = () => {
    display.textContent = formatDigits(digits);
    const totalMinutes = digits.length === 4
      ? (Number(digits.slice(0, 2)) * 60) + Number(digits.slice(2, 4))
      : null;

    if (typeof config.onChange === 'function') {
      config.onChange({
        digits,
        value: digits.length === 4 ? formatDigits(digits) : '',
        totalMinutes
      });
    }
  };

  const pressDigit = (digit) => {
    if (digits.length >= 4 || !isValidNextDigit(digits, digit)) {
      return;
    }
    digits += digit;
    emitChange();
  };

  const clearDigits = () => {
    digits = '';
    emitChange();
  };

  const backspace = () => {
    digits = digits.slice(0, -1);
    emitChange();
  };

  ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Ryd', '0', 'Slet'].forEach((label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'digital-key';
    btn.textContent = label;

    if (label === 'Ryd') {
      btn.classList.add('secondary');
      btn.addEventListener('click', clearDigits);
    } else if (label === 'Slet') {
      btn.classList.add('secondary');
      btn.addEventListener('click', backspace);
    } else {
      btn.addEventListener('click', () => pressDigit(label));
    }

    keypad.append(btn);
  });

  wrap.append(display, hint, keypad);
  emitChange();

  return {
    el: wrap,
    getTime() {
      return digits.length === 4
        ? (Number(digits.slice(0, 2)) * 60) + Number(digits.slice(2, 4))
        : null;
    },
    getValue() {
      return digits.length === 4 ? formatDigits(digits) : '';
    },
    setTime(totalMinutes) {
      digits = typeof totalMinutes === 'number' ? digitsFromTime(totalMinutes) : '';
      emitChange();
    },
    clear() {
      clearDigits();
    },
    destroy() {}
  };
}

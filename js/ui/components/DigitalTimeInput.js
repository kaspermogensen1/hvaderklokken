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

function renderDisplay(display, digits) {
  display.innerHTML = '';

  const chars = digits.padEnd(4, '_');
  const positions = [0, 1, 'colon', 2, 3];

  positions.forEach((pos) => {
    if (pos === 'colon') {
      const colon = document.createElement('span');
      colon.textContent = ':';
      colon.className = digits.length >= 2 ? 'digit-filled' : 'digit-placeholder';
      display.append(colon);
      return;
    }

    const span = document.createElement('span');
    const ch = chars[pos];

    if (pos < digits.length) {
      span.textContent = ch;
      span.className = 'digit-filled';
    } else if (pos === digits.length) {
      span.textContent = '_';
      span.className = 'digit-cursor';
    } else {
      span.textContent = '_';
      span.className = 'digit-placeholder';
    }

    display.append(span);
  });
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
  hint.textContent = 'Skriv tiden — timer først, så minutter.';

  const keypad = document.createElement('div');
  keypad.className = 'digital-time-keypad';

  const keyButtons = {};

  const emitChange = () => {
    renderDisplay(display, digits);
    updateKeyStates();

    const totalMinutes = digits.length === 4
      ? (Number(digits.slice(0, 2)) * 60) + Number(digits.slice(2, 4))
      : null;

    if (typeof config.onChange === 'function') {
      config.onChange({
        digits,
        value: digits.length === 4 ? `${digits.slice(0, 2)}:${digits.slice(2, 4)}` : '',
        totalMinutes
      });
    }
  };

  const updateKeyStates = () => {
    for (let d = 0; d <= 9; d++) {
      const btn = keyButtons[String(d)];
      if (!btn) continue;

      if (digits.length >= 4 || !isValidNextDigit(digits, String(d))) {
        btn.classList.add('disabled-key');
      } else {
        btn.classList.remove('disabled-key');
      }
    }
  };

  const shakeDisplay = () => {
    display.classList.remove('shake');
    void display.offsetWidth;
    display.classList.add('shake');
  };

  const pressDigit = (digit) => {
    if (digits.length >= 4) {
      shakeDisplay();
      return;
    }
    if (!isValidNextDigit(digits, digit)) {
      shakeDisplay();
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
    if (digits.length === 0) return;
    digits = digits.slice(0, -1);
    emitChange();
  };

  ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Ryd', '0', '⌫'].forEach((label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'digital-key';
    btn.textContent = label;

    if (label === 'Ryd') {
      btn.classList.add('secondary');
      btn.addEventListener('click', clearDigits);
    } else if (label === '⌫') {
      btn.classList.add('secondary');
      btn.addEventListener('click', backspace);
    } else {
      keyButtons[label] = btn;
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
      return digits.length === 4 ? `${digits.slice(0, 2)}:${digits.slice(2, 4)}` : '';
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

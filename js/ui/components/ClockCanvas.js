import {anglesFromTime, toCanonical, toDigital12, toDigital24, toDanishPhrase, fromCanonical} from '../../engine/timeModel.js';

const SNAP_MAP = {
  five: 5,
  quarter: 15,
  exact: 1
};

export class ClockCanvas {
  constructor(root, options = {}) {
    this.root = root;
    this.onChange = options.onChange || (() => {});
    this.showHelpers = options.showHelpers !== false;
    this.interactive = options.interactive !== false;
    this.snapMode = options.snapMode || 'exact';
    this.currentCanonical = 0;
    this.dragging = null;
    this.lastMinuteIndex = 0;

    this._build();
    this.setCanonical(typeof options.initialTime === 'number' ? options.initialTime : 0, false);
    this.setHelpers(this.showHelpers);
    this._setInteractive(this.interactive);
  }

  _build() {
    const shell = document.createElement('div');
    shell.className = 'clock-shell';
    shell.tabIndex = 0;

    const fiveLayer = document.createElement('div');
    fiveLayer.className = 'helper-layer five';
    fiveLayer.dataset.layer = 'five';

    const quarterLayer = document.createElement('div');
    quarterLayer.className = 'helper-layer quarters';
    quarterLayer.dataset.layer = 'quarters';

    const hourHand = document.createElement('div');
    hourHand.className = 'clock-hand hour';
    hourHand.dataset.hand = 'hour';

    const minuteHand = document.createElement('div');
    minuteHand.className = 'clock-hand minute';
    minuteHand.dataset.hand = 'minute';

    const center = document.createElement('div');
    center.className = 'clock-center';

    for (let i = 1; i <= 12; i += 1) {
      const label = document.createElement('div');
      label.className = 'clock-number';
      const angle = ((i % 12) * 30 - 90) * (Math.PI / 180);
      const radius = 48;
      const size = 64;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      label.style.left = `${x}%`;
      label.style.top = `${y}%`;
      label.style.transform = 'translate(-50%, -50%)';
      label.textContent = i.toString();
      shell.appendChild(label);
    }

    shell.append(fiveLayer, quarterLayer, hourHand, minuteHand, center);
    this.root.appendChild(shell);

    this.shell = shell;
    this.hourHand = hourHand;
    this.minuteHand = minuteHand;
    this.fiveLayer = fiveLayer;
    this.quartersLayer = quarterLayer;

    this.pointerMove = this._onPointerMove.bind(this);
    this.pointerUp = this._onPointerUp.bind(this);
  }

  _setInteractive(enabled) {
    if (this._cleanup) {
      this._cleanup();
    }

    if (!enabled) {
      return;
    }

    const onDown = (event) => {
      const hand = event.target.closest('.clock-hand');
      if (!hand) {
        return;
      }

      this.dragging = hand.dataset.hand;
      hand.setPointerCapture?.(event.pointerId);
      this._onPointerMove(event);
      this.shell.addEventListener('pointermove', this.pointerMove);
      window.addEventListener('pointerup', this.pointerUp);
    };

    this.shell.addEventListener('pointerdown', onDown);
    this._cleanup = () => {
      this.shell.removeEventListener('pointerdown', onDown);
      this.shell.removeEventListener('pointermove', this.pointerMove);
      window.removeEventListener('pointerup', this.pointerUp);
    };
  }

  _angleFromEvent(event) {
    const rect = this.shell.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    return ((Math.atan2(y, x) * 180) / Math.PI + 450) % 360;
  }

  _onPointerMove(event) {
    if (!this.dragging) {
      return;
    }

    const angle = this._angleFromEvent(event);
    if (this.dragging === 'minute') {
      this._setMinuteFromAngle(angle);
    } else {
      this._setHourFromAngle(angle);
    }
    this._emitChange();
  }

  _onPointerUp() {
    this.dragging = null;
    this.shell.removeEventListener('pointermove', this.pointerMove);
    window.removeEventListener('pointerup', this.pointerUp);
  }

  _snapMinute(minute) {
    const step = SNAP_MAP[this.snapMode] || 1;
    return Math.round(minute / step) * step;
  }

  _setMinuteFromAngle(angle) {
    const floatMinute = angle / 6;
    let baseMinute = Math.round(floatMinute) % 60;
    
    // Magnetic snap to multiples of 5 within a tight radius (e.g., 1.2 minutes)
    const nearest5 = Math.round(floatMinute / 5) * 5;
    if (Math.abs(floatMinute - nearest5) < 1.2) {
      baseMinute = nearest5 % 60;
    }

    const snapped = this._snapMinute(baseMinute);
    const minute = snapped >= 60 ? 0 : snapped;
    const current = fromCanonical(this.currentCanonical);
    let nextHour = current.h24;
    const previousMinute = current.m;
    if (previousMinute >= 45 && minute <= 15) {
      if (Math.abs(minute - previousMinute) > 30) nextHour = (nextHour + 1) % 24;
    } else if (previousMinute <= 15 && minute >= 45) {
      if (Math.abs(minute - previousMinute) > 30) nextHour = (nextHour + 23) % 24;
    }
    this.currentCanonical = toCanonical(nextHour, minute);
    this._syncHandsFromCanonical();
  }

  _setHourFromAngle(angle) {
    const minute = this.currentCanonical % 60;
    const current = fromCanonical(this.currentCanonical);
    const currentPeriod = current.h24 >= 12 ? 12 : 0;
    
    const floatHour = (((angle % 360) + 360) % 360) / 30;
    let rawHour = Math.floor(floatHour) % 12;
    
    // Magnetic snap to exact hour if very close (e.g., 0.15 of an hour = 9 minutes)
    const nearestHour = Math.round(floatHour);
    if (Math.abs(floatHour - nearestHour) < 0.15) {
       rawHour = nearestHour % 12;
    }

    const mappedHour = (currentPeriod + rawHour) % 24;
    this.currentCanonical = toCanonical(mappedHour, minute);
    this._syncHandsFromCanonical();
  }

  _syncHandsFromCanonical() {
    const {hourDeg, minuteDeg} = anglesFromTime(this.currentCanonical);
    this.hourHand.style.transform = `translate(-50%, -100%) rotate(${hourDeg}deg)`;
    this.minuteHand.style.transform = `translate(-50%, -100%) rotate(${minuteDeg}deg)`;
  }

  _emitChange() {
    this._syncHandsFromCanonical();
    this.onChange({
      totalMinutes: this.currentCanonical,
      digital12: toDigital12(this.currentCanonical, true),
      digital24: toDigital24(this.currentCanonical, true),
      phrase: toDanishPhrase(this.currentCanonical)
    });
  }

  setHelpers(show) {
    this.showHelpers = show;
    this.fiveLayer.style.display = show ? 'block' : 'none';
    this.quartersLayer.style.display = show ? 'block' : 'none';
  }

  setCanonical(totalMinutes, emit = true) {
    const safe = toCanonical(Math.floor(totalMinutes / 60), totalMinutes % 60);
    this.currentCanonical = safe;
    this._syncHandsFromCanonical();
    if (emit) {
      this._emitChange();
    }
  }

  setCanonicalFrom12(totalMinutes, emit = true) {
    const safe12 = totalMinutes % 720;
    const isPm = Math.floor(totalMinutes / 720) % 2 === 1;
    this.currentCanonical = safe12 + (isPm ? 720 : 0);
    this._syncHandsFromCanonical();
    if (emit) {
      this._emitChange();
    }
  }

  getCanonicalTime() {
    return this.currentCanonical;
  }

  destroy() {
    if (this._cleanup) {
      this._cleanup();
    }
    this.root.innerHTML = '';
  }
}

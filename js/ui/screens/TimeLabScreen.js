import {STRINGS} from '../../copy.js';
import {ClockCanvas} from '../components/ClockCanvas.js';
import {toDigital12, toDigital24, toDanishPhrase} from '../../engine/timeModel.js';

function dayContext(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  if (hours < 5) {
    return 'om natten';
  }
  if (hours < 12) {
    return 'om morgenen';
  }
  if (hours < 18) {
    return 'om eftermiddagen';
  }
  return 'om aftenen';
}

function labReadout(totalMinutes) {
  return `${toDigital12(totalMinutes, true)} · ${toDigital24(totalMinutes, true)} · ${toDanishPhrase(totalMinutes)} ${dayContext(totalMinutes)}`;
}

export class TimeLabScreen {
  constructor(app) {
    this.app = app;
    this.clock = null;
    this.cleanup = null;
    this.phraseByTime = {};
  }

  destroy() {
    if (this.clock) {
      this.clock.destroy();
      this.clock = null;
    }
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
  }

  buildPhraseMap() {
    const map = {};
    for (let hour = 0; hour < 12; hour += 1) {
      [0, 15, 30, 45].forEach((minute) => {
        const m = hour * 60 + minute;
        map[toDanishPhrase(m)] = m;
      });
    }
    [8, 22, 43, 57].forEach((minute) => {
      for (let hour = 0; hour < 12; hour += 3) {
        const total = hour * 60 + minute;
        map[toDanishPhrase(total)] = total;
      }
    });
    for (let m = 0; m < 720; m += 60) {
      map[toDanishPhrase(m)] = m;
    }
    this.phraseByTime = map;
  }

  render(container) {
    this.destroy();
    this.buildPhraseMap();

    const root = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = STRINGS.mode.timeLab;
    const hint = document.createElement('p');
    hint.className = 'muted';
    hint.textContent = 'Træk hænderne eller skriv i felterne. Alle felter synkroniseres.';

    const clockWrap = document.createElement('div');
    clockWrap.className = 'clock-wrap';

    const reads = document.createElement('p');

    const controls = document.createElement('div');
    controls.className = 'toolbar';

    const clockInput = document.createElement('input');
    clockInput.type = 'time';

    const phrase = document.createElement('select');
    phrase.className = 'select-button';

    const defaultOption = document.createElement('option');
    defaultOption.textContent = STRINGS.labels.spoken;
    phrase.append(defaultOption);

    const entries = Object.entries(this.phraseByTime).sort((left, right) => left[1] - right[1]);
    entries.forEach(([key]) => {
      const item = document.createElement('option');
      item.value = key;
      item.textContent = key;
      phrase.append(item);
    });

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'secondary';
    toggle.textContent = STRINGS.labels.helperRings;

    controls.append(clockInput, phrase, toggle);

    this.clock = new ClockCanvas(clockWrap, {
      initialTime: 0,
      interactive: true,
      showHelpers: true,
      onChange: ({totalMinutes, digital12, digital24, phrase: spoken}) => {
        clockInput.value = toDigital24(totalMinutes, true);
        reads.textContent = `${digital12} · ${digital24} · ${spoken} ${dayContext(totalMinutes)}`;
      }
    });

    toggle.addEventListener('click', () => {
      const visible = !this.clock.showHelpers;
      this.clock.setHelpers(visible);
    });

    clockInput.value = toDigital24(this.clock.getCanonicalTime(), true);
    reads.textContent = labReadout(this.clock.getCanonicalTime());

    clockInput.addEventListener('change', () => {
      const [h, m] = clockInput.value.split(':').map((item) => Number(item));
      const total = (isNaN(h) || isNaN(m)) ? 0 : (h * 60 + m);
      this.clock.setCanonical(total);
      reads.textContent = labReadout(total);
    });

    phrase.addEventListener('change', () => {
      if (!phrase.value) {
        return;
      }

      const parsed = this.phraseByTime[phrase.value];
      if (parsed == null) {
        return;
      }

      const current = this.clock.getCanonicalTime();
      const preservePm = current >= 720;
      const total = preservePm ? (parsed + 720) % 1440 : parsed;
      this.clock.setCanonical(total);
    });

    root.append(title, hint, clockWrap, reads, controls);
    container.innerHTML = '';
    container.append(root);
  }
}

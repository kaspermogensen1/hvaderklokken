import {toDigital12, toDigital24, toDanishPhrase} from '../../engine/timeModel.js';

export function dayContext(totalMinutes) {
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

function createChip(label) {
  const chip = document.createElement('div');
  chip.className = 'time-chip';

  const title = document.createElement('span');
  title.className = 'time-chip-label';
  title.textContent = label;

  const value = document.createElement('strong');
  value.className = 'time-chip-value';

  chip.append(title, value);
  return {chip, value};
}

export function createTimeReadout(options = {}) {
  const config = {
    digital12: true,
    digital24: true,
    spoken: true,
    context: false,
    ...options
  };

  const wrap = document.createElement('div');
  wrap.className = 'time-readout';

  const chips = [];
  if (config.digital12) {
    chips.push(createChip('12 timer'));
  }
  if (config.digital24) {
    chips.push(createChip('24 timer'));
  }
  if (config.spoken) {
    chips.push(createChip('Sådan siger man det'));
  }
  if (config.context) {
    chips.push(createChip('Del af dagen'));
  }

  chips.forEach(({chip}) => wrap.append(chip));

  const update = (totalMinutes) => {
    let offset = 0;
    if (config.digital12) {
      chips[offset].value.textContent = toDigital12(totalMinutes, true);
      offset += 1;
    }
    if (config.digital24) {
      chips[offset].value.textContent = toDigital24(totalMinutes, true);
      offset += 1;
    }
    if (config.spoken) {
      chips[offset].value.textContent = toDanishPhrase(totalMinutes);
      offset += 1;
    }
    if (config.context) {
      chips[offset].value.textContent = dayContext(totalMinutes);
    }
  };

  return {el: wrap, update};
}

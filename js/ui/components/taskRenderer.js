import {ClockCanvas} from './ClockCanvas.js';
import {createDigitalTimeInput} from './DigitalTimeInput.js';
import {createTimeReadout} from './TimeReadout.js';
import {toDigital12, toDigital24, toDanishPhrase} from '../../engine/timeModel.js';

export function mountTask({mount, task, state, onSubmit}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'task-area';

  const prompt = document.createElement('div');
  prompt.className = 'prompt';
  prompt.textContent = task.promptText;
  wrapper.append(prompt);

  let clock = null;
  let digitalInput = null;
  let selected = null;
  let digitalRow = null;
  let readout = null;

  if (task.showClock) {
    const clockWrap = document.createElement('div');
    clockWrap.className = 'clock-wrap';
    wrapper.append(clockWrap);
    const initial = task.initialTime != null
      ? task.initialTime
      : task.wrongClock != null
        ? task.wrongClock
        : task.expected?.totalMinutes || 0;

    clock = new ClockCanvas(clockWrap, {
      initialTime: initial,
      interactive: task.answerMode === 'clock',
      showHelpers: task.showHelpers !== false,
      onChange: () => {
        if (digitalRow) {
          const t12 = toDigital12(clock.getCanonicalTime(), true);
          const t24 = toDigital24(clock.getCanonicalTime(), true);
          const timeStr = t12 === t24 ? t12 : `${t12} / ${t24}`;
          digitalRow.textContent = `${timeStr} • ${toDanishPhrase(clock.getCanonicalTime())}`;
        }
      }
    });

    if (task.showReadout) {
      digitalRow = document.createElement('p');
      digitalRow.className = 'muted';
      const t12 = toDigital12(clock.getCanonicalTime(), true);
      const t24 = toDigital24(clock.getCanonicalTime(), true);
      const timeStr = t12 === t24 ? t12 : `${t12} / ${t24}`;
      digitalRow.textContent = `${timeStr} • ${toDanishPhrase(clock.getCanonicalTime())}`;
      wrapper.append(digitalRow);
    }
  }

  if (task.answerMode === 'digital_input') {
    digitalInput = createDigitalTimeInput({
      initialTime: task.initialTime ?? null,
      onChange: ({totalMinutes}) => {
        if (readout && typeof totalMinutes === 'number') {
          readout.update(totalMinutes);
        }
      }
    });
    wrapper.append(digitalInput.el);

    if (task.showReadout) {
      readout = createTimeReadout({
        digital12: false,
        digital24: true,
        spoken: true,
        context: true
      });
      wrapper.append(readout.el);
      if (task.initialTime != null) {
        readout.update(task.initialTime);
      }
    }
  }

  const optionsWrap = document.createElement('div');
  optionsWrap.className = 'options';

  if (task.answerMode === 'choice' && Array.isArray(task.options)) {
    task.options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option-btn';
      button.textContent = option.label;
      button.dataset.index = String(option.index);
      button.addEventListener('click', () => {
        selected = option;
        [...optionsWrap.children].forEach((child) => {
          child.classList.remove('secondary');
          child.classList.remove('speaking-highlight');
        });
        button.classList.add('secondary');
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        onSubmit?.({selected}, task, clock);
      });
      optionsWrap.append(button);
    });
    wrapper.append(optionsWrap);
  }

  const actionRow = document.createElement('div');
  actionRow.className = 'toolbar';

  const handleCheck = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const answer = task.answerMode === 'clock'
      ? {time: clock ? clock.getCanonicalTime() : task.expected?.totalMinutes}
      : task.answerMode === 'digital_input'
        ? {time: digitalInput?.getTime() ?? null}
        : {selected};

    if (task.answerMode === 'choice' && !answer.selected) {
      return;
    }

    if (task.answerMode === 'digital_input' && typeof answer.time !== 'number') {
      return;
    }

    onSubmit?.(answer, task, clock);
  };

  if (task.answerMode === 'clock' || task.answerMode === 'digital_input') {
    const checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.textContent = 'Tjek svar';
    checkBtn.addEventListener('click', handleCheck);
    actionRow.append(checkBtn);
  }

  const skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'secondary';
  skip.textContent = 'Spring opgaven over';
  skip.addEventListener('click', () => {
    onSubmit?.({skipped: true}, task, clock);
  });
  actionRow.append(skip);

  wrapper.append(actionRow);
  mount.innerHTML = '';
  mount.append(wrapper);

  let speechTimeout;
  if (window.speechSynthesis && state.settings?.ttsEnabled !== false) {
    window.speechSynthesis.cancel();

    const promptUtterance = new SpeechSynthesisUtterance(task.promptText);
    promptUtterance.lang = 'da-DK';
    promptUtterance.rate = 0.9;

    const optionUtterances = [];
    if (task.answerMode === 'choice' && Array.isArray(task.options)) {
      task.options.forEach((option, index) => {
        const optionUtterance = new SpeechSynthesisUtterance(option.label);
        optionUtterance.lang = 'da-DK';
        optionUtterance.rate = 0.9;

        optionUtterance.onstart = () => {
          const btn = optionsWrap.children[index];
          if (btn) {
            btn.classList.add('speaking-highlight');
          }
        };

        optionUtterance.onend = () => {
          const btn = optionsWrap.children[index];
          if (btn) {
            btn.classList.remove('speaking-highlight');
          }
        };

        optionUtterances.push(optionUtterance);
      });

      promptUtterance.onend = () => {
        speechTimeout = setTimeout(() => {
          optionUtterances.forEach((utterance) => window.speechSynthesis.speak(utterance));
        }, 500);
      };
    }

    setTimeout(() => {
      window.speechSynthesis.speak(promptUtterance);
    }, 100);
  }

  return {
    cleanup() {
      if (speechTimeout) {
        clearTimeout(speechTimeout);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (clock?.destroy) {
        clock.destroy();
      }
      if (digitalInput?.destroy) {
        digitalInput.destroy();
      }
    },
    clock
  };
}

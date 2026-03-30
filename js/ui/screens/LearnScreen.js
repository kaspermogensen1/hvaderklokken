import {STRINGS} from '../../copy.js';
import {generateTask, evaluateAnswer} from '../../engine/taskGenerator.js';
import {
  createDefaultLearningPathState,
  createDefaultTrackProgress,
  evaluateLessonStep,
  getLessonById,
  getLessonDefinitions,
  getLessonIndex,
  getNextLessonId,
  getTrackMeta,
  getTrackProgress,
  isLessonUnlocked,
  TRACK_ORDER
} from '../../engine/lessonEngine.js';
import {toDigital12, toDigital24, toDanishPhrase} from '../../engine/timeModel.js';
import {mountTask} from '../components/taskRenderer.js';
import {recordAttempt, evaluateStreak, missionState} from '../../engine/progression.js';
import {saveState, resetState} from '../../engine/storage.js';
import {createPromptCard} from '../components/PromptCard.js';
import {createProgressBar} from '../components/ProgressBar.js';
import {createMascot} from '../components/Mascot.js';
import {createTimeReadout} from '../components/TimeReadout.js';
import {createDigitalTimeInput} from '../components/DigitalTimeInput.js';
import {ClockCanvas} from '../components/ClockCanvas.js';
import {triggerJuice} from '../juice.js';

const ANALOG_PLACEMENT_SEQUENCE = [
  {missionId: 'm1'},
  {missionId: 'm1'},
  {missionId: 'm2'},
  {missionId: 'm2'},
  {missionId: 'm3'},
  {missionId: 'm3'},
  {missionId: 'm4'},
  {missionId: 'm4'}
];

const DIGITAL_PLACEMENT_SEQUENCE = [
  {missionId: 'dm1', forceType: 'read_digital_time'},
  {missionId: 'dm1', forceType: 'select_digital_time'},
  {missionId: 'dm3', forceType: 'compare_times'},
  {missionId: 'dm4', forceType: 'judge_early_late'},
  {missionId: 'dm5', forceType: 'classify_day_segment'},
  {missionId: 'dm5', forceType: 'match_daily_context'},
  {missionId: 'dm6', forceType: 'translate_digital_to_spoken'}
];

function ensureLearningPath(state) {
  if (!state.learningPath) {
    state.learningPath = createDefaultLearningPathState();
  }
  if (!state.learningPath.trackStates) {
    state.learningPath = createDefaultLearningPathState();
  }
  TRACK_ORDER.forEach((track) => {
    if (!state.learningPath.trackStates[track]) {
      state.learningPath.trackStates[track] = createDefaultTrackProgress(track);
    }
  });
  if (!state.placement?.byTrack) {
    state.placement = {
      byTrack: {
        analog: {completed: false, missionSuggestion: 'm1', lessonSuggestion: 'l0'},
        digital: {completed: false, missionSuggestion: 'dm1', lessonSuggestion: 'd0'}
      }
    };
  }
  return state.learningPath;
}

function uniqueArray(items) {
  return [...new Set(items)];
}

function analogPlacementResult(results) {
  const misconceptionCounts = {};
  let correct = 0;

  results.forEach((result) => {
    if (result.correct) {
      correct += 1;
    }
    (result.misconceptionTags || []).forEach((tag) => {
      misconceptionCounts[tag] = (misconceptionCounts[tag] || 0) + 1;
    });
  });

  if ((misconceptionCounts['minute-hour-confusion'] || 0) + (misconceptionCounts.hourHandOnWholeNumberOnly || 0) >= 2) {
    return {missionId: 'm1', lessonId: 'l0'};
  }
  if ((misconceptionCounts.halv_to_misread || 0) >= 2) {
    return {missionId: 'm2', lessonId: 'l2'};
  }
  if ((misconceptionCounts.quarter_past_to_confusion || 0) >= 2) {
    return {missionId: 'm3', lessonId: 'l3'};
  }
  if ((misconceptionCounts.num8means40 || 0) >= 2) {
    return {missionId: 'm4', lessonId: 'l4'};
  }

  const accuracy = results.length ? correct / results.length : 0;
  if (accuracy >= 0.85) {
    return {missionId: 'm4', lessonId: 'l4'};
  }
  if (accuracy >= 0.7) {
    return {missionId: 'm3', lessonId: 'l3'};
  }
  if (accuracy >= 0.55) {
    return {missionId: 'm2', lessonId: 'l2'};
  }
  return {missionId: 'm1', lessonId: 'l0'};
}

function digitalPlacementResult(results) {
  const misconceptionCounts = {};
  let correct = 0;

  results.forEach((result) => {
    if (result.correct) {
      correct += 1;
    }
    (result.misconceptionTags || []).forEach((tag) => {
      misconceptionCounts[tag] = (misconceptionCounts[tag] || 0) + 1;
    });
  });

  if ((misconceptionCounts.digital_hour_minute_order || 0) + (misconceptionCounts.leading_zero_confusion || 0) >= 2) {
    return {missionId: 'dm1', lessonId: 'd0'};
  }
  if ((misconceptionCounts.before_after_reversal || 0) >= 2) {
    return {missionId: 'dm3', lessonId: 'd2'};
  }
  if ((misconceptionCounts.early_late_reversal || 0) >= 2) {
    return {missionId: 'dm4', lessonId: 'd3'};
  }
  if ((misconceptionCounts.day_segment_confusion || 0) >= 2) {
    return {missionId: 'dm5', lessonId: 'd4'};
  }
  if ((misconceptionCounts.digital_analog_bridge_confusion || 0) >= 2) {
    return {missionId: 'dm6', lessonId: 'd6'};
  }

  const accuracy = results.length ? correct / results.length : 0;
  if (accuracy >= 0.88) {
    return {missionId: 'dm6', lessonId: 'd6'};
  }
  if (accuracy >= 0.72) {
    return {missionId: 'dm4', lessonId: 'd3'};
  }
  if (accuracy >= 0.56) {
    return {missionId: 'dm3', lessonId: 'd2'};
  }
  return {missionId: 'dm1', lessonId: 'd0'};
}

function computePlacementSuggestion(track, results) {
  return track === 'digital' ? digitalPlacementResult(results) : analogPlacementResult(results);
}

function unlockThroughMission(state, suggestionId, track, missions) {
  let unlock = true;
  missions
    .filter((mission) => mission.track === track)
    .forEach((mission) => {
      const entry = missionState(state, mission.id, state.missionCatalog);
      if (unlock && entry.status === 'locked') {
        entry.status = 'unlocked';
      }
      if (mission.id === suggestionId) {
        unlock = false;
      }
    });
}

function mergeTeachingState(base, extra) {
  if (!extra) {
    return base || {};
  }
  return {
    ...(base || {}),
    ...extra
  };
}

export class LearnScreen {
  constructor(app) {
    this.app = app;
    ensureLearningPath(this.app.state);
    this.activeMissionId = null;
    this.currentTaskIndex = 0;
    this.currentTask = null;
    this.cleanup = null;
    this.feedback = null;
    this.rootRef = null;
    this.mode = this.app.state.learningPath.lastVisitedMode || 'guide';
    this.placementResults = [];
    this.mascot = createMascot();
    this.lessonRuntime = {
      lessonId: '',
      stepIndex: -1,
      attempts: 0,
      solved: false,
      currentTime: null,
      selectedChoice: '',
      feedbackType: '',
      feedbackMessage: '',
      showWorkedExample: false
    };
  }

  destroy() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    if (this.mascot.el.parentNode) {
      this.mascot.el.remove();
    }
  }

  get learningPath() {
    return ensureLearningPath(this.app.state);
  }

  get activeTrack() {
    return this.learningPath.activeTrack || 'analog';
  }

  get trackState() {
    const trackState = getTrackProgress(this.learningPath, this.activeTrack);
    this.learningPath.trackStates[this.activeTrack] = trackState;
    return trackState;
  }

  get trackLessons() {
    return getLessonDefinitions(this.activeTrack);
  }

  get trackMissions() {
    return this.app.missions.filter((mission) => mission.track === this.activeTrack);
  }

  get placementState() {
    return this.app.state.placement.byTrack[this.activeTrack];
  }

  persist() {
    saveState(this.app.state);
  }

  _createTtsButton(text) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tts-btn';
    btn.textContent = '🔊';
    btn.setAttribute('aria-label', 'Læs op');
    btn.addEventListener('click', () => {
      if (!window.speechSynthesis || this.app.state.settings?.ttsEnabled === false) {
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'da-DK';
      utterance.rate = 0.9;
      utterance.onstart = () => btn.classList.add('speaking');
      utterance.onend = () => btn.classList.remove('speaking');
      utterance.onerror = () => btn.classList.remove('speaking');
      window.speechSynthesis.speak(utterance);
    });
    return btn;
  }

  setMode(mode) {
    this.mode = mode;
    this.learningPath.lastVisitedMode = mode;
    this.persist();
  }

  selectTrack(track) {
    this.learningPath.activeTrack = track;
    this.learningPath.hasChosenTrack = true;
    this.activeMissionId = null;
    this.currentTaskIndex = 0;
    this.placementResults = [];
    this.persist();
    this.render(this.rootRef);
  }

  chooseTrackAndStartPlacement(track) {
    this.learningPath.activeTrack = track;
    this.learningPath.hasChosenTrack = true;
    this.trackState.hasSeenIntro = true;
    this.trackState.entryChoice = 'placement';
    this.persist();
    this.startPlacementFlow();
  }

  startPlacementFlow() {
    this.activeMissionId = null;
    this.currentTaskIndex = 0;
    this.placementResults = [];
    this.setMode('placement');
    this.render(this.rootRef);
  }

  syncLessonRuntime(lessonId, stepIndex) {
    if (this.lessonRuntime.lessonId !== lessonId || this.lessonRuntime.stepIndex !== stepIndex) {
      this.lessonRuntime = {
        lessonId,
        stepIndex,
        attempts: 0,
        solved: false,
        currentTime: null,
        selectedChoice: '',
        feedbackType: '',
        feedbackMessage: '',
        showWorkedExample: false
      };
    }
  }

  render(container) {
    this.rootRef = container;
    this.destroy();
    container.innerHTML = '';

    const shell = document.createElement('div');
    shell.className = 'learn-shell';

    if (this.activeMissionId) {
      shell.append(this.createModeSwitcher(), this.createTrackSwitcher());
      this.renderSession(shell);
    } else if (!this.learningPath.hasChosenTrack) {
      if (this.mode === 'placement') {
        this.renderTrackPlacementChooser(shell);
      } else {
        this.renderTrackChooser(shell);
      }
    } else if (!this.trackState.hasSeenIntro) {
      shell.append(this.createTrackSwitcher());
      this.renderTrackIntro(shell);
    } else {
      shell.append(this.createModeSwitcher(), this.createTrackSwitcher());

      if (this.mode === 'placement') {
        this.renderPlacement(shell);
      } else if (this.mode === 'missions') {
        this.renderMissionList(shell);
      } else {
        this.renderGuide(shell);
      }
    }

    container.append(shell);
    if (!this.mascot.el.parentNode) {
      container.append(this.mascot.el);
    }
  }

  createModeSwitcher() {
    const wrap = document.createElement('div');
    wrap.className = 'learn-mode-switcher';

    const guideBtn = document.createElement('button');
    guideBtn.type = 'button';
    guideBtn.className = this.mode === 'guide' ? 'mode-pill active' : 'mode-pill secondary';
    guideBtn.textContent = 'Lær trin for trin';
    guideBtn.addEventListener('click', () => {
      this.activeMissionId = null;
      this.setMode('guide');
      this.render(this.rootRef);
    });

    const missionBtn = document.createElement('button');
    missionBtn.type = 'button';
    missionBtn.className = this.mode === 'missions' ? 'mode-pill active' : 'mode-pill secondary';
    missionBtn.textContent = 'Missioner';
    missionBtn.addEventListener('click', () => {
      this.activeMissionId = null;
      this.setMode('missions');
      this.render(this.rootRef);
    });

    const placementBtn = document.createElement('button');
    placementBtn.type = 'button';
    placementBtn.className = this.mode === 'placement' ? 'mode-pill active' : 'mode-pill secondary';
    placementBtn.textContent = 'Test mit niveau';
    placementBtn.addEventListener('click', () => {
      this.startPlacementFlow();
    });

    wrap.append(guideBtn, missionBtn, placementBtn);
    return wrap;
  }

  createTrackSwitcher() {
    const wrap = document.createElement('div');
    wrap.className = 'learn-track-switcher';

    TRACK_ORDER.forEach((track) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = this.activeTrack === track ? 'mode-pill active' : 'mode-pill secondary';
      btn.textContent = STRINGS.track[track];
      btn.addEventListener('click', () => {
        this.learningPath.activeTrack = track;
        this.activeMissionId = null;
        this.currentTaskIndex = 0;
        this.persist();
        this.render(this.rootRef);
      });
      wrap.append(btn);
    });

    return wrap;
  }

  renderTrackChooser(container) {
    const hero = document.createElement('section');
    hero.className = 'lesson-hero';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = 'Version 2 · Vælg spor';

    const title = document.createElement('h2');
    title.textContent = STRINGS.common.chooseTrack;

    const text = document.createElement('p');
    text.textContent = STRINGS.placement.intro;

    const actions = document.createElement('div');
    actions.className = 'lesson-hero-actions';

    const analogBtn = document.createElement('button');
    analogBtn.type = 'button';
    analogBtn.textContent = STRINGS.track.analog;
    analogBtn.addEventListener('click', () => this.selectTrack('analog'));

    const digitalBtn = document.createElement('button');
    digitalBtn.type = 'button';
    digitalBtn.textContent = STRINGS.track.digital;
    digitalBtn.addEventListener('click', () => this.selectTrack('digital'));

    const placementBtn = document.createElement('button');
    placementBtn.type = 'button';
    placementBtn.className = 'secondary';
    placementBtn.textContent = 'Test mit niveau';
    placementBtn.addEventListener('click', () => {
      this.mode = 'placement';
      this.render(this.rootRef);
    });

    actions.append(analogBtn, digitalBtn, placementBtn);
    hero.append(eyebrow, title, text, actions);
    container.append(hero);
  }

  renderTrackPlacementChooser(container) {
    const hero = document.createElement('section');
    hero.className = 'lesson-hero';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = 'Niveau-test';

    const title = document.createElement('h2');
    title.textContent = 'Hvilket spor vil du teste?';

    const text = document.createElement('p');
    text.textContent = 'Vælg først om testen skal placere dig i det analoge eller digitale spor.';

    const actions = document.createElement('div');
    actions.className = 'lesson-hero-actions';

    const analogBtn = document.createElement('button');
    analogBtn.type = 'button';
    analogBtn.textContent = 'Test analogt ur';
    analogBtn.addEventListener('click', () => this.chooseTrackAndStartPlacement('analog'));

    const digitalBtn = document.createElement('button');
    digitalBtn.type = 'button';
    digitalBtn.textContent = 'Test digitalt ur';
    digitalBtn.addEventListener('click', () => this.chooseTrackAndStartPlacement('digital'));

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'secondary';
    backBtn.textContent = 'Tilbage';
    backBtn.addEventListener('click', () => {
      this.mode = 'guide';
      this.render(this.rootRef);
    });

    actions.append(analogBtn, digitalBtn, backBtn);
    hero.append(eyebrow, title, text, actions);
    container.append(hero);
  }

  renderTrackIntro(container) {
    const meta = getTrackMeta(this.activeTrack);
    const hero = document.createElement('section');
    hero.className = 'lesson-hero';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = meta.title;

    const title = document.createElement('h2');
    title.textContent = meta.introTitle;

    const text = document.createElement('p');
    text.textContent = meta.introText;

    const actions = document.createElement('div');
    actions.className = 'lesson-hero-actions';

    const learnBtn = document.createElement('button');
    learnBtn.type = 'button';
    learnBtn.textContent = 'Lær fra nul';
    learnBtn.addEventListener('click', () => {
      this.trackState.entryChoice = 'beginner';
      this.trackState.hasSeenIntro = true;
      this.trackState.currentLessonId = this.trackLessons[0].id;
      this.trackState.currentStepIndex = 0;
      this.mode = 'guide';
      this.persist();
      this.render(this.rootRef);
    });

    const placementBtn = document.createElement('button');
    placementBtn.type = 'button';
    placementBtn.className = 'secondary';
    placementBtn.textContent = meta.placementLabel;
    placementBtn.addEventListener('click', () => {
      this.trackState.entryChoice = 'placement';
      this.trackState.hasSeenIntro = true;
      this.persist();
      this.startPlacementFlow();
    });

    actions.append(learnBtn, placementBtn);

    const note = document.createElement('p');
    note.className = 'muted';
    note.textContent = 'Du kan altid skifte spor eller vende tilbage til emner, du sprang over.';

    hero.append(eyebrow, title, text, actions, note);
    container.append(hero);
  }

  renderGuide(container) {
    const trackState = this.trackState;
    const lesson = getLessonById(trackState.currentLessonId, this.activeTrack);
    const lessonIndex = Math.max(0, getLessonIndex(this.activeTrack, lesson.id));
    const stepIndex = trackState.currentStepIndex;

    const hero = document.createElement('section');
    hero.className = 'lesson-hero compact';

    const title = document.createElement('h2');
    title.textContent = `${STRINGS.track[this.activeTrack]} · Læringssti`;

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Her får du forklaringen først, så prøver du med støtte, og til sidst får du et checkpoint.';

    hero.append(title, subtitle);
    container.append(hero);

    const rail = document.createElement('div');
    rail.className = 'lesson-rail';
    this.trackLessons.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      const unlocked = isLessonUnlocked(trackState, entry.id, this.activeTrack);
      const completed = trackState.completedLessons.includes(entry.id);
      const skipped = trackState.skippedLessons.includes(entry.id) && !completed;
      button.className = `lesson-chip ${entry.id === lesson.id ? 'active' : ''} ${completed ? 'completed' : ''} ${skipped ? 'skipped' : ''}`;
      button.disabled = !unlocked;
      button.textContent = `${index + 1}. ${entry.title}`;
      button.addEventListener('click', () => {
        trackState.currentLessonId = entry.id;
        trackState.currentStepIndex = entry.id === lesson.id ? trackState.currentStepIndex : 0;
        this.learningPath.lastVisitedMode = 'guide';
        this.persist();
        this.render(this.rootRef);
      });
      rail.append(button);
    });
    container.append(rail);

    if (stepIndex >= lesson.steps.length) {
      this.renderLessonComplete(container, lesson, lessonIndex);
      return;
    }

    const step = lesson.steps[stepIndex];
    this.syncLessonRuntime(lesson.id, stepIndex);
    this.renderLessonStep(container, lesson, lessonIndex, step, stepIndex);
  }

  mountLessonInteraction(card, step, runtime) {
    const interaction = step.interaction || {type: 'none'};
    const controller = {
      cleanup: null,
      getAnswer: () => ({}),
      hasSelection: false
    };

    const initialTime = runtime.showWorkedExample
      ? (interaction.targetTime ?? step.previewTime)
      : (typeof runtime.currentTime === 'number' ? runtime.currentTime : step.previewTime);

    let readout = null;
    const shouldShowStaticReadout = !step.clock && step.readouts && (
      interaction.type === 'none'
      || runtime.showWorkedExample
      || runtime.solved
      || (interaction.type === 'digital_input' && typeof runtime.currentTime === 'number')
    );

    if (shouldShowStaticReadout) {
      readout = createTimeReadout(step.readouts);
      if (typeof initialTime === 'number') {
        readout.update(initialTime);
      }
      card.append(readout.el);
    }

    if (step.clock) {
      const clockWrap = document.createElement('div');
      clockWrap.className = 'clock-wrap';
      card.append(clockWrap);

      const teachingState = runtime.showWorkedExample
        ? mergeTeachingState(step.clock.teachingState, {
            targetTime: interaction.targetTime,
            highlightedNumbers: uniqueArray([
              ...(step.clock.teachingState?.highlightedNumbers || []),
              ...(((interaction.hintTeachingState || {}).highlightedNumbers) || [])
            ])
          })
        : runtime.attempts >= 2
          ? mergeTeachingState(step.clock.teachingState, interaction.hintTeachingState)
          : (step.clock.teachingState || {});

      const clock = new ClockCanvas(clockWrap, {
        initialTime: typeof initialTime === 'number' ? initialTime : step.clock.initialTime,
        interactive: step.clock.interactive && !runtime.showWorkedExample,
        showHelpers: step.clock.showHelpers !== false,
        teachingState,
        onChange: ({totalMinutes}) => {
          this.lessonRuntime.currentTime = totalMinutes;
          if (readout) {
            readout.update(totalMinutes);
          }
        }
      });

      this.lessonRuntime.currentTime = clock.getCanonicalTime();
      if (!readout) {
        readout = createTimeReadout(step.readouts);
        readout.update(clock.getCanonicalTime());
        card.append(readout.el);
      }

      controller.cleanup = () => clock.destroy();
      controller.getAnswer = () => ({time: clock.getCanonicalTime()});
      controller.hasSelection = true;
      return controller;
    }

    if (interaction.type === 'digital_input') {
      const input = createDigitalTimeInput({
        initialTime: runtime.showWorkedExample
          ? interaction.targetTime ?? null
          : (typeof runtime.currentTime === 'number' ? runtime.currentTime : null),
        onChange: ({totalMinutes}) => {
          this.lessonRuntime.currentTime = totalMinutes;
          if (!readout && step.readouts && typeof totalMinutes === 'number') {
            readout = createTimeReadout(step.readouts);
            card.append(readout.el);
          }
          if (readout && typeof totalMinutes === 'number') {
            readout.update(totalMinutes);
          }
        }
      });
      card.append(input.el);
      controller.cleanup = () => input.destroy();
      controller.getAnswer = () => ({time: input.getTime()});
      controller.hasSelection = typeof input.getTime() === 'number';
      return controller;
    }

    if (interaction.type === 'choice') {
      const optionsWrap = document.createElement('div');
      optionsWrap.className = 'options';
      let selected = interaction.options.find((option) => option.label === runtime.selectedChoice) || null;

      interaction.options.forEach((option) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `option-btn ${selected?.label === option.label ? 'secondary' : ''}`;
        btn.textContent = option.label;
        btn.addEventListener('click', () => {
          selected = option;
          this.lessonRuntime.selectedChoice = option.label;
          [...optionsWrap.children].forEach((child) => child.classList.remove('secondary'));
          btn.classList.add('secondary');
        });
        optionsWrap.append(btn);
      });
      card.append(optionsWrap);
      controller.getAnswer = () => ({selected});
      controller.hasSelection = !!selected;
      return controller;
    }

    return controller;
  }

  renderLessonStep(container, lesson, lessonIndex, step, stepIndex) {
    const runtime = this.lessonRuntime;
    const card = document.createElement('section');
    card.className = 'lesson-player';

    const meta = document.createElement('div');
    meta.className = 'lesson-meta';
    const heading = document.createElement('div');
    heading.innerHTML = `<p class="eyebrow">Lektion ${lessonIndex + 1} af ${this.trackLessons.length} · ${step.label}</p><h2>${lesson.title}</h2>`;

    const missionLink = document.createElement('button');
    missionLink.type = 'button';
    missionLink.className = 'secondary lesson-mission-btn';
    missionLink.textContent = 'Spil en mission om dette';
    missionLink.addEventListener('click', () => {
      this.setMode('missions');
      this.startMission(lesson.missionId);
    });

    meta.append(heading, missionLink);
    card.append(meta);
    card.append(createProgressBar(stepIndex, lesson.steps.length));

    const subtitle = document.createElement('p');
    subtitle.className = 'lesson-step-title';
    subtitle.textContent = step.title;
    card.append(subtitle);

    const simpleRow = document.createElement('div');
    simpleRow.className = 'lesson-text-row';
    const simple = document.createElement('p');
    simple.className = 'lesson-simple';
    simple.textContent = step.simpleCopy;
    simpleRow.append(simple, this._createTtsButton(step.simpleCopy));
    card.append(simpleRow);

    const advanced = document.createElement('details');
    advanced.className = 'lesson-advanced';
    const summary = document.createElement('summary');
    summary.textContent = 'Vil du vide hvorfor?';
    const advancedText = document.createElement('p');
    advancedText.textContent = step.advancedCopy;
    advanced.append(summary, advancedText);
    card.append(advanced);

    if (step.interaction.type !== 'none') {
      const prompt = document.createElement('div');
      prompt.className = 'lesson-check-card';
      prompt.innerHTML = `<strong>${step.interaction.prompt}</strong>`;
      card.append(prompt);
    }

    const interactionController = this.mountLessonInteraction(card, step, runtime);
    this.cleanup = interactionController.cleanup;

    if (runtime.feedbackMessage) {
      const feedback = document.createElement('div');
      feedback.className = `feedback ${runtime.feedbackType === 'correct' ? 'correct' : 'incorrect'}`;
      const text = document.createElement('p');
      text.textContent = runtime.feedbackMessage;
      feedback.append(text);
      card.append(feedback);
    }

    if (runtime.showWorkedExample) {
      const worked = document.createElement('div');
      worked.className = 'lesson-worked-example';
      const exampleText = document.createElement('p');
      if (step.interaction.targetTime != null) {
        exampleText.textContent = `${step.workedExample} Eksempelvisning: ${toDigital12(step.interaction.targetTime, true)} · ${toDigital24(step.interaction.targetTime, true)} · ${toDanishPhrase(step.interaction.targetTime)}.`;
      } else {
        exampleText.textContent = step.workedExample;
      }
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'secondary';
      retry.textContent = 'Prøv igen';
      retry.addEventListener('click', () => {
        this.lessonRuntime = {
          ...this.lessonRuntime,
          attempts: 0,
          feedbackType: '',
          feedbackMessage: '',
          currentTime: step.previewTime,
          selectedChoice: '',
          solved: false,
          showWorkedExample: false
        };
        this.render(this.rootRef);
      });
      worked.append(exampleText, retry);
      card.append(worked);
    }

    const controls = document.createElement('div');
    controls.className = 'toolbar lesson-controls';

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'secondary';
    back.textContent = stepIndex > 0 ? 'Forrige trin' : 'Til oversigt';
    back.addEventListener('click', () => {
      if (stepIndex > 0) {
        this.trackState.currentStepIndex -= 1;
      }
      this.persist();
      this.render(this.rootRef);
    });
    controls.append(back);

    if (step.interaction.type === 'none') {
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = 'Næste trin';
      next.addEventListener('click', () => {
        this.trackState.currentStepIndex += 1;
        this.persist();
        this.render(this.rootRef);
      });
      controls.append(next);
    } else if (!runtime.showWorkedExample && !runtime.solved) {
      const check = document.createElement('button');
      check.type = 'button';
      check.textContent = step.interaction.checkLabel || 'Tjek trin';
      check.addEventListener('click', () => {
        const result = evaluateLessonStep(step, interactionController.getAnswer());
        if (result.correct) {
          triggerJuice(true);
          this.mascot.setEmotion('happy');
          this.lessonRuntime = {
            ...this.lessonRuntime,
            solved: true,
            feedbackType: 'correct',
            feedbackMessage: step.successMessage
          };
        } else {
          triggerJuice(false);
          this.mascot.setEmotion('sad');
          const attempts = this.lessonRuntime.attempts + 1;
          const hintIndex = Math.min(attempts - 1, step.hints.length - 1);
          this.lessonRuntime = {
            ...this.lessonRuntime,
            attempts,
            feedbackType: 'incorrect',
            feedbackMessage: attempts >= 3
              ? 'Lad os se et eksempel først, og så prøver du igen.'
              : step.hints[hintIndex] || 'Prøv en gang til.'
          };
          if (attempts >= 3) {
            this.lessonRuntime.showWorkedExample = true;
          }
        }
        this.render(this.rootRef);
      });
      controls.append(check);

      const skipStep = document.createElement('button');
      skipStep.type = 'button';
      skipStep.className = 'secondary';
      skipStep.textContent = STRINGS.common.skipStep;
      skipStep.addEventListener('click', () => this.skipLessonStep(lesson, step));
      controls.append(skipStep);
    } else if (runtime.solved) {
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = step.kind === 'checkpoint' ? 'Afslut lektion' : 'Næste trin';
      next.addEventListener('click', () => {
        this.handleLessonAdvance(lesson, step);
      });
      controls.append(next);
    }

    const skipLesson = document.createElement('button');
    skipLesson.type = 'button';
    skipLesson.className = 'secondary';
    skipLesson.textContent = STRINGS.common.skipLesson;
    skipLesson.addEventListener('click', () => this.skipLesson(lesson));
    controls.append(skipLesson);

    card.append(controls);
    container.append(card);
  }

  handleLessonAdvance(lesson, step) {
    if (step.kind === 'checkpoint') {
      this.trackState.completedCheckpoints[lesson.id] = true;
      const missionEntry = missionState(this.app.state, lesson.missionId, this.app.state.missionCatalog);
      if (missionEntry.status === 'locked') {
        missionEntry.status = 'unlocked';
      }
    }

    const nextStepIndex = this.trackState.currentStepIndex + 1;
    if (nextStepIndex >= lesson.steps.length) {
      this.trackState.completedLessons = uniqueArray([...this.trackState.completedLessons, lesson.id]);
      this.trackState.skippedLessons = this.trackState.skippedLessons.filter((id) => id !== lesson.id);
      this.trackState.currentStepIndex = lesson.steps.length;
      this.learningPath.lastVisitedMode = 'guide';
    } else {
      this.trackState.currentStepIndex = nextStepIndex;
    }

    this.persist();
    this.render(this.rootRef);
  }

  skipLessonStep(lesson, step) {
    this.trackState.skippedSteps = uniqueArray([...this.trackState.skippedSteps, step.id]);
    const nextStepIndex = this.trackState.currentStepIndex + 1;

    if (nextStepIndex >= lesson.steps.length) {
      this.trackState.skippedLessons = uniqueArray([...this.trackState.skippedLessons, lesson.id]);
      this.trackState.currentStepIndex = lesson.steps.length;
    } else {
      this.trackState.currentStepIndex = nextStepIndex;
    }

    this.persist();
    this.render(this.rootRef);
  }

  skipLesson(lesson) {
    this.trackState.skippedLessons = uniqueArray([...this.trackState.skippedLessons, lesson.id]);
    this.trackState.completedLessons = this.trackState.completedLessons.filter((id) => id !== lesson.id);
    this.trackState.currentStepIndex = lesson.steps.length;
    this.persist();
    this.render(this.rootRef);
  }

  renderLessonComplete(container, lesson, lessonIndex) {
    const skipped = this.trackState.skippedLessons.includes(lesson.id) && !this.trackState.completedLessons.includes(lesson.id);
    const card = createPromptCard(
      skipped ? `Lektion ${lessonIndex + 1} sprunget over` : `Lektion ${lessonIndex + 1} færdig`,
      skipped
        ? `${lesson.subtitle} Emnet er ikke mestret endnu, men næste lektion er stadig åben.`
        : `${lesson.subtitle} Du kan gå videre til næste lektion eller spille en mission om det samme stof.`
    );
    card.classList.add('lesson-complete-card');

    const stats = document.createElement('p');
    stats.className = 'muted';
    stats.textContent = skipped
      ? 'Dette emne er markeret som sprunget over. Tag det senere igen for at lukke hullet.'
      : `Du har klaret checkpointet for ${lesson.title.toLowerCase()}.`;
    card.append(stats);

    if (!skipped) {
      const missionBtn = document.createElement('button');
      missionBtn.type = 'button';
      missionBtn.textContent = 'Spil en mission om dette';
      missionBtn.addEventListener('click', () => {
        this.setMode('missions');
        this.startMission(lesson.missionId);
      });
      card.append(missionBtn);
    }

    const nextLessonId = getNextLessonId(this.activeTrack, lesson.id);
    if (nextLessonId) {
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'secondary';
      nextBtn.textContent = 'Næste lektion';
      nextBtn.addEventListener('click', () => {
        this.trackState.currentLessonId = nextLessonId;
        this.trackState.currentStepIndex = 0;
        this.learningPath.lastVisitedMode = 'guide';
        this.persist();
        this.render(this.rootRef);
      });
      card.append(nextBtn);
    } else {
      const done = document.createElement('p');
      done.className = 'muted';
      done.textContent = skipped
        ? 'Du nåede enden af sporet, men der er stadig emner at vende tilbage til.'
        : 'Du har gennemført hele læringsstien i dette spor.';
      card.append(done);
    }

    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'secondary';
    replay.textContent = skipped ? STRINGS.common.comeBackLater : 'Tag lektionen igen';
    replay.addEventListener('click', () => {
      this.trackState.currentLessonId = lesson.id;
      this.trackState.currentStepIndex = 0;
      this.trackState.skippedLessons = this.trackState.skippedLessons.filter((id) => id !== lesson.id);
      this.persist();
      this.render(this.rootRef);
    });
    card.append(replay);

    container.append(card);
  }

  renderPlacement(container) {
    const sequence = this.activeTrack === 'digital' ? DIGITAL_PLACEMENT_SEQUENCE : ANALOG_PLACEMENT_SEQUENCE;
    if (this.currentTaskIndex >= sequence.length) {
      const suggestion = computePlacementSuggestion(this.activeTrack, this.placementResults);
      this.app.state.placement.byTrack[this.activeTrack] = {
        completed: true,
        missionSuggestion: suggestion.missionId,
        lessonSuggestion: suggestion.lessonId
      };
      this.trackState.currentLessonId = suggestion.lessonId;
      this.trackState.currentStepIndex = 0;
      unlockThroughMission(this.app.state, suggestion.missionId, this.activeTrack, this.app.missions);
      this.persist();

      const card = createPromptCard(
        STRINGS.common.placementDone,
        `Anbefalet start er ${suggestion.lessonId.toUpperCase()} og mission ${suggestion.missionId.toUpperCase()}. Du kan stadig vælge andre åbne dele bagefter.`
      );
      const goMissions = document.createElement('button');
      goMissions.type = 'button';
      goMissions.textContent = 'Se missioner';
      goMissions.addEventListener('click', () => {
        this.setMode('missions');
        this.currentTaskIndex = 0;
        this.render(this.rootRef);
      });
      const goGuide = document.createElement('button');
      goGuide.type = 'button';
      goGuide.className = 'secondary';
      goGuide.textContent = 'Til læringsstien';
      goGuide.addEventListener('click', () => {
        this.setMode('guide');
        this.currentTaskIndex = 0;
        this.render(this.rootRef);
      });
      card.append(goMissions, goGuide);
      container.append(card);
      return;
    }

    const sequenceEntry = sequence[this.currentTaskIndex];
    const task = generateTask(this.app.state.session, sequenceEntry.missionId, {
      forceType: sequenceEntry.forceType
    });
    this.currentTask = task;

    const intro = document.createElement('section');
    intro.className = 'lesson-hero compact';
    const title = document.createElement('h2');
    title.textContent = `Niveau-test · ${STRINGS.track[this.activeTrack]}`;
    const text = document.createElement('p');
    text.textContent = 'Testen finder et godt sted at starte i dette spor. Den springer ikke læringsstien over, men hjælper dig ind det rigtige sted.';
    intro.append(title, text);
    container.append(intro);

    container.append(createProgressBar(this.currentTaskIndex, sequence.length));

    const wrapper = document.createElement('div');
    const taskResult = mountTask({
      mount: wrapper,
      task,
      state: this.app.state,
      onSubmit: (answer) => this.handlePlacementSubmit(answer, task)
    });

    this.cleanup = taskResult?.cleanup;
    this.feedback = document.createElement('div');
    container.append(wrapper, this.feedback);
  }

  handlePlacementSubmit(answer, task) {
    const result = evaluateAnswer(task, answer);
    if (!result.skipped) {
      triggerJuice(result.correct);
      this.mascot.setEmotion(result.correct ? 'happy' : 'sad');
    }

    const advancePlacement = () => {
      this.placementResults.push(result);
      this.currentTaskIndex += 1;
      this.render(this.rootRef);
    };

    this.feedback.innerHTML = '';
    this.feedback.className = result.correct ? 'feedback correct' : 'feedback incorrect';

    const message = document.createElement('p');
    message.textContent = result.feedback?.message || (result.correct ? 'Godt gået' : 'Prøv igen.');
    const hint = document.createElement('p');
    hint.className = 'muted';
    hint.textContent = result.feedback?.misconceptionHint || '';

    if (result.correct) {
      this.feedback.append(message, hint);
      setTimeout(advancePlacement, 900);
    } else {
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = STRINGS.common.next;
      next.addEventListener('click', advancePlacement);
      this.feedback.append(message, hint, next);
    }
  }

  renderMissionList(container) {
    const heading = document.createElement('div');
    heading.className = 'screen-title';
    const h2 = document.createElement('h2');
    h2.textContent = `Missioner · ${STRINGS.track[this.activeTrack]}`;

    const clearBtn = document.createElement('button');
    clearBtn.className = 'secondary';
    clearBtn.textContent = STRINGS.common.clear;
    clearBtn.addEventListener('click', () => {
      this.app.state = resetState();
      ensureLearningPath(this.app.state);
      this.mode = 'guide';
      saveState(this.app.state);
      this.render(this.rootRef);
    });

    heading.append(h2, clearBtn);
    container.append(heading);

    const intro = document.createElement('p');
    intro.className = 'muted';
    intro.textContent = 'Missionerne er quiz- og øvetilstanden. Brug dem efter forklaringerne, eller tag niveau-testen hvis du vil hoppe ind et sted midt på stien.';
    container.append(intro);

    if (this.placementState?.missionSuggestion) {
      const suggestion = document.createElement('p');
      suggestion.className = 'muted';
      suggestion.textContent = `Anbefalet startmission: ${this.placementState.missionSuggestion.toUpperCase()} · Lektion ${this.placementState.lessonSuggestion.toUpperCase()}`;
      container.append(suggestion);
    }

    const grid = document.createElement('div');
    grid.className = 'cards';

    this.trackMissions.forEach((mission) => {
      const entry = missionState(this.app.state, mission.id, this.app.state.missionCatalog);
      const relatedLessons = this.trackLessons
        .filter((lesson) => lesson.missionId === mission.id)
        .map((lesson) => lesson.title)
        .join(' · ');

      const card = createPromptCard(`Mission ${mission.level}: ${mission.title}`, mission.objective);
      card.className = `card ${entry.status === 'locked' ? 'locked' : ''}`;

      const meta = document.createElement('p');
      meta.textContent = `${entry.status === 'completed' ? STRINGS.missionStatus.completed : entry.status === 'locked' ? STRINGS.missionStatus.locked : STRINGS.missionStatus.unlocked} · Mesterskab: ${entry.masteryScore || 0}% · Sprunget over: ${entry.skippedCount || 0}`;
      card.append(meta);

      if (relatedLessons) {
        const lessonTag = document.createElement('p');
        lessonTag.className = 'muted';
        lessonTag.textContent = `Hører sammen med: ${relatedLessons}`;
        card.append(lessonTag);
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'select-button';
      button.disabled = entry.status === 'locked';
      button.textContent = entry.status === 'in_progress' ? STRINGS.common.continue : STRINGS.common.start;
      button.addEventListener('click', () => this.startMission(mission.id));
      card.append(button);

      if (entry.skippedCount > 0) {
        const retake = document.createElement('button');
        retake.type = 'button';
        retake.className = 'secondary';
        retake.textContent = STRINGS.common.comeBackLater;
        retake.addEventListener('click', () => this.startMission(mission.id));
        card.append(retake);
      }

      grid.append(card);
    });

    container.append(grid);
  }

  startMission(missionId) {
    const missionEntry = missionState(this.app.state, missionId, this.app.state.missionCatalog);
    if (missionEntry.status === 'locked') {
      missionEntry.status = 'unlocked';
    }
    this.activeMissionId = missionId;
    this.currentTaskIndex = 0;
    this.setMode('missions');
    this.render(this.rootRef);
  }

  renderSession(container) {
    const mission = this.app.missions.find((entry) => entry.id === this.activeMissionId);
    const entry = missionState(this.app.state, mission.id, this.app.state.missionCatalog);
    const title = document.createElement('h2');
    title.textContent = `Mission ${mission.level}: ${mission.title}`;

    container.append(title, createProgressBar(this.currentTaskIndex, mission.totalTasks || 8));

    const toolbar = document.createElement('div');
    toolbar.className = 'toolbar';
    const stop = document.createElement('button');
    stop.type = 'button';
    stop.className = 'secondary';
    stop.textContent = 'Tilbage til missioner';
    stop.addEventListener('click', () => {
      this.activeMissionId = null;
      this.currentTaskIndex = 0;
      this.render(this.rootRef);
    });
    toolbar.append(stop);
    container.append(toolbar);

    if (this.currentTaskIndex >= (mission.totalTasks || 8)) {
      const doneText = entry.status === 'completed'
        ? `Missionen er gennemført med ${entry.masteryScore}% mesterskab, og næste mission er låst op hvis den findes.`
        : entry.skippedCount > 0
          ? `Missionen er spillet igennem med ${entry.masteryScore}% mesterskab. ${entry.skippedCount} opgaver blev sprunget over, så tag missionen igen senere.`
          : `Missionen er spillet igennem med ${entry.masteryScore}% mesterskab. Du skal nå ${mission.requiredMastery || 70}% for at låse næste mission op.`;
      const doneCard = createPromptCard('Mission afsluttet', doneText);
      const again = document.createElement('button');
      again.type = 'button';
      again.className = 'secondary';
      again.textContent = STRINGS.common.backToMissions;
      again.addEventListener('click', () => {
        this.activeMissionId = null;
        this.currentTaskIndex = 0;
        this.render(this.rootRef);
      });
      doneCard.append(again);
      container.append(doneCard);
      return;
    }

    const task = generateTask(this.app.state.session, mission.id);
    this.currentTask = task;
    const wrapper = document.createElement('div');
    const taskResult = mountTask({
      mount: wrapper,
      task,
      state: this.app.state,
      onSubmit: (answer) => this.handleSubmit(answer, task)
    });
    this.cleanup = taskResult?.cleanup;
    this.feedback = document.createElement('div');
    container.append(wrapper, this.feedback);
  }

  handleSubmit(answer, task) {
    const result = evaluateAnswer(task, answer);
    if (!result.skipped) {
      triggerJuice(result.correct);
      this.mascot.setEmotion(result.correct ? 'happy' : 'sad');
    }

    const advanceSession = () => {
      this.currentTaskIndex += 1;
      recordAttempt(task.id, task.missionId, result, result.misconceptionTags || [], this.app.state, task);
      if (!result.skipped) {
        evaluateStreak(this.app.state, result.correct);
      }
      if (result.correct) {
        this.app.state.rewards.stars += 1;
      }
      this.persist();
      this.render(this.rootRef);
    };

    this.feedback.innerHTML = '';
    this.feedback.className = result.correct ? 'feedback correct' : 'feedback incorrect';
    const message = document.createElement('p');
    message.textContent = result.feedback?.message || (result.correct ? 'Godt gået' : 'Prøv igen.');
    const hint = document.createElement('p');
    hint.className = 'muted';
    hint.textContent = result.feedback?.misconceptionHint || '';

    if (result.correct) {
      this.feedback.append(message, hint);
      setTimeout(advanceSession, 900);
    } else {
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = STRINGS.common.next;
      next.addEventListener('click', advanceSession);
      this.feedback.append(message, hint, next);
    }
  }
}

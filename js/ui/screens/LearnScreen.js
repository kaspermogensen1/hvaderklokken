import {STRINGS} from '../../copy.js';
import {generateTask, evaluateAnswer} from '../../engine/taskGenerator.js';
import {
  createDefaultLearningPathState,
  evaluateLessonStep,
  getLessonById,
  getLessonDefinitions,
  getLessonIndex,
  getNextLessonId,
  isLessonUnlocked
} from '../../engine/lessonEngine.js';
import {toDigital12, toDigital24, toDanishPhrase} from '../../engine/timeModel.js';
import {mountTask} from '../components/taskRenderer.js';
import {recordAttempt, evaluateStreak, missionState} from '../../engine/progression.js';
import {saveState, resetState} from '../../engine/storage.js';
import {createPromptCard} from '../components/PromptCard.js';
import {createProgressBar} from '../components/ProgressBar.js';
import {createMascot} from '../components/Mascot.js';
import {createTimeReadout} from '../components/TimeReadout.js';
import {ClockCanvas} from '../components/ClockCanvas.js';
import {triggerJuice} from '../juice.js';

const PLACEMENT_SEQUENCE = ['m1', 'm1', 'm2', 'm2', 'm3', 'm3', 'm4', 'm4'];
const LESSONS = getLessonDefinitions();

function ensureLearningPath(state) {
  if (!state.learningPath) {
    state.learningPath = createDefaultLearningPathState();
  }
  return state.learningPath;
}

function computePlacementSuggestion(results) {
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
    return 'm1';
  }
  if ((misconceptionCounts.halv_to_misread || 0) >= 2) {
    return 'm2';
  }
  if ((misconceptionCounts.quarter_past_to_confusion || 0) >= 2) {
    return 'm3';
  }
  if ((misconceptionCounts.num8means40 || 0) >= 2) {
    return 'm4';
  }

  const accuracy = results.length ? correct / results.length : 0;
  if (accuracy >= 0.85) {
    return 'm4';
  }
  if (accuracy >= 0.7) {
    return 'm3';
  }
  if (accuracy >= 0.55) {
    return 'm2';
  }
  return 'm1';
}

function unlockThroughMission(state, suggestionId, missions) {
  let unlock = true;
  missions.forEach((mission) => {
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

function uniqueArray(items) {
  return [...new Set(items)];
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
      if (!window.speechSynthesis) return;
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

  syncLessonRuntime(lessonId, stepIndex) {
    if (this.lessonRuntime.lessonId !== lessonId || this.lessonRuntime.stepIndex !== stepIndex) {
      this.lessonRuntime = {
        lessonId,
        stepIndex,
        attempts: 0,
        solved: false,
        currentTime: null,
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
      shell.append(this.createModeSwitcher());
      this.renderSession(shell);
    } else if (!this.learningPath.hasSeenBeginnerIntro) {
      this.renderBeginnerIntro(shell);
    } else {
      shell.append(this.createModeSwitcher());

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

  renderBeginnerIntro(container) {
    const hero = document.createElement('section');
    hero.className = 'lesson-hero';

    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = 'Version 2 · Ny læringssti';

    const title = document.createElement('h2');
    title.textContent = 'Lær klokken trin for trin';

    const text = document.createElement('p');
    text.textContent = 'Her starter du med helt enkle forklaringer og små trin. Når du vil øve som et spil, kan du bagefter hoppe over i missionerne.';

    const actions = document.createElement('div');
    actions.className = 'lesson-hero-actions';

    const learnBtn = document.createElement('button');
    learnBtn.type = 'button';
    learnBtn.textContent = 'Lær fra nul';
    learnBtn.addEventListener('click', () => {
      this.learningPath.entryChoice = 'beginner';
      this.learningPath.hasSeenBeginnerIntro = true;
      this.learningPath.lastVisitedMode = 'guide';
      this.mode = 'guide';
      this.persist();
      this.render(this.rootRef);
    });

    const placementBtn = document.createElement('button');
    placementBtn.type = 'button';
    placementBtn.className = 'secondary';
    placementBtn.textContent = 'Test mit niveau';
    placementBtn.addEventListener('click', () => {
      this.learningPath.entryChoice = 'placement';
      this.learningPath.hasSeenBeginnerIntro = true;
      this.persist();
      this.startPlacementFlow();
    });

    actions.append(learnBtn, placementBtn);

    const note = document.createElement('p');
    note.className = 'muted';
    note.textContent = 'Du kan altid skifte mellem læring, missioner og niveau-test senere.';

    hero.append(eyebrow, title, text, actions, note);
    container.append(hero);
  }

  startPlacementFlow() {
    this.activeMissionId = null;
    this.currentTaskIndex = 0;
    this.placementResults = [];
    this.setMode('placement');
    this.render(this.rootRef);
  }

  renderGuide(container) {
    const learningPath = this.learningPath;
    const lesson = getLessonById(learningPath.currentLessonId);
    const lessonIndex = Math.max(0, getLessonIndex(lesson.id));
    const stepIndex = learningPath.currentStepIndex;

    const hero = document.createElement('section');
    hero.className = 'lesson-hero compact';

    const title = document.createElement('h2');
    title.textContent = 'Læringssti';

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Her får du forklaringen først, så prøver du med støtte, og til sidst får du et lille checkpoint.';

    hero.append(title, subtitle);
    container.append(hero);

    const rail = document.createElement('div');
    rail.className = 'lesson-rail';
    LESSONS.forEach((entry, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      const unlocked = isLessonUnlocked(learningPath, entry.id);
      const completed = learningPath.completedLessons.includes(entry.id);
      button.className = `lesson-chip ${entry.id === lesson.id ? 'active' : ''} ${completed ? 'completed' : ''}`;
      button.disabled = !unlocked;
      button.textContent = `${index + 1}. ${entry.title}`;
      button.addEventListener('click', () => {
        learningPath.currentLessonId = entry.id;
        learningPath.currentStepIndex = entry.id === lesson.id ? learningPath.currentStepIndex : 0;
        learningPath.lastVisitedMode = 'guide';
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

  renderLessonStep(container, lesson, lessonIndex, step, stepIndex) {
    const runtime = this.lessonRuntime;
    const card = document.createElement('section');
    card.className = 'lesson-player';

    const meta = document.createElement('div');
    meta.className = 'lesson-meta';
    const heading = document.createElement('div');
    heading.innerHTML = `<p class="eyebrow">Lektion ${lessonIndex + 1} af ${LESSONS.length} · ${step.label}</p><h2>${lesson.title}</h2>`;

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

    const progress = createProgressBar(stepIndex, lesson.steps.length);
    card.append(progress);

    const subtitle = document.createElement('p');
    subtitle.className = 'lesson-step-title';
    subtitle.textContent = step.title;
    card.append(subtitle);

    const simpleRow = document.createElement('div');
    simpleRow.className = 'lesson-text-row';
    const simple = document.createElement('p');
    simple.className = 'lesson-simple';
    simple.textContent = step.simpleCopy;
    const speakBtn = this._createTtsButton(step.simpleCopy);
    simpleRow.append(simple, speakBtn);
    card.append(simpleRow);

    const advanced = document.createElement('details');
    advanced.className = 'lesson-advanced';
    const summary = document.createElement('summary');
    summary.textContent = 'Vil du vide hvorfor?';
    const advancedText = document.createElement('p');
    advancedText.textContent = step.advancedCopy;
    advanced.append(summary, advancedText);
    card.append(advanced);

    let clock = null;
    let readout = null;
    let currentTime = runtime.currentTime;

    if (step.clock) {
      const clockWrap = document.createElement('div');
      clockWrap.className = 'clock-wrap';
      card.append(clockWrap);

      const initialTime = runtime.showWorkedExample
        ? step.interaction.targetTime
        : typeof currentTime === 'number'
          ? currentTime
          : step.clock.initialTime;

      const teachingState = runtime.showWorkedExample
        ? mergeTeachingState(step.clock.teachingState, {
            targetTime: step.interaction.targetTime,
            highlightedNumbers: uniqueArray([
              ...(step.clock.teachingState?.highlightedNumbers || []),
              ...(((step.interaction.hintTeachingState || {}).highlightedNumbers) || [])
            ])
          })
        : runtime.attempts >= 2
          ? mergeTeachingState(step.clock.teachingState, step.interaction.hintTeachingState)
          : (step.clock.teachingState || {});

      clock = new ClockCanvas(clockWrap, {
        initialTime,
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

      currentTime = clock.getCanonicalTime();
      this.lessonRuntime.currentTime = currentTime;

      readout = createTimeReadout(step.readouts);
      readout.update(currentTime);
      card.append(readout.el);

      this.cleanup = () => {
        clock.destroy();
      };
    }

    if (step.interaction.type === 'clock') {
      const prompt = document.createElement('div');
      prompt.className = 'lesson-check-card';
      prompt.innerHTML = `<strong>${step.interaction.prompt}</strong>`;
      card.append(prompt);
    }

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
      exampleText.textContent = `${step.workedExample} Eksempelvisning: ${toDigital12(step.interaction.targetTime, true)} · ${toDigital24(step.interaction.targetTime, true)} · ${toDanishPhrase(step.interaction.targetTime)}.`;
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
          currentTime: step.clock.initialTime,
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
        this.learningPath.currentStepIndex -= 1;
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
        this.learningPath.currentStepIndex += 1;
        this.persist();
        this.render(this.rootRef);
      });
      controls.append(next);
    } else if (!runtime.showWorkedExample && !runtime.solved) {
      const check = document.createElement('button');
      check.type = 'button';
      check.textContent = step.interaction.checkLabel || 'Tjek trin';
      check.addEventListener('click', () => {
        const result = evaluateLessonStep(step, {time: clock?.getCanonicalTime()});
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
    } else if (runtime.solved) {
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = step.kind === 'checkpoint' ? 'Afslut lektion' : 'Næste trin';
      next.addEventListener('click', () => {
        this.handleLessonAdvance(lesson, step);
      });
      controls.append(next);
    }

    card.append(controls);
    container.append(card);
  }

  handleLessonAdvance(lesson, step) {
    if (step.kind === 'checkpoint') {
      this.learningPath.completedCheckpoints[lesson.id] = true;
      const missionEntry = missionState(this.app.state, lesson.missionId, this.app.state.missionCatalog);
      if (missionEntry.status === 'locked') {
        missionEntry.status = 'unlocked';
      }
    }

    const nextStepIndex = this.learningPath.currentStepIndex + 1;
    if (nextStepIndex >= lesson.steps.length) {
      this.learningPath.completedLessons = uniqueArray([...this.learningPath.completedLessons, lesson.id]);
      this.learningPath.currentStepIndex = lesson.steps.length;
      this.learningPath.lastVisitedMode = 'guide';
    } else {
      this.learningPath.currentStepIndex = nextStepIndex;
    }

    this.persist();
    this.render(this.rootRef);
  }

  renderLessonComplete(container, lesson, lessonIndex) {
    const card = createPromptCard(
      `Lektion ${lessonIndex + 1} færdig`,
      `${lesson.subtitle} Du kan gå videre til næste lektion eller spille en mission om det samme stof.`
    );
    card.classList.add('lesson-complete-card');

    const stats = document.createElement('p');
    stats.className = 'muted';
    stats.textContent = `Du har klaret checkpointet for ${lesson.title.toLowerCase()}.`;
    card.append(stats);

    const missionBtn = document.createElement('button');
    missionBtn.type = 'button';
    missionBtn.textContent = 'Spil en mission om dette';
    missionBtn.addEventListener('click', () => {
      this.setMode('missions');
      this.startMission(lesson.missionId);
    });
    card.append(missionBtn);

    const nextLessonId = getNextLessonId(lesson.id);
    if (nextLessonId) {
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'secondary';
      nextBtn.textContent = 'Næste lektion';
      nextBtn.addEventListener('click', () => {
        this.learningPath.currentLessonId = nextLessonId;
        this.learningPath.currentStepIndex = 0;
        this.learningPath.lastVisitedMode = 'guide';
        this.persist();
        this.render(this.rootRef);
      });
      card.append(nextBtn);
    } else {
      const done = document.createElement('p');
      done.className = 'muted';
      done.textContent = 'Du har gennemført hele læringsstien i version 2.';
      card.append(done);
    }

    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'secondary';
    replay.textContent = 'Tag lektionen igen';
    replay.addEventListener('click', () => {
      this.learningPath.currentStepIndex = 0;
      this.persist();
      this.render(this.rootRef);
    });
    card.append(replay);

    container.append(card);
  }

  renderPlacement(container) {
    if (this.currentTaskIndex >= PLACEMENT_SEQUENCE.length) {
      const suggestion = computePlacementSuggestion(this.placementResults);
      this.app.state.placement.completed = true;
      this.app.state.placement.missionSuggestion = suggestion;
      unlockThroughMission(this.app.state, suggestion, this.app.missions);
      this.persist();

      const card = createPromptCard(
        STRINGS.common.placementDone,
        `Anbefalet startmission er ${suggestion.toUpperCase()}. Du kan stadig bruge læringsstien eller vælge andre åbne missioner bagefter.`
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

    const task = generateTask(this.app.state.session, PLACEMENT_SEQUENCE[this.currentTaskIndex]);
    this.currentTask = task;

    const intro = document.createElement('section');
    intro.className = 'lesson-hero compact';
    const title = document.createElement('h2');
    title.textContent = 'Niveau-test';
    const text = document.createElement('p');
    text.textContent = 'Testen finder et godt sted at starte i missionerne. Den springer ikke læringsstien over.';
    intro.append(title, text);
    container.append(intro);

    const progress = createProgressBar(this.currentTaskIndex, PLACEMENT_SEQUENCE.length);
    container.append(progress);

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
    triggerJuice(result.correct);
    this.mascot.setEmotion(result.correct ? 'happy' : 'sad');

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
    h2.textContent = 'Missioner';

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

    if (this.app.state.placement?.missionSuggestion) {
      const suggestion = document.createElement('p');
      suggestion.className = 'muted';
      suggestion.textContent = `Anbefalet startmission: ${this.app.state.placement.missionSuggestion.toUpperCase()}`;
      container.append(suggestion);
    }

    const grid = document.createElement('div');
    grid.className = 'cards';

    this.app.missions.forEach((mission) => {
      const entry = missionState(this.app.state, mission.id, this.app.state.missionCatalog);
      const relatedLessons = LESSONS
        .filter((lesson) => lesson.missionId === mission.id)
        .map((lesson) => lesson.title)
        .join(' · ');

      const card = createPromptCard(`Mission ${mission.level}: ${mission.title}`, mission.objective);
      card.className = `card ${entry.status === 'locked' ? 'locked' : ''}`;

      const meta = document.createElement('p');
      meta.textContent = `${entry.status === 'completed' ? STRINGS.missionStatus.completed : entry.status === 'locked' ? STRINGS.missionStatus.locked : STRINGS.missionStatus.unlocked} · Mesterskab: ${entry.masteryScore || 0}%`;
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

    const progress = createProgressBar(this.currentTaskIndex, mission.totalTasks || 8);

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
    container.append(title, progress, toolbar);

    if (this.currentTaskIndex >= (mission.totalTasks || 8)) {
      const doneCard = createPromptCard(
        'Mission afsluttet',
        entry.status === 'completed'
          ? `Missionen er gennemført med ${entry.masteryScore}% mesterskab, og næste mission er låst op hvis den findes.`
          : `Missionen er spillet igennem med ${entry.masteryScore}% mesterskab. Du skal nå ${mission.requiredMastery || 70}% for at låse næste mission op.`
      );
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
      onSubmit: (answer) => this.handleSubmit(answer, task, container)
    });
    this.cleanup = taskResult?.cleanup;
    this.feedback = document.createElement('div');
    container.append(wrapper, this.feedback);
  }

  handleSubmit(answer, task, container) {
    const result = evaluateAnswer(task, answer);
    triggerJuice(result.correct);
    this.mascot.setEmotion(result.correct ? 'happy' : 'sad');

    const advanceSession = () => {
      this.currentTaskIndex += 1;
      recordAttempt(task.id, task.missionId, result, result.misconceptionTags || [], this.app.state, task);
      evaluateStreak(this.app.state, result.correct);
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

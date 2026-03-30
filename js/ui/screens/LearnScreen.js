import {STRINGS} from '../../copy.js';
import {generateTask, evaluateAnswer} from '../../engine/taskGenerator.js';
import {mountTask} from '../components/taskRenderer.js';
import {recordAttempt, evaluateStreak, missionState} from '../../engine/progression.js';
import {saveState, resetState} from '../../engine/storage.js';
import {createFeedbackPanel} from '../components/FeedbackPanel.js';
import {createPromptCard} from '../components/PromptCard.js';
import {createProgressBar} from '../components/ProgressBar.js';
import {createMascot} from '../components/Mascot.js';
import {triggerJuice} from '../juice.js';

const PLACEMENT_SEQUENCE = ['m1', 'm1', 'm2', 'm2', 'm3', 'm3', 'm4', 'm4'];

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
    if (unlock) {
      if (entry.status === 'locked') {
        entry.status = 'unlocked';
      }
    }
    if (mission.id === suggestionId) {
      unlock = false;
    }
  });
}

export class LearnScreen {
  constructor(app) {
    this.app = app;
    this.activeMissionId = null;
    this.currentTaskIndex = 0;
    this.currentTask = null;
    this.cleanup = null;
    this.feedback = null;
    this.rootRef = null;
    this.mode = 'missions';
    this.placementResults = [];
    this.mascot = createMascot();
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

  render(container) {
    this.rootRef = container;
    if (!this.app.state.placement?.completed && this.mode !== 'missions') {
      this.renderPlacement(container);
      return;
    }

    if (!this.app.state.placement?.completed && !this.activeMissionId) {
      this.renderPlacementIntro(container);
      return;
    }

    if (!this.activeMissionId) {
      this.renderMissionList(container);
      return;
    }

    this.renderSession(container);
  }

  renderPlacementIntro(container) {
    this.destroy();
    container.innerHTML = '';
    const card = createPromptCard('Placering', STRINGS.placement.intro);
    const start = document.createElement('button');
    start.type = 'button';
    start.textContent = STRINGS.common.placementStart;
    start.addEventListener('click', () => {
      this.mode = 'placement';
      this.currentTaskIndex = 0;
      this.placementResults = [];
      this.render(container);
    });
    card.append(start);
    container.append(card);
  }

  renderPlacement(container) {
    this.destroy();
    container.innerHTML = '';

    if (this.currentTaskIndex >= PLACEMENT_SEQUENCE.length) {
      const suggestion = computePlacementSuggestion(this.placementResults);
      this.app.state.placement.completed = true;
      this.app.state.placement.missionSuggestion = suggestion;
      unlockThroughMission(this.app.state, suggestion, this.app.missions);
      saveState(this.app.state);

      const card = createPromptCard(
        STRINGS.common.placementDone,
        `Anbefalet startmission er ${suggestion.toUpperCase()}. Du kan stadig vælge andre åbne missioner bagefter.`
      );
      const go = document.createElement('button');
      go.type = 'button';
      go.textContent = STRINGS.common.backToMissions;
      go.addEventListener('click', () => {
        this.mode = 'missions';
        this.currentTaskIndex = 0;
        this.render(container);
      });
      card.append(go);
      container.append(card);
      return;
    }

    const missionId = PLACEMENT_SEQUENCE[this.currentTaskIndex];
    const task = generateTask(this.app.state.session, missionId);
    this.currentTask = task;

    const title = document.createElement('h2');
    title.textContent = `Placeringstest`;

    const progress = createProgressBar(this.currentTaskIndex, PLACEMENT_SEQUENCE.length);

    const wrapper = document.createElement('div');
    const taskResult = mountTask({
      mount: wrapper,
      task,
      state: this.app.state,
      onSubmit: (answer) => this.handlePlacementSubmit(answer, task, container)
    });

    this.cleanup = taskResult?.cleanup;
    this.feedback = createFeedbackPanel({correct: true, message: '', hint: '', show: false});
    container.append(title, progress, wrapper, this.feedback);
    if (!this.mascot.el.parentNode) container.append(this.mascot.el);
  }

  handlePlacementSubmit(answer, task, container) {
    const result = evaluateAnswer(task, answer);
    triggerJuice(result.correct);
    this.mascot.setEmotion(result.correct ? 'happy' : 'sad');
    this.feedback.style.display = 'block';
    this.feedback.className = `feedback ${result.correct ? 'correct' : 'incorrect'}`;
    this.feedback.innerHTML = '';
    const message = document.createElement('p');
    message.textContent = result.feedback.message;
    const hint = document.createElement('p');
    hint.className = 'muted';
    hint.textContent = result.feedback.misconceptionHint;
    const advanceMission = () => {
      this.placementResults.push(result);
      this.currentTaskIndex += 1;
      this.render(container);
    };

    if (result.correct) {
      setTimeout(advanceMission, 1500);
      this.feedback.append(message, hint);
    } else {
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = STRINGS.common.next;
      next.addEventListener('click', advanceMission);
      this.feedback.append(message, hint, next);
    }
  }

  renderMissionList(container) {
    this.destroy();
    container.innerHTML = '';

    const heading = document.createElement('div');
    heading.className = 'screen-title';
    const h2 = document.createElement('h2');
    h2.textContent = STRINGS.mode.learn;

    const clearBtn = document.createElement('button');
    clearBtn.className = 'secondary';
    clearBtn.textContent = STRINGS.common.clear;
    clearBtn.addEventListener('click', () => {
      this.app.state = resetState();
      saveState(this.app.state);
      window.location.hash = '#/learn';
      window.location.reload();
    });

    heading.append(h2, clearBtn);
    container.append(heading);

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
      const card = createPromptCard(`Mission ${mission.level}: ${mission.title}`, mission.objective);
      card.className = `card ${entry.status === 'locked' ? 'locked' : ''}`;

      const meta = document.createElement('p');
      meta.textContent = `${entry.status === 'completed' ? STRINGS.missionStatus.completed : entry.status === 'locked' ? STRINGS.missionStatus.locked : STRINGS.missionStatus.unlocked} · Mesterskab: ${entry.masteryScore || 0}%`;
      card.append(meta);

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
    this.activeMissionId = missionId;
    this.currentTaskIndex = 0;
    this.render(this.rootRef);
  }

  renderSession(container) {
    this.destroy();
    container.innerHTML = '';

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
    stop.textContent = 'Tilbage';
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
    this.feedback = createFeedbackPanel({correct: true, message: '', hint: '', show: false});
    container.append(wrapper, this.feedback);
    if (!this.mascot.el.parentNode) container.append(this.mascot.el);
  }

  handleSubmit(answer, task, container) {
    const result = evaluateAnswer(task, answer);
    triggerJuice(result.correct);
    this.mascot.setEmotion(result.correct ? 'happy' : 'sad');
    this.feedback.style.display = 'block';
    this.feedback.className = `feedback ${result.correct ? 'correct' : 'incorrect'}`;
    this.feedback.innerHTML = '';

    const msg = document.createElement('p');
    msg.textContent = result.feedback.message;
    const hint = document.createElement('p');
    hint.className = 'muted';
    hint.textContent = result.feedback.misconceptionHint;
    const advanceSession = () => {
      this.currentTaskIndex += 1;
      recordAttempt(task.id, task.missionId, result, result.misconceptionTags || [], this.app.state, task);
      evaluateStreak(this.app.state, result.correct);
      if (result.correct) {
        this.app.state.rewards.stars += 1;
      }
      saveState(this.app.state);
      this.render(container);
    };

    if (result.correct) {
      setTimeout(advanceSession, 1500);
      this.feedback.append(msg, hint);
    } else {
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = STRINGS.common.next;
      next.addEventListener('click', advanceSession);
      this.feedback.append(msg, hint, next);
    }
  }
}

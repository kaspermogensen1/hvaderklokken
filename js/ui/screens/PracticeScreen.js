import {STRINGS} from '../../copy.js';
import {generateTask, evaluateAnswer} from '../../engine/taskGenerator.js';
import {mountTask} from '../components/taskRenderer.js';
import {recordAttempt, evaluateStreak} from '../../engine/progression.js';
import {saveState} from '../../engine/storage.js';
import {createProgressBar} from '../components/ProgressBar.js';
import {createMascot} from '../components/Mascot.js';
import {triggerJuice} from '../juice.js';

export class PracticeScreen {
  constructor(app) {
    this.app = app;
    this.currentTaskIndex = 0;
    this.currentTask = null;
    this.cleanup = null;
    this.feedback = null;
    this.maxTasks = 8;
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
    this.destroy();
    container.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = STRINGS.mode.practice;

    const topBar = document.createElement('div');
    topBar.style.display = 'flex';
    topBar.style.justifyContent = 'space-between';
    topBar.style.alignItems = 'center';
    
    const streakUi = document.createElement('div');
    streakUi.className = `streak-counter ${this.app.state.streaks.current >= 3 ? 'hot' : ''}`;
    streakUi.textContent = this.app.state.streaks.current >= 3 ? `🔥 x${this.app.state.streaks.current}` : '';
    
    topBar.append(title, streakUi);
    container.append(topBar);

    const activeTrack = this.app.state.learningPath?.activeTrack || 'analog';
    const unlocked = this.app.missions.filter((mission) => mission.track === activeTrack && this.app.state.missions[mission.id]?.status !== 'locked');
    if (!unlocked.length) {
      container.append(Object.assign(document.createElement('p'), {textContent: `Start med første mission i ${activeTrack === 'digital' ? 'det digitale' : 'det analoge'} spor for at låse øvelser op.`}));
      return;
    }

    if (this.currentTaskIndex >= this.maxTasks) {
      const done = document.createElement('p');
      done.textContent = 'Godt løst!';
      const again = document.createElement('button');
      again.textContent = STRINGS.common.retry;
      again.type = 'button';
      again.className = 'secondary';
      again.addEventListener('click', () => {
        this.currentTaskIndex = 0;
        this.render(container);
      });
      container.append(done, again);
      return;
    }

    const progress = createProgressBar(this.currentTaskIndex, this.maxTasks);

    const missionChoice = [...unlocked].sort((left, right) => {
      const leftScore = this.app.state.missions[left.id]?.masteryScore || 0;
      const rightScore = this.app.state.missions[right.id]?.masteryScore || 0;
      return leftScore - rightScore;
    })[0];
    const task = generateTask(this.app.state.session, missionChoice.id);
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
    container.append(progress, wrapper, this.feedback);
    if (!this.mascot.el.parentNode) container.append(this.mascot.el);
  }

  handleSubmit(answer, task, container) {
    const result = evaluateAnswer(task, answer);
    if (!result.skipped) {
      triggerJuice(result.correct);
      this.mascot.setEmotion(result.correct ? 'happy' : 'sad');
    }
    this.feedback.innerHTML = '';
    this.feedback.className = result.correct ? 'feedback correct' : 'feedback incorrect';
    const main = document.createElement('p');
    main.textContent = result.feedback?.message || (result.correct ? 'Godt gået' : 'Prøv igen.');
    const hint = document.createElement('p');
    hint.className = 'muted';
    hint.textContent = result.feedback?.misconceptionHint || '';

    const advancePractice = () => {
      recordAttempt(task.id, task.missionId, result, result.misconceptionTags || [], this.app.state, task);
      if (!result.skipped) {
        evaluateStreak(this.app.state, result.correct);
      }
      if (result.correct) {
        this.app.state.rewards.stars += 1;
      }
      this.currentTaskIndex += 1;
      saveState(this.app.state);
      this.render(container);
    };

    if (result.correct) {
      setTimeout(advancePractice, 1500);
      this.feedback.append(main, hint);
    } else {
      const cont = document.createElement('button');
      cont.textContent = STRINGS.common.next;
      cont.type = 'button';
      cont.addEventListener('click', advancePractice);
      this.feedback.append(main, hint, cont);
    }
  }
}

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

    const activeTrack = this.app.state.learningPath?.activeTrack || 'analog';
    const unlocked = this.app.missions.filter((mission) => mission.track === activeTrack && this.app.state.missions[mission.id]?.status !== 'locked');

    if (!unlocked.length) {
      const empty = document.createElement('div');
      empty.className = 'practice-done-card';
      empty.innerHTML = `<h3>${activeTrack === 'digital' ? '🖥️' : '🕐'} ${STRINGS.mode.practice}</h3>`;
      const msg = document.createElement('p');
      msg.className = 'muted';
      msg.textContent = `Start med første mission i ${activeTrack === 'digital' ? 'det digitale' : 'det analoge'} spor for at låse øvelser op.`;
      empty.append(msg);
      container.append(empty);
      return;
    }

    if (this.currentTaskIndex >= this.maxTasks) {
      const done = document.createElement('div');
      done.className = 'practice-done-card';
      done.innerHTML = '<h3>Godt klaret! 🎉</h3>';
      const summary = document.createElement('p');
      summary.className = 'muted';
      summary.textContent = `Du har gennemført ${this.maxTasks} opgaver.`;
      const again = document.createElement('button');
      again.textContent = STRINGS.common.retry;
      again.type = 'button';
      again.className = 'secondary';
      again.style.marginTop = '1rem';
      again.addEventListener('click', () => {
        this.currentTaskIndex = 0;
        this.render(container);
      });
      done.append(summary, again);
      container.append(done);
      return;
    }

    // Header with title and streak
    const header = document.createElement('div');
    header.className = 'practice-header';

    const title = document.createElement('h2');
    title.textContent = STRINGS.mode.practice;

    header.append(title);

    if (this.app.state.streaks.current >= 3) {
      const streakBadge = document.createElement('span');
      streakBadge.className = 'streak-badge';
      streakBadge.textContent = `🔥 x${this.app.state.streaks.current}`;
      header.append(streakBadge);
    }

    // Progress bar
    const progress = createProgressBar(this.currentTaskIndex, this.maxTasks);

    // Generate task
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
    container.append(header, progress, wrapper, this.feedback);
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
    main.textContent = result.feedback?.message || (result.correct ? 'Godt gået! 👏' : 'Ikke helt rigtigt.');
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

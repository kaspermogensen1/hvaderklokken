import {STRINGS} from '../../copy.js';
import {buildReviewTask, pullDueReviewTasks, consumeReviewOutcome} from '../../engine/review.js';
import {evaluateAnswer} from '../../engine/taskGenerator.js';
import {recordAttempt} from '../../engine/progression.js';
import {saveState} from '../../engine/storage.js';
import {mountTask} from '../components/taskRenderer.js';

function reviewFocusLabel(tag) {
  return STRINGS.misconceptions[tag]?.title || 'Gentagelse';
}

export class ReviewScreen {
  constructor(app) {
    this.app = app;
    this.activeReview = null;
    this.cleanup = null;
    this.currentTask = null;
    this.feedback = null;
  }

  destroy() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
  }

  render(container) {
    this.destroy();
    container.innerHTML = '';

    const due = pullDueReviewTasks(this.app.state, 1);
    if (!due.length) {
      container.append(Object.assign(document.createElement('p'), {textContent: STRINGS.common.noReview}));
      return;
    }

    const taskObj = buildReviewTask(this.app.state, due[0]);
    this.activeReview = due[0];
    this.currentTask = taskObj;

    const title = document.createElement('h2');
    title.textContent = STRINGS.review.title;
    const focus = document.createElement('p');
    focus.className = 'muted';
    focus.textContent = `${STRINGS.review.missionHint} ${reviewFocusLabel(taskObj.tag)}`;

    const wrapper = document.createElement('div');
    const taskResult = mountTask({
      mount: wrapper,
      task: taskObj,
      state: this.app.state,
      onSubmit: (answer) => this.handleSubmit(answer, taskObj, container)
    });

    this.cleanup = taskResult?.cleanup;
    this.feedback = document.createElement('div');
    container.append(title, focus, wrapper, this.feedback);
  }

  handleSubmit(answer, task, container) {
    const result = evaluateAnswer(task, answer);
    if (!result.skipped) {
      this.feedback.className = result.correct ? 'feedback correct' : 'feedback incorrect';
    } else {
      this.feedback.className = 'feedback incorrect';
    }
    this.feedback.innerHTML = '';
    const text = document.createElement('p');
    text.textContent = result.feedback?.message || (result.correct ? 'Godt gået' : 'Prøv igen.');

    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = STRINGS.common.next;
    next.addEventListener('click', () => {
      recordAttempt(task.id, task.missionId, result, result.misconceptionTags || [], this.app.state, task);
      consumeReviewOutcome(this.app.state, this.activeReview.id, result);
      if (result.correct) {
        this.app.state.rewards.stars += 1;
      }
      saveState(this.app.state);
      this.render(container);
    });

    this.feedback.append(text, next);
  }
}

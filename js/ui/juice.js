import {audio} from './audio.js';

export function triggerJuice(isCorrect) {
  const clockShell = document.querySelector('.clock-shell');

  if (isCorrect) {
    audio.playSuccess();
    
    if (window.confetti) {
      window.confetti({ 
        particleCount: 120, 
        spread: 80, 
        origin: { y: 0.6 },
        colors: ['#f4adb5', '#bed1e2', '#ffd4a4', '#d5e7ff', '#f2b85f'] 
      });
    }

    if (clockShell) {
      clockShell.classList.remove('bounce-joy', 'wobble-error');
      void clockShell.offsetWidth; // Force reflow to restart animation
      clockShell.classList.add('bounce-joy');
    }

    document.body.classList.add('bg-radiant');
    setTimeout(() => {
      document.body.classList.remove('bg-radiant');
    }, 1200);

  } else {
    audio.playError();

    if (clockShell) {
      clockShell.classList.remove('bounce-joy', 'wobble-error');
      void clockShell.offsetWidth;
      clockShell.classList.add('wobble-error');
    }
    
    // Visually shake the active buttons
    const buttons = document.querySelectorAll('.task-choice-button');
    buttons.forEach(btn => {
      btn.classList.add('wobble-error');
      setTimeout(() => btn.classList.remove('wobble-error'), 500);
    });
  }
}

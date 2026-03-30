import {STRINGS} from '../../copy.js';
import {createMascot} from '../components/Mascot.js';

export class HomeScreen {
  constructor(app) {
    this.app = app;
    this.mascot = createMascot();
    setTimeout(() => this.mascot.setEmotion('happy'), 500);
  }

  destroy() {
    if (this.mascot.el.parentNode) {
      this.mascot.el.remove();
    }
  }

  render(container) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'center';
    wrap.style.height = '100%';
    wrap.style.gap = '40px';
    wrap.style.padding = '20px';

    const title = document.createElement('h1');
    title.textContent = 'Velkommen tilbage!';
    title.style.fontSize = '2.5rem';
    title.style.color = 'var(--text)';
    title.style.textAlign = 'center';

    const playBtn = document.createElement('a');
    playBtn.href = '#/learn';
    playBtn.style.textDecoration = 'none';
    
    const playInner = document.createElement('button');
    playInner.type = 'button';
    playInner.textContent = 'Spil Nu!';
    playInner.style.fontSize = '2rem';
    playInner.style.padding = '24px 64px';
    playInner.style.boxShadow = '0 12px 0 #1b4bcf';
    playInner.style.transform = 'scale(1.1)';
    playInner.style.animation = 'pulse 2s infinite ease-in-out';
    
    playBtn.append(playInner);

    // Make sure mascot is nice and big
    this.mascot.el.style.transform = 'scale(1.5)';
    this.mascot.el.style.margin = '20px';

    wrap.append(title, this.mascot.el, playBtn);

    container.innerHTML = '';
    container.append(wrap);
  }
}


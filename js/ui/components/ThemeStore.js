import {saveState} from '../../engine/storage.js';

const THEMES = [
  { id: 'default', name: 'Standard', cost: 0, icon: '🕰️' },
  { id: 'space', name: 'Rummet', cost: 10, icon: '🚀' },
  { id: 'candy', name: 'Slikland', cost: 20, icon: '🍭' }
];

export function createThemeStore(app) {
  const overlay = document.createElement('div');
  overlay.className = 'theme-store-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'theme-store-modal card';

  const header = document.createElement('div');
  header.className = 'theme-store-header';
  
  const title = document.createElement('h2');
  title.textContent = 'Temabutik';
  
  const starCount = document.createElement('div');
  starCount.className = 'star-counter';
  starCount.textContent = `⭐ ${app.state.rewards.stars}`;

  header.append(title, starCount);
  modal.appendChild(header);

  const list = document.createElement('div');
  list.className = 'theme-list';

  const unlocked = app.state.rewards.unlockedThemes || ['default'];
  const active = app.state.settings.theme || 'default';

  THEMES.forEach(theme => {
    const item = document.createElement('div');
    item.className = `theme-item ${active === theme.id ? 'active' : ''}`;
    
    const info = document.createElement('span');
    info.textContent = `${theme.icon} ${theme.name}`;
    item.appendChild(info);

    const btn = document.createElement('button');
    const isUnlocked = unlocked.includes(theme.id);
    
    if (active === theme.id) {
      btn.textContent = 'Valgt';
      btn.disabled = true;
      btn.className = 'secondary';
    } else if (isUnlocked) {
      btn.textContent = 'Vælg';
      btn.className = 'secondary';
      btn.addEventListener('click', () => {
        app.state.settings.theme = theme.id;
        document.body.className = `theme-${theme.id}`;
        saveState(app.state);
        overlay.remove();
      });
    } else {
      btn.textContent = `⭐ ${theme.cost}`;
      if (app.state.rewards.stars >= theme.cost) {
        btn.addEventListener('click', () => {
          app.state.rewards.stars -= theme.cost;
          app.state.rewards.unlockedThemes.push(theme.id);
          app.state.settings.theme = theme.id;
          document.body.className = `theme-${theme.id}`;
          saveState(app.state);
          overlay.remove();
        });
      } else {
        btn.disabled = true;
      }
    }

    item.appendChild(btn);
    list.appendChild(item);
  });

  modal.appendChild(list);
  
  const close = document.createElement('button');
  close.textContent = 'Luk';
  close.className = 'secondary close-btn';
  close.addEventListener('click', () => overlay.remove());
  modal.appendChild(close);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

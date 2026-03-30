import {loadState, saveState, ensureMissionEntries} from './engine/storage.js';
import {setMissionDefinitions} from './engine/taskGenerator.js';
import {getMissionFallbackDefinitions} from './content.js';
import {initRouter} from './ui/router.js';
import {createThemeStore} from './ui/components/ThemeStore.js';

const loadMissionDefinitions = async () => {
  try {
    const response = await fetch('./data/missions-levels-1-6.json');
    if (!response.ok) {
      throw new Error('mission data not found');
    }
    return await response.json();
  } catch (err) {
    return getMissionFallbackDefinitions();
  }
};

const bootstrap = async () => {
  const missionPack = await loadMissionDefinitions();
  const state = loadState();

  const missions = missionPack.missions || [];
  state._missionDefs = missions;
  state.missionCatalog = missions.map((m) => m.id);

  ensureMissionEntries(state, missions);

  const normalizedState = {
    ...state,
    profile: {
      ...state.profile,
      lastActiveAt: Date.now()
    }
  };

  if (!normalizedState.rewards) {
    normalizedState.rewards = {stars: 0, gears: 0, unlockedBadges: []};
  }

  setMissionDefinitions(missions);
  saveState(normalizedState);

  // Apply visual theme
  if (normalizedState.settings?.theme) {
    document.body.className = `theme-${normalizedState.settings.theme}`;
  }

  // Set initial star counter
  const starEl = document.getElementById('star-count');
  if (starEl) {
    starEl.textContent = normalizedState.rewards?.stars || 0;
  }

  if (!normalizedState.settings) {
    normalizedState.settings = { ttsEnabled: true };
  } else if (normalizedState.settings.ttsEnabled === undefined) {
    normalizedState.settings.ttsEnabled = true;
  }

  const app = {
    state: normalizedState,
    missions,
    root: document.getElementById('app-root')
  };

  app.state._missionDefs = missions;
  app.state.missionCatalog = missions.map((mission) => mission.id);

  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => createThemeStore(app));
  }

  const ttsBtn = document.getElementById('tts-toggle');
  if (ttsBtn) {
    ttsBtn.textContent = app.state.settings.ttsEnabled ? '🔊' : '🔇';
    ttsBtn.addEventListener('click', () => {
      app.state.settings.ttsEnabled = !app.state.settings.ttsEnabled;
      ttsBtn.textContent = app.state.settings.ttsEnabled ? '🔊' : '🔇';
      saveState(app.state);
      if (!app.state.settings.ttsEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    });
  }

  initRouter(app);
};

bootstrap();

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('ServiceWorker registration successful with scope: ', reg.scope))
      .catch(err => console.log('ServiceWorker registration failed: ', err));
  });
}

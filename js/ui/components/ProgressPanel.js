export function renderProgressPanel(state) {
  const wrapper = document.createElement('div');
  wrapper.className = 'progress-row';
  const streak = state.streaks?.current || 0;
  const best = state.streaks?.best || 0;
  const stars = state.rewards?.stars || 0;

  const p1 = document.createElement('div');
  p1.textContent = `Streak: ${streak} (bedste: ${best})`;

  const p2 = document.createElement('div');
  p2.textContent = `Mærker: ${stars}`;

  wrapper.append(p1, p2);
  return wrapper;
}

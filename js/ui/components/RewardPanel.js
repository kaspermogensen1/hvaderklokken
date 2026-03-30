export function renderRewardPanel(state) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card';

  const h3 = document.createElement('h2');
  h3.textContent = 'Belønninger';

  const p = document.createElement('p');
  const rewards = state.rewards || {};
  p.textContent = `Stjerner: ${rewards.stars || 0} · Gear: ${rewards.gears || 0}`;

  const badges = document.createElement('div');
  badges.className = 'muted';
  const list = Array.isArray(rewards.unlockedBadges) ? rewards.unlockedBadges : [];
  badges.textContent = list.length ? `Badges: ${list.join(', ')}` : 'Ingen badges endnu';

  wrapper.append(h3, p, badges);
  return wrapper;
}

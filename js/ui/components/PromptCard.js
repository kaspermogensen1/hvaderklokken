export function createPromptCard(title, text) {
  const card = document.createElement('div');
  card.className = 'card';

  const h2 = document.createElement('h2');
  h2.textContent = title;

  const p = document.createElement('p');
  p.className = 'muted';
  p.textContent = text;

  card.append(h2, p);
  return card;
}

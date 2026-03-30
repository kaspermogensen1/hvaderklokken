export function createFeedbackPanel({correct, message, hint, show}) {
  const panel = document.createElement('div');
  panel.className = `feedback ${correct ? 'correct' : 'incorrect'}`;
  if (!show) {
    panel.style.display = 'none';
  }

  const title = document.createElement('strong');
  title.textContent = correct ? 'Godt gået' : 'Næsten, men prøv igen';
  const p = document.createElement('p');
  p.textContent = message;

  const hintText = document.createElement('p');
  hintText.className = 'muted';
  hintText.textContent = hint || '';

  panel.append(title, p, hintText);
  return panel;
}

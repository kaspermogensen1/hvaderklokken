export function createProgressBar(currentIndex, total) {
  const container = document.createElement('div');
  container.className = 'progress-map';

  for (let i = 0; i < total; i++) {
    const node = document.createElement('div');
    node.className = `progress-node ${i < currentIndex ? 'completed' : i === currentIndex ? 'active' : 'upcoming'}`;
    
    // Add pulsing animation to the active node
    if (i === currentIndex) {
      node.style.animation = 'pulse-node 1.5s infinite';
    }

    container.appendChild(node);

    // Add connector line between nodes
    if (i < total - 1) {
      const line = document.createElement('div');
      line.className = `progress-line ${i < currentIndex ? 'completed' : 'upcoming'}`;
      container.appendChild(line);
    }
  }

  return container;
}

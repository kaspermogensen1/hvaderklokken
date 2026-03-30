export function createMascot() {
  const container = document.createElement('div');
  container.className = 'mascot-container';
  
  // Basic SVG owl/clock buddy
  container.innerHTML = `
    <svg viewBox="0 0 100 100" class="mascot-svg">
      <circle cx="50" cy="50" r="45" fill="#f8d082" />
      <path d="M 25 35 Q 35 15 50 35 Q 65 15 75 35" fill="none" stroke="#d5863c" stroke-width="6" stroke-linecap="round" />
      <!-- Eyes -->
      <circle cx="35" cy="45" r="8" fill="white" class="eye-bg" />
      <circle cx="65" cy="45" r="8" fill="white" class="eye-bg" />
      <circle cx="35" cy="45" r="4" fill="#333" class="pupil pupil-l" />
      <circle cx="65" cy="45" r="4" fill="#333" class="pupil pupil-r" />
      <!-- Beak -->
      <polygon points="45,55 55,55 50,65" fill="#e76f51" class="beak" />
      <!-- Blushes -->
      <circle cx="20" cy="55" r="6" fill="#f4adb5" opacity="0.6" class="blush" />
      <circle cx="80" cy="55" r="6" fill="#f4adb5" opacity="0.6" class="blush" />
    </svg>
  `;

  return {
    el: container,
    setEmotion: (emotion) => {
      container.className = `mascot-container emotion-${emotion}`;
      // Trigger a tiny jump animation
      container.classList.remove('mascot-jump');
      void container.offsetWidth;
      container.classList.add('mascot-jump');
    }
  };
}

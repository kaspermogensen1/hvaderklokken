const CACHE_NAME = 'klokkemester-v2-digital-track-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/reset.css',
  '/css/styles.css',
  '/css/clock.css',
  '/css/motion.css',
  '/js/main.js',
  '/js/copy.js',
  '/js/content.js',
  '/js/config.js',
  '/js/engine/storage.js',
  '/js/engine/taskGenerator.js',
  '/js/engine/timeModel.js',
  '/js/engine/progression.js',
  '/js/engine/lessonEngine.js',
  '/js/engine/misconceptions.js',
  '/js/engine/review.js',
  '/js/ui/audio.js',
  '/js/ui/juice.js',
  '/js/ui/router.js',
  '/js/ui/components/ClockCanvas.js',
  '/js/ui/components/DigitalTimeInput.js',
  '/js/ui/components/Mascot.js',
  '/js/ui/components/ProgressBar.js',
  '/js/ui/components/PromptCard.js',
  '/js/ui/components/ThemeStore.js',
  '/js/ui/components/TimeReadout.js',
  '/js/ui/components/taskRenderer.js',
  '/js/ui/screens/HomeScreen.js',
  '/js/ui/screens/LearnScreen.js',
  '/js/ui/screens/PracticeScreen.js',
  '/js/ui/screens/ReviewScreen.js',
  '/js/ui/screens/TimeLabScreen.js',
  '/data/missions-levels-1-6.json',
  '/assets/logo.svg',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll, but gracefully handle individual failures so one missing file doesn't break the whole cache
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(err => console.warn(`Failed to cache ${url}:`, err)))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic responses if valid
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Ignore errors for non-essential external trackers/assets
        return new Response('', { status: 404, statusText: 'Not Found Offline' });
      });
    })
  );
});

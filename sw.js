self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installed');
});

self.addEventListener('fetch', (event) => {
  // For now, just pass requests through
  event.respondWith(fetch(event.request));
});

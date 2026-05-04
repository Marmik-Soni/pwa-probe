// PWA Probe — minimal no-op service worker
// Satisfies Chrome's install requirements. Caching strategy added in Phase 8.

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass all fetch requests through to the network unchanged.
self.addEventListener('fetch', () => {});

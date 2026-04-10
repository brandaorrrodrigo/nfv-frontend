/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'nfv-pose-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/poses') && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow('/poses');
    }),
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'NutriFitVision', {
      body: data.body || 'Nova atualização disponível',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'nfv-push',
      vibrate: [200, 100, 200],
    }),
  );
});

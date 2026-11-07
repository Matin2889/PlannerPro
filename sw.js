/* PlannerPro Service Worker — offline + notifications support */
const CACHE_NAME = 'plannerpro-v1.0.0';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/favicon.ico',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Network-first for HTML (always fresh when online), cache-first for rest
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});

/* Show notifications requested by the page */
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION' || data.action === 'show-notification') {
    const title = data.title || 'PlannerPro';
    const options = {
      body: data.body || data.message || '',
      icon: data.icon || './icons/icon-192.png',
      badge: data.badge || './icons/icon-96.png',
      tag: data.tag || 'plannerpro-notif',
      renotify: !!data.renotify,
      requireInteraction: !!data.requireInteraction,
      silent: !!data.silent,
      data: data.payload || data.data || {},
      vibrate: data.vibrate || [120, 60, 120],
      actions: data.actions || []
    };
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* Notification click — focus / open the app */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const payload = event.notification.data || {};
  const targetUrl = payload.url || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', payload });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  // optional logging
});

/* Optional push (if you later add a push server) */
self.addEventListener('push', (event) => {
  let data = { title: 'PlannerPro', body: 'New reminder' };
  try {
    if (event.data) data = event.data.json();
  } catch (_) {}
  event.waitUntil(
    self.registration.showNotification(data.title || 'PlannerPro', {
      body: data.body || '',
      icon: './icons/icon-192.png',
      badge: './icons/icon-96.png',
      data: data
    })
  );
});

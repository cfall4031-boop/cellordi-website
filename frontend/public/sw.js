// ── Service Worker — Réparation CeLL&Ordi Admin PWA ──────────

// Push notification reçue
self.addEventListener('push', function(event) {
  if (!event.data) return;

  var data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || 'CeLL&Ordi', {
      body: data.body || '',
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-48x48.png',
      tag: data.tag || 'general',
      data: { url: data.url || '/admin' }
    })
  );
});

// Clic sur la notification → ouvrir le panel admin
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  var url = (event.notification.data && event.notification.data.url) || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        if (windowClients[i].url.indexOf('/admin') !== -1) {
          return windowClients[i].focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

// Activation immédiate
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

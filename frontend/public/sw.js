// ── Service Worker — Réparation CeLL&Ordi Admin PWA ──────────
// Compatible iOS 16.4+ (PWA ajoutée à l'écran d'accueil)

// Push notification reçue
self.addEventListener('push', function(event) {
  var data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // Fallback si le payload est du texte brut (certains proxies iOS)
      data = { title: event.data.text() };
    }
  }

  var title = data.title || 'CeLL&Ordi';
  var options = {
    body:    data.body  || '',
    icon:    '/android-chrome-192x192.png',
    badge:   '/favicon-48x48.png',
    tag:     data.tag   || 'general',
    // renotify: true permet de remplacer une notification avec le même tag sur iOS
    renotify: true,
    data:    { url: data.url || '/admin' }
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(function() {
      if (self.navigator && self.navigator.setAppBadge) {
        self.navigator.setAppBadge(1);
      }
    })
  );
});

// Clic sur la notification → ouvrir le panel admin
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (self.navigator && self.navigator.clearAppBadge) {
    self.navigator.clearAppBadge();
  }

  var url = (event.notification.data && event.notification.data.url) || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.indexOf('/admin') !== -1 && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Activation immédiate — prend le contrôle de tous les onglets ouverts
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

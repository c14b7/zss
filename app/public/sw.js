// Service Worker dla PWA ZSS
const CACHE_NAME = 'zss-app-v1';
const urlsToCache = [
  '/',
  '/users',
  '/budget',
  '/vote/manage',
  '/dashboard',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Instalacja Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Strategia cache-first dla zasobów statycznych
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Zwróć z cache jeśli dostępne
        if (response) {
          return response;
        }
        
        // W przeciwnym razie pobierz z sieci
        return fetch(event.request).then((response) => {
          // Sprawdź czy to valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Aktualizacja Service Worker
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
});

// Obsługa push notifications (przyszłe funkcje)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nowa notyfikacja z ZSS',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Sprawdź',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Zamknij',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ZSS - Samorząd Uczniowski', options)
  );
});

// Obsługa kliknięć w notyfikacje
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

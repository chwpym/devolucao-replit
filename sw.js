// Service Worker for Parts Return Control System

// Versioning for cache management
const CACHE_NAME = 'pecas-cache-v1.2';
const API_CACHE_NAME = 'pecas-api-cache-v1.2';

// List of essential files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/menu.js',
  '/js/database.js',
  '/js/utils.js',
  '/js/sync.js',
  '/js/init.js',
  // Dependencies from CDN
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/idb@7/build/umd.js',
  // Pages (will be added dynamically if needed)
  '/pages/cadastro.html',
  '/pages/consulta.html',
  '/pages/relatorio.html',
  '/pages/backup.html',
  '/pages/cadastro-pessoas.html',
  '/pages/cadastro-fornecedor.html',
  '/pages/cadastro-garantia.html',
  '/pages/configuracoes.html',
  '/pages/consulta-garantia.html',
  '/pages/relatorio-garantia.html'
];

// --- Service Worker Lifecycle Events ---

// Install: Cache all essential assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch(error => console.error('Service Worker installation failed:', error))
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated and ready to handle fetches.');
      return self.clients.claim();
    })
  );
});


// --- Fetch Event: Caching Strategies ---

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy 1: For API calls, use a Network First, then Cache strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If successful, cache a clone of the response
          const responseToCache = response.clone();
          caches.open(API_CACHE_NAME)
            .then(cache => cache.put(request, responseToCache));
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(request);
        })
    );
    return;
  }

  // Strategy 2: For other requests, use a Cache First, then Network strategy
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // If we have a cached response, return it
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise, fetch from the network
        return fetch(request).then(networkResponse => {
          // If the fetch is successful, cache the response
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, responseToCache));
          }
          return networkResponse;
        });
      })
  );
});


// --- Background Sync and Notifications ---

// Listen for background sync events
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync event received:', event.tag);
  if (event.tag === 'data-sync') {
    event.waitUntil(
      self.triggerSync()
        .then(() => console.log('Background sync finished.'))
        .catch(err => console.error('Background sync failed:', err))
    );
  }
});

// Push notification received
self.addEventListener('push', event => {
  console.log('Service Worker: Push message received.');
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/manifest-icon-192.png',
    badge: '/manifest-icon-96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification clicked
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});


// --- Communication with Client ---

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
var CACHE_NAME = 'nanny-tracker-v2';
var urlsToCache = [
  './',
  './index.html'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_NAME; })
             .map(function(name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Let Firebase/Google auth requests go to network
  if (event.request.url.indexOf('googleapis.com') >= 0 ||
      event.request.url.indexOf('gstatic.com') >= 0 ||
      event.request.url.indexOf('firebaseio.com') >= 0 ||
      event.request.url.indexOf('firestore.googleapis.com') >= 0) {
    return;
  }
  event.respondWith(
    fetch(event.request).then(function(response) {
      // Update cache with fresh version
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function() {
      // Offline - serve from cache
      return caches.match(event.request);
    })
  );
});

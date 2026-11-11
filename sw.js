var CACHE = 'klassenorganisierer-v14';
var CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Eigene Dateien: zuerst das Netz, damit neue Versionen ankommen; ohne Netz aus dem Speicher.
   Fremde Dateien (3D-Bibliothek, Schrift): zuerst aus dem Speicher. */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var own = new URL(e.request.url).origin === self.location.origin;
  function store(res) {
    var copy = res.clone();
    caches.open(CACHE).then(function (c) { return c.put(e.request, copy); }).catch(function () {});
    return res;
  }
  if (own) {
    e.respondWith(fetch(e.request).then(store).catch(function () { return caches.match(e.request); }));
  } else {
    e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request).then(store); }));
  }
});

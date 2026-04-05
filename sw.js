const CACHE_NAME = 'finanzas-v1.3.0';

const urlsToCache = [
  './',
  './index.html',
  './app_finanzas_personales_mensuales.html',
  './simulador_credito_abonos.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// instalar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// activar (limpiar cache viejo)
self.addEventListener('activate', event => {
  const whitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (!whitelist.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
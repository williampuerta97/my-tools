const CACHE_NAME = 'finanzas-v1.10.0';

const urlsToCache = [
  './',
  './index.html',
  './app_finanzas_personales_mensuales.html',
  './simulador_credito_abonos.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

async function putFresh(cache, url) {
  const res = await fetch(url, { cache: 'reload' });
  if (!res.ok) throw new Error('No se pudo cachear ' + url);
  await cache.put(url, res);
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(urlsToCache.map(url => putFresh(cache, url)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isHtml(request) {
  if (request.mode === 'navigate') return true;
  const accept = request.headers.get('accept') || '';
  return accept.includes('text/html');
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isHtml(request)) {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return res;
      });
      return cached || network;
    })
  );
});

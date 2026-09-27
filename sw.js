const CACHE = 'ci-crm-v9';
const SHELL = [
  './', './index.html', './app.js', './gas-api.js',
  './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('script.google.com')) return;
  e.respondWith(
    caches.match(e.request).then(c => c || fetch(e.request).then(r => {
      const cp = r.clone();
      caches.open(CACHE).then(ca => ca.put(e.request, cp));
      return r;
    }).catch(() => caches.match('./index.html')))
  );
});

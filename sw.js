// Werkt ook met slechte wifi in de sporthal: eerst het netwerk, maar na 3 seconden de bewaarde versie.
// Na een inhoudelijke update dit versienummer ophogen.
const CACHE = 'val-werp-coach-v2';
const ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'ui.js', 'store.js', 'data.js', 'views.js', 'choreo.js',
  'icon.svg', 'icon-192.png', 'manifest.webmanifest',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const network = fetch(req).then(res => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  });
  const cached = () => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
  const slow = new Promise(resolve => setTimeout(resolve, 3000)).then(cached);
  e.respondWith(
    Promise.race([network.catch(cached), slow.then(hit => hit || network)])
      .then(res => res || network)
      .catch(() => cached()),
  );
  // Ook als de bewaarde versie wint: de netwerkversie bijwerken voor de volgende keer
  e.waitUntil(network.catch(() => {}));
});

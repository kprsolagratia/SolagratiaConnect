/* SGKConnect service worker — cache-first untuk aset, network-first untuk halaman */
const VERSION = 'sgk-v18';
const ASSETS = [
  './', 'index.html', 'beranda.html', 'kegiatan.html', 'alkitab.html', 'doa.html',
  'komunitas.html', 'profil.html', 'admin.html', 'kelola.html', 'galeri.html', 'publik.html', 'konsep.html', '404.html',
  'assets/css/app.css', 'assets/js/ui.js', 'assets/js/app.js', 'assets/js/data.js',
  'assets/js/db.js', 'assets/js/kelola.js', 'assets/js/i18n.js', 'assets/js/publik.js', 'assets/js/galeri.js', 'assets/js/supabase.min.js',
  'assets/img/logo-mark.png', 'assets/img/logo-mark-light.png', 'assets/img/logo-lockup.png',
  'assets/img/icon-192.png', 'assets/img/favicon.png', 'manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('message', e => {
  if (e.data === 'lewati-tunggu') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  // panggilan API/auth tidak pernah di-cache
  if (/\/(rest|auth|realtime|storage)\/v1\//.test(req.url)) return;

  // config.js SELALU dari jaringan. Kalau disinggahi, kredensial lama
  // ikut tersimpan dan aplikasi bisa terjebak di mode demo.
  if (req.url.includes('assets/js/config.js')) {
    e.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match(req))
    );
    return;
  }
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match(req).then(r => r || caches.match('404.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(VERSION).then(c => c.put(req, copy));
    return res;
  }).catch(() => hit)));
});

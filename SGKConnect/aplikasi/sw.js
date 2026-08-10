/* ============================================================
   SGKConnect — Service Worker
   ------------------------------------------------------------
   Strategi:
     • Halaman & kode (html, js, css)  → JARINGAN DULU, cache
       hanya dipakai bila offline. Dengan begini, perbaikan
       langsung terlihat tanpa perlu Ctrl+Shift+R.
     • Gambar & ikon                   → cache dulu (jarang berubah)
     • config.js                       → selalu jaringan, tidak pernah
       disimpan, supaya kredensial tidak tersangkut versi lama
     • Panggilan API Supabase          → tidak disentuh sama sekali
   ============================================================ */

const VERSION = 'sgk-v21';

/* Berkas yang disimpan supaya aplikasi tetap terbuka saat offline. */
const ASSETS = [
  './', 'index.html', 'beranda.html', 'kegiatan.html', 'alkitab.html', 'doa.html',
  'komunitas.html', 'profil.html', 'admin.html', 'kelola.html', 'galeri.html',
  'publik.html', 'konsep.html', '404.html',
  'assets/css/app.css',
  'assets/js/ui.js', 'assets/js/app.js', 'assets/js/data.js', 'assets/js/db.js',
  'assets/js/kelola.js', 'assets/js/i18n.js', 'assets/js/publik.js',
  'assets/js/galeri.js', 'assets/js/supabase.min.js',
  'assets/img/logo-mark.png', 'assets/img/logo-mark-light.png',
  'assets/img/logo-lockup.png', 'assets/img/icon-192.png', 'assets/img/favicon.png',
  'manifest.webmanifest'
];

/* ---------- pasang ---------- */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
      .then(() => self.skipWaiting())      // versi baru langsung aktif
  );
});

/* ---------- aktifkan & bersihkan versi lama ---------- */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(kunci => Promise.all(kunci.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data === 'lewati-tunggu') self.skipWaiting();
});

/* ---------- permintaan ---------- */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;         // Supabase, CDN, dll

  /* config.js: selalu segar, tidak pernah disimpan */
  if (url.pathname.endsWith('/assets/js/config.js')) {
    e.respondWith(fetch(req, { cache: 'no-store' }).catch(() => caches.match(req)));
    return;
  }

  /* gambar & ikon: cache dulu, jarang berubah */
  if (/\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        const salinan = res.clone();
        caches.open(VERSION).then(c => c.put(req, salinan));
        return res;
      }))
    );
    return;
  }

  /* halaman & kode: jaringan dulu, cache sebagai cadangan offline */
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const salinan = res.clone();
          caches.open(VERSION).then(c => c.put(req, salinan));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit =>
          hit || (req.mode === 'navigate' ? caches.match('404.html') : undefined)
        )
      )
  );
});

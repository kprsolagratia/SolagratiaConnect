/* ============================================================
   SGKConnect — Tanda "ada yang baru"
   ------------------------------------------------------------
   Menyimpan waktu terakhir tiap halaman dibuka di perangkat,
   lalu membandingkannya dengan isi terbaru di database.
   Tidak ada data tambahan yang disimpan di server.
   ============================================================ */
(function (w) {
  'use strict';

  const S = w.SGK;
  const KUNCI = 'terakhirDibuka';

  /* Halaman yang dipantau → cara menghitung isi barunya. */
  const PANTAU = {
    'obrolan.html':  { label: 'Obrolan',    ambil: 'chatBaru' },
    'forum.html':    { label: 'Forum',      ambil: 'forumBaru' },
    'doa.html':      { label: 'Pokok Doa',  ambil: 'doaBaru' },
    'kegiatan.html': { label: 'Kegiatan',   ambil: 'kegiatanBaru' },
    'galeri.html':   { label: 'Galeri',     ambil: 'galeriBaru' }
  };

  function catatan() { return S.store.get(KUNCI, {}) || {}; }

  /** Tandai satu halaman sebagai sudah dibaca (dipanggil saat halaman dibuka). */
  function tandaiDibuka(halaman) {
    const c = catatan();
    c[halaman] = new Date().toISOString();
    S.store.set(KUNCI, c);
  }

  function sejak(halaman) {
    const t = catatan()[halaman];
    // Pertama kali membuka: pakai 7 hari ke belakang, supaya tidak
    // langsung banjir tanda merah pada isi lama.
    return t || new Date(Date.now() - 7 * 864e5).toISOString();
  }

  /* ---------- penghitung per halaman ---------- */
  const penghitung = {
    async chatBaru(sb, sejakWaktu) {
      const { count } = await sb.from('group_messages')
        .select('id', { count: 'exact', head: true })
        .gt('created_at', sejakWaktu);
      return count || 0;
    },
    async forumBaru(sb, sejakWaktu) {
      const [a, b] = await Promise.all([
        sb.from('forum_topics').select('id', { count: 'exact', head: true }).gt('created_at', sejakWaktu),
        sb.from('forum_replies').select('id', { count: 'exact', head: true }).gt('created_at', sejakWaktu)
      ]);
      return (a.count || 0) + (b.count || 0);
    },
    async doaBaru(sb, sejakWaktu) {
      const { count } = await sb.from('prayers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published').gt('created_at', sejakWaktu);
      return count || 0;
    },
    async kegiatanBaru(sb, sejakWaktu) {
      const { count } = await sb.from('events')
        .select('id', { count: 'exact', head: true })
        .eq('published', true).gt('created_at', sejakWaktu);
      return count || 0;
    },
    async galeriBaru(sb, sejakWaktu) {
      const { count } = await sb.from('gallery')
        .select('id', { count: 'exact', head: true })
        .gt('created_at', sejakWaktu);
      return count || 0;
    }
  };

  /** Pasang titik merah pada menu yang punya isi baru. */
  async function segarkan(halamanIni) {
    if (!w.DB || !w.DB.live || !w.DB.client) return;
    const sb = w.DB.client;

    for (const [halaman, def] of Object.entries(PANTAU)) {
      if (halaman === halamanIni) continue;       // yang sedang dibuka tidak ditandai
      let jumlah = 0;
      try { jumlah = await penghitung[def.ambil](sb, sejak(halaman)); }
      catch (e) { continue; }                      // tabel belum ada / tanpa izin
      pasangTanda(halaman, jumlah);
    }
  }

  function pasangTanda(halaman, jumlah) {
    document.querySelectorAll(
      `.sidebar a[href="${halaman}"], .mobile-nav a[href="${halaman}"]`
    ).forEach(a => {
      a.querySelectorAll('.tanda-baru').forEach(t => t.remove());
      if (jumlah <= 0) return;
      const t = document.createElement('span');
      t.className = 'tanda-baru';
      t.textContent = jumlah > 99 ? '99+' : jumlah;
      t.setAttribute('aria-label', jumlah + ' baru');
      a.appendChild(t);
    });
  }

  /** Dipanggil sekali di tiap halaman. */
  async function mulai(halamanIni) {
    tandaiDibuka(halamanIni);
    await segarkan(halamanIni);
    // periksa lagi tiap 45 detik selama halaman terbuka
    setInterval(() => segarkan(halamanIni), 45000);
  }

  w.SGK_TANDA = { mulai, segarkan, tandaiDibuka, PANTAU };
})(window);

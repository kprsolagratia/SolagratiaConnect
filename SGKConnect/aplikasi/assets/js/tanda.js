/* ============================================================
   SGKConnect — Tanda "ada yang baru"
   ------------------------------------------------------------
   Menandai menu yang punya isi baru sejak terakhir dibuka.

   Tiga aturan penting:
     1. Kiriman sendiri tidak dihitung — menulis pesan bukan
        berarti ada kabar baru untuk diri sendiri.
     2. Obrolan hanya menghitung kelompok yang diikuti.
     3. Waktu "terakhir dibuka" diperbarui selama halaman masih
        terbuka, supaya isi yang sudah terbaca langsung tidak
        muncul lagi sebagai tanda.

   Semua tersimpan di perangkat; tidak ada data tambahan di server.
   ============================================================ */
(function (w) {
  'use strict';

  const S = w.SGK;
  const KUNCI = 'terakhirDibuka';

  const PANTAU = {
    'obrolan.html':  'chatBaru',
    'forum.html':    'forumBaru',
    'doa.html':      'doaBaru',
    'kegiatan.html': 'kegiatanBaru',
    'galeri.html':   'galeriBaru'
  };

  let sayaId = null;
  let kelompokSaya = null;      // disinggahi agar tidak diambil berulang

  function catatan() { return S.store.get(KUNCI, {}) || {}; }

  /** Catat bahwa halaman ini sudah dibuka sampai detik ini. */
  function tandaiDibuka(halaman) {
    const c = catatan();
    c[halaman] = new Date().toISOString();
    S.store.set(KUNCI, c);
  }

  function sejak(halaman) {
    const t = catatan()[halaman];
    // Pertama kali: hitung mundur 3 hari saja, supaya anggota baru
    // tidak langsung dibanjiri angka dari isi lama.
    return t || new Date(Date.now() - 3 * 864e5).toISOString();
  }

  /** Id kelompok yang benar-benar diikuti — obrolan lain tidak dihitung. */
  async function kelompok(sb) {
    if (kelompokSaya) return kelompokSaya;
    try {
      const { data } = await sb.from('my_groups').select('id');
      kelompokSaya = (data || []).map(g => g.id);
    } catch (e) { kelompokSaya = []; }
    return kelompokSaya;
  }

  const penghitung = {
    async chatBaru(sb, sejakWaktu) {
      const ids = await kelompok(sb);
      if (!ids.length) return 0;
      const { count } = await sb.from('group_messages')
        .select('id', { count: 'exact', head: true })
        .in('group_id', ids)
        .neq('user_id', sayaId)              // kiriman sendiri tidak dihitung
        .gt('created_at', sejakWaktu);
      return count || 0;
    },

    async forumBaru(sb, sejakWaktu) {
      const [a, b] = await Promise.all([
        sb.from('forum_topics').select('id', { count: 'exact', head: true })
          .neq('user_id', sayaId).gt('created_at', sejakWaktu),
        sb.from('forum_replies').select('id', { count: 'exact', head: true })
          .neq('user_id', sayaId).gt('created_at', sejakWaktu)
      ]);
      return (a.count || 0) + (b.count || 0);
    },

    async doaBaru(sb, sejakWaktu) {
      const { count } = await sb.from('prayers')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .neq('user_id', sayaId)
        .gt('created_at', sejakWaktu);
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

  async function segarkan(halamanIni) {
    if (!w.DB || !w.DB.live || !w.DB.client) return;
    const sb = w.DB.client;

    // Halaman yang sedang dibuka dianggap terbaca sampai detik ini.
    if (PANTAU[halamanIni]) tandaiDibuka(halamanIni);

    for (const [halaman, cara] of Object.entries(PANTAU)) {
      if (halaman === halamanIni) { pasangTanda(halaman, 0); continue; }
      let jumlah = 0;
      try { jumlah = await penghitung[cara](sb, sejak(halaman)); }
      catch (e) { continue; }
      pasangTanda(halaman, jumlah);
    }
  }

  async function mulai(halamanIni) {
    tandaiDibuka(halamanIni);

    if (w.DB && w.DB.live) {
      try {
        const saya = await w.DB.auth.me();
        sayaId = saya && saya.id;
      } catch (e) { sayaId = null; }
    }
    if (!sayaId) sayaId = '00000000-0000-0000-0000-000000000000';   // agar neq tetap sah

    await segarkan(halamanIni);
    setInterval(() => segarkan(halamanIni), 45000);

    // Saat halaman ditinggalkan, catat waktunya sekali lagi supaya
    // isi yang muncul selagi dibaca tidak dihitung sebagai baru.
    w.addEventListener('pagehide', () => tandaiDibuka(halamanIni));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') tandaiDibuka(halamanIni);
    });
  }

  /** Bersihkan seluruh tanda — dipanggil dari konsol bila perlu. */
  function bersihkan() {
    const c = {};
    const kini = new Date().toISOString();
    Object.keys(PANTAU).forEach(h => { c[h] = kini; });
    S.store.set(KUNCI, c);
    Object.keys(PANTAU).forEach(h => pasangTanda(h, 0));
  }

  w.SGK_TANDA = { mulai, segarkan, tandaiDibuka, bersihkan, PANTAU };
})(window);

/* ============================================================
   SGKConnect — Galeri Foto
   ------------------------------------------------------------
   Anggota bisa melihat foto layar penuh dan mengunduh yang
   diinginkan, satu per satu atau beberapa sekaligus.
   ============================================================ */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let semua = [], tampil = [], terpilih = new Set(), modeMemilih = false, indeksLihat = 0;

  function tanggal(v) {
    if (!v) return '';
    return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /** Nama berkas yang rapi saat diunduh. */
  function namaBerkas(f) {
    const judul = (f.title || 'foto').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'foto';
    const tgl = (f.taken_on || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
    const ext = (f.image_url.split('?')[0].split('.').pop() || 'jpg').slice(0, 4);
    return `sgk-${judul}-${tgl}.${ext}`;
  }

  /**
   * Unduh satu foto.
   * Supabase Storage mendukung ?download=<nama>, yang menyuruh peramban
   * menyimpan berkas alih-alih membukanya. Kalau gagal (mis. alamat dari
   * luar Supabase), kita ambil isinya dulu lalu simpan sebagai blob.
   */
  async function unduh(f) {
    const nama = namaBerkas(f);
    try {
      if (/supabase\.co\/storage/.test(f.image_url)) {
        const pisah = f.image_url.includes('?') ? '&' : '?';
        const a = document.createElement('a');
        a.href = f.image_url + pisah + 'download=' + encodeURIComponent(nama);
        a.download = nama;
        document.body.appendChild(a); a.click(); a.remove();
        return true;
      }
      const res = await fetch(f.image_url, { mode: 'cors' });
      if (!res.ok) throw new Error('gagal');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = nama;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      return true;
    } catch (e) {
      // pilihan terakhir: buka di tab baru agar bisa disimpan manual
      window.open(f.image_url, '_blank', 'noopener');
      return false;
    }
  }

  /** Unduh beberapa foto berurutan, dengan jeda agar peramban tidak memblokir. */
  async function unduhBanyak(daftar) {
    let berhasil = 0;
    for (let i = 0; i < daftar.length; i++) {
      SGK.toast(`Mengunduh ${i + 1} dari ${daftar.length}…`);
      if (await unduh(daftar[i])) berhasil++;
      await new Promise(r => setTimeout(r, 700));
    }
    SGK.toast(berhasil === daftar.length
      ? `${berhasil} foto diunduh. Periksa folder Unduhan.`
      : `${berhasil} dari ${daftar.length} foto diunduh.`);
  }

  /* ---------- gambar kisi ---------- */
  function gambar() {
    const cari = $('q').value.toLowerCase().trim();
    tampil = cari
      ? semua.filter(f => ((f.title || '') + ' ' + (f.caption || '')).toLowerCase().includes(cari))
      : semua;

    if (!tampil.length) {
      $('galeri').innerHTML = '';
      $('kosong').hidden = false;
      $('kosong').innerHTML = cari
        ? `Tidak ada foto yang cocok dengan "${esc(cari)}".`
        : 'Belum ada foto. Pengurus dapat menambahkannya di Kelola Konten.';
      $('jumlah').textContent = '';
      return;
    }
    $('kosong').hidden = true;

    $('galeri').innerHTML = tampil.map((f, i) => `
      <figure class="foto ${terpilih.has(f.id) ? 'terpilih' : ''}" data-i="${i}">
        <img src="${esc(f.image_url)}" alt="${esc(f.title || 'Dokumentasi kegiatan')}" loading="lazy">
        <div class="centang" data-pilih="${f.id}">${SGK.icon('check', 15, '#fff')}</div>
        <button class="unduh" data-unduh="${i}" title="Unduh foto"
          aria-label="Unduh ${esc(f.title || 'foto')}">${SGK.icon('down', 17)}</button>
        <figcaption class="tirai">
          <div class="judul">${esc(f.title || 'Tanpa judul')}</div>
          <div class="tgl">${tanggal(f.taken_on)}</div>
        </figcaption>
      </figure>`).join('');

    $('jumlah').textContent = `${tampil.length} foto` + (cari ? ` (disaring dari ${semua.length})` : '');

    $('galeri').querySelectorAll('[data-unduh]').forEach(b =>
      b.addEventListener('click', async e => {
        e.stopPropagation();
        SGK.toast('Mengunduh…');
        await unduh(tampil[+b.dataset.unduh]);
      }));

    $('galeri').querySelectorAll('[data-pilih]').forEach(c =>
      c.addEventListener('click', e => {
        e.stopPropagation();
        pilih(c.dataset.pilih);
      }));

    $('galeri').querySelectorAll('.foto').forEach(el =>
      el.addEventListener('click', () => {
        if (modeMemilih) { pilih(tampil[+el.dataset.i].id); return; }
        buka(+el.dataset.i);
      }));
  }

  function pilih(id) {
    if (terpilih.has(id)) terpilih.delete(id); else terpilih.add(id);
    if (terpilih.size && !modeMemilih) aktifkanPilih(true);
    gambar();
    perbaruiBilah();
  }

  function aktifkanPilih(on) {
    modeMemilih = on;
    document.body.classList.toggle('pilih-aktif', on);
    $('bilah').hidden = !on;
    $('modePilih').textContent = on ? 'Batal memilih' : 'Pilih beberapa';
    if (!on) { terpilih.clear(); gambar(); }
    perbaruiBilah();
  }

  function perbaruiBilah() {
    $('terpilihKet').textContent = terpilih.size
      ? `${terpilih.size} foto dipilih` : 'Belum ada foto dipilih';
    $('unduhTerpilih').disabled = terpilih.size === 0;
  }

  /* ---------- penampil layar penuh ---------- */
  function buka(i) {
    indeksLihat = i;
    const f = tampil[i];
    $('lihatImg').src = f.image_url;
    $('lihatImg').alt = f.title || 'Dokumentasi kegiatan';
    $('lihatJudul').textContent = f.title || 'Tanpa judul';
    $('lihatKet').textContent = [f.caption, tanggal(f.taken_on)].filter(Boolean).join(' · ');
    $('lihat').classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function tutup() {
    $('lihat').classList.remove('show');
    document.body.style.overflow = '';
  }
  function geser(arah) {
    if (!tampil.length) return;
    buka((indeksLihat + arah + tampil.length) % tampil.length);
  }

  /* ---------- mulai ---------- */
  (async function () {
    SGK_I18N.mulai();
    SGK.shell('galeri.html');

    const me = await DB.auth.guard();
    if (!me) return;
    SGK.store.set('user', Object.assign(SGK.store.get('user', {}), {
      name: me.full_name || 'Anggota',
      role: me.role === 'admin' ? 'Pengurus' : 'Pemuda',
      avatar: me.avatar_url || null
    }));
    SGK.shell('galeri.html');
    if (me.role === 'admin' || me.role === 'leader') $('tambahFoto').hidden = false;

    try {
      semua = (await DB.community.gallery(200)) || [];
    } catch (e) { semua = []; }

    /* saringan berdasarkan tahun */
    const tahun = [...new Set(semua.map(f => (f.taken_on || '').slice(0, 4)).filter(Boolean))]
      .sort().reverse();
    $('tabs').innerHTML = `<button class="tab on" data-th="all">Semua</button>` +
      tahun.map(t => `<button class="tab" data-th="${t}">${t}</button>`).join('');
    $('tabs').addEventListener('click', e => {
      const b = e.target.closest('.tab'); if (!b) return;
      $('tabs').querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === b));
      const th = b.dataset.th;
      const dasar = (th === 'all') ? semua : semua.filter(f => (f.taken_on || '').startsWith(th));
      const simpanan = semua; semua = dasar; gambar(); semua = simpanan;
      // pertahankan hasil saringan pada 'tampil'
      tampil = dasar;
      $('jumlah').textContent = `${dasar.length} foto`;
    });

    gambar();
    SGK.paintScenes();

    /* aksi */
    $('q').addEventListener('input', gambar);
    $('modePilih').addEventListener('click', () => aktifkanPilih(!modeMemilih));
    $('batalPilih').addEventListener('click', () => aktifkanPilih(false));
    $('pilihSemua').addEventListener('click', () => {
      if (terpilih.size === tampil.length) terpilih.clear();
      else tampil.forEach(f => terpilih.add(f.id));
      gambar(); perbaruiBilah();
    });
    $('unduhTerpilih').addEventListener('click', async () => {
      const daftar = tampil.filter(f => terpilih.has(f.id));
      if (!daftar.length) return;
      if (daftar.length > 5 && !confirm(`Unduh ${daftar.length} foto sekaligus?`)) return;
      $('unduhTerpilih').disabled = true;
      await unduhBanyak(daftar);
      $('unduhTerpilih').disabled = false;
    });

    $('unduhSatu').addEventListener('click', async () => {
      SGK.toast('Mengunduh…');
      await unduh(tampil[indeksLihat]);
    });
    $('tutupLihat').addEventListener('click', tutup);
    $('sebelum').addEventListener('click', () => geser(-1));
    $('sesudah').addEventListener('click', () => geser(1));
    $('lihat').addEventListener('click', e => { if (e.target === $('lihat')) tutup(); });
    document.addEventListener('keydown', e => {
      if (!$('lihat').classList.contains('show')) return;
      if (e.key === 'Escape') tutup();
      if (e.key === 'ArrowLeft') geser(-1);
      if (e.key === 'ArrowRight') geser(1);
    });

    /* geser jari di layar sentuh */
    let x0 = null;
    $('lihat').addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    $('lihat').addEventListener('touchend', e => {
      if (x0 === null) return;
      const d = e.changedTouches[0].clientX - x0;
      if (Math.abs(d) > 60) geser(d > 0 ? -1 : 1);
      x0 = null;
    }, { passive: true });
  })();
})();

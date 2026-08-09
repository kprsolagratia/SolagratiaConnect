/* ============================================================
   SGKConnect — Kelola Konten
   ------------------------------------------------------------
   Satu halaman untuk seluruh isi aplikasi. Bentuk formulir
   dibangun dari definisi di bawah, jadi menambah kolom baru
   cukup diubah di satu tempat.
   ============================================================ */
(function () {
  'use strict';

  const SCENE = ['worship', 'camp', 'bible', 'pray', 'fellow', 'music', 'mic'];

  /* ---------- definisi tiap jenis konten ---------- */
  const JENIS = {
    events: {
      label: 'Kegiatan', tunggal: 'kegiatan',
      kolom: [
        { k: 'title', t: 'Judul' },
        { k: 'starts_at', t: 'Waktu', f: v => tanggalJam(v) },
        { k: 'location', t: 'Lokasi' },
        { k: 'category', t: 'Kategori' }
      ],
      isian: [
        { k: 'title', l: 'Judul kegiatan', tipe: 'text', wajib: true, ph: 'Youth Camp 2026' },
        { k: 'category', l: 'Kategori', tipe: 'pilih', opsi: ['Ibadah', 'Retreat', 'Fellowship', 'Pembinaan'] },
        { k: 'starts_at', l: 'Tanggal & jam mulai', tipe: 'datetime-local', wajib: true },
        { k: 'ends_at', l: 'Tanggal & jam selesai', tipe: 'datetime-local', bantu: 'Boleh dikosongkan' },
        { k: 'location', l: 'Lokasi', tipe: 'text', ph: 'Sendawar Camp Ground' },
        { k: 'map_query', l: 'Kata kunci Google Maps', tipe: 'text',
          bantu: 'Dipakai tombol "Buka di Google Maps". Kosongkan untuk memakai lokasi di atas.' },
        { k: 'capacity', l: 'Kuota peserta', tipe: 'number', bawaan: 100 },
        { k: 'scene', l: 'Ilustrasi latar', tipe: 'pilih', opsi: SCENE, bawaan: 'camp' },
        { k: 'description', l: 'Keterangan', tipe: 'panjang' }
      ]
    },

    devotions: {
      label: 'Renungan', tunggal: 'renungan',
      kolom: [
        { k: 'publish_on', t: 'Tanggal terbit', f: v => tanggal(v) },
        { k: 'title', t: 'Judul' },
        { k: 'verse_ref', t: 'Ayat' },
        { k: 'author', t: 'Penulis' }
      ],
      isian: [
        { k: 'publish_on', l: 'Tanggal terbit', tipe: 'date', wajib: true,
          bantu: 'Satu renungan per tanggal. Tanggal yang sama akan menimpa yang lama.' },
        { k: 'title', l: 'Judul renungan', tipe: 'text', wajib: true, ph: 'Berjalan dalam Terang' },
        { k: 'verse_ref', l: 'Referensi ayat', tipe: 'text', ph: '1 Yohanes 1:7' },
        { k: 'verse_text', l: 'Kutipan ayat', tipe: 'panjang',
          bantu: 'Kutipan pendek saja. Jangan menyalin seluruh pasal dari sumber berhak cipta.' },
        { k: 'body', l: 'Isi renungan', tipe: 'panjang', wajib: true },
        { k: 'author', l: 'Penulis', tipe: 'text', bawaan: 'Tim Renungan Pemuda' }
      ]
    },

    announcements: {
      label: 'Pengumuman', tunggal: 'pengumuman',
      kolom: [
        { k: 'publish_on', t: 'Tanggal', f: v => tanggal(v) },
        { k: 'title', t: 'Judul' },
        { k: 'body', t: 'Isi', f: v => potong(v, 70) }
      ],
      isian: [
        { k: 'title', l: 'Judul', tipe: 'text', wajib: true },
        { k: 'body', l: 'Isi pengumuman', tipe: 'panjang' },
        { k: 'publish_on', l: 'Tanggal terbit', tipe: 'date', bawaan: hariIni() }
      ]
    },

    groups: {
      label: 'Kelompok & Tim', tunggal: 'kelompok',
      kolom: [
        { k: 'name', t: 'Nama' },
        { k: 'kind', t: 'Jenis', f: v => v === 'team' ? 'Tim pelayanan' : 'Kelompok sel' },
        { k: 'leader_name', t: 'Pemimpin' },
        { k: 'schedule', t: 'Jadwal' }
      ],
      isian: [
        { k: 'name', l: 'Nama kelompok atau tim', tipe: 'text', wajib: true, ph: 'GS Zion' },
        { k: 'kind', l: 'Jenis', tipe: 'pilih', opsi: [['cell', 'Kelompok sel'], ['team', 'Tim pelayanan']], bawaan: 'cell' },
        { k: 'leader_name', l: 'Nama pemimpin', tipe: 'text' },
        { k: 'schedule', l: 'Jadwal pertemuan', tipe: 'text', ph: 'Rabu · 19.00' },
        { k: 'description', l: 'Keterangan', tipe: 'panjang' },
        { k: 'scene', l: 'Ilustrasi latar', tipe: 'pilih', opsi: SCENE, bawaan: 'fellow' }
      ]
    },

    reading_plan: {
      label: 'Rencana Baca', tunggal: 'bacaan', kunci: 'day',
      kolom: [
        { k: 'day', t: 'Hari ke-' },
        { k: 'passage', t: 'Bacaan' },
        { k: 'snippet', t: 'Kutipan', f: v => potong(v, 70) }
      ],
      isian: [
        { k: 'day', l: 'Hari ke- (1–365)', tipe: 'number', wajib: true, min: 1, max: 365 },
        { k: 'passage', l: 'Bacaan', tipe: 'text', wajib: true, ph: 'Mazmur 119:105' },
        { k: 'snippet', l: 'Kutipan pendek', tipe: 'panjang',
          bantu: 'Satu-dua kalimat saja, bukan seluruh pasal.' }
      ]
    },

    gallery: {
      label: 'Galeri Foto', tunggal: 'foto',
      kolom: [
        { k: 'image_url', t: 'Foto', f: v => '', gambar: true },
        { k: 'title', t: 'Judul' },
        { k: 'caption', t: 'Keterangan', f: v => potong(v, 50) },
        { k: 'taken_on', t: 'Tanggal', f: v => tanggal(v) },
        { k: 'is_public', t: 'Publik', f: v => v === true || v === 'true' ? 'Ya' : 'Tidak' }
      ],
      isian: [
        { k: 'image_url', l: 'Foto', tipe: 'berkas', wajib: true,
          bantu: 'JPG atau PNG, maksimal 5 MB. Bisa juga tempel alamat gambar.' },
        { k: 'title', l: 'Judul', tipe: 'text', wajib: true, ph: 'Youth Camp — sesi pujian' },
        { k: 'caption', l: 'Keterangan', tipe: 'panjang' },
        { k: 'taken_on', l: 'Tanggal foto', tipe: 'date', bawaan: hariIni() },
        { k: 'is_public', l: 'Tampilkan di halaman publik', tipe: 'pilih', bawaan: 'false',
          opsi: [['false', 'Tidak — hanya untuk anggota'], ['true', 'Ya — boleh dilihat umum']],
          bantu: 'Pikirkan dulu bila ada wajah anak-anak atau anggota yang belum memberi izin.' }
      ]
    },

    media: {
      label: 'Video & Podcast', tunggal: 'media',
      kolom: [
        { k: 'kind', t: 'Jenis', f: v => ({ video: 'Video', podcast: 'Podcast', stream: 'Streaming' }[v] || v) },
        { k: 'title', t: 'Judul' },
        { k: 'speaker', t: 'Pembicara' },
        { k: 'publish_on', t: 'Tanggal', f: v => tanggal(v) }
      ],
      isian: [
        { k: 'kind', l: 'Jenis', tipe: 'pilih', bawaan: 'video',
          opsi: [['video', 'Video'], ['podcast', 'Podcast'], ['stream', 'Streaming langsung']] },
        { k: 'title', l: 'Judul', tipe: 'text', wajib: true, ph: 'Khotbah Minggu — Kasih Karunia' },
        { k: 'url', l: 'Tautan', tipe: 'url', wajib: true, ph: 'https://youtube.com/watch?v=...',
          bantu: 'Tempel tautan YouTube, Spotify, atau alamat video lain. Video tidak diunggah ke server agar hemat kuota.' },
        { k: 'speaker', l: 'Pembicara / pengisi', tipe: 'text' },
        { k: 'duration', l: 'Durasi', tipe: 'text', ph: '42 menit' },
        { k: 'description', l: 'Keterangan', tipe: 'panjang' },
        { k: 'thumb_url', l: 'Gambar sampul', tipe: 'berkas',
          bantu: 'Boleh dikosongkan — sampul YouTube diambil otomatis.' },
        { k: 'publish_on', l: 'Tanggal terbit', tipe: 'date', bawaan: hariIni() }
      ]
    },

    prayers: {
      label: 'Moderasi Doa', tunggal: 'pokok doa', hanyaModerasi: true,
      kolom: [
        { k: 'created_at', t: 'Masuk', f: v => tanggal(v) },
        { k: 'title', t: 'Judul' },
        { k: 'body', t: 'Isi', f: v => potong(v, 70) },
        { k: 'status', t: 'Status', f: v => ({ published: 'Terbit', pending: 'Menunggu', archived: 'Diarsipkan' }[v] || v) }
      ]
    }
  };

  /* ---------- panel khusus (bukan tabel CRUD biasa) ---------- */
  const KHUSUS = {
    settings: {
      label: 'Tampilan & Identitas', tunggal: 'pengaturan',
      isian: [
        { k: 'app_name', l: 'Nama aplikasi', tipe: 'text' },
        { k: 'church_name', l: 'Nama gereja', tipe: 'text' },
        { k: 'tagline', l: 'Tagline', tipe: 'panjang' },
        { k: 'greeting_note', l: 'Kalimat sapaan di beranda', tipe: 'text',
          bantu: 'Muncul di bawah "Selamat pagi, ..."' },
        { k: 'hero_title', l: 'Judul banner beranda', tipe: 'text' },
        { k: 'hero_subtitle', l: 'Anak judul banner', tipe: 'text' },
        { k: 'hero_image_url', l: 'Foto banner beranda', tipe: 'berkas',
          bantu: 'Kosongkan untuk memakai ilustrasi bawaan.' },
        { k: 'hero_scene', l: 'Ilustrasi bawaan banner', tipe: 'pilih', opsi: SCENE },
        { k: 'verse_text', l: 'Ayat minggu ini', tipe: 'panjang' },
        { k: 'verse_ref', l: 'Referensi ayat', tipe: 'text', ph: 'Efesus 2:8' },
        { k: 'service_time', l: 'Jadwal ibadah', tipe: 'text', ph: 'Minggu · 09.00' },
        { k: 'contact_info', l: 'Kontak gereja', tipe: 'text' }
      ]
    },
    approvals: { label: 'Persetujuan Anggota', tunggal: 'permintaan' },
    attendance: { label: 'Kehadiran Manual', tunggal: 'kehadiran' }
  };

  /* ---------- pembantu format ---------- */
  function hariIni() { return new Date().toISOString().slice(0, 10); }
  function tanggal(v) {
    if (!v) return '—';
    return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function tanggalJam(v) {
    if (!v) return '—';
    return new Date(v).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function potong(v, n) {
    if (!v) return '—';
    return v.length > n ? v.slice(0, n).trim() + '…' : v;
  }
  function keLokal(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }
  function esc(s) {
    return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  /* ---------- keadaan halaman ---------- */
  let aktif = 'events';
  let daftar = [];
  let sedangSunting = null;
  let saya = null;

  const $ = id => document.getElementById(id);

  /* ---------- mulai ---------- */
  (async function () {
    SGK.shell('kelola.html');
    saya = await DB.auth.guard();
    if (!saya) return;
    SGK.store.set('user', { name: saya.full_name || 'Anggota', role: saya.role === 'admin' ? 'Pengurus' : 'Pemuda' });
    SGK.shell('kelola.html');

    if (DB.live && saya.role !== 'admin' && saya.role !== 'leader') {
      document.querySelector('.main').innerHTML =
        '<div class="card" style="margin-top:40px;text-align:center;padding:40px">' +
        '<h2>Halaman khusus pengurus</h2>' +
        '<p class="muted" style="margin:12px 0 20px">Akunmu belum memiliki akses. ' +
        'Hubungi pengurus jemaat bila ini keliru.</p>' +
        '<a class="btn btn-gold" href="beranda.html">Kembali ke beranda</a></div>';
      return;
    }

    const semuaTab = Object.entries(JENIS).concat(Object.entries(KHUSUS));
    $('tabs').innerHTML = semuaTab
      .map(([k, v], i) => `<button class="tab ${i === 0 ? 'on' : ''}" data-j="${k}">${v.label}</button>`).join('');
    $('tabs').addEventListener('click', e => {
      const b = e.target.closest('.tab'); if (!b) return;
      $('tabs').querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t === b));
      aktif = b.dataset.j;
      $('q').value = '';
      muat();
    });

    $('tambahBtn').addEventListener('click', () => bukaForm(null));
    $('batal').addEventListener('click', tutupForm);
    $('tutup').addEventListener('click', tutupForm);
    $('sheet').addEventListener('click', e => { if (e.target === $('sheet')) tutupForm(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') tutupForm(); });
    $('simpan').addEventListener('click', simpan);
    $('q').addEventListener('input', gambar);

    if (!DB.live) {
      $('jejak').innerHTML = '<span style="color:var(--gold)">Mode demo</span> — ' +
        'perubahan tidak tersimpan. Sambungkan Supabase untuk mengaktifkan.';
    }

    await muat();
    SGK.paintScenes();
  })();

  /* ---------- muat & gambar tabel ---------- */
  async function muat() {
    if (KHUSUS[aktif]) { $('tambahBtn').hidden = true; return muatKhusus(); }
    document.getElementById('panelKhusus').hidden = true;
    document.querySelector('.tbl').closest('.card').hidden = false;
    const def = JENIS[aktif];
    $('tambahBtn').hidden = !!def.hanyaModerasi;
    $('tbody').innerHTML = `<tr><td colspan="9" class="muted" style="padding:24px">Memuat…</td></tr>`;
    try {
      daftar = await DB.admin.list(aktif);
    } catch (e) { daftar = []; }
    gambar();
  }

  function gambar() {
    const def = JENIS[aktif];
    const cari = $('q').value.toLowerCase().trim();
    const isi = cari
      ? daftar.filter(r => JSON.stringify(r).toLowerCase().includes(cari))
      : daftar;

    $('thead').innerHTML = '<tr>' + def.kolom.map(c => `<th>${c.t}</th>`).join('') +
      '<th style="text-align:right">Aksi</th></tr>';

    if (!isi.length) {
      $('tbody').innerHTML = '';
      $('kosong').hidden = false;
      $('kosong').innerHTML = cari
        ? `Tidak ada ${def.tunggal} yang cocok dengan "${esc(cari)}".`
        : `Belum ada ${def.tunggal}.` +
          (def.hanyaModerasi ? '' : ` Klik <b>+ Tambah</b> untuk membuat yang pertama.`);
      $('jejak').textContent = '';
      return;
    }
    $('kosong').hidden = true;

    const kunci = def.kunci || 'id';
    $('tbody').innerHTML = isi.map(r => {
      const sel = def.kolom.map(c => {
        if (c.gambar) {
          const u = r[c.k];
          return `<td>${u ? `<img src="${esc(u)}" alt="" loading="lazy"
            style="width:56px;height:42px;object-fit:cover;border-radius:8px;border:1px solid var(--line)">`
            : '<span class="muted">—</span>'}</td>`;
        }
        const nilai = c.f ? c.f(r[c.k]) : (r[c.k] ?? '—');
        return `<td>${esc(nilai)}</td>`;
      }).join('');
      return `<tr>${sel}<td><div class="aksi">${tombolAksi(def, r, kunci)}</div></td></tr>`;
    }).join('');

    $('tbody').querySelectorAll('[data-ubah]').forEach(b =>
      b.addEventListener('click', () => bukaForm(daftar.find(x => String(x[kunci]) === b.dataset.ubah))));
    $('tbody').querySelectorAll('[data-hapus]').forEach(b =>
      b.addEventListener('click', () => hapus(b.dataset.hapus, b.dataset.nama)));
    $('tbody').querySelectorAll('[data-status]').forEach(b =>
      b.addEventListener('click', () => ubahStatus(b.dataset.id, b.dataset.status)));

    $('jejak').textContent = `${isi.length} ${def.tunggal}` + (cari ? ` (disaring dari ${daftar.length})` : '');
  }

  function tombolAksi(def, r, kunci) {
    if (def.hanyaModerasi) {
      const t = [];
      if (r.status !== 'published')
        t.push(`<button class="btn btn-line btn-sm" data-status="published" data-id="${r.id}">Terbitkan</button>`);
      if (r.status !== 'archived')
        t.push(`<button class="btn btn-line btn-sm" data-status="archived" data-id="${r.id}">Arsipkan</button>`);
      t.push(`<button class="btn btn-line btn-sm" data-hapus="${r.id}" data-nama="${esc(r.title)}">Hapus</button>`);
      return t.join('');
    }
    return `<button class="btn btn-line btn-sm" data-ubah="${r[kunci]}">Ubah</button>
            <button class="btn btn-line btn-sm" data-hapus="${r[kunci]}"
              data-nama="${esc(r.title || r.name || r.passage || '')}">Hapus</button>`;
  }

  /* ---------- formulir ---------- */
  function bukaForm(baris) {
    const def = JENIS[aktif];
    sedangSunting = baris || null;
    $('sheetTitle').textContent = (baris ? 'Ubah ' : 'Tambah ') + def.tunggal;

    $('form').innerHTML = def.isian.map(f =>
      kontrolIsian(f, baris ? (baris[f.k] ?? '') : (f.bawaan ?? ''))).join('');
    pasangUnggah($('form'), aktif);

    $('sheet').classList.add('show');
    setTimeout(() => { const p = $('form').querySelector('input,textarea,select'); if (p) p.focus(); }, 120);
  }

  function tutupForm() { $('sheet').classList.remove('show'); sedangSunting = null; }

  /* ---------- pembuat kontrol isian ---------- */
  function kontrolIsian(f, nilai) {
    const bantu = f.bantu ? `<p class="hint">${f.bantu}</p>` : '';
    let kontrol;

    if (f.tipe === 'berkas') {
      const pratinjau = nilai
        ? `<img src="${esc(nilai)}" alt="" style="width:100%;max-height:150px;object-fit:cover;
             border-radius:11px;border:1px solid var(--line);margin-bottom:8px">`
        : '';
      kontrol = `<div data-unggah="${f.k}">
        ${pratinjau}
        <input id="f_${f.k}" type="url" value="${esc(nilai)}" data-url="${esc(nilai)}"
          placeholder="Alamat gambar, atau pilih berkas di bawah">
        <div class="row" style="gap:8px;margin-top:8px;align-items:center">
          <input type="file" accept="image/*" id="file_${f.k}"
            style="flex:1;font-size:12px;padding:6px 0;border:0;background:none">
          <span class="small muted" id="stat_${f.k}"></span>
        </div></div>`;
    } else if (f.tipe === 'panjang') {
      kontrol = `<textarea id="f_${f.k}" ${f.wajib ? 'required' : ''}
        placeholder="${esc(f.ph || '')}">${esc(nilai)}</textarea>`;
    } else if (f.tipe === 'pilih') {
      const opsi = f.opsi.map(o => {
        const [v, t] = Array.isArray(o) ? o : [o, o];
        return `<option value="${esc(v)}"${String(nilai) === String(v) ? ' selected' : ''}>${esc(t)}</option>`;
      }).join('');
      kontrol = `<select id="f_${f.k}">${opsi}</select>`;
    } else {
      const v = f.tipe === 'datetime-local' ? keLokal(nilai)
              : f.tipe === 'date' ? String(nilai).slice(0, 10) : nilai;
      const batas = (f.min != null ? ` min="${f.min}"` : '') + (f.max != null ? ` max="${f.max}"` : '');
      kontrol = `<input id="f_${f.k}" type="${f.tipe}" value="${esc(v)}"
        ${f.wajib ? 'required' : ''}${batas} placeholder="${esc(f.ph || '')}">`;
    }
    return `<div class="fld"><label for="f_${f.k}">${f.l}${f.wajib ? ' *' : ''}</label>${kontrol}${bantu}</div>`;
  }

  /* ---------- unggah gambar ---------- */
  function pasangUnggah(wadah, folder) {
    wadah.querySelectorAll('[data-unggah]').forEach(kotak => {
      const k = kotak.dataset.unggah;
      const berkas = document.getElementById('file_' + k);
      const teks = document.getElementById('f_' + k);
      const stat = document.getElementById('stat_' + k);
      if (!berkas) return;

      teks.addEventListener('input', () => { teks.dataset.url = teks.value.trim(); });

      berkas.addEventListener('change', async () => {
        const f = berkas.files[0];
        if (!f) return;
        if (!DB.live) { SGK.toast('Mode demo — unggah gambar butuh Supabase.'); berkas.value = ''; return; }
        stat.textContent = 'Mengunggah…';
        berkas.disabled = true;
        try {
          const hasil = await DB.admin.upload(f, folder);
          teks.value = hasil.url;
          teks.dataset.url = hasil.url;
          stat.textContent = 'Selesai';
          let img = kotak.querySelector('img');
          if (!img) { img = document.createElement('img');
            img.style.cssText = 'width:100%;max-height:150px;object-fit:cover;border-radius:11px;border:1px solid var(--line);margin-bottom:8px';
            kotak.prepend(img); }
          img.src = hasil.url;
        } catch (e) {
          stat.textContent = '';
          SGK.toast(e.message || 'Gagal mengunggah.');
        } finally { berkas.disabled = false; }
      });
    });
  }

  async function simpan() {
    const def = JENIS[aktif];
    const isi = {};
    for (const f of def.isian) {
      const el = $('f_' + f.k);
      let v = (f.tipe === 'berkas' ? (el.dataset.url || el.value) : el.value).trim();
      if (f.wajib && !v) { SGK.toast(`"${f.l}" wajib diisi.`); el.focus(); return; }
      if (f.tipe === 'number' && v !== '') {
        v = Number(v);
        if (f.min != null && v < f.min) { SGK.toast(`"${f.l}" minimal ${f.min}.`); el.focus(); return; }
        if (f.max != null && v > f.max) { SGK.toast(`"${f.l}" maksimal ${f.max}.`); el.focus(); return; }
      }
      if (f.tipe === 'datetime-local' && v) v = new Date(v).toISOString();
      if (f.k === 'is_public') v = (v === 'true' || v === true);
      isi[f.k] = v;
    }

    $('simpan').disabled = true;
    $('simpan').textContent = 'Menyimpan…';
    try {
      const kunci = def.kunci || 'id';
      if (sedangSunting) await DB.admin.update(aktif, sedangSunting[kunci], isi);
      else await DB.admin.create(aktif, isi);
      SGK.toast(sedangSunting ? 'Perubahan tersimpan.' : `${def.label} baru ditambahkan.`);
      tutupForm();
      await muat();
    } catch (e) {
      /* pesan sudah ditampilkan lapisan DB */
    } finally {
      $('simpan').disabled = false;
      $('simpan').textContent = 'Simpan';
    }
  }

  /* ---------- panel khusus ---------- */
  async function muatKhusus() {
    const panel = document.getElementById('panelKhusus');
    document.querySelector('.tbl').closest('.card').hidden = true;
    panel.hidden = false;
    panel.innerHTML = '<p class="muted" style="padding:20px">Memuat…</p>';
    $('jejak').textContent = '';

    if (aktif === 'settings')   return panelPengaturan(panel);
    if (aktif === 'approvals')  return panelPersetujuan(panel);
    if (aktif === 'attendance') return panelKehadiran(panel);
  }

  /* --- Pengaturan --- */
  async function panelPengaturan(panel) {
    const def = KHUSUS.settings;
    const nilai = await DB.admin.getSettings();
    panel.innerHTML = `<div class="card">
      <div class="lab">Identitas & tampilan aplikasi</div>
      <p class="small muted" style="margin:8px 0 18px">
        Perubahan di sini langsung terlihat oleh seluruh anggota.</p>
      <form id="formSet"></form>
      <div class="row" style="margin-top:18px">
        <button class="btn btn-gold" id="simpanSet">Simpan pengaturan</button>
      </div></div>`;
    document.getElementById('formSet').innerHTML = def.isian.map(f => kontrolIsian(f, nilai[f.k] ?? '')).join('');
    pasangUnggah(document.getElementById('formSet'), 'pengaturan');

    document.getElementById('simpanSet').addEventListener('click', async (ev) => {
      const b = ev.currentTarget;
      const isi = {};
      for (const f of def.isian) {
        const el = $('f_' + f.k);
        isi[f.k] = (el.dataset.url ?? el.value ?? '').trim();
      }
      b.disabled = true; b.textContent = 'Menyimpan…';
      try {
        await DB.admin.saveSettings(isi);
        SGK.toast('Pengaturan tersimpan. Muat ulang untuk melihat hasilnya.');
      } catch (e) {} finally { b.disabled = false; b.textContent = 'Simpan pengaturan'; }
    });
  }

  /* --- Persetujuan anggota kelompok --- */
  async function panelPersetujuan(panel) {
    let daftarP = [];
    try { daftarP = await DB.admin.pendingMembers(); } catch (e) {}
    if (!daftarP.length) {
      panel.innerHTML = `<div class="card kosong">Tidak ada permintaan bergabung yang menunggu.</div>`;
      return;
    }
    panel.innerHTML = `<div class="card">
      <div class="lab">Menunggu persetujuan (${daftarP.length})</div>
      <div style="margin-top:14px">${daftarP.map(m => `
        <div class="row-b" style="padding:12px 0;border-top:1px solid var(--line)">
          <div>
            <h4 style="font-size:14px">${esc(m.full_name)}</h4>
            <p class="small muted">Ingin bergabung ke <b>${esc(m.group_name)}</b> · ${esc(m.member_no || '')}</p>
          </div>
          <div class="row" style="gap:6px">
            <button class="btn btn-gold btn-sm" data-setuju="1"
              data-g="${m.group_id}" data-u="${m.user_id}" data-n="${esc(m.full_name)}">Setujui</button>
            <button class="btn btn-line btn-sm" data-setuju="0"
              data-g="${m.group_id}" data-u="${m.user_id}" data-n="${esc(m.full_name)}">Tolak</button>
          </div></div>`).join('')}</div></div>`;

    panel.querySelectorAll('[data-setuju]').forEach(b => b.addEventListener('click', async () => {
      const setuju = b.dataset.setuju === '1';
      if (!setuju && !confirm(`Tolak permintaan ${b.dataset.n}?`)) return;
      b.disabled = true;
      try {
        await DB.admin.approveMember(b.dataset.g, b.dataset.u, setuju);
        SGK.toast(setuju ? `${b.dataset.n} diterima di kelompok.` : 'Permintaan ditolak.');
        muatKhusus();
      } catch (e) { b.disabled = false; }
    }));
  }

  /* --- Kehadiran manual --- */
  async function panelKehadiran(panel) {
    const [kegiatan, anggota] = await Promise.all([DB.admin.list('events'), DB.stats.members(200)]);
    if (!kegiatan.length) {
      panel.innerHTML = `<div class="card kosong">Belum ada kegiatan. Tambahkan dulu di tab Kegiatan.</div>`;
      return;
    }
    panel.innerHTML = `<div class="card">
      <div class="lab">Catat kehadiran tanpa QR</div>
      <p class="small muted" style="margin:8px 0 16px">
        Untuk anggota yang lupa membawa HP atau hadir tanpa memindai.</p>
      <div class="fld"><label for="evSel">Kegiatan</label>
        <select id="evSel">${kegiatan.map(e =>
          `<option value="${e.id}">${esc(e.title)} — ${tanggalJam(e.starts_at)}</option>`).join('')}</select></div>
      <div class="fld"><label for="cariAnggota">Cari anggota</label>
        <input id="cariAnggota" type="search" placeholder="Ketik nama…"></div>
      <div id="daftarAnggota" style="max-height:380px;overflow-y:auto"></div>
    </div>`;

    const evSel = document.getElementById('evSel');
    const cari = document.getElementById('cariAnggota');
    const wadah = document.getElementById('daftarAnggota');
    let sudah = {};

    async function gambarAnggota() {
      const q = cari.value.toLowerCase().trim();
      const tampil = q ? anggota.filter(a => a.full_name.toLowerCase().includes(q)) : anggota;
      wadah.innerHTML = tampil.length ? tampil.map(a => {
        const hadir = !!sudah[a.id];
        return `<div class="row-b" style="padding:10px 0;border-top:1px solid var(--line)">
          <div><h4 style="font-size:13.5px">${esc(a.full_name)}</h4>
            <p class="small muted">${esc(a.member_no || '')}</p></div>
          <button class="btn ${hadir ? 'btn-line' : 'btn-navy'} btn-sm" data-hadir="${a.id}"
            ${hadir ? 'disabled' : ''}>${hadir ? 'Sudah hadir' : 'Tandai hadir'}</button></div>`;
      }).join('') : '<p class="small muted" style="padding:14px 0">Tidak ada anggota yang cocok.</p>';

      wadah.querySelectorAll('[data-hadir]').forEach(b => b.addEventListener('click', async () => {
        b.disabled = true;
        try {
          await DB.admin.markAttendance(evSel.value, b.dataset.hadir);
          sudah[b.dataset.hadir] = true;
          b.textContent = 'Sudah hadir'; b.className = 'btn btn-line btn-sm';
          SGK.toast('Kehadiran tercatat.');
        } catch (e) { b.disabled = false; }
      }));
    }

    async function muatHadir() {
      try {
        const h = await DB.admin.attendanceOf(evSel.value);
        sudah = Object.fromEntries(h.map(x => [x.user_id, true]));
      } catch (e) { sudah = {}; }
      gambarAnggota();
    }

    evSel.addEventListener('change', muatHadir);
    cari.addEventListener('input', gambarAnggota);
    await muatHadir();
  }

  /* ---------- hapus & moderasi ---------- */
  async function hapus(id, nama) {
    const def = JENIS[aktif];
    if (!confirm(`Hapus ${def.tunggal} "${nama}"?\n\nTindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await DB.admin.remove(aktif, id);
      SGK.toast('Terhapus.');
      await muat();
    } catch (e) {}
  }

  async function ubahStatus(id, status) {
    try {
      await DB.admin.setPrayerStatus(id, status);
      SGK.toast(status === 'published' ? 'Pokok doa diterbitkan.' : 'Pokok doa diarsipkan.');
      await muat();
    } catch (e) {}
  }
})();

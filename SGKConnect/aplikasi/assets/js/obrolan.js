/* ============================================================
   SGKConnect — Obrolan Kelompok
   ------------------------------------------------------------
   Chat di dalam kelompok sel / tim pelayanan. Tidak ada chat
   pribadi: setiap pesan terbaca oleh seluruh anggota kelompok,
   dan pemimpin dapat menghapus pesan yang tidak pantas.
   ============================================================ */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let saya = null, grup = [], aktif = null, lepasLangganan = null, sempit = false;

  function avatarHTML(url, kelas) {
    return url
      ? `<div class="${kelas || 'avatar'}"><img src="${esc(url)}" alt=""
           style="width:100%;height:100%;object-fit:cover"></div>`
      : `<div class="${kelas || 'avatar'}" data-scene="face"></div>`;
  }

  const PERAN = { admin: 'Pengurus', pastor: 'Pendeta', leader: 'Pemimpin' };

  /* ---------- daftar kelompok ---------- */
  function gambarGrup() {
    if (!grup.length) {
      $('daftarGrup').innerHTML = '';
      $('kosong').style.display = 'grid';
      $('pesanKosong').innerHTML =
        'Kamu belum tergabung di kelompok mana pun.<br>' +
        '<a class="ref" href="komunitas.html">Cari kelompok di halaman Komunitas</a>, ' +
        'lalu tunggu persetujuan pemimpin.';
      return;
    }
    $('daftarGrup').innerHTML = grup.map(g => `
      <div class="grup ${aktif && g.id === aktif.id ? 'aktif' : ''}" data-id="${g.id}">
        <div class="th" data-scene="${esc(g.scene || 'fellow')}"></div>
        <div style="flex:1;min-width:0">
          <h4 style="font-size:14px">${esc(g.name)}</h4>
          <p class="small muted">${esc(g.schedule || (g.kind === 'team' ? 'Tim pelayanan' : 'Kelompok sel'))}</p>
        </div>
      </div>`).join('');

    $('daftarGrup').querySelectorAll('.grup').forEach(el =>
      el.addEventListener('click', () => buka(el.dataset.id)));
    SGK.paintScenes();
  }

  /* ---------- buka satu kelompok ---------- */
  async function buka(id) {
    aktif = grup.find(g => g.id === id);
    if (!aktif) return;

    $('kosong').style.display = 'none';
    $('ruang').classList.remove('sembunyi');
    if (sempit) {
      $('daftarGrup').classList.add('sembunyi');
      $('kembaliGrup').style.display = 'grid';
    }

    $('grupNama').textContent = aktif.name;
    $('grupKet').textContent = (aktif.members || 0) + ' anggota' +
      (aktif.schedule ? ' · ' + aktif.schedule : '');
    $('grupFoto').dataset.scene = aktif.scene || 'fellow';
    delete $('grupFoto').dataset.painted;
    SGK.paintScenes();
    gambarGrup();

    await muatPesan();

    if (lepasLangganan) lepasLangganan();
    lepasLangganan = DB.chat.subscribe(id, () => muatPesan(true));

    $('isiPesan').focus();
  }

  /* ---------- pesan ---------- */
  async function muatPesan(diam) {
    let daftar = [];
    try { daftar = await DB.chat.messages(aktif.id, 80); } catch (e) { daftar = []; }

    if (!daftar.length) {
      $('pesan').innerHTML =
        '<p class="small muted" style="text-align:center;margin:auto">' +
        'Belum ada pesan. Mulai percakapannya.</p>';
      return;
    }

    let hariTerakhir = '';
    $('pesan').innerHTML = daftar.map(m => {
      const punyaSaya = m.user_id === saya.id;
      const bolehHapus = punyaSaya || ['admin', 'leader', 'pastor'].includes(saya.role);
      const hari = new Date(m.created_at).toLocaleDateString('id-ID',
        { weekday: 'long', day: 'numeric', month: 'long' });
      let pemisah = '';
      if (hari !== hariTerakhir) { pemisah = `<div class="hari">${hari}</div>`; hariTerakhir = hari; }

      const label = PERAN[m.role] ? ` · ${PERAN[m.role]}` : '';
      return pemisah + `
        <div class="pesan ${punyaSaya ? 'saya' : ''}">
          ${avatarHTML(m.avatar_url)}
          <div style="min-width:0">
            ${punyaSaya ? '' : `<div class="nama">${esc(m.full_name || 'Anggota')}${label}</div>`}
            <div class="gelembung">${esc(m.body)}</div>
            <div class="jam">${esc(m.waktu)}
              ${bolehHapus ? `<button class="hapus-pesan" data-hapus="${m.id}">Hapus</button>` : ''}
            </div>
          </div>
        </div>`;
    }).join('');

    $('pesan').querySelectorAll('[data-hapus]').forEach(b =>
      b.addEventListener('click', async () => {
        if (!confirm('Hapus pesan ini?')) return;
        try {
          await DB.chat.remove(b.dataset.hapus);
          muatPesan(true);
        } catch (e) { /* pesan sudah tampil */ }
      }));

    SGK.paintScenes();
    // gulir ke pesan terbaru
    const w = $('pesan');
    w.scrollTop = w.scrollHeight;
  }

  async function kirim() {
    const teks = $('isiPesan').value.trim();
    if (!teks || !aktif) return;
    $('btnKirim').disabled = true;
    try {
      await DB.chat.send(aktif.id, teks);
      $('isiPesan').value = '';
      $('isiPesan').style.height = 'auto';
      await muatPesan(true);
    } catch (e) {
      SGK.toast(e.message || 'Pesan gagal terkirim.');
    } finally {
      $('btnKirim').disabled = false;
      $('isiPesan').focus();
    }
  }

  /* ---------- mulai ---------- */
  (async function () {
    SGK_I18N.mulai();
    SGK.shell('obrolan.html');

    saya = await DB.auth.guard();
    if (!saya) return;
    SGK.store.set('user', Object.assign(SGK.store.get('user', {}) || {}, {
      name: saya.full_name || 'Anggota',
      role: PERAN[saya.role] || 'Pemuda',
      avatar: saya.avatar_url || null
    }));
    SGK.shell('obrolan.html');
    if (window.SGK_TANDA) SGK_TANDA.mulai('obrolan.html');

    sempit = (window.matchMedia
      ? window.matchMedia('(max-width: 860px)').matches
      : (window.innerWidth || 1024) <= 860);

    try { grup = (await DB.chat.myGroups()) || []; } catch (e) { grup = []; }
    gambarGrup();

    if (grup.length) {
      const id = new URLSearchParams(location.search).get('g');
      buka(id && grup.some(g => g.id === id) ? id : grup[0].id);
    }

    $('btnKirim').addEventListener('click', kirim);

    /* Enter kirim, Shift+Enter baris baru */
    $('isiPesan').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kirim(); }
    });

    /* kotak tulis melar mengikuti isi */
    $('isiPesan').addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 130) + 'px';
    });

    $('kembaliGrup').addEventListener('click', () => {
      $('daftarGrup').classList.remove('sembunyi');
      $('ruang').classList.add('sembunyi');
    });

    window.addEventListener('beforeunload', () => { if (lepasLangganan) lepasLangganan(); });
  })();
})();

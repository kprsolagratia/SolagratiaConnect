/* ============================================================
   SGKConnect — Forum Diskusi
   ============================================================ */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let saya = null, topikAktif = null, semuaTopik = [];

  function avatarHTML(url, ukuran) {
    const gaya = ukuran ? `style="width:${ukuran}px;height:${ukuran}px"` : '';
    return url
      ? `<div class="avatar" ${gaya}><img src="${esc(url)}" alt=""
           style="width:100%;height:100%;object-fit:cover"></div>`
      : `<div class="avatar" ${gaya} data-scene="face"></div>`;
  }

  /* ---------- daftar topik ---------- */
  function gambarDaftar() {
    const cari = $('q').value.toLowerCase().trim();
    const tampil = cari
      ? semuaTopik.filter(t => ((t.title || '') + ' ' + (t.body || '')).toLowerCase().includes(cari))
      : semuaTopik;

    $('daftar').innerHTML = tampil.length ? tampil.map(t => `
      <article class="card topik" data-id="${t.id}">
        <div class="row" style="align-items:flex-start">
          ${avatarHTML(t.avatar, 38)}
          <div style="flex:1;min-width:0">
            <h3 style="font-size:16px">${esc(t.title)}</h3>
            ${t.body ? `<p class="small muted" style="margin-top:5px">
              ${esc(t.body.slice(0, 110))}${t.body.length > 110 ? '…' : ''}</p>` : ''}
            <div class="row wrap" style="gap:8px;margin-top:10px">
              <span class="chip">${esc(t.author)}</span>
              <span class="chip">${SGK.icon('chat', 12)} ${t.replies} balasan</span>
              <span class="small muted">${esc(t.waktu)}</span>
            </div>
          </div>
        </div>
      </article>`).join('')
      : `<div class="card" style="text-align:center;padding:40px 20px">
           <p class="muted">${cari ? 'Tidak ada topik yang cocok.'
             : 'Belum ada topik diskusi. Jadilah yang pertama memulai.'}</p>
         </div>`;

    $('daftar').querySelectorAll('.topik').forEach(el =>
      el.addEventListener('click', () => bukaTopik(el.dataset.id)));
    SGK.paintScenes();
  }

  async function muatDaftar() {
    try { semuaTopik = (await DB.community.topics()) || []; }
    catch (e) { semuaTopik = []; }
    gambarDaftar();
  }

  /* ---------- satu topik ---------- */
  async function bukaTopik(id) {
    topikAktif = id;
    $('layarDaftar').hidden = true;
    $('layarTopik').hidden = false;
    try { window.scrollTo(0, 0); } catch (e) {}

    const t = await DB.community.topicDetail(id);
    if (!t) { kembaliKeDaftar(); return; }

    $('tJudul').textContent = t.title;
    $('tOleh').textContent = t.author;
    $('tWaktu').textContent = t.waktu;
    $('tIsi').textContent = t.body || '';
    $('tAva').outerHTML = avatarHTML(t.avatar, 44).replace('class="avatar"', 'class="avatar" id="tAva"');

    const bolehHapus = saya && (t.user_id === saya.id || ['admin','leader','pastor'].includes(saya.role));
    $('hapusTopik').hidden = !bolehHapus;

    await muatBalasan();
    SGK.paintScenes();
  }

  async function muatBalasan() {
    const daftar = await DB.community.replies(topikAktif);
    $('jmlBalasan').textContent = daftar.length;
    $('balasan').innerHTML = daftar.length ? daftar.map(r => {
      const boleh = saya && (r.user_id === saya.id || ['admin','leader','pastor'].includes(saya.role));
      return `<div class="balasan">
        ${avatarHTML(r.avatar, 34)}
        <div style="flex:1;min-width:0">
          <div class="row-b">
            <b style="font-family:Poppins;font-size:13.5px">${esc(r.author)}</b>
            <span class="small muted">${esc(r.waktu)}</span>
          </div>
          <p style="font-size:14px;line-height:1.7;margin-top:5px">${esc(r.body)}</p>
          ${boleh ? `<button class="small muted" data-hapus-balasan="${r.id}"
            style="margin-top:6px;font-size:11.5px;text-decoration:underline">Hapus</button>` : ''}
        </div></div>`;
    }).join('')
    : '<p class="small muted" style="padding:16px 0">Belum ada balasan. Mulai percakapannya.</p>';

    $('balasan').querySelectorAll('[data-hapus-balasan]').forEach(b =>
      b.addEventListener('click', async () => {
        if (!confirm('Hapus balasan ini?')) return;
        await DB.community.deleteReply(b.dataset.hapusBalasan);
        SGK.toast('Balasan dihapus.');
        muatBalasan();
      }));
    SGK.paintScenes();
  }

  function kembaliKeDaftar() {
    topikAktif = null;
    $('layarTopik').hidden = true;
    $('layarDaftar').hidden = false;
    muatDaftar();
  }

  /* ---------- mulai ---------- */
  (async function () {
    SGK_I18N.mulai();
    SGK.shell('forum.html');

    saya = await DB.auth.guard();
    if (!saya) return;
    SGK.store.set('user', Object.assign(SGK.store.get('user', {}) || {}, {
      name: saya.full_name || 'Anggota',
      role: ({admin:'Pengurus',pastor:'Pendeta',leader:'Pemimpin'})[saya.role] || 'Pemuda',
      avatar: saya.avatar_url || null
    }));
    SGK.shell('forum.html');

    await muatDaftar();

    /* buka topik langsung dari alamat: forum.html?t=<id> */
    const id = new URLSearchParams(location.search).get('t');
    if (id) bukaTopik(id);

    $('q').addEventListener('input', gambarDaftar);
    $('kembali').addEventListener('click', kembaliKeDaftar);

    /* topik baru */
    const tutupBaruModal = () => $('modalBaru').classList.remove('show');
    $('btnBaru').addEventListener('click', () => {
      $('judulBaru').value = ''; $('isiBaru').value = '';
      $('modalBaru').classList.add('show');
      setTimeout(() => $('judulBaru').focus(), 120);
    });
    $('tutupBaru').addEventListener('click', tutupBaruModal);
    $('batalBaru').addEventListener('click', tutupBaruModal);
    $('modalBaru').addEventListener('click', e => { if (e.target === $('modalBaru')) tutupBaruModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') tutupBaruModal(); });

    $('simpanBaru').addEventListener('click', async () => {
      const judul = $('judulBaru').value.trim(), isi = $('isiBaru').value.trim();
      if (!judul) { SGK.toast('Judul topik perlu diisi.'); return; }
      $('simpanBaru').disabled = true; $('simpanBaru').textContent = 'Menerbitkan…';
      try {
        const baru = await DB.community.createTopic(judul, isi);
        tutupBaruModal();
        SGK.toast('Topik diterbitkan.');
        await muatDaftar();
        if (baru && baru.id) bukaTopik(baru.id);
      } catch (e) { /* pesan sudah tampil */ }
      finally { $('simpanBaru').disabled = false; $('simpanBaru').textContent = 'Terbitkan'; }
    });

    /* balasan */
    $('kirimBalasan').addEventListener('click', async () => {
      const isi = $('isiBalasan').value.trim();
      if (!isi) { SGK.toast('Tulis balasanmu dulu.'); return; }
      $('kirimBalasan').disabled = true;
      try {
        await DB.community.reply(topikAktif, isi);
        $('isiBalasan').value = '';
        await muatBalasan();
      } catch (e) { /* pesan sudah tampil */ }
      finally { $('kirimBalasan').disabled = false; }
    });

    $('isiBalasan').addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('kirimBalasan').click();
    });

    $('hapusTopik').addEventListener('click', async () => {
      if (!confirm('Hapus topik ini beserta seluruh balasannya?')) return;
      await DB.community.deleteTopic(topikAktif);
      SGK.toast('Topik dihapus.');
      kembaliKeDaftar();
    });

    /* pembaruan langsung */
    DB.community.subscribeForum(() => {
      if (topikAktif) muatBalasan(); else muatDaftar();
    });
  })();
})();

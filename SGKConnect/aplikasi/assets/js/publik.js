/* ============================================================
   SGKConnect — halaman publik
   ------------------------------------------------------------
   Hanya menampilkan isi yang layak dilihat umum. Tidak ada
   panggilan ke pokok doa, profil anggota, atau kehadiran.
   ============================================================ */
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function tanggal(v) {
    if (!v) return '';
    return new Date(v).toLocaleDateString('id-ID',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function jam(v) {
    if (!v) return '';
    return new Date(v).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  SGK_I18N.mulai();
  $('logo').innerHTML = SGK.logo(38);
  $('logoFoot').innerHTML = SGK.logo(46, 'light');
  SGK.applyTheme(SGK.store.get('theme', 'light'));
  document.querySelectorAll('[data-theme-toggle]').forEach(b =>
    b.addEventListener('click', () => {
      SGK.applyTheme(SGK.store.get('theme', 'light') === 'dark' ? 'light' : 'dark');
    }));
  document.querySelectorAll('[data-icon]').forEach(e =>
    e.innerHTML = SGK.icon(e.dataset.icon, +e.dataset.size || 18));

  (async function () {

    /* ---------- identitas gereja ---------- */
    try {
      const set = await DB.publik.settings();
      if (set) {
        if (set.church_name) {
          $('namaGereja').textContent = set.church_name;
          $('infoGereja').textContent = [set.church_name, set.service_time, set.contact_info]
            .filter(Boolean).join(' · ');
        }
        if (set.hero_title) $('heroJudul').innerHTML = esc(set.hero_title).replace(/,\s*/, ',<br>');
        if (set.tagline) $('heroTag').textContent = set.tagline;
        if (set.hero_image_url) {
          $('heroArt').removeAttribute('data-scene');
          $('heroArt').innerHTML = `<img src="${esc(set.hero_image_url)}" alt=""
            style="width:100%;height:100%;object-fit:cover">`;
        } else if (set.hero_scene) {
          $('heroArt').dataset.scene = set.hero_scene;
        }

        /* renungan + ayat */
        const dev = await DB.publik.devotion();
        $('firman').innerHTML = `
          <article class="card">
            <div class="lab">Renungan hari ini</div>
            <h3 style="margin:10px 0 8px">${esc(dev?.title || 'Belum ada renungan')}</h3>
            <p class="verse">${esc((dev?.body || '').slice(0, 260))}${(dev?.body || '').length > 260 ? '…' : ''}</p>
            <div class="ref" style="margin-top:10px">${esc(dev?.verse_ref || '')}</div>
          </article>
          <article class="card">
            <div class="lab">Ayat minggu ini</div>
            <p class="font-display" style="font-size:16px;font-weight:400;line-height:1.65;margin-top:12px">
              "${esc(set.verse_text || dev?.verse_text || '')}"</p>
            <div class="ref" style="margin-top:10px">${esc(set.verse_ref || dev?.verse_ref || '')}</div>
          </article>`;
      }
    } catch (e) { console.warn(e); }

    /* ---------- kegiatan ---------- */
    try {
      const evs = await DB.publik.events(6);
      $('kegiatan').innerHTML = evs.length ? evs.map(e => `
        <article class="card" style="padding:0;overflow:hidden">
          <div style="height:130px;overflow:hidden"${e.banner_url ? '' : ` data-scene="${esc(e.scene || 'camp')}"`}>
            ${e.banner_url ? `<img src="${esc(e.banner_url)}" alt="${esc(e.title)}" loading="lazy"
              style="width:100%;height:100%;object-fit:cover">` : ''}</div>
          <div style="padding:16px">
            <span class="badge b-gold">${esc(e.category || 'Kegiatan')}</span>
            <h3 style="font-size:16px;margin:10px 0 6px">${esc(e.title)}</h3>
            <p class="small muted">${tanggal(e.starts_at)}${e.starts_at ? ' · ' + jam(e.starts_at) : ''}</p>
            ${e.location ? `<p class="small muted row" style="gap:6px;margin-top:6px">
              ${SGK.icon('pin', 14)}${esc(e.location)}</p>` : ''}
            ${e.map_query || e.location ? `<a class="btn btn-line btn-sm btn-full" style="margin-top:12px"
              target="_blank" rel="noopener"
              href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.map_query || e.location)}">
              Lihat lokasi</a>` : ''}
          </div>
        </article>`).join('')
        : '<p class="muted">Belum ada kegiatan terjadwal.</p>';
    } catch (e) {
      $('kegiatan').innerHTML = '<p class="muted">Jadwal belum bisa dimuat.</p>';
    }

    /* ---------- galeri (hanya foto yang ditandai publik) ---------- */
    try {
      const foto = await DB.publik.gallery(8);
      if (foto.length) {
        $('secGaleri').hidden = false;
        $('galeri').innerHTML = foto.map((f, i) => `
          <a href="${esc(f.image_url)}" target="_blank" rel="noopener" title="${esc(f.title || '')}"
             style="position:relative">
            <img src="${esc(f.image_url)}" alt="${esc(f.title || 'Dokumentasi kegiatan')}" loading="lazy">
            <span data-unduh="${i}" title="Unduh foto"
              style="position:absolute;right:8px;top:8px;width:32px;height:32px;border-radius:10px;
                     background:rgba(255,255,255,.92);display:grid;place-items:center;color:#102A43">
              ${SGK.icon('down', 16)}</span>
          </a>`).join('');

        $('galeri').querySelectorAll('[data-unduh]').forEach(b =>
          b.addEventListener('click', e => {
            e.preventDefault(); e.stopPropagation();
            const f = foto[+b.dataset.unduh];
            const nama = 'sgk-' + (f.title || 'foto').toLowerCase()
              .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) + '.jpg';
            const pisah = f.image_url.includes('?') ? '&' : '?';
            const a = document.createElement('a');
            a.href = /supabase\.co\/storage/.test(f.image_url)
              ? f.image_url + pisah + 'download=' + encodeURIComponent(nama) : f.image_url;
            a.download = nama;
            document.body.appendChild(a); a.click(); a.remove();
          }));
      }
    } catch (e) { /* galeri tertutup — abaikan */ }

    /* ---------- media ---------- */
    try {
      const md = await DB.publik.media(6);
      if (md.length) {
        $('secMedia').hidden = false;
        $('media').innerHTML = md.map(m => `
          <a class="card" href="${esc(m.url)}" target="_blank" rel="noopener" style="display:block">
            <div class="row">
              <div style="width:52px;height:52px;border-radius:13px;overflow:hidden;flex:none"
                ${m.thumb_url ? '' : 'data-scene="mic"'}>
                ${m.thumb_url ? `<img src="${esc(m.thumb_url)}" alt="" style="width:100%;height:100%;object-fit:cover">` : ''}
              </div>
              <div style="flex:1;min-width:0">
                <h4 style="font-size:14px">${esc(m.title)}</h4>
                <p class="small muted">${esc([m.speaker, m.duration].filter(Boolean).join(' · '))}</p>
              </div>
            </div>
          </a>`).join('');
      }
    } catch (e) { /* abaikan */ }

    /* ---------- kelompok ---------- */
    try {
      const gr = await DB.publik.groups();
      $('kelompok').innerHTML = gr.length ? gr.map(g => `
        <article class="card">
          <span class="badge ${g.kind === 'team' ? 'b-navy' : 'b-gold'}">
            ${g.kind === 'team' ? 'Tim pelayanan' : 'Kelompok sel'}</span>
          <h4 style="margin:10px 0 6px">${esc(g.name)}</h4>
          ${g.schedule ? `<p class="small muted">${esc(g.schedule)}</p>` : ''}
          ${g.leader_name ? `<p class="small muted" style="margin-top:4px">Pemimpin: ${esc(g.leader_name)}</p>` : ''}
        </article>`).join('')
        : '<p class="muted">Belum ada kelompok terdaftar.</p>';
    } catch (e) {
      $('kelompok').innerHTML = '<p class="muted">Belum bisa dimuat.</p>';
    }

    /* ---------- pengumuman ---------- */
    try {
      const an = await DB.publik.announcements(5);
      $('pengumuman').innerHTML = an.length ? an.map((a, i) => `
        ${i ? '<div class="hairline"></div>' : ''}
        <div class="row-b wrap">
          <div style="flex:1;min-width:200px">
            <h4 style="font-size:14px">${esc(a.title)}</h4>
            <p class="small muted" style="margin-top:4px">${esc(a.body || '')}</p>
          </div>
          <span class="chip">${esc(a.publish_on)}</span>
        </div>`).join('')
        : '<p class="small muted">Belum ada pengumuman.</p>';
    } catch (e) {
      $('pengumuman').innerHTML = '<p class="small muted">Belum bisa dimuat.</p>';
    }

    SGK.paintScenes();
  })();
})();

/* ============================================================
   SGKConnect — perilaku aplikasi (state disimpan di perangkat)
   ============================================================ */
(function (w) {
  'use strict';
  const S = w.SGK;

  const rsvps = () => S.store.get('rsvp', {});
  const prayed = () => S.store.get('prayed', {});
  const reads = () => S.store.get('reads', {});

  function prayCount(p) { return p.jml + (prayed()[p.id] ? 1 : 0); }

  const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  /** Saat tersambung database, id harus UUID. Id contoh seperti "e1" ditolak. */
  const idSah = id => !w.DB || !w.DB.live || POLA_UUID.test(String(id || ''));
  /** Nomor hari rencana baca: harus angka bulat 1–365. */
  const hariSah = d => { const n = Number(d); return Number.isInteger(n) && n >= 1 && n <= 365; };

  /* --- RSVP --- */
  let rsvpCache = null;
  async function bindRsvp(root) {
    const nodes = [...(root || document).querySelectorAll('[data-rsvp]')].filter(b => !b.dataset.bound);
    if (!nodes.length) return;
    if (rsvpCache === null) { try { rsvpCache = await w.DB.events.myRsvps(); } catch (e) { rsvpCache = {}; } }
    nodes.forEach(btn => {
      btn.dataset.bound = '1';
      const id = btn.dataset.rsvp, label = btn.textContent.trim() || 'RSVP';
      const paint = () => {
        if (!w.document) return;
        const on = !!rsvpCache[id];
        btn.setAttribute('aria-pressed', on);
        btn.innerHTML = on ? S.icon('check', 16) + S.t('beranda.sudahIkut') : label;
      };
      btn.addEventListener('click', async () => {
        if (!idSah(id)) { S.toast('Kegiatan belum termuat. Coba lagi sebentar.'); return; }
        btn.disabled = true;
        try {
          const on = await w.DB.events.toggleRsvp(id);
          rsvpCache[id] = on; paint();
          S.toast(S.t(on ? 'pesan.hadirTercatat' : 'pesan.hadirBatal'));
        } finally { btn.disabled = false; }
      });
      paint();
    });
  }

  /* --- Prayer --- */
  let prayCache = null;
  async function bindPray(root) {
    const nodes = [...(root || document).querySelectorAll('[data-pray]')].filter(b => !b.dataset.bound);
    if (!nodes.length) return;
    if (prayCache === null) { try { prayCache = await w.DB.prayers.mySupports(); } catch (e) { prayCache = {}; } }
    nodes.forEach(btn => {
      btn.dataset.bound = '1';
      const id = btn.dataset.pray;
      const paint = () => {
        if (!w.document) return;
        const on = !!prayCache[id];
        btn.setAttribute('aria-pressed', on);
        btn.innerHTML = on ? S.icon('check', 16) + 'Sedang kamu doakan'
                           : S.icon('pray', 15) + 'Saya mendoakan';
        const c = w.document.querySelector('[data-praycount="' + id + '"]');
        if (c) { const base = +c.dataset.base || 0; c.textContent = (base + (on ? 1 : 0)) + ' orang mendoakan'; }
      };
      btn.addEventListener('click', async () => {
        if (!idSah(id)) { S.toast('Pokok doa belum termuat. Coba lagi sebentar.'); return; }
        btn.disabled = true;
        try {
          const on = await w.DB.prayers.toggleSupport(id);
          prayCache[id] = on; paint();
          if (on) S.toast(S.t('pesan.terimaKasihDoa'));
        } finally { btn.disabled = false; }
      });
      paint();
    });
  }

  /* --- Reading plan --- */
  let readCache = null;
  async function bindRead(root) {
    const nodes = [...(root || document).querySelectorAll('[data-read]')].filter(b => !b.dataset.bound);
    if (!nodes.length) return;
    if (readCache === null) { try { readCache = (await w.DB.bible.myProgress()).map || {}; } catch (e) { readCache = {}; } }
    nodes.forEach(btn => {
      btn.dataset.bound = '1';
      const id = btn.dataset.read;
      const paint = () => {
        if (!w.document) return;
        const on = !!readCache[id];
        btn.setAttribute('aria-pressed', on);
        btn.innerHTML = on ? S.icon('check', 16) + 'Selesai dibaca' : 'Tandai selesai';
      };
      btn.addEventListener('click', async () => {
        if (!hariSah(id)) { S.toast('Bacaan belum termuat. Coba lagi sebentar.'); return; }
        btn.disabled = true;
        try {
          const on = await w.DB.bible.toggleDay(Number(id));
          readCache[id] = on; paint();
          if (on) S.toast(S.t('pesan.bacaanSelesai'));
        } finally { btn.disabled = false; }
      });
      paint();
    });
  }

  /* --- Check-in modal --- */
  function checkin(judul, eventId) {
    if (eventId && idSah(eventId)) w.DB.events.checkIn(eventId).catch(() => {});
    const m = S.modal(`
      <div class="lab">Check-in kehadiran</div>
      <h3 style="margin:8px 0 4px">${judul || 'Kegiatan'}</h3>
      <p class="small muted">Tunjukkan QR ini kepada pengurus di lokasi.</p>
      <div class="qr" id="mQr" style="margin:18px auto"></div>
      <p class="small muted" style="letter-spacing:.14em">${(S.store.get('user',{id:'SGK-2026-00156'}).id) || 'SGK-2026-00156'}</p>
      <button class="btn btn-navy btn-full" style="margin-top:18px" data-close>Tutup</button>`);
    S.qr(m.el.querySelector('#mQr'), judul || 'SGK');
  }

  /* --- Calendar --- */
  function calendar(el, eventDays) {
    const now = new Date(), y = now.getFullYear(), mo = now.getMonth();
    const first = new Date(y, mo, 1).getDay(), total = new Date(y, mo + 1, 0).getDate();
    const head = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
    let html = head.map(d => `<div class="hd">${d}</div>`).join('');
    for (let i = 0; i < first; i++) html += '<div></div>';
    for (let d = 1; d <= total; d++) {
      const cls = d === now.getDate() ? 'now' : (eventDays || []).includes(d) ? 'ev' : '';
      html += `<div class="${cls}">${d}</div>`;
    }
    el.innerHTML = html;
  }

  /* --- Share --- */
  function share(text) {
    if (navigator.share) { navigator.share({ title: 'SGKConnect', text: text }).catch(() => {}); return; }
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => S.toast('Disalin ke papan klip.')).catch(() => S.toast(text)); return; }
    S.toast('Salin manual: ' + text);
  }

  /* --- Search filter --- */
  function filter(inputSel, itemSel) {
    const inp = w.document.querySelector(inputSel); if (!inp) return;
    inp.addEventListener('input', () => {
      const q = inp.value.toLowerCase().trim();
      w.document.querySelectorAll(itemSel).forEach(el => {
        el.style.display = !q || el.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  function bindAll(root) {
    bindRsvp(root); bindPray(root); bindRead(root); S.paintScenes(root);
  }

  /** Keluar dari akun lalu kembali ke halaman masuk. */
  async function logout() { await w.DB.auth.signOut(); location.replace('index.html'); }

  w.document.addEventListener('DOMContentLoaded', () => bindAll());
  w.addEventListener('load', () => bindAll());

  w.App = { prayCount, bindAll, logout, bindRsvp, bindPray, bindRead, checkin, calendar, share, filter, rsvps, prayed, reads };
})(window);

/* ============================================================
   SGKConnect — shared UI runtime
   ============================================================ */
(function (w) {
  'use strict';

  /* ---------- storage (degrades gracefully) ---------- */
  const mem = {};
  const store = {
    get(k, fb) {
      try { const v = localStorage.getItem('sgk:' + k); return v === null ? fb : JSON.parse(v); }
      catch (e) { return k in mem ? mem[k] : fb; }
    },
    set(k, v) {
      mem[k] = v;
      try { localStorage.setItem('sgk:' + k, JSON.stringify(v)); } catch (e) {}
      return v;
    }
  };

  /* ---------- brand mark (aset resmi gereja) ---------- */
  const LOGO_SRC = { dark: 'assets/img/logo-mark.png', light: 'assets/img/logo-mark-light.png' };
  function logo(size, variant) {
    const src = LOGO_SRC[variant === 'light' ? 'light' : 'dark'];
    return `<img src="${src}" width="${size}" height="${size}" alt="Logo SGKConnect"
      style="width:${size}px;height:${size}px;object-fit:contain;flex:none" loading="eager" decoding="async">`;
  }
  function lockup(width) {
    return `<img src="assets/img/logo-lockup.png" alt="Sola Gratia, Koinonia Connect — GKKA-I Jemaat Sendawar"
      style="width:${width}px;max-width:100%;height:auto" decoding="async">`;
  }

  /* ---------- icon set ---------- */
  const P = {
    home:'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
    cal:'M3 8h18M7 3v4M17 3v4M4 5h16v16H4z',
    book:'M3 5h7a2 2 0 0 1 2 2v13a3 3 0 0 0-3-2H3zM21 5h-7a2 2 0 0 0-2 2v13a3 3 0 0 1 3-2h6z',
    pray:'M12 3c-1.2 2.6-2 4.4-3.6 6.2C7 11 6 12.4 6 14.4 6 17.5 8.7 20 12 20s6-2.5 6-5.6c0-2-1-3.4-2.4-5.2C14 7.4 13.2 5.6 12 3z',
    users:'M8 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 8 11zM2 20c0-3.3 2.7-5.2 6-5.2s6 1.9 6 5.2M17 11.5a2.7 2.7 0 1 0 0-5.4M18 20c0-2.7-1-4.2-2.6-5',
    play:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM10 8.5l6 3.5-6 3.5z',
    bell:'M18 15V10a6 6 0 1 0-12 0v5l-2 3h16zM10 21h4',
    chat:'M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-5A8 8 0 1 1 21 12z',
    user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6.4 8-6.4s8 2.4 8 6.4',
    gear:'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM4 12l-1.4-1.2 1.2-2.8 1.8.4a7 7 0 0 1 2-1.2l.6-1.8h3.6l.6 1.8a7 7 0 0 1 2 1.2l1.8-.4 1.2 2.8L20 12l1.4 1.2-1.2 2.8-1.8-.4a7 7 0 0 1-2 1.2l-.6 1.8h-3.6l-.6-1.8a7 7 0 0 1-2-1.2l-1.8.4-1.2-2.8z',
    search:'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    moon:'M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z',
    sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2M12 20v2M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M2 12h2M20 12h2M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5',
    qr:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
    mark:'M7 3h10v18l-5-4-5 4z',
    pin:'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
    plus:'M12 5v14M5 12h14',
    check:'M20 6 9 17l-5-5',
    menu:'M4 7h16M4 12h16M4 17h16',
    x:'M6 6l12 12M18 6L6 18',
    out:'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
    heart:'M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7-.2C19 15.6 12 20 12 20z',
    share:'M12 3v13M8 7l4-4 4 4M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4',
    down:'M12 4v12M8 12l4 4 4-4M5 20h14'
  };
  function icon(k, size, color) {
    if (!P[k]) return '';
    return `<svg width="${size || 18}" height="${size || 18}" viewBox="0 0 24 24" fill="none"
      stroke="${color || 'currentColor'}" stroke-width="1.6" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true"><path d="${P[k]}"/></svg>`;
  }

  /* ---------- illustrated scenes (vector stand-ins for photography) ---------- */
  function person(x, y, s, raise) {
    const arms = raise
      ? `<path d="M${x-7*s} ${y-16*s} L${x-13*s} ${y-34*s}" stroke-width="${5*s}"/><path d="M${x+7*s} ${y-16*s} L${x+13*s} ${y-34*s}" stroke-width="${5*s}"/>`
      : `<path d="M${x-7*s} ${y-15*s} L${x-10*s} ${y-2*s}" stroke-width="${5*s}"/><path d="M${x+7*s} ${y-15*s} L${x+10*s} ${y-2*s}" stroke-width="${5*s}"/>`;
    return `<g stroke="currentColor" stroke-linecap="round" fill="currentColor">
      <circle cx="${x}" cy="${y-27*s}" r="${6*s}"/>
      <path d="M${x} ${y-20*s} L${x} ${y+18*s}" stroke-width="${13*s}" fill="none"/>
      <g fill="none">${arms}</g></g>`;
  }

  const SCENES = {
    worship: g => `<defs><linearGradient id="w${g}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#123A5E"/><stop offset="46%" stop-color="#C97F3B"/>
        <stop offset="72%" stop-color="#F0B860"/><stop offset="100%" stop-color="#8A4E23"/></linearGradient>
        <radialGradient id="s${g}" cx=".62" cy=".7"><stop offset="0%" stop-color="#FFE7AE" stop-opacity=".95"/>
        <stop offset="100%" stop-color="#FFD27A" stop-opacity="0"/></radialGradient></defs>
      <rect width="400" height="240" fill="url(#w${g})"/><circle cx="250" cy="168" r="120" fill="url(#s${g})"/>
      <g color="#0B1A28" opacity=".93">${person(58,236,1.5,1)+person(120,240,1.7,1)+person(196,238,1.6,1)+person(268,242,1.75,1)+person(340,236,1.5,1)}</g>`,
    camp: g => `<defs><linearGradient id="c${g}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1B3A5C"/><stop offset="55%" stop-color="#2E6B72"/><stop offset="100%" stop-color="#123B3F"/></linearGradient></defs>
      <rect width="400" height="240" fill="url(#c${g})"/>
      <path d="M0 150 L90 80 L160 150 Z" fill="#0E2C3E" opacity=".8"/>
      <path d="M120 160 L220 70 L320 160 Z" fill="#0B2433" opacity=".85"/>
      <path d="M260 165 L340 95 L400 165 Z" fill="#0E2C3E" opacity=".7"/>
      <rect y="160" width="400" height="80" fill="#0A1F2B"/>
      <path d="M150 230 L180 175 L210 230 Z" fill="#D4AF37" opacity=".85"/>
      <path d="M225 230 L250 190 L275 230 Z" fill="#E8CD79" opacity=".7"/>
      <circle cx="330" cy="60" r="16" fill="#F4E6B8" opacity=".8"/>`,
    bible: g => `<defs><linearGradient id="b${g}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#3B2A18"/><stop offset="100%" stop-color="#7A5A32"/></linearGradient></defs>
      <rect width="400" height="240" fill="url(#b${g})"/>
      <g transform="translate(200,140)"><path d="M-140 0 Q-70 -34 0 -14 L0 76 Q-70 54 -140 84 Z" fill="#F6F1E6"/>
      <path d="M140 0 Q70 -34 0 -14 L0 76 Q70 54 140 84 Z" fill="#EDE6D8"/>
      <g stroke="#C9BCA4" stroke-width="3">${[0,1,2,3,4,5].map(i=>`<path d="M-124 ${8+i*12} Q-70 ${-14+i*12} -14 ${-2+i*12}"/><path d="M124 ${8+i*12} Q70 ${-14+i*12} 14 ${-2+i*12}"/>`).join('')}</g></g>
      <circle cx="200" cy="46" r="52" fill="#FFD98A" opacity=".22"/>`,
    pray: g => `<defs><radialGradient id="p${g}" cx=".5" cy=".35">
        <stop offset="0%" stop-color="#FFD98A" stop-opacity=".55"/><stop offset="100%" stop-color="#0B1E33" stop-opacity="0"/></radialGradient></defs>
      <rect width="400" height="240" fill="#0C2033"/><rect width="400" height="240" fill="url(#p${g})"/>
      <g fill="none" stroke="#E3C173" stroke-width="9" stroke-linecap="round">
        <path d="M175 210 L175 118 Q175 92 192 84"/><path d="M196 212 L196 112 Q196 84 214 78"/>
        <path d="M225 212 L225 118 Q225 92 208 84"/><path d="M204 214 L204 112 Q204 84 186 78"/></g>
      <ellipse cx="200" cy="222" rx="70" ry="12" fill="#D4AF37" opacity=".18"/>`,
    fellow: g => `<defs><linearGradient id="f${g}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#D9A94A"/><stop offset="100%" stop-color="#8A5C24"/></linearGradient></defs>
      <rect width="400" height="240" fill="url(#f${g})"/><circle cx="120" cy="70" r="90" fill="#F3D28C" opacity=".28"/>
      <g color="#22140A" opacity=".9">${person(70,240,1.5,0)+person(140,244,1.7,0)+person(215,240,1.6,0)+person(288,246,1.75,0)+person(355,240,1.5,0)}</g>`,
    music: g => `<rect width="400" height="240" fill="#10243B"/><circle cx="300" cy="60" r="80" fill="#D4AF37" opacity=".18"/>
      <g stroke="#E8CD79" stroke-width="7" fill="none" stroke-linecap="round">
        <circle cx="150" cy="180" r="24" fill="#E8CD79" stroke="none"/><path d="M172 178 L172 76 L268 56 L268 150"/>
        <circle cx="246" cy="152" r="24" fill="#E8CD79" stroke="none"/></g>`,
    mic: g => `<rect width="400" height="240" fill="#132E4A"/><circle cx="200" cy="120" r="96" fill="#D4AF37" opacity=".2"/>
      <g stroke="#E8CD79" stroke-width="12" fill="none" stroke-linecap="round">
        <rect x="168" y="42" width="64" height="102" rx="32" fill="#E8CD79" stroke="none"/>
        <path d="M132 122 a68 68 0 0 0 136 0"/><path d="M200 190 L200 216"/></g>`,
    map: g => `<rect width="400" height="240" fill="#EEF2F7"/>
      <g stroke="#D8E0EA" stroke-width="10">${[0,1,2,3,4,5].map(i=>`<path d="M0 ${30+i*42} H400"/>`).join('')}${[0,1,2,3,4,5,6,7].map(i=>`<path d="M${28+i*52} 0 V240"/>`).join('')}</g>
      <path d="M0 168 Q120 150 200 176 T400 150" stroke="#C3D0DE" stroke-width="18" fill="none"/>
      <path d="M60 210 Q150 120 250 96 T360 60" stroke="#D4AF37" stroke-width="7" fill="none" stroke-dasharray="14 10"/>
      <g transform="translate(250,86)"><path d="M0 26 C-20 4 -20 -18 0 -18 C20 -18 20 4 0 26Z" fill="#102A43"/><circle cy="-4" r="6" fill="#fff"/></g>`,
    face: g => `<rect width="400" height="240" fill="#2C5177"/><circle cx="200" cy="96" r="54" fill="#E8C9A5"/>
      <path d="M96 244 q104 -84 208 0Z" fill="#D4AF37"/><path d="M152 74 q48 -40 96 0 q4 -46 -48 -46 q-52 0 -48 46Z" fill="#2A1D12"/>`,
    face2: g => `<rect width="400" height="240" fill="#7E5D2E"/><circle cx="200" cy="96" r="54" fill="#F0D4B4"/>
      <path d="M96 244 q104 -84 208 0Z" fill="#102A43"/><path d="M146 82 q54 -52 108 0 q6 -54 -54 -54 q-60 0 -54 54Z" fill="#3B2A16"/>`,
    face3: g => `<rect width="400" height="240" fill="#3F6B4F"/><circle cx="200" cy="96" r="54" fill="#DFB58C"/>
      <path d="M96 244 q104 -84 208 0Z" fill="#E8CD79"/><path d="M144 88 q56 -58 112 0 q10 -60 -56 -60 q-66 0 -56 60Z" fill="#241809"/>`
  };
  let gid = 0;
  function paintScenes(root) {
    (root || document).querySelectorAll('[data-scene]').forEach(el => {
      if (el.dataset.painted) return;
      const fn = SCENES[el.dataset.scene]; if (!fn) return;
      gid++; el.dataset.painted = '1';
      el.innerHTML = `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${fn(gid)}</svg><div class="grain"></div>`;
    });
  }

  /* ---------- QR (visual placeholder pattern) ---------- */
  function qr(el, seed) {
    const N = 21, s = (seed || 'SGK').split('').reduce((a, c) => a + c.charCodeAt(0), 0), out = [];
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const inFinder = (r < 7 && c < 7) || (r < 7 && c >= N - 7) || (r >= N - 7 && c < 7);
      let on;
      if (inFinder) {
        const rr = r < 7 ? r : r - (N - 7), cc = c < 7 ? c : c - (N - 7);
        on = (rr === 0 || rr === 6 || cc === 0 || cc === 6) || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
      } else { on = ((r * 7 + c * 13 + s + (r * c) % 5) % 3 === 0); }
      out.push(`<i class="${on ? 'on' : ''}"></i>`);
    }
    el.innerHTML = out.join('');
  }

  /* ---------- feedback ---------- */
  let toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role','status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }
  function modal(html) {
    const m = document.createElement('div');
    m.className = 'modal'; m.innerHTML = `<div class="box">${html}</div>`;
    document.body.appendChild(m); requestAnimationFrame(() => m.classList.add('show'));
    const close = () => { m.classList.remove('show'); setTimeout(() => m.remove(), 260); };
    m.addEventListener('click', e => { if (e.target === m || e.target.dataset.close !== undefined) close(); });
    document.addEventListener('keydown', function esc(e){ if(e.key==='Escape'){ close(); document.removeEventListener('keydown', esc);} });
    paintScenes(m);
    return { el: m, close };
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    store.set('theme', t);
    document.querySelectorAll('[data-theme-toggle]').forEach(b => b.innerHTML = icon(t === 'dark' ? 'sun' : 'moon', 18));
  }
  function toggleTheme() { applyTheme(store.get('theme', 'light') === 'dark' ? 'light' : 'dark'); }

  /* ---------- app shell ---------- */
  const t = (k, d) => (w.SGK_I18N ? w.SGK_I18N.t(k, d) : (d || k));
  const NAV = [
    ['beranda.html', 'home', 'nav.beranda'],
    ['kegiatan.html', 'cal', 'nav.kegiatan'],
    ['alkitab.html', 'book', 'nav.alkitab'],
    ['doa.html', 'pray', 'nav.doa'],
    ['komunitas.html', 'users', 'nav.komunitas'],
    ['galeri.html', 'play', 'nav.galeri'],
    ['profil.html', 'user', 'nav.profil']
  ];
  const NAV_EXTRA = [
    ['admin.html', 'chart', 'nav.admin'],
    ['kelola.html', 'plus', 'nav.kelola']
  ];

  function shell(current) {
    // store.get bisa mengembalikan null (mis. sesaat setelah keluar akun),
    // jadi nilai bawaan harus dipasang setelahnya, bukan lewat argumen.
    let user = store.get('user', null);
    if (!user || typeof user !== 'object') user = { name: 'Anggota', role: 'Pemuda' };
    const foto = user.avatar || null;
    const side = document.querySelector('.sidebar');
    if (side) {
      side.innerHTML = `
        <a class="brand" href="beranda.html">${logo(40, 'light')}
          <span class="brand-txt"><b>SGKConnect</b><span>Jemaat Sendawar</span></span></a>
        ${NAV.map(([h, i, l]) => `<a class="nav-i ${h === current ? 'on' : ''}" href="${h}">${icon(i, 18)}${t(l)}</a>`).join('')}
        <div class="nav-sep"></div>
        ${NAV_EXTRA.map(([h, i, l]) => `<a class="nav-i ${h === current ? 'on' : ''}" href="${h}">${icon(i, 18)}${t(l)}</a>`).join('')}
        <a class="nav-i" href="index.html" data-logout>${icon('out', 18)}${t('nav.keluar')}</a>
        <div class="side-user">
          <div class="avatar"${foto ? '' : ' data-scene="face"'}>${foto
            ? `<img src="${foto}" alt="" style="width:100%;height:100%;object-fit:cover">` : ''}</div>
          <div><b>${user.name}</b><span>${user.role}</span></div>
        </div>`;
    }
    const mob = document.querySelector('.mobile-nav');
    if (mob) mob.innerHTML = NAV.map(([h, i, l]) =>
      `<a href="${h}" class="${h === current ? 'on' : ''}">${icon(i, 20)}<span>${t(l)}</span></a>`).join('');

    document.querySelectorAll('[data-icon]').forEach(e => { if (!e.innerHTML.trim()) e.innerHTML = icon(e.dataset.icon, +e.dataset.size || 18); });
    applyTheme(store.get('theme', 'light'));
    if (w.SGK_I18N) w.SGK_I18N.terapkan();
    document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme));

    /* mobile drawer */
    const burger = document.querySelector('.burger');
    if (burger && side) {
      const scrim = document.createElement('div'); scrim.className = 'scrim'; document.body.appendChild(scrim);
      const close = () => { side.classList.remove('open'); scrim.classList.remove('show'); };
      burger.addEventListener('click', () => { side.classList.add('open'); scrim.classList.add('show'); });
      scrim.addEventListener('click', close);
      side.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    }
    /* Pramuat halaman tujuan begitu kursor menyentuh menu —
       saat diklik, berkasnya sudah siap. */
    const sudah = new Set();
    const pramuat = href => {
      if (!href || sudah.has(href) || href.startsWith('http')) return;
      sudah.add(href);
      const l = document.createElement('link');
      l.rel = 'prefetch'; l.href = href;
      document.head.appendChild(l);
    };
    document.querySelectorAll('.nav-i, .mobile-nav a, .quick a').forEach(a => {
      const href = a.getAttribute('href');
      a.addEventListener('mouseenter', () => pramuat(href), { once: true });
      a.addEventListener('touchstart', () => pramuat(href), { once: true, passive: true });
    });

    document.querySelectorAll('[data-logout]').forEach(a => {
      if (a.dataset.bound) return; a.dataset.bound = '1';
      a.addEventListener('click', e => {
        e.preventDefault();
        if (w.App && w.App.logout) w.App.logout(); else location.href = 'index.html';
      });
    });
    if (foto) {
      document.querySelectorAll('.topbar .avatar').forEach(a => {
        a.removeAttribute('data-scene');
        a.innerHTML = `<img src="${foto}" alt="" style="width:100%;height:100%;object-fit:cover">`;
      });
    }
    paintScenes();
  }

  /* ---------- countdown ---------- */
  function countdown(el, iso) {
    const t = new Date(iso).getTime();
    const tick = () => {
      let d = Math.max(0, t - Date.now());
      const day = Math.floor(d / 864e5), hr = Math.floor(d / 36e5) % 24, mi = Math.floor(d / 6e4) % 60;
      el.innerHTML = `<div><b>${day}</b><span>Hari</span></div><div><b>${hr}</b><span>Jam</span></div><div><b>${mi}</b><span>Menit</span></div>`;
    };
    tick(); setInterval(tick, 30000);
  }

  /* ---------- charts ---------- */
  function lineChart(el, vals, labels) {
    labels = labels || [];
    const W = 320, H = 130;
    if (!vals || !vals.length) {
      el.innerHTML = '<p style="font-size:12px;color:#6B7C93;padding:24px 0;text-align:center">Belum ada data.</p>';
      return;
    }
    const puncak = Math.max.apply(null, vals);
    if (puncak <= 0) {
      el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Belum ada data">
        ${[0,1,2,3].map(i => `<line x1="12" x2="${W-12}" y1="${20+i*26}" y2="${20+i*26}" stroke="rgba(107,124,147,.18)"/>`).join('')}
        <line x1="20" x2="${W-20}" y1="${H-20}" y2="${H-20}" stroke="rgba(107,124,147,.4)" stroke-dasharray="4 4"/>
        <text x="${W/2}" y="${H/2}" text-anchor="middle" font-size="11" fill="#6B7C93"
          font-family="Inter">Belum ada kehadiran tercatat</text>
        ${labels.map((m,i) => `<text x="${20+i*(W-40)/Math.max(1,labels.length-1)}" y="${H-4}"
          font-size="8" fill="#6B7C93" text-anchor="middle" font-family="Inter">${m}</text>`).join('')}
      </svg>`;
      return;
    }
    const max = puncak * 1.15;
    const langkah = vals.length > 1 ? (W - 40) / (vals.length - 1) : 0;
    const pts = vals.map((v, i) => [
      vals.length > 1 ? 20 + i * langkah : W / 2,
      H - 20 - (v / max) * (H - 42)
    ]);
    const line = pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Grafik kehadiran">
      <defs><linearGradient id="lg${gid++}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#D4AF37" stop-opacity=".38"/><stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/></linearGradient></defs>
      ${[0,1,2,3].map(i => `<line x1="12" x2="${W-12}" y1="${20+i*26}" y2="${20+i*26}" stroke="rgba(107,124,147,.18)"/>`).join('')}
      <polygon points="${line} ${pts[pts.length-1][0]},${H-20} ${pts[0][0]},${H-20}" fill="url(#lg${gid-1})"/>
      <polyline points="${line}" fill="none" stroke="#D4AF37" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
      ${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="#fff" stroke="#102A43" stroke-width="2"/>`).join('')}
      ${labels.map((m, i) => pts[i] ? `<text x="${pts[i][0]}" y="${H-4}" font-size="8" fill="#6B7C93" text-anchor="middle" font-family="Inter">${m}</text>` : '').join('')}
    </svg>`;
  }
  function donut(el, segs, center, sub) {
    if (!segs || !segs.length || segs.every(s => !s[0])) segs = [[100, '#E4EAF1']];
    let off = 0;
    el.innerHTML = `<svg width="120" height="120" viewBox="0 0 42 42" role="img" aria-label="Sebaran kelompok">
      ${segs.map(s => { const c = `<circle cx="21" cy="21" r="15.9" fill="none" stroke="${s[1]}" stroke-width="7"
        stroke-dasharray="${s[0]} ${100 - s[0]}" stroke-dashoffset="${25 - off}"/>`; off += s[0]; return c; }).join('')}
      <text x="21" y="22" text-anchor="middle" font-size="6" font-family="Poppins" font-weight="600" fill="#D4AF37">${center}</text>
      <text x="21" y="26.4" text-anchor="middle" font-size="2.6" font-family="Inter" fill="#6B7C93">${sub}</text></svg>`;
  }
  function bars(el, data) {
    if (!data || !data.length) {
      el.innerHTML = '<p style="font-size:12px;color:#6B7C93">Belum ada data.</p>';
      return;
    }
    const puncak = Math.max.apply(null, data.map(d => d[1]));
    const max = puncak > 0 ? puncak * 1.1 : 1;
    el.innerHTML = data.map(d => `<div style="margin-bottom:10px">
      <div class="row-b small"><span>${d[0]}</span><b>${d[1]}</b></div>
      <div class="prog"><i style="width:${(d[1] / max * 100).toFixed(0)}%"></i></div></div>`).join('');
  }

  w.SGK = { store, t, logo, lockup, icon, paintScenes, qr, toast, modal, shell, countdown, lineChart, donut, bars, applyTheme, SCENES };
})(window);

/* ============================================================
   Service worker — dengan pembaruan otomatis.
   Tanpa ini, versi lama bisa tersangkut di peramban dan
   perbaikan terbaru tidak pernah terlihat.
   ============================================================ */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
      // paksa cek versi baru setiap kali halaman dibuka
      reg.update();
      // dan periksa lagi tiap 60 detik selama halaman terbuka
      setInterval(() => reg.update(), 60000);

      reg.addEventListener('updatefound', () => {
        const baru = reg.installing;
        if (!baru) return;
        baru.addEventListener('statechange', () => {
          if (baru.state === 'installed' && navigator.serviceWorker.controller) {
            baru.postMessage('lewati-tunggu');
          }
        });
      });

      let sudahMuatUlang = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (sudahMuatUlang) return;
        sudahMuatUlang = true;
        location.reload();
      });
    } catch (e) { /* offline atau tidak didukung — abaikan */ }
  });
}

/** Bersihkan seluruh cache dan daftar ulang. Panggil dari konsol: SGK_RESET() */
window.SGK_RESET = async function () {
  if ('serviceWorker' in navigator) {
    const semua = await navigator.serviceWorker.getRegistrations();
    await Promise.all(semua.map(r => r.unregister()));
  }
  if (window.caches) {
    const kunci = await caches.keys();
    await Promise.all(kunci.map(k => caches.delete(k)));
  }
  location.reload(true);
};

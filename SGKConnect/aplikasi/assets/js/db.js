/* ============================================================
   SGKConnect — lapisan data (Supabase + fallback mode demo)
   ------------------------------------------------------------
   Semua halaman memanggil DB.*, bukan Supabase langsung.
   Kalau kredensial belum diisi, DB otomatis memakai data contoh
   dan menyimpan aksi pengguna di perangkat (localStorage).
   ============================================================ */
(function (w) {
  'use strict';

  const CFG = w.SGK_CONFIG || {};
  const LIVE = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
  let sb = null;

  if (LIVE && w.supabase && w.supabase.createClient) {
    sb = w.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  const mode = sb ? 'live' : 'demo';
  const store = (w.SGK && w.SGK.store) || {
    get: (k, fb) => { try { const v = localStorage.getItem('sgk:' + k); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; } },
    set: (k, v) => { try { localStorage.setItem('sgk:' + k, JSON.stringify(v)); } catch (e) {} return v; }
  };

  /* ---------- singgahan sesi & profil ----------
     getUser() selalu menembak jaringan. Dipanggil belasan kali per
     halaman, itu jadi belasan perjalanan bolak-balik ke Singapura.
     getSession() membaca dari perangkat — seketika.               */
  let _user = null, _profil = null, _profilWaktu = 0;

  async function pengguna() {
    if (_user) return _user;
    if (!sb) return null;
    const { data } = await sb.auth.getSession();     // lokal, tanpa jaringan
    _user = data.session ? data.session.user : null;
    return _user;
  }

  if (sb) {
    sb.auth.onAuthStateChange((_e, sesi) => {
      _user = sesi ? sesi.user : null;
      _profil = null;                                 // profil ikut disegarkan
    });
  }

  /* ---------- util ---------- */
  function fail(e) {
    console.error('[SGKConnect]', e);
    const msg = (e && (e.message || e.error_description)) || 'Terjadi kesalahan.';
    if (w.SGK && w.SGK.toast) w.SGK.toast(terjemahkan(msg));
    throw e;
  }
  function terjemahkan(m) {
    const peta = {
      'Invalid login credentials': 'Email atau kata sandi salah.',
      'Email not confirmed': 'Email belum dikonfirmasi. Periksa kotak masuk Anda.',
      'User already registered': 'Email ini sudah terdaftar. Silakan masuk.',
      'Password should be at least 6 characters': 'Kata sandi minimal 6 karakter.',
      'Failed to fetch': 'Tidak dapat terhubung. Periksa koneksi internet.'
    };
    if (peta[m]) return peta[m];
    // pesan teknis dari database diubah jadi kalimat yang bisa dipahami
    if (/invalid input syntax for type uuid/i.test(m))
      return 'Data belum termuat sepenuhnya. Muat ulang halaman, lalu coba lagi.';
    if (/violates row-level security|permission denied/i.test(m))
      return 'Kamu belum punya akses untuk tindakan ini.';
    if (/duplicate key|already exists/i.test(m))
      return 'Data ini sudah ada sebelumnya.';
    if (/violates foreign key/i.test(m))
      return 'Data yang dituju tidak ditemukan. Mungkin sudah dihapus.';
    if (/JWT|token/i.test(m))
      return 'Sesi berakhir. Silakan masuk kembali.';
    return m;
  }
  const D = () => w.DATA || {};

  /* ---------- AUTENTIKASI ---------- */
  const auth = {
    live: !!sb,

    async session() {
      if (!sb) return store.get('user', null);
      const { data } = await sb.auth.getSession();
      _user = data.session ? data.session.user : null;
      return data.session || null;
    },

    async me() {
      if (!sb) {
        const u = store.get('user', null);
        if (!u || typeof u !== 'object') return null;
        return {
          id: 'demo',
          role: 'admin',                    // mode demo: semua halaman terbuka
          full_name: u.name || 'Pengunjung',
          member_no: 'SGK-DEMO-0001'
        };
      }
      const user = await pengguna();
      if (!user) return null;
      const { data, error } = await sb.from('profiles').select('*').eq('id', user.id).single();
      if (error) return { id: user.id, full_name: user.email, role: 'member' };
      return data;
    },

    async signIn(email, password) {
      if (!sb) {
        // Mode demo: tidak ada pemeriksaan sandi. Nama diambil dari email
        // supaya tidak memakai identitas orang lain.
        const nama = String(email || 'pengunjung').split('@')[0]
          .replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        store.set('user', { name: nama, role: 'Pemuda' });
        return { demo: true };
      }
      store.set('user', { name: 'Anggota', role: 'Pemuda' });  // identitas lama dibuang
      _user = null; _profil = null;
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) fail(error);
      return data;
    },

    async signUp(email, password, fullName) {
      if (!sb) { store.set('user', { name: fullName || 'Pengunjung', role: 'Pemuda' }); return { demo: true }; }
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { full_name: fullName }, emailRedirectTo: location.origin + '/beranda.html' }
      });
      if (error) fail(error);
      return data;
    },

    async resetPassword(email) {
      if (!sb) { w.SGK?.toast('Mode demo: email pemulihan tidak dikirim.'); return; }
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/index.html' });
      if (error) fail(error);
    },

    async signOut() {
      if (sb) await sb.auth.signOut();
      _user = null; _profil = null;
      store.set('user', { name: 'Anggota', role: 'Pemuda' });
    },

    /**
     * Panggil di setiap halaman terlindungi.
     * Mode tersambung : belum masuk → dilempar ke halaman login.
     * Mode demo       : otomatis dibuatkan sesi tamu, supaya aplikasi
     *                   tetap bisa ditelusuri tanpa database.
     */
    async guard() {
      try {
        if (!sb) {
          if (!store.get('user', null)) {
            store.set('user', { name: 'Pengunjung', role: 'Pemuda' });
          }
          return auth.me();
        }
        const s = await auth.session();
        if (!s) { location.replace('index.html'); return null; }
        const profil = await auth.me();
        // sesi ada tapi profil belum terbaca (mis. jaringan lambat):
        // jangan hentikan halaman, pakai data seadanya dulu
        return profil || { id: s.user && s.user.id, full_name: 'Anggota', role: 'member' };
      } catch (e) {
        console.error('[SGKConnect] guard:', e);
        w.SGK && w.SGK.toast && w.SGK.toast(
          'Gagal memuat data akun. Periksa koneksi, lalu muat ulang halaman.');
        return null;
      }
    }
  };

  /* ---------- KEGIATAN ---------- */
  const events = {
    async list() {
      if (!sb) return (D().kegiatan || []).map(e => ({
        id: e.id, title: e.judul, category: e.kategori, starts_at: e.tgl, date_text: e.tglTeks,
        location: e.lokasi, capacity: e.kuota, going: e.terdaftar, scene: e.scene
      }));
      const { data, error } = await sb.from('event_stats').select('*').order('starts_at');
      if (error) fail(error);
      const { data: ev } = await sb.from('events').select('id,category,location,map_query,scene,description,banner_url');
      const meta = Object.fromEntries((ev || []).map(x => [x.id, x]));
      return (data || []).map(e => Object.assign({}, e, meta[e.id] || {}));
    },

    async myRsvps() {
      if (!sb) return store.get('rsvp', {});
      const user = await pengguna();
      if (!user) return {};
      const { data } = await sb.from('rsvps').select('event_id,status').eq('user_id', user.id);
      return Object.fromEntries((data || []).filter(r => r.status === 'going').map(r => [r.event_id, true]));
    },

    async toggleRsvp(eventId) {
      if (!sb) { const r = store.get('rsvp', {}); r[eventId] = !r[eventId]; store.set('rsvp', r); return r[eventId]; }
      const user = await pengguna();
      const { data: ada } = await sb.from('rsvps').select('event_id').eq('event_id', eventId).eq('user_id', user.id).maybeSingle();
      if (ada) { const { error } = await sb.from('rsvps').delete().eq('event_id', eventId).eq('user_id', user.id); if (error) fail(error); return false; }
      const { error } = await sb.from('rsvps').insert({ event_id: eventId, user_id: user.id, status: 'going' });
      if (error) fail(error);
      return true;
    },

    async checkIn(eventId) {
      if (!sb) return { demo: true };
      const user = await pengguna();
      const { error } = await sb.from('attendance')
        .upsert({ event_id: eventId, user_id: user.id, method: 'qr' }, { onConflict: 'event_id,user_id' });
      if (error) fail(error);
      return { ok: true };
    },

    async myAttendance() {
      if (!sb) return D().riwayatHadir || [];
      const user = await pengguna();
      const { data, error } = await sb.from('attendance')
        .select('checked_in_at, events(title, starts_at)').eq('user_id', user.id)
        .order('checked_in_at', { ascending: false }).limit(20);
      if (error) fail(error);
      return (data || []).map(a => ({
        judul: a.events?.title || 'Kegiatan', status: 'Hadir',
        tgl: new Date(a.checked_in_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      }));
    }
  };

  /* ---------- POKOK DOA ---------- */
  const prayers = {
    async list() {
      if (!sb) {
        const extra = store.get('myPrayers', []);
        return extra.concat(D().doa || []).map(p => ({
          id: p.id, title: p.judul, body: p.isi, is_anon: p.anonim,
          supports: p.jml, author: p.oleh, waktu: p.waktu
        }));
      }
      const { data, error } = await sb.from('prayer_stats').select('*')
        .eq('status', 'published').order('created_at', { ascending: false }).limit(60);
      if (error) fail(error);
      const ids = [...new Set((data || []).filter(p => !p.is_anon && p.user_id).map(p => p.user_id))];
      let nama = {};
      if (ids.length) {
        const { data: prof } = await sb.from('profiles').select('id,full_name').in('id', ids);
        nama = Object.fromEntries((prof || []).map(p => [p.id, p.full_name]));
      }
      return (data || []).map(p => Object.assign({}, p, {
        author: p.is_anon ? 'Anonim' : (nama[p.user_id] || 'Anggota'),
        waktu: waktuRelatif(p.created_at)
      }));
    },

    async mySupports() {
      if (!sb) return store.get('prayed', {});
      const user = await pengguna();
      if (!user) return {};
      const { data } = await sb.from('prayer_supports').select('prayer_id').eq('user_id', user.id);
      return Object.fromEntries((data || []).map(r => [r.prayer_id, true]));
    },

    async toggleSupport(prayerId) {
      if (!sb) { const p = store.get('prayed', {}); p[prayerId] = !p[prayerId]; store.set('prayed', p); return p[prayerId]; }
      const user = await pengguna();
      const { data: ada } = await sb.from('prayer_supports').select('prayer_id')
        .eq('prayer_id', prayerId).eq('user_id', user.id).maybeSingle();
      if (ada) { await sb.from('prayer_supports').delete().eq('prayer_id', prayerId).eq('user_id', user.id); return false; }
      const { error } = await sb.from('prayer_supports').insert({ prayer_id: prayerId, user_id: user.id });
      if (error) fail(error);
      return true;
    },

    async create(title, body, isAnon) {
      if (!sb) {
        const p = { id: 'u' + Date.now(), judul: title, isi: body, anonim: !!isAnon, jml: 0, waktu: 'baru saja', oleh: 'Saya' };
        store.set('myPrayers', [p].concat(store.get('myPrayers', [])));
        return p;
      }
      const user = await pengguna();
      const { data, error } = await sb.from('prayers')
        .insert({ user_id: user.id, title, body, is_anon: !!isAnon }).select().single();
      if (error) fail(error);
      return data;
    },

    async addNote(prayerId, body) {
      if (!sb) return { demo: true };
      const user = await pengguna();
      const { error } = await sb.from('prayer_notes').insert({ prayer_id: prayerId, user_id: user.id, body });
      if (error) fail(error);
      return { ok: true };
    },

    /** Perubahan langsung (realtime) pada dinding doa. */
    subscribe(cb) {
      if (!sb) return () => {};
      const ch = sb.channel('doa')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'prayers' }, cb)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'prayer_supports' }, cb)
        .subscribe();
      return () => sb.removeChannel(ch);
    }
  };

  /* ---------- FIRMAN ---------- */
  const bible = {
    async devotionToday() {
      if (!sb) {
        const r = D().renungan || {};
        return { title: r.judul, verse_ref: r.ayat, verse_text: r.kutipan, body: r.isi, author: r.penulis };
      }
      const hari = new Date().toISOString().slice(0, 10);
      const { data } = await sb.from('devotions').select('*').lte('publish_on', hari)
        .order('publish_on', { ascending: false }).limit(1).maybeSingle();
      return data;
    },

    async plan(limit) {
      if (!sb) return (D().bacaan || []).map(b => ({ day: b.hari, passage: b.kitab, snippet: b.teks }));
      const { data } = await sb.from('reading_plan').select('*').order('day').limit(limit || 3);
      return data || [];
    },

    async myProgress() {
      if (!sb) return { done: Object.values(store.get('reads', {})).filter(Boolean).length, total: 365, map: store.get('reads', {}) };
      const user = await pengguna();
      const { count } = await sb.from('reading_progress').select('day', { count: 'exact', head: true }).eq('user_id', user.id);
      const { data } = await sb.from('reading_progress').select('day').eq('user_id', user.id);
      return { done: count || 0, total: 365, map: Object.fromEntries((data || []).map(r => [r.day, true])) };
    },

    async toggleDay(day) {
      if (!sb) { const r = store.get('reads', {}); r[day] = !r[day]; store.set('reads', r); return r[day]; }
      const user = await pengguna();
      const { data: ada } = await sb.from('reading_progress').select('day')
        .eq('user_id', user.id).eq('day', day).maybeSingle();
      if (ada) { await sb.from('reading_progress').delete().eq('user_id', user.id).eq('day', day); return false; }
      const { error } = await sb.from('reading_progress').insert({ user_id: user.id, day });
      if (error) fail(error);
      return true;
    }
  };

  /* ---------- KOMUNITAS ---------- */
  const community = {
    async groups(kind) {
      if (!sb) {
        const src = kind === 'team' ? (D().tim || []) : (D().kelompok || []);
        return src.map((g, i) => ({
          id: 'g' + i, name: g.nama, leader_name: g.pemimpin || null,
          schedule: g.jadwal || g.ket, members: g.anggota || 0, scene: g.scene, kind: kind || 'cell'
        }));
      }
      let q = sb.from('group_stats').select('*').order('name');
      if (kind) q = q.eq('kind', kind);
      const { data, error } = await q;
      if (error) fail(error);
      return data || [];
    },

    async join(groupId) {
      if (!sb) return { demo: true };
      const user = await pengguna();
      const { error } = await sb.from('group_members')
        .upsert({ group_id: groupId, user_id: user.id, status: 'pending' }, { onConflict: 'group_id,user_id' });
      if (error) fail(error);
      return { ok: true };
    },

    async topics() {
      if (!sb) return (D().forum || []).map((f, i) => ({ id: 't' + i, title: f.judul, author: f.oleh, replies: f.balasan, waktu: f.waktu }));
      const { data, error } = await sb.from('forum_topics')
        .select('id,title,body,created_at,user_id,profiles(full_name,avatar_url),forum_replies(count)')
        .order('created_at', { ascending: false }).limit(40);
      if (error) fail(error);
      return (data || []).map(t => ({
        id: t.id, title: t.title, body: t.body, user_id: t.user_id,
        author: t.profiles?.full_name || 'Anggota',
        avatar: t.profiles?.avatar_url || null,
        replies: t.forum_replies?.[0]?.count || 0, waktu: waktuRelatif(t.created_at)
      }));
    },

    async gallery(limit) {
      if (!sb) return [];
      const { data } = await sb.from('gallery').select('*')
        .order('taken_on', { ascending: false }).limit(limit || 24);
      return data || [];
    },

    async media(kind, limit) {
      if (!sb) return (D().podcast || []).map((p, i) => ({
        id: 'm' + i, kind: 'podcast', title: p.judul, description: p.ket, duration: p.durasi, url: '#' }));
      let q = sb.from('media').select('*').order('publish_on', { ascending: false }).limit(limit || 12);
      if (kind) q = q.eq('kind', kind);
      const { data } = await q;
      return data || [];
    },

    async settings() {
      if (!sb) return null;
      const { data } = await sb.from('settings').select('*').eq('id', 1).maybeSingle();
      return data;
    },

    /* ---------- forum diskusi ---------- */
    async topicDetail(id) {
      if (!sb) return null;
      const { data, error } = await sb.from('forum_topics')
        .select('id,title,body,created_at,user_id,profiles(full_name,avatar_url)')
        .eq('id', id).maybeSingle();
      if (error) fail(error);
      return data ? Object.assign({}, data, {
        author: data.profiles?.full_name || 'Anggota',
        avatar: data.profiles?.avatar_url || null,
        waktu: waktuRelatif(data.created_at)
      }) : null;
    },

    async replies(topicId) {
      if (!sb) return [];
      const { data, error } = await sb.from('forum_replies')
        .select('id,body,created_at,user_id,profiles(full_name,avatar_url)')
        .eq('topic_id', topicId).order('created_at');
      if (error) fail(error);
      return (data || []).map(r => Object.assign({}, r, {
        author: r.profiles?.full_name || 'Anggota',
        avatar: r.profiles?.avatar_url || null,
        waktu: waktuRelatif(r.created_at)
      }));
    },

    async createTopic(title, body) {
      if (!sb) { w.SGK?.toast('Mode demo — topik tidak tersimpan.'); return null; }
      const user = await pengguna();
      const { data, error } = await sb.from('forum_topics')
        .insert({ user_id: user.id, title, body }).select().single();
      if (error) fail(error);
      return data;
    },

    async reply(topicId, body) {
      if (!sb) { w.SGK?.toast('Mode demo — balasan tidak tersimpan.'); return null; }
      const user = await pengguna();
      const { data, error } = await sb.from('forum_replies')
        .insert({ topic_id: topicId, user_id: user.id, body }).select().single();
      if (error) fail(error);
      return data;
    },

    async deleteTopic(id) {
      if (!sb) return;
      const { error } = await sb.from('forum_topics').delete().eq('id', id);
      if (error) fail(error);
    },

    async deleteReply(id) {
      if (!sb) return;
      const { error } = await sb.from('forum_replies').delete().eq('id', id);
      if (error) fail(error);
    },

    /** Perubahan langsung pada obrolan. */
    subscribeForum(cb) {
      if (!sb) return () => {};
      const ch = sb.channel('forum')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_topics' }, cb)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'forum_replies' }, cb)
        .subscribe();
      return () => sb.removeChannel(ch);
    },

    async announcements() {
      if (!sb) return (D().pengumuman || []).map(a => ({ title: a.judul, body: a.isi, publish_on: a.tgl }));
      const { data } = await sb.from('announcements').select('*')
        .order('publish_on', { ascending: false }).limit(10);
      return (data || []).map(a => Object.assign({}, a, {
        publish_on: new Date(a.publish_on).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      }));
    }
  };

  /* ---------- OBROLAN KELOMPOK ---------- */
  const chat = {
    /** Kelompok yang saya ikuti (status aktif). */
    async myGroups() {
      if (!sb) return (D().kelompok || []).slice(0, 2).map((g, i) => ({
        id: 'g' + i, name: g.nama, kind: 'cell', schedule: g.jadwal,
        scene: g.scene, members: g.anggota || 0 }));
      const { data, error } = await sb.from('my_groups').select('*').order('name');
      if (error) fail(error);
      return data || [];
    },

    async messages(groupId, limit) {
      if (!sb) return [];
      const { data, error } = await sb.from('group_chat').select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false }).limit(limit || 80);
      if (error) fail(error);
      return (data || []).reverse().map(m => Object.assign({}, m, {
        waktu: jamPesan(m.created_at)
      }));
    },

    async send(groupId, body) {
      if (!sb) { w.SGK?.toast('Mode demo — pesan tidak terkirim.'); return null; }
      const teks = String(body || '').trim();
      if (!teks) throw new Error('Pesan kosong.');
      if (teks.length > 2000) throw new Error('Pesan terlalu panjang (maksimal 2000 huruf).');
      const user = await pengguna();
      const { data, error } = await sb.from('group_messages')
        .insert({ group_id: groupId, user_id: user.id, body: teks }).select().single();
      if (error) fail(error);
      return data;
    },

    async remove(id) {
      if (!sb) return;
      const { error } = await sb.from('group_messages').delete().eq('id', id);
      if (error) fail(error);
    },

    /** Pesan baru muncul langsung, tanpa muat ulang. */
    subscribe(groupId, cb) {
      if (!sb) return () => {};
      const ch = sb.channel('chat-' + groupId)
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'group_messages', filter: 'group_id=eq.' + groupId },
            cb)
        .subscribe();
      return () => sb.removeChannel(ch);
    }
  };

  /** Jam pesan: hari ini tampil jamnya, lebih lama tampil tanggalnya. */
  function jamPesan(iso) {
    const d = new Date(iso), kini = new Date();
    const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === kini.toDateString()) return jam;
    const kemarin = new Date(kini); kemarin.setDate(kini.getDate() - 1);
    if (d.toDateString() === kemarin.toDateString()) return 'Kemarin ' + jam;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + jam;
  }

  /* ---------- STATISTIK (admin) ---------- */
  const stats = {
    async overview() {
      if (!sb) return D().statistik || {};
      const [m, e, p, a] = await Promise.all([
        sb.from('profiles').select('id', { count: 'exact', head: true }),
        sb.from('events').select('id', { count: 'exact', head: true }).gte('starts_at', new Date().toISOString()),
        sb.from('prayers').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        sb.from('attendance').select('id', { count: 'exact', head: true })
          .gte('checked_in_at', new Date(Date.now() - 7 * 864e5).toISOString())
      ]);
      return { anggota: m.count || 0, kegiatanAktif: e.count || 0, doaMasuk: p.count || 0, hadirMingguIni: a.count || 0 };
    },

    async members(limit) {
      if (!sb) return [];
      const { data } = await sb.from('profiles')
        .select('id,member_no,full_name,role,joined_at').order('full_name').limit(limit || 100);
      return data || [];
    },

    /** Ubah peran anggota. Hanya berhasil bila pemanggil adalah pengurus (dijaga RLS). */
    async setRole(userId, role) {
      if (!['member', 'leader', 'pastor', 'admin'].includes(role)) throw new Error('Peran tidak dikenal: ' + role);
      if (!sb) return { demo: true, role };
      const user = await pengguna();
      if (user && user.id === userId && role !== 'admin') {
        throw new Error('Tidak bisa menurunkan peran akun sendiri. Minta pengurus lain yang melakukannya.');
      }
      const { data, error } = await sb.from('profiles')
        .update({ role }).eq('id', userId).select('id,full_name,role').single();
      if (error) fail(error);
      return data;
    },

    /** Jumlah pengurus aktif — dipakai untuk mencegah panel admin kehilangan semua pengurus. */
    async adminCount() {
      if (!sb) return 2;
      const { count } = await sb.from('profiles')
        .select('id', { count: 'exact', head: true }).in('role', ['admin', 'leader', 'pastor']);
      return count || 0;
    },

    async attendanceByMonth() {
      if (!sb) return { labels: (D().statistik || {}).bulan || [], values: (D().statistik || {}).kehadiran || [] };
      const { data } = await sb.from('attendance').select('checked_in_at')
        .gte('checked_in_at', new Date(Date.now() - 210 * 864e5).toISOString());
      const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const ember = {};
      (data || []).forEach(r => { const d = new Date(r.checked_in_at); ember[d.getMonth()] = (ember[d.getMonth()] || 0) + 1; });
      const kini = new Date().getMonth();
      const labels = [], values = [];
      for (let i = 6; i >= 0; i--) { const m = (kini - i + 12) % 12; labels.push(bulan[m]); values.push(ember[m] || 0); }
      return { labels, values };
    }
  };

  /* ---------- KELOLA KONTEN (khusus pengurus) ---------- */
  const admin = {
    /** Daftar isi tabel, urut sesuai kolom yang masuk akal. */
    async list(tabel) {
      if (!sb) return contohDemo(tabel);
      const urut = {
        events:        ['starts_at', false],
        devotions:     ['publish_on', false],
        announcements: ['publish_on', false],
        groups:        ['name', true],
        reading_plan:  ['day', true],
        prayers:       ['created_at', false]
      }[tabel] || ['created_at', false];
      const { data, error } = await sb.from(tabel).select('*')
        .order(urut[0], { ascending: urut[1] }).limit(200);
      if (error) fail(error);
      return data || [];
    },

    async create(tabel, isi) {
      if (!sb) { w.SGK?.toast('Mode demo — perubahan tidak tersimpan.'); return isi; }
      const { data, error } = await sb.from(tabel).insert(bersihkan(isi)).select().single();
      if (error) fail(error);
      return data;
    },

    async update(tabel, id, isi) {
      if (!sb) { w.SGK?.toast('Mode demo — perubahan tidak tersimpan.'); return isi; }
      const kunci = tabel === 'reading_plan' ? 'day' : 'id';
      const { data, error } = await sb.from(tabel).update(bersihkan(isi)).eq(kunci, id).select().single();
      if (error) fail(error);
      return data;
    },

    async remove(tabel, id) {
      if (!sb) { w.SGK?.toast('Mode demo — perubahan tidak tersimpan.'); return true; }
      const kunci = tabel === 'reading_plan' ? 'day' : 'id';
      const { error } = await sb.from(tabel).delete().eq(kunci, id);
      if (error) fail(error);
      return true;
    },

    /** Moderasi pokok doa: published · pending · archived */
    async setPrayerStatus(id, status) {
      if (!sb) return { demo: true };
      const { error } = await sb.from('prayers').update({ status }).eq('id', id);
      if (error) fail(error);
      return { ok: true };
    }
  };

  /** Unggah gambar ke bucket "media". Mengembalikan { url, path }. */
  admin.upload = async function (file, folder) {
    if (!sb) { w.SGK?.toast('Mode demo — berkas tidak diunggah.'); return { url: '', path: '' }; }
    if (!file) throw new Error('Tidak ada berkas dipilih.');
    if (!/^image\//.test(file.type)) throw new Error('Hanya berkas gambar yang bisa diunggah.');
    if (file.size > 5 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 5 MB. Perkecil dulu.');

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${folder || 'galeri'}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from('media').upload(path, file, { cacheControl: '31536000', upsert: false });
    if (error) {
      if (/bucket/i.test(error.message)) {
        throw new Error('Bucket "media" belum dibuat di Supabase → Storage. Lihat schema-2-media.sql.');
      }
      fail(error);
    }
    const { data } = sb.storage.from('media').getPublicUrl(path);
    return { url: data.publicUrl, path };
  };

  admin.removeFile = async function (path) {
    if (!sb || !path) return;
    await sb.storage.from('media').remove([path]);
  };

  /** Pengaturan aplikasi — satu baris, id = 1. */
  admin.getSettings = async function () {
    if (!sb) return {
      church_name: 'GKKA-I Jemaat Sendawar', app_name: 'SGKConnect',
      tagline: 'Terhubung dalam Kasih, Bertumbuh dalam Firman, Berdampak bagi Dunia.',
      hero_title: 'Rise Together, Shine for Christ', hero_scene: 'worship',
      verse_text: (D().ayatMinggu || {}).teks, verse_ref: (D().ayatMinggu || {}).ref,
      greeting_note: 'Kiranya Tuhan memberkati langkahmu hari ini.'
    };
    const { data } = await sb.from('settings').select('*').eq('id', 1).maybeSingle();
    return data || {};
  };

  admin.saveSettings = async function (isi) {
    if (!sb) { w.SGK?.toast('Mode demo — pengaturan tidak tersimpan.'); return isi; }
    const { data, error } = await sb.from('settings')
      .upsert(Object.assign({ id: 1, updated_at: new Date().toISOString() }, isi))
      .select().single();
    if (error) fail(error);
    return data;
  };

  /** Permintaan bergabung kelompok yang menunggu persetujuan. */
  admin.pendingMembers = async function () {
    if (!sb) return [];
    const { data, error } = await sb.from('pending_members').select('*').order('joined_at');
    if (error) fail(error);
    return data || [];
  };

  admin.approveMember = async function (groupId, userId, setuju) {
    if (!sb) return { demo: true };
    if (setuju) {
      const { error } = await sb.from('group_members')
        .update({ status: 'active' }).eq('group_id', groupId).eq('user_id', userId);
      if (error) fail(error);
    } else {
      const { error } = await sb.from('group_members')
        .delete().eq('group_id', groupId).eq('user_id', userId);
      if (error) fail(error);
    }
    return { ok: true };
  };

  /** Catat kehadiran secara manual (tanpa QR). */
  admin.markAttendance = async function (eventId, userId) {
    if (!sb) return { demo: true };
    const { error } = await sb.from('attendance')
      .upsert({ event_id: eventId, user_id: userId, method: 'manual' }, { onConflict: 'event_id,user_id' });
    if (error) fail(error);
    return { ok: true };
  };

  admin.attendanceOf = async function (eventId) {
    if (!sb) return [];
    const { data } = await sb.from('attendance')
      .select('user_id, method, checked_in_at, profiles(full_name, member_no)').eq('event_id', eventId);
    return data || [];
  };

  /** Buang nilai kosong supaya kolom opsional tetap NULL, bukan string kosong. */
  function bersihkan(o) {
    const hasil = {};
    for (const [k, v] of Object.entries(o)) {
      if (v === '' || v === undefined) continue;
      hasil[k] = v;
    }
    return hasil;
  }

  function contohDemo(tabel) {
    const d = D();
    if (tabel === 'events') return (d.kegiatan || []).map(e => ({
      id: e.id, title: e.judul, category: e.kategori, starts_at: e.tgl,
      location: e.lokasi, capacity: e.kuota, scene: e.scene }));
    if (tabel === 'devotions') { const r = d.renungan || {}; return [{
      id: 'd1', publish_on: new Date().toISOString().slice(0,10), title: r.judul,
      verse_ref: r.ayat, verse_text: r.kutipan, body: r.isi, author: r.penulis }]; }
    if (tabel === 'announcements') return (d.pengumuman || []).map((a,i) => ({
      id: 'a'+i, title: a.judul, body: a.isi, publish_on: a.tgl }));
    if (tabel === 'groups') return (d.kelompok || []).map((g,i) => ({
      id: 'g'+i, name: g.nama, kind: 'cell', leader_name: g.pemimpin,
      schedule: g.jadwal, scene: g.scene }));
    if (tabel === 'reading_plan') return (d.bacaan || []).map(b => ({
      day: b.hari, passage: b.kitab, snippet: b.teks }));
    if (tabel === 'prayers') return (d.doa || []).map(p => ({
      id: p.id, title: p.judul, body: p.isi, is_anon: p.anonim, status: 'published' }));
    return [];
  }

  /* ---------- HALAMAN PUBLIK (tanpa perlu masuk) ---------- */
  const publik = {
    async settings() {
      if (!sb) return { church_name: 'GKKA-I Jemaat Sendawar', app_name: 'SGKConnect',
        tagline: 'Terhubung dalam Kasih, Bertumbuh dalam Firman, Berdampak bagi Dunia.',
        hero_title: 'Rise Together, Shine for Christ', hero_scene: 'worship',
        hero_video_url: '', hero_subtitle: '',
        verse_text: (D().ayatMinggu || {}).teks, verse_ref: (D().ayatMinggu || {}).ref };
      const { data } = await sb.from('settings').select('*').eq('id', 1).maybeSingle();
      return data || {};
    },

    async events(limit) {
      if (!sb) return (D().kegiatan || []).map(e => ({
        id: e.id, title: e.judul, category: e.kategori, starts_at: e.tgl,
        location: e.lokasi, scene: e.scene }));
      const { data } = await sb.from('public_events').select('*')
        .gte('starts_at', new Date(Date.now() - 864e5).toISOString())
        .order('starts_at').limit(limit || 8);
      return data || [];
    },

    async devotion() {
      if (!sb) { const r = D().renungan || {};
        return { title: r.judul, verse_ref: r.ayat, verse_text: r.kutipan, body: r.isi, author: r.penulis }; }
      const { data } = await sb.from('devotions').select('*')
        .lte('publish_on', new Date().toISOString().slice(0, 10))
        .order('publish_on', { ascending: false }).limit(1).maybeSingle();
      return data;
    },

    async announcements(limit) {
      if (!sb) return (D().pengumuman || []).map(a => ({ title: a.judul, body: a.isi, publish_on: a.tgl }));
      const { data } = await sb.from('announcements').select('*')
        .order('publish_on', { ascending: false }).limit(limit || 6);
      return (data || []).map(a => Object.assign({}, a, {
        publish_on: new Date(a.publish_on).toLocaleDateString('id-ID',
          { day: 'numeric', month: 'short', year: 'numeric' }) }));
    },

    async groups() {
      if (!sb) return (D().kelompok || []).map((g, i) => ({
        id: 'g' + i, name: g.nama, kind: 'cell', leader_name: g.pemimpin,
        schedule: g.jadwal, scene: g.scene }));
      const { data } = await sb.from('groups')
        .select('id,name,kind,leader_name,schedule,description,scene').order('name');
      return data || [];
    },

    /** Hanya foto yang ditandai publik oleh pengurus. */
    async gallery(limit) {
      if (!sb) return [];
      const { data } = await sb.from('gallery').select('id,title,caption,image_url,taken_on')
        .eq('is_public', true).order('taken_on', { ascending: false }).limit(limit || 12);
      return data || [];
    },

    async media(limit) {
      if (!sb) return [];
      const { data } = await sb.from('media').select('*')
        .order('publish_on', { ascending: false }).limit(limit || 6);
      return data || [];
    }
  };

  /* ---------- profil ---------- */
  const profile = {
    async get() { return auth.me(); },

    async update(patch) {
      if (!sb) { store.set('user', Object.assign(store.get('user', {}), patch)); return patch; }
      const user = await pengguna();
      const bersih = {};
      for (const [k, v] of Object.entries(patch)) bersih[k] = (v === '' ? null : v);  // kosong = null
      const { data, error } = await sb.from('profiles').update(bersih).eq('id', user.id).select().single();
      if (error) fail(error);
      _profil = data; _profilWaktu = Date.now();
      return data;
    },

    /** Unggah foto profil ke folder milik anggota sendiri. */
    async uploadAvatar(file) {
      if (!file) throw new Error('Tidak ada berkas dipilih.');
      if (!/^image\//.test(file.type)) throw new Error('Hanya berkas gambar yang bisa diunggah.');
      if (file.size > 3 * 1024 * 1024) throw new Error('Ukuran foto maksimal 3 MB. Perkecil dulu.');
      if (!sb) { w.SGK?.toast('Mode demo — foto tidak diunggah.'); return { url: '', path: '' }; }

      const user = await pengguna();
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `avatar/${user.id}/${Date.now()}.${ext}`;
      const { error } = await sb.storage.from('media')
        .upload(path, file, { cacheControl: '31536000', upsert: true });
      if (error) {
        if (/bucket/i.test(error.message)) throw new Error('Bucket "media" belum dibuat di Supabase → Storage.');
        fail(error);
      }
      const { data } = sb.storage.from('media').getPublicUrl(path);

      // buang foto lama supaya tidak menumpuk
      const lama = _profil && _profil.avatar_path;
      if (lama && lama !== path) await sb.storage.from('media').remove([lama]).catch(() => {});

      await profile.update({ avatar_url: data.publicUrl, avatar_path: path });
      return { url: data.publicUrl, path };
    },

    async removeAvatar() {
      if (!sb) return;
      const lama = _profil && _profil.avatar_path;
      if (lama) await sb.storage.from('media').remove([lama]).catch(() => {});
      await profile.update({ avatar_url: null, avatar_path: null });
    },

    /** Ulang tahun bulan ini — hanya yang mengizinkan. */
    async birthdays() {
      if (!sb) return (D().ultah || []).map(u => ({ full_name: u.nama, ket: u.ket, scene: u.scene }));
      const bulan = new Date().getMonth() + 1;
      const { data } = await sb.from('upcoming_birthdays').select('*').eq('bulan', bulan);
      const hariIni = new Date().getDate();
      return (data || []).sort((a, b) => a.tanggal - b.tanggal).map(u => ({
        full_name: u.full_name,
        avatar_url: u.avatar_url,
        ket: u.tanggal === hariIni ? 'Hari ini'
           : u.tanggal + ' ' + new Date().toLocaleDateString('id-ID', { month: 'long' })
      }));
    }
  };

  function waktuRelatif(iso) {
    const d = (Date.now() - new Date(iso).getTime()) / 1000;
    if (d < 60) return 'baru saja';
    if (d < 3600) return Math.floor(d / 60) + ' menit lalu';
    if (d < 86400) return Math.floor(d / 3600) + ' jam lalu';
    if (d < 172800) return 'kemarin';
    return Math.floor(d / 86400) + ' hari lalu';
  }

  w.DB = { mode, live: !!sb, client: sb, auth, events, prayers, bible, community, stats, profile, admin, publik, chat, waktuRelatif };

  if (!sb) {
    console.info('%c[SGKConnect] MODE DEMO — isi assets/js/config.js untuk menyambung ke Supabase.',
      'color:#D4AF37;font-weight:600');
  }
})(window);

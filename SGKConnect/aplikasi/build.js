#!/usr/bin/env node
/**
 * SGKConnect — pembuat konfigurasi
 * ---------------------------------------------------------------
 * Menulis assets/js/config.js dari environment variable.
 *
 * Dijalankan otomatis oleh Cloudflare Pages (build command: node build.js).
 * Bisa juga dijalankan manual:  npm run build
 *
 * Sumber nilai, berurutan:
 *   1. environment variable (Cloudflare Pages / shell)
 *   2. berkas .env di folder ini (untuk pengembangan lokal)
 *   3. kosong  → aplikasi berjalan dalam mode demo
 *
 * Tidak ada rahasia yang ditulis ke sini: kunci `anon` Supabase
 * memang dirancang publik, keamanan dijaga Row Level Security.
 * Kunci `service_role` JANGAN PERNAH dimasukkan.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'assets', 'js', 'config.js');

/* ---------- baca .env bila ada (tanpa pustaka tambahan) ---------- */
function bacaEnv(file) {
  const hasil = {};
  if (!fs.existsSync(file)) return hasil;
  for (let baris of fs.readFileSync(file, 'utf8').split('\n')) {
    baris = baris.trim();
    if (!baris || baris.startsWith('#')) continue;
    const i = baris.indexOf('=');
    if (i < 1) continue;
    let nilai = baris.slice(i + 1).trim();
    if ((nilai.startsWith('"') && nilai.endsWith('"')) ||
        (nilai.startsWith("'") && nilai.endsWith("'"))) nilai = nilai.slice(1, -1);
    hasil[baris.slice(0, i).trim()] = nilai;
  }
  return hasil;
}

const dotenv = bacaEnv(path.join(__dirname, '.env'));
const ambil = (k, bawaan = '') => (process.env[k] ?? dotenv[k] ?? bawaan).trim();

const cfg = {
  SUPABASE_URL:      ambil('SUPABASE_URL'),
  SUPABASE_ANON_KEY: ambil('SUPABASE_ANON_KEY'),
  CHURCH:            ambil('CHURCH', 'GKKA-I Jemaat Sendawar'),
  APP_NAME:          ambil('APP_NAME', 'SGKConnect'),
  ALLOW_SIGNUP:      ambil('ALLOW_SIGNUP', 'true').toLowerCase() !== 'false'
};

/* ---------- pemeriksaan ---------- */
const galat = [];
const peringatan = [];

if (cfg.SUPABASE_URL && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(cfg.SUPABASE_URL)) {
  galat.push('SUPABASE_URL harus berbentuk https://xxxxx.supabase.co (tanpa garis miring di akhir)');
}
if (cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.startsWith('eyJ')) {
  galat.push('SUPABASE_ANON_KEY tidak terlihat seperti kunci Supabase (biasanya diawali "eyJ")');
}
if (/service_role/.test(cfg.SUPABASE_ANON_KEY)) {
  galat.push('BAHAYA: itu kunci service_role, bukan anon. Kunci service_role tidak boleh masuk ke kode aplikasi.');
}
if (!!cfg.SUPABASE_URL !== !!cfg.SUPABASE_ANON_KEY) {
  galat.push('SUPABASE_URL dan SUPABASE_ANON_KEY harus diisi keduanya, atau dikosongkan keduanya.');
}
// Pengaman: bila environment variable kosong TAPI config.js yang ada sudah
// terisi, jangan ditimpa. Ini melindungi pemakai yang memilih menaruh
// kredensial langsung di config.js (cara sederhana, lihat README).
if (!cfg.SUPABASE_URL && fs.existsSync(OUT)) {
  const lama = fs.readFileSync(OUT, 'utf8');
  const cocok = lama.match(/"SUPABASE_URL":\s*"(https:\/\/[^"]+)"/);
  if (cocok) {
    console.log('\n  config.js sudah terisi dan environment variable kosong.');
    console.log('  Berkas dibiarkan apa adanya — tidak ditimpa.');
    console.log('  Supabase: ' + cocok[1] + '\n');
    process.exit(0);
  }
}

if (!cfg.SUPABASE_URL) {
  peringatan.push('Kredensial Supabase kosong — aplikasi akan berjalan dalam MODE DEMO.');
}

if (galat.length) {
  console.error('\n  Konfigurasi bermasalah:\n');
  galat.forEach(g => console.error('   • ' + g));
  console.error('\n  Perbaiki environment variable, lalu jalankan ulang.\n');
  process.exit(1);
}

/* ---------- tulis berkas ---------- */
cfg.SUPABASE_URL = cfg.SUPABASE_URL.replace(/\/$/, '');

const isi = `/* ============================================================
   SGKConnect — konfigurasi
   ------------------------------------------------------------
   BERKAS INI DIBUAT OTOMATIS oleh build.js — jangan disunting
   langsung, karena akan tertimpa pada build berikutnya.

   Ubah nilainya lewat:
     • lokal      → berkas .env di akar proyek
     • Cloudflare → Settings › Variables and Secrets

   Dibuat: ${new Date().toISOString()}
   ============================================================ */
window.SGK_CONFIG = ${JSON.stringify(cfg, null, 2)};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, isi, 'utf8');

const mode = cfg.SUPABASE_URL ? 'TERSAMBUNG' : 'DEMO';
console.log(`\n  config.js dibuat — mode ${mode}`);
if (cfg.SUPABASE_URL) console.log('  Supabase: ' + cfg.SUPABASE_URL);
peringatan.forEach(p => console.log('  ' + p));
console.log('');

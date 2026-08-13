# SGKConnect — Sola Gratia Koinonia Connect

Aplikasi web pemuda **GKKA-I Jemaat Sendawar**. Statis, ringan, tanpa build step, siap di-deploy ke hosting mana pun.

**Tagline:** Connected in Christ. Growing in Faith. Serving with Love.

---

## Isi proyek

```
sgkconnect/
├── index.html            Halaman masuk (login/splash)
├── beranda.html          Dasbor anggota
├── kegiatan.html         Agenda, countdown, RSVP, check-in QR
├── alkitab.html          Renungan, rencana baca 365 hari, penanda
├── doa.html              Dinding doa + kirim permohonan (bisa anonim)
├── komunitas.html        Kelompok sel, tim pelayanan, forum, galeri
├── profil.html           Kartu anggota digital + QR + statistik
├── admin.html            Dasbor pengurus + grafik + ekspor CSV/PDF
├── forum.html            Forum diskusi
├── obrolan.html          Obrolan per kelompok sel / tim
├── galeri.html           Galeri foto — lihat & unduh
├── kelola.html           Kelola isi aplikasi (khusus pengurus)
├── publik.html           Halaman terbuka untuk umum, tanpa perlu masuk
├── konsep.html           Papan konsep UI/UX (untuk presentasi)
├── 404.html
├── supabase/
│   ├── schema.sql              Skema utama + keamanan (RLS) + data awal
│   ├── schema-2-media.sql      Galeri, media, pengaturan, Storage
│   ├── schema-3-publik.sql     Membuka sebagian isi untuk pengunjung umum
│   ├── schema-4-biodata.sql    Biodata anggota & foto profil
│   ├── schema-5-banner.sql     Banner kegiatan & izin forum
│   ├── schema-6-hero.sql       Latar beranda: gambar atau video
│   ├── schema-7-peran.sql      Peran Pendeta
│   ├── schema-8-chat.sql       Obrolan kelompok
│   └── schema-9-perbaikan.sql  Perbaikan izin (WAJIB dijalankan)
│   ├── jadikan-admin.sql       Mengatur peran pengurus
│   ├── bersihkan-duplikat.sql  Bila schema.sql pernah dijalankan berulang
│   └── reset-total.sql         Hapus semua lalu mulai ulang dari nol
├── build.js              Membuat config.js dari environment variable
├── .env.example          Contoh konfigurasi — salin jadi .env
├── data-template/        Templat CSV untuk diisi data jemaat
├── PANDUAN-LENGKAP.md    Panduan runtut: nol → localhost → online
├── DEPLOY.md             Versi ringkas panduan deploy
├── STATUS-FITUR.md       Daftar fitur: yang jalan penuh vs yang masih tampilan
├── assets/
│   ├── css/app.css       Design system lengkap (token, komponen, responsif, dark mode)
│   ├── js/config.js      Dibuat otomatis oleh build.js — jangan disunting
│   ├── js/db.js          Lapisan data (Supabase, otomatis fallback ke mode demo)
│   ├── js/ui.js          Logo, ikon, ilustrasi SVG, shell, grafik, QR, toast
│   ├── js/app.js         RSVP, tombol doa, progres baca, check-in, filter
│   ├── js/data.js        Data contoh untuk mode demo
│   └── img/            Logo resmi: logo-mark.png (terang), logo-mark-light.png
│                        (untuk latar navy), logo-lockup.png, ikon PWA, favicon
├── manifest.webmanifest  PWA (bisa "Add to Home Screen")
├── sw.js                 Service worker, bisa dibuka offline
├── netlify.toml / vercel.json
└── package.json
```

## Status singkat

Antarmuka **lengkap** dan sebagian besar fitur inti sudah **tersambung ke database**
(akun, doa, RSVP, check-in, progres baca, statistik admin).
Rincian per fitur — termasuk yang masih tampilan saja — ada di **[STATUS-FITUR.md](STATUS-FITUR.md)**.

**Baru pertama kali? Mulai dari [PANDUAN-LENGKAP.md](PANDUAN-LENGKAP.md)** —
runtut dari memasang perkakas, uji coba di komputer sendiri, sampai aplikasi online.
Versi ringkasnya ada di [DEPLOY.md](DEPLOY.md).

Tanpa mengisi `assets/js/config.js`, aplikasi berjalan dalam **mode demo**
memakai data contoh — berguna untuk pratinjau, tapi data tidak tersimpan di server.

## Menjalankan secara lokal

```bash
npm install     # sekali saja, memasang server pengembangan
npm run dev     # jalan di http://localhost:5173
```

Untuk menyambung ke database, salin `.env.example` menjadi `.env` dan isi
kredensial Supabase, lalu jalankan `npm run dev` lagi.

Perintah `npm run dev` membaca `.env`, menghasilkan `assets/js/config.js`,
lalu menyalakan server. Tanpa `.env`, aplikasi tetap jalan dalam mode demo.

Service worker dan PWA butuh server HTTP, jadi jangan buka lewat `file://`.

## Deploy

### Cloudflare Pages (disarankan)
Ikuti **[DEPLOY.md](DEPLOY.md)** — mencakup Supabase, GitHub, dan Cloudflare sekaligus.

### Netlify (alternatif)
1. Buka [app.netlify.com/drop](https://app.netlify.com/drop)
2. Seret seluruh folder `sgkconnect/` ke halaman itu
3. Selesai — dapat URL langsung. Konfigurasi header & cache sudah ada di `netlify.toml`

Via CLI:
```bash
npm i -g netlify-cli
netlify deploy --dir=. --prod
```

### Vercel
```bash
npm i -g vercel
vercel --prod
```
Framework preset: **Other**. Output directory: `.`

### GitHub Pages
```bash
git init && git add . && git commit -m "SGKConnect v1"
git branch -M main
git remote add origin https://github.com/USERNAME/sgkconnect.git
git push -u origin main
```
Lalu Settings → Pages → Source: `main` / root. Situs terbit di `https://USERNAME.github.io/sgkconnect/`.

### Hosting cPanel / shared hosting
Upload seluruh isi folder ke `public_html/`. Tidak perlu Node, PHP, atau database.

### Domain sendiri
Arahkan domain (mis. `sgkconnect.gkkai-sendawar.org`) ke penyedia hosting di atas, lalu aktifkan HTTPS (gratis di Netlify/Vercel/Pages).

---

## Yang perlu diganti sebelum dipakai jemaat

| Berkas | Ganti |
|---|---|
| `assets/js/data.js` | Semua konten: kegiatan, renungan, pokok doa, kelompok sel, pengumuman, statistik |
| `assets/img/` | Sudah memakai logo resmi gereja. Ganti hanya bila ada versi baru |
| `index.html` | Hubungkan form login ke autentikasi sungguhan |
| `admin.html` | Sambungkan tabel & moderasi ke backend |

**Ilustrasi.** Semua gambar dibuat sebagai SVG (siluet ibadah, api unggun, Alkitab, tangan berdoa) supaya tajam di layar apa pun dan tanpa masalah hak cipta. Untuk mengganti dengan foto dokumentasi gereja:

```html
<!-- sebelum -->
<div class="hero" data-scene="worship"></div>
<!-- sesudah -->
<div class="hero"><img src="assets/img/youth-camp.jpg" alt="Ibadah pemuda"
     style="width:100%;height:100%;object-fit:cover"></div>
```

## Konfigurasi

Ada dua cara. Pilih salah satu.

**Cara A — langsung di config.js (paling sederhana)**

Buka `assets/js/config.js`, isi dua baris pertama, commit seperti biasa.
Tidak perlu build command, tidak perlu environment variable di hosting.
Aman karena kunci `anon` memang dirancang publik — yang menjaga data adalah
Row Level Security di Postgres.

**Cara B — lewat environment variable (kredensial tidak masuk repo)**

Alurnya:

```
.env  (lokal, tidak di-commit)          ┐
                                        ├──►  build.js  ──►  assets/js/config.js
Cloudflare Environment Variables        ┘                    (dibuat saat build)
```

`build.js` juga memeriksa nilainya: bentuk URL salah, kunci tertukar dengan
`service_role`, atau hanya satu dari dua yang diisi — semuanya menghentikan build
dengan pesan yang jelas, bukan diam-diam menghasilkan aplikasi rusak.

Kalau keduanya kosong, aplikasi berjalan dalam mode demo. Itu perilaku yang disengaja,
supaya proyek bisa dibuka siapa saja tanpa perlu database.

`build.js` tidak akan menimpa `config.js` yang sudah terisi, jadi Cara A dan Cara B
bisa hidup berdampingan tanpa saling merusak.

## Kecepatan

Beberapa hal yang dijaga supaya perpindahan halaman terasa ringan:

- **Sesi disinggahi.** `getSession()` membaca dari perangkat, bukan menembak server.
  Sebelumnya `getUser()` dipanggil 14 kali per halaman — itu 14 perjalanan ke Singapura.
- **Permintaan dijalankan serentak** dengan `Promise.all`, bukan menunggu satu per satu.
  Beranda: dari 7 giliran jadi 1.
- **Profil disinggahi 60 detik**, jadi tidak diambil ulang tiap berpindah halaman.
- **SDK Supabase disimpan lokal** (`assets/js/supabase.min.js`), bukan dari CDN,
  sehingga bisa disinggahi service worker dan tetap jalan saat offline.
- **Halaman dipramuat** begitu kursor menyentuh menu.

Total unduhan pertama ±317 KB, kunjungan berikutnya hampir seluruhnya dari singgahan.

## Arsitektur data

Seluruh halaman memanggil `DB.*` (di `assets/js/db.js`), tidak pernah memanggil Supabase langsung.
Satu lapisan itu yang memutuskan: ada kredensial → pakai database; belum ada → pakai data contoh.
Artinya menambah fitur cukup di satu tempat, dan aplikasi tetap bisa dipratinjau tanpa server.

Keamanan dijaga **Row Level Security** di Postgres, bukan di kode JavaScript:
anggota hanya bisa mengubah miliknya sendiri, hanya pengurus yang bisa menyunting kegiatan
dan pengumuman. Kunci `anon public` di `config.js` memang boleh terlihat publik.

## Fitur yang sudah jalan

- Navigasi desktop (sidebar) + mobile (bottom nav + drawer)
- Mode terang & gelap, tersimpan antar kunjungan
- Countdown kegiatan real-time, RSVP dengan status tersimpan
- Kirim pokok doa (termasuk anonim) + penghitung "Saya mendoakan"
- Progres rencana baca 365 hari
- Modal check-in QR, kartu anggota digital
- Grafik kehadiran, donat sebaran kelompok, ekspor CSV, cetak PDF
- Pengaturan peran anggota dari panel admin (anggota / pemimpin / pengurus)
- Halaman **Kelola Konten** dengan 11 tab: kegiatan, renungan, pengumuman, kelompok,
  rencana baca, galeri foto (dengan unggah gambar), video & podcast, moderasi doa,
  tampilan & identitas aplikasi, persetujuan anggota kelompok, dan kehadiran manual
- PWA: bisa dipasang di layar utama dan dibuka offline
- Aksesibilitas: fokus keyboard terlihat, label ARIA, `prefers-reduced-motion` dihormati

## Logo

Aplikasi memakai berkas logo resmi jemaat (`logo-original.jpg`) yang sudah diproses menjadi:

| Berkas | Dipakai di |
|---|---|
| `logo-mark.png` | Latar terang: halaman masuk, kartu, layar mobile |
| `logo-mark-light.png` | Latar navy: sidebar, footer, panel admin (bagian navy diputihkan agar terbaca) |
| `logo-lockup.png` | Logo penuh dengan teks — halaman masuk |
| `icon-192/512.png`, `icon-maskable-*.png` | Ikon PWA saat dipasang di layar utama |
| `favicon.png`, `favicon.ico` | Ikon tab peramban |

Kalau nanti ada berkas logo vektor (`.svg`/`.ai`) dari desainer, cukup timpa berkas di atas dengan nama yang sama — tidak ada kode yang perlu diubah.

## Brand

| Token | Nilai |
|---|---|
| Navy | `#102A43` |
| Gold | `#D4AF37` |
| White | `#FFFFFF` |
| Light Gray | `#F7F9FC` |
| Judul | Poppins 500/600 |
| Teks | Inter 400/500 |
| Radius | 11 / 16 / 22 px |

---

© GKKA-I Jemaat Sendawar. Dibuat untuk pelayanan pemuda.

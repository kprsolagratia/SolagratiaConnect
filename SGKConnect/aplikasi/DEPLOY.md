# Panduan Deploy — GitHub · Cloudflare Pages · Supabase

Ikuti berurutan. Total sekitar 30–45 menit. Semua langkah gratis untuk skala jemaat.

---

## Bagian 1 — Supabase (database & akun)

### 1.1 Buat proyek
1. Daftar di [supabase.com](https://supabase.com) → **New project**
2. Isi:
   - **Name:** `sgkconnect`
   - **Database Password:** buat yang kuat, **simpan baik-baik** (tidak bisa dilihat lagi)
   - **Region:** `Southeast Asia (Singapore)` — paling dekat dengan Indonesia
3. Tunggu ±2 menit sampai proyek siap.

### 1.2 Buat tabel
1. Menu kiri → **SQL Editor** → **New query**
2. Buka berkas `supabase/schema.sql`, salin **seluruh isinya**, tempel ke editor
3. Klik **Run**. Kalau muncul "Success. No rows returned" berarti berhasil.

Skrip ini membuat 15 tabel, aturan keamanan (RLS), dan mengisi data awal (kelompok sel, kegiatan contoh, renungan hari ini).

### 1.3 Atur autentikasi
Menu kiri → **Authentication** → **Providers** → **Email**:
- **Enable Email provider:** aktif
- **Confirm email:** matikan dulu supaya anggota bisa langsung masuk saat uji coba. Aktifkan lagi setelah aplikasi resmi dipakai.

Lalu ke **Authentication** → **URL Configuration**:
- **Site URL:** `https://sgkconnect.pages.dev` (isi setelah Bagian 3 selesai)
- **Redirect URLs:** tambahkan `https://sgkconnect.pages.dev/**` dan `http://localhost:5173/**`

### 1.4 Ambil kunci
Menu kiri → **Settings** (ikon gerigi) → **API**. Catat dua nilai:
- **Project URL** — contoh `https://abcdefgh.supabase.co`
- **anon public** — kunci panjang diawali `eyJ...`

> **Penting:** kunci `anon public` memang boleh terlihat publik; keamanan dijaga oleh RLS di database. Kunci **`service_role` JANGAN PERNAH** dimasukkan ke kode aplikasi.

### 1.5 Isi kredensial
Salin `.env.example` menjadi `.env`, lalu isi:

```
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```

Jalankan `npm run build` untuk membuat `assets/js/config.js` dari nilai tersebut.
Berkas `.env` tidak ikut ter-commit ke GitHub.

---

## Bagian 2 — GitHub

```bash
cd sgkconnect
git init
git add .
git commit -m "SGKConnect v1 — aplikasi pemuda GKKA-I Sendawar"
git branch -M main
git remote add origin https://github.com/USERNAME/sgkconnect.git
git push -u origin main
```

Kalau belum punya repo: buka [github.com/new](https://github.com/new), nama `sgkconnect`, pilih **Private** kalau ingin tertutup (Cloudflare tetap bisa membacanya setelah diberi izin).

---

## Bagian 3 — Cloudflare

Cloudflare punya dua jenis proyek: **Pages** (untuk situs statis) dan **Workers**
(untuk aplikasi server). SGKConnect adalah situs statis, jadi **Pages** yang tepat.

Kalau terlanjur terbuat sebagai Worker dan muncul galat
*"Could not detect a directory containing static files"*, lihat bagian
**Memperbaiki proyek Worker** di bawah.

### Cloudflare Pages

1. Masuk ke [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Pilih repo `sgkconnect`, klik **Begin setup**
3. Isi pengaturan build:

| Kolom | Nilai |
|---|---|
| Project name | `sgkconnect` |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `node build.js` |
| Build output directory | `/` |

4. Di **Environment variables**, tambahkan `SUPABASE_URL` dan `SUPABASE_ANON_KEY`
   dengan nilai yang sama seperti di `.env`
5. **Save and Deploy**. Sekitar 1 menit, situs terbit di `https://sgkconnect.pages.dev`

Berkas `_headers` dan `_redirects` sudah disertakan, jadi header keamanan dan cache aktif otomatis.

### Memperbaiki proyek Worker

Kalau proyek sudah terlanjur dibuat sebagai Worker, ada dua pilihan.

**Pilihan A — pakai berkas wrangler.toml (tanpa membuat ulang)**

Berkas `wrangler.toml` sudah disertakan di proyek ini. Cukup commit dan push,
lalu di dashboard Worker → **Settings** → **Build**:

| Kolom | Isi |
|---|---|
| Build command | `node build.js` |
| Deploy command | `npx wrangler deploy` |

Lalu **Settings** → **Variables and Secrets**, tambahkan `SUPABASE_URL` dan
`SUPABASE_ANON_KEY`. Pastikan dicentang agar tersedia **saat build**, bukan hanya
saat berjalan — nilainya dibaca oleh `build.js`.

Klik **Retry deployment**.

**Pilihan B — buat ulang sebagai Pages (lebih disarankan)**

1. Dashboard → Worker `solagratiaconnect` → **Settings** → gulir ke bawah → **Delete**
2. **Workers & Pages** → **Create** → tab **Pages** → **Connect to Git**
3. Pilih repo yang sama, isi seperti tabel di Bagian 3 di atas
4. Jangan lupa tambahkan environment variables sebelum Deploy

Pages lebih cocok karena dirancang khusus untuk situs statis: tidak perlu
`wrangler.toml`, header dari `_headers` otomatis dipakai, dan setiap commit
dapat URL pratinjau sendiri.

### 3.1 Kembali ke Supabase
Setelah dapat URL, ulangi **langkah 1.3** dan isi **Site URL** serta **Redirect URLs** dengan alamat asli tadi. Tanpa ini, tautan konfirmasi email akan gagal.

### 3.2 Domain sendiri (opsional)
Di proyek Pages → **Custom domains** → **Set up a domain** → masukkan mis. `sgkconnect.gkkai-sendawar.org`. Kalau domainnya sudah di Cloudflare, DNS-nya diatur otomatis. HTTPS aktif sendiri.

Jangan lupa tambahkan domain baru itu ke **Redirect URLs** di Supabase.

---

## Bagian 4 — Jadikan diri Anda pengurus

Panel admin hanya terbuka untuk peran `admin` atau `leader`.

1. Buka aplikasi, klik **Buat akun baru**, daftar dengan email Anda
2. Di Supabase → **SQL Editor**, jalankan (ganti emailnya):

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'emailanda@contoh.com');
```

3. Muat ulang aplikasi — menu **Admin** kini berfungsi.

Perintah lainnya (pemimpin kelompok, cabut hak, pemeriksaan) ada di
`supabase/jadikan-admin.sql`. Sebaiknya buat **minimal dua** akun pengurus.

---

## Bagian 5 — Isi data jemaat

Semua lewat Supabase → **Table Editor**:

| Tabel | Isi |
|---|---|
| `events` | Kegiatan pemuda: judul, `starts_at`, lokasi, kuota |
| `devotions` | Renungan harian, satu baris per tanggal (`publish_on`) |
| `reading_plan` | Rencana baca 365 hari: `day`, `passage`, `snippet` |
| `groups` | Kelompok sel & tim pelayanan |
| `announcements` | Pengumuman gereja |

Untuk `reading_plan` yang panjang, siapkan CSV berisi kolom `day,passage,snippet` lalu pakai tombol **Import data from CSV** di Table Editor.

---

## Memperbarui aplikasi

```bash
git add .
git commit -m "perbarui renungan"
git push
```

Cloudflare otomatis membangun ulang dalam ±1 menit. Setiap commit punya URL pratinjau sendiri, dan bisa dikembalikan (**rollback**) dari dashboard bila ada yang keliru.

---

## Pemeriksaan setelah deploy

- [ ] Buka situs, konsol peramban **tidak** menampilkan "MODE DEMO"
- [ ] Daftar akun baru berhasil, lalu bisa masuk
- [ ] Kirim pokok doa → muncul di daftar, dan terlihat juga di perangkat lain
- [ ] Tekan "Saya mendoakan" → angka bertambah dan tetap setelah muat ulang
- [ ] RSVP kegiatan → status tersimpan setelah keluar-masuk lagi
- [ ] Halaman Admin terbuka untuk akun pengurus, dan **ditolak** untuk akun anggota biasa
- [ ] Pasang di layar utama HP (Add to Home Screen) dan bisa dibuka

---

## Biaya

| Layanan | Paket gratis | Cukup untuk |
|---|---|---|
| Cloudflare Pages | Bandwidth tak terbatas, 500 build/bulan | Selamanya |
| Supabase | 500 MB database, 50.000 pengguna aktif/bulan | Jauh melebihi kebutuhan jemaat |
| GitHub | Repo privat tak terbatas | Selamanya |

Batas Supabase yang perlu diperhatikan: proyek gratis **dijeda otomatis** setelah 7 hari tanpa aktivitas. Selama aplikasi dipakai mingguan, ini tidak akan terjadi.

---

## Bila ada masalah

**"MODE DEMO" masih muncul** — environment variable belum terbaca. Periksa ejaannya di
Cloudflare → Settings → Variables and Secrets, lalu **Retry deployment** (mengubah variabel
tidak otomatis membangun ulang). Di komputer sendiri, pastikan `.env` sudah dibuat dan
`npm run build` sudah dijalankan.

**Gagal masuk padahal sandi benar** — cek **Confirm email** di Supabase. Kalau aktif, anggota harus klik tautan di emailnya dulu.

**Tautan email mengarah ke localhost** — **Site URL** di Supabase belum diperbarui (langkah 3.1).

**Data tidak muncul walau tabel berisi** — kemungkinan besar RLS. Pastikan `schema.sql` dijalankan sampai selesai tanpa error, dan Anda mengakses dalam keadaan sudah masuk.

**Perubahan tidak terlihat setelah push** — service worker menyimpan cache. Naikkan `VERSION` di `sw.js` (mis. `sgk-v3` → `sgk-v4`) lalu push lagi.

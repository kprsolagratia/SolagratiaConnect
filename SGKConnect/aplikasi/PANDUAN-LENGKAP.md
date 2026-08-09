# Panduan Lengkap — dari Nol sampai Online

SGKConnect · GKKA-I Jemaat Sendawar

Ikuti berurutan. Jangan lompat, karena tiap tahap bergantung pada yang sebelumnya.

**Perkiraan waktu:**
| Tahap | Waktu |
|---|---|
| 0 · Persiapan perkakas | 15 menit |
| 1 · Uji coba di komputer sendiri | 10 menit |
| 2 · Siapkan database | 20 menit |
| 3 · Sambungkan & uji ulang | 15 menit |
| 4 · Unggah ke GitHub | 10 menit |
| 5 · Terbitkan ke internet | 10 menit |
| 6 · Beres-beres setelah online | 15 menit |
| 7 · Isi data jemaat | sesuai kebutuhan |

---

# TAHAP 0 — Persiapan

## 0.1 Yang perlu dipasang

| Perkakas | Untuk apa | Unduh |
|---|---|---|
| **Node.js** | menjalankan server uji coba di komputer | [nodejs.org](https://nodejs.org) → pilih versi **LTS** |
| **GitHub Desktop** | mengunggah kode ke GitHub | [desktop.github.com](https://desktop.github.com/download/) |
| **VS Code** | menyunting berkas (opsional tapi sangat membantu) | [code.visualstudio.com](https://code.visualstudio.com) |

Pasang Node.js dengan pengaturan bawaan — cukup klik **Next** terus sampai selesai.

**Periksa Node.js sudah terpasang.** Buka Terminal (Mac) atau Command Prompt (Windows), ketik:

```bash
node -v
```

Kalau muncul angka seperti `v22.14.0`, berhasil. Kalau muncul "not recognized", tutup jendela itu, buka lagi yang baru, dan ulangi. Kalau masih gagal, komputer perlu di-restart.

## 0.2 Akun yang perlu dibuat

Buat ketiganya sekarang supaya nanti tidak terputus di tengah jalan:

1. **GitHub** — [github.com/signup](https://github.com/signup) · pilih paket **Free**
2. **Supabase** — [supabase.com](https://supabase.com) · masuk pakai akun GitHub tadi (lebih cepat)
3. **Cloudflare** — [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)

Gunakan **email yang sama** untuk ketiganya, dan simpan kata sandinya di tempat aman. Kalau memungkinkan, pakai email gereja, bukan email pribadi — supaya kepengurusan bisa diserahterimakan nanti.

## 0.3 Siapkan foldernya

Ekstrak berkas zip. Pindahkan folder `aplikasi` ke tempat yang mudah dicari, misalnya:

- Windows: `C:\Users\NamaAnda\Documents\sgkconnect`
- Mac: `/Users/NamaAnda/Documents/sgkconnect`

**Ganti nama foldernya menjadi `sgkconnect`** (huruf kecil semua, tanpa spasi). Nama folder ini akan jadi nama repositori di GitHub.

---

# TAHAP 1 — Uji coba di komputer sendiri (mode demo)

Sebelum menyentuh database, pastikan aplikasinya jalan.

## 1.1 Jalankan server

Buka Terminal / Command Prompt, lalu:

```bash
cd Documents/sgkconnect
npm install
npm run dev
```

`npm install` cukup dijalankan **sekali saja** — memasang server pengembangan
ke folder `node_modules`. Prosesnya ±20 detik dan butuh internet.

Kalau berhasil, muncul:

```
config.js dibuat — mode DEMO
INFO  Accepting connections at http://localhost:5173
```

**Jangan tutup jendela terminal ini.** Selama masih terbuka, server berjalan.

> **Alternatif tanpa Node.js:** kalau komputer punya Python, bisa pakai
> `python3 -m http.server 5173` (Mac/Linux) atau `python -m http.server 5173` (Windows).
> Sisi tampilan sama saja; hanya `npm run dev` yang otomatis membuat ulang `config.js`.

**Kalau nanti perlu berhenti lalu menjalankan lagi**, cukup `npm run dev` —
`npm install` tidak perlu diulang.

## 1.2 Buka di peramban

Buka `http://localhost:5173` di Chrome atau Edge.

**Yang harus Anda lihat:** halaman masuk dengan logo salib dan tulisan "Selamat datang kembali", ditambah catatan kuning **"Mode demo"**.

## 1.3 Telusuri semua halaman

Klik **Lihat sebagai tamu**, lalu periksa satu per satu:

- [ ] **Beranda** — sapaan sesuai waktu, hitung mundur kegiatan berjalan
- [ ] **Kegiatan** — 4 kartu kegiatan, tombol RSVP berubah saat diklik
- [ ] **Alkitab** — renungan tampil, progres baca 65%
- [ ] **Pokok Doa** — kirim satu permohonan percobaan, muncul di daftar
- [ ] **Komunitas** — kelompok sel dan tim pelayanan tampil
- [ ] **Profil** — kartu anggota dengan QR
- [ ] **Admin** — angka statistik dan grafik tampil
- [ ] Tombol bulan/matahari di kanan atas mengubah mode gelap
- [ ] Perkecil jendela sampai sempit — sidebar berubah jadi menu bawah

Kalau ada yang kosong atau rusak, hentikan di sini dan beri tahu saya bagian mananya. Jangan lanjut ke tahap berikutnya.

## 1.4 Hentikan server

Tekan **Ctrl + C** di terminal.

---

# TAHAP 2 — Siapkan database (Supabase)

## 2.1 Buat proyek

1. Masuk ke [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Isi:

| Kolom | Isi |
|---|---|
| Organization | biarkan bawaan |
| Name | `sgkconnect` |
| Database Password | klik **Generate a password**, lalu **salin dan simpan** |
| Region | **Southeast Asia (Singapore)** |
| Plan | Free |

> **Kata sandi database ini tidak bisa dilihat lagi setelah halaman ditutup.** Simpan di catatan aman. (Untuk pemakaian normal Anda tidak membutuhkannya, tapi kalau hilang dan suatu saat perlu, satu-satunya jalan adalah mengatur ulang.)

3. Klik **Create new project**, tunggu ±2 menit.

## 2.2 Buat tabel

1. Menu kiri → **SQL Editor** → **New query**
2. Buka berkas `supabase/schema.sql` dengan Notepad atau VS Code
3. Salin **seluruh isinya** (Ctrl+A lalu Ctrl+C), tempel ke kotak SQL Editor
4. Klik **Run** (atau Ctrl+Enter)

**Yang harus muncul:** `Success. No rows returned`

Skrip ini membuat 15 tabel, aturan keamanan, dan mengisi contoh awal.

## 2.3 Aktifkan galeri foto & media

1. Menu kiri → **Storage** → **New bucket**
2. Name: `media` · **Public bucket: aktifkan** · **Create bucket**
3. Kembali ke **SQL Editor** → **New query**
4. Salin seluruh isi `supabase/schema-2-media.sql`, tempel, klik **Run**
5. Ulangi untuk `supabase/schema-3-publik.sql` (halaman publik)
6. Ulangi untuk `supabase/schema-4-biodata.sql` (biodata & foto profil)

Skrip ini membuat tabel galeri, media, dan pengaturan aplikasi, sekaligus mengatur
siapa yang boleh mengunggah foto.

> Kalau muncul catatan *Bucket "media" belum ada*, berarti langkah 1–2 terlewat.
> Buat bucketnya, lalu jalankan skrip ini sekali lagi.

## 2.4 Periksa hasilnya

Menu kiri → **Table Editor**. Harus ada daftar tabel: `profiles`, `events`, `prayers`, `groups`, `devotions`, dan lainnya.

Klik tabel `groups` — isinya sudah ada 8 baris (4 kelompok sel + 4 tim).

## 2.5 Atur autentikasi

**Authentication** → **Sign In / Providers** → **Email**:

| Pengaturan | Nilai | Alasan |
|---|---|---|
| Enable Email provider | **aktif** | supaya bisa daftar |
| Confirm email | **nonaktif dulu** | supaya uji coba tidak terhambat email |

> Aktifkan **Confirm email** lagi setelah aplikasi resmi dipakai jemaat, supaya tidak ada yang mendaftar dengan email palsu.

Lalu **Authentication** → **URL Configuration**:

- **Site URL:** `http://localhost:5173`
- **Redirect URLs:** klik **Add URL**, isi `http://localhost:5173/**`

(Nanti di Tahap 6 keduanya diubah ke alamat asli.)

## 2.6 Ambil kunci

**Settings** (ikon gerigi) → **API Keys**. Catat dua nilai:

| Nama | Bentuk |
|---|---|
| **Project URL** | `https://abcdefghijkl.supabase.co` |
| **anon public** | teks panjang diawali `eyJ...` |

> **Yang mana yang boleh publik?** Kunci **`anon public` boleh** dilihat siapa saja — keamanan dijaga oleh aturan di database, bukan oleh kunci ini. Kunci **`service_role` JANGAN PERNAH** dimasukkan ke kode aplikasi; kunci itu bisa menembus semua aturan keamanan.

---

# TAHAP 3 — Sambungkan dan uji ulang

## 3.1 Isi kredensial lewat .env

Di folder proyek ada berkas `.env.example`. **Salin** berkas itu dan beri nama `.env`
(persis begitu, diawali titik, tanpa akhiran apa pun).

- Windows: klik kanan → Copy → Paste → ganti nama jadi `.env`
  Kalau Windows menolak nama diawali titik, ketik `.env.` dengan titik di akhir — titik terakhir hilang sendiri.
- Mac: di Terminal, `cp .env.example .env`

Buka `.env` dengan Notepad atau VS Code, isi dua barisnya:

```
SUPABASE_URL=https://abcdefghijkl.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

Tanpa tanda kutip, tanpa spasi di sekitar tanda `=`. Simpan.

> **Kenapa `.env` dan bukan langsung di kode?** Supaya kredensial tidak ikut terunggah
> ke GitHub. Berkas `.env` sudah terdaftar di `.gitignore`, jadi tidak akan pernah ter-commit.

## 3.2 Jalankan lagi

```bash
npm run dev
```

Perintah ini membaca `.env`, membuat `assets/js/config.js`, lalu menjalankan server.

Kalau ada yang salah ketik, akan muncul pesan seperti
*"SUPABASE_URL harus berbentuk https://xxxxx.supabase.co"* — perbaiki lalu ulangi.

Setelah berhasil, muncul:
```
config.js dibuat — mode TERSAMBUNG
Supabase: https://abcdefghijkl.supabase.co
```

Buka `http://localhost:5173`, lalu tekan **Ctrl+Shift+R** (muat ulang paksa).

**Catatan "Mode demo" harus sudah hilang.** Kalau masih ada, lihat bagian Masalah di bawah.

## 3.3 Uji akun sungguhan

1. Klik **Buat akun baru**
2. Isi nama, email Anda, dan kata sandi (minimal 6 karakter)
3. Klik **Daftar** → seharusnya langsung masuk ke Beranda

**Periksa di Supabase:** Table Editor → `profiles`. Nama Anda muncul dengan nomor anggota otomatis seperti `SGK-2026-00001`.

## 3.4 Uji penyimpanan data

Ini bagian terpenting — memastikan data benar-benar tersimpan di server:

1. Buka **Pokok Doa** → kirim satu permohonan percobaan
2. Buka **Kegiatan** → klik **RSVP** pada satu kegiatan
3. Buka **Alkitab** → klik **Tandai selesai** pada satu bacaan
4. **Tutup peramban sepenuhnya**, buka lagi, masuk kembali
5. Semua yang tadi harus **masih ada**

Kalau hilang setelah muat ulang, berarti belum tersambung — periksa lagi `config.js`.

**Uji lintas perangkat (paling meyakinkan):** buka `http://localhost:5173` di jendela penyamaran (incognito), daftar akun kedua, dan lihat apakah pokok doa dari akun pertama tampil. Kalau ya, database sudah berjalan sempurna.

## 3.5 Jadikan diri Anda pengurus

Semua akun baru — termasuk yang pertama — berperan `member`. Ini disengaja:
kalau akun pertama otomatis jadi pengurus, siapa pun yang lebih cepat mendaftar
bisa menguasai panel admin.

Supabase → **SQL Editor** → **New query**, tempel ini (ganti emailnya dengan email
yang Anda pakai mendaftar tadi):

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'emailanda@contoh.com');
```

Klik **Run**. Harus muncul `Success. No rows returned`.

Periksa hasilnya:

```sql
select p.full_name, p.role, u.email
from profiles p join auth.users u on u.id = p.id;
```

Kolom `role` harus berisi `admin`. Muat ulang aplikasi (Ctrl+Shift+R) — menu **Admin**
kini terbuka.

> **Kalau tidak ada baris yang berubah**, berarti emailnya tidak cocok. Cek ejaannya:
> ```sql
> select email from auth.users;
> ```

**Tambahkan pengurus kedua sekarang juga.** Kalau hanya satu orang yang bisa mengelola
dan orang itu berhalangan atau kehilangan akses email, tidak ada yang bisa masuk panel
admin tanpa membuka SQL Editor lagi.

**Setelah pengurus pertama ada, SQL tidak dibutuhkan lagi.** Peran anggota lain bisa
diubah langsung dari halaman **Admin** → tabel daftar anggota → pilih peran di kolom
paling kanan.

Dua pengaman sudah dipasang di database, jadi tetap aman meski salah klik:
- Anggota biasa tidak bisa menaikkan perannya sendiri, walaupun mencoba lewat cara lain
- Pengurus terakhir tidak bisa diturunkan — harus ada penggantinya dulu

Perintah SQL lainnya ada di `supabase/jadikan-admin.sql`, untuk berjaga-jaga bila panel
admin tidak bisa diakses.

Coba juga sebaliknya: masuk dengan akun kedua (yang bukan pengurus), buka `/admin.html`. Harus muncul "Halaman khusus pengurus". Kalau bisa masuk, ada yang salah — hentikan dan periksa ulang.

---

# TAHAP 4 — Unggah ke GitHub

## 4.1 Tambahkan folder

1. Buka **GitHub Desktop**, masuk dengan akun GitHub Anda
2. **File** → **Add local repository**
3. Klik **Choose…**, pilih folder `sgkconnect`
4. Akan muncul peringatan *"This directory does not appear to be a Git repository"* — klik tautan **create a repository**
5. Isi:

| Kolom | Isi |
|---|---|
| Name | `sgkconnect` |
| Description | Aplikasi pemuda GKKA-I Jemaat Sendawar |
| Git ignore | **None** (sudah ada berkasnya) |
| License | None |

6. Klik **Create repository**

## 4.2 Pastikan .env tidak ikut

Di daftar berkas GitHub Desktop (kolom kiri), **`.env` dan `assets/js/config.js`
tidak boleh muncul**. Keduanya sudah disaring oleh `.gitignore`.

Kalau ternyata muncul, berarti `.gitignore` tidak terbaca — hentikan dan periksa,
jangan di-commit.

## 4.3 Commit pertama

Di kolom kiri bawah:
- **Summary:** `SGKConnect v1 — aplikasi pemuda GKKA-I Sendawar`
- Klik **Commit to main**

## 4.4 Kirim ke GitHub

1. Klik **Publish repository** di bagian atas
2. Centang **Keep this code private** kalau ingin tertutup
   (sekarang aman juga bila publik — kredensial tidak ada di dalam kode)
3. Klik **Publish repository**

Tunggu beberapa detik. Buka `https://github.com/USERNAME/sgkconnect` — berkas-berkasnya sudah ada di sana.

> **Privat atau publik?** Karena kredensial kini disimpan di environment variable
> (bukan di dalam kode), repo aman untuk dipublikasikan. Tapi privat tetap pilihan
> yang lebih tenang untuk aplikasi jemaat.

---

# TAHAP 5 — Terbitkan ke internet (Cloudflare Pages)

1. Masuk ke [dash.cloudflare.com](https://dash.cloudflare.com)
2. Menu kiri → **Compute (Workers)** → **Workers & Pages** → **Create** → tab **Pages** → **Connect to Git**
3. Klik **Connect GitHub**, izinkan aksesnya
   - Pilih **Only select repositories** → pilih `sgkconnect` → **Install & Authorize**
4. Pilih repo `sgkconnect` → **Begin setup**
5. Isi:

| Kolom | Isi |
|---|---|
| Project name | `sgkconnect` |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `node build.js` |
| Build output directory | `/` |

6. Buka bagian **Environment variables (advanced)**, klik **Add variable** dua kali:

| Variable name | Value |
|---|---|
| `SUPABASE_URL` | `https://abcdefghijkl.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |

Nilainya sama persis dengan isi `.env` di komputer Anda.

7. Klik **Save and Deploy**

Tunggu ±1 menit. Muncul **Success!** dan alamat seperti `https://sgkconnect.pages.dev`.

**Buka alamat itu di HP Anda.** Aplikasinya sudah online.

> **Kalau muncul catatan "Mode demo" di halaman masuk:** environment variable belum
> terbaca. Buka proyek Pages → **Settings** → **Variables and Secrets**, periksa ejaan
> nama variabelnya (harus persis `SUPABASE_URL` dan `SUPABASE_ANON_KEY`), lalu
> **Deployments** → **Retry deployment**.
>
> Perlu diingat: menambah atau mengubah variabel **tidak** otomatis membangun ulang.
> Selalu jalankan **Retry deployment** setelahnya.

---

# TAHAP 6 — Beres-beres setelah online

## 6.1 Perbarui alamat di Supabase — WAJIB

Tanpa langkah ini, pemulihan kata sandi dan konfirmasi email akan mengarah ke `localhost` dan gagal.

Supabase → **Authentication** → **URL Configuration**:

- **Site URL:** `https://sgkconnect.pages.dev`
- **Redirect URLs:** harus berisi **keduanya**:
  - `https://sgkconnect.pages.dev/**`
  - `http://localhost:5173/**` *(biarkan, supaya masih bisa uji coba di komputer)*

Klik **Save**.

## 6.2 Aktifkan konfirmasi email

Setelah semua uji coba beres: **Authentication** → **Providers** → **Email** → aktifkan **Confirm email**.

Sejak ini, anggota baru harus mengklik tautan di emailnya sebelum bisa masuk.

## 6.3 Uji di HP

Buka alamatnya di HP, lalu:
- [ ] Daftar akun baru → email konfirmasi masuk → tautannya berfungsi
- [ ] Kirim pokok doa → muncul juga di komputer
- [ ] Menu **Admin** ditolak untuk akun anggota biasa
- [ ] Chrome: menu titik tiga → **Add to Home screen** → aplikasi terpasang seperti aplikasi biasa
- [ ] Matikan data seluler, buka aplikasinya → masih terbuka (mode offline)

## 6.4 Domain sendiri (opsional)

Proyek Pages → **Custom domains** → **Set up a domain** → isi mis. `sgkconnect.gkkai-sendawar.org`.

Kalau domainnya sudah dikelola Cloudflare, DNS diatur otomatis dan HTTPS aktif sendiri. **Jangan lupa tambahkan domain baru itu ke Redirect URLs di Supabase** (ulangi 6.1).

---

# TAHAP 7 — Isi data jemaat

## Cara termudah: lewat aplikasi

Masuk sebagai pengurus, buka menu **Kelola Konten**. Di sana ada enam tab:

| Tab | Isi |
|---|---|
| Kegiatan | Agenda pemuda — judul, waktu, lokasi, kuota |
| Renungan | Renungan harian, dijadwalkan per tanggal |
| Pengumuman | Berita dari gereja |
| Kelompok & Tim | Kelompok sel dan tim pelayanan |
| Rencana Baca | Bacaan harian 1–365 |
| Moderasi Doa | Terbitkan, arsipkan, atau hapus pokok doa |

Klik **+ Tambah** untuk membuat, **Ubah** untuk menyunting, **Hapus** untuk membuang.
Tidak perlu membuka Supabase sama sekali.

## Cara massal: lewat CSV

Untuk mengisi banyak baris sekaligus — misalnya rencana baca 365 hari — lebih cepat
lewat CSV. Folder `data-template/` berisi berkas yang tinggal Anda isi:

| Berkas | Untuk tabel | Isi |
|---|---|---|
| `1-kegiatan.csv` | `events` | Agenda kegiatan pemuda |
| `2-renungan.csv` | `devotions` | Renungan harian, satu baris per tanggal |
| `3-kelompok.csv` | `groups` | Kelompok sel & tim pelayanan |
| `4-pengumuman.csv` | `announcements` | Pengumuman gereja |
| `5-rencana-baca.csv` | `reading_plan` | Rencana baca 365 hari |

## 7.1 Cara mengisi CSV

Buka dengan Excel atau Google Sheets. Perhatikan:

- **Baris pertama (judul kolom) jangan diubah atau dihapus**
- **Tanggal & waktu** (`starts_at`) format: `2026-09-04 07:00:00+08` — `+08` adalah WITA. Pakai `+07` untuk WIB, `+09` untuk WIT.
- **Tanggal saja** (`publish_on`) format: `2026-08-01`
- **`category`** pilih salah satu: `Ibadah`, `Retreat`, `Fellowship`, `Pembinaan`
- **`kind`** untuk kelompok: `cell` (kelompok sel) atau `team` (tim pelayanan)
- **`scene`** menentukan ilustrasinya: `worship`, `camp`, `bible`, `pray`, `fellow`, `music`, `mic`
- Teks yang mengandung koma **harus** diapit tanda kutip ganda

Simpan sebagai **CSV UTF-8** supaya huruf beraksen tidak rusak.

## 7.2 Unggah ke Supabase

1. Supabase → **Table Editor** → pilih tabel tujuan (mis. `events`)
2. Tombol **Insert** → **Import data from CSV**
3. Seret berkas CSV, periksa pratinjaunya, klik **Import data**

**Hapus data contoh dulu** kalau tidak ingin bercampur: pilih baris lama → klik kanan → **Delete row**.

## 7.3 Menambah satu data cepat

Untuk satu kegiatan saja, lebih cepat lewat SQL Editor:

```sql
insert into events (title, category, starts_at, location, capacity, scene)
values ('Ibadah Natal Pemuda', 'Ibadah', '2026-12-24 18:00:00+08',
        'GKKA Sendawar', 250, 'worship');
```

Renungan harian:

```sql
insert into devotions (publish_on, title, verse_ref, verse_text, body, author)
values ('2026-08-03', 'Judul Renungan', 'Roma 8:28',
        'Kutipan ayatnya di sini.',
        'Isi renungannya di sini.',
        'Nama penulis');
```

---

# Memperbarui aplikasi nanti

Setiap kali menyunting berkas:

1. Buka **GitHub Desktop** — perubahan muncul otomatis
2. Isi **Summary** singkat, mis. `perbarui renungan Agustus`
3. **Commit to main** → **Push origin**
4. Cloudflare membangun ulang sendiri dalam ±1 menit

**Kalau perubahan tidak terlihat:** buka `sw.js`, naikkan angka versinya (`sgk-v3` → `sgk-v4`), lalu commit & push lagi. Ini memaksa peramban mengambil versi baru.

**Kalau ada yang rusak:** Cloudflare → proyek → **Deployments** → cari versi sebelumnya yang baik → **Rollback to this deployment**. Situs kembali normal dalam hitungan detik.

---

# Kalau ada masalah

**"Mode demo" masih muncul setelah mengisi config.js**
Berkasnya belum tersimpan, atau peramban memakai versi lama. Tekan Ctrl+Shift+R. Periksa juga tanda kutip di `config.js` tidak terhapus.

**`npx: command not found`**
Node.js belum terpasang atau terminal belum dibuka ulang setelah pemasangan. Tutup terminal, buka baru, coba lagi.

**Port 5173 sudah dipakai**
Ganti angkanya: `npx serve . -l 5174`, lalu buka `http://localhost:5174`. Ingat menyesuaikan Redirect URL di Supabase.

**Gagal masuk padahal kata sandi benar**
Kalau **Confirm email** aktif, anggota harus mengklik tautan di emailnya dulu. Periksa juga folder spam.

**Tautan email mengarah ke localhost**
**Site URL** di Supabase belum diperbarui — ulangi langkah 6.1.

**Data tidak muncul padahal tabel berisi**
Kemungkinan aturan keamanan (RLS). Pastikan `schema.sql` dijalankan sampai selesai tanpa pesan merah, dan Anda mengaksesnya dalam keadaan sudah masuk.

**Cloudflare gagal build**
Pastikan **Build command kosong** dan **Build output directory** diisi `/`. Preset framework harus **None**.

**Halaman Admin bisa dibuka anggota biasa**
Berbahaya — hentikan pemakaian dan periksa. Jalankan di SQL Editor:
```sql
select id, full_name, role from profiles;
```
Hanya pengurus yang boleh berperan `admin` atau `leader`.

---

# Biaya

| Layanan | Gratis sampai | Cukup? |
|---|---|---|
| Cloudflare Pages | bandwidth tak terbatas, 500 build/bulan | selamanya |
| Supabase | 500 MB database, 50.000 pengguna aktif/bulan | jauh melebihi kebutuhan |
| GitHub | repo privat tak terbatas | selamanya |

Satu hal yang perlu diingat: **proyek Supabase gratis dijeda otomatis setelah 7 hari tanpa aktivitas.** Selama aplikasi dipakai mingguan, ini tidak akan terjadi. Kalau sempat terjeda, tinggal klik **Restore** di dashboard.

---

# Sebelum diumumkan ke jemaat

- [ ] **Confirm email** sudah diaktifkan kembali
- [ ] Sudah ada minimal 2 pengurus berperan `admin` (jangan hanya satu orang yang bisa mengelola)
- [ ] Data contoh sudah diganti data asli
- [ ] Sudah dicoba di minimal 3 HP berbeda
- [ ] Pengurus sepakat soal data pribadi mana yang boleh disimpan dan siapa yang bisa melihatnya
- [ ] Sudah membaca `STATUS-FITUR.md` supaya tidak menjanjikan fitur yang belum jadi
- [ ] Kata sandi database Supabase tersimpan di tempat yang diketahui lebih dari satu pengurus

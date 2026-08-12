# Status Fitur — apa yang sudah jalan, apa yang belum

Jujur dan apa adanya, supaya tidak ada kejutan saat dipresentasikan ke majelis.

Legenda:
**Penuh** = tersimpan di database, berlaku lintas perangkat ·
**Antarmuka** = tampilan sudah ada, data belum tersambung ·
**Belum** = perlu dikerjakan

---

## Sudah berfungsi penuh

| Fitur | Catatan |
|---|---|
| Daftar & masuk akun | Email + kata sandi lewat Supabase Auth |
| Lupa kata sandi | Tautan pemulihan dikirim ke email |
| Nomor anggota otomatis | Format `SGK-2026-00001`, dibuat saat daftar |
| Peran anggota/pemimpin/pendeta/pengurus | Panel admin menolak yang bukan pengurus |
| Renungan harian | Diambil per tanggal dari tabel `devotions` |
| Rencana baca 365 hari | Centang harian tersimpan, progres lintas perangkat |
| Dinding doa | Kirim permohonan, bisa anonim |
| Tombol "Saya mendoakan" | Penghitung nyata, satu orang satu kali |
| Pesan penguatan | Tersimpan di tabel `prayer_notes` |
| Doa realtime | Kiriman baru muncul tanpa muat ulang |
| Daftar kegiatan | Dari tabel `events`, urut waktu |
| Hitung mundur | Otomatis dari `starts_at` |
| RSVP | Tersimpan, sinkron antar perangkat |
| Check-in QR | Tercatat di tabel `attendance` |
| Riwayat kehadiran | Dari data check-in sungguhan |
| Kelompok sel & tim | Dari tabel `groups` |
| Ajukan bergabung | Masuk sebagai `pending`, menunggu persetujuan |
| Pengumuman | Dari tabel `announcements` |
| Profil & kartu QR | Nomor anggota asli, statistik dihitung nyata |
| Ubah nama profil | Tersimpan ke database |
| Dasbor admin | Jumlah anggota, kegiatan, doa, kehadiran — semua nyata |
| Grafik kehadiran | Dihitung dari data check-in 7 bulan terakhir |
| Ekspor CSV | Data anggota sungguhan, bisa dibuka di Excel |
| Ubah peran anggota | Anggota · Pemimpin · Pendeta · Pengurus, dengan pengaman di database |
| Kelola kegiatan | Tambah, ubah, hapus dari halaman Kelola Konten |
| Kelola renungan | Termasuk penjadwalan per tanggal |
| Kelola pengumuman | Tambah, ubah, hapus |
| Kelola kelompok & tim | Tambah, ubah, hapus |
| Kelola rencana baca | Isi per hari, 1–365 |
| Moderasi pokok doa | Terbitkan, arsipkan, atau hapus |
| Galeri foto | Unggah gambar langsung dari panel ke Supabase Storage |
| Video & podcast | Tautan YouTube/Spotify, muncul di beranda |
| Tampilan & identitas | Nama aplikasi, tagline, banner, ayat minggu — semua dari panel |
| Persetujuan anggota kelompok | Setujui atau tolak permintaan bergabung |
| Kehadiran manual | Catat kehadiran tanpa QR, cari anggota lalu tandai |
| Halaman publik | Jadwal, renungan, pengumuman, galeri terpilih — tanpa perlu masuk |
| Foto publik per gambar | Pengurus memilih satu per satu foto mana yang boleh dilihat umum |
| Dua bahasa | Indonesia & Inggris, tombol ID/EN di pojok kanan atas |
| Biodata anggota | HP, tanggal lahir, pekerjaan, alamat, kontak darurat — semua opsional |
| Foto profil | Unggah sendiri, tampil di kartu anggota dan sidebar |
| Privasi kontak | Anggota memilih apakah nomor HP boleh dilihat sesama anggota |
| Ulang tahun otomatis | Diambil dari tanggal lahir yang diizinkan tampil |
| Galeri foto | Halaman tersendiri, penampil layar penuh, geser kiri-kanan |
| Unduh foto | Satu per satu, atau pilih beberapa lalu unduh sekaligus |
| Forum diskusi | Buat topik, balas, hapus milik sendiri, pembaruan langsung |
| Obrolan kelompok | Chat di dalam kelompok sel & tim, hanya anggota yang bisa baca |
| Banner kegiatan | Tiap acara bisa pakai foto/poster sendiri |
| Latar beranda | Gambar atau video, diatur dari Kelola Konten |
| Keluar akun | Sesi dihapus dengan benar |
| Mode gelap | Tersimpan per perangkat |
| PWA & offline | Bisa dipasang di layar utama |

---

## Antarmuka sudah ada, data belum tersambung

Bagian ini tampil dengan data contoh. Aman untuk demo, tapi jangan diklaim sudah jalan.

| Fitur | Yang perlu dikerjakan |
|---|---|
| Ulang tahun | Kolom `birthday` sudah ada di `profiles`; kueri "ulang tahun bulan ini" belum dibuat |
| Penanda & sorotan Alkitab | Perlu tabel `bookmarks` |
| Teks Alkitab lengkap | Perlu sumber teks berlisensi (mis. API Alkitab) — jangan salin dari situs berhak cipta |
| Pengaturan notifikasi | Sakelar tampil tapi belum menyimpan |
| Ekspor PDF | Memakai cetak peramban; belum laporan terformat |
| Kirim pengumuman ke anggota | Pengumuman bisa dibuat, tapi belum ada notifikasi keluar |

---

## Belum ada sama sekali

| Fitur | Pertimbangan |
|---|---|
| Pemindai QR sungguhan | Sekarang QR hanya **ditampilkan**. Untuk memindai perlu kamera (`getUserMedia` + pustaka `jsQR`) di perangkat pengurus |
| Notifikasi push | Perlu layanan push dan izin peramban |
| Laporan terjadwal | Perlu Supabase Edge Function |

---

## Saran urutan pengerjaan

Kalau ingin dilanjutkan, ini urutan yang paling terasa manfaatnya:

1. **Pemindai QR untuk pengurus** — melengkapi alur kehadiran yang sudah 90% jadi
2. **Layar persetujuan anggota kelompok** — permintaan sudah masuk, tinggal ditindaklanjuti
3. **Forum diskusi** — tabelnya sudah siap, tinggal antarmuka
4. **Galeri foto** — paling disukai anak muda, tapi butuh Storage
5. **Ulang tahun otomatis** — kueri sederhana, hasilnya hangat

---

## Catatan penting sebelum presentasi

- **Teks Alkitab**: aplikasi ini tidak menyertakan teks Alkitab lengkap. Ayat yang muncul adalah kutipan pendek dalam renungan. Untuk fitur Alkitab penuh, gunakan sumber yang izinnya jelas — misalnya Alkitab Terjemahan Baru melalui lisensi LAI, atau API publik yang mengizinkan penggunaan.
- **Foto orang**: ilustrasi dalam aplikasi digambar sebagai vektor, bukan foto stok, jadi tidak ada masalah hak cipta. Ganti dengan dokumentasi gereja sendiri kapan saja.
- **Data pribadi jemaat**: nomor telepon dan tanggal lahir tersimpan di `profiles`. Pastikan pengurus memahami siapa yang bisa melihat apa, dan minta persetujuan anggota sebelum mengisi data ini.

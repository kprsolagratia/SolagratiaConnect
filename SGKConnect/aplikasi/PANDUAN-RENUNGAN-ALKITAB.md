# Renungan Harian & Teks Alkitab

Dua hal yang sering ditanyakan pengurus. Dijelaskan apa adanya.

---

## Bagian 1 — Membuat renungan harian

Renungan **tidak dibuat otomatis**. Pengurus menulisnya sendiri, lalu menjadwalkan
per tanggal. Aplikasi menampilkan renungan yang tanggalnya cocok dengan hari itu.

### Cara mengisi

1. Masuk sebagai pengurus, pendeta, atau pemimpin
2. Buka menu **Kelola Konten**
3. Pilih tab **Renungan**
4. Tekan **+ Tambah**

| Kolom | Penjelasan |
|---|---|
| **Tanggal terbit** | Hari saat renungan ini muncul. Satu renungan per tanggal. |
| **Judul** | Contoh: "Berjalan dalam Terang" |
| **Referensi ayat** | Contoh: "1 Yohanes 1:7" |
| **Kutipan ayat** | Kutipan pendek saja, bukan seluruh pasal |
| **Isi renungan** | Perenungan singkat, 3–6 kalimat |
| **Penulis** | Nama penulis atau "Tim Renungan Pemuda" |

Tekan **Simpan**. Kalau tanggalnya hari ini, renungan langsung tampil di Beranda
dan halaman Alkitab.

### Isi sekaligus untuk sepekan

Cara paling praktis: sekali duduk setiap Sabtu, isi tujuh renungan untuk sepekan
ke depan. Tinggal ganti tanggalnya. Anggota otomatis melihat yang sesuai harinya
tanpa pengurus perlu membuka aplikasi tiap pagi.

### Mengisi banyak sekaligus lewat CSV

Untuk sebulan atau setahun penuh, lebih cepat lewat Supabase:

1. Siapkan berkas dengan kolom:
   `publish_on, title, verse_ref, verse_text, body, author`
2. Supabase → **Table Editor** → tabel `devotions`
3. **Insert** → **Import data from CSV**

Contoh isi (lihat juga `data-template/2-renungan.csv`):

```
publish_on,title,verse_ref,verse_text,body,author
2026-08-15,Berjalan dalam Terang,1 Yohanes 1:7,"Tetapi jika kita hidup di dalam terang...","Terang bukan sesuatu yang kita hasilkan, melainkan yang kita pantulkan.",Tim Renungan Pemuda
2026-08-16,Kekuatan yang Diperbarui,Yesaya 40:31,"Orang yang menanti-nantikan TUHAN mendapat kekuatan baru.","Menanti bukan berarti diam.",Tim Renungan Pemuda
```

### Kalau tanggalnya kosong

Aplikasi menampilkan renungan **terbaru yang tanggalnya sudah lewat**. Jadi kalau
lupa mengisi hari Selasa, renungan hari Senin tetap tampil — bukan halaman kosong.

### Soal hak cipta renungan

Renungan yang ditulis sendiri oleh tim jemaat aman sepenuhnya. **Jangan menyalin
renungan dari buku, situs, atau aplikasi lain** tanpa izin — itu tetap berhak cipta
meskipun dibagikan gratis. Kalau ingin memakai renungan dari sumber lain, cantumkan
sumbernya dan pastikan penerbitnya mengizinkan.

---

## Bagian 2 — Teks Alkitab

### Keadaan sekarang

Tombol kitab di halaman Alkitab **membuka Alkitab SABDA di tab baru**. Ini pilihan
yang sah: aplikasi hanya menautkan, tidak menyalin teksnya.

Yang sudah berfungsi penuh tanpa perlu apa pun:
- Renungan harian dengan kutipan ayat
- Rencana baca 365 hari (referensi pasal + kutipan pendek)
- Penanda progres membaca

### Mengapa teks lengkapnya tidak disertakan

Alkitab Terjemahan Baru berhak cipta **Lembaga Alkitab Indonesia (LAI)**. Menyalin
seluruh teksnya ke dalam aplikasi — meskipun gereja sendiri yang memakai dan tidak
dijual — tetap melanggar hak cipta. Banyak aplikasi gereja melakukannya tanpa sadar.

### Cara menampilkan teks Alkitab di dalam aplikasi

LAI menyediakan **API resmi**: <https://bible-api.alkitab.or.id>

Langkahnya:

1. Kirim email ke **info@alkitab.or.id**
2. Jelaskan konteksnya: aplikasi internal jemaat GKKA-I Sendawar, bukan komersial,
   dipakai untuk pembinaan pemuda
3. Ikuti proses pendaftaran di dokumentasi Postman yang mereka berikan
4. Setelah menerima kunci, buka `assets/js/config.js` dan isi:

```js
"ALKITAB_API_KEY": "kunci-dari-LAI",
```

5. Commit dan deploy

Setelah itu, menekan kitab langsung menampilkan pasalnya di dalam aplikasi,
lengkap dengan keterangan hak cipta LAI. Tidak ada perubahan lain yang diperlukan —
penyambungnya sudah disiapkan.

> **Catatan:** LAI menyebut penggunaan di luar keperluan pribadi atau internal
> sederhana perlu didiskusikan dulu dengan mereka. Sampaikan apa adanya bahwa ini
> aplikasi jemaat — itu justru konteks yang mereka layani.

### Alternatif bila belum mendapat kunci

Biarkan apa adanya. Membuka Alkitab SABDA di tab baru sudah cukup untuk kebutuhan
sehari-hari, dan sepenuhnya sah. Banyak jemaat juga sudah punya aplikasi Alkitab
sendiri di HP-nya.

---

## Ringkasan

| Hal | Status |
|---|---|
| Menulis renungan harian | Bisa sekarang, lewat Kelola Konten |
| Menjadwalkan renungan sepekan/sebulan | Bisa sekarang |
| Impor renungan massal lewat CSV | Bisa sekarang |
| Rencana baca 365 hari | Bisa sekarang |
| Membuka kitab (tautan ke luar) | Bisa sekarang |
| Teks Alkitab di dalam aplikasi | Perlu kunci API dari LAI |

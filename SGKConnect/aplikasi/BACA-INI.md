# Templat Data Jemaat

Lima berkas CSV yang tinggal diisi, lalu diunggah ke Supabase.
Panduan lengkapnya ada di `PANDUAN-LENGKAP.md` **Tahap 7**.

| Berkas | Tabel tujuan |
|---|---|
| `1-kegiatan.csv` | `events` |
| `2-renungan.csv` | `devotions` |
| `3-kelompok.csv` | `groups` |
| `4-pengumuman.csv` | `announcements` |
| `5-rencana-baca.csv` | `reading_plan` |

## Aturan penting

- **Baris pertama jangan diubah** — itu nama kolom yang dikenali sistem
- **Simpan sebagai CSV UTF-8**, bukan CSV biasa, supaya huruf beraksen tidak rusak
- Teks yang mengandung koma harus diapit tanda kutip ganda: `"Ibadah, doa, dan pujian"`
- Kolom kosong boleh dibiarkan kosong (jangan diisi tanda strip atau spasi)

## Format nilai

| Kolom | Format | Contoh |
|---|---|---|
| `starts_at` | tanggal + jam + zona | `2026-09-04 07:00:00+08` |
| `publish_on` | tanggal saja | `2026-08-01` |
| `capacity` | angka | `150` |
| `day` | 1 sampai 365 | `236` |

Zona waktu: `+07` WIB · `+08` WITA (Sendawar) · `+09` WIT

## Pilihan nilai yang diizinkan

**`category`** (kegiatan): `Ibadah` · `Retreat` · `Fellowship` · `Pembinaan`

**`kind`** (kelompok): `cell` (kelompok sel) · `team` (tim pelayanan)

**`scene`** (ilustrasi latar):
| Nilai | Gambar |
|---|---|
| `worship` | ibadah dengan tangan terangkat saat matahari terbenam |
| `camp` | api unggun dan pegunungan |
| `bible` | Alkitab terbuka |
| `pray` | tangan berdoa |
| `fellow` | kebersamaan pemuda |
| `music` | not musik |
| `mic` | mikrofon podcast |

## Rencana baca 365 hari

Berkas `5-rencana-baca.csv` sengaja hanya berisi beberapa contoh.
Untuk mengisi penuh, siapkan 365 baris di Excel dengan kolom `day`, `passage`, `snippet`,
lalu unggah sekaligus. Kolom `snippet` adalah kutipan pendek — **jangan menyalin
seluruh pasal dari sumber berhak cipta.**

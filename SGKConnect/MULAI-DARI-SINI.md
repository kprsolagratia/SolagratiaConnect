# SGKConnect — Paket Lengkap

**Sola Gratia Koinonia Connect** · GKKA-I Jemaat Sendawar
*Connected in Christ. Growing in Faith. Serving with Love.*

---

## Cara tercepat melihat aplikasinya

```bash
cd aplikasi
npm install
npm run dev
```

Buka `http://localhost:5173` → klik **Lihat sebagai tamu**.

`npm install` cukup sekali. Berikutnya langsung `npm run dev` saja.
Tanpa database pun aplikasi jalan penuh dalam **mode demo** dengan data contoh.

Untuk menghentikan server: **Ctrl + C**.

---

## Isi paket

```
SGKConnect/
├── MULAI-DARI-SINI.md          ← Anda sedang membaca ini
│
├── aplikasi/                   Aplikasi web siap deploy
│   ├── PANDUAN-LENGKAP.md      ★ nol sampai online, runtut
│   ├── STATUS-FITUR.md         Daftar jujur: fitur mana yang sudah jalan
│   ├── DEPLOY.md               Versi ringkas panduan deploy
│   ├── README.md               Dokumentasi teknis
│   ├── package.json            npm install → npm run dev
│   ├── .env.example            Salin jadi .env saat mau pakai database
│   ├── build.js                Membuat config.js dari .env / env variable
│   ├── supabase/schema.sql     Skema database, dijalankan sekali di Supabase
│   ├── data-template/          Templat CSV untuk diisi data jemaat
│   ├── index.html              Halaman masuk
│   ├── beranda.html            Dasbor anggota
│   ├── kegiatan.html · alkitab.html · doa.html
│   ├── komunitas.html · profil.html · admin.html
│   ├── konsep.html             Papan konsep versi web (bisa diklik)
│   └── assets/                 CSS, JavaScript, logo, ikon
│
└── presentasi/                 Bahan untuk rapat majelis
    ├── konsep-uiux-4k.png      Papan konsep 3840×2160 (16:9)
    ├── konsep-uiux.pdf         Versi vektor, aman dicetak besar
    ├── konsep-uiux.svg         Bisa diedit di Figma/Illustrator
    └── logo/                   Logo resmi dalam berbagai varian
```

---

## Tahap berikutnya

| Mau apa | Buka |
|---|---|
| Lihat tampilan sekarang | perintah di atas |
| Presentasi ke majelis | `presentasi/konsep-uiux-4k.png` + `aplikasi/STATUS-FITUR.md` |
| Pakai database sungguhan | `aplikasi/PANDUAN-LENGKAP.md` Tahap 2 |
| Terbitkan ke internet | `aplikasi/PANDUAN-LENGKAP.md` Tahap 4–6 |

---

## Soal kredensial

Tidak ada kunci rahasia di dalam kode:

```
.env  (di komputer, tidak ikut ter-commit)   ┐
                                             ├──►  build.js  ──►  config.js
Cloudflare › Variables and Secrets           ┘
```

`.env`, `config.js`, dan `node_modules` sudah terdaftar di `.gitignore`,
jadi tidak akan pernah terunggah ke GitHub.

---

## Tiga hal yang perlu diputuskan pengurus

1. **Teks Alkitab** — aplikasi ini sengaja tidak memuat teks Alkitab lengkap.
   Menyalinnya dari situs lain melanggar hak cipta LAI.
2. **Data pribadi jemaat** — sepakati siapa boleh melihat apa sebelum mengisi data.
3. **Siapa pengurusnya** — minimal dua orang berperan `admin`.

---

© GKKA-I Jemaat Sendawar · Dibuat untuk pelayanan pemuda

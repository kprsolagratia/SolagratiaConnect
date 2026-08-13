/* ============================================================
   SGKConnect — konten contoh (ganti dengan API/CMS saat produksi)
   ============================================================ */
window.DATA = {
  gereja: { nama: 'GKKA-I Jemaat Sendawar', app: 'SGKConnect', tagline: 'Connected in Christ. Growing in Faith. Serving with Love.' },

  renungan: {
    judul: 'Berjalan dalam Terang',
    ayat: '1 Yohanes 1:7',
    kutipan: 'Tetapi jika kita hidup di dalam terang sama seperti Dia ada di dalam terang, maka kita beroleh persekutuan seorang dengan yang lain.',
    isi: 'Terang bukan sesuatu yang kita hasilkan, melainkan sesuatu yang kita pantulkan. Ketika hidup kita berjalan dekat dengan sumber terang, orang di sekitar kita ikut melihat jalannya. Hari ini, pilih satu langkah kecil yang jujur — sebuah percakapan yang ditunda, maaf yang belum diucapkan, atau janji yang perlu ditepati.',
    penulis: 'Tim Renungan Pemuda'
  },

  ayatMinggu: { teks: 'Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah.', ref: 'Efesus 2:8' },

  kegiatan: [
    { id:'e1', judul:'Youth Camp 2026', tgl:'2026-09-04T07:00:00', tglTeks:'4–6 September 2026', lokasi:'Sendawar Camp Ground', scene:'camp', kuota:150, terdaftar:128, kategori:'Retreat' },
    { id:'e2', judul:'Youth Worship Night', tgl:'2026-08-15T18:30:00', tglTeks:'15 Agustus 2026 · 18.30', lokasi:'SG Hall, Sendawar', scene:'music', kuota:200, terdaftar:96, kategori:'Ibadah' },
    { id:'e3', judul:'Fun Day & Olahraga', tgl:'2026-08-22T08:00:00', tglTeks:'22 Agustus 2026 · 08.00', lokasi:'Taman Kota Sendawar', scene:'fellow', kuota:120, terdaftar:64, kategori:'Fellowship' },
    { id:'e4', judul:'Pemahaman Alkitab', tgl:'2026-08-08T19:00:00', tglTeks:'Setiap Jumat · 19.00', lokasi:'Ruang Serbaguna', scene:'bible', kuota:60, terdaftar:41, kategori:'Pembinaan' }
  ],

  riwayatHadir: [
    { judul:'Youth Worship Night', tgl:'31 Mei 2026', status:'Hadir' },
    { judul:'Fun Day', tgl:'7 Juni 2026', status:'Hadir' },
    { judul:'Doa Malam', tgl:'14 Juni 2026', status:'Izin' },
    { judul:'Pemahaman Alkitab', tgl:'21 Juni 2026', status:'Hadir' }
  ],

  doa: [
    { id:'p1', judul:'Pemulihan keluarga', isi:'Mohon doa untuk pemulihan hubungan dalam keluarga kami dan kesehatan ayah.', oleh:'Anonim', jml:23, waktu:'2 jam lalu', anonim:true },
    { id:'p2', judul:'Ujian akhir studi', isi:'Doakan supaya saya tenang, sehat, dan mengerjakan dengan jujur.', oleh:'Grace A.', jml:18, waktu:'5 jam lalu', anonim:false },
    { id:'p3', judul:'Pekerjaan pertama', isi:'Sedang menunggu panggilan kerja. Doakan pintu yang Tuhan bukakan.', oleh:'David K.', jml:31, waktu:'kemarin', anonim:false },
    { id:'p4', judul:'Pelayanan tim musik', isi:'Doakan kekompakan tim dan hati yang tulus dalam melayani.', oleh:'Anonim', jml:12, waktu:'2 hari lalu', anonim:true }
  ],

  kelompok: [
    { nama:'GS Zion', pemimpin:'Ev. Ruth Mangesa', anggota:18, jadwal:'Rabu · 19.00', scene:'fellow' },
    { nama:'GS Betheda', pemimpin:'Sdr. Yosua L.', anggota:15, jadwal:'Kamis · 19.00', scene:'bible' },
    { nama:'GS Nazareth', pemimpin:'Sdri. Marta P.', anggota:14, jadwal:'Jumat · 18.30', scene:'pray' },
    { nama:'GS Filadelfia', pemimpin:'Sdr. Andre S.', anggota:12, jadwal:'Sabtu · 16.00', scene:'worship' }
  ],

  tim: [
    { nama:'Tim Musik', ket:'Latihan Jumat · 19.00', scene:'music' },
    { nama:'Tim Doa', ket:'Doa pagi Senin · 05.30', scene:'pray' },
    { nama:'Tim Kreatif', ket:'Desain & dekorasi acara', scene:'fellow' },
    { nama:'Tim Media', ket:'Live streaming & dokumentasi', scene:'mic' }
  ],

  forum: [
    { judul:'Bagaimana menjaga waktu teduh saat kuliah?', oleh:'Grace A.', balasan:14, waktu:'aktif 5 menit lalu' },
    { judul:'Rekomendasi buku untuk pemuda baru percaya', oleh:'Yosua L.', balasan:9, waktu:'aktif 1 jam lalu' },
    { judul:'Ide pelayanan sosial di Sendawar', oleh:'Marta P.', balasan:22, waktu:'aktif kemarin' }
  ],

  bacaan: [
    { hari:236, kitab:'Mazmur 119:105', teks:'Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.', selesai:true },
    { hari:237, kitab:'Mazmur 119:106', teks:'Aku telah bersumpah dan aku akan menepatinya, untuk berpegang pada hukum-hukum-Mu yang adil.', selesai:false },
    { hari:238, kitab:'Amsal 3:5-6', teks:'Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.', selesai:false }
  ],

  podcast: [
    { judul:'Muda & Setia — Ep. 12', ket:'Menjaga hati di tengah kesibukan', durasi:'28 menit', progres:36 },
    { judul:'Khotbah Minggu — Kasih Karunia', ket:'Pdt. Samuel T.', durasi:'42 menit', progres:0 }
  ],

  pengumuman: [
    { judul:'Pendaftaran Youth Camp dibuka', isi:'Kuota 150 orang. Tutup 20 Agustus atau saat kuota penuh.', tgl:'30 Jul 2026' },
    { judul:'Latihan gabungan tim musik', isi:'Sabtu, 09.00 di SG Hall. Semua tim wajib hadir.', tgl:'28 Jul 2026' },
    { judul:'Persembahan khusus renovasi', isi:'Terima kasih atas dukungan jemaat. Laporan tersedia di kantor gereja.', tgl:'25 Jul 2026' }
  ],

  ultah: [
    { nama:'Grace Amelia', ket:'Hari ini · GS Betheda', scene:'face3' },
    { nama:'David Kurnia', ket:'3 Agustus · GS Nazareth', scene:'face2' }
  ],

  statistik: {
    anggota:256, kegiatanAktif:8, doaMasuk:142, hadirMingguIni:178,
    kehadiran:[112,128,121,146,158,166,178],
    bulan:['Jan','Feb','Mar','Apr','Mei','Jun','Jul'],
    sebaran:[[35,'#102A43'],[25,'#D4AF37'],[20,'#3E7CB1'],[20,'#9FB6CC']],
    sebaranLabel:['GS Zion · 35%','GS Betheda · 25%','GS Nazareth · 20%','GS Filadelfia · 20%'],
    keaktifan:[['Ibadah pemuda',178],['Kelompok sel',142],['Doa pagi',86],['Pelayanan',64]]
  },

  profil: {
    nama:'Theo Rakyan', peran:'Pemuda · GS Zion', id:'SGK-2026-00156',
    kehadiran:85, bacaan:65, doa:23,
    lencana:['30 hari berturut','Pendoa setia','Hadir 12 kegiatan']
  }
};

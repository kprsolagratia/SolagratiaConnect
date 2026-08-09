-- ============================================================
--  SGKConnect — RESET TOTAL DATABASE
--  ============================================================
--  Untuk membersihkan database yang terlanjur berisi data ganda,
--  lalu memulai ulang dari nol.
--
--  URUTAN PENGERJAAN:
--    1. Jalankan BAGIAN 1 di bawah  (menghapus semua)
--    2. Jalankan file  schema.sql         (skema utama)
--    3. Jalankan file  schema-2-media.sql (galeri, media, pengaturan)
--    4. Jalankan BAGIAN 2 di bawah  (kembalikan profil & jadikan admin)
--    5. Jalankan BAGIAN 3 di bawah  (periksa hasilnya)
--
--  Cara menjalankan:
--    Supabase Studio → SQL Editor → New query → tempel → Run
-- ============================================================


-- ============================================================
--  BAGIAN 1 — HAPUS SEMUA
-- ============================================================
--  PERINGATAN: perintah ini menghapus SELURUH data aplikasi —
--  kegiatan, pokok doa, kehadiran, kelompok, dan profil anggota.
--
--  Akun login (email & kata sandi) TIDAK ikut terhapus, karena
--  tersimpan di auth.users. Itu sebabnya BAGIAN 2 diperlukan.
--
--  Jangan jalankan ini kalau aplikasi sudah dipakai jemaat dan
--  datanya masih dibutuhkan.
-- ============================================================

drop view if exists pending_members cascade;
drop view if exists group_stats     cascade;
drop view if exists prayer_stats    cascade;
drop view if exists event_stats     cascade;

drop table if exists
  reading_progress,
  reading_plan,
  prayer_notes,
  prayer_supports,
  prayers,
  attendance,
  rsvps,
  events,
  forum_replies,
  forum_topics,
  announcements,
  group_members,
  groups,
  devotions,
  gallery,
  media,
  settings,
  profiles
cascade;

drop function if exists handle_new_user()        cascade;
drop function if exists is_admin()               cascade;
drop function if exists jaga_perubahan_peran()   cascade;
drop function if exists jaga_pengurus_terakhir() cascade;

drop sequence if exists member_no_seq cascade;

--  Berhenti di sini.
--  Jalankan schema.sql, lalu schema-2-media.sql,
--  baru lanjut ke BAGIAN 2.


-- ============================================================
--  BAGIAN 2 — KEMBALIKAN PROFIL & TETAPKAN PENGURUS
-- ============================================================
--  Akun Anda masih ada di auth.users, tapi tabel profiles sudah
--  kosong. Tanpa langkah ini, aplikasi tidak akan mengenali Anda
--  dan akan terus melempar ke halaman masuk.
-- ============================================================

-- 2a. Buatkan profil untuk semua akun yang sudah terdaftar
insert into profiles (id, full_name, member_no, role)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
       'SGK-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('member_no_seq')::text, 5, '0'),
       'member'
from auth.users u
on conflict (id) do nothing;


-- 2b. Jadikan diri Anda pengurus
--     GANTI alamat email di bawah dengan email yang Anda pakai mendaftar.
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'emailanda@contoh.com');


-- 2c. Kalau lupa email apa yang dipakai, jalankan ini dulu:
-- select email, created_at from auth.users order by created_at;


-- ============================================================
--  BAGIAN 3 — PERIKSA HASILNYA
-- ============================================================

select 'events'        as tabel, count(*) as jumlah from events
union all select 'groups',        count(*) from groups
union all select 'devotions',     count(*) from devotions
union all select 'announcements', count(*) from announcements
union all select 'reading_plan',  count(*) from reading_plan
union all select 'profiles',      count(*) from profiles
union all select 'settings',      count(*) from settings
order by tabel;

--  HASIL YANG DIHARAPKAN
--    announcements  2
--    devotions      1
--    events         4
--    groups         8
--    profiles       sejumlah akun yang sudah mendaftar
--    reading_plan   3
--    settings       1
--
--  Kalau events lebih dari 4, berarti schema.sql terlanjur
--  dijalankan dua kali. Ulangi dari BAGIAN 1.


-- Pastikan ada pengurus
select p.full_name, p.role, u.email
from profiles p
join auth.users u on u.id = p.id
where p.role in ('admin', 'leader');

--  Kalau hasilnya kosong, langkah 2b belum berhasil —
--  periksa lagi ejaan emailnya.


-- ============================================================
--  SETELAH SELESAI
-- ============================================================
--  1. Buka aplikasi, tekan Ctrl+Shift+R (muat ulang paksa)
--  2. "Kegiatan mendatang" harus menunjukkan 4, bukan 16
--  3. Menu "Kelola Konten" muncul di sisi kiri
--  4. Buka Kelola Konten → tab Tampilan & Identitas untuk
--     mengganti nama aplikasi, banner, dan ayat minggu ini
-- ============================================================


-- ============================================================
--  ALTERNATIF: MULAI BENAR-BENAR DARI NOL
-- ============================================================
--  Kalau ingin menghapus akun login juga:
--    1. Jalankan BAGIAN 1
--    2. Supabase → Authentication → Users → hapus semua pengguna
--    3. Jalankan schema.sql dan schema-2-media.sql
--    4. LEWATI Bagian 2a — daftar ulang lewat aplikasi
--    5. Jalankan Bagian 2b untuk menjadikan akun baru itu pengurus
-- ============================================================

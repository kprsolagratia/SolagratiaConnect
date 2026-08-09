-- ============================================================
--  SGKConnect — Tambahan 3: Halaman Publik
--  ------------------------------------------------------------
--  Membuka SEBAGIAN isi aplikasi untuk pengunjung yang belum
--  masuk — hanya yang memang layak dilihat umum.
--
--  Jalankan SETELAH schema.sql dan schema-2-media.sql.
--  Aman dijalankan berulang kali.
-- ============================================================
--
--  YANG DIBUKA UNTUK UMUM
--    ✓ Jadwal kegiatan (judul, waktu, lokasi)
--    ✓ Renungan harian & ayat
--    ✓ Rencana baca Alkitab
--    ✓ Pengumuman gereja
--    ✓ Nama & jadwal kelompok sel / tim pelayanan
--    ✓ Video, podcast, streaming
--    ✓ Foto galeri — HANYA yang ditandai publik satu per satu
--    ✓ Identitas gereja (nama, tagline, jadwal ibadah)
--
--  YANG TETAP TERTUTUP
--    ✗ Pokok doa            — isinya sangat pribadi
--    ✗ Data & profil anggota — nama, nomor anggota, kontak
--    ✗ Kehadiran & RSVP      — siapa datang ke mana
--    ✗ Progres baca pribadi
--    ✗ Forum diskusi
--    ✗ Ulang tahun anggota
--    ✗ Seluruh statistik pengurus
-- ============================================================


-- ------------------------------------------------------------
--  1. Foto galeri: pilih satu per satu mana yang boleh publik
--     Bawaannya TERTUTUP. Pengurus menandai sendiri di aplikasi.
-- ------------------------------------------------------------
alter table gallery add column if not exists is_public boolean not null default false;


-- ------------------------------------------------------------
--  2. Izin baca untuk pengunjung (peran "anon")
-- ------------------------------------------------------------

-- Kegiatan — hanya yang sudah diterbitkan
drop policy if exists "publik baca kegiatan" on events;
create policy "publik baca kegiatan" on events
  for select to anon using (published = true);

-- Renungan — hanya yang tanggal terbitnya sudah lewat
drop policy if exists "publik baca renungan" on devotions;
create policy "publik baca renungan" on devotions
  for select to anon using (publish_on <= current_date);

-- Pengumuman
drop policy if exists "publik baca pengumuman" on announcements;
create policy "publik baca pengumuman" on announcements
  for select to anon using (publish_on <= current_date);

-- Rencana baca Alkitab
drop policy if exists "publik baca rencana" on reading_plan;
create policy "publik baca rencana" on reading_plan
  for select to anon using (true);

-- Kelompok sel & tim pelayanan
drop policy if exists "publik baca kelompok" on groups;
create policy "publik baca kelompok" on groups
  for select to anon using (true);

-- Video, podcast, streaming
drop policy if exists "publik baca media" on media;
create policy "publik baca media" on media
  for select to anon using (true);

-- Foto — HANYA yang ditandai publik
drop policy if exists "publik baca galeri" on gallery;
create policy "publik baca galeri" on gallery
  for select to anon using (is_public = true);

-- Identitas gereja
drop policy if exists "publik baca pengaturan" on settings;
create policy "publik baca pengaturan" on settings
  for select to anon using (true);


-- ------------------------------------------------------------
--  3. Tampilan ringkas kegiatan untuk publik
--     Sengaja TIDAK memuat jumlah pendaftar, karena itu
--     menyiratkan data kehadiran anggota.
-- ------------------------------------------------------------
create or replace view public_events with (security_invoker = on) as
  select id, title, category, starts_at, ends_at, location, map_query, scene, description
  from events
  where published = true;

grant select on public_events to anon, authenticated;


-- ------------------------------------------------------------
--  4. Periksa hasilnya
-- ------------------------------------------------------------
select tablename, policyname, roles
from pg_policies
where schemaname = 'public' and 'anon' = any(roles)
order by tablename;

--  Harus muncul 8 baris: announcements, devotions, events,
--  gallery, groups, media, reading_plan, settings.


-- ============================================================
--  MENUTUP KEMBALI
--  Kalau suatu saat halaman publik tidak diinginkan lagi:
-- ============================================================
-- drop policy if exists "publik baca kegiatan"   on events;
-- drop policy if exists "publik baca renungan"   on devotions;
-- drop policy if exists "publik baca pengumuman" on announcements;
-- drop policy if exists "publik baca rencana"    on reading_plan;
-- drop policy if exists "publik baca kelompok"   on groups;
-- drop policy if exists "publik baca media"      on media;
-- drop policy if exists "publik baca galeri"     on gallery;
-- drop policy if exists "publik baca pengaturan" on settings;
-- drop view if exists public_events;

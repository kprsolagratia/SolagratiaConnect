-- ============================================================
--  SGKConnect — Tambahan 9: Perbaikan Izin
--  ------------------------------------------------------------
--  Memperbaiki galat:
--    "new row violates row-level security policy for table
--     attendance / group_members"
--
--  Penyebab: aplikasi memakai upsert (simpan-atau-perbarui),
--  yang membutuhkan izin UPDATE — sementara tabel ini hanya
--  punya izin INSERT dan DELETE.
--
--  Jalankan SETELAH schema.sql sampai schema-8.
--  Aman dijalankan berulang kali.
-- ============================================================

-- ---------- kunci unik supaya upsert punya acuan ----------
create unique index if not exists attendance_event_user_uniq
  on attendance (event_id, user_id);


-- ---------- KEHADIRAN ----------
-- Anggota mencatat kehadirannya sendiri; pengurus boleh mencatat siapa pun.
drop policy if exists "tulis kehadiran" on attendance;
create policy "tulis kehadiran" on attendance
  for insert to authenticated
  with check (user_id = auth.uid() or is_admin());

drop policy if exists "perbarui kehadiran" on attendance;
create policy "perbarui kehadiran" on attendance
  for update to authenticated
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

drop policy if exists "hapus kehadiran" on attendance;
create policy "hapus kehadiran" on attendance
  for delete to authenticated
  using (user_id = auth.uid() or is_admin());

-- kebijakan lama yang tumpang tindih dibersihkan
drop policy if exists "pengurus catat kehadiran" on attendance;
drop policy if exists "pengurus hapus kehadiran" on attendance;
drop policy if exists "tulis milik sendiri" on attendance;
drop policy if exists "hapus milik sendiri" on attendance;


-- ---------- KEANGGOTAAN KELOMPOK ----------
-- Anggota mengajukan diri; pengurus menyetujui atau menolak.
drop policy if exists "ajukan gabung" on group_members;
create policy "ajukan gabung" on group_members
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "perbarui keanggotaan" on group_members;
create policy "perbarui keanggotaan" on group_members
  for update to authenticated
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

drop policy if exists "keluar kelompok" on group_members;
create policy "keluar kelompok" on group_members
  for delete to authenticated
  using (user_id = auth.uid() or is_admin());

drop policy if exists "tulis milik sendiri" on group_members;
drop policy if exists "hapus milik sendiri" on group_members;
drop policy if exists "pengurus kelola keanggotaan" on group_members;


-- ---------- RSVP ----------
drop policy if exists "perbarui rsvp" on rsvps;
create policy "perbarui rsvp" on rsvps
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ---------- BATAL RSVP / BATAL MENDOAKAN / BATAL TANDAI BACAAN ----------
--  Tanpa izin DELETE, tombol yang sudah ditekan tidak bisa dibatalkan.

drop policy if exists "batal rsvp" on rsvps;
create policy "batal rsvp" on rsvps
  for delete to authenticated using (user_id = auth.uid() or is_admin());

drop policy if exists "batal mendoakan" on prayer_supports;
create policy "batal mendoakan" on prayer_supports
  for delete to authenticated using (user_id = auth.uid() or is_admin());

drop policy if exists "batal tandai bacaan" on reading_progress;
create policy "batal tandai bacaan" on reading_progress
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "perbarui progres baca" on reading_progress;
create policy "perbarui progres baca" on reading_progress
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ---------- MEDIA (video & podcast) ----------
--  Pengurus perlu menyunting, bukan hanya menambah.
drop policy if exists "kelola oleh pengurus" on media;
create policy "kelola oleh pengurus" on media
  for all to authenticated using (is_admin()) with check (is_admin());

drop policy if exists "kelola oleh pengurus" on gallery;
create policy "kelola oleh pengurus" on gallery
  for all to authenticated using (is_admin()) with check (is_admin());


-- ---------- PENGATURAN APLIKASI ----------
-- Baris pengaturan disimpan dengan upsert, jadi butuh izin update juga.
-- (Kebijakan "kelola oleh pengurus" bertipe ALL sudah mencakupnya,
--  dipastikan ulang di sini.)
drop policy if exists "kelola oleh pengurus" on settings;
create policy "kelola oleh pengurus" on settings
  for all to authenticated using (is_admin()) with check (is_admin());


-- ============================================================
--  PERIKSA
-- ============================================================
select tablename, cmd, policyname
from pg_policies
where schemaname = 'public'
  and tablename in ('attendance','group_members','rsvps','settings',
                    'prayer_supports','reading_progress','media','gallery')
order by tablename, cmd;

--  attendance    harus punya: SELECT, INSERT, UPDATE, DELETE
--  group_members harus punya: SELECT, INSERT, UPDATE, DELETE
--  rsvps            harus punya: SELECT, INSERT, UPDATE, DELETE
--  prayer_supports  harus punya: SELECT, INSERT, DELETE
--  reading_progress harus punya: SELECT, INSERT, UPDATE, DELETE
--  media, gallery   harus punya: SELECT + ALL (pengurus)

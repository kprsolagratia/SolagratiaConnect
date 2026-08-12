-- ============================================================
--  SGKConnect — Tambahan 5: Banner Kegiatan & Forum
--  ------------------------------------------------------------
--  Jalankan SETELAH schema.sql sampai schema-4.
--  Aman dijalankan berulang kali.
-- ============================================================

-- ---------- banner untuk tiap kegiatan ----------
alter table events add column if not exists banner_url  text;
alter table events add column if not exists banner_path text;

comment on column events.banner_url is
  'Foto banner kegiatan. Bila kosong, dipakai ilustrasi bawaan sesuai kolom scene.';

-- ---------- forum: izin baca & tulis ----------
-- (sudah ada di schema.sql, dipastikan ulang di sini)
drop policy if exists "baca untuk anggota" on forum_topics;
create policy "baca untuk anggota" on forum_topics
  for select to authenticated using (true);

drop policy if exists "baca untuk anggota" on forum_replies;
create policy "baca untuk anggota" on forum_replies
  for select to authenticated using (true);

drop policy if exists "tulis milik sendiri" on forum_topics;
create policy "tulis milik sendiri" on forum_topics
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "tulis milik sendiri" on forum_replies;
create policy "tulis milik sendiri" on forum_replies
  for insert to authenticated with check (user_id = auth.uid());

-- penulis boleh menyunting & menghapus miliknya; pengurus boleh semua
drop policy if exists "ubah milik sendiri" on forum_topics;
create policy "ubah milik sendiri" on forum_topics
  for update to authenticated using (user_id = auth.uid() or is_admin());

drop policy if exists "hapus milik sendiri" on forum_topics;
create policy "hapus milik sendiri" on forum_topics
  for delete to authenticated using (user_id = auth.uid() or is_admin());

drop policy if exists "hapus milik sendiri" on forum_replies;
create policy "hapus milik sendiri" on forum_replies
  for delete to authenticated using (user_id = auth.uid() or is_admin());

-- ---------- realtime untuk forum ----------
do $$
begin
  begin execute 'alter publication supabase_realtime add table forum_topics';  exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table forum_replies'; exception when duplicate_object then null; end;
end $$;

-- ---------- periksa ----------
select column_name from information_schema.columns
where table_name = 'events' and column_name like 'banner%';
--  Harus muncul: banner_url, banner_path

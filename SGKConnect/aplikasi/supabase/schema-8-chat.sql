-- ============================================================
--  SGKConnect — Tambahan 8: Obrolan Kelompok
--  ------------------------------------------------------------
--  Chat di dalam kelompok sel / tim pelayanan.
--  Hanya anggota kelompok itu yang bisa membaca dan menulis.
--  Tidak ada chat pribadi antar dua orang.
--
--  Jalankan SETELAH schema.sql sampai schema-7.
--  Aman dijalankan berulang kali.
-- ============================================================

create table if not exists group_messages (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references groups(id) on delete cascade,
  user_id    uuid references profiles(id) on delete set null,
  body       text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  edited_at  timestamptz,
  deleted_at timestamptz
);

create index if not exists gm_group_waktu on group_messages (group_id, created_at desc);

alter table group_messages enable row level security;


-- ------------------------------------------------------------
--  Penolong: apakah pengguna anggota aktif kelompok ini?
-- ------------------------------------------------------------
create or replace function anggota_kelompok(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from group_members
    where group_id = g and user_id = auth.uid() and status = 'active'
  );
$$;


-- ------------------------------------------------------------
--  Aturan keamanan
-- ------------------------------------------------------------

-- BACA: hanya anggota aktif kelompok itu (pengurus & pendeta boleh semua,
--       supaya bisa menindak bila ada laporan)
drop policy if exists "baca obrolan kelompok" on group_messages;
create policy "baca obrolan kelompok" on group_messages
  for select to authenticated
  using (anggota_kelompok(group_id) or is_admin());

-- TULIS: hanya anggota aktif, dan hanya atas nama sendiri
drop policy if exists "tulis obrolan kelompok" on group_messages;
create policy "tulis obrolan kelompok" on group_messages
  for insert to authenticated
  with check (user_id = auth.uid() and anggota_kelompok(group_id));

-- SUNTING: hanya pesan sendiri
drop policy if exists "sunting pesan sendiri" on group_messages;
create policy "sunting pesan sendiri" on group_messages
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- HAPUS: pesan sendiri, atau oleh pemimpin/pengurus
drop policy if exists "hapus pesan" on group_messages;
create policy "hapus pesan" on group_messages
  for delete to authenticated
  using (user_id = auth.uid() or is_admin());


-- ------------------------------------------------------------
--  Tampilan siap pakai: pesan + nama & foto pengirim
-- ------------------------------------------------------------
create or replace view group_chat with (security_invoker = on) as
  select m.id, m.group_id, m.user_id, m.body, m.created_at, m.edited_at,
         p.full_name, p.avatar_url, p.role
  from group_messages m
  left join profiles p on p.id = m.user_id
  where m.deleted_at is null;

grant select on group_chat to authenticated;


-- ------------------------------------------------------------
--  Kelompok yang saya ikuti (untuk daftar obrolan)
-- ------------------------------------------------------------
create or replace view my_groups with (security_invoker = on) as
  select g.id, g.name, g.kind, g.leader_name, g.schedule, g.scene,
         m.status,
         (select count(*) from group_members x
           where x.group_id = g.id and x.status = 'active') as members,
         (select max(created_at) from group_messages gm where gm.group_id = g.id) as pesan_terakhir
  from groups g
  join group_members m on m.group_id = g.id
  where m.user_id = auth.uid() and m.status = 'active';

grant select on my_groups to authenticated;


-- ------------------------------------------------------------
--  Realtime
-- ------------------------------------------------------------
do $$
begin
  begin execute 'alter publication supabase_realtime add table group_messages';
  exception when duplicate_object then null; end;
end $$;


-- ------------------------------------------------------------
--  Periksa
-- ------------------------------------------------------------
select 'group_messages' as tabel, count(*) from group_messages;

select policyname, cmd from pg_policies
where tablename = 'group_messages' order by policyname;
--  Harus muncul 4 kebijakan: baca, tulis, sunting, hapus

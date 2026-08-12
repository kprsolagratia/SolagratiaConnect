-- ============================================================
--  SGKConnect — Tambahan 2: Galeri, Media, Pengaturan
--  ------------------------------------------------------------
--  Jalankan SETELAH schema.sql.
--  Aman dijalankan berulang kali.
-- ============================================================

-- ---------- GALERI FOTO ----------
create table if not exists gallery (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  caption     text,
  image_url   text not null,
  storage_path text,
  event_id    uuid references events(id) on delete set null,
  taken_on    date default current_date,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------- MEDIA: VIDEO, PODCAST, STREAMING ----------
create table if not exists media (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'video' check (kind in ('video','podcast','stream')),
  title       text not null,
  description text,
  url         text not null,
  thumb_url   text,
  duration    text,
  speaker     text,
  publish_on  date default current_date,
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- PENGATURAN APLIKASI (satu baris) ----------
create table if not exists settings (
  id             int primary key default 1 check (id = 1),
  church_name    text default 'GKKA-I Jemaat Sendawar',
  app_name       text default 'SGKConnect',
  tagline        text default 'Terhubung dalam Kasih, Bertumbuh dalam Firman, Berdampak bagi Dunia.',
  hero_title     text default 'Rise Together, Shine for Christ',
  hero_subtitle  text,
  hero_image_url text,
  hero_scene     text default 'worship',
  verse_text     text default 'Sebab karena kasih karunia kamu diselamatkan oleh iman; itu bukan hasil usahamu, tetapi pemberian Allah.',
  verse_ref      text default 'Efesus 2:8',
  greeting_note  text default 'Kiranya Tuhan memberkati langkahmu hari ini.',
  contact_info   text,
  service_time   text,
  updated_at     timestamptz not null default now()
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- ---------- KEAMANAN ----------
alter table gallery  enable row level security;
alter table media    enable row level security;
alter table settings enable row level security;

do $$
declare t text;
begin
  foreach t in array array['gallery','media','settings'] loop
    execute format('drop policy if exists "baca untuk anggota" on %I;', t);
    execute format('create policy "baca untuk anggota" on %I for select to authenticated using (true);', t);
    execute format('drop policy if exists "kelola oleh pengurus" on %I;', t);
    execute format('create policy "kelola oleh pengurus" on %I for all to authenticated using (is_admin()) with check (is_admin());', t);
  end loop;
end $$;

-- ---------- PERSETUJUAN ANGGOTA KELOMPOK ----------
-- Pengurus boleh mengubah status permintaan bergabung.
drop policy if exists "pengurus kelola keanggotaan" on group_members;
create policy "pengurus kelola keanggotaan" on group_members
  for update to authenticated using (is_admin()) with check (is_admin());

-- ---------- ABSENSI MANUAL ----------
-- Pengurus boleh mencatat kehadiran anggota lain (tanpa QR).
drop policy if exists "pengurus catat kehadiran" on attendance;
create policy "pengurus catat kehadiran" on attendance
  for insert to authenticated with check (user_id = auth.uid() or is_admin());

drop policy if exists "pengurus hapus kehadiran" on attendance;
create policy "pengurus hapus kehadiran" on attendance
  for delete to authenticated using (user_id = auth.uid() or is_admin());

-- ---------- TAMPILAN RINGKAS ----------
create or replace view group_stats with (security_invoker = on) as
  select g.id, g.name, g.kind, g.leader_name, g.schedule, g.description, g.scene,
         (select count(*) from group_members m where m.group_id = g.id and m.status = 'active') as members,
         (select count(*) from group_members m where m.group_id = g.id and m.status = 'pending') as pending
  from groups g;

create or replace view pending_members with (security_invoker = on) as
  select m.group_id, m.user_id, m.joined_at,
         g.name as group_name, p.full_name, p.member_no
  from group_members m
  join groups g on g.id = m.group_id
  join profiles p on p.id = m.user_id
  where m.status = 'pending';


-- ============================================================
--  PENYIMPANAN FOTO (Storage)
--  ------------------------------------------------------------
--  Bagian ini TIDAK bisa dijalankan lewat SQL Editor.
--  Buat lewat antarmuka Supabase:
--
--    1. Menu kiri → Storage → New bucket
--    2. Name   : media
--    3. Public bucket : AKTIFKAN (agar foto bisa tampil di aplikasi)
--    4. Create bucket
--
--  Setelah itu jalankan blok di bawah untuk mengatur siapa
--  yang boleh mengunggah.
-- ============================================================

do $$
begin
  if exists (select 1 from storage.buckets where id = 'media') then

    drop policy if exists "media dibaca semua" on storage.objects;
    create policy "media dibaca semua" on storage.objects
      for select using (bucket_id = 'media');

    drop policy if exists "pengurus unggah media" on storage.objects;
    create policy "pengurus unggah media" on storage.objects
      for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

    drop policy if exists "pengurus hapus media" on storage.objects;
    create policy "pengurus hapus media" on storage.objects
      for delete to authenticated using (bucket_id = 'media' and public.is_admin());

    raise notice 'Kebijakan penyimpanan media berhasil dipasang.';
  else
    raise notice 'Bucket "media" belum ada. Buat dulu lewat menu Storage, lalu jalankan skrip ini lagi.';
  end if;
end $$;

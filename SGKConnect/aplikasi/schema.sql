-- ============================================================
--  SGKConnect — skema database Supabase
--  Jalankan di Supabase Studio → SQL Editor → New query → Run
--  Aman dijalankan ulang (idempoten).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- 1. PROFIL ANGGOTA ----------
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  member_no    text unique,
  full_name    text not null default 'Anggota Baru',
  role         text not null default 'member' check (role in ('member','leader','admin')),
  phone        text,
  birthday     date,
  avatar_url   text,
  group_id     uuid,
  joined_at    timestamptz not null default now()
);

-- nomor anggota otomatis: SGK-2026-00001
create sequence if not exists member_no_seq start 1;

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, member_no)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'SGK-' || to_char(now(),'YYYY') || '-' || lpad(nextval('member_no_seq')::text, 5, '0')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- penolong: apakah pengguna saat ini pengurus?
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','leader'));
$$;

-- ---------- 2. KELOMPOK SEL & TIM ----------
create table if not exists groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kind        text not null default 'cell' check (kind in ('cell','team')),
  leader_name text,
  schedule    text,
  description text,
  scene       text default 'fellow',
  created_at  timestamptz not null default now()
);

create table if not exists group_members (
  group_id  uuid references groups(id) on delete cascade,
  user_id   uuid references profiles(id) on delete cascade,
  status    text not null default 'pending' check (status in ('pending','active')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- ---------- 3. KEGIATAN ----------
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text default 'Ibadah',
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  location    text,
  map_query   text,
  capacity    int default 100,
  scene       text default 'camp',
  description text,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists rsvps (
  event_id   uuid references events(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  status     text not null default 'going' check (status in ('going','maybe','cancelled')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create table if not exists attendance (
  id           uuid primary key default gen_random_uuid(),
  event_id     uuid references events(id) on delete cascade,
  user_id      uuid references profiles(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  method       text default 'qr' check (method in ('qr','manual')),
  unique (event_id, user_id)
);

-- ---------- 4. POKOK DOA ----------
create table if not exists prayers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references profiles(id) on delete set null,
  title       text not null,
  body        text not null,
  is_anon     boolean not null default false,
  status      text not null default 'published' check (status in ('pending','published','archived')),
  created_at  timestamptz not null default now()
);

create table if not exists prayer_supports (
  prayer_id  uuid references prayers(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (prayer_id, user_id)
);

create table if not exists prayer_notes (
  id         uuid primary key default gen_random_uuid(),
  prayer_id  uuid references prayers(id) on delete cascade,
  user_id    uuid references profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ---------- 5. FIRMAN ----------
create table if not exists devotions (
  id         uuid primary key default gen_random_uuid(),
  publish_on date not null unique,
  title      text not null,
  verse_ref  text,
  verse_text text,
  body       text,
  author     text,
  created_at timestamptz not null default now()
);

create table if not exists reading_plan (
  day        int primary key check (day between 1 and 365),
  passage    text not null,
  snippet    text
);

create table if not exists reading_progress (
  user_id     uuid references profiles(id) on delete cascade,
  day         int references reading_plan(day) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ---------- 6. PENGUMUMAN & FORUM ----------
create table if not exists announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text,
  publish_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists forum_topics (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete set null,
  title      text not null,
  body       text,
  created_at timestamptz not null default now()
);

create table if not exists forum_replies (
  id         uuid primary key default gen_random_uuid(),
  topic_id   uuid references forum_topics(id) on delete cascade,
  user_id    uuid references profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table profiles         enable row level security;
alter table groups           enable row level security;
alter table group_members    enable row level security;
alter table events           enable row level security;
alter table rsvps            enable row level security;
alter table attendance       enable row level security;
alter table prayers          enable row level security;
alter table prayer_supports  enable row level security;
alter table prayer_notes     enable row level security;
alter table devotions        enable row level security;
alter table reading_plan     enable row level security;
alter table reading_progress enable row level security;
alter table announcements    enable row level security;
alter table forum_topics     enable row level security;
alter table forum_replies    enable row level security;

-- semua anggota yang login boleh membaca konten jemaat
do $$
declare t text;
begin
  foreach t in array array['profiles','groups','group_members','events','prayers','prayer_supports',
                           'prayer_notes','devotions','reading_plan','announcements','forum_topics','forum_replies',
                           'rsvps','attendance','reading_progress']
  loop
    execute format('drop policy if exists "baca untuk anggota" on %I;', t);
    execute format('create policy "baca untuk anggota" on %I for select to authenticated using (true);', t);
  end loop;
end $$;

-- profil: hanya diri sendiri yang boleh mengubah (pengurus boleh semua)
drop policy if exists "ubah profil sendiri" on profiles;
create policy "ubah profil sendiri" on profiles
  for update to authenticated using (id = auth.uid() or is_admin()) with check (id = auth.uid() or is_admin());

-- pokok doa: siapa pun boleh kirim; hanya penulis/pengurus boleh ubah & hapus
drop policy if exists "kirim pokok doa" on prayers;
create policy "kirim pokok doa" on prayers for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "ubah pokok doa sendiri" on prayers;
create policy "ubah pokok doa sendiri" on prayers
  for update to authenticated using (user_id = auth.uid() or is_admin());
drop policy if exists "hapus pokok doa sendiri" on prayers;
create policy "hapus pokok doa sendiri" on prayers
  for delete to authenticated using (user_id = auth.uid() or is_admin());

-- dukungan doa, RSVP, kehadiran, progres baca: milik masing-masing
do $$
declare t text;
begin
  foreach t in array array['prayer_supports','rsvps','attendance','reading_progress','group_members','prayer_notes','forum_topics','forum_replies']
  loop
    execute format('drop policy if exists "tulis milik sendiri" on %I;', t);
    execute format('create policy "tulis milik sendiri" on %I for insert to authenticated with check (user_id = auth.uid());', t);
    execute format('drop policy if exists "hapus milik sendiri" on %I;', t);
    execute format('create policy "hapus milik sendiri" on %I for delete to authenticated using (user_id = auth.uid() or is_admin());', t);
  end loop;
end $$;

-- kegiatan, pengumuman, renungan, kelompok: hanya pengurus yang boleh menulis
do $$
declare t text;
begin
  foreach t in array array['events','announcements','devotions','groups','reading_plan']
  loop
    execute format('drop policy if exists "kelola oleh pengurus" on %I;', t);
    execute format('create policy "kelola oleh pengurus" on %I for all to authenticated using (is_admin()) with check (is_admin());', t);
  end loop;
end $$;

-- ============================================================
--  REALTIME
--  Tanpa ini, dinding doa tidak menyegar otomatis saat ada
--  kiriman baru dari anggota lain.
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  begin execute 'alter publication supabase_realtime add table prayers';         exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table prayer_supports'; exception when duplicate_object then null; end;
  begin execute 'alter publication supabase_realtime add table announcements';   exception when duplicate_object then null; end;
end $$;

-- ============================================================
--  PENGAMAN PERAN
-- ============================================================

-- 1. Anggota biasa tidak boleh menaikkan perannya sendiri.
--    Hanya pengurus yang boleh mengubah kolom `role`.
create or replace function jaga_perubahan_peran()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not is_admin() then
    raise exception 'Hanya pengurus yang dapat mengubah peran anggota.';
  end if;
  return new;
end $$;

drop trigger if exists cek_peran on profiles;
create trigger cek_peran before update on profiles
  for each row execute function jaga_perubahan_peran();

-- 2. Jangan sampai tidak ada pengurus tersisa.
create or replace function jaga_pengurus_terakhir()
returns trigger language plpgsql security definer set search_path = public as $$
declare sisa int;
begin
  if old.role in ('admin','leader') and new.role not in ('admin','leader') then
    select count(*) into sisa from profiles
      where role in ('admin','leader') and id <> old.id;
    if sisa = 0 then
      raise exception 'Tidak dapat menurunkan pengurus terakhir. Angkat pengurus lain terlebih dahulu.';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists cek_pengurus_terakhir on profiles;
create trigger cek_pengurus_terakhir before update on profiles
  for each row execute function jaga_pengurus_terakhir();

-- ============================================================
--  TAMPILAN RINGKAS (dipakai dasbor)
-- ============================================================
create or replace view event_stats with (security_invoker = on) as
  select e.id, e.title, e.starts_at, e.capacity,
         (select count(*) from rsvps r where r.event_id = e.id and r.status = 'going') as going,
         (select count(*) from attendance a where a.event_id = e.id) as attended
  from events e;

create or replace view prayer_stats with (security_invoker = on) as
  select p.id, p.title, p.body, p.is_anon, p.status, p.created_at, p.user_id,
         (select count(*) from prayer_supports s where s.prayer_id = p.id) as supports
  from prayers p;

-- ============================================================
--  DATA AWAL (boleh dihapus setelah diisi data asli)
-- ============================================================
-- Kunci unik supaya skrip ini aman dijalankan berulang kali
create unique index if not exists groups_name_uniq        on groups (name);
create unique index if not exists events_title_start_uniq on events (title, starts_at);
create unique index if not exists ann_title_date_uniq     on announcements (title, publish_on);

insert into groups (name, kind, leader_name, schedule, scene) values
  ('GS Zion','cell','Ev. Ruth Mangesa','Rabu · 19.00','fellow'),
  ('GS Betheda','cell','Sdr. Yosua L.','Kamis · 19.00','bible'),
  ('GS Nazareth','cell','Sdri. Marta P.','Jumat · 18.30','pray'),
  ('GS Filadelfia','cell','Sdr. Andre S.','Sabtu · 16.00','worship'),
  ('Tim Musik','team','Sdr. Yosua L.','Latihan Jumat · 19.00','music'),
  ('Tim Doa','team','Sdri. Marta P.','Doa pagi Senin · 05.30','pray'),
  ('Tim Kreatif','team',null,'Desain & dekorasi acara','fellow'),
  ('Tim Media','team',null,'Live streaming & dokumentasi','mic')
on conflict (name) do nothing;

insert into events (title, category, starts_at, location, map_query, capacity, scene)
select * from (values
  ('Youth Camp 2026','Retreat', date_trunc('day', now()) + interval '35 days' + interval '7 hours','Sendawar Camp Ground','Sendawar Camp Ground',150,'camp'),
  ('Youth Worship Night','Ibadah', date_trunc('day', now()) + interval '15 days' + interval '18 hours','SG Hall, Sendawar','SG Hall Sendawar',200,'music'),
  ('Fun Day & Olahraga','Fellowship', date_trunc('day', now()) + interval '22 days' + interval '8 hours','Taman Kota Sendawar','Taman Kota Sendawar',120,'fellow'),
  ('Pemahaman Alkitab','Pembinaan', date_trunc('day', now()) + interval '3 days' + interval '19 hours','Ruang Serbaguna','GKKA Sendawar',60,'bible')
) as v(title, category, starts_at, location, map_query, capacity, scene)
where not exists (select 1 from events e where e.title = v.title);

insert into devotions (publish_on, title, verse_ref, verse_text, body, author) values
  (current_date,'Berjalan dalam Terang','1 Yohanes 1:7',
   'Tetapi jika kita hidup di dalam terang sama seperti Dia ada di dalam terang, maka kita beroleh persekutuan seorang dengan yang lain.',
   'Terang bukan sesuatu yang kita hasilkan, melainkan sesuatu yang kita pantulkan. Hari ini, pilih satu langkah kecil yang jujur.',
   'Tim Renungan Pemuda')
on conflict (publish_on) do nothing;

insert into reading_plan (day, passage, snippet) values
  (236,'Mazmur 119:105','Firman-Mu itu pelita bagi kakiku dan terang bagi jalanku.'),
  (237,'Mazmur 119:106','Aku telah bersumpah dan aku akan menepatinya, untuk berpegang pada hukum-hukum-Mu yang adil.'),
  (238,'Amsal 3:5-6','Percayalah kepada TUHAN dengan segenap hatimu, dan janganlah bersandar kepada pengertianmu sendiri.')
on conflict (day) do nothing;

insert into announcements (title, body) values
  ('Pendaftaran Youth Camp dibuka','Kuota 150 orang. Tutup saat kuota penuh.'),
  ('Latihan gabungan tim musik','Sabtu, 09.00 di SG Hall. Semua tim wajib hadir.')
on conflict (title, publish_on) do nothing;

-- Jadikan diri sendiri pengurus setelah mendaftar (ganti emailnya):
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'emailanda@contoh.com');

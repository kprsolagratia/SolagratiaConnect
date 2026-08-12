-- ============================================================
--  SGKConnect — Tambahan 7: Peran Pendeta
--  ------------------------------------------------------------
--  Jalankan SETELAH schema.sql sampai schema-6.
--  Aman dijalankan berulang kali.
-- ============================================================
--
--  Peran yang tersedia setelah skrip ini:
--    member  → anggota biasa
--    leader  → pemimpin kelompok sel / tim pelayanan
--    pastor  → pendeta / gembala jemaat
--    admin   → pengurus penuh
-- ============================================================

-- ---------- perluas pilihan peran ----------
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('member', 'leader', 'pastor', 'admin'));

comment on column profiles.role is
  'member = anggota, leader = pemimpin kelompok, pastor = pendeta, admin = pengurus';

-- ---------- pendeta punya akses pengurus ----------
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'leader', 'pastor')
  );
$$;

-- ---------- pengaman pengurus terakhir ikut menghitung pendeta ----------
create or replace function jaga_pengurus_terakhir()
returns trigger language plpgsql security definer set search_path = public as $$
declare sisa int;
begin
  if auth.uid() is not null
     and old.role in ('admin','leader','pastor')
     and new.role not in ('admin','leader','pastor') then
    select count(*) into sisa from profiles
      where role in ('admin','leader','pastor') and id <> old.id;
    if sisa = 0 then
      raise exception 'Tidak dapat menurunkan pengurus terakhir. Angkat pengurus lain terlebih dahulu.';
    end if;
  end if;
  return new;
end $$;

-- ---------- menetapkan pendeta ----------
-- Ganti emailnya, lalu hilangkan tanda -- di depan baris berikut:
-- update profiles set role = 'pastor'
-- where id = (select id from auth.users where email = 'pendeta@contoh.com');

-- ---------- periksa ----------
select p.full_name, p.role, u.email
from profiles p join auth.users u on u.id = p.id
order by
  case p.role when 'admin' then 1 when 'pastor' then 2
              when 'leader' then 3 else 4 end,
  p.full_name;

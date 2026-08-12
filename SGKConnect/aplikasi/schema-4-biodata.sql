-- ============================================================
--  SGKConnect — Tambahan 4: Biodata Anggota
--  ------------------------------------------------------------
--  Menambah kolom biodata yang SEMUANYA OPSIONAL, dan memberi
--  izin anggota mengunggah foto profilnya sendiri.
--
--  Jalankan SETELAH schema.sql dan schema-2-media.sql.
--  Aman dijalankan berulang kali.
-- ============================================================

-- ---------- kolom biodata (boleh kosong semua) ----------
alter table profiles add column if not exists phone       text;
alter table profiles add column if not exists birthday    date;
alter table profiles add column if not exists avatar_url  text;
alter table profiles add column if not exists avatar_path text;
alter table profiles add column if not exists address     text;
alter table profiles add column if not exists bio         text;
alter table profiles add column if not exists occupation  text;
alter table profiles add column if not exists emergency_contact text;
alter table profiles add column if not exists show_phone  boolean not null default false;
alter table profiles add column if not exists show_birthday boolean not null default true;

comment on column profiles.show_phone is
  'Bila false, nomor telepon hanya terlihat oleh pemiliknya dan pengurus.';


-- ============================================================
--  PRIVASI: anggota lain tidak boleh melihat kontak pribadi
--  ------------------------------------------------------------
--  Tabel profiles memuat nomor HP dan alamat. Tampilan di bawah
--  hanya membuka kolom yang aman dilihat sesama anggota.
--  Halaman komunitas & admin memakai tampilan ini, bukan tabel
--  aslinya.
-- ============================================================
create or replace view member_directory with (security_invoker = on) as
  select
    id,
    member_no,
    full_name,
    role,
    avatar_url,
    occupation,
    bio,
    case when show_birthday then birthday else null end as birthday,
    case when show_phone    then phone    else null end as phone,
    joined_at
  from profiles;

grant select on member_directory to authenticated;


-- ============================================================
--  FOTO PROFIL
--  Anggota boleh mengunggah & mengganti fotonya sendiri.
--  Berkas disimpan di bucket "media", folder "avatar/<id>/".
-- ============================================================
do $$
begin
  if exists (select 1 from storage.buckets where id = 'media') then

    drop policy if exists "anggota unggah foto profil" on storage.objects;
    create policy "anggota unggah foto profil" on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'media'
        and (storage.foldername(name))[1] = 'avatar'
        and (storage.foldername(name))[2] = auth.uid()::text
      );

    drop policy if exists "anggota ganti foto profil" on storage.objects;
    create policy "anggota ganti foto profil" on storage.objects
      for update to authenticated
      using (
        bucket_id = 'media'
        and (storage.foldername(name))[1] = 'avatar'
        and (storage.foldername(name))[2] = auth.uid()::text
      );

    drop policy if exists "anggota hapus foto profil" on storage.objects;
    create policy "anggota hapus foto profil" on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'media'
        and (storage.foldername(name))[1] = 'avatar'
        and (storage.foldername(name))[2] = auth.uid()::text
      );

    raise notice 'Izin foto profil terpasang.';
  else
    raise notice 'Bucket "media" belum ada. Buat dulu di menu Storage, lalu jalankan lagi.';
  end if;
end $$;


-- ============================================================
--  ULANG TAHUN BULAN INI (dipakai beranda)
--  Hanya anggota yang mengizinkan tanggal lahirnya ditampilkan.
-- ============================================================
create or replace view upcoming_birthdays with (security_invoker = on) as
  select id, full_name, avatar_url, birthday,
         extract(day from birthday)::int as tanggal,
         extract(month from birthday)::int as bulan
  from profiles
  where birthday is not null and show_birthday = true;

grant select on upcoming_birthdays to authenticated;


-- ------------------------------------------------------------
--  Periksa
-- ------------------------------------------------------------
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'profiles'
order by ordinal_position;

--  Seluruh kolom biodata harus is_nullable = YES,
--  artinya boleh dikosongkan.

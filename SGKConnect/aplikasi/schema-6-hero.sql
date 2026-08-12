-- ============================================================
--  SGKConnect — Tambahan 6: Latar Beranda (gambar / video)
--  ------------------------------------------------------------
--  Jalankan SETELAH schema.sql sampai schema-5.
--  Aman dijalankan berulang kali.
-- ============================================================

alter table settings add column if not exists hero_video_url  text;
alter table settings add column if not exists hero_video_path text;
alter table settings add column if not exists hero_image_path text;

comment on column settings.hero_video_url is
  'Video latar beranda. Diputar tanpa suara dan berulang. Kosongkan untuk memakai gambar.';

-- ---------- izin unggah video oleh pengurus ----------
do $$
begin
  if exists (select 1 from storage.buckets where id = 'media') then
    -- kebijakan unggah pengurus sudah ada dari schema-2, dipastikan ulang
    drop policy if exists "pengurus unggah media" on storage.objects;
    create policy "pengurus unggah media" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'media' and public.is_admin());

    drop policy if exists "pengurus ganti media" on storage.objects;
    create policy "pengurus ganti media" on storage.objects
      for update to authenticated
      using (bucket_id = 'media' and public.is_admin());

    raise notice 'Izin unggah media siap.';
  else
    raise notice 'Bucket "media" belum ada. Buat dulu di menu Storage.';
  end if;
end $$;

-- ---------- periksa ----------
select column_name from information_schema.columns
where table_name = 'settings' and column_name like 'hero%'
order by column_name;
--  Harus muncul: hero_image_path, hero_image_url, hero_scene,
--                hero_subtitle, hero_title, hero_video_path, hero_video_url

-- ---------- cara menampilkan gambar latar ----------
alter table settings add column if not exists hero_fit text default 'cover'
  check (hero_fit in ('cover','contain'));

comment on column settings.hero_fit is
  'cover = penuhi layar (dipotong), contain = tampilkan utuh (untuk logo/poster)';

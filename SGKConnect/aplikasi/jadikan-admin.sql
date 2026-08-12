-- ============================================================
--  SGKConnect — mengatur peran pengurus
--  Jalankan di Supabase Studio → SQL Editor
-- ============================================================
--  CATATAN: setelah ada satu pengurus, peran anggota lain sudah bisa
--  diubah langsung dari halaman Admin di aplikasi — tidak perlu SQL lagi.
--  Berkas ini dipakai untuk pengurus PERTAMA, atau bila panel tidak bisa diakses.
--
--  Peran yang tersedia:
--    member  → anggota biasa (bawaan)
--    leader  → pemimpin kelompok, bisa membuka panel admin
--    admin   → pengurus penuh
-- ============================================================


-- ------------------------------------------------------------
--  CARA 1 — Jadikan satu akun sebagai pengurus (paling umum)
--  Ganti alamat emailnya, lalu Run.
-- ------------------------------------------------------------
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'emailanda@contoh.com');


-- ------------------------------------------------------------
--  CARA 2 — Akun pertama yang mendaftar otomatis jadi pengurus
--
--  Jalankan blok ini SEBELUM ada orang mendaftar.
--  Berguna kalau Anda ingin langsung siap tanpa menyentuh SQL lagi.
--  Akun kedua dan seterusnya tetap menjadi anggota biasa.
-- ------------------------------------------------------------
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  jumlah int;
  peran  text;
begin
  select count(*) into jumlah from profiles;
  peran := case when jumlah = 0 then 'admin' else 'member' end;

  insert into profiles (id, full_name, member_no, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'SGK-' || to_char(now(),'YYYY') || '-' || lpad(nextval('member_no_seq')::text, 5, '0'),
    peran
  )
  on conflict (id) do nothing;
  return new;
end $$;


-- ============================================================
--  PEMERIKSAAN
-- ============================================================

-- Lihat semua anggota dan perannya
select p.member_no, p.full_name, p.role, u.email, p.joined_at
from profiles p
join auth.users u on u.id = p.id
order by p.joined_at;

-- Hitung berapa pengurus yang ada (sebaiknya minimal 2)
select role, count(*) from profiles group by role;


-- ============================================================
--  PERAWATAN
-- ============================================================

-- Tambah pengurus kedua (sangat disarankan, agar tidak macet
-- kalau satu orang berhalangan atau kehilangan akses email)
-- update profiles set role = 'admin'
-- where id = (select id from auth.users where email = 'pengurus2@contoh.com');

-- Jadikan seseorang pemimpin kelompok sel
-- update profiles set role = 'leader'
-- where id = (select id from auth.users where email = 'pemimpin@contoh.com');

-- Cabut hak pengurus (kembalikan jadi anggota biasa)
-- update profiles set role = 'member'
-- where id = (select id from auth.users where email = 'mantanpengurus@contoh.com');

-- Pengaman: jangan sampai tidak ada pengurus sama sekali.
-- Jalankan ini setelah mencabut hak seseorang — hasilnya harus minimal 1.
-- select count(*) as jumlah_pengurus from profiles where role in ('admin','leader');

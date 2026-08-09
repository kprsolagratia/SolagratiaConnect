-- ============================================================
--  SGKConnect — bersihkan data ganda
--  ------------------------------------------------------------
--  Jalankan HANYA bila Anda pernah menjalankan schema.sql lebih
--  dari sekali dan datanya jadi berlipat (mis. "Pemahaman Alkitab"
--  muncul 4 kali, atau kegiatan mendatang tercatat 16 padahal
--  aslinya 4).
--
--  Skrip ini menyisakan SATU baris tertua untuk tiap data yang
--  sama, lalu memasang kunci unik agar tidak terulang.
--
--  Jalankan di Supabase Studio → SQL Editor.
-- ============================================================


-- ------------------------------------------------------------
--  1. Lihat dulu apa yang ganda (aman, tidak mengubah apa pun)
-- ------------------------------------------------------------
select 'events' as tabel, title, count(*) as jumlah
from events group by title having count(*) > 1
union all
select 'groups', name, count(*) from groups group by name having count(*) > 1
union all
select 'announcements', title, count(*) from announcements group by title having count(*) > 1
order by jumlah desc;


-- ------------------------------------------------------------
--  2. Hapus yang ganda — sisakan yang paling awal dibuat
--     RSVP dan kehadiran yang menempel pada baris ganda ikut
--     terhapus, jadi lakukan selagi data masih baru.
-- ------------------------------------------------------------
delete from events e using events lain
where e.title = lain.title and e.ctid > lain.ctid;

delete from groups g using groups lain
where g.name = lain.name and g.ctid > lain.ctid;

delete from announcements a using announcements lain
where a.title = lain.title and a.publish_on = lain.publish_on and a.ctid > lain.ctid;

delete from devotions d using devotions lain
where d.publish_on = lain.publish_on and d.ctid > lain.ctid;


-- ------------------------------------------------------------
--  3. Pasang kunci unik agar tidak terulang
-- ------------------------------------------------------------
create unique index if not exists groups_name_uniq        on groups (name);
create unique index if not exists events_title_start_uniq on events (title, starts_at);
create unique index if not exists ann_title_date_uniq     on announcements (title, publish_on);


-- ------------------------------------------------------------
--  4. Periksa hasilnya
-- ------------------------------------------------------------
select 'events' as tabel, count(*) from events
union all select 'groups', count(*) from groups
union all select 'announcements', count(*) from announcements
union all select 'devotions', count(*) from devotions
union all select 'profiles', count(*) from profiles;

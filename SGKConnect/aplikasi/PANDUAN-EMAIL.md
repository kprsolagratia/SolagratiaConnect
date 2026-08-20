# Batas Pengiriman Email

Galat **"email rate limit exceeded"** saat anggota mendaftar.

---

## Penyebabnya

Supabase menyediakan layanan email bawaan, tapi **hanya untuk uji coba** — beberapa
email per jam, lalu berhenti sampai jam berikutnya. Karena setiap pendaftaran
mengirim email konfirmasi, batas itu cepat habis begitu beberapa anggota mendaftar
berbarengan.

Ini bukan kerusakan aplikasi. Layanan email bawaan Supabase memang tidak dirancang
untuk dipakai jemaat sungguhan.

---

## Pilihan A — Matikan konfirmasi email (paling cepat)

Cocok untuk jemaat yang saling mengenal. Anggota mendaftar dan langsung bisa masuk,
tanpa menunggu email.

1. Supabase → **Authentication** → **Sign In / Providers** → **Email**
2. Matikan **Confirm email**
3. **Save**

Selesai. Pendaftaran langsung berjalan tanpa batas.

**Yang perlu dipertimbangkan:** siapa pun bisa mendaftar dengan email apa saja,
termasuk email palsu. Untuk jemaat kecil yang saling kenal, ini biasanya tidak
masalah — pengurus bisa melihat daftar anggota di halaman Dasbor dan menghapus
yang mencurigakan.

**Kalau ingin lebih tertutup**, buka `assets/js/config.js` dan ubah:

```js
"ALLOW_SIGNUP": false
```

Tombol "Buat akun baru" akan hilang, dan akun hanya dibuat pengurus lewat
Supabase → Authentication → Users → **Add user**.

---

## Pilihan B — Pasang layanan email sendiri (jangka panjang)

Diperlukan bila Anda ingin tetap memakai konfirmasi email, atau nanti memakai
fitur pemulihan kata sandi secara rutin.

### Menggunakan Brevo (gratis 300 email/hari)

1. Daftar di [brevo.com](https://www.brevo.com)
2. Masuk ke **SMTP & API** → **SMTP** → catat: server, port, login, kunci
3. Supabase → **Project Settings** → **Authentication** → **SMTP Settings**
4. Aktifkan **Enable Custom SMTP**, isi:

| Kolom | Isi |
|---|---|
| Sender email | email gereja, mis. `sgkconnect@gkkai-sendawar.org` |
| Sender name | SGKConnect |
| Host | `smtp-relay.brevo.com` |
| Port | `587` |
| Username | login dari Brevo |
| Password | kunci SMTP dari Brevo |

5. **Save**

Alternatif lain dengan cara serupa: **Resend** (3.000 email/bulan gratis) atau
**Gmail SMTP** (perlu App Password, batas ±500/hari).

> Gmail pribadi bisa dipakai, tapi kurang disarankan untuk jangka panjang —
> email dari alamat pribadi lebih sering masuk folder spam, dan kalau pemilik
> akun berhalangan, pengurus lain tidak bisa mengaksesnya.

---

## Yang saya sarankan

**Sekarang:** matikan Confirm email (Pilihan A). Anggota bisa langsung mendaftar,
dan Anda tidak tertahan.

**Sebelum diumumkan ke seluruh jemaat:** pasang SMTP sendiri (Pilihan B), lalu
aktifkan kembali Confirm email. Dengan begitu pendaftaran tetap lancar, dan
pemulihan kata sandi berfungsi saat ada anggota yang lupa.

---

## Kalau sudah terlanjur banyak yang gagal daftar

Akun mereka mungkin sudah terbuat tapi belum terkonfirmasi. Setelah mematikan
Confirm email, jalankan ini di **SQL Editor** agar semuanya bisa langsung masuk:

```sql
-- tandai semua akun sebagai terkonfirmasi
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email_confirmed_at is null;

-- pastikan setiap akun punya profil
insert into profiles (id, full_name, member_no, role)
select u.id,
       coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email,'@',1)),
       'SGK-' || to_char(now(),'YYYY') || '-' || lpad(nextval('member_no_seq')::text, 5, '0'),
       'member'
from auth.users u
on conflict (id) do nothing;

-- periksa hasilnya
select u.email, p.full_name, p.role,
       case when u.email_confirmed_at is null then 'belum' else 'sudah' end as konfirmasi
from auth.users u
left join profiles p on p.id = u.id
order by u.created_at;
```

Setelah itu, minta mereka mencoba masuk dengan email dan kata sandi yang tadi
mereka daftarkan.

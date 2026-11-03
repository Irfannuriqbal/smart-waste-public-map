# Website Peta Public Vercel

Folder ini adalah website peta public saja. Tidak membawa Flask, RTSP CCTV,
RF-DETR, SQLite admin, video live, atau `SUPABASE_SECRET_KEY`.

## Environment Variables Vercel

Di Vercel Project Settings → Environment Variables, isi:

```text
SUPABASE_URL=https://PROJECT_ID_KAMU.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_KEY_KAMU
```

### Cara mendapatkan nilainya

1. **SUPABASE_URL**
   - Supabase → Settings → Data API.
   - API URL biasanya tampil sebagai:

   ```text
   https://PROJECT_ID.supabase.co/rest/v1/
   ```

   - Simpan hanya bagian sebelum `/rest/v1/`:

   ```text
   https://PROJECT_ID.supabase.co
   ```

2. **SUPABASE_PUBLISHABLE_KEY**
   - Supabase → Settings → API Keys → Publishable key.
   - Salin key yang dimulai `sb_publishable_`.

Jangan pakai atau simpan key `sb_secret_...` pada Vercel. Secret key hanya untuk
file `.env` lokal di PC TPS, karena key tersebut dapat mengubah data Supabase.

## Deploy ke Vercel

1. Push repository project ke GitHub tanpa file `.env`.
2. Buka [Vercel](https://vercel.com/) lalu pilih **Add New → Project**.
3. Import repository GitHub project ini.
4. Pada konfigurasi project, set **Root Directory** menjadi:

```text
./
```

Repository ini sudah berisi langsung file website peta pada root.

5. Tambahkan dua environment variable di atas untuk Production, Preview, dan
   Development.
6. Klik **Deploy**.

Vercel memberi URL gratis seperti:

```text
https://smart-waste-monitoring.vercel.app
```

Website membaca indikator Arm Roll dari Supabase. Status berubah ketika Flask
lokal di PC TPS hidup dan berhasil melakukan sinkronisasi Supabase.

## Login dan Kelola Arm Roll Online

Halaman public tetap hanya menampilkan peta. Admin membuka URL langsung:

```text
https://NAMA_PROJECT.vercel.app/login.html
```

Setelah login, admin diarahkan ke:

```text
https://NAMA_PROJECT.vercel.app/admin.html
```

Admin online dapat menambah, mengubah lokasi lewat Leaflet map picker, mengubah
Camera ID, mengaktifkan/nonaktifkan, dan menghapus Arm Roll. Form tidak
menyediakan perubahan status `FULL`/`NOT_FULL`; status tetap datang dari Flask
lokal dan AI.

Sebelum memakai admin online, jalankan `supabase/admin_schema.sql` di Supabase
SQL Editor. Lalu pada Supabase Dashboard buka **Authentication → Users** dan
buat satu user admin dengan email/password. Setelah itu, di Authentication
settings nonaktifkan public signups bila pilihan tersebut tersedia.

Di Supabase Authentication → URL Configuration, masukkan URL Vercel berikut:

```text
https://NAMA_PROJECT.vercel.app
```

Tambahkan juga redirect URL:

```text
https://NAMA_PROJECT.vercel.app/login.html
```

Jangan membuat user admin, password, atau service secret di source code/GitHub.

## Sinkronisasi dengan Flask Lokal

Supabase adalah sumber metadata utama. Vercel menyimpan nama, koordinat,
Camera ID, dan aktif/nonaktif. Flask lokal menarik metadata itu setiap 10 detik
lalu hanya mengirim status AI dan confidence kembali ke Supabase. Jika PC TPS
mati, admin online dan peta tetap tersedia; status AI yang terlihat adalah
pembaruan terakhir.

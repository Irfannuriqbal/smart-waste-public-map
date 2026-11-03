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
public-web
```

5. Tambahkan dua environment variable di atas untuk Production, Preview, dan
   Development.
6. Klik **Deploy**.

Vercel memberi URL gratis seperti:

```text
https://smart-waste-monitoring.vercel.app
```

Website membaca indikator Arm Roll dari Supabase. Status berubah ketika Flask
lokal di PC TPS hidup dan berhasil melakukan sinkronisasi Supabase.

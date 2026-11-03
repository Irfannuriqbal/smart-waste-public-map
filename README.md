<div align="center">
  <img src="assets/betric.webp" alt="Betric" width="112" />

  # Smart Waste Public Map

  **Peta public untuk memantau kondisi Arm Roll secara transparan dan real-time berbasis status AI.**

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-111111?style=for-the-badge&logo=vercel)](https://smart-waste-public-map.vercel.app)
  [![Supabase](https://img.shields.io/badge/Data-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
  [![Leaflet](https://img.shields.io/badge/Map-Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)

  [Buka Peta Public](https://smart-waste-public-map.vercel.app) · [Login Admin](https://smart-waste-public-map.vercel.app/login.html)
</div>

---

## Tentang Project

**Smart Waste Public Map** adalah website peta untuk menampilkan persebaran dan kondisi Arm Roll. Website ini membaca indikator kondisi dari Supabase dan menampilkannya menggunakan Leaflet + OpenStreetMap.

Project ini merupakan bagian public/cloud dari sistem Smart Waste Monitoring. Sistem AI, CCTV, RTSP, dan RF-DETR tetap berjalan pada perangkat lokal di TPS. Website ini tidak menyimpan maupun menampilkan credential CCTV.

## Fitur

### Public

- Peta Arm Roll berbasis **Leaflet** dan **OpenStreetMap**.
- Marker status yang mudah dibaca.
- Popup nama Arm Roll, status, dan waktu pembaruan.
- Pembaruan indikator otomatis setiap 15 detik.
- Tidak ada akses ke kontrol CCTV, ROI, rekaman, atau dataset.

### Admin Online

- Login aman dengan **Supabase Auth**.
- Tambah, edit, dan hapus lokasi Arm Roll.
- Leaflet map picker untuk memilih koordinat.
- Tombol GPS untuk mengambil lokasi perangkat.
- Pengaturan Camera ID dan status aktif/nonaktif Arm Roll.
- Status `FULL`, `NOT_FULL`, `NO_DETECTION`, dan `OFFLINE` bersifat **read-only**; berasal dari sistem AI lokal.

## Indikator Status

| Status | Warna | Makna |
|---|---|---|
| `FULL` | Merah | Arm Roll terdeteksi penuh. |
| `NOT_FULL` | Hijau | Arm Roll belum penuh. |
| `NO_DETECTION` | Abu-abu | Belum ada deteksi valid. |
| `OFFLINE` | Abu gelap | Kamera atau sistem lokal tidak tersedia. |

## Arsitektur

```text
                    Public / Admin Online
                              │
                              ▼
                  Vercel — Smart Waste Public Map
                              │
                              ▼
                    Supabase — Data & Auth
                              ▲
                              │ status AI / metadata
                              │
                 PC TPS — Flask + SQLite Cache
                              │
             CCTV Dahua RTSP + RF-DETR + ROI
```

> Vercel hanya menyajikan peta dan admin lokasi. RTSP, CCTV live, model AI, dan rekaman tetap berjalan di PC TPS.

## Teknologi

| Area | Teknologi |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Peta | Leaflet + OpenStreetMap |
| Hosting | Vercel |
| Data & Auth | Supabase |
| Backend lokal | Flask, OpenCV, RF-DETR |

## Struktur Repository

```text
smart-waste-public-map/
├── api/
│   ├── arm-rolls.js          # API read-only untuk peta public
│   └── supabase-config.js    # Konfigurasi Supabase untuk client admin
├── assets/
│   └── betric.webp
├── admin.html                # CRUD Arm Roll online
├── admin.js
├── app.js                    # Logika peta public
├── index.html                # Halaman public
├── login.html                # Login Supabase Auth
├── styles.css
├── supabase-client.js
└── vercel.json
```

## Deploy ke Vercel

1. Fork atau push repository ini ke GitHub.
2. Buka [Vercel](https://vercel.com) → **Add New → Project**.
3. Import repository GitHub.
4. Pilih framework preset **Other**.
5. Karena file website sudah berada di root repository, gunakan Root Directory:

   ```text
   ./
   ```

6. Tambahkan Environment Variables berikut di Vercel untuk **Production** dan **Preview**:

   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | `https://PROJECT_ID.supabase.co` |
   | `SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |

7. Klik **Deploy**.

Vercel memberi alamat gratis berakhiran `vercel.app`. Custom domain dapat ditambahkan kemudian bila diperlukan.

## Setup Supabase

### Database

Jalankan schema berikut secara berurutan melalui **Supabase SQL Editor** pada project backend/local:

```text
supabase/schema.sql
supabase/admin_schema.sql
```

Schema menyiapkan:

- Tabel canonical `arm_rolls`.
- View public `arm_roll_public`.
- Row Level Security (RLS).
- Akses read-only untuk public.
- Akses CRUD metadata untuk user admin terautentikasi.

### Authentication

1. Buka **Authentication → Users** di Supabase.
2. Buat akun email/password admin.
3. Aktifkan **Auto confirm user**.
4. Nonaktifkan public signup jika opsi tersedia.
5. Pada **Authentication → URL Configuration**, isi:

   ```text
   Site URL: https://smart-waste-public-map.vercel.app
   Redirect URL: https://smart-waste-public-map.vercel.app/login.html
   ```

Admin masuk melalui:

```text
https://smart-waste-public-map.vercel.app/login.html
```

## Data Sinkronisasi

Supabase adalah sumber metadata Arm Roll utama:

- **Vercel Admin** mengubah kode, nama, lokasi, Camera ID, dan status aktif.
- **Flask lokal** mengambil metadata tersebut dan mengirim status AI terbaru.
- **Peta public** hanya membaca marker aktif dan status aman untuk public.

Jika PC TPS atau koneksi CCTV mati, website tetap bisa dibuka tetapi akan menampilkan status terakhir yang tersimpan di Supabase.

## Keamanan

- Jangan commit file `.env`.
- Jangan masukkan `SUPABASE_SECRET_KEY` ke Vercel, browser, atau repository ini.
- Vercel hanya memakai `SUPABASE_PUBLISHABLE_KEY`.
- Putar/revoke key Supabase jika pernah terekspos.
- Jangan masukkan password CCTV, URL RTSP, database lokal, weights model, atau rekaman ke repository public.

## Batasan Saat Ini

- Peta public tidak menampilkan live CCTV.
- Satu perangkat CCTV/AI lokal aktif saat ini menggunakan `camera-01`.
- Multi-camera dan multi-inference belum diimplementasikan.
- Data AI terbaru membutuhkan perangkat lokal TPS dan koneksi internet aktif.

---

<div align="center">
  Dibangun untuk monitoring kondisi Arm Roll berbasis peta dan computer vision.
</div>

# MedCare Hospital — Sistem Digitalisasi Rumah Sakit

Aplikasi contoh Next.js App Router + JSX + Tailwind CSS + PostgreSQL (Raw SQL) untuk alur layanan rumah sakit. Desain landing page menggunakan pola umum platform modern seperti hero, statistik, kartu layanan, daftar dokter, testimoni, FAQ, CTA, dan footer. Identitas visual dan konten dibuat khusus untuk MedCare.

## Modul yang tersedia

- **Guest:** homepage, daftar poli, daftar dokter, daftar jadwal praktik, halaman login/register.
- **Admin:** ringkasan statistik, manajemen akun (buat/nonaktifkan), CRUD dasar poli, manajemen master obat/stok, validasi janji temu, pemrosesan resep, laporan agregat.
- **Dokter:** dashboard, melihat janji temu untuk dirinya, menyetujui/menolak janji temu, mengelola jadwal praktik 30 menit (dengan pemeriksaan overlap), melihat pasien yang pernah ditangani, membuat rekam medis dan resep.
- **Pasien:** registrasi publik, login, membuat janji temu, melihat/membatalkan janji temu yang masih Pending, melihat rekam medis dan status resep, memperbarui profil.
- **Workflow farmasi:** Menunggu Diproses → Siap Diambil (stok dipotong dalam transaksi setelah stok dikunci dan diperiksa) → Sudah Diambil.
- **Keamanan:** password di-hash dengan bcrypt, sesi JWT pada cookie HttpOnly, role dibaca kembali dari database, dan Route Handler memeriksa authorization di server.

## Prasyarat

- Node.js 20.9+ (sesuai kebutuhan Next.js 16)
- PostgreSQL sudah aktif
- pgAdmin (opsional, untuk menjalankan file SQL)

## 1. Atur koneksi database

Buka `.env.local`, lalu ubah `YOUR_POSTGRES_PASSWORD` dengan password PostgreSQL di komputer Anda:

```env
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/medcare_hospital
AUTH_SECRET=medcare-local-development-secret-change-this-before-deployment-2026
```

`AUTH_SECRET` contoh di atas hanya untuk pengembangan lokal. Ganti dengan random secret panjang sebelum deployment. Jangan commit `.env.local` ke GitHub; file ini sudah masuk `.gitignore`.

## 2. Buat database

Di pgAdmin, buka Query Tool pada server PostgreSQL lalu jalankan:

```sql
CREATE DATABASE medcare_hospital;
```

Pilih database `medcare_hospital`, buka Query Tool, lalu buka dan jalankan `database/schema.sql`.

## 3. Instal dependensi dan data contoh

Buka terminal pada folder proyek:

```bash
npm install
npm run seed
```

Script seed membuat data contoh poli, dokter, jadwal praktik, obat, dan tiga akun demo.

### Akun demo lokal

| Role | Email | Password |
|---|---|---|
| Admin | `admin@medcare.local` | `Admin123!` |
| Dokter | `dokter@medcare.local` | `Dokter123!` |
| Pasien | `pasien@medcare.local` | `Pasien123!` |

Semua akun di atas hanya data demonstrasi lokal. Ganti kredensial tersebut sebelum deployment atau penggunaan nyata.

## 4. Jalankan aplikasi

```bash
npm run dev
```

Buka http://localhost:3000.

Untuk memeriksa build produksi:

```bash
npm run build
npm start
```

## Peta endpoint API

| Method | Endpoint | Akses | Fungsi |
|---|---|---|---|
| POST | `/api/auth/register` | Publik | Registrasi Pasien saja |
| POST | `/api/auth/login` | Publik | Login semua role |
| POST | `/api/auth/logout` | Login | Hapus sesi |
| GET | `/api/auth/me` | Login | Identitas sesi |
| GET/POST | `/api/poli` | Publik/Admin | Daftar dan tambah poli |
| PATCH/DELETE | `/api/poli/:id` | Admin | Ubah/nonaktifkan poli |
| GET | `/api/doctors` | Publik | Daftar dokter |
| GET/POST | `/api/schedules` | Publik/Dokter | Daftar dan tambah jadwal dokter |
| PATCH/DELETE | `/api/schedules/:id` | Dokter pemilik | Ubah/nonaktifkan jadwal sendiri |
| GET/POST | `/api/appointments` | Login/Pasien | Daftar janji temu dan booking |
| PATCH | `/api/appointments/:id` | Admin/Dokter terkait/Pasien pemilik | Validasi atau batalkan janji temu |
| GET/POST | `/api/users` | Admin | Daftar dan buat akun |
| PATCH/DELETE | `/api/users/:id` | Admin | Ubah/nonaktifkan akun |
| GET/POST | `/api/medicines` | Admin/Dokter (GET), Admin (POST) | Daftar/tambah obat |
| PATCH/DELETE | `/api/medicines/:id` | Admin | Ubah/nonaktifkan obat |
| GET/POST | `/api/medical-records` | Login/Dokter (POST) | Lihat dan buat rekam medis |
| GET/PATCH | `/api/prescriptions` | Admin/Pasien | Lihat resep dan ubah status farmasi (Admin) |
| GET/POST | `/api/feedback` | Publik/Pasien | Ulasan pasien setelah konsultasi selesai |
| GET | `/api/admin/overview` | Admin | Statistik dan laporan agregat |
| GET/PATCH | `/api/notifications` | Login | Baca notifikasi dan tandai dibaca |
| PATCH | `/api/profile` | Dokter/Pasien | Ubah profil |

## Catatan implementasi

1. Query menggunakan parameter `$1`, `$2`, dan seterusnya; jangan menyambungkan input pengguna langsung ke string SQL.
2. Authorization wajib dilakukan di Route Handler/server, bukan hanya menyembunyikan tombol pada frontend.
3. Data rekam medis tidak menyediakan endpoint edit/hapus. Pencatatan rekam medis dan perubahan status janji temu menjadi Selesai dilakukan dalam satu transaksi.
4. Pengurangan stok obat saat resep menjadi Siap Diambil dilakukan dalam transaksi dengan row lock (`FOR UPDATE`).
5. Ini adalah prototipe pembelajaran, bukan sistem klinis siap produksi. Jangan gunakan data pasien nyata. Sistem produksi membutuhkan audit log, backup, pengujian keamanan, kontrol privasi, dan tinjauan ahli yang sesuai.
6. Foto dokter dan ilustrasi menggunakan URL gambar eksternal untuk contoh tampilan. Ganti dengan aset yang kamu miliki atau yang berlisensi sesuai kebutuhan.

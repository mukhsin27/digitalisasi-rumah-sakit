# MedikaCare — Digitalisasi Rumah Sakit

Repository awal untuk proyek Digitalisasi Rumah Sakit.

## Struktur awal

```text
digitalisasi-rumah-sakit/
├── database/
│   └── schema.sql
├── src/
│   ├── app/
│   │   └── .gitkeep
│   └── lib/
│       └── .gitkeep
├── .env.example
├── .gitignore
├── jsconfig.json
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md
└── tailwind.config.js
```

## Keterangan

- `database/schema.sql`: tempat menyimpan struktur tabel dan SQL database.
- `src/app/`: tempat halaman website, layout, komponen, dan API Next.js. Kodenya akan ditambahkan bertahap.
- `src/lib/`: tempat helper/library proyek, termasuk koneksi PostgreSQL yang akan ditambahkan kemudian.
- File konfigurasi di root digunakan untuk pengaturan proyek Next.js dan Tailwind CSS.
- `.gitkeep` hanya penanda agar folder kosong tetap dapat disimpan oleh Git. Hapus file tersebut setelah folder berisi kode.

## Persiapan

1. Salin `.env.example` menjadi `.env.local`.
2. Isi konfigurasi database dan rahasia aplikasi di `.env.local`. Jangan unggah `.env.local` ke GitHub.
3. Tambahkan kode aplikasi ke `src/app/` dan `src/lib/` secara bertahap.
4. Setelah kode dan dependensi siap, jalankan `npm install`, lalu `npm run dev`.

> Catatan: ZIP ini sengaja hanya berisi struktur awal dan file yang dipilih. Kode halaman aplikasi serta koneksi database belum dimasukkan.

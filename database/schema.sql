
-- =====================================================
-- MEDIKACARE | DIGITALISASI RUMAH SAKIT
-- DATABASE: digitalisasi_rumah_sakit
-- DBMS: PostgreSQL
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =====================================================
-- 1. TABEL POLI
-- Menyimpan data poli rumah sakit
-- =====================================================

CREATE TABLE IF NOT EXISTS poli (
    id_poli BIGSERIAL PRIMARY KEY,
    nama_poli VARCHAR(100) NOT NULL UNIQUE,
    deskripsi TEXT,
    url_ikon TEXT,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =====================================================
-- 2. TABEL PENGGUNA
-- Menyimpan data admin, dokter, dan pasien
-- =====================================================

CREATE TABLE IF NOT EXISTS pengguna (
    id_pengguna BIGSERIAL PRIMARY KEY,
    nama_pengguna VARCHAR(80) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    hash_kata_sandi TEXT NOT NULL,

    peran VARCHAR(20) NOT NULL
        CHECK (peran IN ('admin', 'dokter', 'pasien')),

    id_poli BIGINT,

    nama_lengkap VARCHAR(150),
    nomor_telepon VARCHAR(30),
    alamat TEXT,

    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pengguna_poli
        FOREIGN KEY (id_poli)
        REFERENCES poli(id_poli)
        ON DELETE SET NULL
);


-- =====================================================
-- 3. TABEL JADWAL DOKTER
-- Menyimpan jadwal praktik dokter
-- =====================================================

CREATE TABLE IF NOT EXISTS jadwal_dokter (
    id_jadwal BIGSERIAL PRIMARY KEY,

    id_dokter BIGINT NOT NULL,

    hari VARCHAR(12) NOT NULL
        CHECK (hari IN (
            'Senin',
            'Selasa',
            'Rabu',
            'Kamis',
            'Jumat',
            'Sabtu',
            'Minggu'
        )),

    waktu_mulai TIME NOT NULL,

    durasi_menit INT NOT NULL DEFAULT 30
        CHECK (durasi_menit = 30),

    status_aktif BOOLEAN NOT NULL DEFAULT TRUE,

    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_jadwal_dokter_pengguna
        FOREIGN KEY (id_dokter)
        REFERENCES pengguna(id_pengguna)
        ON DELETE CASCADE,

    CONSTRAINT unik_jadwal_dokter
        UNIQUE (id_dokter, hari, waktu_mulai)
);


-- =====================================================
-- 4. TABEL OBAT
-- Menyimpan data obat dan stok farmasi
-- =====================================================

CREATE TABLE IF NOT EXISTS obat (
    id_obat BIGSERIAL PRIMARY KEY,

    nama_obat VARCHAR(150) NOT NULL UNIQUE,
    deskripsi TEXT,

    jenis_obat VARCHAR(20) NOT NULL
        CHECK (jenis_obat IN ('keras', 'biasa')),

    stok INT NOT NULL DEFAULT 0
        CHECK (stok >= 0),

    url_gambar TEXT,
    tanggal_kedaluwarsa DATE,

    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =====================================================
-- 5. TABEL JANJI_TEMU
-- Menyimpan pendaftaran pemeriksaan pasien
-- =====================================================

CREATE TABLE IF NOT EXISTS janji_temu (
    id_janji BIGSERIAL PRIMARY KEY,

    id_pasien BIGINT NOT NULL,
    id_dokter BIGINT NOT NULL,
    id_jadwal BIGINT NOT NULL,

    tanggal_janji DATE NOT NULL,
    keluhan TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (status IN (
            'Pending',
            'Approved',
            'Rejected',
            'Selesai',
            'Cancelled'
        )),

    alasan_penolakan TEXT,

    id_validator BIGINT,

    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    diperbarui_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_janji_pasien
        FOREIGN KEY (id_pasien)
        REFERENCES pengguna(id_pengguna),

    CONSTRAINT fk_janji_dokter
        FOREIGN KEY (id_dokter)
        REFERENCES pengguna(id_pengguna),

    CONSTRAINT fk_janji_jadwal
        FOREIGN KEY (id_jadwal)
        REFERENCES jadwal_dokter(id_jadwal),

    CONSTRAINT fk_janji_validator
        FOREIGN KEY (id_validator)
        REFERENCES pengguna(id_pengguna)
);


-- =====================================================
-- 6. INDEX JANJI_TEMU
-- Mempercepat pencarian data janji temu
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_janji_pasien_dibuat
    ON janji_temu (id_pasien, dibuat_pada DESC);

CREATE INDEX IF NOT EXISTS idx_janji_dokter_status_tanggal
    ON janji_temu (id_dokter, status, tanggal_janji);


-- =====================================================
-- 7. TABEL REKAM_MEDIS
-- Menyimpan riwayat pemeriksaan pasien
-- =====================================================

CREATE TABLE IF NOT EXISTS rekam_medis (
    id_rekam_medis BIGSERIAL PRIMARY KEY,

    id_janji BIGINT NOT NULL UNIQUE,
    id_pasien BIGINT NOT NULL,
    id_dokter BIGINT NOT NULL,

    diagnosis TEXT NOT NULL,
    tindakan_medis TEXT NOT NULL,
    catatan TEXT NOT NULL,

    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rekam_janji
        FOREIGN KEY (id_janji)
        REFERENCES janji_temu(id_janji),

    CONSTRAINT fk_rekam_pasien
        FOREIGN KEY (id_pasien)
        REFERENCES pengguna(id_pengguna),

    CONSTRAINT fk_rekam_dokter
        FOREIGN KEY (id_dokter)
        REFERENCES pengguna(id_pengguna)
);


-- =====================================================
-- 8. TABEL RESEP
-- Menyimpan resep obat pasien
-- =====================================================

CREATE TABLE IF NOT EXISTS resep (
    id_resep BIGSERIAL PRIMARY KEY,

    id_rekam_medis BIGINT NOT NULL,
    id_obat BIGINT NOT NULL,

    jumlah INT NOT NULL
        CHECK (jumlah > 0),

    status VARCHAR(30) NOT NULL DEFAULT 'Menunggu Diproses'
        CHECK (status IN (
            'Menunggu Diproses',
            'Siap Diambil',
            'Sudah Diambil'
        )),

    disiapkan_pada TIMESTAMPTZ,
    diambil_pada TIMESTAMPTZ,

    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_resep_rekam_medis
        FOREIGN KEY (id_rekam_medis)
        REFERENCES rekam_medis(id_rekam_medis),

    CONSTRAINT fk_resep_obat
        FOREIGN KEY (id_obat)
        REFERENCES obat(id_obat)
);


-- =====================================================
-- 9. TABEL ULASAN
-- Menyimpan penilaian pasien terhadap dokter
-- =====================================================

CREATE TABLE IF NOT EXISTS ulasan (
    id_ulasan BIGSERIAL PRIMARY KEY,

    id_pasien BIGINT NOT NULL,
    id_dokter BIGINT,

    rating INT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    komentar TEXT,

    dibuat_pada TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_ulasan_pasien
        FOREIGN KEY (id_pasien)
        REFERENCES pengguna(id_pengguna),

    CONSTRAINT fk_ulasan_dokter
        FOREIGN KEY (id_dokter)
        REFERENCES pengguna(id_pengguna),

    CONSTRAINT unik_ulasan_pasien_dokter
        UNIQUE (id_pasien, id_dokter)
);


-- =====================================================
-- 10. DATA AWAL POLI
-- =====================================================

INSERT INTO poli (nama_poli, deskripsi) VALUES
(
    'Poli Umum',
    'Pemeriksaan kesehatan dasar dan konsultasi keluhan umum.'
),
(
    'Poli Gigi',
    'Pemeriksaan dan perawatan kesehatan gigi dan mulut.'
),
(
    'Poli Anak',
    'Layanan kesehatan dan tumbuh kembang anak.'
),
(
    'Poli Penyakit Dalam',
    'Konsultasi dan penanganan penyakit organ dalam.'
)
ON CONFLICT (nama_poli) DO NOTHING;


-- =====================================================
-- 11. DATA AWAL OBAT
-- =====================================================

INSERT INTO obat (
    nama_obat,
    deskripsi,
    jenis_obat,
    stok,
    tanggal_kedaluwarsa
)
VALUES
(
    'Paracetamol 500 mg',
    'Obat pereda nyeri dan penurun demam.',
    'biasa',
    100,
    '2027-12-31'
),
(
    'Amoxicillin 500 mg',
    'Antibiotik sesuai resep dokter.',
    'keras',
    50,
    '2027-10-31'
),
(
    'Vitamin C 500 mg',
    'Suplemen vitamin C.',
    'biasa',
    80,
    '2028-02-28'
)
ON CONFLICT (nama_obat) DO NOTHING;


-- =====================================================
-- 12. AKUN ADMIN AWAL
-- Password disimpan dalam bentuk hash bcrypt
-- =====================================================

INSERT INTO pengguna (
    nama_pengguna,
    email,
    hash_kata_sandi,
    peran
)
VALUES (
    'Administrator',
    'admin@medikacare.local',
    crypt('Admin123!', gen_salt('bf', 12)),
    'admin'
)
ON CONFLICT (email) DO NOTHING;


-- =====================================================
-- SELESAI
-- DATABASE MEDIKACARE BERHASIL DIDEFINISIKAN
-- =====================================================

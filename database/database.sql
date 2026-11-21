
-- =============================================================
-- MEDCARE HOSPITAL | DIGITALISASI RUMAH SAKIT
-- DBMS       : PostgreSQL
-- Tujuan     : Database sesuai dengan kode aplikasi Next.js
-- =============================================================

-- =============================================================
-- 1. TABEL POLI
-- Menyimpan daftar layanan/poli rumah sakit.
-- Contoh: Poli Umum, Poli Gigi, Poli Anak.
-- =============================================================

CREATE TABLE IF NOT EXISTS poli (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- =============================================================
-- 2. TABEL USERS
-- Menyimpan akun admin, dokter, dan pasien.
-- Tabel ini digunakan ketika registrasi dan login.
-- =============================================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'doctor', 'patient')),

    poli_id BIGINT REFERENCES poli(id) ON DELETE SET NULL,
    phone VARCHAR(30),
    str_number VARCHAR(50),
    doctor_verification_status VARCHAR(20) NOT NULL DEFAULT 'approved',
    bio TEXT,
    image_url TEXT,
    experience VARCHAR(80),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_doctor_must_have_poli
        CHECK (
            (role = 'doctor' AND poli_id IS NOT NULL)
            OR role <> 'doctor'
        )
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS str_number VARCHAR(50);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS doctor_verification_status VARCHAR(20) NOT NULL DEFAULT 'approved';

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_doctor_str_number
ON users (str_number)
WHERE role = 'doctor' AND str_number IS NOT NULL;



-- =============================================================
-- 3. TABEL DOCTOR_SCHEDULES
-- Menyimpan jadwal praktik dokter.
-- =============================================================

CREATE TABLE IF NOT EXISTS doctor_schedules (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    doctor_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    day_of_week SMALLINT NOT NULL
        CHECK (day_of_week BETWEEN 0 AND 6),

    start_time TIME NOT NULL,

    duration_minutes SMALLINT NOT NULL DEFAULT 30
        CHECK (duration_minutes = 30),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_doctor_schedule
        UNIQUE (doctor_id, day_of_week, start_time)
);



-- =============================================================
-- 4. TABEL APPOINTMENTS
-- Menyimpan janji temu atau pendaftaran pemeriksaan pasien.
-- =============================================================

CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    patient_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    doctor_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    schedule_id BIGINT NOT NULL
        REFERENCES doctor_schedules(id) ON DELETE RESTRICT,

    booking_date DATE NOT NULL,
    complaint TEXT NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'approved',
                'rejected',
                'completed',
                'cancelled'
            )
        ),

    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_patient_is_not_doctor
        CHECK (patient_id <> doctor_id)
);


-- =============================================================
-- 5. INDEX APPOINTMENTS
-- Mempercepat pencarian dan mencegah pemesanan slot ganda.
-- =============================================================

CREATE UNIQUE INDEX IF NOT EXISTS uq_appointment_active_slot
ON appointments (schedule_id, booking_date)
WHERE status IN ('pending', 'approved', 'completed');

CREATE INDEX IF NOT EXISTS idx_appointments_doctor_status
ON appointments (doctor_id, status);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_created
ON appointments (patient_id, created_at DESC);


-- =============================================================
-- 6. TABEL MEDICAL_RECORDS
-- Menyimpan hasil pemeriksaan pasien oleh dokter.
-- =============================================================

CREATE TABLE IF NOT EXISTS medical_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    appointment_id BIGINT NOT NULL UNIQUE
        REFERENCES appointments(id) ON DELETE RESTRICT,

    patient_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    doctor_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    diagnosis TEXT NOT NULL,
    medical_action TEXT NOT NULL,
    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);



-- =============================================================
-- 7. TABEL MEDICINES
-- Menyimpan data obat dan stok bagian farmasi.
-- =============================================================

CREATE TABLE IF NOT EXISTS medicines (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,

    medicine_type VARCHAR(20) NOT NULL
        CHECK (medicine_type IN ('ordinary', 'prescription')),

    stock INTEGER NOT NULL DEFAULT 0
        CHECK (stock >= 0),

    expires_at DATE,
    image_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);




-- =============================================================
-- 8. TABEL PRESCRIPTIONS
-- Menyimpan informasi utama resep yang dibuat dokter.
-- =============================================================

CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    medical_record_id BIGINT NOT NULL UNIQUE
        REFERENCES medical_records(id) ON DELETE RESTRICT,

    status VARCHAR(20) NOT NULL DEFAULT 'waiting'
        CHECK (status IN ('waiting', 'ready', 'collected')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================
-- 9. TABEL PRESCRIPTION_ITEMS
-- Menyimpan rincian obat dalam satu resep.
-- Satu resep dapat memiliki beberapa jenis obat.
-- =============================================================

CREATE TABLE IF NOT EXISTS prescription_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    prescription_id BIGINT NOT NULL
        REFERENCES prescriptions(id) ON DELETE CASCADE,

    medicine_id BIGINT NOT NULL
        REFERENCES medicines(id) ON DELETE RESTRICT,

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    CONSTRAINT uq_prescription_medicine
        UNIQUE (prescription_id, medicine_id)
);


-- 10. TABEL FEEDBACK
-- Menyimpan penilaian dan komentar pasien terhadap layanan.
-- =============================================================

CREATE TABLE IF NOT EXISTS feedback (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    patient_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,

    rating SMALLINT NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,
    public_consent BOOLEAN NOT NULL DEFAULT FALSE,
    public_status VARCHAR(20) NOT NULL DEFAULT 'private'
        CHECK (public_status IN ('private', 'pending', 'approved', 'rejected')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE feedback
    ADD COLUMN IF NOT EXISTS public_consent BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE feedback
    ADD COLUMN IF NOT EXISTS public_status VARCHAR(20) NOT NULL DEFAULT 'private';

CREATE INDEX IF NOT EXISTS idx_feedback_public_created_at
    ON feedback (created_at DESC)
    WHERE public_consent = TRUE AND public_status = 'approved';


-- =============================================================
-- 11. TABEL NOTIFICATIONS
-- Menyimpan pemberitahuan untuk pengguna aplikasi.
-- Contoh: janji temu disetujui atau resep siap diambil.
-- =============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================
-- 12. INDEX TAMBAHAN
-- Membantu mempercepat proses pencarian data.
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_users_role
ON users (role);

CREATE INDEX IF NOT EXISTS idx_prescriptions_status
ON prescriptions (status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON notifications (user_id, is_read, created_at DESC);


-- =============================================================
-- 13. DML: MEMASUKKAN DATA AWAL POLI
-- =============================================================

INSERT INTO poli (name, description)
VALUES
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
    'Poli Jantung',
    'Pemeriksaan dan konsultasi kesehatan jantung.'
),
(
    'Poli Penyakit Dalam',
    'Diagnosis dan penanganan penyakit organ dalam.'
),
(
    'Poli Kandungan',
    'Layanan kesehatan ibu dan reproduksi.'
),
(
    'Poli Mata',
    'Pemeriksaan dan perawatan kesehatan mata.'
),
(
    'Poli Saraf',
    'Konsultasi gangguan saraf dan neurologis.'
)
ON CONFLICT (name) DO NOTHING;


-- =============================================================
-- 14. DML: MEMASUKKAN DATA AWAL OBAT
-- =============================================================

INSERT INTO medicines (
    name,
    description,
    medicine_type,
    stock,
    expires_at
)
VALUES
(
    'Paracetamol 500 mg',
    'Obat pereda nyeri dan penurun demam.',
    'ordinary',
    120,
    '2027-12-31'
),
(
    'Amoxicillin 500 mg',
    'Antibiotik sesuai resep dokter.',
    'prescription',
    80,
    '2027-09-30'
),
(
    'Vitamin C 500 mg',
    'Suplemen vitamin C.',
    'ordinary',
    75,
    '2028-03-31'
),
(
    'Omeprazole 20 mg',
    'Obat untuk menurunkan produksi asam lambung.',
    'prescription',
    50,
    '2027-06-30'
)
ON CONFLICT (name) DO NOTHING;


-- =============================================================
-- 15. PEMERIKSAAN DATABASE
-- Menampilkan seluruh tabel dan keterangan fungsinya.
-- =============================================================

SELECT
    table_name,
    obj_description(
        (quote_ident(table_schema) || '.' || quote_ident(table_name))::regclass,
        'pg_class'
    ) AS keterangan_tabel
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;


-- =============================================================
-- SELESAI
-- Struktur database MedCare Hospital berhasil dibuat.
--
-- LANGKAH SELANJUTNYA:
-- Jalankan perintah berikut pada terminal project:
--
-- npm run seed
--
-- Perintah tersebut akan membuat akun demo, jadwal dokter,
-- serta melengkapi data awal poli dan obat.
-- =============================================================







-- =============================================================
-- MEDCARE HOSPITAL | DIGITALISASI RUMAH SAKIT
-- FILE        : seed.sql
-- DBMS        : PostgreSQL
-- Tujuan      : Memasukkan data awal untuk pengujian aplikasi
-- =============================================================


-- =============================================================
-- 1. DATA AWAL POLI
-- Menyediakan daftar poli yang dapat digunakan pasien
-- dan dikaitkan dengan dokter.
-- =============================================================

INSERT INTO poli (name, description)
VALUES
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
    'Poli Jantung',
    'Pemeriksaan dan konsultasi kesehatan jantung.'
),
(
    'Poli Penyakit Dalam',
    'Diagnosis dan penanganan penyakit organ dalam.'
),
(
    'Poli Kandungan',
    'Layanan kesehatan ibu dan reproduksi.'
),
(
    'Poli Mata',
    'Pemeriksaan dan perawatan kesehatan mata.'
),
(
    'Poli Saraf',
    'Konsultasi gangguan saraf dan neurologis.'
)
ON CONFLICT (name) DO NOTHING;


-- =============================================================
-- 2. DATA AWAL OBAT
-- Menyediakan katalog obat untuk kebutuhan pengujian farmasi.
-- =============================================================

INSERT INTO medicines (
    name,
    description,
    medicine_type,
    stock,
    expires_at
)
VALUES
(
    'Paracetamol 500 mg',
    'Obat pereda nyeri dan penurun demam.',
    'ordinary',
    120,
    '2027-12-31'
),
(
    'Amoxicillin 500 mg',
    'Antibiotik sesuai resep dokter.',
    'prescription',
    80,
    '2027-09-30'
),
(
    'Vitamin C 500 mg',
    'Suplemen vitamin C.',
    'ordinary',
    75,
    '2028-03-31'
),
(
    'Omeprazole 20 mg',
    'Obat untuk menurunkan produksi asam lambung.',
    'prescription',
    50,
    '2027-06-30'
)
ON CONFLICT (name) DO NOTHING;


-- =============================================================
-- 3. PEMERIKSAAN DATA POLI
-- Menampilkan daftar poli yang berhasil tersedia.
-- =============================================================

SELECT
    id,
    name,
    description,
    is_active
FROM poli
ORDER BY id;


-- =============================================================
-- 4. PEMERIKSAAN DATA OBAT
-- Menampilkan daftar obat yang berhasil tersedia.
-- =============================================================

SELECT
    id,
    name,
    medicine_type,
    stock,
    expires_at,
    is_active
FROM medicines
ORDER BY id;

-- Foto dokter demo disimpan di public/doctors dan dicocokkan berdasarkan nama.
UPDATE users SET image_url = '/doctors/01_andi_saputra.png'
WHERE role = 'doctor' AND full_name = 'dr. Andi Saputra';

UPDATE users SET image_url = '/doctors/02_siti_rahmawati.png'
WHERE role = 'doctor' AND full_name = 'dr. Siti Rahmawati';

UPDATE users SET image_url = '/doctors/03_budi_santoso.png'
WHERE role = 'doctor' AND full_name = 'dr. Budi Santoso, Sp.PD';

UPDATE users SET image_url = '/doctors/04_rina_anggraini.png'
WHERE role = 'doctor' AND full_name = 'dr. Rina Anggraini, Sp.KG';

UPDATE users SET image_url = '/doctors/05_muhammad_fajar.png'
WHERE role = 'doctor' AND full_name = 'dr. Muhammad Fajar';

-- =============================================================
-- SELESAI
-- Data awal MedCare Hospital berhasil disiapkan.
-- =============================================================

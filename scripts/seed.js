import pg from "pg";
import bcrypt from "bcryptjs";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const departments = [
      ["Poli Umum", "Pemeriksaan kesehatan dasar dan konsultasi keluhan umum."],
      ["Poli Gigi", "Pemeriksaan dan perawatan kesehatan gigi dan mulut."],
      ["Poli Anak", "Layanan kesehatan dan tumbuh kembang anak."],
      ["Poli Jantung", "Pemeriksaan dan konsultasi kesehatan jantung."],
      ["Poli Penyakit Dalam", "Diagnosis dan penanganan penyakit organ dalam."],
      ["Poli Kandungan", "Layanan kesehatan ibu dan reproduksi."],
      ["Poli Mata", "Pemeriksaan dan perawatan kesehatan mata."],
      ["Poli Saraf", "Konsultasi gangguan saraf dan neurologis."]
    ];
    for (const [name, description] of departments) {
      await client.query(`INSERT INTO poli(name,description) VALUES($1,$2) ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description,is_active=TRUE`, [name, description]);
    }
    const poli = (await client.query(`SELECT id FROM poli WHERE name='Poli Penyakit Dalam'`)).rows[0];
    const userSeeds = [
      { full_name:"Administrator MedCare", username:"admin", email:"admin@medcare.local", password:"Admin123!", role:"admin" },
      { full_name:"dr. Aditya Pratama, Sp.PD", username:"dokter", email:"dokter@medcare.local", password:"Dokter123!", role:"doctor", poli_id:poli.id, bio:"Dokter spesialis penyakit dalam.", experience:"12 tahun pengalaman", image_url:"https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=700&auto=format&fit=crop" },
      { full_name:"Pasien Demo", username:"pasien", email:"pasien@medcare.local", password:"Pasien123!", role:"patient" }
    ];
    const ids = {};
    for (const u of userSeeds) {
      const hash = await bcrypt.hash(u.password, 12);
      const r = await client.query(
        `INSERT INTO users(full_name,username,email,password_hash,role,poli_id,bio,experience,image_url)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT(email) DO UPDATE SET full_name=EXCLUDED.full_name,role=EXCLUDED.role,poli_id=EXCLUDED.poli_id,bio=EXCLUDED.bio,experience=EXCLUDED.experience,image_url=EXCLUDED.image_url,is_active=TRUE,doctor_verification_status='approved'
         RETURNING id`,
        [u.full_name,u.username,u.email,hash,u.role,u.poli_id||null,u.bio||null,u.experience||null,u.image_url||null]
      );
      ids[u.role] = r.rows[0].id;
    }
    const doctorId = ids.doctor;
    for (const [day, time] of [[1,"08:00"],[1,"09:00"],[3,"10:00"],[5,"13:00"]]) {
      await client.query(`INSERT INTO doctor_schedules(doctor_id,day_of_week,start_time,duration_minutes) VALUES($1,$2,$3,30) ON CONFLICT(doctor_id,day_of_week,start_time) DO UPDATE SET is_active=TRUE`, [doctorId,day,time]);
    }
    const meds = [
      ["Paracetamol 500 mg","Pereda nyeri dan demam.","ordinary",120,"2027-12-31"],
      ["Amoxicillin 500 mg","Antibiotik sesuai resep dokter.","prescription",80,"2027-09-30"],
      ["Vitamin C 500 mg","Suplemen vitamin C.","ordinary",75,"2028-03-31"],
      ["Omeprazole 20 mg","Obat untuk menurunkan produksi asam lambung.","prescription",50,"2027-06-30"]
    ];
    for (const m of meds) await client.query(`INSERT INTO medicines(name,description,medicine_type,stock,expires_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(name) DO UPDATE SET description=EXCLUDED.description,medicine_type=EXCLUDED.medicine_type,expires_at=EXCLUDED.expires_at,is_active=TRUE`,m);
    await client.query("COMMIT");
    console.log("Seed berhasil. Akun demo:");
    console.log("Admin : admin@medcare.local / Admin123!");
    console.log("Dokter: dokter@medcare.local / Dokter123!");
    console.log("Pasien: pasien@medcare.local / Pasien123!");
    console.log("Catatan: ganti password demo sebelum aplikasi digunakan di lingkungan nyata.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed gagal:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}
main();

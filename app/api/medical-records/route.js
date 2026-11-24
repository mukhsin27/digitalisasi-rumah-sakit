import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function GET() {
  const a = await requireRole(["admin", "doctor", "patient"]);
  if (a.response) return a.response;
  try {
    let where = "";
    let params = [];
    if (a.user.role === "patient") {
      where = "WHERE mr.patient_id=$1";
      params = [a.user.id];
    } else if (a.user.role === "doctor") {
      where = "WHERE mr.doctor_id=$1";
      params = [a.user.id];
    }
    const r = await pool.query(
      `SELECT mr.*,p.full_name AS patient_name,d.full_name AS doctor_name,a.booking_date,pr.id AS prescription_id,pr.status AS prescription_status FROM medical_records mr JOIN users p ON p.id=mr.patient_id JOIN users d ON d.id=mr.doctor_id JOIN appointments a ON a.id=mr.appointment_id LEFT JOIN prescriptions pr ON pr.medical_record_id=mr.id ${where} ORDER BY mr.created_at DESC`,
      params,
    );
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil rekam medis." },
      { status: 500 },
    );
  }
}
export async function POST(request) {
  const a = await requireRole(["doctor"]);
  if (a.response) return a.response;
  const client = await pool.connect();
  try {
    const b = await request.json();
    const appointmentId = Number(b.appointment_id);
    const diagnosis = String(b.diagnosis || "").trim(),
      action = String(b.medical_action || "").trim(),
      notes = String(b.notes || "").trim();
    const items = Array.isArray(b.items) ? b.items : [];
    if (
      !Number.isInteger(appointmentId) ||
      !diagnosis ||
      !action ||
      items.length < 1 ||
      items.length > 20
    )
      return NextResponse.json(
        {
          ok: false,
          message:
            "Janji temu, diagnosis, tindakan, dan minimal satu item resep wajib diisi.",
        },
        { status: 400 },
      );
    await client.query("BEGIN");
    const ar = await client.query(
      `SELECT id,patient_id,doctor_id,status FROM appointments WHERE id=$1 AND doctor_id=$2 AND booking_date<=CURRENT_DATE FOR UPDATE`,
      [appointmentId, a.user.id],
    );
    const ap = ar.rows[0];
    if (!ap || ap.status !== "approved") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          ok: false,
          message:
            "Janji temu tidak ditemukan, bukan milik dokter ini, atau belum berstatus Approved dengan tanggal yang sudah tiba.",
        },
        { status: 409 },
      );
    }
    const mr = await client.query(
      `INSERT INTO medical_records(appointment_id,patient_id,doctor_id,diagnosis,medical_action,notes) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [appointmentId, ap.patient_id, a.user.id, diagnosis, action, notes],
    );
    const prescription = await client.query(
      `INSERT INTO prescriptions(medical_record_id,status) VALUES($1,'waiting') RETURNING id`,
      [mr.rows[0].id],
    );
    for (const item of items) {
      const medicineId = Number(item.medicine_id),
        quantity = Number(item.quantity);
      if (
        !Number.isInteger(medicineId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      )
        throw new Error("Rincian obat tidak valid.");
      await client.query(
        `INSERT INTO prescription_items(prescription_id,medicine_id,quantity) VALUES($1,$2,$3)`,
        [prescription.rows[0].id, medicineId, quantity],
      );
    }
    await client.query(
      `UPDATE appointments SET status='completed',updated_at=NOW() WHERE id=$1`,
      [appointmentId],
    );
    await client.query(
      `INSERT INTO notifications(user_id,title,message) VALUES($1,'Rekam medis tersedia','Dokter telah menyelesaikan konsultasi dan membuat resep obat.')`,
      [ap.patient_id],
    );
    await client.query("COMMIT");
    return NextResponse.json(
      {
        ok: true,
        message: "Rekam medis dan resep berhasil disimpan.",
        data: {
          medical_record: mr.rows[0],
          prescription_id: prescription.rows[0].id,
        },
      },
      { status: 201 },
    );
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("MEDICAL_RECORD_CREATE", e);
    return NextResponse.json(
      { ok: false, message: e.message || "Gagal menyimpan rekam medis." },
      { status: e.code === "23505" ? 409 : 500 },
    );
  } finally {
    client.release();
  }
}

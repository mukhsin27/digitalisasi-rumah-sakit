import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";

export const runtime = "nodejs";

export async function GET() {
  const auth = await requireRole(["admin", "doctor", "patient"]);
  if (auth.response) return auth.response;

  try {
    let result;
    if (auth.user.role === "admin") {
      result = await pool.query(
        `SELECT a.*, patient.full_name AS patient_name, doctor.full_name AS doctor_name,
                p.name AS poli_name, s.day_of_week, s.start_time
         FROM appointments a
         JOIN users patient ON patient.id = a.patient_id
         JOIN users doctor ON doctor.id = a.doctor_id
         JOIN doctor_schedules s ON s.id = a.schedule_id
         LEFT JOIN poli p ON p.id = doctor.poli_id
         ORDER BY a.booking_date DESC, a.created_at DESC`
      );
    } else if (auth.user.role === "doctor") {
      result = await pool.query(
        `SELECT a.*, patient.full_name AS patient_name, doctor.full_name AS doctor_name,
                p.name AS poli_name, s.day_of_week, s.start_time
         FROM appointments a
         JOIN users patient ON patient.id = a.patient_id
         JOIN users doctor ON doctor.id = a.doctor_id
         JOIN doctor_schedules s ON s.id = a.schedule_id
         LEFT JOIN poli p ON p.id = doctor.poli_id
         WHERE a.doctor_id = $1
         ORDER BY a.booking_date DESC, a.created_at DESC`,
        [auth.user.id]
      );
    } else {
      result = await pool.query(
        `SELECT a.*, patient.full_name AS patient_name, doctor.full_name AS doctor_name,
                p.name AS poli_name, s.day_of_week, s.start_time
         FROM appointments a
         JOIN users patient ON patient.id = a.patient_id
         JOIN users doctor ON doctor.id = a.doctor_id
         JOIN doctor_schedules s ON s.id = a.schedule_id
         LEFT JOIN poli p ON p.id = doctor.poli_id
         WHERE a.patient_id = $1
         ORDER BY a.booking_date DESC, a.created_at DESC`,
        [auth.user.id]
      );
    }
    return NextResponse.json({ ok: true, data: result.rows });
  } catch (error) {
    console.error("APPOINTMENTS_LIST_ERROR", error);
    return NextResponse.json({ ok: false, message: "Gagal mengambil janji temu." }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireRole(["patient"]);
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const doctorId = Number(body.doctor_id);
    const scheduleId = Number(body.schedule_id);
    const bookingDate = String(body.booking_date ?? "");
    const complaint = String(body.complaint ?? "").trim();

    if (!Number.isInteger(doctorId) || !Number.isInteger(scheduleId) || !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) || !complaint || new Date(`${bookingDate}T00:00:00`) < new Date(new Date().toISOString().slice(0,10)+"T00:00:00")) {
      return NextResponse.json({ ok: false, message: "Dokter, jadwal, tanggal hari ini/masa depan, dan keluhan wajib diisi dengan benar." }, { status: 400 });
    }

    const scheduleResult = await pool.query(
      `SELECT s.id, s.doctor_id, s.day_of_week
       FROM doctor_schedules s
       JOIN users u ON u.id = s.doctor_id AND u.is_active = TRUE
       WHERE s.id = $1 AND s.doctor_id = $2 AND s.is_active = TRUE`,
      [scheduleId, doctorId]
    );
    const schedule = scheduleResult.rows[0];
    if (!schedule) {
      return NextResponse.json({ ok: false, message: "Jadwal dokter tidak ditemukan atau tidak aktif." }, { status: 404 });
    }

    const dayResult = await pool.query(`SELECT EXTRACT(DOW FROM $1::date)::int AS day`, [bookingDate]);
    if (Number(dayResult.rows[0].day) !== Number(schedule.day_of_week)) {
      return NextResponse.json({ ok: false, message: "Tanggal tidak sesuai dengan hari praktik dokter." }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, schedule_id, booking_date, complaint)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, patient_id, doctor_id, schedule_id, booking_date, complaint, status, created_at`,
      [auth.user.id, doctorId, scheduleId, bookingDate, complaint]
    );

    await pool.query(
      `INSERT INTO notifications(user_id,title,message) VALUES($1,'Janji temu baru','Ada pengajuan janji temu baru yang perlu Anda validasi.')`,
      [doctorId]
    );
    return NextResponse.json({ ok: true, message: "Janji temu berhasil diajukan.", data: result.rows[0] }, { status: 201 });
  } catch (error) {
    if (error?.code === "23505") {
      return NextResponse.json({ ok: false, message: "Slot jadwal tersebut sudah dipesan." }, { status: 409 });
    }
    console.error("APPOINTMENT_CREATE_ERROR", error);
    return NextResponse.json({ ok: false, message: "Gagal membuat janji temu." }, { status: 500 });
  }
}

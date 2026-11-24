import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctor_id");
    const params = [];
    let where = "s.is_active=TRUE";
    if (doctorId) {
      params.push(doctorId);
      where += " AND s.doctor_id=$1";
    }
    const r = await pool.query(
      `SELECT s.id,s.doctor_id,s.day_of_week,s.start_time,s.duration_minutes,u.full_name AS doctor_name,p.name AS poli_name FROM doctor_schedules s JOIN users u ON u.id=s.doctor_id LEFT JOIN poli p ON p.id=u.poli_id WHERE ${where} AND u.is_active=TRUE ORDER BY s.day_of_week,s.start_time`,
      params,
    );
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil jadwal." },
      { status: 500 },
    );
  }
}
export async function POST(request) {
  const a = await requireRole(["doctor"]);
  if (a.response) return a.response;
  try {
    const b = await request.json();
    const day = Number(b.day_of_week);
    const start = String(b.start_time || "");
    if (
      !Number.isInteger(day) ||
      day < 0 ||
      day > 6 ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(start)
    )
      return NextResponse.json(
        { ok: false, message: "Hari atau jam mulai tidak valid." },
        { status: 400 },
      );
    const conflict = await pool.query(
      `SELECT id FROM doctor_schedules WHERE doctor_id=$1 AND day_of_week=$3 AND is_active=TRUE AND start_time < ($2::time + interval '30 minutes') AND (start_time + interval '30 minutes') > $2::time`,
      [a.user.id, start, day],
    );
    if (conflict.rowCount)
      return NextResponse.json(
        { ok: false, message: "Jadwal bertumpang tindih dengan jadwal lain." },
        { status: 409 },
      );
    const r = await pool.query(
      `INSERT INTO doctor_schedules(doctor_id,day_of_week,start_time,duration_minutes) VALUES($1,$2,$3,30) RETURNING *`,
      [a.user.id, day, start],
    );
    return NextResponse.json({ ok: true, data: r.rows[0] }, { status: 201 });
  } catch (e) {
    if (e.code === "23505")
      return NextResponse.json(
        { ok: false, message: "Jadwal pada hari dan jam tersebut sudah ada." },
        { status: 409 },
      );
    return NextResponse.json(
      { ok: false, message: "Gagal menambah jadwal." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function PATCH(request, context) {
  const a = await requireRole(["doctor"]);
  if (a.response) return a.response;
  try {
    const { id } = await context.params;
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
        { ok: false, message: "Jadwal tidak valid." },
        { status: 400 },
      );
    const conflict = await pool.query(
      `SELECT id FROM doctor_schedules WHERE doctor_id=$1 AND id<>$2 AND is_active=TRUE AND day_of_week=$3 AND start_time < ($4::time + interval '30 minutes') AND (start_time + interval '30 minutes') > $4::time`,
      [a.user.id, id, day, start],
    );
    if (conflict.rowCount)
      return NextResponse.json(
        { ok: false, message: "Jadwal bertumpang tindih." },
        { status: 409 },
      );
    const r = await pool.query(
      `UPDATE doctor_schedules SET day_of_week=$1,start_time=$2 WHERE id=$3 AND doctor_id=$4 RETURNING *`,
      [day, start, id, a.user.id],
    );
    if (!r.rowCount)
      return NextResponse.json(
        { ok: false, message: "Jadwal tidak ditemukan." },
        { status: 404 },
      );
    return NextResponse.json({ ok: true, data: r.rows[0] });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal mengubah jadwal." },
      { status: 500 },
    );
  }
}
export async function DELETE(request, context) {
  const a = await requireRole(["doctor"]);
  if (a.response) return a.response;
  try {
    const { id } = await context.params;
    const r = await pool.query(
      `UPDATE doctor_schedules SET is_active=FALSE WHERE id=$1 AND doctor_id=$2 RETURNING id`,
      [id, a.user.id],
    );
    if (!r.rowCount)
      return NextResponse.json(
        { ok: false, message: "Jadwal tidak ditemukan." },
        { status: 404 },
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal menghapus jadwal." },
      { status: 500 },
    );
  }
}

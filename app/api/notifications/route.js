import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
export const runtime = "nodejs";
export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { ok: false, message: "Silakan login." },
      { status: 401 },
    );
  try {
    const r = await pool.query(
      `SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20`,
      [user.id],
    );
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil notifikasi." },
      { status: 500 },
    );
  }
}
export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { ok: false, message: "Silakan login." },
      { status: 401 },
    );
  try {
    const b = await request.json();
    if (b.all) {
      await pool.query(
        `UPDATE notifications SET is_read=TRUE WHERE user_id=$1`,
        [user.id],
      );
    } else {
      await pool.query(
        `UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2`,
        [Number(b.id), user.id],
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal memperbarui notifikasi." },
      { status: 500 },
    );
  }
}

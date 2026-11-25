import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
export const runtime = "nodejs";
export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { ok: false, message: "Silakan login." },
      { status: 401 },
    );
  if (!["doctor", "patient"].includes(user.role))
    return NextResponse.json(
      {
        ok: false,
        message: "Admin mengelola profil melalui manajemen pengguna.",
      },
      { status: 403 },
    );
  try {
    const b = await request.json();
    const name = String(b.full_name || "").trim(),
      phone = String(b.phone || "").trim();
    if (name.length < 3)
      return NextResponse.json(
        { ok: false, message: "Nama minimal 3 karakter." },
        { status: 400 },
      );
    const r = await pool.query(
      `UPDATE users SET full_name=$1,phone=$2,updated_at=NOW() WHERE id=$3 RETURNING id,full_name,username,email,role,poli_id,phone`,
      [name, phone, user.id],
    );
    return NextResponse.json({ ok: true, data: r.rows[0] });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal memperbarui profil." },
      { status: 500 },
    );
  }
}

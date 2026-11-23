import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function PATCH(request, context) {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  try {
    const { id } = await context.params;
    const b = await request.json();
    const name = String(b.name || "").trim();
    const description = String(b.description || "").trim();
    if (name.length < 3)
      return NextResponse.json(
        { ok: false, message: "Nama poli minimal 3 karakter." },
        { status: 400 },
      );
    const r = await pool.query(
      `UPDATE poli SET name=$1,description=$2,image_url=$3 WHERE id=$4 AND is_active=TRUE RETURNING *`,
      [name, description, b.image_url || null, id],
    );
    if (!r.rowCount)
      return NextResponse.json(
        { ok: false, message: "Poli tidak ditemukan." },
        { status: 404 },
      );
    return NextResponse.json({ ok: true, data: r.rows[0] });
  } catch (e) {
    if (e.code === "23505")
      return NextResponse.json(
        { ok: false, message: "Nama poli sudah digunakan." },
        { status: 409 },
      );
    return NextResponse.json(
      { ok: false, message: "Gagal memperbarui poli." },
      { status: 500 },
    );
  }
}
export async function DELETE(request, context) {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  try {
    const { id } = await context.params;
    const r = await pool.query(
      `UPDATE poli SET is_active=FALSE WHERE id=$1 RETURNING id`,
      [id],
    );
    if (!r.rowCount)
      return NextResponse.json(
        { ok: false, message: "Poli tidak ditemukan." },
        { status: 404 },
      );
    return NextResponse.json({ ok: true, message: "Poli dinonaktifkan." });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal menghapus poli." },
      { status: 500 },
    );
  }
}

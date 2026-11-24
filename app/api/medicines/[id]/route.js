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
    const name = String(b.name || "").trim(),
      type = String(b.medicine_type || "ordinary"),
      stock = Number(b.stock);
    if (
      !name ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !["ordinary", "prescription"].includes(type)
    )
      return NextResponse.json(
        { ok: false, message: "Data obat tidak valid." },
        { status: 400 },
      );
    const r = await pool.query(
      `UPDATE medicines SET name=$1,description=$2,medicine_type=$3,stock=$4,expires_at=$5,image_url=$6,updated_at=NOW() WHERE id=$7 RETURNING *`,
      [
        name,
        b.description || "",
        type,
        stock,
        b.expires_at || null,
        b.image_url || null,
        id,
      ],
    );
    if (!r.rowCount)
      return NextResponse.json(
        { ok: false, message: "Obat tidak ditemukan." },
        { status: 404 },
      );
    return NextResponse.json({ ok: true, data: r.rows[0] });
  } catch (e) {
    if (e.code === "23505")
      return NextResponse.json(
        { ok: false, message: "Nama obat sudah digunakan." },
        { status: 409 },
      );
    return NextResponse.json(
      { ok: false, message: "Gagal mengubah obat." },
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
      `UPDATE medicines SET is_active=FALSE WHERE id=$1 RETURNING id`,
      [id],
    );
    if (!r.rowCount)
      return NextResponse.json(
        { ok: false, message: "Obat tidak ditemukan." },
        { status: 404 },
      );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal menghapus obat." },
      { status: 500 },
    );
  }
}

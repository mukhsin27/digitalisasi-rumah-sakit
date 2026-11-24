import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function GET(request) {
  const a = await requireRole(["admin", "doctor"]);
  if (a.response) return a.response;
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    let where = "is_active=TRUE";
    if (filter === "available") where += " AND stock>0";
    if (filter === "empty") where += " AND stock=0";
    if (filter === "expired") where += " AND expires_at<CURRENT_DATE";
    const r = await pool.query(
      `SELECT * FROM medicines WHERE ${where} ORDER BY name`,
    );
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil obat." },
      { status: 500 },
    );
  }
}
export async function POST(request) {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  try {
    const b = await request.json();
    const name = String(b.name || "").trim(),
      type = String(b.medicine_type || "ordinary"),
      stock = Number(b.stock),
      description = String(b.description || "").trim();
    if (
      !name ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !["ordinary", "prescription"].includes(type)
    )
      return NextResponse.json(
        { ok: false, message: "Nama, tipe obat, dan stok harus valid." },
        { status: 400 },
      );
    const r = await pool.query(
      `INSERT INTO medicines(name,description,medicine_type,stock,expires_at,image_url) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        name,
        description,
        type,
        stock,
        b.expires_at || null,
        b.image_url || null,
      ],
    );
    return NextResponse.json({ ok: true, data: r.rows[0] }, { status: 201 });
  } catch (e) {
    if (e.code === "23505")
      return NextResponse.json(
        { ok: false, message: "Nama obat sudah ada." },
        { status: 409 },
      );
    return NextResponse.json(
      { ok: false, message: "Gagal menambahkan obat." },
      { status: 500 },
    );
  }
}

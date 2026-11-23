import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT p.id,p.name,p.description,COUNT(u.id)::int AS doctor_count FROM poli p LEFT JOIN users u ON u.poli_id=p.id AND u.role='doctor' AND u.is_active=TRUE WHERE p.is_active=TRUE GROUP BY p.id ORDER BY p.name`,
    );
    return NextResponse.json({ ok: true, data: result.rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil data poli." },
      { status: 500 },
    );
  }
}
export async function POST(request) {
  const auth = await requireRole(["admin"]);
  if (auth.response) return auth.response;
  try {
    const b = await request.json();
    const name = String(b.name || "").trim();
    const description = String(b.description || "").trim();
    if (name.length < 3)
      return NextResponse.json(
        { ok: false, message: "Nama poli minimal 3 karakter." },
        { status: 400 },
      );
    const r = await pool.query(
      `INSERT INTO poli(name,description,image_url) VALUES($1,$2,$3) RETURNING *`,
      [name, description, b.image_url || null],
    );
    return NextResponse.json({ ok: true, data: r.rows[0] }, { status: 201 });
  } catch (e) {
    if (e.code === "23505")
      return NextResponse.json(
        { ok: false, message: "Nama poli sudah digunakan." },
        { status: 409 },
      );
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Gagal menambah poli." },
      { status: 500 },
    );
  }
}

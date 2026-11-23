import { NextResponse } from "next/server";
import pool from "@/lib/db";
export const runtime = "nodejs";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const poliId = searchParams.get("poli_id");
    const params = [];
    let where = "u.role='doctor' AND u.is_active=TRUE";
    if (poliId) {
      params.push(poliId);
      where += " AND u.poli_id=$1";
    }
    const r = await pool.query(
      `SELECT u.id,u.full_name,u.username,u.email,u.phone,u.poli_id,u.bio,u.image_url,u.experience,p.name AS poli_name FROM users u LEFT JOIN poli p ON p.id=u.poli_id WHERE ${where} ORDER BY u.full_name`,
      params,
    );
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil daftar dokter." },
      { status: 500 },
    );
  }
}

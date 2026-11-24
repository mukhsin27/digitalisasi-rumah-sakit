import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function GET(request) {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const params = [];
    let where = "1=1";
    if (role && ["admin", "doctor", "patient"].includes(role)) {
      params.push(role);
      where += ` AND u.role=$${params.length}`;
    }
    const r = await pool.query(
      `SELECT u.id,u.full_name,u.username,u.email,u.phone,u.role,u.poli_id,u.str_number,u.doctor_verification_status,u.is_active,u.created_at,p.name AS poli_name FROM users u LEFT JOIN poli p ON p.id=u.poli_id WHERE ${where} ORDER BY u.created_at DESC`,
      params,
    );
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil data pengguna." },
      { status: 500 },
    );
  }
}
export async function POST(request) {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  try {
    const b = await request.json();
    const full = String(b.full_name || "").trim(),
      username = String(b.username || "").trim(),
      email = String(b.email || "")
        .trim()
        .toLowerCase(),
      password = String(b.password || ""),
      role = String(b.role || ""),
      poliId = b.poli_id ? Number(b.poli_id) : null;
    if (
      !full ||
      !username ||
      !email ||
      password.length < 8 ||
      !["admin", "doctor", "patient"].includes(role)
    )
      return NextResponse.json(
        {
          ok: false,
          message:
            "Lengkapi data. Password minimal 8 karakter dan role harus valid.",
        },
        { status: 400 },
      );
    if (role === "doctor" && !poliId)
      return NextResponse.json(
        { ok: false, message: "Dokter wajib memiliki poli." },
        { status: 400 },
      );
    const hash = await bcrypt.hash(password, 12);
    const r = await pool.query(
      `INSERT INTO users(full_name,username,email,password_hash,role,poli_id,phone,bio,experience) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,full_name,username,email,role,poli_id`,
      [
        full,
        username,
        email,
        hash,
        role,
        poliId,
        b.phone || null,
        b.bio || null,
        b.experience || null,
      ],
    );
    return NextResponse.json({ ok: true, data: r.rows[0] }, { status: 201 });
  } catch (e) {
    if (e.code === "23505")
      return NextResponse.json(
        { ok: false, message: "Email atau username sudah digunakan." },
        { status: 409 },
      );
    return NextResponse.json(
      { ok: false, message: "Gagal membuat pengguna." },
      { status: 500 },
    );
  }
}

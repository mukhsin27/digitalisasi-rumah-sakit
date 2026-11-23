import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { createSession } from "@/lib/session";
import { safeUser } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ ok: false, message: "Email dan password wajib diisi." }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT id, full_name, username, email, password_hash, role, poli_id, is_active
       FROM users WHERE email = $1 LIMIT 1`,
      [email]
    );
    const user = result.rows[0];

    // Pesan dibuat umum agar tidak membocorkan apakah email terdaftar.
    if (!user || !user.is_active || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ ok: false, message: "Email atau password salah." }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, message: "Login berhasil.", user: safeUser(user) });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return NextResponse.json({ ok: false, message: "Terjadi kesalahan saat login." }, { status: 500 });
  }
}

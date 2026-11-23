import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { createSession } from "@/lib/session";
import { safeUser } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await request.json();
    const fullName = String(body.full_name ?? "").trim();
    const username = String(body.username ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const accountType = String(body.account_type ?? "patient");
    const phone = String(body.phone ?? "").trim() || null;

    if (!fullName || !username || !email || !password) {
      return NextResponse.json({ ok: false, message: "Semua field wajib diisi." }, { status: 400 });
    }
    if (!["patient", "doctor"].includes(accountType)) {
      return NextResponse.json({ ok: false, message: "Jenis akun tidak valid." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ ok: false, message: "Format email tidak valid." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, message: "Password minimal 8 karakter." }, { status: 400 });
    }

    const isDoctor = accountType === "doctor";
    const poliId = isDoctor ? Number(body.poli_id) : null;
    const strNumber = isDoctor ? String(body.str_number ?? "").trim() : null;

    if (isDoctor && (!Number.isInteger(poliId) || poliId <= 0 || !strNumber || strNumber.length > 50)) {
      return NextResponse.json(
        { ok: false, message: "Pilih poli dan masukkan nomor STR yang valid." },
        { status: 400 },
      );
    }

    if (isDoctor) {
      const poli = await pool.query(
        "SELECT id FROM poli WHERE id=$1 AND is_active=TRUE",
        [poliId],
      );
      if (!poli.rowCount) {
        return NextResponse.json(
          { ok: false, message: "Poli tidak ditemukan atau sudah tidak aktif." },
          { status: 400 },
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (
         full_name, username, email, password_hash, role, phone, poli_id,
         str_number, doctor_verification_status, is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, full_name, username, email, role, poli_id, phone`,
      [
        fullName,
        username,
        email,
        passwordHash,
        isDoctor ? "doctor" : "patient",
        phone,
        poliId,
        strNumber,
        isDoctor ? "pending" : "approved",
        !isDoctor,
      ]
    );

    const user = result.rows[0];
    if (isDoctor) {
      return NextResponse.json(
        {
          ok: true,
          pending: true,
          message: "Pendaftaran dokter diterima dan menunggu verifikasi Admin.",
        },
        { status: 202 },
      );
    }

    await createSession(user.id);
    return NextResponse.json({ ok: true, message: "Registrasi berhasil.", user: safeUser(user) }, { status: 201 });
  } catch (error) {
    if (error?.code === "23505") {
      return NextResponse.json({ ok: false, message: "Email, username, atau nomor STR sudah digunakan." }, { status: 409 });
    }
    console.error("REGISTER_ERROR", error);
    return NextResponse.json({ ok: false, message: "Terjadi kesalahan saat registrasi." }, { status: 500 });
  }
}

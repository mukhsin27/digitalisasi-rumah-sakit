import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function PATCH(request, context) {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  try {
    const { id } = await context.params;
    const b = await request.json();
    const full = String(b.full_name || "").trim(),
      username = String(b.username || "").trim(),
      email = String(b.email || "")
        .trim()
        .toLowerCase(),
      role = String(b.role || ""),
      poliId = b.poli_id ? Number(b.poli_id) : null,
      verificationStatus = b.doctor_verification_status;
    if (
      !full ||
      !username ||
      !email ||
      !["admin", "doctor", "patient"].includes(role) ||
      (role === "doctor" && !poliId) ||
      (verificationStatus !== undefined &&
        (role !== "doctor" ||
          !["approved", "rejected"].includes(verificationStatus)))
    )
      return NextResponse.json(
        { ok: false, message: "Data pengguna tidak valid." },
        { status: 400 },
      );
    const isActive =
      verificationStatus === "approved"
        ? true
        : verificationStatus === "rejected"
          ? false
          : null;
    let r;
    if (b.password) {
      if (String(b.password).length < 8)
        return NextResponse.json(
          { ok: false, message: "Password minimal 8 karakter." },
          { status: 400 },
        );
      const hash = await bcrypt.hash(String(b.password), 12);
      r = await pool.query(
        `UPDATE users SET full_name=$1,username=$2,email=$3,role=$4,poli_id=$5,password_hash=$6,doctor_verification_status=COALESCE($7,doctor_verification_status),is_active=COALESCE($8,is_active),updated_at=NOW() WHERE id=$9 RETURNING id,full_name,username,email,role,poli_id,str_number,doctor_verification_status,is_active`,
        [full, username, email, role, poliId, hash, verificationStatus || null, isActive, id],
      );
    } else {
      r = await pool.query(
        `UPDATE users SET full_name=$1,username=$2,email=$3,role=$4,poli_id=$5,doctor_verification_status=COALESCE($6,doctor_verification_status),is_active=COALESCE($7,is_active),updated_at=NOW() WHERE id=$8 RETURNING id,full_name,username,email,role,poli_id,str_number,doctor_verification_status,is_active`,
        [full, username, email, role, poliId, verificationStatus || null, isActive, id],
      );
    }
    if (!r.rowCount)
      return NextResponse.json(
        { ok: false, message: "Pengguna tidak ditemukan." },
        { status: 404 },
      );
    return NextResponse.json({ ok: true, data: r.rows[0] });
  } catch (e) {
    if (e.code === "23505")
      return NextResponse.json(
        { ok: false, message: "Email sudah digunakan." },
        { status: 409 },
      );
    return NextResponse.json(
      { ok: false, message: "Gagal memperbarui pengguna." },
      { status: 500 },
    );
  }
}
export async function DELETE(request, context) {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  try {
    const { id } = await context.params;
    if (String(id) === String(a.user.id))
      return NextResponse.json(
        { ok: false, message: "Admin tidak dapat menghapus akunnya sendiri." },
        { status: 400 },
      );
    const r = await pool.query(
      `UPDATE users SET is_active=FALSE,updated_at=NOW() WHERE id=$1 RETURNING id`,
      [id],
    );
    if (!r.rowCount)
      return NextResponse.json(
        { ok: false, message: "Pengguna tidak ditemukan." },
        { status: 404 },
      );
    return NextResponse.json({ ok: true, message: "Pengguna dinonaktifkan." });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: "Gagal menonaktifkan pengguna." },
      { status: 500 },
    );
  }
}

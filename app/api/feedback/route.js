import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function GET() {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;

  try {
    const r = await pool.query(
      `SELECT f.id,f.rating,f.comment,f.created_at,u.full_name,f.public_consent,f.public_status FROM feedback f JOIN users u ON u.id=f.patient_id ORDER BY f.created_at DESC LIMIT 100`,
    );
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e) {
    console.error("FEEDBACK_LIST_ERROR", e);
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil ulasan." },
      { status: 500 },
    );
  }
}
export async function POST(request) {
  const a = await requireRole(["patient"]);
  if (a.response) return a.response;
  try {
    const b = await request.json();
    const rating = Number(b.rating),
      comment = String(b.comment || "").trim();
    const publicConsent = b.public_consent === true;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return NextResponse.json(
        { ok: false, message: "Rating harus 1 sampai 5." },
        { status: 400 },
      );
    const done = await pool.query(
      `SELECT id FROM appointments WHERE patient_id=$1 AND status='completed' LIMIT 1`,
      [a.user.id],
    );
    if (!done.rowCount)
      return NextResponse.json(
        {
          ok: false,
          message: "Ulasan hanya dapat diberikan setelah konsultasi selesai.",
        },
        { status: 403 },
      );
    const r = await pool.query(
      `INSERT INTO feedback(patient_id,rating,comment,public_consent,public_status) VALUES($1,$2,$3,$4,$5) RETURNING id,rating,comment,created_at,public_consent,public_status`,
      [
        a.user.id,
        rating,
        comment,
        publicConsent,
        publicConsent ? "pending" : "private",
      ],
    );
    return NextResponse.json(
      {
        ok: true,
        message: publicConsent
          ? "Umpan balik terkirim dan menunggu peninjauan sebelum ditampilkan."
          : "Terima kasih atas umpan balik Anda.",
        data: r.rows[0],
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("FEEDBACK_CREATE_ERROR", e);
    return NextResponse.json(
      { ok: false, message: "Gagal menyimpan ulasan." },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  try {
    const b = await request.json();
    const id = Number(b.id);
    const status = String(b.status || "");
    if (!Number.isInteger(id) || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { ok: false, message: "ID atau status peninjauan tidak valid." },
        { status: 400 },
      );
    }

    const r = await pool.query(
      `UPDATE feedback SET public_status=$1 WHERE id=$2 AND public_consent=TRUE AND public_status='pending' RETURNING id,public_status`,
      [status, id],
    );
    if (!r.rowCount) {
      return NextResponse.json(
        { ok: false, message: "Ulasan tidak ditemukan atau tidak menunggu peninjauan." },
        { status: 404 },
      );
    }
    return NextResponse.json({
      ok: true,
      message: status === "approved" ? "Ulasan disetujui untuk ditampilkan." : "Ulasan ditolak.",
      data: r.rows[0],
    });
  } catch (e) {
    console.error("FEEDBACK_REVIEW_ERROR", e);
    return NextResponse.json(
      { ok: false, message: "Gagal memperbarui status ulasan." },
      { status: 500 },
    );
  }
}

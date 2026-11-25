import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const r = await pool.query(
      `SELECT rating,comment,created_at
       FROM feedback
       WHERE public_consent=TRUE
         AND public_status='approved'
         AND comment IS NOT NULL
         AND BTRIM(comment) <> ''
       ORDER BY created_at DESC
       LIMIT 6`,
    );
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e) {
    console.error("PUBLIC_TESTIMONIALS_ERROR", e);
    return NextResponse.json(
      { ok: false, message: "Gagal memuat cerita pasien." },
      { status: 500 },
    );
  }
}

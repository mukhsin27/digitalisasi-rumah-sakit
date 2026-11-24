import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function PATCH(request, context) {
  const auth = await requireRole(["admin", "doctor", "patient"]);
  if (auth.response) return auth.response;
  try {
    const { id } = await context.params;
    const appointmentId = Number(id);
    const body = await request.json();
    const status = String(body.status ?? "").toLowerCase();
    const reason = String(body.reason ?? "").trim();
    if (!Number.isInteger(appointmentId)) return NextResponse.json({ ok:false,message:"ID janji temu tidak valid." },{status:400});

    if (auth.user.role === "patient") {
      if (status !== "cancelled") return NextResponse.json({ok:false,message:"Pasien hanya dapat membatalkan janji temu."},{status:403});
      const r = await pool.query(`UPDATE appointments SET status='cancelled',updated_at=NOW() WHERE id=$1 AND patient_id=$2 AND status='pending' RETURNING id,status`,[appointmentId,auth.user.id]);
      if (!r.rowCount) return NextResponse.json({ok:false,message:"Janji temu tidak ditemukan atau tidak lagi berstatus Pending."},{status:404});
      return NextResponse.json({ok:true,message:"Janji temu dibatalkan.",data:r.rows[0]});
    }

    if (!["approved","rejected"].includes(status)) return NextResponse.json({ok:false,message:"Status validasi tidak valid."},{status:400});
    if (status === "rejected" && !reason) return NextResponse.json({ok:false,message:"Alasan penolakan wajib diisi."},{status:400});
    let result;
    if (auth.user.role === "admin") {
      result = await pool.query(`UPDATE appointments SET status=$1,rejection_reason=$2,updated_at=NOW() WHERE id=$3 AND status='pending' RETURNING id,patient_id,doctor_id,status,rejection_reason`,[status,status === "rejected" ? reason : null,appointmentId]);
    } else {
      result = await pool.query(`UPDATE appointments SET status=$1,rejection_reason=$2,updated_at=NOW() WHERE id=$3 AND doctor_id=$4 AND status='pending' RETURNING id,patient_id,doctor_id,status,rejection_reason`,[status,status === "rejected" ? reason : null,appointmentId,auth.user.id]);
    }
    if (!result.rowCount) return NextResponse.json({ok:false,message:"Janji temu tidak ditemukan, bukan wewenangmu, atau status bukan Pending."},{status:404});
    const ap = result.rows[0];
    await pool.query(`INSERT INTO notifications(user_id,title,message) VALUES($1,$2,$3)`,[ap.patient_id,status === "approved" ? "Janji temu disetujui" : "Janji temu ditolak",status === "approved" ? "Janji temu Anda telah disetujui." : `Janji temu Anda ditolak. Alasan: ${reason}`]);
    return NextResponse.json({ok:true,message:"Status janji temu berhasil diperbarui.",data:ap});
  } catch (error) { console.error(error); return NextResponse.json({ok:false,message:"Gagal memperbarui janji temu."},{status:500}); }
}

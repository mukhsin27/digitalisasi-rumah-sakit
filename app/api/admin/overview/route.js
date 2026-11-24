import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function GET() {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  try {
    const [users, appointments, pharmacy, doctors, departments] =
      await Promise.all([
        pool.query(
          `SELECT role,COUNT(*)::int AS total FROM users WHERE is_active=TRUE GROUP BY role`,
        ),
        pool.query(
          `SELECT status,COUNT(*)::int AS total FROM appointments GROUP BY status`,
        ),
        pool.query(
          `SELECT status,COUNT(*)::int AS total FROM prescriptions GROUP BY status`,
        ),
        pool.query(
          `SELECT u.id,u.full_name,p.name AS poli_name,COUNT(a.id) FILTER(WHERE a.status='approved' AND a.booking_date=CURRENT_DATE)::int AS today_appointments FROM users u LEFT JOIN poli p ON p.id=u.poli_id LEFT JOIN appointments a ON a.doctor_id=u.id WHERE u.role='doctor' AND u.is_active=TRUE GROUP BY u.id,p.name ORDER BY u.full_name LIMIT 8`,
        ),
        pool.query(
          `SELECT p.name,COUNT(a.id)::int AS appointment_count FROM poli p LEFT JOIN users u ON u.poli_id=p.id LEFT JOIN appointments a ON a.doctor_id=u.id GROUP BY p.id ORDER BY appointment_count DESC`,
        ),
      ]);
    return NextResponse.json({
      ok: true,
      data: {
        users: users.rows,
        appointments: appointments.rows,
        pharmacy: pharmacy.rows,
        on_duty: doctors.rows,
        by_poli: departments.rows,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil statistik." },
      { status: 500 },
    );
  }
}

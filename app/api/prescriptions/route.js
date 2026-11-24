import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireRole } from "@/lib/authorization";
export const runtime = "nodejs";
export async function GET() {
  const a = await requireRole(["admin", "patient"]);
  if (a.response) return a.response;
  try {
    let where = "";
    let params = [];
    if (a.user.role === "patient") {
      where = "WHERE mr.patient_id=$1";
      params = [a.user.id];
    }
    const r = await pool.query(
      `SELECT pr.id,pr.status,pr.created_at,mr.patient_id,p.full_name AS patient_name,d.full_name AS doctor_name, json_agg(json_build_object('medicine_id',m.id,'medicine_name',m.name,'quantity',pi.quantity)) AS items FROM prescriptions pr JOIN medical_records mr ON mr.id=pr.medical_record_id JOIN users p ON p.id=mr.patient_id JOIN users d ON d.id=mr.doctor_id JOIN prescription_items pi ON pi.prescription_id=pr.id JOIN medicines m ON m.id=pi.medicine_id ${where} GROUP BY pr.id,mr.patient_id,p.full_name,d.full_name ORDER BY pr.created_at DESC`,
      params,
    );
    return NextResponse.json({ ok: true, data: r.rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Gagal mengambil resep." },
      { status: 500 },
    );
  }
}
export async function PATCH(request) {
  const a = await requireRole(["admin"]);
  if (a.response) return a.response;
  const client = await pool.connect();
  try {
    const b = await request.json();
    const id = Number(b.id),
      next = String(b.status || "");
    if (!Number.isInteger(id) || !["ready", "collected"].includes(next))
      return NextResponse.json(
        { ok: false, message: "ID atau status tidak valid." },
        { status: 400 },
      );
    await client.query("BEGIN");
    const pr = (
      await client.query(
        `SELECT pr.id,pr.status,mr.patient_id FROM prescriptions pr JOIN medical_records mr ON mr.id=pr.medical_record_id WHERE pr.id=$1 FOR UPDATE`,
        [id],
      )
    ).rows[0];
    if (!pr) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { ok: false, message: "Resep tidak ditemukan." },
        { status: 404 },
      );
    }
    if (next === "ready") {
      if (pr.status !== "waiting") {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            ok: false,
            message: "Hanya resep Menunggu Diproses yang dapat disiapkan.",
          },
          { status: 409 },
        );
      }
      const items = (
        await client.query(
          `SELECT pi.medicine_id,pi.quantity,m.name,m.stock FROM prescription_items pi JOIN medicines m ON m.id=pi.medicine_id WHERE pi.prescription_id=$1 FOR UPDATE OF m`,
          [id],
        )
      ).rows;
      const insufficient = items.find(
        (x) => Number(x.stock) < Number(x.quantity),
      );
      if (insufficient) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { ok: false, message: `Stok ${insufficient.name} tidak mencukupi.` },
          { status: 409 },
        );
      }
      for (const item of items) {
        await client.query(
          `UPDATE medicines SET stock=stock-$1,updated_at=NOW() WHERE id=$2`,
          [item.quantity, item.medicine_id],
        );
      }
      await client.query(
        `UPDATE prescriptions SET status='ready',updated_at=NOW() WHERE id=$1`,
        [id],
      );
      await client.query(
        `INSERT INTO notifications(user_id,title,message) VALUES($1,'Resep siap diambil','Resep obat Anda telah disiapkan dan dapat diambil di loket farmasi.')`,
        [pr.patient_id],
      );
    } else {
      if (pr.status !== "ready") {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            ok: false,
            message: "Hanya resep Siap Diambil yang dapat dikonfirmasi.",
          },
          { status: 409 },
        );
      }
      await client.query(
        `UPDATE prescriptions SET status='collected',updated_at=NOW() WHERE id=$1`,
        [id],
      );
      await client.query(
        `INSERT INTO notifications(user_id,title,message) VALUES($1,'Resep sudah diambil','Pengambilan obat Anda telah dikonfirmasi.')`,
        [pr.patient_id],
      );
    }
    await client.query("COMMIT");
    return NextResponse.json({
      ok: true,
      message: "Status resep berhasil diperbarui.",
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    return NextResponse.json(
      { ok: false, message: "Gagal memperbarui status resep." },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

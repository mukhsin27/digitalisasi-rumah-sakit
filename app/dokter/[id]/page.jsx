"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Clock3
} from "lucide-react";

const days = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu"
];

export default function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/doctors").then((response) => response.json()),
      fetch(`/api/schedules?doctor_id=${id}`).then((response) =>
        response.json()
      )
    ])
      .then(([doctorsData, schedulesData]) => {
        setDoctor(
          (doctorsData.data || []).find(
            (item) => String(item.id) === String(id)
          ) || null
        );
        setSchedules(schedulesData.data || []);
      })
      .finally(() => setBusy(false));
  }, [id]);

  return (
    <>
      <header className="nav">
        <div className="container">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <Activity />
            </span>
            medcare.
          </Link>
          <Link href="/dokter" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} /> Daftar dokter
          </Link>
        </div>
      </header>

      <main
        className="section section-soft"
        style={{ minHeight: "80vh" }}
      >
        <div className="container">
          {busy ? (
            <div className="empty">Memuat profil dokter...</div>
          ) : !doctor ? (
            <div className="empty">Dokter tidak ditemukan.</div>
          ) : (
            <div className="grid-two" style={{ alignItems: "start" }}>
              <div className="panel">
                <div
                  style={{
                    height: 310,
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "#edf6fb"
                  }}
                >
                  <img
                    src={
                      doctor.image_url ||
                      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800"
                    }
                    alt={doctor.full_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </div>
                <h1
                  className="section-title"
                  style={{ fontSize: 28, marginTop: 20 }}
                >
                  {doctor.full_name}
                </h1>
                <span className="pill">{doctor.poli_name || "Dokter"}</span>
                <p className="section-desc" style={{ marginTop: 14 }}>
                  {doctor.bio || "Dokter profesional MedCare Hospital."}
                </p>
                <p className="dash-sub">
                  {doctor.experience || "Tenaga medis profesional"}
                </p>
              </div>

              <div className="panel">
                <div className="section-kicker">Jadwal praktik</div>
                <h2
                  className="section-title"
                  style={{ fontSize: 25 }}
                >
                  Pilih waktu konsultasi.
                </h2>
                <p className="section-desc">
                  Durasi konsultasi 30 menit. Pengajuan janji temu harus
                  dilakukan melalui akun Pasien.
                </p>

                {schedules.length ? (
                  schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "15px 0",
                        borderBottom: "1px solid #edf2f5"
                      }}
                    >
                      <div>
                        <b>{days[schedule.day_of_week]}</b>
                        <div className="dash-sub">
                          <Clock3
                            size={12}
                            style={{
                              display: "inline",
                              verticalAlign: "middle"
                            }}
                          />{" "}
                          {String(schedule.start_time).slice(0, 5)} · 30 menit
                        </div>
                      </div>
                      <span className="pill green">Tersedia</span>
                    </div>
                  ))
                ) : (
                  <div className="empty">Jadwal belum tersedia.</div>
                )}

                <Link
                  href="/register"
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: 20 }}
                >
                  Buat janji temu <CalendarDays size={15} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

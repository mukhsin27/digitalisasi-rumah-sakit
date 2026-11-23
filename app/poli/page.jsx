"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Search,
  Stethoscope
} from "lucide-react";

export default function PoliPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    fetch("/api/poli")
      .then((response) => response.json())
      .then((data) => setItems(data.data || []))
      .finally(() => setBusy(false));
  }, []);

  const filtered = items.filter((item) =>
    `${item.name} ${item.description}`.toLowerCase().includes(q.toLowerCase())
  );

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
          <Link href="/" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} /> Beranda
          </Link>
        </div>
      </header>

      <main
        className="section section-soft"
        style={{ minHeight: "80vh" }}
      >
        <div className="container">
          <div className="section-kicker">Informasi layanan</div>
          <h1 className="section-title">Daftar poliklinik MedCare.</h1>
          <p className="section-desc">
            Pilih layanan sesuai kebutuhan kesehatan Anda. Informasi poliklinik
            dapat dilihat tanpa login.
          </p>

          <div
            className="field"
            style={{ maxWidth: 430, margin: "25px 0" }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 13,
                  top: 13,
                  color: "#8da0af"
                }}
              />
              <input
                style={{ paddingLeft: 40 }}
                placeholder="Cari nama poliklinik..."
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
            </div>
          </div>

          {busy ? (
            <div className="empty">Memuat data poli...</div>
          ) : (
            <div className="service-grid">
              {filtered.map((item) => (
                <article className="service-card" key={item.id}>
                  <div className="service-icon">
                    <Stethoscope />
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="pill">{item.doctor_count} dokter</span>
                  <div style={{ marginTop: 14 }}>
                    <Link
                      className="text-link"
                      href={`/dokter?poli_id=${item.id}`}
                    >
                      Lihat dokter{" "}
                      <ArrowRight
                        size={13}
                        style={{
                          display: "inline",
                          verticalAlign: "middle"
                        }}
                      />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <div
            className="footer-bottom"
            style={{ border: 0, margin: 0, padding: 0 }}
          >
            © 2026 MedCare Hospital · Data demo
          </div>
        </div>
      </footer>
    </>
  );
}

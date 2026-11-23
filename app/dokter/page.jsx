"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  CalendarDays
} from "lucide-react";
import Brand from "@/components/Brand";

export default function DoctorsPage() {
  const [poliId, setPoliId] = useState("");
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setPoliId(
      new URLSearchParams(window.location.search).get("poli_id") || ""
    );
  }, []);

  useEffect(() => {
    const url = poliId
      ? `/api/doctors?poli_id=${poliId}`
      : "/api/doctors";

    fetch(url)
      .then((response) => response.json())
      .then((data) => setItems(data.data || []))
      .finally(() => setBusy(false));
  }, [poliId]);

  const filtered = items.filter((item) =>
    `${item.full_name} ${item.poli_name} ${item.bio}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  return (
    <div className="home-page doctors-directory-page">
      <header className="home-nav">
        <div className="home-wrap home-nav-inner">
          <Brand />
          <Link href="/" className="home-btn home-btn-outline">
            <ArrowLeft size={16} aria-hidden="true" /> Beranda
          </Link>
        </div>
      </header>

      <main className="doctors-directory-main">
        <div className="home-wrap">
          <section className="doctors-directory-panel">
            <header className="doctors-directory-head">
              <div>
                <p className="home-doctors-kicker">Tenaga medis profesional</p>
                <h1 className="home-doctors-title">
                  Temukan dokter yang tepat.
                </h1>
                <p className="home-doctors-description">
                  Telusuri profil dokter, spesialisasi, dan jadwal praktik
                  sebelum membuat janji temu.
                </p>
              </div>
              <span className="doctors-directory-count">
                {busy ? "Memuat dokter..." : `${filtered.length} dokter`}
              </span>
            </header>

            <div className="doctors-directory-search">
              <Search
                size={19}
                aria-hidden="true"
              />
              <input
                type="search"
                aria-label="Cari dokter"
                placeholder="Cari nama dokter atau spesialisasi..."
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
            </div>

            {busy ? (
              <div className="doctors-directory-empty" role="status">
                Memuat daftar dokter...
              </div>
            ) : filtered.length ? (
              <div className="doctor-grid home-doctors-grid">
                {filtered.map((doctor, index) => (
                  <article className="home-doctor-card" key={doctor.id}>
                    <div className="home-doctor-photo">
                      <img
                        src={
                          doctor.image_url ||
                          [
                            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=700",
                            "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700",
                            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=700",
                          ][index % 3]
                        }
                        alt={doctor.full_name}
                      />
                    </div>
                    <div className="home-doctor-body">
                      <h2 className="home-doctor-name">{doctor.full_name}</h2>
                      <p className="home-doctor-info">
                        <span>{doctor.poli_name || "Dokter Umum"}</span>
                        <span>{doctor.experience || "Tenaga medis profesional"}</span>
                      </p>
                      <p className="home-doctor-bio">
                        {doctor.bio ||
                          "Melayani konsultasi kesehatan sesuai bidang praktik."}
                      </p>
                      <div className="home-doctor-divider" />
                      <div className="home-doctor-footer">
                        <span className="home-doctor-badge">
                          <CalendarDays size={14} aria-hidden="true" />
                          Profil tersedia
                        </span>
                        <Link
                          className="home-doctor-profile-button"
                          href={`/dokter/${doctor.id}`}
                        >
                          Profil &amp; jadwal
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="doctors-directory-empty" role="status">
                Dokter tidak ditemukan.
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="home-wrap">
          <div className="footer-bottom">
            © 2026 MedCare Hospital · Data demo
          </div>
        </div>
      </footer>
    </div>
  );
}

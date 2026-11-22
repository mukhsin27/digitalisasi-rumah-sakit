"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {Activity, ArrowRight, Baby, CalendarDays,CheckCircle2,Clock3,HeartPulse,Hospital, Menu, Phone, ShieldCheck, Star,Stethoscope,Syringe,Users,X,} from "lucide-react";
import Brand from "@/components/Brand";

const fallbackPoli = [
  {
    id: 1,
    name: "Poli Umum",
    description: "Pemeriksaan kesehatan dasar dan konsultasi keluhan umum.",
    symbol: "＋",
    accent: "Umum",
  },
  {
    id: 2,
    name: "Poli Gigi",
    description: "Perawatan gigi dan mulut bersama dokter profesional.",
    symbol: "✦",
    accent: "Gigi",
  },
  {
    id: 3,
    name: "Poli Anak",
    description: "Pemantauan tumbuh kembang dan kesehatan anak.",
    symbol: "♡",
    accent: "Anak",
  },
  {
    id: 4,
    name: "Poli Jantung",
    description: "Pemeriksaan dan konsultasi kesehatan jantung.",
    symbol: "♥",
    accent: "Jantung",
  },
  {
    id: 5,
    name: "Poli Penyakit Dalam",
    description: "Diagnosis dan penanganan penyakit organ dalam.",
    symbol: "✚",
    accent: "Penyakit Dalam",
  },
  {
    id: 6,
    name: "Poli Kandungan",
    description: "Layanan kesehatan ibu dan kesehatan reproduksi.",
    symbol: "⚕",
    accent: "Kandungan",
  },
  {
    id: 7,
    name: "Poli Mata",
    description: "Pemeriksaan penglihatan dan kesehatan mata.",
    symbol: "◉",
    accent: "Mata",
  },
  {
    id: 8,
    name: "Poli Saraf",
    description: "Konsultasi gangguan saraf dan neurologis.",
    symbol: "⌁",
    accent: "Saraf",
  },
];
const fallbackDoctors = [
  {
    id: 1,
    full_name: "dr. Aditya Pratama, Sp.PD",
    poli_name: "Penyakit Dalam",
    bio: "Spesialis Penyakit Dalam",
    experience: "12 tahun pengalaman",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=700&auto=format&fit=crop",
  },
  {
    id: 2,
    full_name: "dr. Nadia Putri, Sp.A",
    poli_name: "Poli Anak",
    bio: "Spesialis Anak",
    experience: "9 tahun pengalaman",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700&auto=format&fit=crop",
  },
  {
    id: 3,
    full_name: "dr. Rizky Mahendra, Sp.JP",
    poli_name: "Poli Jantung",
    bio: "Spesialis Jantung",
    experience: "10 tahun pengalaman",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=700&auto=format&fit=crop",
  },
];

export default function HomePage() {
  const [polies, setPolies] = useState(fallbackPoli);
  const [doctors, setDoctors] = useState(fallbackDoctors);
  const [schedules, setSchedules] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/poli").then((r) => r.json()).then((d) => {
        if (d.ok && d.data?.length) setPolies(d.data);
      }).catch(() => {});
    fetch("/api/doctors").then((r) => r.json()).then((d) => {
        if (d.ok && d.data?.length) setDoctors(d.data.slice(0, 3));
      }).catch(() => {});
    fetch("/api/schedules").then((r) => r.json()).then((d) => {
        if (d.ok) setSchedules(d.data || []);
      }).catch(() => {});
  }, []);

  return (
    <div className="home-page">
      <a className="home-skip-link" href="#home-content">
        Lewati ke konten
      </a>
      <div className="home-topbar">
        <div className="home-wrap home-topbar-inner">
          <span className="home-topbar-item">
            <Phone size={15} aria-hidden="true" />
            1500-CARE <span className="home-topbar-separator">·</span>
            Layanan informasi 24 jam
          </span>
          <span className="home-topbar-item home-topbar-secondary">
            Senin – Minggu, layanan gawat darurat 24 jam
          </span>
        </div>
      </div>
      <header className="home-nav">
        <div className="home-wrap home-nav-inner">
          <Brand />
          <nav
            className={`home-nav-links ${menuOpen ? "is-open" : ""}`}
            id="home-nav-links"
            aria-label="Menu utama"
          >
            <a href="#layanan" onClick={() => setMenuOpen(false)}>Layanan</a>
            <a href="#poli" onClick={() => setMenuOpen(false)}>Poliklinik</a>
            <a href="#dokter" onClick={() => setMenuOpen(false)}>Dokter</a>
            <a href="#tentang" onClick={() => setMenuOpen(false)}>Tentang Kami</a>
            <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
            <Link
              className="home-btn home-btn-primary home-nav-mobile-cta"
              href="/register"
              onClick={() => setMenuOpen(false)}
            >
              Buat Janji Temu <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </nav>
          <div className="home-nav-actions">
            <Link className="home-btn home-btn-outline" href="/login">
              Masuk
            </Link>
            <Link className="home-btn home-btn-primary home-nav-desktop-cta" href="/register">
              Buat Janji Temu <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <button
              className="home-menu-toggle"
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="home-nav-links"
              aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            >
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <main id="home-content">
        <section className="home-hero" aria-labelledby="home-hero-title">
          <span className="home-hero-orb home-hero-orb-one" aria-hidden="true" />
          <span className="home-hero-orb home-hero-orb-two" aria-hidden="true" />
          <span className="home-hero-ring home-hero-ring-one" aria-hidden="true" />
          <span className="home-hero-ring home-hero-ring-two" aria-hidden="true" />
          <div className="home-wrap home-hero-grid">
            <div className="home-hero-copy">
              <div className="home-eyebrow">
                <span className="home-eyebrow-dot" aria-hidden="true" />
                Layanan kesehatan terintegrasi
              </div>
              <h1 className="home-hero-title" id="home-hero-title">
                Sehat Lebih Mudah,
                <span>Dalam Satu Langkah.</span>
              </h1>
              <p className="home-hero-description">
                Temukan dokter yang tepat, pilih jadwal konsultasi, dan pantau
                layanan kesehatan Anda melalui satu platform digital yang aman
                dan mudah digunakan.
              </p>
              <div className="home-hero-actions">
                <Link href="/register" className="home-btn home-btn-white">
                  Buat Janji Temu <ArrowRight className="home-btn-arrow" size={17} />
                </Link>
                <a href="#layanan" className="home-btn home-btn-glass">
                  Jelajahi Layanan
                </a>
              </div>
              <div className="home-proof">
                <div className="home-avatars" aria-hidden="true">
                  <span>DR</span>
                  <span>NS</span>
                  <span>AP</span>
                  <span>+</span>
                </div>
                <p>
                  Didukung tenaga medis profesional dan layanan terpadu
                </p>
              </div>
            </div>
            <div className="home-hero-visual">
              <div className="home-glass">
                <div className="home-photo">
                <img
                  src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&auto=format&fit=crop"
                  alt="Dokter dan tenaga medis di rumah sakit"
                  loading="eager"
                  decoding="async"
                />
                </div>
              </div>
              <article className="home-float-card home-float-card-one">
                <div className="home-float-card-inner">
                  <span className="home-float-icon">
                    <CheckCircle2 size={21} />
                  </span>
                  <div>
                    <span className="home-float-label">Layanan terjadwal</span>
                    <strong className="home-float-title">Booking online</strong>
                  </div>
                </div>
              </article>
              <article className="home-float-card home-float-card-two">
                <div className="home-float-card-inner">
                  <span className="home-float-icon">
                    <CalendarDays size={21} />
                  </span>
                  <div>
                    <span className="home-float-label">Kontrol kesehatan</span>
                    <strong className="home-float-title">Lebih praktis &amp; terpantau</strong>
                  </div>
                </div>
              </article>
              <article className="home-float-card home-float-card-three">
                <div className="home-float-card-inner">
                  <span className="home-float-icon">
                    <Phone size={21} />
                  </span>
                  <div>
                    <span className="home-float-label">Layanan informasi</span>
                    <strong className="home-float-title">1500-CARE</strong>
                    <span className="home-float-sub">Layanan informasi 24 jam</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="home-stats-wrap" aria-label="Statistik MedCare">
          <div className="home-wrap">
            <div className="home-stats">
              <article className="home-stat">
                <span className="home-stat-icon"><Clock3 size={24} aria-hidden="true" /></span>
                <p className="home-stat-number">24/7</p>
                <p className="home-stat-label">Layanan informasi &amp; darurat</p>
              </article>
              <article className="home-stat">
                <span className="home-stat-icon"><Users size={24} aria-hidden="true" /></span>
                <p className="home-stat-number">20+</p>
                <p className="home-stat-label">Dokter dan tenaga profesional</p>
              </article>
              <article className="home-stat">
                <span className="home-stat-icon"><Hospital size={24} aria-hidden="true" /></span>
                <p className="home-stat-number">12</p>
                <p className="home-stat-label">Layanan poliklinik</p>
              </article>
              <article className="home-stat">
                <span className="home-stat-icon"><ShieldCheck size={24} aria-hidden="true" /></span>
                <p className="home-stat-number">100%</p>
                <p className="home-stat-label">Akses layanan lebih praktis</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section" id="layanan">
          <div className="home-wrap">
            <div className="section-head">
              <div>
                <div className="section-kicker">Ekosistem pelayanan</div>
                <h2 className="section-title">
                  Semua kebutuhan kesehatan,
                  <br />
                  dalam satu ekosistem.
                </h2>
                <p className="section-desc">
                  Mulai dari mencari dokter hingga memantau resep obat. Setiap
                  layanan dirancang agar perjalanan kesehatan Anda terasa lebih
                  mudah.
                </p>
              </div>
              <Link href="/register" className="text-link">
                Mulai sekarang{" "}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className="service-grid">
              <article className="service-card">
                <div className="service-icon">
                  <CalendarDays size={28} aria-hidden="true" />
                </div>
                <h3>Janji Temu Online</h3>
                <p>
                  Pilih poli, dokter, tanggal, dan jadwal konsultasi tanpa perlu
                  antre untuk mendaftar.
                </p>
                <Link className="text-link" href="/register">
                  Buat janji temu <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
              <article className="service-card">
                <div className="service-icon">
                  <Stethoscope size={28} aria-hidden="true" />
                </div>
                <h3>Temukan Dokter</h3>
                <p>
                  Kenali dokter dan bidang spesialisasi yang sesuai dengan
                  kebutuhan kesehatan Anda.
                </p>
                <a className="text-link" href="#dokter">
                  Lihat dokter <ArrowRight size={16} aria-hidden="true" />
                </a>
              </article>
              <article className="service-card">
                <div className="service-icon">
                  <HeartPulse size={28} aria-hidden="true" />
                </div>
                <h3>Rekam Medis Digital</h3>
                <p>
                  Akses ringkasan riwayat pemeriksaan dan tindakan medis melalui
                  akun pribadi.
                </p>
                <Link className="text-link" href="/login">
                  Masuk ke akun <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
              <article className="service-card">
                <div className="service-icon">
                  <Syringe size={28} aria-hidden="true" />
                </div>
                <h3>Informasi Farmasi</h3>
                <p>
                  Pantau status penyiapan resep obat hingga obat siap diambil di
                  loket farmasi.
                </p>
                <Link className="text-link" href="/login">
                  Pantau resep <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-soft" id="poli">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-kicker">Pilih layanan</div>
                <h2 className="section-title">Layanan poliklinik kami.</h2>
                <p className="section-desc">
                  Temukan layanan kesehatan sesuai kebutuhan Anda dan lanjutkan
                  dengan memilih dokter serta jadwal praktik.
                </p>
              </div>
              <Link href="/poli" className="text-link">
                Lihat semua poli{" "}
                <ArrowRight
                  size={13}
                  style={{ display: "inline", verticalAlign: "middle" }}
                />
              </Link>
            </div>
            <div className="service-grid">
              {polies.slice(0, 8).map((p, i) => (
                <div className="service-card" key={p.id}>
                  <div className="service-icon">
                    {
                      [
                        <Stethoscope key="1" />,
                        <Star key="2" />,
                        <Baby key="3" />,
                        <HeartPulse key="4" />,
                      ][i % 4]
                    }
                  </div>
                  <h3>{p.name}</h3>
                  <p>
                    {p.description ||
                      "Layanan konsultasi kesehatan dengan tenaga medis profesional."}
                  </p>
                  <a className="text-link" href="#dokter">
                    Lihat dokter{" "}
                    <ArrowRight
                      size={13}
                      style={{ display: "inline", verticalAlign: "middle" }}
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-soft" id="dokter">
          <div className="home-wrap">
            <div className="home-doctors-panel">
              <header className="home-doctors-head">
                <div className="home-doctors-intro">
                  <p className="home-doctors-kicker">Tenaga medis profesional</p>
                  <h2 className="home-doctors-title">
                    Dipercaya, berpengalaman,
                    <span>dan siap membantu.</span>
                  </h2>
                  <p className="home-doctors-description">
                    Kenali dokter kami dan pilih jadwal konsultasi yang sesuai
                    dengan aktivitas Anda.
                  </p>
                </div>
                <Link
                  className="home-doctors-all-button"
                  href="/dokter"
                >
                  Lihat semua dokter <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </header>
              <div className="doctor-grid home-doctors-grid">
              {doctors.map((d, i) => (
                <article className="home-doctor-card" key={d.id}>
                  <div className="home-doctor-photo">
                    <img
                      src={
                        d.image_url ||
                        d.image ||
                        [
                          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=700",
                          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700",
                          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=700",
                        ][i % 3]
                      }
                      alt={d.full_name}
                    />
                  </div>
                  <div className="home-doctor-body">
                    <h3 className="home-doctor-name">{d.full_name}</h3>
                    <p className="home-doctor-info">
                      <span>{d.poli_name || d.specialty || "Dokter Umum"}</span>
                      <span>{d.experience || "Tenaga medis profesional"}</span>
                    </p>
                    <div className="home-doctor-divider" />
                    <div className="home-doctor-footer">
                      <span className="home-doctor-badge">Jadwal tersedia</span>
                      <Link
                        href={`/dokter/${d.id}`}
                        className="home-doctor-profile-button"
                      >
                        Profil dokter <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section section-soft" id="jadwal">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-kicker">Atur kunjungan</div>
                <h2 className="section-title">Jadwal praktik dokter.</h2>
                <p className="section-desc">
                  Lihat pilihan hari dan jam praktik, kemudian lanjutkan dengan
                  membuat janji temu melalui akun pasien.
                </p>
              </div>
              <Link href="/register" className="text-link">
                Pilih jadwal{" "}
                <ArrowRight
                  size={13}
                  style={{ display: "inline", verticalAlign: "middle" }}
                />
              </Link>
            </div>
            {schedules.length ? (
              <div className="service-grid home-schedule-grid">
                {schedules.slice(0, 8).map((s) => (
                  <article className="service-card home-schedule-card" key={s.id}>
                    <div className="service-icon home-schedule-icon">
                      <CalendarDays size={26} aria-hidden="true" />
                    </div>
                    <h3 className="home-schedule-day">
                      {
                        [
                          "Minggu",
                          "Senin",
                          "Selasa",
                          "Rabu",
                          "Kamis",
                          "Jumat",
                          "Sabtu",
                        ][s.day_of_week]
                      }
                    </h3>
                    <p className="home-schedule-meta">
                      <span>{s.doctor_name}</span>
                      <span>{s.poli_name || "Poli"}</span>
                    </p>
                    <div className="doctor-footer home-schedule-footer">
                      <span className="pill green home-schedule-time">
                        {String(s.start_time).slice(0, 5)} · 30 menit
                      </span>
                      <Link href="/register" className="text-link home-schedule-booking">
                        Booking <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="notice">
                Jadwal praktik akan ditampilkan setelah data dokter dan jadwal
                diisi oleh Admin/Dokter.
              </div>
            )}
          </div>
        </section>

        <section className="section section-soft" id="tentang">
          <div className="container">
            <div className="schedule-banner">
              <div>
                <div className="section-kicker" style={{ color: "#8dd0ff" }}>
                  Layanan lebih dekat
                </div>
                <h2>
                  Waktu Anda berharga.
                  <br />
                  Atur kunjungan dengan mudah.
                </h2>
                <p>
                  Buat janji temu secara online, dapatkan informasi status, dan
                  persiapkan kunjungan Anda dengan lebih nyaman.
                </p>
                <div style={{ marginTop: 22 }}>
                  <Link
                    href="/register"
                    className="btn"
                    style={{ background: "white", color: "#1268aa" }}
                  >
                    Mulai buat janji <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
              <div className="schedule-art">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&auto=format&fit=crop"
                  alt="Dokter berkonsultasi dengan pasien"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-kicker">Mengapa MedCare</div>
                <h2 className="section-title">
                  Pengalaman layanan yang
                  <br />
                  lebih sederhana.
                </h2>
              </div>
            </div>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="service-icon">
                  <ShieldCheck />
                </div>
                <h3>Data lebih terlindungi</h3>
                <p>
                  Akses informasi pribadi dilindungi melalui autentikasi dan
                  pembatasan hak akses pengguna.
                </p>
              </div>
              <div className="feature-card">
                <div className="service-icon">
                  <Clock3 />
                </div>
                <h3>Informasi lebih teratur</h3>
                <p>
                  Jadwal konsultasi, riwayat pemeriksaan, dan status resep
                  tersusun dalam satu akun.
                </p>
              </div>
              <div className="feature-card">
                <div className="service-icon">
                  <Users />
                </div>
                <h3>Terhubung dengan layanan</h3>
                <p>
                  Pasien, dokter, dan petugas administrasi menggunakan alur
                  layanan yang saling terintegrasi.
                </p>
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection />

        <section className="section" id="faq">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="section-kicker">Butuh bantuan?</div>
                <h2 className="section-title">
                  Pertanyaan yang sering
                  <br />
                  ditanyakan.
                </h2>
                <p className="section-desc">
                  Informasi singkat untuk membantu Anda menggunakan layanan
                  digital MedCare.
                </p>
              </div>
            </div>
            <div className="faq-grid">
              <details className="faq">
                <summary>Bagaimana cara membuat janji temu?</summary>
                <p>
                  Daftar atau masuk sebagai pasien, pilih poli, dokter, jadwal
                  praktik, tanggal, lalu isi keluhan singkat. Pengajuan akan
                  berstatus Pending sampai divalidasi.
                </p>
              </details>
              <details className="faq">
                <summary>Apakah saya bisa melihat dokter tanpa login?</summary>
                <p>
                  Ya. Pengunjung dapat melihat informasi poli, profil dokter,
                  dan jadwal praktik. Login diperlukan untuk membuat janji temu.
                </p>
              </details>
              <details className="faq">
                <summary>Bagaimana melihat rekam medis?</summary>
                <p>
                  Masuk ke akun Pasien, buka menu Rekam Medis, lalu pilih
                  riwayat konsultasi yang ingin dilihat.
                </p>
              </details>
              <details className="faq">
                <summary>Bagaimana mengetahui obat siap diambil?</summary>
                <p>
                  Status resep dapat dipantau melalui dashboard Pasien. Ketika
                  petugas farmasi mengubah status menjadi Siap Diambil,
                  informasi akan muncul di akun Anda.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="section" id="janji">
          <div className="container">
            <div className="cta">
              <div>
                <div className="section-kicker">Mulai perjalanan sehat</div>
                <h2>Perawatan dimulai dari langkah kecil.</h2>
                <p>Buat akun pasien dan atur konsultasi pertama Anda.</p>
              </div>
              <Link href="/register" className="btn btn-primary">
                Daftar sebagai pasien <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Brand />
              <p style={{ maxWidth: 280 }}>
                Portal layanan kesehatan digital yang membantu pasien, dokter,
                dan rumah sakit terhubung dalam satu ekosistem.
              </p>
            </div>
            <div>
              <h4>Layanan</h4>
              <a href="#poli">Poliklinik</a>
              <a href="#dokter">Cari dokter</a>
              <Link href="/register">Janji temu</Link>
              <Link href="/login">Rekam medis</Link>
            </div>
            <div>
              <h4>Informasi</h4>
              <a href="#tentang">Tentang MedCare</a>
              <a href="#faq">Pertanyaan umum</a>
              <a href="#layanan">Layanan digital</a>
            </div>
            <div>
              <h4>Hubungi Kami</h4>
              <p>
                Jl. Kesehatan No. 10
                <br />
                Makassar, Indonesia
              </p>
              <p>
                1500-CARE
                <br />
                info@medcare.local
              </p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © 2026 MedCare Hospital. Informasi pada demo ini adalah data
              contoh.
            </span>
            <span>Privasi · Ketentuan Layanan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TestimonialsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/testimonials")
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok || !result.ok) {
          throw new Error(result.message || "Gagal memuat cerita pasien.");
        }
        if (active) setReviews(result.data || []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section section-soft">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="section-kicker">Cerita pasien</div>
            <h2 className="section-title">
              Kenyamanan pasien
              <br />
              menjadi prioritas.
            </h2>
          </div>
        </div>
        {loading ? (
          <p role="status">Memuat cerita pasien...</p>
        ) : error ? (
          <p className="form-error" role="alert">{error}</p>
        ) : reviews.length ? (
          <div className="feedback-grid">
            {reviews.map((review, index) => (
              <div
                className="quote-card"
                key={`${review.created_at}-${index}`}
              >
                <div
                  className="quote-stars"
                  role="img"
                  aria-label={`Rating ${review.rating} dari 5`}
                >
                  {"★".repeat(review.rating)}
                </div>
                <p className="quote-text">“{review.comment}”</p>
                <div className="quote-person">Pasien MedCare</div>
                <div className="quote-role">Ulasan anonim</div>
              </div>
            ))}
          </div>
        ) : (
          <p role="status">
            Belum ada cerita pasien yang disetujui untuk ditampilkan.
          </p>
        )}
      </div>
    </section>
  );
}

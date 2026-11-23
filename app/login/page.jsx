"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  FileText,
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Login gagal.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-form-column" aria-labelledby="login-title">
        <div className="login-form-wrap">
          <Link className="login-back" href="/">
            <ArrowLeft size={16} aria-hidden="true" />
            Kembali ke beranda
          </Link>

          <Link className="login-brand login-brand-dark" href="/" aria-label="MedCare, ke beranda">
            <span className="login-brand-mark">
              <Activity size={22} aria-hidden="true" />
            </span>
            <span className="login-brand-name">
              medcare<span>.</span>
            </span>
          </Link>

          <h1 id="login-title">Masuk ke MedCare</h1>
          <p className="login-lede">Gunakan email dan password akun Anda.</p>

          <form className="login-form" onSubmit={submit} aria-busy={busy}>
            <div className="login-field">
              <label htmlFor="login-email">Email</label>
              <div className="login-input-wrap">
                <Mail className="login-input-icon" size={19} aria-hidden="true" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  spellCheck="false"
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password">Password</label>
              <div className="login-input-wrap">
                <LockKeyhole className="login-input-icon" size={19} aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(event) =>
                    setForm({ ...form, password: event.target.value })
                  }
                  required
                />
                <button
                  className="login-password-toggle"
                  type="button"
                  onClick={() => setShow((visible) => !visible)}
                  aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={show}
                  aria-controls="login-password"
                >
                  {show ? (
                    <EyeOff size={19} aria-hidden="true" />
                  ) : (
                    <Eye size={19} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-submit" type="submit" disabled={busy}>
              {busy && <span className="login-spinner" aria-hidden="true" />}
              {busy ? "Memeriksa akun..." : "Masuk ke akun"}
            </button>
          </form>

          <p className="login-register">
            Belum memiliki akun pasien?{" "}
            <Link href="/register">Daftar sekarang</Link>
          </p>

          <p className="login-notice">
            Demo lokal: akun Admin/Dokter dapat dibuat oleh Admin atau melalui
            script seed. Pendaftaran publik hanya untuk role Pasien.
          </p>
        </div>
      </section>

      <aside className="login-panel" aria-label="Informasi layanan MedCare">
        <div className="login-panel-top">
          <Link className="login-brand login-brand-light" href="/" aria-label="MedCare, ke beranda">
            <span className="login-brand-mark">
              <Activity size={22} aria-hidden="true" />
            </span>
            <span className="login-brand-name">
              medcare<span>.</span>
            </span>
          </Link>
        </div>

        <div className="login-panel-middle">
          <div className="login-panel-copy">
            <span className="login-pill">Portal layanan kesehatan</span>
            <h2>
              Selamat datang <span>kembali.</span>
            </h2>
            <p>
              Masuk untuk mengakses janji temu, rekam medis, jadwal praktik,
              dan layanan rumah sakit sesuai peran Anda.
            </p>
          </div>

          <div className="login-cards" aria-label="Fitur layanan MedCare">
            <article className="login-feature-card">
              <span className="login-feature-icon">
                <CalendarDays size={20} aria-hidden="true" />
              </span>
              <span className="login-feature-kicker">Janji temu</span>
              <strong>Konsultasi dokter</strong>
              <span className="login-feature-meta">
                <Check size={15} aria-hidden="true" />
                Jadwal lebih teratur
              </span>
            </article>

            <article className="login-feature-card">
              <span className="login-feature-icon">
                <FileText size={20} aria-hidden="true" />
              </span>
              <span className="login-feature-kicker">Rekam medis digital</span>
              <strong>Informasi tersimpan</strong>
              <span className="login-feature-meta">Akses sesuai akun Anda</span>
            </article>

            <article className="login-feature-card">
              <span className="login-feature-icon">
                <HeartPulse size={20} aria-hidden="true" />
              </span>
              <span className="login-feature-kicker">Layanan dokter</span>
              <strong>Dukungan kesehatan</strong>
              <span className="login-feature-meta">Layanan terpadu MedCare</span>
            </article>
          </div>
        </div>

        <p className="login-panel-foot">
          <ShieldCheck size={18} aria-hidden="true" />
          Akun dilindungi dengan autentikasi dan hak akses.
        </p>
      </aside>
    </main>
  );
}

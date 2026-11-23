"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  UserRound,
  Mail,
  LockKeyhole,
  Phone
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    account_type: "patient",
    poli_id: "",
    str_number: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [polies, setPolies] = useState([]);
  const [poliError, setPoliError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");

  useEffect(() => {
    if (form.account_type !== "doctor") return;
    let active = true;

    fetch("/api/poli")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.message || "Gagal memuat daftar poli.");
        }
        if (active) setPolies(data.data || []);
      })
      .catch((err) => {
        if (active) setPoliError(err.message);
      });

    return () => {
      active = false;
    };
  }, [form.account_type]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Pendaftaran gagal.");
      }

      if (data.pending) {
        setPendingMessage(data.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap register-page">
      <aside className="auth-side">
        <Link href="/" className="brand" style={{ color: "white" }}>
          <span className="brand-mark">
            <Activity />
          </span>
          medcare.
        </Link>

        <div>
          <div
            className="eyebrow"
            style={{ background: "#ffffff18", color: "#d7efff" }}
          >
            Pendaftaran MedCare
          </div>
          <h1>Daftar sebagai pasien atau dokter.</h1>
          <p>
            Pendaftaran dokter akan diverifikasi sebelum akun dapat digunakan.
          </p>
        </div>

        <div style={{ color: "#c7deed", fontSize: 12 }}>
          Informasi akun Anda hanya dapat diakses sesuai hak akses yang berlaku.
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Link href="/" className="text-link">
            <ArrowLeft
              size={14}
              style={{ display: "inline", verticalAlign: "middle" }}
            />{" "}
            Kembali ke beranda
          </Link>

          <div style={{ marginTop: 26 }}>
            <h2>Buat akun</h2>
            <p className="muted">
              Isi data berikut untuk mendaftar ke MedCare.
            </p>
          </div>

          {pendingMessage ? (
            <div className="form-success" role="status">
              {pendingMessage} Admin akan memeriksa nomor STR sebelum akun
              diaktifkan. Anda belum dapat login sampai pendaftaran disetujui.
            </div>
          ) : (
          <form onSubmit={submit}>
            <div className="field">
              <label>Daftar sebagai</label>
              <select
                value={form.account_type}
                onChange={(e) => {
                  setPoliError("");
                  setForm({
                    ...form,
                    account_type: e.target.value,
                    poli_id: "",
                    str_number: "",
                  });
                }}
              >
                <option value="patient">Pasien</option>
                <option value="doctor">Dokter</option>
              </select>
            </div>

            <div className="field">
              <label>Nama lengkap</label>
              <div style={{ position: "relative" }}>
                <UserRound
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
                  required
                  minLength={3}
                  placeholder="Nama lengkap"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm({ ...form, full_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="field">
              <label>Username</label>
              <input
                required
                minLength={3}
                placeholder="username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            <div className="field">
              <label>Email</label>
              <div style={{ position: "relative" }}>
                <Mail
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
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="field">
              <label>Nomor telepon (opsional)</label>
              <div style={{ position: "relative" }}>
                <Phone
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
                  placeholder="08xxxxxxxxxx"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>
            </div>

            {form.account_type === "doctor" && (
              <>
                <div className="field">
                  <label>Poli praktik</label>
                  <select
                    required
                    value={form.poli_id}
                    onChange={(e) =>
                      setForm({ ...form, poli_id: e.target.value })
                    }
                  >
                    <option value="">Pilih poli</option>
                    {polies.map((poli) => (
                      <option key={poli.id} value={poli.id}>
                        {poli.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Nomor STR</label>
                  <input
                    required
                    maxLength={50}
                    value={form.str_number}
                    onChange={(e) =>
                      setForm({ ...form, str_number: e.target.value })
                    }
                  />
                </div>
                {poliError && <div className="form-error">{poliError}</div>}
              </>
            )}

            <div className="field">
              <label>Password (minimal 8 karakter)</label>
              <div style={{ position: "relative" }}>
                <LockKeyhole
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
                  type="password"
                  required
                  minLength={8}
                  placeholder="Buat password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: 10 }}
              disabled={
                busy || (form.account_type === "doctor" && Boolean(poliError))
              }
            >
              {busy
                ? "Mendaftarkan..."
                : form.account_type === "doctor"
                  ? "Ajukan pendaftaran dokter"
                  : "Daftar sebagai pasien"}
            </button>
          </form>
          )}

          <div className="auth-bottom">
            Sudah memiliki akun?{" "}
            <Link className="text-link" href="/login">
              Masuk
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

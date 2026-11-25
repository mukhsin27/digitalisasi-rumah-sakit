"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {Activity, Bell, CalendarDays, ClipboardList, FileText,LayoutDashboard,
  LogOut, Pill, Plus, Search, Settings, Stethoscope, Users, Building2,
  HeartPulse, Clock3, Check, X, RefreshCw, UserRound, Menu, Trash2,} from "lucide-react";

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const money = (n) => new Intl.NumberFormat("id-ID").format(Number(n || 0));
const statusText = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  waiting: "Menunggu Diproses",
  ready: "Siap Diambil",
  collected: "Sudah Diambil",
};
const menuByRole = {
  admin: [
    "overview",
    "appointments",
    "users",
    "poli",
    "medicines",
    "prescriptions",
    "reports",
    "feedback",
  ],
  doctor: [
    "overview",
    "appointments",
    "schedules",
    "patients",
    "records",
    "profile",
  ],
  patient: [
    "overview",
    "booking",
    "appointments",
    "records",
    "prescriptions",
    "feedback",
    "profile",
  ],
};
const labels = {
  overview: "Ringkasan",
  appointments: "Janji Temu",
  users: "Manajemen Pengguna",
  poli: "Manajemen Poli",
  medicines: "Data Obat",
  prescriptions: "Antrean Farmasi",
  reports: "Laporan",
  schedules: "Jadwal Praktik",
  patients: "Daftar Pasien",
  records: "Rekam Medis",
  booking: "Buat Janji Temu",
  feedback: "Umpan Balik",
  profile: "Profil Saya",
};

async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(data.message || "Permintaan gagal.");
  return data;
}
function Brand() {
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">
        <Activity size={20} />
      </span>
      <span>
        medcare<span style={{ color: "#5db3ed" }}>.</span>
      </span>
    </Link>
  );
}
function Status({ value }) {
  return (
    <span className={`status ${value}`}>{statusText[value] || value}</span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState({});
  const [forms, setForms] = useState({});
  const [search, setSearch] = useState("");
  const set = (key, value) => setForms((old) => ({ ...old, [key]: value }));
  const load = useCallback(
    async (roleOverride) => {
      setLoading(true);
      setError("");
      try {
        const me = await api("/api/auth/me");
        setUser(me.user);
        const role = roleOverride || me.user.role;
        const requests = {
          appointments: api("/api/appointments"),
          poli: api("/api/poli"),
          doctors: api("/api/doctors"),
          schedules: api("/api/schedules"),
          records: api("/api/medical-records"),
          prescriptions: api("/api/prescriptions"),
          notifications: api("/api/notifications"),
        };
        if (role === "admin" || role === "doctor") {
          requests.medicines = api("/api/medicines");
        }
        if (role === "admin") {
          requests.users = api("/api/users");
          requests.overview = api("/api/admin/overview");
          requests.feedback = api("/api/feedback");
        } else if (role === "doctor") {
          requests.users = api("/api/appointments");
        }
        const pairs = await Promise.all(
          Object.entries(requests).map(async ([k, p]) => [k, await p]),
        );
        setData(Object.fromEntries(pairs.map(([k, v]) => [k, v.data || []])));
      } catch (e) {
        setError(e.message);
        if (e.message.includes("login") || e.message.includes("Login"))
          router.replace("/login");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );
  useEffect(() => {
    load();
  }, [load]);
  const toast = (s) => {
    setMessage(s);
    setError("");
    setTimeout(() => setMessage(""), 3500);
  };
  async function action(fn) {
    setBusy(true);
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  const allowed = menuByRole[user?.role] || [];
  const displayAppointments = data.appointments || [];
  const filteredUsers = (data.users || []).filter((x) =>
    `${x.full_name} ${x.email} ${x.role}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (loading && !user)
    return (
      <div
        className="page-shell"
        style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
      >
        Memuat dashboard MedCare...
      </div>
    );
  if (!user)
    return (
      <div
        className="page-shell"
        style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}
      >
        <div>
          <p>{error || "Silakan login."}</p>
          <Link className="btn btn-primary" href="/login">
            Ke halaman login
          </Link>
        </div>
      </div>
    );

  const navIcon = {
    overview: <LayoutDashboard size={17} />,
    appointments: <CalendarDays size={17} />,
    users: <Users size={17} />,
    poli: <Building2 size={17} />,
    medicines: <Pill size={17} />,
    prescriptions: <ClipboardList size={17} />,
    reports: <FileText size={17} />,
    schedules: <Clock3 size={17} />,
    patients: <Users size={17} />,
    records: <FileText size={17} />,
    booking: <Plus size={17} />,
    feedback: <HeartPulse size={17} />,
    profile: <Settings size={17} />,
  };
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Brand />
        <div className="side-label">MENU UTAMA</div>
        {allowed.map((key) => (
          <button
            key={key}
            onClick={() => {
              setActive(key);
              setError("");
            }}
            className={`side-link ${active === key ? "active" : ""}`}
          >
            {navIcon[key]} {labels[key]}
          </button>
        ))}
        <div className="side-footer">
          <div style={{ fontWeight: 800, color: "white", marginBottom: 4 }}>
            {user.full_name}
          </div>
          <div>{user.role.toUpperCase()}</div>
          <button
            className="side-link"
            style={{ paddingLeft: 0, marginTop: 14 }}
            onClick={logout}
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>
      <main className="dash-main">
        <header className="dash-top">
          <div>
            <div style={{ fontSize: 11, color: "#8a9aa7" }}>
              MedCare Hospital / {labels[active]}
            </div>
            <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>
              {user.full_name}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn btn-outline btn-sm" onClick={() => load()}>
              <RefreshCw size={14} /> Segarkan
            </button>
            <button
              className="btn btn-soft btn-sm"
              onClick={() => setActive("profile")}
            >
              <UserRound size={15} /> Profil
            </button>
          </div>
        </header>
        <div className="dash-content">
          <div
            style={{
              display: "flex",
              alignItems: "start",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div>
              <h1 className="dash-title">
                {active === "overview"
                  ? `Halo, ${user.full_name.split(" ")[0]} 👋`
                  : labels[active]}
              </h1>
              <p className="dash-sub">
                {active === "overview"
                  ? "Berikut ringkasan aktivitas layanan kesehatan Anda."
                  : `Kelola ${labels[active].toLowerCase()} melalui portal MedCare Hospital.`}
              </p>
            </div>
            <span className="pill green">{user.role.toUpperCase()}</span>
          </div>
          {message && <div className="form-success">{message}</div>}
          {error && <div className="form-error">{error}</div>}
          {active === "overview" && (
            <Overview user={user} data={data} onNavigate={setActive} />
          )}
          {active === "booking" && (
            <Booking
              polies={data.poli || []}
              onSubmit={(body) =>
                action(async () => {
                  const r = await api("/api/appointments", {
                    method: "POST",
                    body: JSON.stringify(body),
                  });
                  toast(r.message);
                  setActive("appointments");
                })
              }
            />
          )}
          {active === "appointments" && (
            <Appointments
              role={user.role}
              data={displayAppointments}
              onUpdate={(id, status, reason) =>
                action(async () => {
                  const r = await api(`/api/appointments/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ status, reason }),
                  });
                  toast(r.message);
                })
              }
            />
          )}
          {active === "users" && (
            <UsersPanel
              users={filteredUsers}
              search={search}
              setSearch={setSearch}
              polies={data.poli || []}
              onCreate={(body) =>
                action(async () => {
                  const r = await api("/api/users", {
                    method: "POST",
                    body: JSON.stringify(body),
                  });
                  toast("Pengguna berhasil ditambahkan.");
                })
              }
              onEdit={(id, body) =>
                action(async () => {
                  await api(`/api/users/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                  });
                  toast("Data pengguna diperbarui.");
                })
              }
              onReview={(doctor, status) =>
                action(async () => {
                  await api(`/api/users/${doctor.id}`, {
                    method: "PATCH",
                    body: JSON.stringify({
                      full_name: doctor.full_name,
                      username: doctor.username,
                      email: doctor.email,
                      role: doctor.role,
                      poli_id: doctor.poli_id,
                      doctor_verification_status: status,
                    }),
                  });
                  toast(
                    status === "approved"
                      ? "Pendaftaran dokter disetujui."
                      : "Pendaftaran dokter ditolak.",
                  );
                })
              }
              onDelete={(id) =>
                action(async () => {
                  await api(`/api/users/${id}`, { method: "DELETE" });
                  toast("Pengguna dinonaktifkan.");
                })
              }
            />
          )}
          {active === "poli" && (
            <PoliPanel
              data={data.poli || []}
              onCreate={(body) =>
                action(async () => {
                  await api("/api/poli", {
                    method: "POST",
                    body: JSON.stringify(body),
                  });
                  toast("Poli berhasil ditambahkan.");
                })
              }
              onEdit={(id, body) =>
                action(async () => {
                  await api(`/api/poli/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                  });
                  toast("Data poli diperbarui.");
                })
              }
              onDelete={(id) =>
                action(async () => {
                  await api(`/api/poli/${id}`, { method: "DELETE" });
                  toast("Poli dinonaktifkan.");
                })
              }
            />
          )}
          {active === "medicines" && (
            <MedicinesPanel
              data={data.medicines || []}
              onCreate={(body) =>
                action(async () => {
                  await api("/api/medicines", {
                    method: "POST",
                    body: JSON.stringify(body),
                  });
                  toast("Obat berhasil ditambahkan.");
                })
              }
              onEdit={(id, body) =>
                action(async () => {
                  await api(`/api/medicines/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                  });
                  toast("Data obat diperbarui.");
                })
              }
              onDelete={(id) =>
                action(async () => {
                  await api(`/api/medicines/${id}`, { method: "DELETE" });
                  toast("Obat dinonaktifkan.");
                })
              }
            />
          )}
          {active === "schedules" && (
            <SchedulesPanel
              data={data.schedules || []}
              user={user}
              onCreate={(body) =>
                action(async () => {
                  await api("/api/schedules", {
                    method: "POST",
                    body: JSON.stringify(body),
                  });
                  toast("Jadwal berhasil dibuat.");
                })
              }
              onEdit={(id, body) =>
                action(async () => {
                  await api(`/api/schedules/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                  });
                  toast("Jadwal diperbarui.");
                })
              }
              onDelete={(id) =>
                action(async () => {
                  await api(`/api/schedules/${id}`, { method: "DELETE" });
                  toast("Jadwal dinonaktifkan.");
                })
              }
            />
          )}
          {active === "records" && (
            <RecordsPanel
              role={user.role}
              data={data.records || []}
              appointments={displayAppointments}
              medicines={data.medicines || []}
              onCreate={(body) =>
                action(async () => {
                  await api("/api/medical-records", {
                    method: "POST",
                    body: JSON.stringify(body),
                  });
                  toast("Rekam medis dan resep tersimpan.");
                  setActive("records");
                })
              }
            />
          )}
          {active === "prescriptions" && (
            <PrescriptionsPanel
              role={user.role}
              data={data.prescriptions || []}
              onUpdate={(id, status) =>
                action(async () => {
                  await api("/api/prescriptions", {
                    method: "PATCH",
                    body: JSON.stringify({ id, status }),
                  });
                  toast("Status resep diperbarui.");
                })
              }
            />
          )}
          {active === "patients" && (
            <PatientsPanel
              data={displayAppointments}
              search={search}
              setSearch={setSearch}
            />
          )}
          {active === "reports" && (
            <ReportsPanel overview={data.overview || {}} />
          )}
          {active === "feedback" && (
            user.role === "admin" ? (
              <FeedbackModerationPanel
                data={data.feedback || []}
                onReview={(id, status) =>
                  action(async () => {
                    const r = await api("/api/feedback", {
                      method: "PATCH",
                      body: JSON.stringify({ id, status }),
                    });
                    toast(r.message);
                  })
                }
              />
            ) : (
              <FeedbackPanel
                onSubmit={(body) =>
                  action(async () => {
                    const r = await api("/api/feedback", {
                      method: "POST",
                      body: JSON.stringify(body),
                    });
                    toast(r.message || "Terima kasih atas umpan balik Anda.");
                  })
                }
              />
            )
          )}
          {active === "profile" && (
            <ProfilePanel
              user={user}
              onSave={(body) =>
                action(async () => {
                  await api("/api/profile", {
                    method: "PATCH",
                    body: JSON.stringify(body),
                  });
                  toast("Profil berhasil diperbarui.");
                })
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}

function Overview({ user, data, onNavigate }) {
  const ap = data.appointments || [],
    records = data.records || [],
    pres = data.prescriptions || [];
  const pending = ap.filter((x) => x.status === "pending").length;
  const approved = ap.filter((x) => x.status === "approved").length;
  const stats =
    user.role === "admin"
      ? [
          (data.users || []).length,
          "Pengguna",
          ap.length,
          "Janji temu",
          pres.filter((x) => x.status === "waiting").length,
          "Resep menunggu",
          pres.filter((x) => x.status === "ready").length,
          "Resep siap diambil",
        ]
      : user.role === "doctor"
        ? [
            pending,
            "Janji temu pending",
            approved,
            "Konsultasi disetujui",
            records.length,
            "Rekam medis",
            (data.schedules || []).length,
            "Jadwal praktik",
          ]
        : [
            ap.length,
            "Total janji temu",
            pending,
            "Menunggu validasi",
            records.length,
            "Riwayat medis",
            pres.filter((x) => x.status === "ready").length,
            "Resep siap diambil",
          ];
  return (
    <>
      <div className="dash-grid">
        {[0, 2, 4, 6].map((i) => (
          <div className="metric" key={i}>
            <span>{stats[i + 1]}</span>
            <strong>{stats[i]}</strong>
          </div>
        ))}
      </div>
      <div className="grid-two">
        <div className="panel">
          <div className="panel-head">
            <h3>Aktivitas janji temu terbaru</h3>
            <button
              className="text-link"
              onClick={() =>
                onNavigate(
                  user.role === "patient" ? "appointments" : "appointments",
                )
              }
            >
              Lihat semua →
            </button>
          </div>
          {ap.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Pasien</th>
                    <th>Tanggal</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ap.slice(0, 5).map((x) => (
                    <tr key={x.id}>
                      <td>{x.patient_name || "Anda"}</td>
                      <td>{String(x.booking_date).slice(0, 10)}</td>
                      <td>
                        <Status value={x.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">Belum ada janji temu.</div>
          )}
        </div>
        <div className="panel">
          <div className="panel-head">
            <h3>Akses cepat</h3>
          </div>
          <div style={{ display: "grid", gap: 9 }}>
            {(user.role === "patient"
              ? [
                  ["booking", "Buat janji temu"],
                  ["records", "Lihat rekam medis"],
                  ["prescriptions", "Pantau resep"],
                ]
              : user.role === "doctor"
                ? [
                    ["appointments", "Validasi janji temu"],
                    ["schedules", "Atur jadwal praktik"],
                    ["records", "Catat rekam medis"],
                  ]
                : [
                    ["users", "Kelola pengguna"],
                    ["poli", "Kelola poliklinik"],
                    ["medicines", "Kelola obat dan stok"],
                  ]
            ).map(([k, v]) => (
              <button
                className="btn btn-outline"
                style={{ justifyContent: "space-between" }}
                key={k}
                onClick={() => onNavigate(k)}
              >
                {v}
                <span>→</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {(data.notifications || []).length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-head">
            <h3>Notifikasi terbaru</h3>
            <Bell size={16} />
          </div>
          {data.notifications.slice(0, 4).map((n) => (
            <div
              key={n.id}
              style={{ padding: "10px 0", borderTop: "1px solid #edf2f5" }}
            >
              <b style={{ fontSize: 12 }}>{n.title}</b>
              <div className="dash-sub">{n.message}</div>
            </div>
          ))}
        </div>
      )}
      {user.role === "patient" && (
        <div className="notice" style={{ marginTop: 16 }}>
          Simpan informasi akun Anda dengan benar. Riwayat medis hanya dapat
          dilihat oleh Anda dan tenaga medis yang berwenang.
        </div>
      )}
    </>
  );
}
function Booking({ polies, onSubmit }) {
  const [doctors, setDoctors] = useState([]),
    [schedules, setSchedules] = useState([]),
    [f, setF] = useState({
      poli_id: "",
      doctor_id: "",
      schedule_id: "",
      booking_date: "",
      complaint: "",
    });
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/doctors")
      .then((r) => r.json())
      .then((x) => setDoctors(x.data || []))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (f.doctor_id)
      fetch(`/api/schedules?doctor_id=${f.doctor_id}`)
        .then((r) => r.json())
        .then((x) => setSchedules(x.data || []));
    else setSchedules([]);
  }, [f.doctor_id]);
  const filtered = doctors.filter(
    (d) => !f.poli_id || String(d.poli_id) === String(f.poli_id),
  );
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Formulir janji temu</h3>
        <span className="pill">Langkah 1 dari 1</span>
      </div>
      <div className="notice">
        Pilih poli, dokter, dan jadwal praktik. Pengajuan akan masuk dengan
        status Pending.
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.schedule_id) {
            setErr("Pilih jadwal praktik terlebih dahulu.");
            return;
          }
          setErr("");
          onSubmit({
            doctor_id: Number(f.doctor_id),
            schedule_id: Number(f.schedule_id),
            booking_date: f.booking_date,
            complaint: f.complaint,
          });
        }}
      >
        <div className="inline-form" style={{ marginTop: 14 }}>
          <Field label="Poliklinik">
            <select
              value={f.poli_id}
              onChange={(e) =>
                setF({
                  ...f,
                  poli_id: e.target.value,
                  doctor_id: "",
                  schedule_id: "",
                })
              }
            >
              <option value="">Pilih poli</option>
              {polies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Dokter">
            <select
              required
              value={f.doctor_id}
              onChange={(e) =>
                setF({ ...f, doctor_id: e.target.value, schedule_id: "" })
              }
            >
              <option value="">Pilih dokter</option>
              {filtered.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name} — {d.poli_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Jadwal praktik">
            <select
              required
              value={f.schedule_id}
              onChange={(e) => setF({ ...f, schedule_id: e.target.value })}
            >
              <option value="">Pilih jadwal</option>
              {schedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {dayNames[s.day_of_week]} · {String(s.start_time).slice(0, 5)}{" "}
                  (30 menit)
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal kunjungan">
            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={f.booking_date}
              onChange={(e) => setF({ ...f, booking_date: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Keluhan singkat">
          <textarea
            required
            minLength={5}
            placeholder="Jelaskan keluhan yang ingin dikonsultasikan..."
            value={f.complaint}
            onChange={(e) => setF({ ...f, complaint: e.target.value })}
          />
        </Field>
        {err && <div className="form-error">{err}</div>}
        <button className="btn btn-primary">
          Kirim pengajuan <CalendarDays size={15} />
        </button>
      </form>
    </div>
  );
}
function Appointments({ role, data, onUpdate }) {
  const [reason, setReason] = useState({});
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Daftar janji temu</h3>
        <span className="pill">{data.length} data</span>
      </div>
      {data.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pasien</th>
                <th>Dokter</th>
                <th>Poli</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Keluhan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient_name || "Anda"}</td>
                  <td>{a.doctor_name || "-"}</td>
                  <td>{a.poli_name || "-"}</td>
                  <td>{String(a.booking_date).slice(0, 10)}</td>
                  <td>{String(a.start_time || "").slice(0, 5)}</td>
                  <td style={{ maxWidth: 170 }}>{a.complaint}</td>
                  <td>
                    <Status value={a.status} />
                  </td>
                  <td>
                    <div className="action-row">
                      {["admin", "doctor"].includes(role) &&
                        a.status === "pending" && (
                          <>
                            <button
                              className="btn btn-green btn-sm"
                              onClick={() => onUpdate(a.id, "approved", "")}
                            >
                              <Check size={13} /> Setujui
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                const r = prompt("Alasan penolakan:");
                                if (r) onUpdate(a.id, "rejected", r);
                              }}
                            >
                              <X size={13} /> Tolak
                            </button>
                          </>
                        )}
                      {role === "patient" && a.status === "pending" && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => onUpdate(a.id, "cancelled", "")}
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">Belum ada data janji temu.</div>
      )}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}
function PoliPanel({ data, onCreate, onEdit, onDelete }) {
  const [f, setF] = useState({ name: "", description: "" });
  return (
    <div className="grid-two">
      <div className="panel">
        <h3>Tambah poliklinik</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate(f);
            setF({ name: "", description: "" });
          }}
        >
          <Field label="Nama poli">
            <input
              required
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </Field>
          <Field label="Deskripsi">
            <textarea
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
            />
          </Field>
          <button className="btn btn-primary">
            <Plus size={14} /> Tambah poli
          </button>
        </form>
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>Daftar poli</h3>
          <span className="pill">{data.length} poli</span>
        </div>
        {data.map((p) => (
          <div
            key={p.id}
            style={{
              padding: "12px 0",
              borderBottom: "1px solid #edf2f5",
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <b style={{ fontSize: 13 }}>{p.name}</b>
              <div className="dash-sub">
                {p.doctor_count || 0} dokter · {p.description}
              </div>
            </div>
            <div className="action-row">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  const name = prompt("Nama poli:", p.name);
                  if (name === null) return;
                  const description = prompt("Deskripsi:", p.description || "");
                  if (description !== null) onEdit(p.id, { name, description });
                }}
              >
                Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onDelete(p.id)}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function MedicinesPanel({ data, onCreate, onEdit, onDelete }) {
  const [f, setF] = useState({
    name: "",
    description: "",
    medicine_type: "ordinary",
    stock: 0,
    expires_at: "",
    image_url: "",
  });
  const [filter, setFilter] = useState("all");
  const today = new Date().toISOString().slice(0, 10);
  const visible = data.filter(
    (m) =>
      filter === "all" ||
      (filter === "available" && Number(m.stock) > 0) ||
      (filter === "empty" && Number(m.stock) === 0) ||
      (filter === "expired" &&
        m.expires_at &&
        String(m.expires_at).slice(0, 10) < today),
  );
  return (
    <div className="grid-two">
      <div className="panel">
        <h3>Tambah obat</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({ ...f, stock: Number(f.stock) });
            setF({
              name: "",
              description: "",
              medicine_type: "ordinary",
              stock: 0,
              expires_at: "",
              image_url: "",
            });
          }}
        >
          <Field label="Nama obat">
            <input
              required
              value={f.name}
              onChange={(e) => setF({ ...f, name: e.target.value })}
            />
          </Field>
          <Field label="Deskripsi">
            <textarea
              value={f.description}
              onChange={(e) => setF({ ...f, description: e.target.value })}
            />
          </Field>
          <Field label="Jenis obat">
            <select
              value={f.medicine_type}
              onChange={(e) => setF({ ...f, medicine_type: e.target.value })}
            >
              <option value="ordinary">Obat biasa</option>
              <option value="prescription">Obat resep</option>
            </select>
          </Field>
          <Field label="Stok">
            <input
              type="number"
              min="0"
              required
              value={f.stock}
              onChange={(e) => setF({ ...f, stock: e.target.value })}
            />
          </Field>
          <Field label="Tanggal kedaluwarsa">
            <input
              type="date"
              value={f.expires_at}
              onChange={(e) => setF({ ...f, expires_at: e.target.value })}
            />
          </Field>
          <Field label="URL gambar obat (opsional)">
            <input
              type="url"
              placeholder="https://..."
              value={f.image_url}
              onChange={(e) => setF({ ...f, image_url: e.target.value })}
            />
          </Field>
          <button className="btn btn-primary">
            <Plus size={14} /> Simpan obat
          </button>
        </form>
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>Stok obat</h3>
          <span className="pill">{data.length} jenis</span>
        </div>
        <div className="field">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Semua obat</option>
            <option value="available">Tersedia</option>
            <option value="empty">Tidak tersedia</option>
            <option value="expired">Kedaluwarsa</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Tipe</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.medicine_type === "ordinary" ? "Biasa" : "Resep"}</td>
                  <td>
                    <b>{m.stock}</b>
                  </td>
                  <td>
                    <div className="action-row">
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          const name = prompt("Nama obat:", m.name);
                          if (name === null) return;
                          const stock = prompt("Stok:", String(m.stock));
                          if (stock === null) return;
                          onEdit(m.id, {
                            name,
                            description: m.description || "",
                            medicine_type: m.medicine_type,
                            stock: Number(stock),
                            expires_at: m.expires_at
                              ? String(m.expires_at).slice(0, 10)
                              : null,
                            image_url: m.image_url || null,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(m.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function UsersPanel({
  users,
  search,
  setSearch,
  polies,
  onCreate,
  onEdit,
  onReview,
  onDelete,
}) {
  const [f, setF] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    role: "doctor",
    poli_id: "",
  });
  return (
    <div className="grid-two">
      <div className="panel">
        <h3>Tambah pengguna</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({ ...f, poli_id: f.poli_id ? Number(f.poli_id) : null });
            setF({
              full_name: "",
              username: "",
              email: "",
              password: "",
              role: "doctor",
              poli_id: "",
            });
          }}
        >
          <Field label="Nama lengkap">
            <input
              required
              value={f.full_name}
              onChange={(e) => setF({ ...f, full_name: e.target.value })}
            />
          </Field>
          <Field label="Username">
            <input
              required
              value={f.username}
              onChange={(e) => setF({ ...f, username: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              required
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              minLength={8}
              required
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
            />
          </Field>
          <Field label="Role">
            <select
              value={f.role}
              onChange={(e) => setF({ ...f, role: e.target.value })}
            >
              <option value="doctor">Dokter</option>
              <option value="patient">Pasien</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          {f.role === "doctor" && (
            <Field label="Poli dokter">
              <select
                required
                value={f.poli_id}
                onChange={(e) => setF({ ...f, poli_id: e.target.value })}
              >
                <option value="">Pilih poli</option>
                {polies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <button className="btn btn-primary">
            <Plus size={14} /> Tambah akun
          </button>
        </form>
        <p className="dash-sub" style={{ marginTop: 12 }}>
          Pendaftar dokter dapat mendaftar sendiri. Akun hanya aktif setelah
          Admin memverifikasi nomor STR.
        </p>
      </div>
      <div className="panel">
        <div className="panel-head">
          <h3>Daftar pengguna</h3>
          <span className="pill">{users.length} akun</span>
        </div>
        <div className="field">
          <input
            placeholder="Cari nama, email, atau role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Role</th>
                <th>Poli</th>
                <th>No. STR</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.full_name}</b>
                    <div className="dash-sub">{u.email}</div>
                  </td>
                  <td>{u.role}</td>
                  <td>{u.poli_name || "-"}</td>
                  <td>{u.role === "doctor" ? u.str_number || "-" : "-"}</td>
                  <td>
                    {u.role === "doctor"
                      ? u.doctor_verification_status === "pending"
                        ? "Menunggu verifikasi"
                        : u.doctor_verification_status === "rejected"
                          ? "Ditolak"
                          : u.is_active
                            ? "Aktif"
                            : "Nonaktif"
                      : u.is_active
                        ? "Aktif"
                        : "Nonaktif"}
                  </td>
                  <td>
                    <div className="action-row">
                      {u.role === "doctor" &&
                        u.doctor_verification_status === "pending" && (
                          <>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => onReview(u, "approved")}
                            >
                              Setujui
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Tolak pendaftaran dokter ini?",
                                  )
                                ) {
                                  onReview(u, "rejected");
                                }
                              }}
                            >
                              Tolak
                            </button>
                          </>
                        )}
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          const name = prompt("Nama lengkap:", u.full_name);
                          if (name === null) return;
                          const username = prompt("Username:", u.username);
                          if (username === null) return;
                          const email = prompt("Email:", u.email);
                          if (email === null) return;
                          onEdit(u.id, {
                            full_name: name,
                            username,
                            email,
                            role: u.role,
                            poli_id: u.poli_id,
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(u.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function SchedulesPanel({ data, user, onCreate, onEdit, onDelete }) {
  const own = data.filter((s) => String(s.doctor_id) === String(user.id));
  const [f, setF] = useState({ day_of_week: "1", start_time: "08:00" });
  return (
    <div className="grid-two">
      <div className="panel">
        <h3>Tambah jadwal praktik</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate({ ...f, day_of_week: Number(f.day_of_week) });
          }}
        >
          <Field label="Hari praktik">
            <select
              value={f.day_of_week}
              onChange={(e) => setF({ ...f, day_of_week: e.target.value })}
            >
              {dayNames.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Jam mulai">
            <input
              type="time"
              required
              value={f.start_time}
              onChange={(e) => setF({ ...f, start_time: e.target.value })}
            />
          </Field>
          <div className="notice" style={{ marginBottom: 14 }}>
            Durasi konsultasi ditetapkan 30 menit. Jadwal tidak boleh saling
            bertumpang tindih.
          </div>
          <button className="btn btn-primary">
            <Plus size={14} /> Simpan jadwal
          </button>
        </form>
      </div>
      <div className="panel">
        <h3>Jadwal saya</h3>
        {own.length ? (
          own.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0",
                borderBottom: "1px solid #edf2f5",
              }}
            >
              <div>
                <b>{dayNames[s.day_of_week]}</b>
                <div className="dash-sub">
                  {String(s.start_time).slice(0, 5)} · 30 menit
                </div>
              </div>
              <div className="action-row">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    const day = prompt(
                      "Hari (0=Minggu, 1=Senin, ... 6=Sabtu):",
                      String(s.day_of_week),
                    );
                    if (day === null) return;
                    const time = prompt(
                      "Jam mulai HH:MM:",
                      String(s.start_time).slice(0, 5),
                    );
                    if (time !== null)
                      onEdit(s.id, {
                        day_of_week: Number(day),
                        start_time: time,
                      });
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onDelete(s.id)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">Belum ada jadwal praktik.</div>
        )}
      </div>
    </div>
  );
}
function RecordsPanel({ role, data, appointments, medicines, onCreate }) {
  const today = new Date().toISOString().slice(0, 10);
  const approved = appointments.filter(
    (a) =>
      a.status === "approved" && String(a.booking_date).slice(0, 10) <= today,
  );
  const [f, setF] = useState({
    appointment_id: "",
    diagnosis: "",
    medical_action: "",
    notes: "",
  });
  const [items, setItems] = useState([{ medicine_id: "", quantity: 1 }]);
  function updateItem(index, key, value) {
    setItems((old) =>
      old.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }
  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <h3>Riwayat rekam medis</h3>
          <span className="pill">{data.length} catatan</span>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => window.print()}
          >
            Cetak / PDF
          </button>
        </div>
        {data.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pasien</th>
                  <th>Dokter</th>
                  <th>Tanggal</th>
                  <th>Diagnosis</th>
                  <th>Tindakan</th>
                  <th>Resep</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id}>
                    <td>{r.patient_name}</td>
                    <td>{r.doctor_name}</td>
                    <td>{String(r.created_at).slice(0, 10)}</td>
                    <td>{r.diagnosis}</td>
                    <td>{r.medical_action}</td>
                    <td>
                      {r.prescription_status ? (
                        <Status value={r.prescription_status} />
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty">Belum ada rekam medis.</div>
        )}
      </div>
      {role === "doctor" && (
        <div className="panel">
          <h3>Catat hasil konsultasi</h3>
          <p className="dash-sub" style={{ margin: "8px 0 15px" }}>
            Pilih janji temu berstatus Approved. Setelah disimpan, janji temu
            menjadi Selesai dan resep dibuat otomatis berstatus Menunggu
            Diproses.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCreate({
                appointment_id: Number(f.appointment_id),
                diagnosis: f.diagnosis,
                medical_action: f.medical_action,
                notes: f.notes,
                items: items.map((x) => ({
                  medicine_id: Number(x.medicine_id),
                  quantity: Number(x.quantity),
                })),
              });
              setF({
                appointment_id: "",
                diagnosis: "",
                medical_action: "",
                notes: "",
              });
              setItems([{ medicine_id: "", quantity: 1 }]);
            }}
          >
            <Field label="Janji temu disetujui">
              <select
                required
                value={f.appointment_id}
                onChange={(e) => setF({ ...f, appointment_id: e.target.value })}
              >
                <option value="">Pilih pasien dan tanggal</option>
                {approved.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.id} · {a.patient_name} ·{" "}
                    {String(a.booking_date).slice(0, 10)}
                  </option>
                ))}
              </select>
            </Field>
            <div className="inline-form">
              <Field label="Diagnosis">
                <textarea
                  required
                  value={f.diagnosis}
                  onChange={(e) => setF({ ...f, diagnosis: e.target.value })}
                />
              </Field>
              <Field label="Tindakan medis">
                <textarea
                  required
                  value={f.medical_action}
                  onChange={(e) =>
                    setF({ ...f, medical_action: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Catatan tambahan">
              <textarea
                value={f.notes}
                onChange={(e) => setF({ ...f, notes: e.target.value })}
              />
            </Field>
            <div className="panel-head" style={{ marginTop: 14 }}>
              <h3>Rincian obat resep</h3>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() =>
                  setItems((old) => [...old, { medicine_id: "", quantity: 1 }])
                }
              >
                <Plus size={13} /> Tambah obat
              </button>
            </div>
            {items.map((item, index) => (
              <div
                className="inline-form"
                key={index}
                style={{ alignItems: "end", marginBottom: 10 }}
              >
                <Field label={`Obat ${index + 1}`}>
                  <select
                    required
                    value={item.medicine_id}
                    onChange={(e) =>
                      updateItem(index, "medicine_id", e.target.value)
                    }
                  >
                    <option value="">Pilih obat</option>
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · stok {m.stock}
                      </option>
                    ))}
                  </select>
                </Field>
                <div style={{ display: "flex", gap: 8, alignItems: "end" }}>
                  <div style={{ flex: 1 }}>
                    <Field label="Jumlah">
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                      />
                    </Field>
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      style={{ marginBottom: 13 }}
                      onClick={() =>
                        setItems((old) => old.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button className="btn btn-primary">
              Simpan rekam medis & resep
            </button>
          </form>
        </div>
      )}
    </>
  );
}
function PrescriptionsPanel({ role, data, onUpdate }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>
          {role === "admin" ? "Antrean pemrosesan resep" : "Riwayat resep saya"}
        </h3>
        <span className="pill">{data.length} resep</span>
      </div>
      {data.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pasien</th>
                <th>Dokter</th>
                <th>Rincian obat</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id}>
                  <td>{p.patient_name}</td>
                  <td>{p.doctor_name}</td>
                  <td>
                    {(p.items || [])
                      .map((x) => `${x.medicine_name} (${x.quantity})`)
                      .join(", ")}
                  </td>
                  <td>
                    <Status value={p.status} />
                  </td>
                  <td>
                    {role === "admin" && p.status === "waiting" && (
                      <button
                        className="btn btn-green btn-sm"
                        onClick={() => onUpdate(p.id, "ready")}
                      >
                        Siapkan obat
                      </button>
                    )}
                    {role === "admin" && p.status === "ready" && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onUpdate(p.id, "collected")}
                      >
                        Konfirmasi diambil
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">Belum ada data resep.</div>
      )}
    </div>
  );
}
function PatientsPanel({ data, search, setSearch }) {
  const unique = [
    ...new Map(
      data.map((x) => [
        x.patient_id,
        {
          id: x.patient_id,
          name: x.patient_name,
          doctor: x.doctor_name,
          date: x.booking_date,
          status: x.status,
        },
      ]),
    ).values(),
  ].filter((x) =>
    `${x.name} ${x.doctor}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>Pasien yang pernah ditangani</h3>
      </div>
      <div className="field">
        <input
          placeholder="Cari nama pasien..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama pasien</th>
              <th>Dokter</th>
              <th>Kunjungan terakhir</th>
              <th>Status terbaru</th>
            </tr>
          </thead>
          <tbody>
            {unique.map((x) => (
              <tr key={x.id}>
                <td>{x.name}</td>
                <td>{x.doctor}</td>
                <td>{String(x.date).slice(0, 10)}</td>
                <td>
                  <Status value={x.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function ReportsPanel({ overview }) {
  const data = overview || {};
  const total = (arr) => arr.reduce((n, x) => n + Number(x.total || 0), 0);
  return (
    <>
      <div className="dash-grid">
        <div className="metric">
          <span>Total pengguna</span>
          <strong>{total(data.users || [])}</strong>
        </div>
        <div className="metric">
          <span>Total janji temu</span>
          <strong>{total(data.appointments || [])}</strong>
        </div>
        <div className="metric">
          <span>Total resep</span>
          <strong>{total(data.pharmacy || [])}</strong>
        </div>
        <div className="metric">
          <span>Dokter aktif</span>
          <strong>{(data.on_duty || []).length}</strong>
        </div>
      </div>
      <div className="grid-two">
        <div className="panel">
          <h3>Janji temu per status</h3>
          {(data.appointments || []).map((x) => (
            <div
              style={{
                padding: "10px 0",
                display: "flex",
                justifyContent: "space-between",
              }}
              key={x.status}
            >
              <span>{statusText[x.status] || x.status}</span>
              <b>{x.total}</b>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Jumlah janji temu per poli</h3>
          {(data.by_poli || []).map((x) => (
            <div
              style={{
                padding: "10px 0",
                display: "flex",
                justifyContent: "space-between",
              }}
              key={x.name}
            >
              <span>{x.name}</span>
              <b>{x.appointment_count}</b>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
function ProfilePanel({ user, onSave }) {
  const [f, setF] = useState({
    full_name: user.full_name,
    phone: user.phone || "",
  });
  return (
    <div className="panel" style={{ maxWidth: 650 }}>
      <h3>Informasi akun</h3>
      <div className="notice" style={{ margin: "14px 0" }}>
        Role: <b>{user.role}</b> · Email: <b>{user.email}</b>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(f);
        }}
      >
        <Field label="Nama lengkap">
          <input
            required
            minLength={3}
            value={f.full_name}
            onChange={(e) => setF({ ...f, full_name: e.target.value })}
          />
        </Field>
        <Field label="Nomor telepon">
          <input
            value={f.phone}
            onChange={(e) => setF({ ...f, phone: e.target.value })}
          />
        </Field>
        <button className="btn btn-primary">Simpan profil</button>
      </form>
    </div>
  );
}

function FeedbackPanel({ onSubmit }) {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [publicConsent, setPublicConsent] = useState(false);
  return (
    <div className="panel" style={{ maxWidth: 650 }}>
      <h3>Bagikan pengalaman layanan</h3>
      <p className="dash-sub" style={{ margin: "8px 0 18px" }}>
        Umpan balik dapat diberikan setelah konsultasi selesai. Ulasan tetap
        privat kecuali Anda menyetujui publikasi anonim.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            rating: Number(rating),
            comment,
            public_consent: publicConsent,
          });
          setComment("");
          setPublicConsent(false);
        }}
      >
        <Field label="Rating layanan">
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">5 — Sangat baik</option>
            <option value="4">4 — Baik</option>
            <option value="3">3 — Cukup</option>
            <option value="2">2 — Kurang</option>
            <option value="1">1 — Buruk</option>
          </select>
        </Field>
        <Field label="Komentar">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ceritakan pengalaman Anda..."
          />
        </Field>
        <label
          className="check-row"
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <input
            type="checkbox"
            style={{ width: "auto", marginTop: 3 }}
            checked={publicConsent}
            onChange={(e) => setPublicConsent(e.target.checked)}
          />
          <span>
            Saya setuju komentar ini ditampilkan secara anonim setelah ditinjau
            Admin. Jangan cantumkan nama atau informasi kesehatan pribadi.
          </span>
        </label>
        <button className="btn btn-primary">Kirim umpan balik</button>
      </form>
    </div>
  );
}

function FeedbackModerationPanel({ data, onReview }) {
  return (
    <div className="panel">
      <h3>Peninjauan cerita pasien</h3>
      <p className="dash-sub" style={{ margin: "8px 0 18px" }}>
        Hanya umpan balik yang disetujui pasien untuk publikasi yang dapat
        ditinjau. Pastikan komentar tidak memuat identitas atau informasi
        kesehatan sebelum menyetujuinya.
      </p>
      {data.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pasien</th>
                <th>Rating</th>
                <th>Komentar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((review) => (
                <tr key={review.id}>
                  <td>{review.full_name}</td>
                  <td>{review.rating}/5</td>
                  <td style={{ maxWidth: 360 }}>{review.comment || "-"}</td>
                  <td>
                    {!review.public_consent
                      ? "Privat"
                      : review.public_status === "pending"
                        ? "Menunggu tinjauan"
                        : review.public_status === "approved"
                          ? "Dipublikasikan"
                          : "Ditolak"}
                  </td>
                  <td>
                    {review.public_consent &&
                      review.public_status === "pending" && (
                        <div className="action-row">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => onReview(review.id, "approved")}
                          >
                            Setujui
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onReview(review.id, "rejected")}
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p role="status">Belum ada umpan balik untuk ditinjau.</p>
      )}
    </div>
  );
}

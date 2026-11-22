import "./globals.css";

export const metadata = {
  title: "MedCare Hospital | Layanan Kesehatan Terintegrasi",
  description: "Portal layanan kesehatan digital: informasi poli, dokter, jadwal, janji temu, rekam medis, dan farmasi."
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diatur di file .env.local");
}

// Gunakan satu pool ketika Next.js melakukan hot reload saat development.
const globalForPg = globalThis;

const pool = globalForPg.medcarePool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

if (process.env.NODE_ENV !== "production") {
  globalForPg.medcarePool = pool;
}

export default pool;

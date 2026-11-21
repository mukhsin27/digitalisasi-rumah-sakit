import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import pool from "@/lib/db";

const COOKIE_NAME = "medcare_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET harus diisi dan minimal 32 karakter.");
  }
  return new TextEncoder().encode(value);
}

export async function createSession(userId) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuer("medcare-hospital")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// Role dibaca ulang dari database agar perubahan role/nonaktif akun berlaku
// pada request berikutnya, bukan hanya mengandalkan isi JWT.
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "medcare-hospital",
      algorithms: ["HS256"]
    });

    if (!payload.sub) return null;

    const result = await pool.query(
      `SELECT id, full_name, username, email, role, poli_id, phone, is_active
       FROM users WHERE id = $1 LIMIT 1`,
      [payload.sub]
    );

    const user = result.rows[0];
    if (!user || !user.is_active) return null;
    return user;
  } catch {
    return null;
  }
}

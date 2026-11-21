
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "medcare_session";

function getSecret() {
  const value = process.env.AUTH_SECRET;

  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET harus diisi dan minimal 32 karakter.");
  }

  return new TextEncoder().encode(value);
}

export async function proxy(request) {
  // 1. Mengambil token dari cookie browser
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 2. Jika cookie tidak ada, arahkan ke halaman login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 3. Memeriksa keaslian dan masa berlaku JWT
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "medcare-hospital",
      algorithms: ["HS256"],
    });

    // 4. Memastikan token memiliki ID pengguna
    if (!payload.sub) {
      throw new Error("Token tidak memiliki identitas pengguna.");
    }

    // 5. Jika token valid, izinkan pengguna melanjutkan
    return NextResponse.next();

  } catch (error) {
    // 6. Jika token tidak valid, arahkan ke login
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    // Hapus cookie yang tidak valid
    response.cookies.delete(COOKIE_NAME);

    return response;
  }
}

// Tentukan halaman yang harus diperiksa oleh Proxy
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

// Pakai di setiap Route Handler yang membutuhkan login dan role tertentu.
export async function requireRole(allowedRoles) {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { ok: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      )
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      user: null,
      response: NextResponse.json(
        { ok: false, message: "Kamu tidak memiliki hak akses untuk tindakan ini." },
        { status: 403 }
      )
    };
  }

  return { user, response: null };
}

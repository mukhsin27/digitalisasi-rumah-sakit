import { NextResponse } from "next/server";

export function badRequest(message, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function safeUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    email: user.email,
    role: user.role,
    poli_id: user.poli_id ?? null,
    phone: user.phone ?? null
  };
}

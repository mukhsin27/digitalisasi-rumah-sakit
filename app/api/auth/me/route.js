import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { safeUser } from "@/lib/http";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user: safeUser(user) });
}

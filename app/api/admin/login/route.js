import { NextResponse } from "next/server";
import {
  buildSessionCookie,
  clearSessionCookie,
  verifyCredentials,
} from "@/lib/auth";

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!(await verifyCredentials(username, password))) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(buildSessionCookie());
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearSessionCookie());
  return res;
}

import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";

export async function GET(request) {
  return NextResponse.json({ authenticated: isAuthed(request) });
}

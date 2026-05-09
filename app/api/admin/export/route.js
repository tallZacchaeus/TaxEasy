import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { QUESTIONS } from "@/lib/questions";
import { isAuthed } from "@/lib/auth";

export async function POST(request) {
  try {
    if (!isAuthed(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("survey_responses")
      .select("id, answers, submitted_at")
      .order("submitted_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const headers = ["id", "submitted_at", ...QUESTIONS.map((q) => q.id)];

    const rows = (data || []).map((r) => {
      const row = [r.id, r.submitted_at];
      for (const q of QUESTIONS) {
        const val = r.answers?.[q.id];
        const safe =
          val === undefined || val === null
            ? ""
            : `"${String(val).replace(/"/g, '""')}"`;
        row.push(safe);
      }
      return row.join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="taxeasy_responses_${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (err) {
    console.error("CSV export error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

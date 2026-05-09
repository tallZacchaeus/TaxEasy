import { NextResponse } from "next/server";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";
import { QUESTIONS, isQuestionVisible } from "@/lib/questions";
import { isAuthed } from "@/lib/auth";

// POST /api/responses - submit a new survey response
export async function POST(request) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid answers" },
        { status: 400 }
      );
    }

    // Validate required & visible questions are answered
    const missingQuestions = QUESTIONS.filter(
      (q) =>
        !q.optional &&
        isQuestionVisible(q, answers) &&
        !(q.id in answers)
    );
    if (missingQuestions.length > 0) {
      return NextResponse.json(
        {
          error: "Some questions are not answered",
          missing: missingQuestions.map((q) => q.id),
        },
        { status: 400 }
      );
    }

    // Drop answers for questions hidden by current showIf, then sanitize text
    const cleaned = { ...answers };
    for (const q of QUESTIONS) {
      if (!isQuestionVisible(q, cleaned)) {
        delete cleaned[q.id];
        continue;
      }
      if (q.type !== "text") continue;
      const raw = cleaned[q.id];
      if (raw === undefined || raw === null) {
        delete cleaned[q.id];
        continue;
      }
      const trimmed = String(raw).slice(0, q.maxLength ?? 500).trim();
      if (!trimmed) delete cleaned[q.id];
      else cleaned[q.id] = trimmed;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("survey_responses")
      .insert([
        {
          answers: cleaned,
          submitted_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to save response" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error("POST /api/responses error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/responses - fetch all responses (admin only)
export async function GET(request) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // Use service role to bypass RLS — admin auth is already enforced above
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("survey_responses")
      .select("id, answers, submitted_at")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch responses" },
        { status: 500 }
      );
    }

    return NextResponse.json({ responses: data || [] });
  } catch (err) {
    console.error("GET /api/responses error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

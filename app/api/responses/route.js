import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { QUESTIONS } from "@/lib/questions";

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

    // Validate that all required questions are answered
    const missingQuestions = QUESTIONS.filter((q) => !(q.id in answers));
    if (missingQuestions.length > 0) {
      return NextResponse.json(
        {
          error: "Some questions are not answered",
          missing: missingQuestions.map((q) => q.id),
        },
        { status: 400 }
      );
    }

    // Insert the response
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("survey_responses")
      .insert([
        {
          answers,
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

// GET /api/responses - fetch all responses (for results page)
export async function GET() {
  try {
    const supabase = getSupabase();
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

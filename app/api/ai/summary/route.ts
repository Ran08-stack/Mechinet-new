import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateCandidateSummary } from "@/lib/openai"

export async function POST(request: NextRequest) {
  try {
    const { candidateId } = await request.json()

    if (!candidateId) {
      return NextResponse.json({ error: "candidateId חסר" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: candidate, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("id", candidateId)
      .single()

    if (error || !candidate) {
      return NextResponse.json({ error: "מועמד לא נמצא" }, { status: 404 })
    }

    const summary = await generateCandidateSummary(
      candidate.full_name,
      candidate.answers as Record<string, unknown>
    )

    await supabase
      .from("candidates")
      .update({ ai_summary: summary })
      .eq("id", candidateId)

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("AI summary error:", error)
    return NextResponse.json({ error: "שגיאה בייצור הסיכום" }, { status: 500 })
  }
}

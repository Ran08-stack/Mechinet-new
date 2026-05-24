import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateCandidateSummary } from "@/lib/openai"

// Rate limit בזיכרון — 20 קריאות לדקה לכל ארגון. מונע spam על OpenAI quota.
// in-memory מתאפס בכל deploy / cold start — מקובל לרמה הזו.
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 20

function checkRate(orgId: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(orgId)
  if (!entry || now > entry.resetAt) {
    rateLimit.set(orgId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_MAX) return false
  entry.count++
  return true
}

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

    if (!checkRate(candidate.organization_id)) {
      return NextResponse.json(
        { error: "יותר מדי בקשות. נסה שוב בעוד דקה." },
        { status: 429 }
      )
    }

    // תרגום id→label על-בסיס fields של הטופס, כדי שה-AI יקבל שאלות בעברית
    const rawAnswers = (candidate.answers ?? {}) as Record<string, unknown>
    const labeledAnswers: Record<string, unknown> = {}
    if (candidate.form_id) {
      const { data: formData } = await supabase
        .from("forms")
        .select("fields")
        .eq("id", candidate.form_id)
        .single()
      if (formData && Array.isArray(formData.fields)) {
        const fields = formData.fields as { id: string; label: string }[]
        for (const f of fields) {
          if (rawAnswers[f.id] !== undefined && rawAnswers[f.id] !== "") {
            labeledAnswers[f.label] = rawAnswers[f.id]
          }
        }
      }
    }
    // קבצים מצורפים — לציין רק כמה ושמות
    const atts = (candidate.attachments ?? []) as { file_name: string }[]
    if (atts.length > 0) {
      labeledAnswers["קבצים שצורפו"] = atts.map((a) => a.file_name).join(", ")
    }

    const summary = await generateCandidateSummary(
      candidate.full_name,
      Object.keys(labeledAnswers).length > 0 ? labeledAnswers : rawAnswers
    )

    await supabase
      .from("candidates")
      .update({ ai_summary: summary, ai_summary_at: new Date().toISOString() })
      .eq("id", candidateId)

    // רישום אירוע פעילות — סיכום AI הופק
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("candidate_events").insert({
      candidate_id: candidateId,
      organization_id: candidate.organization_id,
      type: "ai_summary",
      description: "סיכום AI הופק",
      actor_id: user?.id ?? null,
    })

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("AI summary error:", error)
    return NextResponse.json({ error: "שגיאה בייצור הסיכום" }, { status: 500 })
  }
}

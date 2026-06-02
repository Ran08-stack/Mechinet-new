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

    // בלימת הזיה קשוחה — סיכום AI דורש *תוכן ממשי* על המועמד.
    // טלפון/עיר/ת"ז לבד אינם הצדקה לסיכום אישיותי — ה-AI היה ממציא.
    // תנאי הפקה: יש answers מטופס *או* קבצים מצורפים (קורות חיים וכו').
    const rawAnswersCount = Object.keys(
      (candidate.answers ?? {}) as Record<string, unknown>
    ).filter((k) => {
      const v = (candidate.answers as Record<string, unknown>)[k]
      if (v === "" || v === null || v === undefined) return false
      if (Array.isArray(v) && v.length === 0) return false
      return true
    }).length
    const hasAttachments =
      Array.isArray(candidate.attachments) && candidate.attachments.length > 0
    if (rawAnswersCount === 0 && !hasAttachments) {
      return NextResponse.json(
        {
          error:
            "אין מספיק נתונים להפקת סיכום. המועמד לא מילא טופס וגם לא צורפו לו קבצים. שלח לו קישור לטופס המכינה כדי שימלא.",
        },
        { status: 400 }
      )
    }

    // תרגום id→label על-בסיס fields של הטופס, כדי שה-AI יקבל שאלות בעברית.
    // אבטחה: form_id חייב להיות שייך לאותו ארגון. מונע ערבוב טפסים בין מכינות.
    const rawAnswers = (candidate.answers ?? {}) as Record<string, unknown>
    const labeledAnswers: Record<string, unknown> = {}
    let formName: string | null = null

    if (candidate.form_id) {
      const { data: formData } = await supabase
        .from("forms")
        .select("name, fields, organization_id")
        .eq("id", candidate.form_id)
        .single()
      if (formData) {
        // הגנה כפולה — לוודא שהטופס שייך לארגון של המועמד
        if (formData.organization_id !== candidate.organization_id) {
          return NextResponse.json(
            { error: "טופס לא תואם למכינה" },
            { status: 403 }
          )
        }
        formName = formData.name
        if (Array.isArray(formData.fields)) {
          const fields = formData.fields as { id: string; label: string }[]
          for (const f of fields) {
            const val = rawAnswers[f.id]
            if (val !== undefined && val !== "" && val !== null) {
              labeledAnswers[f.label] = val
            }
          }
        }
      }
    }

    // הוספת שדות אישיים שנשמרים בעמודות הייעודיות —
    // ייתכן שהם מגיעים מהטופס וגם נשמרים שם, אבל גם מועמדים שנוצרו ידנית מקבלים סיכום עשיר
    if (candidate.national_id) labeledAnswers["תעודת זהות"] = candidate.national_id
    if (candidate.phone) labeledAnswers["טלפון"] = candidate.phone
    if (candidate.city) labeledAnswers["עיר מגורים"] = candidate.city
    if (candidate.school) labeledAnswers["בית ספר"] = candidate.school
    if (candidate.birth_date) labeledAnswers["תאריך לידה"] = candidate.birth_date
    if (candidate.gender) labeledAnswers["מגדר"] = candidate.gender

    // קבצים מצורפים — לציין רק כמה ושמות
    const atts = (candidate.attachments ?? []) as { file_name: string }[]
    if (atts.length > 0) {
      labeledAnswers["קבצים שצורפו"] = atts.map((a) => a.file_name).join(", ")
    }

    // הוסף הקשר של הטופס + שלב נוכחי, כדי שה-AI יבין מה התהליך
    if (formName) labeledAnswers["[הקשר] טופס מועמדות"] = formName
    if (candidate.stage) labeledAnswers["[הקשר] שלב נוכחי"] = candidate.stage

    const summary = await generateCandidateSummary(
      candidate.full_name,
      labeledAnswers
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

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/types/database"

// POST /api/council/announcements — יצירת הודעה ארצית ע"י council_admin.
// יעד: all (כל המכינות) / movement (תנועה) / selected (מכינות נבחרות).
// כל שינוי מתועד ב-audit_log. ה-RLS (announcements_council_all) מאמת שוב את ההרשאה.

const TARGET_TYPES = new Set(["all", "movement", "selected"])

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
  if (userRow?.role !== "council_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: {
    title?: string
    body?: string
    targetType?: string
    movementId?: string
    organizationIds?: string[]
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const title = body.title?.trim()
  const text = body.body?.trim()
  const targetType = body.targetType ?? "all"

  if (!title) return NextResponse.json({ error: "חסרה כותרת" }, { status: 400 })
  if (!text) return NextResponse.json({ error: "חסר תוכן" }, { status: 400 })
  if (!TARGET_TYPES.has(targetType)) {
    return NextResponse.json({ error: "יעד לא תקין" }, { status: 400 })
  }

  const movementId = targetType === "movement" ? body.movementId?.trim() || null : null
  if (targetType === "movement" && !movementId) {
    return NextResponse.json({ error: "יש לבחור תנועה" }, { status: 400 })
  }

  const orgIds =
    targetType === "selected"
      ? (body.organizationIds ?? []).filter((s) => typeof s === "string" && s)
      : []
  if (targetType === "selected" && orgIds.length === 0) {
    return NextResponse.json({ error: "יש לבחור לפחות מכינה אחת" }, { status: 400 })
  }

  const { data: created, error: insErr } = await supabase
    .from("announcements")
    .insert({
      title,
      body: text,
      target_type: targetType,
      target_movement_id: movementId,
      created_by: user.id,
    })
    .select("id")
    .single()
  if (insErr || !created) {
    return NextResponse.json({ error: insErr?.message ?? "שמירה נכשלה" }, { status: 500 })
  }

  if (targetType === "selected") {
    const rows = orgIds.map((organization_id) => ({
      announcement_id: created.id,
      organization_id,
    }))
    const { error: tErr } = await supabase.from("announcement_targets").insert(rows)
    if (tErr) {
      return NextResponse.json({ error: tErr.message }, { status: 500 })
    }
  }

  await supabase.from("audit_log").insert({
    action: "announcement.create",
    actor_id: user.id,
    target_type: "announcement",
    target_id: created.id,
    meta: { title, target_type: targetType } as Json,
  })

  return NextResponse.json({ ok: true, id: created.id })
}

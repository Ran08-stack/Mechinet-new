import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { Database, Json } from "@/types/database"

type OrgUpdate = Database["public"]["Tables"]["organizations"]["Update"]

// PATCH: עדכון פרטי מכינה ע"י council_admin בלבד.
// כל שינוי מתועד ב-audit_log עם action תואם.
const ALLOWED_STATUS = new Set(["active", "suspended", "archived"])
const TEXT_FIELDS = ["contact_person", "contact_phone", "region", "city"] as const
const ENUM_FIELDS = {
  gender_policy: ["boys_only", "girls_only", "mixed"],
  religious_policy: ["secular", "religious", "mixed"],
} as const

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const { data: before, error: beforeErr } = await supabase
    .from("organizations")
    .select("contact_person, contact_phone, region, city, status, movement_id, gender_policy, religious_policy")
    .eq("id", id)
    .single()
  if (beforeErr || !before) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const updates: OrgUpdate = {}
  const changes: Record<string, Json> = {}

  for (const f of TEXT_FIELDS) {
    if (f in body) {
      const v = body[f]
      const next = typeof v === "string" && v.trim() ? v.trim() : null
      if (next !== before[f]) {
        updates[f] = next
        changes[f] = { from: before[f], to: next }
      }
    }
  }

  if ("status" in body) {
    const v = body.status
    if (typeof v === "string" && ALLOWED_STATUS.has(v) && v !== before.status) {
      updates.status = v
      changes.status = { from: before.status, to: v }
    }
  }

  if ("movement_id" in body) {
    const v = body.movement_id
    const next = typeof v === "string" && v ? v : null
    if (next !== before.movement_id) {
      updates.movement_id = next
      changes.movement_id = { from: before.movement_id, to: next }
    }
  }

  for (const f of Object.keys(ENUM_FIELDS) as Array<keyof typeof ENUM_FIELDS>) {
    if (f in body) {
      const v = body[f]
      if (typeof v === "string" && (ENUM_FIELDS[f] as readonly string[]).includes(v) && v !== before[f]) {
        updates[f] = v
        changes[f] = { from: before[f], to: v }
      }
    }
  }

  // קואורדינטות (מאיתור מקום) — מספר או null
  for (const f of ["lat", "lng"] as const) {
    if (f in body) {
      const v = body[f]
      updates[f] = typeof v === "number" && Number.isFinite(v) ? v : null
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, noop: true })
  }

  const { error: updErr } = await supabase
    .from("organizations")
    .update(updates)
    .eq("id", id)
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  // בחירת action לפי סוג השינוי
  let action = "org.update"
  if ("status" in changes && Object.keys(changes).length === 1) {
    action = "org.status_change"
  } else if ("movement_id" in changes && Object.keys(changes).length === 1) {
    action = "org.movement_change"
  }

  await supabase.from("audit_log").insert({
    action,
    actor_id: user.id,
    target_type: "organization",
    target_id: id,
    meta: { changes } as Json,
  })

  return NextResponse.json({ ok: true })
}

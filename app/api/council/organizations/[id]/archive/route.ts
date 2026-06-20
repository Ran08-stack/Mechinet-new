import { NextResponse } from "next/server"
import { requireCouncil } from "@/lib/council/guard"
import type { Json } from "@/types/database"

// POST /api/council/organizations/[id]/archive — "מחיקה רכה" של שלוחה.
// status='archived' — השלוחה נעלמת מתצוגות פעילות אבל הנתונים נשמרים, ניתן לשחזר.
// council_admin בלבד.

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await requireCouncil()
  if (!g.ok) return g.res

  const { data: org } = await g.supabase
    .from("organizations")
    .select("id, name, status")
    .eq("id", id)
    .single()
  if (!org) return NextResponse.json({ error: "not_found" }, { status: 404 })

  if (org.status === "archived") {
    return NextResponse.json({ ok: true, noop: true })
  }

  const { error } = await g.supabase.from("organizations").update({ status: "archived" }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await g.supabase.from("audit_log").insert({
    action: "org.archive",
    actor_id: g.userId,
    target_type: "organization",
    target_id: id,
    meta: { name: org.name, prev_status: org.status } as Json,
  })
  return NextResponse.json({ ok: true })
}

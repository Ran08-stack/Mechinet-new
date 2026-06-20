import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireCouncil } from "@/lib/council/guard"
import type { Json } from "@/types/database"

// POST /api/council/users/[id]/reset-password
// שולח למשתמש מייל איפוס סיסמה דרך Supabase Auth (recovery).
// council_admin בלבד. רק לחשבון פעיל (לא חשבון מועצה, ולא חשבון עם הזמנה ממתינה).

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await requireCouncil()
  if (!g.ok) return g.res

  const admin = createAdminClient()
  const { data: target } = await admin
    .from("users")
    .select("id, email, role, organization_id")
    .eq("id", id)
    .single()
  if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (target.role === "council_admin") {
    return NextResponse.json({ error: "לא ניתן לאפס סיסמה לחשבון מועצה" }, { status: 403 })
  }

  // אסור על חשבון עם הזמנה ממתינה — שם משתמשים ב"שלח שוב"
  const { data: pending } = await admin
    .from("invitations")
    .select("id")
    .eq("user_id", id)
    .eq("status", "sent")
    .limit(1)
  if (pending && pending.length > 0) {
    return NextResponse.json({ error: "החשבון טרם הופעל — השתמש ב'שלח שוב הזמנה'" }, { status: 409 })
  }

  // generateLink מסוג recovery — Supabase שולח את המייל אם project SMTP מוגדר.
  const { error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: target.email,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await g.supabase.from("audit_log").insert({
    action: "user.reset_password",
    actor_id: g.userId,
    target_type: "user",
    target_id: id,
    meta: { email: target.email, organization_id: target.organization_id } as Json,
  })

  return NextResponse.json({ ok: true })
}

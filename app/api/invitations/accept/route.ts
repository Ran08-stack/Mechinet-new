import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// POST /api/invitations/accept — נקרא אחרי שהמשתמש קבע סיסמה ב-/welcome.
// מסמן את ההזמנה כ-accepted ומפעיל את השלוחה (pending → active).

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = createAdminClient()

  const { data: inv } = await admin
    .from("invitations")
    .select("id, organization_id")
    .eq("user_id", user.id)
    .eq("status", "sent")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (inv) {
    await admin
      .from("invitations")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", inv.id)
    // הפעלת השלוחה רק אם הייתה pending (לא לדרוס active/suspended)
    await admin
      .from("organizations")
      .update({ status: "active" })
      .eq("id", inv.organization_id)
      .eq("status", "pending")
  }

  return NextResponse.json({ ok: true })
}

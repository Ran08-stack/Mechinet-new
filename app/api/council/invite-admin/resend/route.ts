import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { provisionOrgAdmin } from "@/lib/provisioning/provisionOrgAdmin"

// POST /api/council/invite-admin/resend — שליחה חוזרת של הזמנה לחשבון שטרם הופעל.
// council_admin בלבד. body: { userId }.
// מאחר שאין שירות מייל משלנו, "שליחה חוזרת" = מחיקת החשבון שטרם הופעל (אין לו דאטה,
// last_login_at ריק) והזמנה מחדש → מייל הזמנה טרי מ-Supabase.

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

  let body: { userId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }
  const userId = body.userId?.trim()
  if (!userId) return NextResponse.json({ error: "חסר מזהה משתמש" }, { status: 400 })

  const admin = createAdminClient()

  const { data: target } = await admin
    .from("users")
    .select("id, email, full_name, role, organization_id, last_login_at")
    .eq("id", userId)
    .single()
  if (!target || !target.organization_id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  if (target.last_login_at) {
    return NextResponse.json(
      { error: "המשתמש כבר הפעיל את החשבון" },
      { status: 409 }
    )
  }

  // מחיקת החשבון שטרם הופעל (auth + ניקוי שאריות), ואז הזמנה מחדש
  await admin.auth.admin.deleteUser(userId)
  await admin.from("invitations").delete().eq("user_id", userId)
  await admin.from("users").delete().eq("id", userId)

  const result = await provisionOrgAdmin({
    email: target.email,
    fullName: target.full_name ?? "",
    organizationId: target.organization_id,
    role: target.role === "org_staff" ? "org_staff" : "org_admin",
    createdBy: user.id,
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json(result)
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { provisionOrgAdmin } from "@/lib/provisioning/provisionOrgAdmin"

// POST /api/council/invite-admin — הזמנת ראש שלוחה ע"י council_admin.
// יוצר חשבון auth, שולח מייל הזמנה, ומסמן את השלוחה כ-pending
// (ההתחברות הראשונה תהפוך אותה ל-active דרך /api/invitations/accept).

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

  let body: { organizationId?: string; email?: string; fullName?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const organizationId = body.organizationId?.trim()
  const email = body.email?.trim()
  const fullName = body.fullName?.trim() ?? ""

  if (!organizationId) {
    return NextResponse.json({ error: "חסר מזהה שלוחה" }, { status: 400 })
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "כתובת מייל לא תקינה" }, { status: 400 })
  }

  const result = await provisionOrgAdmin({
    email,
    fullName,
    organizationId,
    role: "org_admin",
    createdBy: user.id,
  })

  if (!result.ok) {
    const msg = /registered|already|exists|duplicate/i.test(result.error)
      ? "כתובת המייל כבר רשומה במערכת"
      : result.error
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // סימון השלוחה כ-pending (אם לא כבר active) + שמירת שם הראש כאיש קשר על השלוחה
  // (כדי שיוצג בדף המכינה — המייל מוצג מתוך חשבון המשתמש).
  const admin = createAdminClient()
  const orgUpdate: { status: string; contact_person?: string } = { status: "pending" }
  if (fullName) orgUpdate.contact_person = fullName
  await admin
    .from("organizations")
    .update(orgUpdate)
    .eq("id", organizationId)
    .neq("status", "active")

  return NextResponse.json(result)
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// POST /api/team — יצירת איש צוות חדש למכינה של המנהל המחובר.
// body: { email, password, fullName }

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: me } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (
    !me ||
    !(me.role === "admin" || me.role === "org_admin") ||
    !me.organization_id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const email = (body?.email ?? "").trim().toLowerCase()
  const password = body?.password ?? ""
  const fullName = (body?.fullName ?? "").trim()
  const phone = (body?.phone ?? "").replace(/\D/g, "").slice(0, 10)
  const rawRole = body?.role
  const role: "admin" | "org_staff" =
    rawRole === "admin" ? "admin" : "org_staff"
  const roleLabel =
    typeof body?.roleLabel === "string" ? body.roleLabel.trim() : ""

  if (!email || !password) {
    return NextResponse.json({ error: "אימייל וסיסמה חובה" }, { status: 400 })
  }
  if (!phone || phone.length < 9) {
    return NextResponse.json({ error: "טלפון חובה" }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "סיסמה חייבת להיות לפחות 6 תווים" }, { status: 400 })
  }

  const admin = createAdminClient()

  // יצירת auth user
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  })
  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "שגיאה ביצירת המשתמש" },
      { status: 400 }
    )
  }

  // ה-trigger יוצר רשומה אוטומטית ב-public.users — נשלים פרטים.
  const { error: updateError } = await admin
    .from("users")
    .upsert({
      id: created.user.id,
      email,
      full_name: fullName || null,
      phone,
      organization_id: me.organization_id,
      role,
      role_label: roleLabel || null,
    })
  // אם הוזן תפקיד מותאם חדש — לרשום אוטומטית גם ברשימת ההגדרות
  if (roleLabel) {
    await admin
      .from("org_role_labels")
      .insert({ organization_id: me.organization_id, name: roleLabel })
      .select()
      // התעלמות משגיאת unique — קיים כבר
  }
  if (updateError) {
    // rollback של auth user
    await admin.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, userId: created.user.id })
}

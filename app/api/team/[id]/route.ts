import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// DELETE /api/team/[id] — מחיקת איש צוות מהמכינה של המנהל.
// PATCH /api/team/[id] — עדכון פרטי / סיסמה.

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized", status: 401 as const }
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
    return { error: "Forbidden", status: 403 as const }
  }
  return { me, currentUserId: user.id }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const auth = await requireAdmin()
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (id === auth.currentUserId) {
    return NextResponse.json({ error: "לא ניתן למחוק את עצמך" }, { status: 400 })
  }

  const admin = createAdminClient()

  // בדיקה שהמשתמש למחיקה שייך לאותה מכינה
  const { data: target } = await admin
    .from("users")
    .select("organization_id, role")
    .eq("id", id)
    .single()
  if (!target || target.organization_id !== auth.me.organization_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (target.role === "admin") {
    return NextResponse.json({ error: "לא ניתן למחוק מנהל" }, { status: 400 })
  }

  // מחיקת auth user — CASCADE על public.users (FK ל-auth.users)
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const auth = await requireAdmin()
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => null)
  const fullName = body?.fullName?.trim()
  const phone = body?.phone
  const password = body?.password
  const role = body?.role
  const roleLabel = body?.roleLabel

  const admin = createAdminClient()

  const { data: target } = await admin
    .from("users")
    .select("organization_id, role")
    .eq("id", id)
    .single()
  if (!target || target.organization_id !== auth.me.organization_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const updates: {
    full_name?: string | null
    phone?: string | null
    role?: string
    role_label?: string | null
  } = {}
  if (fullName !== undefined) updates.full_name = fullName || null
  if (phone !== undefined) {
    const cleaned = String(phone).replace(/\D/g, "").slice(0, 10)
    updates.phone = cleaned || null
  }
  if (roleLabel !== undefined) {
    const trimmed = typeof roleLabel === "string" ? roleLabel.trim() : ""
    updates.role_label = trimmed || null
  }
  if (role !== undefined) {
    if (!["admin", "org_staff"].includes(role)) {
      return NextResponse.json({ error: "תפקיד לא חוקי" }, { status: 400 })
    }
    if (id === auth.currentUserId && role !== "admin") {
      return NextResponse.json(
        { error: "לא ניתן להוריד את התפקיד של עצמך" },
        { status: 400 }
      )
    }
    updates.role = role
  }

  if (Object.keys(updates).length) {
    const { error } = await admin.from("users").update(updates).eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // אם הוזן תפקיד מותאם חדש — לרשום אוטומטית גם ברשימת ההגדרות
  if (updates.role_label && auth.me.organization_id) {
    await admin
      .from("org_role_labels")
      .insert({
        organization_id: auth.me.organization_id,
        name: updates.role_label,
      })
      .select()
      // התעלמות משגיאת unique — קיים כבר
  }

  if (password) {
    if (String(password).length < 6) {
      return NextResponse.json({ error: "סיסמה לפחות 6 תווים" }, { status: 400 })
    }
    const { error } = await admin.auth.admin.updateUserById(id, { password })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

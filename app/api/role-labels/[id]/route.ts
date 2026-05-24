import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// DELETE /api/role-labels/[id] — מחיקת תפקיד מותאם.
// בנוסף, איפוס role_label לכל משתמשי המכינה ששויכו לתפקיד הזה.

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
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
    !me.organization_id ||
    !(me.role === "admin" || me.role === "org_admin")
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const admin = createAdminClient()

  const { data: target } = await admin
    .from("org_role_labels")
    .select("id, name, organization_id")
    .eq("id", id)
    .single()
  if (!target || target.organization_id !== me.organization_id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // איפוס role_label לכל המשתמשים ששויכו לתפקיד הזה
  await admin
    .from("users")
    .update({ role_label: null })
    .eq("organization_id", me.organization_id)
    .eq("role_label", target.name)

  const { error } = await admin
    .from("org_role_labels")
    .delete()
    .eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}

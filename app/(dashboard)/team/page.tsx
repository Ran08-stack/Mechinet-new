import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Topbar } from "../_components/Topbar"
import { TeamManager, type TeamMember } from "@/components/team/TeamManager"

// מסך ניהול צוות — רק admin של מכינה.

export default async function TeamPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: me } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (!me || !me.organization_id) {
    return (
      <>
        <Topbar crumb="אנשי צוות" />
        <div className="px-7 py-10 text-[13px] text-fg-muted">
          אין הרשאה לצפייה.
        </div>
      </>
    )
  }

  const isAdmin = me.role === "admin" || me.role === "org_admin"

  const { data: members } = await supabase
    .from("users")
    .select("id, email, phone, full_name, role, role_label, created_at")
    .eq("organization_id", me.organization_id)
    .order("role", { ascending: true })
    .order("email", { ascending: true })

  const { data: roleLabels } = await supabase
    .from("org_role_labels")
    .select("name")
    .eq("organization_id", me.organization_id)
    .order("name")

  // last_sign_in_at: רק admin שולף — מצריך service_role.
  // listUsers בקריאה אחת במקום N+1
  let lastSignInMap: Map<string, string | null> = new Map()
  if (isAdmin) {
    const admin = createAdminClient()
    // perPage 1000 — מספיק לכל מכינה. אם יותר — pagination בעתיד.
    const { data: authList } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })
    for (const au of authList?.users ?? []) {
      lastSignInMap.set(au.id, au.last_sign_in_at ?? null)
    }
  }

  const enriched: TeamMember[] = (members ?? []).map((m) => ({
    id: m.id,
    email: m.email,
    phone: m.phone,
    full_name: m.full_name,
    role: m.role,
    role_label: m.role_label,
    created_at: m.created_at,
    last_sign_in_at: isAdmin ? lastSignInMap.get(m.id) ?? null : null,
  }))

  return (
    <>
      <Topbar crumb="אנשי צוות" />
      <div className="px-7 py-6">
        <div className="mb-5">
          <h1 className="m-0 text-[24px] font-semibold text-primary">
            אנשי צוות
          </h1>
          <p className="mt-1 text-[13px] text-fg-muted">
            {isAdmin
              ? "יצירה וניהול של משתמשי המכינה. כל איש צוות נכנס עם המייל והסיסמה שתגדיר."
              : "רשימת אנשי הצוות במכינה. לחיפוש איש צוות לפי שם או אימייל."}
          </p>
        </div>
        <TeamManager
          currentUserId={user.id}
          initialMembers={enriched}
          roleLabels={(roleLabels ?? []).map((l) => l.name)}
          readOnly={!isAdmin}
        />
      </div>
    </>
  )
}

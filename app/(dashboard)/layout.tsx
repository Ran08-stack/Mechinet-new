import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Shell } from "./_components/Shell"
import { Toaster } from "@/components/ui/Toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // נתוני המשתמש + המכינה לתצוגה בכותרת ה-sidebar
  const { data: userData } = await supabase
    .from("users")
    .select("full_name, email, role, role_label, organization_id")
    .eq("id", user.id)
    .single()

  const { data: org } = userData?.organization_id
    ? await supabase
        .from("organizations")
        .select("name, branch_name, logo_url")
        .eq("id", userData.organization_id)
        .maybeSingle()
    : { data: null }

  const accountName =
    userData?.full_name?.trim() ||
    userData?.email?.split("@")[0] ||
    ""

  const baseRoleLabel =
    userData?.role === "admin" || userData?.role === "org_admin"
      ? "ראש שלוחה"
      : "איש צוות"
  const roleLabel = userData?.role_label?.trim() || baseRoleLabel

  return (
    <Toaster>
      <Shell
        accountName={accountName}
        roleLabel={roleLabel}
        orgName={org?.name ?? null}
        branchName={org?.branch_name ?? null}
        orgLogoUrl={org?.logo_url ?? null}
      >
        {children}
      </Shell>
    </Toaster>
  )
}

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "./_components/Sidebar"

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

  const { data: userRow } = await supabase
    .from("users")
    .select("organization_id, email")
    .eq("id", user.id)
    .maybeSingle()

  const { data: org } = userRow?.organization_id
    ? await supabase
        .from("organizations")
        .select("name, logo_url")
        .eq("id", userRow.organization_id)
        .maybeSingle()
    : { data: null }

  return (
    <div
      className="grid min-h-screen grid-cols-[248px_1fr] bg-bg font-sans text-fg"
      dir="rtl"
    >
      <Sidebar
        orgName={org?.name ?? "מכינה"}
        orgLogoUrl={org?.logo_url ?? null}
        userEmail={userRow?.email ?? user.email ?? ""}
      />
      <main className="flex min-h-screen flex-col overflow-auto">
        {children}
      </main>
    </div>
  )
}

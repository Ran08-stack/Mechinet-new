import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CouncilSidebar } from "./_components/CouncilSidebar"
import { CouncilTopbar } from "./_components/CouncilTopbar"

export default async function CouncilLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // רק council_admin רשאי כאן
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (userData?.role !== "council_admin") {
    redirect("/dashboard")
  }

  const { data: profileRow } = await supabase
    .from("council_settings")
    .select("value")
    .eq("key", "council_profile")
    .maybeSingle()
  const profile = (profileRow?.value ?? {}) as { name?: string; logo_url?: string | null }
  const brandName = profile.name?.trim() || "מועצת המכינות"
  const brandLogoUrl = typeof profile.logo_url === "string" && profile.logo_url ? profile.logo_url : null

  return (
    <div
      className="grid min-h-screen grid-cols-[248px_1fr] bg-bg font-sans text-fg"
      dir="rtl"
    >
      <CouncilSidebar brandName={brandName} brandLogoUrl={brandLogoUrl} />
      <main className="flex min-h-screen flex-col overflow-auto">
        <CouncilTopbar />
        {children}
      </main>
    </div>
  )
}

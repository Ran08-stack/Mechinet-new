import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CouncilSidebar } from "./_components/CouncilSidebar"

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

  return (
    <div
      className="grid min-h-screen grid-cols-[248px_1fr] bg-bg font-sans text-fg"
      dir="rtl"
    >
      <CouncilSidebar />
      <main className="flex min-h-screen flex-col overflow-auto">
        {children}
      </main>
    </div>
  )
}

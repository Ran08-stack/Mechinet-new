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

  return (
    <div
      className="grid min-h-screen grid-cols-[248px_1fr] bg-bg font-sans text-fg"
      dir="rtl"
    >
      <Sidebar />
      <main className="flex min-h-screen flex-col overflow-auto">
        {children}
      </main>
    </div>
  )
}

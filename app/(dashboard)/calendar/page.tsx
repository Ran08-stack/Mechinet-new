import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CalendarView from "@/components/calendar/CalendarView"

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!userData?.organization_id) {
    return (
      <div className="px-7 py-7">
        <p className="text-[13px] text-fg-muted">
          לא נמצאה מכינה מחוברת לחשבון זה.
        </p>
      </div>
    )
  }

  const [{ data: interviews }, { data: candidates }] = await Promise.all([
    supabase
      .from("interviews")
      .select("*, candidates(full_name)")
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("candidates")
      .select("*")
      .order("full_name", { ascending: true }),
  ])

  return (
    <CalendarView
      initialInterviews={interviews ?? []}
      candidates={candidates ?? []}
      organizationId={userData.organization_id}
    />
  )
}

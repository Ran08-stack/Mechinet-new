import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CalendarView from "@/components/calendar/CalendarView"
import { Topbar } from "../_components/Topbar"

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
      <div className="px-3 py-4 md:px-7 md:py-7">
        <p className="text-[13px] text-fg-muted">
          לא נמצאה מכינה מחוברת לחשבון זה.
        </p>
      </div>
    )
  }

  const [
    { data: interviews },
    { data: candidates },
    { data: members },
    { data: stages },
  ] = await Promise.all([
    supabase
      .from("interviews")
      .select("*, candidates(full_name)")
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("candidates")
      .select("*")
      .order("full_name", { ascending: true }),
    supabase
      .from("users")
      .select("id, full_name, email")
      .eq("organization_id", userData.organization_id),
    supabase
      .from("pipeline_stages")
      .select("name, order_index")
      .eq("organization_id", userData.organization_id)
      .order("order_index"),
  ])

  // ממתינים לזימון: מועמדים בכל שלב שמכיל "ראיון" בשם (case insensitive),
  // או שלב שני בסדר אם אין שלב כזה — שלא נישבר בשינוי שם.
  const stageList = stages ?? []
  const interviewStage =
    stageList.find((s) => s.name.includes("ראיון"))?.name ??
    stageList[1]?.name ??
    null
  const scheduledCandidateIds = new Set(
    (interviews ?? [])
      .filter((i) => i.status === "scheduled")
      .map((i) => i.candidate_id)
  )
  const pendingCandidates = interviewStage
    ? (candidates ?? []).filter(
        (c) => c.stage === interviewStage && !scheduledCandidateIds.has(c.id)
      )
    : []

  return (
    <>
      <Topbar crumb="יומן" />
      <CalendarView
        initialInterviews={interviews ?? []}
        candidates={candidates ?? []}
        interviewers={members ?? []}
        pendingCandidates={pendingCandidates}
        organizationId={userData.organization_id}
      />
    </>
  )
}

import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import EvaluationForm from "@/components/interviews/EvaluationForm"

export default async function EvaluatePage({
  params,
}: {
  params: { id: string }
}) {
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

  // הראיון + שם המועמד
  const { data: interview } = await supabase
    .from("interviews")
    .select("*, candidates(full_name)")
    .eq("id", params.id)
    .single()

  if (!interview) notFound()

  // הערכה קיימת (אם יש)
  const { data: existing } = await supabase
    .from("interview_evaluations")
    .select("*")
    .eq("interview_id", params.id)
    .maybeSingle()

  const candidateName =
    (interview.candidates as { full_name: string } | null)?.full_name ??
    "מועמד"

  return (
    <div>
      {/* נתיב */}
      <div className="flex h-[60px] items-center gap-3.5 border-b border-line bg-surface px-7">
        <div className="flex items-center gap-2 text-[13px] text-fg-subtle">
          <Link href="/calendar" className="hover:text-fg">
            יומן
          </Link>
          <span className="text-[var(--fg-faint)]">/</span>
          <span className="font-medium text-fg">הערכת ראיון</span>
        </div>
        <Link
          href="/calendar"
          className="ms-auto inline-flex items-center gap-1.5 text-[13px] text-fg-muted hover:text-fg"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          חזרה ליומן
        </Link>
      </div>

      <EvaluationForm
        interviewId={interview.id}
        organizationId={userData.organization_id}
        candidateName={candidateName}
        existing={existing ?? null}
      />
    </div>
  )
}

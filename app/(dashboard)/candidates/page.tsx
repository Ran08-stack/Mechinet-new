import { createClient } from "@/lib/supabase/server"
import { Topbar } from "@/app/(dashboard)/_components/Topbar"
import CandidatesTable from "@/components/candidates/CandidatesTable"
import NewCandidateButton from "@/components/candidates/NewCandidateButton"
import { getStages } from "@/lib/stages"
import { PipelineStage } from "@/types/database"

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { stage?: string }
}) {
  const supabase = await createClient()
  const initialStage = searchParams?.stage ?? "all"

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user?.id ?? "")
    .single()

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false })

  const { data: forms } = await supabase
    .from("forms")
    .select("id, name")
    .eq("organization_id", userData?.organization_id ?? "")
    .order("created_at", { ascending: false })

  const list = candidates ?? []

  // טעינת שלבי הצנרת של המכינה
  let stages: PipelineStage[] = []
  if (userData?.organization_id) {
    stages = await getStages(userData.organization_id)
  }

  // סטטיסטיקות לכותרת — לפי שלב ברירת מחדל וסופי דינמיים
  const totalStages = stages.length
  const midStage = stages[Math.floor(totalStages / 2)]
  const lastStage = stages[totalStages - 1]
  const inMid = midStage ? list.filter((c) => c.stage === midStage.name).length : 0
  const inLast = lastStage ? list.filter((c) => c.stage === lastStage.name).length : 0

  const stats = [
    { v: list.length, k: "סך מועמדים" },
    { v: inMid, k: midStage?.name ?? "—" },
    { v: inLast, k: lastStage?.name ?? "—" },
  ]

  return (
    <>
      <Topbar
        crumb="מועמדים"
        action={
          userData?.organization_id ? (
            <NewCandidateButton
              organizationId={userData.organization_id}
              stages={stages}
              forms={forms ?? []}
            />
          ) : null
        }
      />

      <div className="pb-14">
        {/* כותרת העמוד */}
        <div className="flex flex-wrap items-end justify-between gap-6 px-7 pb-[18px] pt-7">
          <div>
            <h1 className="m-0 text-[24px] font-semibold leading-[34px] tracking-[-0.015em] text-primary">
              מועמדים
            </h1>
            <p className="mt-1.5 text-[13px] text-fg-muted">
              כל המועמדים בתהליך הגיוס של המכינה.
            </p>
          </div>

          {/* סטטיסטיקות */}
          <div className="flex items-center gap-7">
            {stats.map((s, i) => (
              <div key={s.k} className="flex items-center gap-7">
                {i > 0 && <div className="h-7 w-px bg-line" />}
                <div className="text-end">
                  <div className="text-[20px] font-semibold tracking-[-0.01em] [font-variant-numeric:tabular-nums]">
                    {s.v}
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
                    {s.k}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CandidatesTable candidates={list} stages={stages} initialStage={initialStage} />
      </div>
    </>
  )
}

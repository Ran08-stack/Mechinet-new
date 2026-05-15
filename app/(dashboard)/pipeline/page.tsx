import { createClient } from "@/lib/supabase/server"
import KanbanBoard from "@/components/pipeline/KanbanBoard"

export default async function PipelinePage() {
  const supabase = await createClient()

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .order("created_at", { ascending: false })

  const list = candidates ?? []

  return (
    <div className="flex h-full flex-col">
      {/* כותרת העמוד */}
      <div className="flex flex-wrap items-end justify-between gap-5 px-7 pb-[18px] pt-7">
        <div>
          <h1 className="m-0 text-[24px] font-semibold leading-[34px] tracking-[-0.015em] text-primary">
            פייפליין
          </h1>
          <p className="mt-1.5 text-[13px] text-fg-muted">
            ניהול מועמדים לפי שלבי הקבלה. העבר בין שלבים בלחיצה.
          </p>
        </div>
        <span className="font-mono text-[11.5px] text-fg-subtle">
          {list.length} מועמדים
        </span>
      </div>

      <KanbanBoard initialCandidates={list} />
    </div>
  )
}

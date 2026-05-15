import { createClient } from "@/lib/supabase/server"
import { List, Columns3 } from "lucide-react"
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
          <h1 className="m-0 text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
            פייפליין
          </h1>
          <p className="mt-2 text-[15px] text-fg-muted">
            {list.length} מועמדים בתהליך · העבר כרטיס בין שלבים בלחיצה.
          </p>
        </div>

        {/* מתג תצוגה */}
        <div className="inline-flex gap-0.5 rounded-md border border-line bg-[var(--bg-subtle)] p-[3px]">
          <button className="inline-flex h-[30px] items-center gap-1.5 rounded px-3 text-[13px] text-fg-muted">
            <List className="h-3.5 w-3.5" />
            טבלה
          </button>
          <button className="inline-flex h-[30px] items-center gap-1.5 rounded bg-surface px-3 text-[13px] font-medium text-primary shadow-[var(--shadow-xs)]">
            <Columns3 className="h-3.5 w-3.5" />
            פייפליין
          </button>
        </div>
      </div>

      <KanbanBoard initialCandidates={list} />
    </div>
  )
}

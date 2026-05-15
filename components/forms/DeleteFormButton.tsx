"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

export default function DeleteFormButton({ formId }: { formId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from("forms").delete().eq("id", formId)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[11.5px] text-fg-subtle">למחוק?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded border border-[var(--stage-rejected-line)] bg-[var(--stage-rejected-bg)] px-2 py-1 text-[11.5px] text-[var(--stage-rejected-fg)] disabled:opacity-60"
        >
          {deleting ? "מוחק…" : "כן"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded border border-line px-2 py-1 text-[11.5px] text-fg-muted hover:bg-[var(--bg-subtle)]"
        >
          ביטול
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-grid h-[30px] w-[30px] place-items-center rounded-md border border-line bg-surface text-[var(--fg-faint)] transition-colors hover:border-[var(--stage-rejected-line)] hover:bg-[var(--stage-rejected-bg)] hover:text-[var(--stage-rejected-fg)]"
      aria-label="מחק טופס"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  )
}

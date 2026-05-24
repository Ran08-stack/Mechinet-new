"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { logCandidateEvent } from "@/lib/events"
import { AlertCircle, Check } from "lucide-react"

export default function NotesEditor({
  candidateId,
  organizationId,
  initialNotes,
}: {
  candidateId: string
  organizationId: string
  initialNotes: string
}) {
  const [notes, setNotes] = useState(initialNotes)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [saving, setSaving] = useState(false)
  const [lastSavedValue, setLastSavedValue] = useState(initialNotes)

  const dirty = notes !== lastSavedValue

  // אזהרה לפני יציאה מהדף אם יש שינויים לא שמורים
  useEffect(() => {
    if (!dirty) return
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [dirty])

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from("candidates").update({ notes }).eq("id", candidateId)
    await logCandidateEvent({
      candidateId,
      organizationId,
      type: "note_added",
      description: "הערה עודכנה",
    })
    setLastSavedValue(notes)
    setSavedAt(new Date())
    setSaving(false)
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="הוסף הערות על המועמד…"
        rows={4}
        dir="rtl"
        className="w-full resize-none rounded-md border border-line bg-surface px-3.5 py-3 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px]">
          {dirty ? (
            <span className="inline-flex items-center gap-1 text-fg-subtle">
              <AlertCircle className="h-3 w-3" />
              שינויים לא שמורים
            </span>
          ) : savedAt ? (
            <span className="inline-flex items-center gap-1 text-[var(--stage-accepted-fg)]">
              <Check className="h-3 w-3" />
              נשמר
            </span>
          ) : null}
        </span>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex h-8 items-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--primary-3)] disabled:opacity-60"
        >
          {saving ? "שומר…" : "שמור"}
        </button>
      </div>
    </div>
  )
}

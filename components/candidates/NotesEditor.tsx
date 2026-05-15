"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { logCandidateEvent } from "@/lib/events"

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
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

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
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value)
          setSaved(false)
        }}
        placeholder="הוסף הערות על המועמד…"
        rows={4}
        dir="rtl"
        className="w-full resize-none rounded-md border border-line bg-surface px-3.5 py-3 text-[13px] text-fg outline-none transition-colors placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-fg-subtle">
          {saved ? "נשמר" : ""}
        </span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-8 items-center rounded-md bg-primary px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--primary-3)] disabled:opacity-60"
        >
          {saving ? "שומר…" : "שמור"}
        </button>
      </div>
    </div>
  )
}

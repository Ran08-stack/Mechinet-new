"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, X, Tag, AlertTriangle } from "lucide-react"

type RoleLabel = {
  id: string
  organization_id: string
  name: string
  created_at: string | null
}

// תפקידים מותאמים אישית — תוויות שאפשר לשייך לאנשי צוות.
// השמירה רק תצוגתית: ה-role הבסיסי (admin/org_staff) קובע הרשאות.

export function RoleLabelsEditor({
  initialLabels,
  organizationId,
}: {
  initialLabels: RoleLabel[]
  organizationId: string
}) {
  const router = useRouter()
  const [labels, setLabels] = useState<RoleLabel[]>(initialLabels)
  const [newName, setNewName] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<RoleLabel | null>(null)

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    setBusy(true)
    setErr("")
    const supabase = createClient()
    const { data, error } = await supabase
      .from("org_role_labels")
      .insert({ organization_id: organizationId, name })
      .select()
      .single()
    setBusy(false)
    if (error) {
      setErr(
        error.code === "23505" ? "תפקיד עם שם זה כבר קיים" : error.message
      )
      return
    }
    if (data) setLabels((prev) => [...prev, data])
    setNewName("")
    router.refresh()
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-[var(--line-faint)] px-[18px] py-3.5">
        <h2 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
          <Tag className="h-4 w-4 text-[var(--fg-faint)]" />
          תפקידי צוות מותאמים
        </h2>
        <p className="mt-0.5 text-[12px] text-fg-subtle">
          תפקידים שתגדיר כאן יופיעו כתגית באנשי הצוות. ההרשאות לא משתנות —
          זו תווית תצוגה בלבד.
        </p>
      </div>

      <div className="p-[18px]">
        {labels.length === 0 ? (
          <p className="m-0 mb-3 text-[12.5px] text-fg-subtle">
            אין תפקידים עדיין. הוסף את הראשון.
          </p>
        ) : (
          <div className="mb-3 flex flex-wrap gap-2">
            {labels.map((l) => (
              <span
                key={l.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[var(--bg-subtle)] py-1 ps-3 pe-1.5 text-[12.5px] text-fg"
              >
                {l.name}
                <button
                  onClick={() => setConfirmDelete(l)}
                  className="inline-grid h-5 w-5 place-items-center rounded-full text-fg-subtle hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                  title="מחק"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <form onSubmit={add} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder='לדוגמה: "מראיין", "רכז גיוס"'
            className="h-9 flex-1 rounded-md border border-line bg-surface px-3 text-[13px] outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
          />
          <button
            type="submit"
            disabled={busy || !newName.trim()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            הוסף תפקיד
          </button>
        </form>
        {err && <p className="mt-2 text-[12px] text-[var(--danger)]">{err}</p>}
      </div>

      {confirmDelete && (
        <DeleteConfirm
          label={confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onDeleted={() => {
            setLabels((prev) => prev.filter((l) => l.id !== confirmDelete.id))
            setConfirmDelete(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function DeleteConfirm({
  label,
  onClose,
  onDeleted,
}: {
  label: RoleLabel
  onClose: () => void
  onDeleted: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  async function confirm() {
    setBusy(true)
    setErr("")
    const res = await fetch(`/api/role-labels/${label.id}`, {
      method: "DELETE",
    })
    setBusy(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setErr(j.error ?? "שגיאה במחיקה")
      return
    }
    onDeleted()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "var(--overlay)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <h2 className="m-0 text-[15px] font-semibold text-primary">
              למחוק את התפקיד &ldquo;{label.name}&rdquo;?
            </h2>
            <p className="mt-1 text-[12.5px] text-fg-muted">
              התפקיד יוסר אוטומטית מכל אנשי הצוות שהיו משויכים אליו. ההרשאות
              שלהם לא ישתנו.
            </p>
            {err && (
              <p className="mt-2 text-[12px] text-[var(--danger)]">{err}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[var(--line-faint)] bg-[var(--bg-subtle)] px-4 py-3">
          <button
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-surface"
          >
            ביטול
          </button>
          <button
            onClick={confirm}
            disabled={busy}
            className="inline-flex h-9 items-center rounded-md bg-[var(--danger)] px-4 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "מוחק…" : "מחק תפקיד"}
          </button>
        </div>
      </div>
    </div>
  )
}

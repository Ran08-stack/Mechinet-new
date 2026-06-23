"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Flag, Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react"

type Row = { id: string; name: string; slug: string | null; branchCount: number }

export function MovementsCard({ movements }: { movements: Row[] }) {
  const router = useRouter()
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function add() {
    const name = newName.trim()
    if (!name) return
    setAdding(true)
    setError("")
    const res = await fetch("/api/council/settings/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setAdding(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(`יצירה נכשלה: ${j.error ?? res.status}`)
      return
    }
    setNewName("")
    router.refresh()
  }

  async function rename(id: string) {
    const name = editName.trim()
    if (!name) return
    setBusyId(id)
    setError("")
    const res = await fetch(`/api/council/settings/movements/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setBusyId(null)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(`עדכון נכשל: ${j.error ?? res.status}`)
      return
    }
    setEditId(null)
    router.refresh()
  }

  async function remove(row: Row) {
    const msg = row.branchCount > 0
      ? `למחוק את "${row.name}"? ${row.branchCount} שלוחות ישויכו ל"ללא תנועה".`
      : `למחוק את "${row.name}"?`
    if (!confirm(msg)) return
    setBusyId(row.id)
    setError("")
    const res = await fetch(`/api/council/settings/movements/${row.id}`, { method: "DELETE" })
    setBusyId(null)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(`מחיקה נכשלה: ${j.error ?? res.status}`)
      return
    }
    router.refresh()
  }

  const input = "h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
  const iconBtn = "inline-grid h-8 w-8 place-items-center rounded-md border border-line bg-surface text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg disabled:opacity-50"

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-[var(--line-faint)] px-5 py-3.5">
        <h2 className="m-0 inline-flex items-center gap-2 text-[14px] font-semibold text-primary">
          <Flag className="h-4 w-4 text-fg-faint" />
          תנועות נוער ({movements.length})
        </h2>
        <p className="m-0 mt-0.5 text-[12px] text-fg-muted">משויכות לשלוחות; משמשות לסינון בדשבורד, בהודעות ובדוחות.</p>
      </div>

      <div className="flex flex-col">
        {movements.length === 0 ? (
          <p className="m-0 px-5 py-8 text-center text-[13px] text-fg-muted">אין תנועות. הוסף תנועה ראשונה.</p>
        ) : (
          movements.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-[var(--line-faint)] px-5 py-2.5 last:border-b-0">
              {editId === m.id ? (
                <input
                  className={`${input} flex-1`}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") rename(m.id); if (e.key === "Escape") setEditId(null) }}
                  autoFocus
                />
              ) : (
                <div className="flex-1">
                  <span className="text-[13px] font-medium text-fg">{m.name}</span>
                </div>
              )}
              <span className="text-[11.5px] text-fg-muted">{m.branchCount} שלוחות</span>
              {editId === m.id ? (
                <>
                  <button onClick={() => rename(m.id)} disabled={busyId === m.id} className={iconBtn} aria-label="שמור">
                    {busyId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setEditId(null)} className={iconBtn} aria-label="בטל">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditId(m.id); setEditName(m.name) }} className={iconBtn} aria-label="ערוך שם">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(m)} disabled={busyId === m.id} className={`${iconBtn} hover:text-[var(--danger)]`} aria-label="מחק">
                    {busyId === m.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[var(--line-faint)] bg-[var(--bg-subtle)] px-5 py-3">
        <div className="flex items-center gap-2">
          <input
            className={input}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") add() }}
            placeholder="שם תנועה חדשה"
          />
          <button
            onClick={add}
            disabled={adding || !newName.trim()}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            הוסף
          </button>
        </div>
        {error && <p className="m-0 mt-2 text-[12px] text-[var(--danger)]">{error}</p>}
      </div>
    </section>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Megaphone, Plus, X } from "lucide-react"

// יצירת הודעה ארצית ע"י המועצה. יעד: כל המכינות / תנועה / מכינות נבחרות.
// שולח ל-/api/council/announcements ואז מרענן את הרשימה.

type Movement = { id: string; name: string }
type Org = { id: string; name: string }
type TargetType = "all" | "movement" | "selected"

export function AnnouncementCreateButton({
  movements,
  orgs,
}: {
  movements: Movement[]
  orgs: Org[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [targetType, setTargetType] = useState<TargetType>("all")
  const [movementId, setMovementId] = useState("")
  const [orgIds, setOrgIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function toggleOrg(id: string) {
    setOrgIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    if (targetType === "movement" && !movementId) {
      setError("יש לבחור תנועה")
      return
    }
    if (targetType === "selected" && orgIds.length === 0) {
      setError("יש לבחור לפחות מכינה אחת")
      return
    }
    setSaving(true)
    setError("")
    const res = await fetch("/api/council/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        body: body.trim(),
        targetType,
        movementId: targetType === "movement" ? movementId : undefined,
        organizationIds: targetType === "selected" ? orgIds : undefined,
      }),
    })
    setSaving(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(`שליחה נכשלה: ${j.error ?? res.status}`)
      return
    }
    setTitle("")
    setBody("")
    setTargetType("all")
    setMovementId("")
    setOrgIds([])
    setOpen(false)
    router.refresh()
  }

  const inputCls =
    "h-10 rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
      >
        <Plus className="h-4 w-4" />
        הודעה חדשה
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: "var(--overlay)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-line bg-surface shadow-[var(--shadow-lg)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--line-faint)] px-5 py-4">
              <h2 className="m-0 inline-flex items-center gap-2 text-[15px] font-semibold text-primary">
                <Megaphone className="h-4 w-4 text-fg-faint" />
                הודעה חדשה
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="inline-grid h-7 w-7 place-items-center rounded text-fg-subtle hover:bg-[var(--bg-subtle)] hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">כותרת</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="לדוגמה: הגשת דוח גיוס עד סוף החודש"
                  className={inputCls}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">תוכן ההודעה</label>
                <textarea
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="כתוב כאן את ההודעה למכינות..."
                  rows={4}
                  className="min-h-[100px] rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-fg">למי לשלוח</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as TargetType)}
                  className={inputCls}
                >
                  <option value="all">כל המכינות</option>
                  <option value="movement">תנועה מסוימת</option>
                  <option value="selected">מכינות נבחרות</option>
                </select>
              </div>

              {targetType === "movement" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-fg">תנועה</label>
                  <select
                    required
                    value={movementId}
                    onChange={(e) => setMovementId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="" disabled>בחר תנועה...</option>
                    {movements.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === "selected" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-medium text-fg">
                    מכינות {orgIds.length > 0 ? `(${orgIds.length})` : ""}
                  </label>
                  <div className="overflow-hidden rounded-md border border-line">
                    <div className="flex items-center justify-between gap-2 border-b border-line px-2 py-1.5">
                      <button
                        type="button"
                        onClick={() => setOrgIds(orgs.map((o) => o.id))}
                        className="rounded px-2 py-1 text-[12px] font-medium text-accent hover:bg-[var(--bg-subtle)]"
                      >
                        בחר הכל
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrgIds([])}
                        className="rounded px-2 py-1 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)]"
                      >
                        נקה הכל
                      </button>
                    </div>
                    <div className="max-h-44 overflow-y-auto p-2">
                      {orgs.map((o) => (
                        <label
                          key={o.id}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-[var(--bg-subtle)]"
                        >
                          <input
                            type="checkbox"
                            checked={orgIds.includes(o.id)}
                            onChange={() => toggleOrg(o.id)}
                          />
                          <span className="text-[13px]">{o.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="m-0 text-[12px] text-[var(--danger)]">{error}</p>}

              <div className="mt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 items-center rounded-md border border-line bg-surface px-4 text-[13px] text-fg-muted hover:bg-[var(--bg-subtle)]"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
                >
                  <Megaphone className="h-4 w-4" />
                  {saving ? "שולח..." : "שלח הודעה"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

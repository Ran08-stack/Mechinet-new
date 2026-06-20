"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Building2 } from "lucide-react"

// כרטיס פרופיל המועצה — שם להצגה ולוגו (כתובת תמונה).
// העלאת קבצים אינה נתמכת כאן — רן יוכל לארח לוגו ב-Supabase Storage/CDN ולהדביק URL.

type Props = { initial: { name: string; logoUrl: string | null } }

export function CouncilProfileCard({ initial }: Props) {
  const router = useRouter()
  const [name, setName] = useState(initial.name)
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "")
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  async function save() {
    setSaving(true)
    setMsg(null)
    const res = await fetch("/api/council/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), logo_url: logoUrl.trim() || null }),
    })
    setSaving(false)
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setMsg({ kind: "err", text: `שמירה נכשלה: ${j.error ?? res.status}` })
      return
    }
    setMsg({ kind: "ok", text: "נשמר" })
    router.refresh()
  }

  const input = "h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-[var(--line-faint)] px-5 py-3.5">
        <h2 className="m-0 inline-flex items-center gap-2 text-[14px] font-semibold text-primary">
          <Building2 className="h-4 w-4 text-fg-faint" />
          פרופיל המועצה
        </h2>
        <p className="m-0 mt-0.5 text-[12px] text-fg-muted">השם והלוגו שמופיעים במערכת ובהודעות.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-fg-muted">שם המועצה</span>
            <input
              className={input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="מועצת המכינות הקדם-צבאיות"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-fg-muted">כתובת לוגו (URL)</span>
            <input
              className={input}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://…/logo.png"
              dir="ltr"
            />
          </label>
        </div>
        {logoUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={logoUrl} alt="לוגו" className="h-14 w-14 rounded-md border border-line object-contain" />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[var(--line-faint)] px-5 py-3">
        <span className={`text-[12px] ${msg?.kind === "err" ? "text-[var(--danger)]" : msg?.kind === "ok" ? "text-[var(--success)]" : "text-fg-muted"}`}>
          {msg?.text ?? " "}
        </span>
        <button
          onClick={save}
          disabled={saving || !name.trim()}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          שמור
        </button>
      </div>
    </section>
  )
}

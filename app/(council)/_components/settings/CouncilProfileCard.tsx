"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Building2, Upload, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// כרטיס פרופיל המועצה — שם והעלאת לוגו (קובץ).
// הלוגו נשמר ב-bucket "attachments" תחת logos/council.<ext> (כמו לוגו של מכינה),
// וה-URL נשמר ב-council_settings(key=council_profile) דרך ה-API הקיים.

type Props = { initial: { name: string; logoUrl: string | null } }

const MAX_BYTES = 2 * 1024 * 1024 // 2MB

export function CouncilProfileCard({ initial }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(initial.name)
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  async function persist(nextName: string, nextLogo: string | null) {
    const res = await fetch("/api/council/settings/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nextName.trim(), logo_url: nextLogo }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      throw new Error(j.error ?? `שגיאה ${res.status}`)
    }
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setMsg({ kind: "err", text: "יש לבחור קובץ תמונה" })
      return
    }
    if (file.size > MAX_BYTES) {
      setMsg({ kind: "err", text: "התמונה גדולה מ-2MB" })
      return
    }
    setUploading(true)
    setMsg(null)
    try {
      const supabase = createClient()
      const ext = (file.name.split(".").pop() || "png").toLowerCase()
      const path = `logos/council.${ext}`
      const { error: upErr } = await supabase.storage.from("attachments").upload(path, file, { upsert: true })
      if (upErr) throw new Error("העלאה נכשלה")
      const { data } = supabase.storage.from("attachments").getPublicUrl(path)
      const next = `${data.publicUrl}?v=${Date.now()}`
      await persist(name, next)
      setLogoUrl(next)
      setMsg({ kind: "ok", text: "הלוגו עודכן" })
      router.refresh()
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "שגיאה" })
    } finally {
      setUploading(false)
    }
  }

  async function removeLogo() {
    setUploading(true)
    setMsg(null)
    try {
      await persist(name, null)
      setLogoUrl("")
      setMsg({ kind: "ok", text: "הלוגו הוסר" })
      router.refresh()
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "שגיאה" })
    } finally {
      setUploading(false)
    }
  }

  async function saveName() {
    setSaving(true)
    setMsg(null)
    try {
      await persist(name, logoUrl || null)
      setMsg({ kind: "ok", text: "נשמר" })
      router.refresh()
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "שגיאה" })
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    "h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-[var(--line-faint)] px-5 py-3.5">
        <h2 className="m-0 inline-flex items-center gap-2 text-[14px] font-semibold text-primary">
          <Building2 className="h-4 w-4 text-fg-faint" />
          פרופיל המועצה
        </h2>
        <p className="m-0 mt-0.5 text-[12px] text-fg-muted">השם והלוגו שמופיעים בסיידבר ובהודעות.</p>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-fg-muted">שם המועצה</span>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="מועצת המכינות הקדם-צבאיות"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-fg-muted">לוגו</span>
          <div className="flex items-center gap-4 rounded-md border border-line bg-[var(--bg-subtle)] p-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-surface">
              {logoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={logoUrl} alt="לוגו" className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-7 w-7 text-fg-faint" />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[13px] text-fg hover:bg-[var(--bg-subtle)] disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {logoUrl ? "החלף תמונה" : "העלה תמונה"}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    disabled={uploading}
                    className="inline-grid h-9 w-9 place-items-center rounded-md border border-line bg-surface text-fg-muted hover:bg-[var(--bg-subtle)] hover:text-[var(--danger)] disabled:opacity-60"
                    aria-label="הסר לוגו"
                    title="הסר לוגו"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <span className="text-[11px] text-fg-subtle">PNG / JPG / SVG · עד 2MB</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--line-faint)] px-5 py-3">
        <span
          className={`text-[12px] ${msg?.kind === "err" ? "text-[var(--danger)]" : msg?.kind === "ok" ? "text-[var(--success)]" : "text-fg-muted"}`}
        >
          {msg?.text ?? " "}
        </span>
        <button
          onClick={saveName}
          disabled={saving || uploading || !name.trim() || name.trim() === initial.name.trim()}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          שמור שם
        </button>
      </div>
    </section>
  )
}

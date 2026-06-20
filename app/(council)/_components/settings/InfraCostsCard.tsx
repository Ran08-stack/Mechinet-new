"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, DollarSign } from "lucide-react"

type Costs = { supabase?: number; vercel?: number; openai?: number; resend?: number; total?: number }

const ITEMS: { key: keyof Omit<Costs, "total">; label: string }[] = [
  { key: "supabase", label: "Supabase" },
  { key: "vercel",   label: "Vercel" },
  { key: "openai",   label: "OpenAI" },
  { key: "resend",   label: "Resend" },
]

export function InfraCostsCard({ initial }: { initial: Costs }) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, string>>({
    supabase: String(initial.supabase ?? 0),
    vercel: String(initial.vercel ?? 0),
    openai: String(initial.openai ?? 0),
    resend: String(initial.resend ?? 0),
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null)

  const nums = ITEMS.map((i) => Math.max(0, Number(values[i.key]) || 0))
  const total = nums.reduce((s, n) => s + n, 0)

  async function save() {
    setSaving(true)
    setMsg(null)
    const payload: Costs = { total }
    ITEMS.forEach((i, idx) => { payload[i.key] = nums[idx] })
    const res = await fetch("/api/council/settings/infra-costs", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

  const input = "h-9 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)] [font-variant-numeric:tabular-nums]"

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="border-b border-[var(--line-faint)] px-5 py-3.5">
        <h2 className="m-0 inline-flex items-center gap-2 text-[14px] font-semibold text-primary">
          <DollarSign className="h-4 w-4 text-fg-faint" />
          עלויות תשתית
        </h2>
        <p className="m-0 mt-0.5 text-[12px] text-fg-muted">המספרים שמופיעים בלוח הבקרה תחת "עלויות תשתית" (דולר חודשי).</p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5 md:grid-cols-4">
        {ITEMS.map((i, idx) => (
          <label key={i.key} className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-fg-muted">{i.label}</span>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 end-3 grid place-items-center text-[11px] text-fg-subtle">$</span>
              <input
                className={`${input} pe-7`}
                type="number"
                min={0}
                inputMode="numeric"
                value={values[i.key]}
                onChange={(e) => setValues((v) => ({ ...v, [i.key]: e.target.value }))}
              />
            </div>
            <span className="text-[10.5px] text-fg-subtle [font-variant-numeric:tabular-nums]">{nums[idx]}$</span>
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--line-faint)] px-5 py-3">
        <div className="text-[13px]">
          <span className="text-fg-muted">סה״כ חודשי:</span>{" "}
          <span className="font-semibold text-primary [font-variant-numeric:tabular-nums]">${total}</span>
          {msg && (
            <span className={`ms-3 text-[12px] ${msg.kind === "err" ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
              {msg.text}
            </span>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-4 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          שמור
        </button>
      </div>
    </section>
  )
}

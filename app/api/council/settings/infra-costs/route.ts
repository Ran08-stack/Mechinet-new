import { NextResponse } from "next/server"
import { requireCouncil } from "@/lib/council/guard"
import type { Json } from "@/types/database"

const KEYS = ["supabase", "vercel", "openai", "resend"] as const

export async function PUT(req: Request) {
  const g = await requireCouncil()
  if (!g.ok) return g.res
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }) }

  const out: Record<string, number> = {}
  for (const k of KEYS) {
    const v = Number(body[k])
    if (!Number.isFinite(v) || v < 0) return NextResponse.json({ error: `ערך לא תקין: ${k}` }, { status: 400 })
    out[k] = Math.round(v)
  }
  const total = KEYS.reduce((s, k) => s + out[k], 0)
  const value = { ...out, total } as unknown as Json

  const { error } = await g.supabase
    .from("council_settings")
    .upsert({ key: "infra_costs", value, updated_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await g.supabase.from("audit_log").insert({
    action: "council.infra_costs_update",
    actor_id: g.userId,
    target_type: "council_settings",
    target_id: null,
    meta: { total } as Json,
  })
  return NextResponse.json({ ok: true })
}

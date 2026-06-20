import { NextResponse } from "next/server"
import { requireCouncil } from "@/lib/council/guard"
import type { Json } from "@/types/database"

export async function PUT(req: Request) {
  const g = await requireCouncil()
  if (!g.ok) return g.res
  let body: { name?: string; logo_url?: string | null }
  try { body = await req.json() } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }) }
  const name = body.name?.trim()
  if (!name) return NextResponse.json({ error: "חסר שם" }, { status: 400 })
  const logoUrl = body.logo_url == null || body.logo_url === "" ? null
    : typeof body.logo_url === "string" ? body.logo_url.trim() : null

  const value = { name, logo_url: logoUrl } as Json
  const { error } = await g.supabase
    .from("council_settings")
    .upsert({ key: "council_profile", value, updated_at: new Date().toISOString() })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await g.supabase.from("audit_log").insert({
    action: "council.profile_update",
    actor_id: g.userId,
    target_type: "council_settings",
    target_id: null,
    meta: { name, has_logo: !!logoUrl } as Json,
  })
  return NextResponse.json({ ok: true })
}

import { NextResponse } from "next/server"
import { requireCouncil } from "@/lib/council/guard"
import type { Json } from "@/types/database"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await requireCouncil()
  if (!g.ok) return g.res
  let body: { name?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }) }
  const name = body.name?.trim()
  if (!name) return NextResponse.json({ error: "חסר שם" }, { status: 400 })

  const { data: before } = await g.supabase.from("movements").select("name").eq("id", id).single()
  if (!before) return NextResponse.json({ error: "not_found" }, { status: 404 })
  if (before.name === name) return NextResponse.json({ ok: true, noop: true })

  const { data: dup } = await g.supabase.from("movements").select("id").eq("name", name).neq("id", id).maybeSingle()
  if (dup) return NextResponse.json({ error: "תנועה בשם זה כבר קיימת" }, { status: 409 })

  const { error } = await g.supabase.from("movements").update({ name }).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await g.supabase.from("audit_log").insert({
    action: "movement.rename",
    actor_id: g.userId,
    target_type: "movement",
    target_id: id,
    meta: { from: before.name, to: name } as Json,
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const g = await requireCouncil()
  if (!g.ok) return g.res

  const { data: row } = await g.supabase.from("movements").select("name").eq("id", id).single()
  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 })

  // ספירת שלוחות מושפעות (ON DELETE SET NULL — לא נחסם, רק לתיעוד)
  const { count: affected } = await g.supabase
    .from("organizations")
    .select("id", { count: "exact", head: true })
    .eq("movement_id", id)

  const { error } = await g.supabase.from("movements").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await g.supabase.from("audit_log").insert({
    action: "movement.delete",
    actor_id: g.userId,
    target_type: "movement",
    target_id: id,
    meta: { name: row.name, affected_orgs: affected ?? 0 } as Json,
  })
  return NextResponse.json({ ok: true, affected: affected ?? 0 })
}

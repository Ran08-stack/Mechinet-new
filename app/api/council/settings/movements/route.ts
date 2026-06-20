import { NextResponse } from "next/server"
import { requireCouncil } from "@/lib/council/guard"
import type { Json } from "@/types/database"

// slug עברי-בטוח: מילים לועזיות נשארות, מילים עבריות הופכות ל-hash קצר/transliteration בסיסי.
// כאן נעדיף משהו פשוט: lowercase, רווחים→מקפים, מסיר תווים שאינם a-z0-9 או עברית.
function makeSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9֐-׿-]/g, "")
    .slice(0, 60) || "movement"
}

export async function POST(req: Request) {
  const g = await requireCouncil()
  if (!g.ok) return g.res
  let body: { name?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }) }
  const name = body.name?.trim()
  if (!name) return NextResponse.json({ error: "חסר שם" }, { status: 400 })

  // בדיקת כפילות לפי שם
  const { data: existing } = await g.supabase.from("movements").select("id").eq("name", name).maybeSingle()
  if (existing) return NextResponse.json({ error: "תנועה בשם זה כבר קיימת" }, { status: 409 })

  const baseSlug = makeSlug(name)
  let slug = baseSlug
  // אם slug תפוס — מוסיף סיומת מספרית
  for (let i = 2; i < 50; i++) {
    const { data: hit } = await g.supabase.from("movements").select("id").eq("slug", slug).maybeSingle()
    if (!hit) break
    slug = `${baseSlug}-${i}`
  }

  const { data: created, error } = await g.supabase
    .from("movements")
    .insert({ name, slug })
    .select("id")
    .single()
  if (error || !created) return NextResponse.json({ error: error?.message ?? "שמירה נכשלה" }, { status: 500 })

  await g.supabase.from("audit_log").insert({
    action: "movement.create",
    actor_id: g.userId,
    target_type: "movement",
    target_id: created.id,
    meta: { name, slug } as Json,
  })
  return NextResponse.json({ ok: true, id: created.id })
}

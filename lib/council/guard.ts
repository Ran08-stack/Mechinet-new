import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Guard משותף ל-API routes של המועצה — מאמת מחובר + role=council_admin.
// מחזיר { user, supabase } או NextResponse עם 401/403.

export async function requireCouncil(): Promise<
  | { ok: true; userId: string; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; res: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, res: NextResponse.json({ error: "unauthorized" }, { status: 401 }) }
  const { data: row } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (row?.role !== "council_admin") {
    return { ok: false, res: NextResponse.json({ error: "forbidden" }, { status: 403 }) }
  }
  return { ok: true, userId: user.id, supabase }
}

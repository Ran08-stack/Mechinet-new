import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// DELETE /api/candidates/delete — מקבל body {ids:[...]}
// מנקה קבצים מ-storage לפני מחיקת ה-rows.
// CASCADE FK מוחק candidate_events ו-interviews אוטומטית.

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: me } = await supabase
    .from("users")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()
  if (!me || !me.organization_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : []
  if (ids.length === 0) {
    return NextResponse.json({ error: "ids חסרים" }, { status: 400 })
  }

  // שליפת attachments — לפי RLS המשתמש רואה רק את הארגון שלו
  const { data: rows } = await supabase
    .from("candidates")
    .select("id, attachments, organization_id")
    .in("id", ids)

  const myIds = (rows ?? [])
    .filter((r) => r.organization_id === me.organization_id)
    .map((r) => r.id)

  if (myIds.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  // איסוף נתיבי קבצים — מחלצים path מתוך file_url
  const filePaths: string[] = []
  for (const r of rows ?? []) {
    const atts = Array.isArray(r.attachments) ? r.attachments : []
    for (const a of atts as Array<{ file_url?: string }>) {
      if (!a.file_url) continue
      // public URL מבנה: /storage/v1/object/public/attachments/<path>
      const m = a.file_url.match(/\/attachments\/(.+?)(?:\?|$)/)
      if (m && m[1]) filePaths.push(decodeURIComponent(m[1]))
    }
  }

  const admin = createAdminClient()

  if (filePaths.length > 0) {
    // best-effort — אם storage delete נכשל, ממשיכים עם מחיקת ה-rows
    await admin.storage.from("attachments").remove(filePaths)
  }

  const { error: delError } = await supabase
    .from("candidates")
    .delete()
    .in("id", myIds)

  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    deleted: myIds.length,
    filesRemoved: filePaths.length,
  })
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { provisionOrgAdmin } from "@/lib/provisioning/provisionOrgAdmin"

// POST /api/dev/invite — route זמני לבדיקת זרימת ההזמנה מקצה לקצה (Phase 1).
// council_admin בלבד. body: { email, fullName, organizationId }.
// יוחלף ב-Phase 2 ע"י route האישור /api/council/registrations/[id].

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (me?.role !== "council_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const email = (body?.email ?? "").trim()
  const fullName = (body?.fullName ?? "").trim()
  const organizationId = body?.organizationId
  if (!email || !organizationId) {
    return NextResponse.json({ error: "email + organizationId חובה" }, { status: 400 })
  }

  const result = await provisionOrgAdmin({
    email,
    fullName,
    organizationId,
    role: "org_admin",
    createdBy: user.id,
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json(result)
}

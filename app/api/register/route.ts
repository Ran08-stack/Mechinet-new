import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { normalizePhone } from "@/lib/utils"
import type { RequestedBranch } from "@/types/registration"

// POST /api/register — בקשת הרשמה ציבורית של מכינה (self-service, ללא auth).
// יוצר רשומה אחת ב-registration_requests עם status='pending' דרך service-role.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type IncomingBranch = { branch_name?: string; city?: string }

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 })
  }

  const academyName = (body.academy_name ?? "").trim()
  const contactName = (body.contact_name ?? "").trim()
  const contactEmail = (body.contact_email ?? "").trim().toLowerCase()
  const contactPhone = normalizePhone(body.contact_phone ?? "")
  const notes = (body.notes ?? "").trim()
  const movementId =
    typeof body.movement_id === "string" && body.movement_id
      ? body.movement_id
      : null
  const existingAcademyId =
    typeof body.existing_academy_id === "string" && body.existing_academy_id
      ? body.existing_academy_id
      : null

  // ולידציה server-side
  if (!academyName) {
    return NextResponse.json({ error: "שם המכינה חובה" }, { status: 400 })
  }
  if (!contactName) {
    return NextResponse.json({ error: "שם איש הקשר חובה" }, { status: 400 })
  }
  if (!contactEmail || !EMAIL_RE.test(contactEmail)) {
    return NextResponse.json({ error: "אימייל לא תקין" }, { status: 400 })
  }

  const rawBranches: IncomingBranch[] = Array.isArray(body.branches)
    ? body.branches
    : []
  const branches: RequestedBranch[] = rawBranches
    .map((b) => ({
      branch_name: (b.branch_name ?? "").trim(),
      city: (b.city ?? "").trim() || null,
    }))
    .filter((b) => b.branch_name)

  if (branches.length === 0) {
    return NextResponse.json(
      { error: "יש להזין לפחות שלוחה אחת עם שם" },
      { status: 400 }
    )
  }

  const admin = createAdminClient()

  // rate-limit קל: דחיית בקשה זהה ממתינה מאותו אימייל בשעה האחרונה
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { data: existing } = await admin
    .from("registration_requests")
    .select("id")
    .eq("contact_email", contactEmail)
    .eq("status", "pending")
    .gte("created_at", oneHourAgo)
    .limit(1)

  if (existing && existing.length > 0) {
    return NextResponse.json(
      { error: "כבר נשלחה בקשה עם אימייל זה לאחרונה. נסו שוב מאוחר יותר." },
      { status: 429 }
    )
  }

  const { error: insertError } = await admin
    .from("registration_requests")
    .insert({
      academy_name: academyName,
      movement_id: movementId,
      existing_academy_id: existingAcademyId,
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      branches,
      notes: notes || null,
      status: "pending",
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

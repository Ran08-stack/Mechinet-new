import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { provisionOrgAdmin } from "@/lib/provisioning/provisionOrgAdmin"
import type { Json } from "@/types/database"
import type { RequestedBranch } from "@/types/registration"

// PATCH: אישור / דחייה של בקשת רישום מכינה ע"י council_admin בלבד.
// אישור → הקמת מכינה (אם חדשה) + שלוחות (organizations) + הזמנת מנהל ראשי.
// כל פעולה מתועדת ב-audit_log.

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
  if (userRow?.role !== "council_admin") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  let body: { action?: string; reason?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 })
  }

  const action = body.action
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 })
  }

  // טעינת הבקשה
  const { data: reqRow, error: reqErr } = await supabase
    .from("registration_requests")
    .select("*")
    .eq("id", id)
    .single()
  if (reqErr || !reqRow) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }
  if (reqRow.status !== "pending") {
    return NextResponse.json({ error: "already_reviewed" }, { status: 409 })
  }

  const now = new Date().toISOString()

  // ----- דחייה -----
  if (action === "reject") {
    const { error: updErr } = await supabase
      .from("registration_requests")
      .update({
        status: "rejected",
        reject_reason: body.reason?.trim() || null,
        reviewed_by: user.id,
        reviewed_at: now,
      })
      .eq("id", id)
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  }

  // ----- אישור (כתיבות דרך service-role) -----
  const admin = createAdminClient()

  // א. איתור / יצירת מכינה
  let academyId = reqRow.existing_academy_id
  if (!academyId) {
    const { data: ac, error: acErr } = await admin
      .from("academies")
      .insert({ name: reqRow.academy_name, movement_id: reqRow.movement_id })
      .select("id")
      .single()
    if (acErr || !ac) {
      return NextResponse.json(
        { error: acErr?.message ?? "academy_create_failed" },
        { status: 500 }
      )
    }
    academyId = ac.id
  }

  // ב. הקמת / קישור שלוחות
  const branches = (Array.isArray(reqRow.branches)
    ? reqRow.branches
    : []) as unknown as RequestedBranch[]
  const orgIds: string[] = []
  let orgsCreated = 0
  let orgsLinked = 0

  for (let i = 0; i < branches.length; i++) {
    const b = branches[i]
    if (b.link_org_id) {
      const { data: linked, error: linkErr } = await admin
        .from("organizations")
        .update({
          status: "pending",
          academy_id: academyId,
          branch_name: b.branch_name,
          city: b.city,
        })
        .eq("id", b.link_org_id)
        .select("id")
        .single()
      if (linkErr || !linked) {
        return NextResponse.json(
          { error: linkErr?.message ?? "org_link_failed" },
          { status: 500 }
        )
      }
      orgIds.push(linked.id)
      orgsLinked++
    } else {
      const { data: created, error: insErr } = await admin
        .from("organizations")
        .insert({
          name: b.branch_name,
          slug: "branch-" + Date.now() + "-" + i,
          academy_id: academyId,
          city: b.city,
          branch_name: b.branch_name,
          status: "pending",
          movement_id: reqRow.movement_id,
        })
        .select("id")
        .single()
      if (insErr || !created) {
        return NextResponse.json(
          { error: insErr?.message ?? "org_create_failed" },
          { status: 500 }
        )
      }
      orgIds.push(created.id)
      orgsCreated++
    }
  }

  // ג. הזמנת המנהל הראשי על השלוחה הראשונה
  let invitesSent = 0
  let invitesFailed = 0
  let provisionError: string | undefined
  const primaryOrgId = orgIds[0]
  if (primaryOrgId) {
    const result = await provisionOrgAdmin({
      email: reqRow.contact_email,
      fullName: reqRow.contact_name,
      phone: reqRow.contact_phone,
      organizationId: primaryOrgId,
      role: "org_admin",
      requestId: id,
      createdBy: user.id,
    })
    if (result.ok) {
      invitesSent = 1
    } else {
      invitesFailed = 1
      provisionError = result.error
    }
  }

  // ד. עדכון הבקשה
  const { error: reqUpdErr } = await admin
    .from("registration_requests")
    .update({ status: "approved", reviewed_by: user.id, reviewed_at: now })
    .eq("id", id)
  if (reqUpdErr) {
    return NextResponse.json({ error: reqUpdErr.message }, { status: 500 })
  }

  // ה. תיעוד
  await admin.from("audit_log").insert({
    action: "registration.approved",
    actor_id: user.id,
    target_type: "registration_request",
    target_id: id,
    meta: {
      academyId,
      orgsCreated,
      orgsLinked,
      invitesSent,
      invitesFailed,
    } as Json,
  })

  // ו. תוצאה
  return NextResponse.json({
    ok: true,
    orgsCreated,
    orgsLinked,
    invitesSent,
    invitesFailed,
    ...(provisionError ? { error: provisionError } : {}),
  })
}

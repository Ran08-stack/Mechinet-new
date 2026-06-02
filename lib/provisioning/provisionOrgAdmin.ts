import { createAdminClient } from "@/lib/supabase/admin"

// הקמת חשבון לשלוחה דרך הזמנה במייל (Supabase built-in).
// מבוסס על דפוס app/api/team/route.ts: יצירת auth user → השלמת public.users → פנקס invitations.
// inviteUserByEmail יוצר את המשתמש ושולח את מייל ההזמנה (לינק → /welcome → קביעת סיסמה).

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mechinet-new.vercel.app"

type ProvisionInput = {
  email: string
  fullName: string
  phone?: string | null
  organizationId: string
  role?: "org_admin" | "org_staff"
  requestId?: string | null
  createdBy?: string | null
}

type ProvisionResult =
  | { ok: true; userId: string; invitationId: string | null; ledgerError: string | null }
  | { ok: false; error: string }

export async function provisionOrgAdmin(input: ProvisionInput): Promise<ProvisionResult> {
  const admin = createAdminClient()
  const email = input.email.trim().toLowerCase()
  const role = input.role ?? "org_admin"

  // 1. הזמנה — יוצרת auth user ושולחת מייל הזמנה
  const { data: invited, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: input.fullName },
    redirectTo: `${SITE_URL}/welcome`,
  })
  if (inviteErr || !invited?.user) {
    return { ok: false, error: inviteErr?.message ?? "שגיאה בשליחת ההזמנה" }
  }
  const userId = invited.user.id

  // 2. השלמת public.users (ה-trigger כבר יצר שורת בסיס)
  const { error: upsertErr } = await admin.from("users").upsert({
    id: userId,
    email,
    full_name: input.fullName || null,
    phone: input.phone ? input.phone.replace(/\D/g, "").slice(0, 10) : null,
    organization_id: input.organizationId,
    role,
  })
  if (upsertErr) {
    await admin.auth.admin.deleteUser(userId) // rollback
    return { ok: false, error: upsertErr.message }
  }

  // 3. פנקס invitations (כשל כאן לא קריטי — המשתמש כבר הוקם והוזמן)
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: inv, error: ledgerErr } = await admin
    .from("invitations")
    .insert({
      user_id: userId,
      organization_id: input.organizationId,
      email,
      role,
      request_id: input.requestId ?? null,
      status: "sent",
      sent_at: new Date().toISOString(),
      expires_at: expires,
      created_by: input.createdBy ?? null,
    })
    .select("id")
    .single()

  return { ok: true, userId, invitationId: inv?.id ?? null, ledgerError: ledgerErr?.message ?? null }
}

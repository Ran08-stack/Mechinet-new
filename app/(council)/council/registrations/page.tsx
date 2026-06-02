import { createClient } from "@/lib/supabase/server"
import { ClipboardList } from "lucide-react"
import { RegistrationQueue, type PendingRequest } from "../../_components/RegistrationQueue"
import type { RequestedBranch } from "@/types/registration"

export default async function CouncilRegistrationsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("registration_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  const requests: PendingRequest[] = (data ?? []).map((r) => ({
    id: r.id,
    academyName: r.academy_name,
    contactName: r.contact_name,
    contactEmail: r.contact_email,
    contactPhone: r.contact_phone,
    notes: r.notes,
    createdAt: r.created_at,
    branches: (Array.isArray(r.branches) ? r.branches : []) as unknown as RequestedBranch[],
  }))

  return (
    <div className="pb-14">
      <div className="flex flex-wrap items-end justify-between gap-4 px-3 md:px-7 pb-2 pt-5 md:pt-7">
        <div>
          <h1 className="m-0 flex flex-wrap items-center gap-3 text-[22px] md:text-[30px] font-semibold leading-[1.15] tracking-[-0.01em] text-primary">
            <ClipboardList className="h-6 w-6 text-accent" />
            בקשות רישום
          </h1>
          <p className="mt-2 max-w-[60ch] text-[15px] text-fg-muted">
            בקשות הרשמה של מכינות הממתינות לאישור · אישור מקים מכינה, שלוחות וחשבון מנהל
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-3 md:px-7 pt-3">
        <RegistrationQueue requests={requests} />
      </div>
    </div>
  )
}

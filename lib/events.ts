import { createClient } from "@/lib/supabase/client"

// רישום אירוע בהיסטוריית הפעילות של מועמד.
// נקרא מ-client components אחרי פעולה (שינוי שלב, הערה, סיכום AI).
// שקט בכשל — אירוע שלא נרשם לא אמור לשבור את הפעולה עצמה.

export async function logCandidateEvent(params: {
  candidateId: string
  organizationId: string
  type: string
  description?: string
}) {
  try {
    const supabase = createClient()
    await supabase.from("candidate_events").insert({
      candidate_id: params.candidateId,
      organization_id: params.organizationId,
      type: params.type,
      description: params.description ?? null,
    })
  } catch {
    // שקט — לא חוסם את הפעולה
  }
}

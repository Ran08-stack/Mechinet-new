import { Settings as SettingsIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { MovementsCard } from "../../_components/settings/MovementsCard"
import { InfraCostsCard } from "../../_components/settings/InfraCostsCard"
import { CouncilProfileCard } from "../../_components/settings/CouncilProfileCard"

// הגדרות מועצה — פרופיל, תנועות, עלויות תשתית.
// כל הכתיבות עוברות דרך API routes עם guard council_admin + audit_log.

type InfraCosts = { supabase?: number; vercel?: number; openai?: number; resend?: number; total?: number }
type Profile = { name?: string; logo_url?: string | null }

export default async function CouncilSettingsPage() {
  const supabase = await createClient()

  const [{ data: movements }, { data: settingsRows }, { data: orgUsage }] = await Promise.all([
    supabase.from("movements").select("id, name, slug").order("name"),
    supabase.from("council_settings").select("key, value"),
    supabase.from("organizations").select("movement_id"),
  ])

  const byKey = new Map((settingsRows ?? []).map((r) => [r.key, r.value as Record<string, unknown>]))
  const infra = (byKey.get("infra_costs") ?? {}) as InfraCosts
  const profile = (byKey.get("council_profile") ?? {}) as Profile

  // ספירת שלוחות לכל תנועה — כדי להציג בכרטיס ולמנוע הפתעות במחיקה
  const usage: Record<string, number> = {}
  for (const o of orgUsage ?? []) {
    if (o.movement_id) usage[o.movement_id] = (usage[o.movement_id] ?? 0) + 1
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-14 pt-5 md:px-7 md:pt-7">
      <div className="mb-5">
        <h1 className="m-0 inline-flex items-center gap-2.5 text-[22px] font-semibold tracking-[-0.01em] text-primary md:text-[28px]">
          <SettingsIcon className="h-6 w-6 text-fg-faint" />
          הגדרות מועצה
        </h1>
        <p className="mt-1.5 max-w-[65ch] text-[14px] text-fg-muted">
          ניהול פרופיל המועצה, תנועות הנוער, ועלויות התשתית המוצגות בדשבורד.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <CouncilProfileCard
          initial={{
            name: profile.name ?? "מועצת המכינות הקדם-צבאיות",
            logoUrl: profile.logo_url ?? null,
          }}
        />

        <MovementsCard
          movements={(movements ?? []).map((m) => ({ id: m.id, name: m.name, slug: m.slug, branchCount: usage[m.id] ?? 0 }))}
        />

        <InfraCostsCard initial={infra} />
      </div>
    </div>
  )
}

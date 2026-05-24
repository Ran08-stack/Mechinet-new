import { createClient } from "@/lib/supabase/server"
import { PipelineStage } from "@/types/database"
import { DEFAULT_STAGE_COLOR } from "@/lib/utils"

/**
 * שולף את כל השלבים של מכינה לפי order_index.
 * שימוש בצד server בלבד (createClient מ-server).
 */
export async function getStages(organizationId: string): Promise<PipelineStage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("pipeline_stages")
    .select("*")
    .eq("organization_id", organizationId)
    .order("order_index", { ascending: true })
  return (data ?? []) as PipelineStage[]
}

/**
 * מחזיר את הצבע של שלב לפי שם.
 * אם השלב לא נמצא — מחזיר צבע ברירת מחדל.
 */
export function getStageColor(stages: PipelineStage[], stageName: string): string {
  const stage = stages.find((s) => s.name === stageName)
  return stage?.color ?? DEFAULT_STAGE_COLOR
}

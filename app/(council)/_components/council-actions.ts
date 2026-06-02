"use server"

import { revalidateTag } from "next/cache"

// מבטל את ה-cache של תובנת ה-AI הארצית כדי שתיווצר מחדש בקריאה הבאה.
export async function refreshCouncilInsight() {
  revalidateTag("council-insight")
}

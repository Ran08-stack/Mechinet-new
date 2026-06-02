import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// איתור מקום חופשי (עיר/קיבוץ/יישוב) → קואורדינטות, דרך Nominatim (OpenStreetMap).
// council_admin בלבד. מוגבל לישראל (countrycodes=il).

export async function GET(req: Request) {
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

  const q = new URL(req.url).searchParams.get("q")?.trim()
  if (!q) return NextResponse.json({ error: "missing_query" }, { status: 400 })

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=il&accept-language=he&q=" +
    encodeURIComponent(q)

  let results: Array<{ lat: string; lon: string; display_name: string }>
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mechinet/1.0 (council academy map; contact: rapran333@gmail.com)",
      },
    })
    if (!res.ok) {
      return NextResponse.json({ error: "geocode_failed" }, { status: 502 })
    }
    results = await res.json()
  } catch {
    return NextResponse.json({ error: "geocode_failed" }, { status: 502 })
  }

  if (!results.length) {
    return NextResponse.json({ error: "not_found" }, { status: 404 })
  }

  const r = results[0]
  return NextResponse.json({
    lat: Number(r.lat),
    lng: Number(r.lon),
    display_name: r.display_name,
  })
}

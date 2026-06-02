"use client"

import { useRef, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import L from "leaflet"
import { Plus, Minus } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import "leaflet/dist/leaflet.css"

export type BranchPoint = {
  id: string
  academyName: string
  branchName: string
  city: string | null
  lat: number
  lng: number
  gender: "boys" | "girls" | "mixed" | null
  rel: "religious" | "secular" | "mixed" | null
  multi: boolean
  href: string
  contactPhone?: string | null
}

const GENDER_COLOR: Record<string, string> = {
  boys: "#374765",
  girls: "#c1583d",
  mixed: "#fe6f42",
}
function pinColor(g: string | null) {
  return (g && GENDER_COLOR[g]) || "#7a8294"
}
function genLabel(g: string | null) {
  return g === "boys" ? "בנים" : g === "girls" ? "בנות" : g === "mixed" ? "מעורבת" : "—"
}
function relLabel(r: string | null) {
  return r === "religious" ? "דתי" : r === "secular" ? "חילוני" : r === "mixed" ? "מעורב" : ""
}
function regionOf(lat: number) {
  return lat >= 32.5 ? "north" : lat >= 31.5 ? "center" : "south"
}
const REGION_LABEL: Record<string, string> = {
  north: "צפון",
  center: "מרכז · שפלה",
  south: "דרום",
}

function pinIcon(g: string | null) {
  return L.divIcon({
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${pinColor(
      g
    )};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function clusterIcon(cluster: { getChildCount: () => number }) {
  const n = cluster.getChildCount()
  return L.divIcon({
    html: `<div style="width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:#374765;color:#fff;font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:13px;box-shadow:0 0 0 6px rgba(55,71,101,0.22)">${n}</div>`,
    className: "",
    iconSize: [38, 38],
  })
}

export function BranchMap({ points }: { points: BranchPoint[] }) {
  const router = useRouter()
  const mapRef = useRef<L.Map | null>(null)
  const markerRefs = useRef<Record<string, L.Marker>>({})
  const [gender, setGender] = useState<string | null>(null)
  const [rel, setRel] = useState<string | null>(null)

  const visible = useMemo(
    () =>
      points.filter(
        (b) => (!gender || b.gender === gender) && (!rel || b.rel === rel)
      ),
    [points, gender, rel]
  )

  const academiesCount = new Set(visible.map((b) => b.academyName)).size
  const filterKey = `${gender ?? "-"}|${rel ?? "-"}|${visible.length}`

  // עץ לפי אזור → מכינה
  const tree = useMemo(() => {
    const groups: Record<string, Record<string, BranchPoint[]>> = {
      north: {},
      center: {},
      south: {},
    }
    for (const b of visible) {
      const r = regionOf(b.lat)
      ;(groups[r][b.academyName] ||= []).push(b)
    }
    return groups
  }, [visible])

  function focus(b: BranchPoint) {
    const map = mapRef.current
    if (!map) return
    map.flyTo([b.lat, b.lng], 12, { duration: 0.6 })
    setTimeout(() => markerRefs.current[b.id]?.openPopup(), 700)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* סינון */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-[var(--line-faint)] bg-[var(--surface-2)] px-3 py-2.5">
        <span className="me-1 font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
          סינון
        </span>
        <Chip active={!gender && !rel} onClick={() => { setGender(null); setRel(null) }}>
          הכל
        </Chip>
        <span className="mx-1 h-4 w-px bg-line" />
        <Chip active={gender === "boys"} onClick={() => setGender(gender === "boys" ? null : "boys")}>בנים</Chip>
        <Chip active={gender === "girls"} onClick={() => setGender(gender === "girls" ? null : "girls")}>בנות</Chip>
        <Chip active={gender === "mixed"} onClick={() => setGender(gender === "mixed" ? null : "mixed")}>מעורבת</Chip>
        <span className="mx-1 h-4 w-px bg-line" />
        <Chip active={rel === "religious"} onClick={() => setRel(rel === "religious" ? null : "religious")}>דתי</Chip>
        <Chip active={rel === "secular"} onClick={() => setRel(rel === "secular" ? null : "secular")}>חילוני</Chip>
        <Chip active={rel === "mixed"} onClick={() => setRel(rel === "mixed" ? null : "mixed")}>מעורב</Chip>
        <button
          onClick={() => { setGender(null); setRel(null) }}
          className="ms-auto rounded-md border border-line bg-surface px-2.5 py-1 text-[12px] text-fg-muted hover:bg-[var(--bg-subtle)]"
        >
          נקה
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px]">
        {/* מפה */}
        <div className="relative overflow-hidden rounded-md border border-line">
          <MapContainer
            ref={mapRef}
            center={[31.7, 35.0]}
            zoom={7}
            minZoom={3}
            maxBounds={[
              [-90, -180],
              [90, 180],
            ]}
            maxBoundsViscosity={1.0}
            scrollWheelZoom
            zoomControl={false}
            attributionControl={false}
            style={{ height: 480, width: "100%", background: "#dfe7f0" }}
          >
            <TileLayer
              noWrap
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* בקרת זום מותאמת */}
            <div className="leaflet-top leaflet-left">
              <div className="leaflet-control pointer-events-auto m-3 flex flex-col overflow-hidden rounded-md border border-line bg-surface shadow-[var(--shadow-sm)]">
                <button
                  onClick={() => mapRef.current?.zoomIn()}
                  aria-label="התקרב"
                  className="grid h-8 w-8 place-items-center border-b border-line text-primary transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => mapRef.current?.zoomOut()}
                  aria-label="התרחק"
                  className="grid h-8 w-8 place-items-center text-primary transition-colors hover:bg-[var(--bg-subtle)]"
                >
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <MarkerClusterGroup
              key={filterKey}
              showCoverageOnHover={false}
              maxClusterRadius={35}
              iconCreateFunction={clusterIcon}
            >
              {visible.map((b) => (
                <Marker
                  key={b.id}
                  position={[b.lat, b.lng]}
                  icon={pinIcon(b.gender)}
                  ref={(r) => {
                    if (r) markerRefs.current[b.id] = r
                  }}
                >
                  <Popup>
                    <div style={{ fontFamily: "Rubik, sans-serif", minWidth: 150 }}>
                      <div style={{ fontWeight: 600, color: "#374765", fontSize: 13.5 }}>
                        {b.academyName}
                        {b.multi && b.branchName ? ` | ${b.branchName}` : ""}
                      </div>
                      <div style={{ color: "#495264", fontSize: 12, marginTop: 2 }}>
                        {b.city ?? ""}
                        {b.multi ? " · שלוחה" : ""}
                        <br />
                        {genLabel(b.gender)}
                        {relLabel(b.rel) ? ` · ${relLabel(b.rel)}` : ""}
                      </div>
                      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => router.push(b.href)}
                          style={{
                            padding: "4px 10px",
                            fontSize: 11.5,
                            borderRadius: 4,
                            border: "1px solid #fe6f42",
                            background: "#fe6f42",
                            color: "#fff",
                            cursor: "pointer",
                          }}
                        >
                          פתח דשבורד
                        </button>
                        {b.contactPhone && (
                          <a
                            href={`tel:${b.contactPhone}`}
                            style={{
                              padding: "4px 10px",
                              fontSize: 11.5,
                              borderRadius: 4,
                              border: "1px solid var(--line, #d8d5cb)",
                              background: "#fff",
                              color: "#374765",
                              textDecoration: "none",
                            }}
                          >
                            צור קשר
                          </a>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>

        {/* רשימת מכינות לפי אזור */}
        <aside className="flex max-h-[480px] flex-col overflow-y-auto rounded-md border border-line bg-[var(--surface-2)] p-3">
          <h3 className="m-0 font-mono text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
            רשימת מכינות לפי אזור
          </h3>
          {visible.length === 0 ? (
            <p className="mt-2 text-[12px] text-fg-subtle">אין מכינות עם הסינון הזה.</p>
          ) : (
            (["north", "center", "south"] as const).map((k) => {
              const names = Object.keys(tree[k]).sort((x, y) => x.localeCompare(y, "he"))
              if (!names.length) return null
              return (
                <div key={k}>
                  <div className="mb-1 mt-2.5 text-[12.5px] font-semibold text-primary">
                    {REGION_LABEL[k]}
                    <span className="ms-1.5 font-mono text-[10px] font-normal text-fg-subtle">
                      {names.length} מכינות
                    </span>
                  </div>
                  {names.map((name) => {
                    const list = tree[k][name]
                    const meta = list.length === 1 ? list[0].city ?? "" : `${list.length} שלוחות`
                    return (
                      <button
                        key={name}
                        onClick={() => focus(list[0])}
                        className="flex w-full items-baseline justify-between gap-1.5 rounded px-2 py-1 text-start text-[12px] text-fg hover:bg-[var(--primary-soft)] hover:text-primary"
                      >
                        <span>{name}</span>
                        <span className="shrink-0 font-mono text-[10px] text-fg-subtle">{meta}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </aside>
      </div>

      {/* סטטיסטיקה */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11.5px] text-fg-muted">
        <span>
          מציג <b className="font-mono text-primary">{academiesCount}</b> מכינות ·{" "}
          <b className="font-mono text-primary">{visible.length}</b> שלוחות
        </span>
        <span className="ms-auto inline-flex items-center gap-3">
          <Legend color="#374765" label="בנים" />
          <Legend color="#c1583d" label="בנות" />
          <Legend color="#fe6f42" label="מעורבת" />
        </span>
      </div>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex h-[26px] items-center rounded-full border px-2.5 text-[12px] transition-colors ${
        active
          ? "border-primary bg-primary text-white"
          : "border-line bg-surface text-fg hover:bg-[var(--bg-subtle)]"
      }`}
    >
      {children}
    </button>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full border border-white shadow-[0_0_0_1px_var(--line)]" style={{ background: color }} />
      {label}
    </span>
  )
}

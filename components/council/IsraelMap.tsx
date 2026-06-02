"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react"
import israelMap from "@svg-maps/israel"

type District = { id: string; name: string; path: string }
const DISTRICTS: District[] = (israelMap as { locations: District[] }).locations

// הקרנה ל-viewBox של @svg-maps/israel (0 0 295 793).
function project(lng: number, lat: number): { x: number; y: number } {
  return { x: (lng - 34.40) * 215, y: (33.50 - lat) * 215 }
}

const MIN_SCALE = 1
const MAX_SCALE = 8

export type CityPoint = {
  id: string
  city: string
  count: number
  progressPct: number
  lat: number
  lng: number
  region: "north" | "center" | "south"
  href?: string
}

export function IsraelMap({ data }: { data: CityPoint[] }) {
  const router = useRouter()
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [hover, setHover] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)
  const isDraggingRef = useRef(false)
  const movedRef = useRef(false)

  const points = data.map((d) => ({ ...d, ...project(d.lng, d.lat) }))
  const maxCount = Math.max(1, ...points.map((p) => p.count))
  const radius = (n: number) => (5 + (n / maxCount) * 11) / scale
  // פונט גדול יותר בבסיס + counter-scale → גודל מסך קבוע ~14px בכל זום.
  const fontSize = 14 / scale
  // תוויות מוצגות מ-zoom 1.4 ומעלה — מונע עומס בתצוגה הכוללת.
  const showLabels = scale >= 1.4
  const color = (p: number) =>
    p >= 70 ? "var(--ai)" : p >= 40 ? "var(--accent)" : p > 0 ? "var(--warning)" : "var(--primary)"

  const byRegion = points.reduce(
    (a, p) => ((a[p.region].count += p.count), (a[p.region].cities += 1), a),
    { north: { count: 0, cities: 0 }, center: { count: 0, cities: 0 }, south: { count: 0, cities: 0 } }
  )
  const totalMapped = byRegion.north.count + byRegion.center.count + byRegion.south.count

  // הצמדה: בזום 1 הכל ממורכז; ככל שמזיימים מותר טווח טראנסלציה רחב יותר.
  function clamp(val: number, max: number) { return Math.max(-max, Math.min(max, val)) }
  function applyZoom(newScale: number, focusX = 0.5, focusY = 0.5) {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setScale((curScale) => {
      const ns = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale))
      if (ns === curScale) return curScale
      // התמקדות סביב נקודה כלשהי בקונטיינר (0..1)
      setTx((curTx) => {
        const cx = (focusX - 0.5) * rect.width
        const newTx = (curTx - cx) * (ns / curScale) + cx
        return clamp(newTx, (rect.width * (ns - 1)) / 2)
      })
      setTy((curTy) => {
        const cy = (focusY - 0.5) * rect.height
        const newTy = (curTy - cy) * (ns / curScale) + cy
        return clamp(newTy, (rect.height * (ns - 1)) / 2)
      })
      return ns
    })
  }

  // wheel — listener נטיב עם passive:false כדי לעצור גלילת דף.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const fx = (e.clientX - rect.left) / rect.width
      const fy = (e.clientY - rect.top) / rect.height
      const factor = e.deltaY > 0 ? 1 / 1.18 : 1.18
      applyZoom(scale * factor, fx, fy)
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [scale])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, tx, ty }
    isDraggingRef.current = true
    movedRef.current = false
  }, [tx, ty])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true
    const el = containerRef.current!
    const rect = el.getBoundingClientRect()
    setTx(clamp(dragRef.current.tx + dx, (rect.width * (scale - 1)) / 2))
    setTy(clamp(dragRef.current.ty + dy, (rect.height * (scale - 1)) / 2))
  }, [scale])

  const onMouseUp = useCallback(() => {
    dragRef.current = null
    isDraggingRef.current = false
  }, [])

  function reset() { setScale(1); setTx(0); setTy(0) }

  const zoomPct = Math.round(scale * 100)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
      <div className="relative">
        <div className="absolute end-3 top-3 z-10 flex flex-col gap-1.5">
          <ZoomBtn onClick={() => applyZoom(scale * 1.4)} title="זום פנימה"><ZoomIn className="h-4 w-4" /></ZoomBtn>
          <ZoomBtn onClick={() => applyZoom(scale / 1.4)} title="זום החוצה"><ZoomOut className="h-4 w-4" /></ZoomBtn>
          <ZoomBtn onClick={reset} title="איפוס"><Maximize2 className="h-4 w-4" /></ZoomBtn>
        </div>
        <div className="absolute start-3 top-3 z-10 rounded-md border border-line bg-surface/90 px-2 py-1 font-mono text-[11px] text-fg-subtle backdrop-blur">
          {zoomPct}%
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto overflow-hidden rounded-md bg-[var(--bg-subtle)] h-[440px] md:h-[520px]"
          style={{ cursor: isDraggingRef.current ? "grabbing" : "grab", touchAction: "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <svg
            viewBox="-10 -10 315 813"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full drop-shadow-[0_18px_24px_rgba(40,55,90,0.18)]"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="מפת ישראל"
            style={{
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              transformOrigin: "center center",
              transition: dragRef.current ? "none" : "transform 0.18s ease-out",
            }}
          >
            <defs>
              <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--surface)" />
                <stop offset="100%" stopColor="var(--bg-subtle)" />
              </linearGradient>
              <radialGradient id="dotGloss">
                <stop offset="0%" stopColor="white" stopOpacity="0.85" />
                <stop offset="60%" stopColor="white" stopOpacity="0" />
              </radialGradient>
            </defs>

            <g>
              {DISTRICTS.map((d) => (
                <path key={d.id} d={d.path} fill="url(#landGrad)"
                  stroke="var(--line-strong)" strokeWidth={0.6 / scale}
                  strokeLinejoin="round" />
              ))}
            </g>

            {points.map((p) => {
              const r = radius(p.count)
              const c = color(p.progressPct)
              const active = hover === p.id
              const labelOnRight = p.x < 150
              // pill מאחורי הטקסט — קונטרסט גם על רקע מפה.
              const labelVisible = showLabels || active
              const labelText = `${p.city} · ${p.count}`
              const pillH = fontSize * 1.5
              const pillW = labelText.length * fontSize * 0.62 + fontSize * 0.9
              const pillX = labelOnRight ? p.x + r + 3 : p.x - r - 3 - pillW
              const pillY = p.y - pillH / 2
              return (
                <g key={p.id} style={{ cursor: "pointer" }}
                   onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}
                   onClick={() => { if (!movedRef.current && p.href) router.push(p.href) }}>
                  <circle cx={p.x} cy={p.y} r={r + 7 / scale} fill={c}
                          fillOpacity={active ? 0.28 : 0.14}>
                    <animate attributeName="r"
                             values={`${r + 7 / scale};${r + 11 / scale};${r + 7 / scale}`}
                             dur="2.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={p.x} cy={p.y} r={r} fill={c}
                          stroke="var(--surface)" strokeWidth={1.8 / scale} />
                  <circle cx={p.x - r * 0.3} cy={p.y - r * 0.3} r={r * 0.55}
                          fill="url(#dotGloss)" pointerEvents="none" />
                  {labelVisible && (
                    <g pointerEvents="none" style={{ opacity: labelVisible ? 1 : 0, transition: "opacity .15s" }}>
                      <rect x={pillX} y={pillY} width={pillW} height={pillH}
                            rx={pillH * 0.3}
                            fill={active ? "var(--primary)" : "var(--surface)"}
                            stroke={active ? "var(--primary)" : "var(--line)"}
                            strokeWidth={0.6 / scale} />
                      <text x={pillX + pillW / 2} y={p.y + fontSize * 0.34}
                            fontFamily="Rubik, sans-serif"
                            fontSize={fontSize}
                            fontWeight={active ? 700 : 600}
                            textAnchor="middle"
                            fill={active ? "white" : "var(--fg)"}>
                        {labelText}
                      </text>
                    </g>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-fg-muted">
          <Legend color="var(--ai)" label="גיוס ≥ 70%" />
          <Legend color="var(--accent)" label="40–70%" />
          <Legend color="var(--warning)" label="מתחת ל-40%" />
          <Legend color="var(--primary)" label="טרם התחיל" />
          <span className="ms-auto inline-flex items-center gap-1.5 text-fg-subtle">
            {showLabels ? "תוויות שלוחות" : "זום פנימה לחשיפת תוויות"} · לחיצה לפרטי שלוחה · גלילה/גרירה
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <RegionRow label="צפון" {...byRegion.north} total={totalMapped} />
        <RegionRow label="מרכז" {...byRegion.center} total={totalMapped} />
        <RegionRow label="דרום" {...byRegion.south} total={totalMapped} />
        <div className="mt-2 rounded-md border border-line bg-[var(--bg-subtle)] p-3">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-fg-subtle">שלוחות על המפה</div>
          <div className="mt-0.5 text-[22px] font-bold text-primary [font-variant-numeric:tabular-nums]">{points.length}</div>
          <div className="mt-0.5 text-[11.5px] text-fg-muted">לפי עיר השלוחה</div>
        </div>
      </div>
    </div>
  )
}

function ZoomBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button onClick={onClick} title={title}
      className="grid h-8 w-8 place-items-center rounded-md border border-line bg-surface text-fg-muted shadow-sm transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg">
      {children}
    </button>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  )
}

function RegionRow({ label, count, cities, total }: { label: string; count: number; cities: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="rounded-md border border-line bg-surface p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-fg">{label}</span>
        <span className="font-mono text-[11.5px] text-fg-subtle">{cities} שלוחות</span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="text-[20px] font-bold text-primary [font-variant-numeric:tabular-nums]">{count}</span>
        <span className="text-[11.5px] text-fg-subtle">מועמדים · {pct}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-muted)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-hover))" }} />
      </div>
    </div>
  )
}

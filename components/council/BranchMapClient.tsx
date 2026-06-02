"use client"

import dynamic from "next/dynamic"
import type { BranchPoint } from "./BranchMap"

const BranchMap = dynamic(
  () => import("./BranchMap").then((m) => m.BranchMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[480px] place-items-center rounded-md border border-line bg-[var(--bg-subtle)] text-[13px] text-fg-muted">
        טוען מפה…
      </div>
    ),
  }
)

export function BranchMapClient({ points }: { points: BranchPoint[] }) {
  return <BranchMap points={points} />
}

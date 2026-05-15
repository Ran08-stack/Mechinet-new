"use client"

import { useState } from "react"
import { Link2, Check } from "lucide-react"

export default function CopyLinkButton({ formId }: { formId: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(
      `${window.location.origin}/apply/${formId}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex h-[30px] items-center gap-1.5 rounded-md border border-line bg-surface px-3 text-[12.5px] text-fg-muted transition-colors hover:bg-[var(--bg-subtle)] hover:text-fg"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          הועתק
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5" />
          העתק קישור
        </>
      )}
    </button>
  )
}

"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Organization } from "@/types/database"
import { useRouter } from "next/navigation"

export default function OrgSettings({ org }: { org: Organization }) {
  const [name, setName] = useState(org.name)
  const [logoUrl, setLogoUrl] = useState(org.logo_url ?? "")
  const [genderPolicy, setGenderPolicy] = useState(org.gender_policy ?? "mixed")
  const [religiousPolicy, setReligiousPolicy] = useState(
    org.religious_policy ?? "mixed"
  )
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `logos/${org.id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(path, file, { upsert: true })
    if (uploadError) {
      setError("שגיאה בהעלאת הלוגו: " + uploadError.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from("attachments").getPublicUrl(path)
    const newLogoUrl = data.publicUrl
    setLogoUrl(newLogoUrl)
    // שמירה אוטומטית אחרי העלאה
    const { error: updateError } = await supabase
      .from("organizations")
      .update({ logo_url: newLogoUrl })
      .eq("id", org.id)
    if (updateError) {
      setError("הלוגו הועלה אבל לא נשמר: " + updateError.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    }
    setUploading(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        name,
        logo_url: logoUrl || null,
        gender_policy: genderPolicy,
        religious_policy: religiousPolicy,
      })
      .eq("id", org.id)
    if (updateError) {
      setError("שגיאה בשמירה")
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="border-b border-[var(--line-faint)] px-[18px] py-3.5">
        <h2 className="m-0 text-[15px] font-semibold text-primary">פרטי המכינה</h2>
      </div>
      <div className="p-[18px]">

      {/* לוגו */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-line bg-[var(--bg-subtle)]">
          {logoUrl ? (
            <img src={logoUrl} alt="לוגו" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-[var(--fg-faint)]">?</span>
          )}
        </div>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-sm text-primary transition-colors hover:text-accent disabled:opacity-50"
          >
            {uploading ? "מעלה..." : "העלה לוגו"}
          </button>
          <p className="mt-0.5 text-xs text-fg-subtle">PNG / JPG, עד 2MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </div>
      </div>

      {/* שם */}
      <div className="mb-5">
        <label className="mb-1 block text-xs font-medium text-fg-subtle">שם המכינה</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-line bg-surface px-4 py-2 text-sm outline-none focus:border-accent focus:shadow-[var(--shadow-focus)]"
          dir="rtl"
        />
      </div>

      {/* סוג מכינה — מגדר */}
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-medium text-fg-subtle">
          הרכב מגדרי
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "mixed", label: "מעורב בנים-בנות" },
            { value: "boys_only", label: "בנים בלבד" },
            { value: "girls_only", label: "בנות בלבד" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGenderPolicy(opt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                genderPolicy === opt.value
                  ? "border-accent bg-[var(--accent-soft)] font-medium text-[var(--accent-hover)]"
                  : "border-line text-fg-muted hover:bg-[var(--bg-subtle)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* סוג מכינה — אופי דתי */}
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-medium text-fg-subtle">
          אופי דתי
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "religious", label: "דתי" },
            { value: "secular", label: "חילוני" },
            { value: "mixed", label: "מעורב דתי-חילוני" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setReligiousPolicy(opt.value)}
              className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                religiousPolicy === opt.value
                  ? "border-accent bg-[var(--accent-soft)] font-medium text-[var(--accent-hover)]"
                  : "border-line text-fg-muted hover:bg-[var(--bg-subtle)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-[var(--danger)]">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-3)] disabled:opacity-50"
        >
          {saving ? "שומר..." : "שמור"}
        </button>
        {saved && <span className="text-sm text-[var(--stage-accepted-fg)]">נשמר</span>}
      </div>
      </div>
    </div>
  )
}

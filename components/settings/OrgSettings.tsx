"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Organization } from "@/types/database"
import { useRouter } from "next/navigation"
import { Upload, Trash2 } from "lucide-react"

// פרטי המכינה — קלפים בעיצוב לפי המוקאפ.
// שמירה לכל שדה ע"י Save/Discard בתחתית, או שמירה אוטומטית לקלפים פשוטים.
// כרגע: שמירה ע"י כפתור.

export default function OrgSettings({ org }: { org: Organization }) {
  const [name, setName] = useState(org.name)
  const [branchName, setBranchName] = useState(org.branch_name ?? "")
  const [logoUrl, setLogoUrl] = useState(org.logo_url ?? "")
  const [genderPolicy, setGenderPolicy] = useState(
    org.gender_policy ?? "mixed"
  )
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
      setError("שגיאה בהעלאת הלוגו")
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from("attachments").getPublicUrl(path)
    const newLogoUrl = `${data.publicUrl}?v=${Date.now()}`
    setLogoUrl(newLogoUrl)
    const { error: updateError } = await supabase
      .from("organizations")
      .update({ logo_url: newLogoUrl })
      .eq("id", org.id)
    if (updateError) {
      setError("הלוגו הועלה אבל לא נשמר")
    } else {
      flashSaved()
      router.refresh()
    }
    setUploading(false)
  }

  async function removeLogo() {
    const supabase = createClient()
    setLogoUrl("")
    await supabase
      .from("organizations")
      .update({ logo_url: null })
      .eq("id", org.id)
    router.refresh()
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        name,
        branch_name: branchName.trim() || null,
        gender_policy: genderPolicy,
        religious_policy: religiousPolicy,
      })
      .eq("id", org.id)
    if (updateError) {
      setError("שגיאה בשמירה")
    } else {
      flashSaved()
      router.refresh()
    }
    setSaving(false)
  }

  function flashSaved() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const initial = name.trim().charAt(0) || "מ"

  return (
    <section
      id="org-details"
      className="overflow-hidden rounded-lg border border-line bg-surface scroll-mt-24"
    >
      <div className="border-b border-[var(--line-faint)] px-[22px] py-[18px]">
        <h2 className="m-0 text-[17px] font-semibold tracking-[-0.005em] text-primary">
          פרטי המכינה
        </h2>
        <p className="mt-0.5 text-[12.5px] text-fg-subtle">
          הפרטים שמופיעים למועמדים ולמועצת המכינות
        </p>
      </div>

      <div className="px-[22px] py-[22px]">
        {/* לוגו */}
        <Row label="סמל המכינה" hint="PNG / JPG · ריבועי · מינימום 256px">
          <div className="flex items-center gap-4">
            <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-primary text-[28px] font-bold tracking-[-0.04em] text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.10)]">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="לוגו"
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-surface px-3 text-[13px] font-medium text-fg hover:bg-[var(--bg-subtle)] disabled:opacity-60"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "מעלה…" : "העלאת לוגו"}
                </button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-[13px] font-medium"
                    style={{
                      color: "var(--danger)",
                      borderColor: "#f4b8a8",
                      background: "var(--surface)",
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    הסר
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
              <p className="m-0 text-[11.5px] text-fg-subtle">
                יוצג ב-Sidebar, בכרטיסי מועמד ובטופס הציבורי.
              </p>
            </div>
          </div>
        </Row>

        {/* שם המכינה */}
        <Row label="שם המכינה" hint="שם רשמי לכל ההצגות">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            dir="rtl"
          />
        </Row>

        {/* שם השלוחה */}
        <Row
          label="שם השלוחה"
          hint='לדוגמה: "שלוחת אורנים" (לא חובה). יוצג כתת-תווית מתחת לשם המכינה.'
        >
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="ללא"
            className={inputCls}
            dir="rtl"
          />
        </Row>

        {/* סוג מכינה */}
        <Row
          label="סוג מכינה"
          hint="כל המכינות במערכת שנתיות. הסיווג מופיע בפילוח של המועצה."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
                הרכב מגדרי
              </p>
              <select
                value={genderPolicy}
                onChange={(e) => setGenderPolicy(e.target.value)}
                className={inputCls}
              >
                <option value="mixed">מעורב · בנים ובנות</option>
                <option value="boys_only">בנים בלבד</option>
                <option value="girls_only">בנות בלבד</option>
              </select>
            </div>
            <div>
              <p className="mb-1.5 text-[11px] uppercase tracking-[0.06em] text-fg-subtle">
                אופי דתי
              </p>
              <select
                value={religiousPolicy}
                onChange={(e) => setReligiousPolicy(e.target.value)}
                className={inputCls}
              >
                <option value="religious">דתי</option>
                <option value="secular">חילוני</option>
                <option value="mixed">מעורב · דתי וחילוני</option>
              </select>
            </div>
          </div>
        </Row>
      </div>

      <div className="flex items-center gap-3 border-t border-line bg-[var(--bg-subtle)] px-[22px] py-3.5 text-[13px]">
        {error && (
          <span className="text-[var(--danger)] text-[12.5px]">{error}</span>
        )}
        {saved && (
          <span className="text-[var(--stage-accepted-fg)] text-[12.5px]">
            נשמר
          </span>
        )}
        <span className="ms-auto" />
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-[13px] font-medium text-white hover:bg-[var(--primary-2)] disabled:opacity-60"
        >
          {saving ? "שומר…" : "שמור שינויים"}
        </button>
      </div>
    </section>
  )
}

const inputCls =
  "h-10 w-full rounded-md border border-line bg-surface px-3 text-[13px] text-fg outline-none placeholder:text-fg-subtle focus:border-accent focus:shadow-[var(--shadow-focus)]"

function Row({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-3 border-b border-[var(--line-faint)] py-3.5 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-[200px_1fr] sm:gap-6">
      <div className="sm:pt-2">
        <p className="m-0 text-[13px] font-semibold text-fg">{label}</p>
        {hint && (
          <p className="mt-1 text-[11.5px] leading-[1.5] text-fg-subtle">
            {hint}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

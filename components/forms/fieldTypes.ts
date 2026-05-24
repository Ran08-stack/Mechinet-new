// הגדרת טיפוסי שדות v3 — לפי 08 Form Builder v3.html

import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  CreditCard,
  Link2,
  Circle,
  SquareCheck,
  ChevronDown,
  Star,
  Hash,
  Calendar,
  Upload,
  PenLine,
  Heading,
  Info,
  type LucideIcon,
} from "lucide-react"
import { FormFieldType, FormField } from "@/types/database"

export type FieldTypeMeta = {
  id: FormFieldType
  label: string
  icon: LucideIcon
  group: "text" | "choice" | "numdate" | "upload" | "layout"
}

export const FIELD_TYPES: FieldTypeMeta[] = [
  { id: "short_text", label: "טקסט קצר", icon: Type, group: "text" },
  { id: "long_text", label: "פסקה", icon: AlignLeft, group: "text" },
  { id: "email", label: "אימייל", icon: Mail, group: "text" },
  { id: "phone", label: "טלפון", icon: Phone, group: "text" },
  { id: "id_number", label: "תעודת זהות", icon: CreditCard, group: "text" },
  { id: "url", label: "קישור", icon: Link2, group: "text" },
  { id: "radio", label: "בחירה יחידה", icon: Circle, group: "choice" },
  { id: "checkbox", label: "בחירה מרובה", icon: SquareCheck, group: "choice" },
  { id: "dropdown", label: "רשימה נפתחת", icon: ChevronDown, group: "choice" },
  { id: "rating", label: "דירוג כוכבים", icon: Star, group: "choice" },
  { id: "number", label: "מספר", icon: Hash, group: "numdate" },
  { id: "date", label: "תאריך", icon: Calendar, group: "numdate" },
  { id: "file", label: "העלאת קובץ", icon: Upload, group: "upload" },
  { id: "signature", label: "חתימה", icon: PenLine, group: "upload" },
  { id: "section", label: "כותרת מקטע", icon: Heading, group: "layout" },
  { id: "info", label: "טקסט הסבר", icon: Info, group: "layout" },
]

export const GROUP_LABELS: Record<FieldTypeMeta["group"], string> = {
  text: "טקסט",
  choice: "בחירה",
  numdate: "מספר ותאריך",
  upload: "העלאה וחתימה",
  layout: "מבנה",
}

// תיווך — לטיפוסים ישנים שכבר קיימים ב-DB
export function normalizeType(t: string): FormFieldType {
  switch (t) {
    case "text":
      return "short_text"
    case "textarea":
      return "long_text"
    case "select":
      return "dropdown"
    case "multiselect":
      return "checkbox"
    case "autocomplete":
      return "short_text"
    case "video":
      return "file"
    default:
      return t as FormFieldType
  }
}

export function getTypeMeta(t: string): FieldTypeMeta {
  const norm = normalizeType(t)
  return FIELD_TYPES.find((f) => f.id === norm) ?? FIELD_TYPES[0]
}

export const HAS_OPTIONS: FormFieldType[] = ["radio", "checkbox", "dropdown", "select", "multiselect"]
export const HAS_PLACEHOLDER: FormFieldType[] = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "id_number",
  "url",
  "number",
  "text",
  "textarea",
]

let nextLocalId = 1
export function uid(): string {
  return `f${Date.now().toString(36)}${nextLocalId++}`
}

export function newField(type: FormFieldType): FormField {
  const meta = FIELD_TYPES.find((f) => f.id === type)
  const f: FormField = {
    id: uid(),
    type,
    label: meta?.label ?? "שדה חדש",
    required: false,
  }
  if (HAS_OPTIONS.includes(type))
    f.options = ["אפשרות א׳", "אפשרות ב׳", "אפשרות ג׳"]
  if (type === "rating") f.max = 5
  if (type === "file") f.accept = "PDF, JPG · עד 10MB"
  if (type === "section") f.label = "כותרת מקטע"
  if (type === "info") {
    f.label = "הסבר למילוי"
    f.help = "טקסט הסבר שיוצג למועמד מתחת לכותרת."
  }
  return f
}

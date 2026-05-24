import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null): string {
  if (!date) return "—"
  return new Date(date).toLocaleDateString("he-IL")
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
}

// נרמול מספר טלפון — ספרות בלבד, מוגבל ל-10.
// משמש בכל מקום שמזינים טלפון בפרויקט (טופס הגשה, מועמד חדש).
export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10)
}

// fallback labels — בשימוש רק אם השלב לא נמצא ב-pipeline_stages
// (למשל ערכים legacy שעוד לא עברו migration).
export const STAGE_LABELS: Record<string, string> = {
  new: "חדש",
  review: "בבדיקה",
  interview: "ראיון",
  accepted: "התקבל",
  rejected: "נדחה",
}

// צבע ברירת מחדל אם השלב לא מצא צבע משלו
export const DEFAULT_STAGE_COLOR = "bg-gray-100 text-gray-700"

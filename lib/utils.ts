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

export const STAGE_LABELS: Record<string, string> = {
  new: "חדש",
  review: "בבדיקה",
  interview: "ראיון",
  accepted: "התקבל",
  rejected: "נדחה",
}

export const STAGE_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  review: "bg-blue-100 text-blue-700",
  interview: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
}

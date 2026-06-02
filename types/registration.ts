import { Tables } from "./database"

// בקשת הרשמה של מכינה (self-service) + מבנה השלוחות המבוקשות (JSONB).

export type RegistrationRequest = Tables<"registration_requests">

export type RegistrationStatus = "pending" | "approved" | "rejected"

export type RequestedBranch = {
  branch_name: string
  city: string | null
  link_org_id?: string | null // קישור אופציונלי לשלוחת directory קיימת (מניעת כפילות)
  gender_policy?: string | null
  religious_policy?: string | null
}

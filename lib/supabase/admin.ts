import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

// Service-role client — עוקף RLS. שימוש server-side בלבד.
// SUPABASE_SERVICE_ROLE_KEY חייב להיות מוגדר ב-env.

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

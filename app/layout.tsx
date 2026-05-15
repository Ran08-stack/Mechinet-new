import type { Metadata } from "next"
import "./globals.css"
import { createClient } from "@/lib/supabase/server"
import AccountSwitcher from "@/components/dev/AccountSwitcher"

export const metadata: Metadata = {
  title: "מכינט",
  description: "ניהול מועמדויות למכינות קדם-צבאיות",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // שליפת ה-role של המשתמש המחובר — עבור מתג החלפת החשבונות
  let role: string | null = null
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single()
      role = userData?.role ?? null
    }
  } catch {
    // שקט — מתג ההחלפה הוא כלי עזר, לא חוסם את האפליקציה
  }

  return (
    <html lang="he" dir="rtl">
      <body className="font-sans">
        {children}
        {role && <AccountSwitcher currentRole={role} />}
      </body>
    </html>
  )
}

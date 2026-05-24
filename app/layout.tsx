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
  // המתג מוצג רק ב-dev mode ולמשתמש המאסטר (rapran333@gmail.com)
  const DEV_USER_EMAIL = "rapran333@gmail.com"
  const IS_DEV = process.env.NODE_ENV !== "production"
  let role: string | null = null
  let showSwitcher = false
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role, email")
        .eq("id", user.id)
        .single()
      role = userData?.role ?? null
      // הערה: IS_DEV מחושב אבל לא בשימוש כרגע — רן צריך גישה גם ב-production
      void IS_DEV
      showSwitcher = userData?.email === DEV_USER_EMAIL
    }
  } catch {
    // שקט — מתג ההחלפה הוא כלי עזר, לא חוסם את האפליקציה
  }

  return (
    <html lang="he" dir="rtl">
      <body className="font-sans">
        {children}
        {showSwitcher && role && <AccountSwitcher currentRole={role} />}
      </body>
    </html>
  )
}

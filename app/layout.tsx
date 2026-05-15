import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "מכינט",
  description: "ניהול מועמדויות למכינות קדם-צבאיות",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="font-sans">{children}</body>
    </html>
  )
}

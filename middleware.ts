import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// ניתוב לפי role:
// - council_admin  -> /council
// - כל השאר (מכינה) -> /dashboard
// אם אין משתמש -> /login (רק על דפים מוגנים)
// העיקרון: עדין. רק מנתב כשברור, לא חוסם סתם.

// throttle ל-last_login_at: פעם בשעה לכל user (in-memory, מתאפס ב-cold start — מקובל)
const LAST_LOGIN_THROTTLE_MS = 60 * 60 * 1000
const lastLoginTouched = new Map<string, number>()

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isDashboard = path.startsWith("/dashboard") ||
    path.startsWith("/candidates") ||
    path.startsWith("/pipeline") ||
    path.startsWith("/forms") ||
    path.startsWith("/calendar") ||
    path.startsWith("/interviews") ||
    path.startsWith("/settings")
  const isCouncil = path.startsWith("/council")

  // לא מחובר ומנסה להיכנס לאזור מוגן -> login
  if (!user && (isDashboard || isCouncil)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // מחובר — בודקים role לניתוב
  if (user && (isDashboard || isCouncil)) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    // משתמש מחובר ב-auth אבל אין שורה בטבלת users -> /login (במקום לולאה)
    if (!userData) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const isCouncilUser = userData.role === "council_admin"

    // עדכון last_login_at עם throttle (פעם בשעה)
    const now = Date.now()
    const lastTouched = lastLoginTouched.get(user.id) ?? 0
    if (now - lastTouched > LAST_LOGIN_THROTTLE_MS) {
      lastLoginTouched.set(user.id, now)
      // fire and forget — לא לעכב את הניתוב
      void supabase
        .from("users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", user.id)
    }

    // משתמש מועצה שמנסה להיכנס לאזור מכינה -> /council
    if (isCouncilUser && isDashboard) {
      return NextResponse.redirect(new URL("/council", request.url))
    }
    // משתמש מכינה שמנסה להיכנס לאזור מועצה -> /dashboard
    if (!isCouncilUser && isCouncil) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return response
}

// matcher מוגבל רק לראוטים שבאמת צריכים בדיקת role.
// כל שאר הראוטים (assets, public, api, login, apply) לא טוענים DB.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/candidates/:path*",
    "/pipeline/:path*",
    "/forms/:path*",
    "/calendar/:path*",
    "/interviews/:path*",
    "/settings/:path*",
    "/team/:path*",
    "/council/:path*",
  ],
}

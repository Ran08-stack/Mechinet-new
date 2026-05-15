import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// ניתוב לפי role:
// - council_admin  -> /council
// - כל השאר (מכינה) -> /dashboard
// אם אין משתמש -> /login (רק על דפים מוגנים)
// העיקרון: עדין. רק מנתב כשברור, לא חוסם סתם.

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

    const role = userData?.role
    const isCouncilUser = role === "council_admin"

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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|apply|api).*)",
  ],
}

import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  try {
    // IMPORTANT: getUser() prevents random logouts and refreshes the session
    const { data, error } = await supabase.auth.getUser()

    // Only handle actual errors, not "no session" state
    if (error) {
      // "Auth session missing!" is normal when user is not logged in
      // Only clear cookies for actual corruption errors
      if (error.message !== "Auth session missing!" && !error.message.includes("session_not_found")) {
        console.error("[v0] Auth error in middleware:", error.message)

        // Clear all Supabase auth cookies to allow fresh authentication
        const cookiesToClear = request.cookies
          .getAll()
          .filter((cookie) => cookie.name.startsWith("sb-") || cookie.name.includes("auth-token"))

        cookiesToClear.forEach(({ name }) => {
          supabaseResponse.cookies.delete(name)
        })
      }
      // If it's just "no session", that's fine - user isn't logged in
    }
  } catch (error) {
    console.error("[v0] Unexpected error in middleware:", error)
    // Clear auth cookies on any unexpected error
    const cookiesToClear = request.cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-") || cookie.name.includes("auth-token"))

    cookiesToClear.forEach(({ name }) => {
      supabaseResponse.cookies.delete(name)
    })
  }

  return supabaseResponse
}

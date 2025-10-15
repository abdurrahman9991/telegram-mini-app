import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createServerClient()

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const { data: existingUser } = await supabase.from("users").select("id").eq("id", data.user.id).maybeSingle()

      if (!existingUser) {
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        await supabase.from("users").insert({
          id: data.user.id,
          username: data.user.email?.split("@")[0] || "user",
          first_name: data.user.email?.split("@")[0] || "User",
          referral_code: referralCode,
          telegram_id: null,
        })
      }
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}

import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Telegram WebApp data verification
function verifyTelegramWebAppData(initData: string, botToken: string): boolean {
  const urlParams = new URLSearchParams(initData)
  const hash = urlParams.get("hash")
  urlParams.delete("hash")

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest()

  const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

  return calculatedHash === hash
}

export async function POST(request: NextRequest) {
  try {
    const { initData, referralCode } = await request.json()

    // Verify Telegram data (in production, use real bot token from env)
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "test_token"

    // Skip verification in development
    if (process.env.NODE_ENV === "production") {
      const isValid = verifyTelegramWebAppData(initData, botToken)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid Telegram data" }, { status: 401 })
      }
    }

    // Parse Telegram user data
    const urlParams = new URLSearchParams(initData)
    const userDataStr = urlParams.get("user")
    if (!userDataStr) {
      return NextResponse.json({ error: "No user data provided" }, { status: 400 })
    }

    const telegramUser = JSON.parse(userDataStr)
    const supabase = await createClient()

    // Check if user exists
    const { data: existingUser } = await supabase.from("users").select("*").eq("telegram_id", telegramUser.id).single()

    if (existingUser) {
      // User exists, return user data
      return NextResponse.json({ user: existingUser })
    }

    // Create new user
    const newUser = {
      telegram_id: telegramUser.id,
      username: telegramUser.username || null,
      first_name: telegramUser.first_name || null,
      last_name: telegramUser.last_name || null,
      photo_url: telegramUser.photo_url || null,
      referral_code: crypto.randomBytes(4).toString("hex").toUpperCase(),
      referred_by: null,
    }

    // If referral code provided, find referrer
    if (referralCode) {
      const { data: referrer } = await supabase.from("users").select("id").eq("referral_code", referralCode).single()

      if (referrer) {
        newUser.referred_by = referrer.id
      }
    }

    const { data: createdUser, error } = await supabase.from("users").insert(newUser).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If user was referred, give bonus to referrer
    if (createdUser.referred_by) {
      await supabase.rpc("add_transaction", {
        p_user_id: createdUser.referred_by,
        p_type: "referral_bonus",
        p_amount: 5.0,
        p_description: "Referral bonus",
        p_metadata: { referred_user_id: createdUser.id },
      })
    }

    return NextResponse.json({ user: createdUser })
  } catch (error) {
    console.error("[v0] Auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

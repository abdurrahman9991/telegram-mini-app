import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const telegramId = searchParams.get("telegram_id")

    if (!telegramId) {
      return NextResponse.json({ error: "telegram_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user
    const { data: user } = await supabase
      .from("users")
      .select("id, referral_code")
      .eq("telegram_id", Number.parseInt(telegramId))
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Count referrals
    const { count: referralCount } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("referred_by", user.id)

    // Calculate total referral earnings
    const { data: referralTransactions } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("type", "referral_bonus")

    const totalEarnings = referralTransactions?.reduce((sum, t) => sum + Number.parseFloat(t.amount.toString()), 0) || 0

    return NextResponse.json({
      referral_code: user.referral_code,
      referral_count: referralCount || 0,
      total_earnings: totalEarnings,
    })
  } catch (error) {
    console.error("[v0] Referral stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

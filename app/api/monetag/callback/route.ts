import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const { telegramId, adType, revenue } = await request.json()

    if (!telegramId || !adType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user ID
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", Number.parseInt(telegramId))
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const rewardAmount = config.rewards.adView

    // Add transaction
    const { error } = await supabase.rpc("add_transaction", {
      p_user_id: user.id,
      p_type: "ad_reward",
      p_amount: rewardAmount,
      p_description: `Watched ${adType} ad`,
      p_metadata: { ad_type: adType, revenue: revenue || 0 },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      reward: rewardAmount,
    })
  } catch (error) {
    console.error("[v0] Monetag callback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const telegramId = searchParams.get("telegram_id")

    const supabase = await createClient()

    // Refresh the materialized view (in production, do this periodically via cron)
    await supabase.rpc("refresh_leaderboard")

    // Get top users from leaderboard
    const { data: leaderboard, error } = await supabase
      .from("leaderboard")
      .select("*")
      .order("rank", { ascending: true })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    let userRank = null

    // If telegram_id provided, get user's rank
    if (telegramId) {
      const { data: userEntry } = await supabase
        .from("leaderboard")
        .select("rank, total_earned")
        .eq("telegram_id", Number.parseInt(telegramId))
        .single()

      if (userEntry) {
        userRank = {
          rank: userEntry.rank,
          total_earned: userEntry.total_earned,
        }
      }
    }

    return NextResponse.json({
      leaderboard,
      user_rank: userRank,
    })
  } catch (error) {
    console.error("[v0] Leaderboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

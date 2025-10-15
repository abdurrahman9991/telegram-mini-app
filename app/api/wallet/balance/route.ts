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

    const { data: user, error } = await supabase
      .from("users")
      .select("id, balance, total_earned")
      .eq("telegram_id", Number.parseInt(telegramId))
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      balance: user.balance,
      total_earned: user.total_earned,
    })
  } catch (error) {
    console.error("[v0] Wallet balance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

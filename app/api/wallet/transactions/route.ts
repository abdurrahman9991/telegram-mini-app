import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const telegramId = searchParams.get("telegram_id")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    if (!telegramId) {
      return NextResponse.json({ error: "telegram_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user ID first
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", Number.parseInt(telegramId))
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get transactions
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("[v0] Wallet transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

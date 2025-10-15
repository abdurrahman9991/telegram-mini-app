import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { telegramId, type, amount, description, metadata } = await request.json()

    if (!telegramId || !type || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user ID
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", Number.parseInt(telegramId))
      .single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Add transaction using the helper function
    const { data, error } = await supabase.rpc("add_transaction", {
      p_user_id: user.id,
      p_type: type,
      p_amount: Number.parseFloat(amount),
      p_description: description || null,
      p_metadata: metadata || {},
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get updated balance
    const { data: updatedUser } = await supabase
      .from("users")
      .select("balance, total_earned")
      .eq("id", user.id)
      .single()

    return NextResponse.json({
      transaction_id: data,
      balance: updatedUser?.balance,
      total_earned: updatedUser?.total_earned,
    })
  } catch (error) {
    console.error("[v0] Add reward error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

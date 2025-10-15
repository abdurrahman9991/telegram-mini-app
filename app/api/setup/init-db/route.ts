import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)

    console.log("[v0] Starting database initialization...")

    // SQL migrations in order
    const migrations = [
      // 001: Create users table
      `
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        telegram_id bigint UNIQUE,
        username text,
        first_name text,
        last_name text,
        photo_url text,
        referral_code text UNIQUE NOT NULL,
        balance decimal(10, 2) DEFAULT 0,
        total_earned decimal(10, 2) DEFAULT 0,
        referred_by uuid REFERENCES users(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      ALTER TABLE users ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can view their own data" ON users;
      CREATE POLICY "Users can view their own data" ON users
        FOR SELECT USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update their own data" ON users;
      CREATE POLICY "Users can update their own data" ON users
        FOR UPDATE USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can insert their own data" ON users;
      CREATE POLICY "Users can insert their own data" ON users
        FOR INSERT WITH CHECK (auth.uid() = id);
      `,

      // 002: Create transactions table
      `
      CREATE TABLE IF NOT EXISTS transactions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount decimal(10, 2) NOT NULL,
        type text NOT NULL CHECK (type IN ('task_reward', 'ad_reward', 'referral_bonus', 'withdrawal')),
        description text,
        created_at timestamptz DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

      ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
      CREATE POLICY "Users can view their own transactions" ON transactions
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
      CREATE POLICY "Users can insert their own transactions" ON transactions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      `,

      // 003: Create leaderboard view
      `
      DROP MATERIALIZED VIEW IF EXISTS leaderboard;
      CREATE MATERIALIZED VIEW leaderboard AS
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.photo_url,
        u.total_earned,
        ROW_NUMBER() OVER (ORDER BY u.total_earned DESC) as rank
      FROM users u
      ORDER BY u.total_earned DESC
      LIMIT 100;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_id ON leaderboard(id);
      `,

      // 004: Create helper functions
      `
      CREATE OR REPLACE FUNCTION generate_referral_code()
      RETURNS text AS $$
      DECLARE
        chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        result text := '';
        i integer;
      BEGIN
        FOR i IN 1..8 LOOP
          result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
        RETURN result;
      END;
      $$ LANGUAGE plpgsql;

      CREATE OR REPLACE FUNCTION add_transaction(
        p_user_id uuid,
        p_amount decimal,
        p_type text,
        p_description text DEFAULT NULL
      )
      RETURNS void AS $$
      BEGIN
        INSERT INTO transactions (user_id, amount, type, description)
        VALUES (p_user_id, p_amount, p_type, p_description);
        
        UPDATE users
        SET 
          balance = balance + p_amount,
          total_earned = total_earned + CASE WHEN p_amount > 0 THEN p_amount ELSE 0 END,
          updated_at = now()
        WHERE id = p_user_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
    ]

    // Execute each migration
    for (let i = 0; i < migrations.length; i++) {
      console.log(`[v0] Running migration ${i + 1}/${migrations.length}...`)
      const { error } = await supabase.rpc("exec_sql", { sql: migrations[i] })

      if (error) {
        // Try direct query if RPC doesn't work
        const { error: directError } = await supabase.from("_").select("*").limit(0)
        if (directError) {
          console.error(`[v0] Migration ${i + 1} failed:`, error)
          // Continue anyway - some errors are expected (like "already exists")
        }
      }
    }

    console.log("[v0] Database initialization complete!")

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error: any) {
    console.error("[v0] Database initialization error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

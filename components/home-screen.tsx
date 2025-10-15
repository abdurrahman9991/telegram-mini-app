"use client"

import { Gamepad2, Gift, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-provider"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { MonetagAd } from "@/components/monetag-ad"
import { formatPoints } from "@/lib/config"
import config from "@/lib/config"

interface HomeScreenProps {
  onNavigate: (page: "home" | "tasks" | "rewards" | "leaderboard" | "settings") => void
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { user } = useAuth()
  const [balance, setBalance] = useState<number>(0)
  const [totalEarned, setTotalEarned] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchBalance() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("users")
          .select("balance, total_earned")
          .eq("id", user.id)
          .maybeSingle()

        if (error) throw error

        setBalance(data?.balance || 0)
        setTotalEarned(data?.total_earned || 0)
      } catch (error) {
        console.error("[v0] Failed to fetch balance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [user, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div className="min-h-screen p-6" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-md mx-auto space-y-6">
        {/* Logo and Tagline */}
        <motion.div variants={itemVariants} className="text-center space-y-2 pt-8">
          <motion.div
            className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Gamepad2 className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-balance">TaskReward</h1>
          <p className="text-muted-foreground text-balance leading-relaxed">
            Watch ads and invite friends to earn rewards
          </p>
        </motion.div>

        {/* User Profile Card */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.photo_url || "/placeholder.svg?height=64&width=64&query=user avatar"}
                alt="User avatar"
                className="w-16 h-16 rounded-full border-2 border-primary"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full border-2 border-background flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Welcome back!</h2>
              <p className="text-muted-foreground">@{user?.username || user?.email?.split("@")[0] || "user"}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="text-2xl font-bold text-primary">{formatPoints(balance)}</p>
              <p className="text-xs text-muted-foreground">Balance</p>
            </motion.div>
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="text-2xl font-bold text-accent">{formatPoints(totalEarned)}</p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </motion.div>
            <motion.div
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <p className="text-2xl font-bold text-yellow-500">-</p>
              <p className="text-xs text-muted-foreground">Rank</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Main CTAs */}
        <div className="space-y-3">
          <motion.button
            variants={itemVariants}
            onClick={() => onNavigate("tasks")}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl p-4 flex items-center justify-between transition-all group shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Watch Ads</p>
                <p className="text-sm opacity-90">Earn {formatPoints(config.rewards.adView)} points per ad</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-primary-foreground/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
              →
            </div>
          </motion.button>

          <motion.button
            variants={itemVariants}
            onClick={() => onNavigate("leaderboard")}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl p-4 flex items-center justify-between transition-all group shadow-lg shadow-accent/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-foreground/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Invite Friends</p>
                <p className="text-sm opacity-90">
                  Earn {formatPoints(config.rewards.referral.referrer)} points per referral
                </p>
              </div>
            </div>
            <div className="w-8 h-8 bg-accent-foreground/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
              →
            </div>
          </motion.button>

          <motion.button
            variants={itemVariants}
            onClick={() => onNavigate("rewards")}
            className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl p-4 flex items-center justify-between transition-all group shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">View Leaderboard</p>
                <p className="text-sm text-muted-foreground">See top earners</p>
              </div>
            </div>
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
              →
            </div>
          </motion.button>
        </div>

        {/* Ad Placeholder */}
        <motion.div variants={itemVariants}>
          <MonetagAd type="banner" className="rounded-xl overflow-hidden" />
        </motion.div>
      </div>
    </motion.div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Coins, Eye, Trophy, Zap, Star, Award, Target } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useTelegram } from "@/lib/telegram-provider"
import { apiClient } from "@/lib/api-client"

export default function RewardSection() {
  const { user: telegramUser } = useTelegram()
  const [isWatchingAd, setIsWatchingAd] = useState(false)
  const [balance, setBalance] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!telegramUser) return

      try {
        const { balance: userBalance, total_earned } = await apiClient.getWalletBalance(telegramUser.id)
        setBalance(userBalance)
        setTotalEarned(total_earned)

        const { transactions: txs } = await apiClient.getTransactions(telegramUser.id, 10)
        setTransactions(txs || [])
      } catch (error) {
        console.error("[v0] Failed to fetch wallet data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [telegramUser])

  const handleWatchAd = async () => {
    if (!telegramUser) return

    setIsWatchingAd(true)

    try {
      const { reward } = await apiClient.reportAdView(telegramUser.id, "interstitial")

      setTimeout(async () => {
        setIsWatchingAd(false)
        const { balance: newBalance, total_earned } = await apiClient.getWalletBalance(telegramUser.id)
        setBalance(newBalance)
        setTotalEarned(total_earned)
      }, 2500)
    } catch (error) {
      console.error("[v0] Failed to report ad view:", error)
      setIsWatchingAd(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading rewards...</p>
        </div>
      </div>
    )
  }

  const nextMilestone = 100
  const milestoneProgress = (totalEarned / nextMilestone) * 100

  const badges = [
    { id: 1, name: "First Steps", icon: Star, earned: totalEarned >= 1, color: "text-yellow-500" },
    { id: 2, name: "Task Master", icon: Target, earned: totalEarned >= 10, color: "text-blue-500" },
    {
      id: 3,
      name: "Ad Watcher",
      icon: Eye,
      earned: transactions.filter((t) => t.type === "ad_reward").length >= 5,
      color: "text-green-500",
    },
    { id: 4, name: "Top Performer", icon: Trophy, earned: totalEarned >= 50, color: "text-purple-500" },
    { id: 5, name: "Legendary", icon: Award, earned: totalEarned >= 100, color: "text-orange-500" },
  ]

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
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl font-bold">Rewards</h1>
          <p className="text-muted-foreground leading-relaxed">Track your progress and claim your rewards</p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          variants={itemVariants}
          className="glass rounded-2xl p-6 space-y-4 shadow-xl bg-gradient-to-br from-primary/10 to-accent/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-4xl font-bold text-primary">${balance.toFixed(2)}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Coins className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-xl font-bold text-accent">${totalEarned.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{transactions.length}</p>
              <p className="text-xs text-muted-foreground">Transactions</p>
            </div>
          </div>
        </motion.div>

        {/* Milestone Progress */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Next Milestone</p>
              <p className="text-xl font-bold">
                ${totalEarned.toFixed(2)} / ${nextMilestone.toFixed(2)}
              </p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500" />
          </div>
          <Progress value={Math.min(milestoneProgress, 100)} className="h-3" />
          <p className="text-xs text-muted-foreground">
            ${(nextMilestone - totalEarned).toFixed(2)} until next reward unlock
          </p>
        </motion.div>

        {/* Watch Ad CTA */}
        <motion.button
          variants={itemVariants}
          onClick={handleWatchAd}
          disabled={isWatchingAd}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl p-6 flex items-center justify-between transition-all group shadow-lg shadow-accent/20 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent-foreground/10 rounded-xl flex items-center justify-center">
              <Eye className="w-7 h-7" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Watch Ad to Earn More</p>
              <p className="text-sm opacity-90">+$0.50 per ad</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-accent-foreground/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
            →
          </div>
        </motion.button>

        {/* Badges Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Achievement Badges</h2>
            <span className="text-sm text-muted-foreground">
              {badges.filter((b) => b.earned).length}/{badges.length}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <motion.div
                  key={badge.id}
                  className={`glass rounded-xl p-3 flex flex-col items-center gap-2 ${
                    badge.earned ? "shadow-lg" : "opacity-40"
                  }`}
                  whileHover={{ scale: badge.earned ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${
                      badge.earned ? "bg-primary/20" : "bg-muted"
                    } flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${badge.earned ? badge.color : "text-muted-foreground"}`} />
                  </div>
                  <p className="text-[10px] text-center leading-tight">{badge.name}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Rewarded Ad Modal */}
        {isWatchingAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="glass rounded-2xl p-8 max-w-sm mx-4 text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-accent/20 rounded-full flex items-center justify-center animate-pulse">
                <Eye className="w-10 h-10 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Watching Ad...</h3>
                <p className="text-sm text-muted-foreground">Monetag Rewarded Ad</p>
                <p className="text-lg font-semibold text-accent mt-4">+$0.50</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

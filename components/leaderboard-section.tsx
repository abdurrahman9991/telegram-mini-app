"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Medal, Crown, Users, Copy, Check, Share2 } from "lucide-react"
import { useTelegram } from "@/lib/telegram-provider"
import { apiClient } from "@/lib/api-client"
import { config, formatPoints } from "@/lib/config"

export default function LeaderboardSection() {
  const { user: telegramUser, hapticFeedback, webApp } = useTelegram()
  const [copied, setCopied] = useState(false)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [userRank, setUserRank] = useState<any>(null)
  const [referralStats, setReferralStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!telegramUser) return

      try {
        const { leaderboard: leaderboardData, user_rank } = await apiClient.getLeaderboard(50, telegramUser.id)
        setLeaderboard(leaderboardData || [])
        setUserRank(user_rank)

        const stats = await apiClient.getReferralStats(telegramUser.id)
        setReferralStats(stats)
      } catch (error) {
        console.error("[v0] Failed to fetch leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [telegramUser])

  const referralLink = referralStats?.referral_code
    ? `https://t.me/${config.telegram.botToken.split(":")[0]}?start=${referralStats.referral_code}`
    : ""

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    hapticFeedback("light")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareToTelegram = () => {
    const shareText = `🎮 Join TaskReward and earn points!\n\n💰 Get ${config.rewards.referral.referrer} points bonus when you sign up!\n\nUse my referral link:`

    if (webApp) {
      webApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
      )
    } else {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`
      window.open(shareUrl, "_blank")
    }

    hapticFeedback("medium")
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <motion.div className="min-h-screen p-6" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground leading-relaxed">Compete with others and climb to the top</p>
        </motion.div>

        {/* Your Rank Card */}
        {userRank && (
          <motion.div
            variants={itemVariants}
            className="glass rounded-2xl p-6 shadow-xl bg-gradient-to-br from-primary/10 to-accent/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={telegramUser?.photo_url || "/placeholder.svg?height=56&width=56"}
                  alt="Your avatar"
                  className="w-14 h-14 rounded-full border-2 border-primary"
                />
                <div>
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-2xl font-bold">#{userRank.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Earned</p>
                <p className="text-2xl font-bold text-primary">
                  {formatPoints(Number.parseFloat(userRank.total_earned))}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Top Users */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Top Performers</h2>
          </div>

          <div className="space-y-2">
            {leaderboard.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-muted-foreground">No leaderboard data yet. Be the first!</p>
              </div>
            ) : (
              leaderboard.map((user) => (
                <motion.div
                  key={user.id}
                  variants={itemVariants}
                  className={`glass rounded-xl p-4 flex items-center justify-between shadow-lg ${
                    user.rank <= 3 ? "border-2 border-primary/20" : ""
                  }`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {getRankIcon(user.rank) ? (
                        <div className="w-10 h-10 flex items-center justify-center">{getRankIcon(user.rank)}</div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <span className="font-bold text-muted-foreground">#{user.rank}</span>
                        </div>
                      )}
                    </div>
                    <img
                      src={user.photo_url || "/placeholder.svg?height=48&width=48"}
                      alt={user.username || "User"}
                      className="w-12 h-12 rounded-full border-2 border-border"
                    />
                    <div>
                      <p className="font-semibold">@{user.username || `user${user.telegram_id}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPoints(Number.parseFloat(user.total_earned))}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Referral Section */}
        {referralStats && (
          <motion.div variants={itemVariants} className="glass rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-bold">Invite Friends</h2>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Share your referral link and earn{" "}
              <span className="text-accent font-semibold">{config.rewards.referral.referrer} points</span> for each
              friend who joins! They get{" "}
              <span className="text-primary font-semibold">{config.rewards.referral.referee} points</span> too!
            </p>

            <div className="space-y-3">
              {/* Referral Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{referralStats.referral_count}</p>
                  <p className="text-xs text-muted-foreground">Friends Invited</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{formatPoints(referralStats.total_earnings)}</p>
                  <p className="text-xs text-muted-foreground">Bonus Earned</p>
                </div>
              </div>

              {/* Referral Link */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 text-sm font-mono truncate">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShareToTelegram}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl p-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/20"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-semibold">Share to Telegram</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

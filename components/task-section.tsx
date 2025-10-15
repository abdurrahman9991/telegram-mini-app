"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Coins, Eye, Users } from "lucide-react"
import { useTelegram } from "@/lib/telegram-provider"
import { apiClient } from "@/lib/api-client"
import { config } from "@/lib/config"
import { MonetagAd } from "@/components/monetag-ad"
import { useAuth } from "@/lib/auth-provider"

export default function TaskSection() {
  const { user } = useAuth()
  const { hapticFeedback } = useTelegram()
  const [showAd, setShowAd] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const [adCount, setAdCount] = useState(0)

  const handleAdComplete = async () => {
    if (!user) return

    try {
      console.log("[v0] Ad completed, awarding points to user")
      hapticFeedback("success")

      // Award points for watching ad
      await apiClient.addReward(user.id, "ad_view", config.rewards.adView, "Watched advertisement", {
        ad_type: "interstitial",
      })

      setAdCount((prev) => prev + 1)
      setShowAd(false)
      setIsWatching(false)
    } catch (error) {
      console.error("[v0] Failed to award points:", error)
      hapticFeedback("error")
      setShowAd(false)
      setIsWatching(false)
    }
  }

  const handleAdError = (error: Error) => {
    console.error("[v0] Ad error:", error)
    hapticFeedback("error")
    setShowAd(false)
    setIsWatching(false)
  }

  const handleWatchAd = async () => {
    if (!user || isWatching) return

    console.log("[v0] User clicked Watch Ad button")
    hapticFeedback("medium")
    setShowAd(true)
    setIsWatching(true)
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
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl font-bold">Earn Points</h1>
          <p className="text-muted-foreground leading-relaxed">
            Watch ads to earn {config.rewards.adView} points each time
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ads Watched Today</p>
              <p className="text-3xl font-bold">{adCount}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Eye className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Points per ad</span>
              <span className="font-semibold text-primary">{config.rewards.adView} pts</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total earned today</span>
              <span className="font-semibold text-accent">{adCount * config.rewards.adView} pts</span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <motion.button
            onClick={handleWatchAd}
            disabled={isWatching}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-2xl p-8 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={!isWatching ? { scale: 1.02 } : {}}
            whileTap={!isWatching ? { scale: 0.98 } : {}}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                {isWatching ? (
                  <div className="w-10 h-10 border-4 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-10 h-10" />
                )}
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">{isWatching ? "Loading Ad..." : "Watch Ad"}</p>
                <p className="text-sm opacity-90">
                  {isWatching ? "Please wait..." : `Earn ${config.rewards.adView} points instantly`}
                </p>
              </div>
            </div>
          </motion.button>

          <motion.div variants={itemVariants} className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Coins className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">How to Earn More</p>
                <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
                  <li>• Watch ads to earn {config.rewards.adView} points each</li>
                  <li>• Invite friends to earn {config.rewards.referral.referrer} points per referral</li>
                  <li>• Your friends get {config.rewards.referral.referee} points when they join</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="glass rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-semibold">Invite Friends</p>
                <p className="text-sm text-muted-foreground">Earn {config.rewards.referral.referrer} pts per friend</p>
              </div>
            </div>
            <div className="text-2xl">→</div>
          </motion.div>
        </motion.div>

        {showAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="glass rounded-2xl p-8 max-w-sm mx-4 text-center space-y-4">
              <MonetagAd onAdView={handleAdComplete} onAdError={handleAdError} />
              <div>
                <h3 className="text-xl font-bold mb-2">Watching Ad...</h3>
                <p className="text-sm text-muted-foreground">You'll earn {config.rewards.adView} points</p>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

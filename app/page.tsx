"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import HomeScreen from "@/components/home-screen"
import TaskSection from "@/components/task-section"
import RewardSection from "@/components/reward-section"
import LeaderboardSection from "@/components/leaderboard-section"
import SettingsSection from "@/components/settings-section"
import BottomNav from "@/components/bottom-nav"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"

type Page = "home" | "tasks" | "rewards" | "leaderboard" | "settings"

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home")
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

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

  if (!user) {
    return null
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {currentPage === "home" && <HomeScreen onNavigate={setCurrentPage} />}
          {currentPage === "tasks" && <TaskSection />}
          {currentPage === "rewards" && <RewardSection />}
          {currentPage === "leaderboard" && <LeaderboardSection />}
          {currentPage === "settings" && <SettingsSection />}
        </motion.div>
      </AnimatePresence>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}

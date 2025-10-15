"use client"

import { Home, ListTodo, Gift, Trophy, Settings } from "lucide-react"
import { motion } from "framer-motion"

type Page = "home" | "tasks" | "rewards" | "leaderboard" | "settings"

interface BottomNavProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

export default function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "home" as Page, icon: Home, label: "Home" },
    { id: "tasks" as Page, icon: ListTodo, label: "Tasks" },
    { id: "rewards" as Page, icon: Gift, label: "Rewards" },
    { id: "leaderboard" as Page, icon: Trophy, label: "Leaderboard" },
    { id: "settings" as Page, icon: Settings, label: "Settings" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border glass z-50">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs relative z-10 transition-colors ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

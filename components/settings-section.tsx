"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Globe, HelpCircle, Info, MessageCircle, Shield, ChevronRight, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-provider"

export default function SettingsSection() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [language, setLanguage] = useState<"en" | "bn">("en")
  const { signOut, user } = useAuth()
  const [loggingOut, setLoggingOut] = useState(false)

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
    // In a real app, this would update the document theme
  }

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "bn" : "en"))
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error("[v0] Logout error:", error)
    } finally {
      setLoggingOut(false)
    }
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

  const settingsGroups = [
    {
      title: "Appearance",
      items: [
        {
          icon: theme === "dark" ? Moon : Sun,
          label: "Theme",
          value: theme === "dark" ? "Dark" : "Light",
          action: toggleTheme,
          type: "toggle" as const,
        },
        {
          icon: Globe,
          label: "Language",
          value: language === "en" ? "English" : "বাংলা",
          action: toggleLanguage,
          type: "toggle" as const,
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help & FAQ",
          action: () => console.log("Open Help"),
          type: "link" as const,
        },
        {
          icon: MessageCircle,
          label: "Contact Support",
          action: () => window.open("https://t.me/support_bot", "_blank"),
          type: "link" as const,
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: Info,
          label: "About TaskReward",
          value: "v1.0.0",
          action: () => console.log("Open About"),
          type: "link" as const,
        },
        {
          icon: Shield,
          label: "Privacy Policy",
          action: () => console.log("Open Privacy"),
          type: "link" as const,
        },
      ],
    },
  ]

  return (
    <motion.div className="min-h-screen p-6" variants={containerVariants} initial="hidden" animate="visible">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground leading-relaxed">Customize your app experience</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <img
              src={user?.photo_url || "/placeholder.svg?height=48&width=48&query=user avatar"}
              alt="User avatar"
              className="w-12 h-12 rounded-full border-2 border-primary"
            />
            <div className="flex-1">
              <p className="font-semibold">{user?.username || user?.first_name || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email || `ID: ${user?.telegram_id}`}</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <motion.div key={groupIndex} variants={itemVariants} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{group.title}</h2>

            <div className="glass rounded-2xl overflow-hidden shadow-xl">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon
                const isLast = itemIndex === group.items.length - 1

                return (
                  <motion.button
                    key={itemIndex}
                    onClick={item.action}
                    className={`w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors ${
                      !isLast ? "border-b border-border" : ""
                    }`}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.type === "toggle" && item.value && (
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                      )}
                      {item.type === "link" && item.value && (
                        <span className="text-xs text-muted-foreground">{item.value}</span>
                      )}
                      {item.type === "toggle" ? (
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${
                            theme === "dark" || language === "bn" ? "bg-primary" : "bg-secondary"
                          } relative`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              theme === "dark" || language === "bn" ? "translate-x-7" : "translate-x-1"
                            }`}
                          />
                        </div>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ))}

        <motion.button
          variants={itemVariants}
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full glass rounded-2xl p-4 flex items-center justify-center gap-3 hover:bg-destructive/10 transition-colors shadow-xl disabled:opacity-50"
          whileHover={{ scale: loggingOut ? 1 : 1.02 }}
          whileTap={{ scale: loggingOut ? 1 : 0.98 }}
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="font-semibold text-destructive">{loggingOut ? "Logging out..." : "Logout"}</span>
        </motion.button>

        {/* App Info */}
        <motion.div variants={itemVariants} className="glass rounded-2xl p-6 text-center space-y-2 shadow-xl">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
            <Info className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold">TaskReward Mini App</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Complete tasks, earn rewards, and compete with friends on Telegram
          </p>
          <p className="text-xs text-muted-foreground pt-2">Version 1.0.0</p>
        </motion.div>
      </div>
    </motion.div>
  )
}

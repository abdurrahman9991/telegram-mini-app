"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Gamepad2, Mail, Lock, Loader2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          if (error.message.includes("Email not confirmed")) {
            throw new Error("Please check your email and confirm your account before signing in.")
          }
          throw error
        }

        if (data.user) {
          const { data: existingUser } = await supabase.from("users").select("id").eq("id", data.user.id).maybeSingle()

          if (!existingUser) {
            const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

            const { error: insertError } = await supabase.from("users").insert({
              id: data.user.id,
              username: email.split("@")[0],
              first_name: email.split("@")[0],
              referral_code: referralCode,
              telegram_id: null,
            })

            if (insertError) {
              console.error("[v0] Error creating user:", insertError)
              if (
                insertError.message.includes("telegram_id") ||
                insertError.message.includes("relation") ||
                insertError.message.includes("does not exist")
              ) {
                router.push("/setup")
                return
              }
              throw new Error("Failed to create user profile. Please contact support.")
            }
          }

          router.push("/")
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              email_confirm: true,
            },
          },
        })

        if (error) throw error

        if (data.user && !data.session) {
          setSuccess("Account created! Please check your email and click the confirmation link to complete signup.")
          setIsLogin(true)
        } else if (data.user && data.session) {
          const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase()

          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            username: email.split("@")[0],
            first_name: email.split("@")[0],
            referral_code: referralCode,
            telegram_id: null,
          })

          if (insertError) {
            console.error("[v0] Error creating user:", insertError)
            if (
              insertError.message.includes("telegram_id") ||
              insertError.message.includes("relation") ||
              insertError.message.includes("does not exist")
            ) {
              router.push("/setup")
              return
            }
            throw new Error("Failed to create user profile. Please contact support.")
          }

          router.push("/")
        }
      }
    } catch (err: any) {
      console.error("[v0] Auth error:", err.message)
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-primary/5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Gamepad2 className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold">TaskReward</h1>
          <p className="text-muted-foreground mt-2">{isLogin ? "Welcome back!" : "Create your account"}</p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="glass rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg text-sm bg-destructive/10 text-destructive border border-destructive/20"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg text-sm bg-accent/10 text-accent border border-accent/20 flex items-start gap-2"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-3 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setSuccess("")
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-primary font-semibold">{isLogin ? "Sign up" : "Sign in"}</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push("/setup")}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Need to initialize database?
            </button>
          </div>

          <div className="mt-6 p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-xs text-center text-muted-foreground">
              <strong className="text-accent">Note:</strong> Email confirmation may be required. Check your inbox after
              signup.
            </p>
          </div>
        </motion.div>

        {/* Telegram WebApp Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>This app works best in Telegram Mini App</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

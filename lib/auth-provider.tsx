"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface AuthUser {
  id: string
  email?: string
  telegram_id?: number
  username?: string
  first_name?: string
  last_name?: string
  photo_url?: string
  balance?: number
  total_earned?: number
  referral_code?: string
}

interface AuthContextType {
  user: AuthUser | null
  supabaseUser: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      console.error("[v0] Error fetching user data:", error)
      return null
    }
  }

  const refreshUser = async () => {
    if (!supabaseUser) return

    const userData = await fetchUserData(supabaseUser.id)
    if (userData) {
      setUser(userData)
    }
  }

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("[v0] Error getting session:", error.message)
        // Clear local state and let user re-authenticate
        setSupabaseUser(null)
        setUser(null)
        setLoading(false)
        return
      }

      if (session?.user) {
        setSupabaseUser(session.user)
        fetchUserData(session.user.id).then((userData) => {
          if (userData) {
            setUser(userData)
          }
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event)

      // Handle sign out or token refresh errors
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        if (!session) {
          setSupabaseUser(null)
          setUser(null)
          setLoading(false)
          return
        }
      }

      if (session?.user) {
        setSupabaseUser(session.user)
        const userData = await fetchUserData(session.user.id)
        if (userData) {
          setUser(userData)
        }
      } else {
        setSupabaseUser(null)
        setUser(null)
        // Only redirect to login if not already there
        if (window.location.pathname !== "/login" && window.location.pathname !== "/setup") {
          router.push("/login")
        }
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

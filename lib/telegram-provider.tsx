"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  language_code?: string
}

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  close: () => void
  initData: string
  initDataUnsafe: {
    user?: TelegramUser
    query_id?: string
    auth_date?: number
    hash?: string
  }
  themeParams: {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  BackButton: {
    isVisible: boolean
    show: () => void
    hide: () => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
  }
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
    notificationOccurred: (type: "error" | "success" | "warning") => void
    selectionChanged: () => void
  }
  openLink: (url: string) => void
  openTelegramLink: (url: string) => void
  showPopup: (
    params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text: string }> },
    callback?: (buttonId: string) => void,
  ) => void
  showAlert: (message: string, callback?: () => void) => void
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
}

interface TelegramContextType {
  user: TelegramUser | null
  initData: string | null
  isReady: boolean
  webApp: TelegramWebApp | null
  showAlert: (message: string) => void
  showConfirm: (message: string) => Promise<boolean>
  hapticFeedback: (type: "light" | "medium" | "heavy") => void
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  initData: null,
  isReady: false,
  webApp: null,
  showAlert: () => {},
  showConfirm: async () => false,
  hapticFeedback: () => {},
})

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [initData, setInitData] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)

  useEffect(() => {
    // Check if running in Telegram WebApp
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp

      tg.ready()
      tg.expand()

      // Set theme colors from Telegram
      if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty("--tg-theme-bg-color", tg.themeParams.bg_color)
      }
      if (tg.themeParams.text_color) {
        document.documentElement.style.setProperty("--tg-theme-text-color", tg.themeParams.text_color)
      }

      // Get user data from Telegram
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user as TelegramUser)
        console.log("[v0] Telegram user loaded:", tg.initDataUnsafe.user)
      }

      // Get init data for backend verification
      setInitData(tg.initData || null)
      setWebApp(tg)
      setIsReady(true)

      console.log("[v0] Telegram WebApp initialized")
    } else {
      // Development mode - use mock user
      console.log("[v0] Running in development mode with mock user")
      setUser({
        id: 123456789,
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        language_code: "en",
      })
      setInitData("mock_init_data")
      setIsReady(true)
    }
  }, [])

  const showAlert = (message: string) => {
    if (webApp) {
      webApp.showAlert(message)
    } else {
      alert(message)
    }
  }

  const showConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (webApp) {
        webApp.showConfirm(message, (confirmed) => resolve(confirmed))
      } else {
        resolve(confirm(message))
      }
    })
  }

  const hapticFeedback = (type: "light" | "medium" | "heavy") => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(type)
    }
  }

  return (
    <TelegramContext.Provider value={{ user, initData, isReady, webApp, showAlert, showConfirm, hapticFeedback }}>
      {children}
    </TelegramContext.Provider>
  )
}

export function useTelegram() {
  return useContext(TelegramContext)
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

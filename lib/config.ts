// Application Configuration
// This file centralizes all app configuration including rewards, points, and feature flags

export const config = {
  // Rewards & Points System
  rewards: {
    // Points awarded for watching ads
    adView: Number.parseInt(process.env.NEXT_PUBLIC_POINTS_PER_AD_VIEW || "10"),

    // Referral bonuses
    referral: {
      // Points for the person who referred
      referrer: Number.parseInt(process.env.NEXT_PUBLIC_REFERRAL_BONUS_REFERRER || "500"),
      // Points for the person who was referred
      referee: Number.parseInt(process.env.NEXT_PUBLIC_REFERRAL_BONUS_REFEREE || "250"),
    },

    // Minimum points required for withdrawal
    minWithdrawal: Number.parseInt(process.env.NEXT_PUBLIC_MIN_WITHDRAWAL_POINTS || "1000"),
  },

  // Monetag Ad Configuration
  monetag: {
    zoneId: process.env.NEXT_PUBLIC_MONETAG_ZONE_ID || "10042745",
    enabled: !!process.env.NEXT_PUBLIC_MONETAG_ZONE_ID,
  },

  // Telegram Configuration
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    // Telegram Mini App will provide these via window.Telegram.WebApp
    webAppUrl: process.env.NEXT_PUBLIC_API_URL || "",
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  },

  features: {
    enableReferrals: true,
    enableLeaderboard: true,
    enableWithdrawals: true,
  },
} as const

// Helper function to format points with commas
export function formatPoints(points: number): string {
  return points.toLocaleString()
}

// Helper function to check if user can withdraw
export function canWithdraw(points: number): boolean {
  return points >= config.rewards.minWithdrawal
}

export default config

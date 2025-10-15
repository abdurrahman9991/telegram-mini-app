export class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  async getWalletBalance(userId: string) {
    const response = await fetch(`/api/wallet/balance?user_id=${userId}`)

    if (!response.ok) {
      throw new Error("Failed to fetch balance")
    }

    return response.json()
  }

  async getTransactions(userId: string, limit = 20) {
    const response = await fetch(`/api/wallet/transactions?user_id=${userId}&limit=${limit}`)

    if (!response.ok) {
      throw new Error("Failed to fetch transactions")
    }

    return response.json()
  }

  async addReward(userId: string, type: string, amount: number, description?: string, metadata?: object) {
    const response = await fetch("/api/wallet/add-reward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, type, amount, description, metadata }),
    })

    if (!response.ok) {
      throw new Error("Failed to add reward")
    }

    return response.json()
  }

  async getReferralStats(userId: string) {
    const response = await fetch(`/api/referral/stats?user_id=${userId}`)

    if (!response.ok) {
      throw new Error("Failed to fetch referral stats")
    }

    return response.json()
  }

  async getLeaderboard(limit = 50, userId?: string) {
    const url = userId ? `/api/leaderboard?limit=${limit}&user_id=${userId}` : `/api/leaderboard?limit=${limit}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error("Failed to fetch leaderboard")
    }

    return response.json()
  }

  async reportAdView(userId: string, adType: string, revenue?: number) {
    const response = await fetch("/api/monetag/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, adType, revenue }),
    })

    if (!response.ok) {
      throw new Error("Failed to report ad view")
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()

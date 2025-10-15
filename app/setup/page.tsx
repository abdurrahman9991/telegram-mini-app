"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Database, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "initializing" | "success" | "error">("idle")
  const [error, setError] = useState<string>("")
  const router = useRouter()

  const initializeDatabase = async () => {
    setStatus("initializing")
    setError("")

    try {
      const response = await fetch("/api/setup/init-db", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setStatus("error")
        setError(data.error || "Failed to initialize database")
      }
    } catch (err: any) {
      setStatus("error")
      setError(err.message || "An unexpected error occurred")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <Database className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Database Setup</h1>
          <p className="text-muted-foreground text-balance">
            Initialize your database to get started with the Telegram Mini App
          </p>
        </div>

        {status === "idle" && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium">This will create:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Users table with authentication support</li>
                <li>Transactions table for wallet operations</li>
                <li>Leaderboard view for rankings</li>
                <li>Helper functions for referrals</li>
              </ul>
            </div>
            <Button onClick={initializeDatabase} className="w-full" size="lg">
              Initialize Database
            </Button>
          </div>
        )}

        {status === "initializing" && (
          <div className="text-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Setting up your database...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <div className="space-y-2">
              <p className="font-medium text-green-600">Database initialized successfully!</p>
              <p className="text-sm text-muted-foreground">Redirecting to login...</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">Initialization failed</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            </div>
            <Button onClick={initializeDatabase} variant="outline" className="w-full bg-transparent">
              Try Again
            </Button>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">
          <p>Need help? Check the console for detailed logs</p>
        </div>
      </Card>
    </div>
  )
}

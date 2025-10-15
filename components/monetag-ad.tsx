"use client"

import { useEffect, useRef, useState } from "react"
import config from "@/lib/config"

interface MonetagAdProps {
  onAdView?: () => void
  onAdError?: (error: Error) => void
  className?: string
}

// Extend Window interface to include Monetag function
declare global {
  interface Window {
    show_10042745?: () => Promise<void>
  }
}

export function MonetagAd({ onAdView, onAdError, className = "" }: MonetagAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null)
  const scriptLoadedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Don't load ads if Monetag is not configured
    if (!config.monetag.enabled || !config.monetag.zoneId) {
      console.log("[v0] Monetag not configured, skipping ad load")
      setIsLoading(false)
      return
    }

    // Don't reload if already loaded
    if (scriptLoadedRef.current) return

    const zoneId = config.monetag.zoneId
    console.log(`[v0] Loading Monetag SDK for zone ${zoneId}`)

    const script = document.createElement("script")
    script.src = "//libtl.com/sdk.js"
    script.setAttribute("data-zone", zoneId)
    script.setAttribute("data-sdk", `show_${zoneId}`)
    script.async = true

    script.onload = () => {
      console.log("[v0] Monetag SDK loaded successfully")
      scriptLoadedRef.current = true
      setIsLoading(false)
    }

    script.onerror = () => {
      console.error("[v0] Failed to load Monetag SDK")
      setIsLoading(false)
      onAdError?.(new Error("Failed to load Monetag SDK"))
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
      scriptLoadedRef.current = false
    }
  }, [onAdError])

  const showRewardedAd = async () => {
    if (!window.show_10042745) {
      console.error("[v0] Monetag show function not available")
      onAdError?.(new Error("Monetag SDK not loaded"))
      return
    }

    try {
      console.log("[v0] Showing Monetag rewarded ad...")
      // Call the Monetag show function and wait for completion
      await window.show_10042745()
      console.log("[v0] Ad watched successfully, awarding points")
      // User has watched the ad, trigger reward callback
      onAdView?.()
    } catch (error) {
      console.error("[v0] Error showing Monetag ad:", error)
      onAdError?.(error as Error)
    }
  }

  useEffect(() => {
    if (!isLoading && scriptLoadedRef.current && window.show_10042745) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        showRewardedAd()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Don't render anything if Monetag is not configured
  if (!config.monetag.enabled || !config.monetag.zoneId) {
    return (
      <div
        className={`rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground ${className}`}
      >
        <p>Ad Placeholder</p>
        <p className="text-xs mt-1">Configure NEXT_PUBLIC_MONETAG_ZONE_ID to show ads</p>
      </div>
    )
  }

  return (
    <div ref={adContainerRef} className={`monetag-ad-container ${className}`} data-zone-id={config.monetag.zoneId}>
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

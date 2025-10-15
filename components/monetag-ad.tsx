"use client"

import { useEffect, useRef } from "react"
import config from "@/lib/config"

interface MonetagAdProps {
  onAdView?: () => void
  className?: string
}

export function MonetagAd({ onAdView, className = "" }: MonetagAdProps) {
  const adContainerRef = useRef<HTMLDivElement>(null)
  const adLoadedRef = useRef(false)

  useEffect(() => {
    // Don't load ads if Monetag is not configured
    if (!config.monetag.enabled || !config.monetag.zoneId) {
      console.log("[v0] Monetag not configured, skipping ad load")
      return
    }

    // Don't reload if already loaded
    if (adLoadedRef.current) return

    const zoneId = config.monetag.zoneId
    console.log(`[v0] Loading Monetag ad with zone ${zoneId}`)

    const script = document.createElement("script")
    script.src = "//libtl.com/sdk.js"
    script.setAttribute("data-zone", zoneId)
    script.setAttribute("data-sdk", `show_${zoneId}`)
    script.async = true

    // Add script to container
    if (adContainerRef.current) {
      adContainerRef.current.appendChild(script)
      adLoadedRef.current = true

      script.onload = () => {
        console.log("[v0] Monetag ad script loaded successfully")
        setTimeout(() => {
          console.log("[v0] Triggering ad view callback")
          onAdView?.()
        }, 2000)
      }

      script.onerror = () => {
        console.error("[v0] Failed to load Monetag ad script")
      }
    }

    return () => {
      // Cleanup script on unmount
      if (adContainerRef.current && script.parentNode) {
        script.parentNode.removeChild(script)
      }
      adLoadedRef.current = false
    }
  }, [onAdView])

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
    <div
      ref={adContainerRef}
      className={`monetag-ad min-h-[250px] flex items-center justify-center ${className}`}
      data-zone-id={config.monetag.zoneId}
    />
  )
}

'use client'

import { useState, useEffect } from 'react'
import LoadingScreen from './LoadingScreen'

// PageLoader component - ready for future use
// Enable/disable in RootLayoutClient as needed

interface PageLoaderProps {
  enabled?: boolean
}

export default function PageLoader({ enabled = false }: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(enabled)

  useEffect(() => {
    setShowLoader(enabled)
  }, [enabled])

  if (!showLoader) return null

  return (
    <LoadingScreen
      onComplete={() => setShowLoader(false)}
    />
  )
}

// Example usage in RootLayoutClient:
// <PageLoader enabled={isLoading} />




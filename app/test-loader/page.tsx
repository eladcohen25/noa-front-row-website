'use client'

import { useState } from 'react'
import LoadingScreen from '@/components/LoadingScreen'
import Link from 'next/link'

export default function TestLoaderPage() {
  const [showLoader, setShowLoader] = useState(false)

  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-la-foonte mb-12">Loading Screen Test</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={() => setShowLoader(true)}
            className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors block"
          >
            Show Loading Screen (Manual)
          </button>

          <div className="text-sm text-gray-600">
            Or navigate to another page to see it automatically:
          </div>

          <div className="flex gap-4">
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              → Home
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              → About
            </Link>
            <Link
              href="/tickets"
              className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              → Tickets
            </Link>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Animation Sequence:</h2>
          <ul className="space-y-2 text-gray-700">
            <li>⏱️ 0-1500ms: Heart scales up from small to full screen</li>
            <li>⏱️ 1500-1700ms: Hold at full size</li>
            <li>⏱️ 1700-3200ms: Heart scales back down</li>
            <li>✓ Cubic-bezier easing for organic motion</li>
            <li>✓ GPU-accelerated with transform: scale()</li>
            <li>✓ Centered spinning logo video</li>
            <li>✓ Anti-aliased smooth edges</li>
          </ul>
        </div>
      </div>

      {showLoader && (
        <LoadingScreen
          onComplete={() => setShowLoader(false)}
        />
      )}
    </div>
  )
}


import type { Metadata } from 'next'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import './globals.css'
import RootLayoutClient from './RootLayoutClient'

export const metadata: Metadata = {
  title: 'THE FRONT ROW',
  description: 'Jan. 2026, Las Vegas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="stylesheet" href="https://use.typekit.net/kxg5xem.css" />
      </head>
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}




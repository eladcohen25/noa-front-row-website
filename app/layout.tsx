import type { Metadata } from 'next'
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
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  )
}




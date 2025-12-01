import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from "@vercel/analytics/next"
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
        <Script
          id="klaviyo-disable-auto"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.klaviyoForms = window.klaviyoForms || [];
              window.klaviyoForms.push(['identify', function() {
                // Prevent auto-display of forms
              }]);
            `,
          }}
        />
        <Script
          src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=S72EYZ"
          strategy="lazyOnload"
        />
        <Analytics />
      </body>
    </html>
  )
}




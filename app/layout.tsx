import React from "react"
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const outfit = Outfit({ subsets: ["latin"], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Buildev',
  description: 'Professional AI-Powered Responsive Web Builder',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/isotype.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <style>{`
          :root {
            --background: #0f0f0f;
            --foreground: #ffffff;
            --primary: #0D99FF;
            --primary-dark: #0a7acc;
            --surface: #1e1e1e;
            --surface-light: #2a2a2a;
            --muted: #666666;
            --accent: #0D99FF;
          }
        `}</style>
      </head>
      <body className={`${outfit.variable} font-sans antialiased bg-[#0f0f0f] text-white`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Buildev',
  description: 'Professional AI-Powered Responsive Web Builder',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
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
      <body className={`${inter.className} antialiased bg-[#0f0f0f] text-white`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

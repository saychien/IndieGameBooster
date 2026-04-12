import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Indie Game Booster — AI Publishing Copilot',
  description: 'Find your audience, discover KOLs, and generate personalized outreach — powered by AI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#0a0a0f', color: '#e2e8f0', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}

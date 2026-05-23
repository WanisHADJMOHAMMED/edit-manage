import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'

export const metadata: Metadata = {
  title: 'Edit Manage — Agency Platform',
  description: 'Agency Project & Team Management Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}

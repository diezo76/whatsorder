import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProviderWrapper } from '@/components/providers/AuthProviderWrapper'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Whataybo - Système de Commande Restaurant',
  description: 'Recevez des commandes via WhatsApp',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}

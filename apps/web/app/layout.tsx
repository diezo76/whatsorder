import type { Metadata } from 'next'
import './globals.css'
import { AuthProviderWrapper } from '@/components/providers/AuthProviderWrapper'

export const metadata: Metadata = {
  title: 'WhatsOrder - Système de Commande Restaurant',
  description: 'Recevez des commandes via WhatsApp',
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
      </body>
    </html>
  )
}

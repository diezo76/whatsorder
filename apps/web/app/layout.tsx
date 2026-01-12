import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProviderWrapper } from '@/components/providers/AuthProviderWrapper'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Whataybo - Gestion de Commandes WhatsApp pour Restaurants',
  description: 'Transformez vos conversations WhatsApp en commandes automatiques. Interface intuitive, IA intégrée, synchronisation temps réel. Parfait pour les restaurants en Égypte.',
  keywords: 'whatsapp, commandes, restaurant, égypte, IA, gestion, menu, kanban, whataybo',
  authors: [{ name: 'Whataybo' }],
  openGraph: {
    title: 'Whataybo - Gestion de Commandes WhatsApp',
    description: 'Transformez vos conversations WhatsApp en commandes automatiques',
    url: 'https://whataybo.com',
    siteName: 'Whataybo',
    images: [
      {
        url: 'https://whataybo.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Whataybo Preview',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Whataybo - Gestion de Commandes WhatsApp',
    description: 'Transformez vos conversations WhatsApp en commandes automatiques',
    images: ['https://whataybo.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
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

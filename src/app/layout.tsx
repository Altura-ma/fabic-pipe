import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lafabic — Pipeline des sessions de formation',
  description: 'Gestion des sessions de formation culinaires Lafabic : Cuisine, Boulangerie, Pâtisserie, Sans Gluten, Chocolat, Glace.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

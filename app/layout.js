import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

export const metadata = {
  title: {
    default: 'Mod Hub — Real Car Builds, Real Mods',
    template: '%s | Mod Hub',
  },
  description: 'Browse real car builds from enthusiasts. See exactly what mods they installed, read honest reviews, and shop the parts.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://modhub.app'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-56">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

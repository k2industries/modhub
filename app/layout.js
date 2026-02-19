import './globals.css'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export const metadata = {
  title: {
    default: 'Mod Hub — Real Car Builds, Real Mods',
    template: '%s | Mod Hub',
  },
  description: 'Browse real car builds from enthusiasts. See exactly what mods they installed, read honest reviews, and shop the parts.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://modhub.app'),
}

export default async function RootLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar user={user} profile={profile} />
          <main className="flex-1 ml-56 min-w-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

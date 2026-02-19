'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PUBLIC_NAV = [
  { href: '/explore', label: 'Explore' },
  { href: '/shop', label: 'Shop Mods' },
]

const AUTH_NAV = [
  { href: '/my-builds', label: 'My Builds' },
  { href: '/create', label: 'Add a Car' },
]

export default function Sidebar({ user, profile }) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/')

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-100 flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-brand-red font-bold text-xl tracking-tight">MOD HUB</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {PUBLIC_NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-brand-red-light text-brand-red'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {item.label}
          </Link>
        ))}

        {user && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1">
            {AUTH_NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-brand-red-light text-brand-red'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom: user or auth buttons */}
      <div className="px-3 py-4 border-t border-gray-100">
        {user ? (
          <div className="flex flex-col gap-1">
            <Link
              href={`/profile/${profile?.username || ''}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  className="w-7 h-7 rounded-full object-cover flex-none"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-semibold flex-none">
                  {(profile?.display_name || profile?.username || user.email || '?')[0].toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 truncate">
                {profile?.display_name || profile?.username || user.email}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="block text-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="block text-center px-3 py-2 rounded-md text-sm font-semibold bg-brand-red text-white hover:bg-brand-red-dark transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

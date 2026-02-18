'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/explore', label: 'Explore' },
  { href: '/shop', label: 'Shop Mods' },
]

const authNavItems = [
  { href: '/my-builds', label: 'My Builds' },
  { href: '/create', label: 'Add a Car' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-gray-200 flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-brand-red font-bold text-xl tracking-tight">MOD HUB</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-brand-red-light text-brand-red'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {item.label}
          </Link>
        ))}

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1">
          {authNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-brand-red-light text-brand-red'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom: Login / Sign Up */}
      <div className="px-3 py-4 border-t border-gray-100 flex flex-col gap-2">
        <Link
          href="/auth/login"
          className="block text-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Log In
        </Link>
        <Link
          href="/auth/signup"
          className="block text-center px-3 py-2 rounded-md text-sm font-medium bg-brand-red text-white hover:bg-brand-red-dark"
        >
          Sign Up
        </Link>
      </div>
    </aside>
  )
}

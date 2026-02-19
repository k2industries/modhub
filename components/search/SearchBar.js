'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/explore?q=${encodeURIComponent(q)}`)
    } else {
      router.push('/explore')
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full max-w-xl mx-auto">
      <div className="relative flex-1">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by car, mod, or brand…"
          className="w-full pl-10 pr-4 py-3 rounded-l-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all text-sm"
        />
      </div>
      <button
        type="submit"
        className="px-5 py-3 bg-brand-red text-white font-semibold text-sm rounded-r-xl hover:bg-brand-red-dark transition-colors border border-brand-red"
      >
        Search
      </button>
    </form>
  )
}

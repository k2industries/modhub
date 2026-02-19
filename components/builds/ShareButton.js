'use client'

import { useState } from 'react'

export default function ShareButton({ url }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select the URL text from the share card below
    }
  }

  return (
    <button
      onClick={handleShare}
      className="px-3 py-1.5 text-sm font-semibold bg-brand-red text-white rounded-lg hover:bg-brand-red-dark transition-colors"
    >
      {copied ? '✓ Copied!' : 'Share'}
    </button>
  )
}

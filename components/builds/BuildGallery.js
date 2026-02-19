'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function BuildGallery({ photos }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-300 text-sm">No photos yet</span>
      </div>
    )
  }

  const activePhoto = photos[activeIndex]

  return (
    <div>
      {/* Main photo */}
      <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden relative">
        <Image
          src={activePhoto.url}
          alt="Build photo"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setActiveIndex(i)}
              className={`flex-none w-16 h-12 rounded-md overflow-hidden relative border-2 transition-colors ${
                i === activeIndex ? 'border-brand-red' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={photo.url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

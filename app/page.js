import Link from 'next/link'

export const metadata = {
  title: 'Mod Hub — Real Car Builds, Real Mods',
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-8 py-20 max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
          Real builds from real enthusiasts.
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          See exactly what mods owners installed on their car, read their honest take,
          and shop the part — all in one place.
        </p>
        <div className="flex gap-3">
          <Link
            href="/explore"
            className="px-5 py-3 bg-brand-red text-white font-medium rounded-md hover:bg-brand-red-dark transition-colors"
          >
            Browse Builds
          </Link>
          <Link
            href="/auth/signup"
            className="px-5 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            Share Your Build
          </Link>
        </div>
      </section>

      {/* Value props */}
      <section className="px-8 pb-16 grid grid-cols-3 gap-8 max-w-3xl">
        <div>
          <div className="w-8 h-8 bg-brand-red-light rounded-md mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Real Builds</h3>
          <p className="text-sm text-gray-500">Every mod documented by the owner who actually installed it.</p>
        </div>
        <div>
          <div className="w-8 h-8 bg-brand-red-light rounded-md mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Honest Reviews</h3>
          <p className="text-sm text-gray-500">Would install again ratings from people who know firsthand.</p>
        </div>
        <div>
          <div className="w-8 h-8 bg-brand-red-light rounded-md mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Shop With Confidence</h3>
          <p className="text-sm text-gray-500">One click from a real build to the part on Mod Supply.</p>
        </div>
      </section>
    </div>
  )
}

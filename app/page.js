import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getFeaturedBuilds } from '@/lib/queries/builds'
import BuildCard from '@/components/builds/BuildCard'
import SearchBar from '@/components/search/SearchBar'

export const metadata = {
  title: 'Mod Hub — Real Car Builds, Real Mods',
}

export default async function HomePage() {
  const supabase = createClient()
  const featured = await getFeaturedBuilds(supabase, 6)

  return (
    <div className="min-h-screen">
      {/* Dark hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 pt-16 pb-14">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white leading-tight mb-3">
            Real builds from real enthusiasts.
          </h1>
          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            See exactly what mods owners installed, read their honest take,
            and shop the part — all in one place.
          </p>

          {/* Search bar */}
          <div className="mb-8">
            <SearchBar />
          </div>

          <div className="flex justify-center gap-3">
            <Link
              href="/explore"
              className="px-5 py-3 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red-dark transition-colors text-sm"
            >
              Browse Builds
            </Link>
            <Link
              href="/auth/signup"
              className="px-5 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              Share Your Build
            </Link>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="px-8 py-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl">
        <div>
          <div className="w-7 h-7 bg-brand-red-light rounded-md mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1 text-sm">Real Builds</h3>
          <p className="text-sm text-gray-400">Every mod documented by the owner who actually installed it.</p>
        </div>
        <div>
          <div className="w-7 h-7 bg-brand-red-light rounded-md mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1 text-sm">Honest Reviews</h3>
          <p className="text-sm text-gray-400">Would-install-again ratings from people who know firsthand.</p>
        </div>
        <div>
          <div className="w-7 h-7 bg-brand-red-light rounded-md mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1 text-sm">Shop With Confidence</h3>
          <p className="text-sm text-gray-400">One click from a real build to the part on Mod Supply.</p>
        </div>
      </section>

      {/* Featured builds */}
      {featured.length > 0 && (
        <section className="px-8 pb-16">
          <div className="flex items-center justify-between mb-6 max-w-6xl">
            <h2 className="text-lg font-bold text-gray-900">Latest Builds</h2>
            <Link href="/explore" className="text-sm text-brand-red hover:text-brand-red-dark font-medium">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            {featured.map(build => (
              <BuildCard key={build.id} build={build} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { getPublishedBuilds } from '@/lib/queries/builds'
import { EXPLORE_FILTERS } from '@/lib/constants/vehicles'
import BuildCard from '@/components/builds/BuildCard'

export const metadata = {
  title: 'Explore Builds',
  description: 'Browse real car builds from enthusiasts. See what mods they installed and shop the parts.',
}

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest' },
  { value: 'most_mods',   label: 'Most Mods' },
  { value: 'most_viewed', label: 'Most Viewed' },
]

const PAGE_SIZE = 24

export default async function ExplorePage({ searchParams }) {
  const { chassis, q, sort, page } = searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)
  const offset = (currentPage - 1) * PAGE_SIZE

  const supabase = createClient()
  const { builds, total } = await getPublishedBuilds(supabase, {
    chassis, q, sort, limit: PAGE_SIZE, offset,
  })

  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Build href helper — preserves existing params, merges new ones
  function filterHref(updates) {
    const params = new URLSearchParams()
    const merged = { chassis, q, sort, ...updates }
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== '1') params.set(k, v)  // don't add page=1 to URL
    })
    const str = params.toString()
    return `/explore${str ? `?${str}` : ''}`
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Explore Builds</h1>

      {/* Search */}
      <form method="get" action="/explore" className="mb-5">
        <div className="flex gap-2 max-w-md">
          <input
            name="q"
            defaultValue={q || ''}
            placeholder="Search by make, model, or builder…"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent"
          />
          {chassis && <input type="hidden" name="chassis" value={chassis} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
          <button
            type="submit"
            className="px-4 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {EXPLORE_FILTERS.map(chip => {
          const isActive = (chip.chassis || null) === (chassis || null)
          return (
            <a
              key={chip.label}
              href={filterHref({ chassis: chip.chassis || undefined, page: undefined })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-red text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {chip.label}
            </a>
          )
        })}
      </div>

      {/* Sort + count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">
          {total} build{total !== 1 ? 's' : ''}
          {q && <span> for &ldquo;{q}&rdquo;</span>}
        </p>
        <div className="flex gap-1">
          {SORT_OPTIONS.map(option => {
            const isActive = (sort || 'newest') === option.value
            return (
              <a
                key={option.value}
                href={filterHref({ sort: option.value, page: undefined })}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isActive ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {option.label}
              </a>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      {builds.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-300 text-sm">
            {q || chassis ? 'No builds match that filter.' : 'No builds yet — be the first to share yours.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map(build => (
            <BuildCard key={build.id} build={build} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {currentPage > 1 && (
            <a
              href={filterHref({ page: currentPage - 1 })}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Previous
            </a>
          )}
          <span className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <a
              href={filterHref({ page: currentPage + 1 })}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}

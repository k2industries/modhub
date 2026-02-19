import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getModById } from '@/lib/queries/mods'
import ConsensusScore from '@/components/mods/ConsensusScore'
import ShopButton from '@/components/mods/ShopButton'
import { CATEGORY_COLORS } from '@/lib/constants/categories'

export async function generateMetadata({ params }) {
  const supabase = createClient()
  const mod = await getModById(supabase, params.id)

  if (!mod) return { title: 'Mod Not Found' }

  const brandPart = mod.brand ? ` by ${mod.brand}` : ''
  return {
    title: `${mod.name}${brandPart} | Mod Hub`,
    description: mod.install_notes
      ? `${mod.install_notes.slice(0, 155)}…`
      : `See real installs of the ${mod.name}${brandPart} across enthusiast builds on Mod Hub.`,
  }
}

export default async function ModDetailPage({ params }) {
  const supabase = createClient()
  const mod = await getModById(supabase, params.id)

  if (!mod) notFound()

  const { build, related } = mod
  const shopUrl = mod.shop_url || mod.url

  // YouTube placeholder — real results require YOUTUBE_API_KEY
  const hasYouTubeKey = !!process.env.YOUTUBE_API_KEY

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
        {build && (
          <>
            <Link href={`/builds/${build.slug}`} className="hover:text-brand-red transition-colors">
              {build.title}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-600 font-medium">{mod.name}</span>
      </nav>

      {/* Hero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        {/* Product image */}
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
          {mod.image_url ? (
            <img
              src={mod.image_url}
              alt={mod.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
              <span className="text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            {mod.category && (
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${CATEGORY_COLORS[mod.category] || 'bg-gray-100 text-gray-600'}`}>
                {mod.category}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{mod.name}</h1>
            {mod.brand && (
              <p className="text-gray-500 mt-1">by {mod.brand}</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 text-sm">
            {mod.install_status && (
              <span className={`px-2 py-0.5 rounded font-medium text-xs ${
                mod.install_status === 'installed' ? 'bg-green-50 text-green-700' :
                mod.install_status === 'planned'   ? 'bg-yellow-50 text-yellow-700' :
                'bg-gray-100 text-gray-500'
              }`}>
                {mod.install_status.charAt(0).toUpperCase() + mod.install_status.slice(1)}
              </span>
            )}
            {mod.would_install_again === true  && <span className="text-gray-500">👍 Would install again</span>}
            {mod.would_install_again === false && <span className="text-gray-500">👎 Would not install again</span>}
          </div>

          {/* Discount badge */}
          {mod.discount_code && (
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              {mod.discount_pct ? `${mod.discount_pct}% off — ` : 'Code: '}{mod.discount_code}
            </div>
          )}

          <ShopButton url={shopUrl} modName={mod.name} />
        </div>
      </div>

      {/* Creator's Take */}
      {(mod.install_notes || mod.would_install_again != null) && (
        <section className="border border-gray-100 rounded-xl p-6 bg-white mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Creator&rsquo;s Take</h2>
          {build?.profile && (
            <div className="flex items-center gap-2 mb-3">
              {build.profile.avatar_url ? (
                <img src={build.profile.avatar_url} alt={build.profile.display_name || build.profile.username} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500">
                  {(build.profile.display_name || build.profile.username || '?')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs text-gray-500">
                {build.profile.display_name || build.profile.username}
              </span>
              {mod.would_install_again === true  && <span className="ml-auto text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium">👍 Would install again</span>}
              {mod.would_install_again === false && <span className="ml-auto text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium">👎 Would not install again</span>}
            </div>
          )}
          {mod.install_notes && (
            <p className="text-sm text-gray-600 leading-relaxed">{mod.install_notes}</p>
          )}
        </section>
      )}

      {/* Enthusiast Consensus */}
      <div className="mb-6">
        <ConsensusScore
          score={mod.consensus_score ?? null}
          confidence={mod.consensus_confidence ?? null}
          summary={mod.consensus_summary ?? null}
          pros={mod.consensus_pros ?? null}
          cons={mod.consensus_cons ?? null}
        />
      </div>

      {/* Evidence Used — other builds with this mod */}
      {related && related.length > 0 && (
        <section className="mb-6">
          <details className="border border-gray-100 rounded-xl bg-white overflow-hidden">
            <summary className="px-6 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50 transition-colors list-none flex items-center justify-between">
              Evidence Used ({related.length} other build{related.length !== 1 ? 's' : ''})
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <div className="px-6 pb-4 divide-y divide-gray-50">
              {related.map(r => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/builds/${r.build.slug}`} className="text-sm font-medium text-gray-900 hover:text-brand-red transition-colors">
                      {r.build.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      {r.would_install_again === true  && <span className="text-xs text-gray-400">👍</span>}
                      {r.would_install_again === false && <span className="text-xs text-gray-400">👎</span>}
                      {r.install_notes && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{r.install_notes}</p>
                      )}
                    </div>
                  </div>
                  <Link href={`/builds/${r.build.slug}`} className="flex-none text-xs text-brand-red hover:text-brand-red-dark font-medium">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {/* YouTube Videos */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">YouTube Videos</h2>
        {hasYouTubeKey ? (
          <p className="text-sm text-gray-400">Loading videos…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-video bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="opacity-40">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.5C5.12 20 12 20 12 20s6.88 0 8.59-.5a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                </svg>
                <span className="text-xs text-center px-2">Add YOUTUBE_API_KEY to enable</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

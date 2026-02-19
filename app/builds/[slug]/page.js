import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBuildBySlug } from '@/lib/queries/builds'
import BuildGallery from '@/components/builds/BuildGallery'
import ModList from '@/components/builds/ModList'

export async function generateMetadata({ params }) {
  const supabase = createClient()
  const build = await getBuildBySlug(supabase, params.slug)

  if (!build) return { title: 'Build Not Found' }

  const modCount = build.mod_count || 0
  const chassis = build.chassis_code ? ` ${build.chassis_code}` : ''
  const title = `${build.year} ${build.make} ${build.model}${chassis} Build | ${modCount} Mods | Mod Hub`
  const description = `See the ${modCount} mods on this ${build.year} ${build.make} ${build.model}${chassis}. Real owner build with photos and shop links.`
  const primaryPhoto = build.build_photos?.find(p => p.is_primary) || build.build_photos?.[0]

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/builds/${build.slug}`,
      images: primaryPhoto ? [{ url: primaryPhoto.url, width: 1200, height: 630 }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryPhoto ? [primaryPhoto.url] : [],
    },
  }
}

export default async function BuildPage({ params }) {
  const supabase = createClient()
  const build = await getBuildBySlug(supabase, params.slug)

  if (!build) notFound()

  const { profile, build_photos: photos, mods, specs } = build
  const primaryPhoto = photos?.find(p => p.is_primary) || photos?.[0]
  const specsEntries = specs ? Object.entries(specs).filter(([, v]) => v) : []

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${build.year} ${build.make} ${build.model} Build`,
    author: { '@type': 'Person', name: profile?.display_name || profile?.username },
    datePublished: build.created_at,
    image: primaryPhoto?.url,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/builds/${build.slug}`,
    about: {
      '@type': 'Vehicle',
      name: `${build.year} ${build.make} ${build.model}`,
      manufacturer: build.make,
      model: build.model,
      vehicleModelDate: String(build.year),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Build header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {build.chassis_code && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded">
                {build.chassis_code}
              </span>
            )}
            <span className="text-xs text-gray-400">{build.mod_count || 0} mods</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{build.title}</h1>
          {build.description && (
            <p className="mt-2 text-gray-500 text-sm leading-relaxed max-w-2xl">
              {build.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: gallery + mods */}
          <div className="lg:col-span-2">
            <BuildGallery photos={photos || []} />

            <div className="mt-8">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Mods ({build.mod_count || 0})
              </h2>
              <ModList mods={mods || []} />
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="flex flex-col gap-4">
            {/* Builder card */}
            {profile && (
              <div className="border border-gray-100 rounded-xl p-4 bg-white">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Builder
                </p>
                <div className="flex items-center gap-3 mb-3">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || profile.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-semibold">
                      {(profile.display_name || profile.username || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {profile.display_name || profile.username}
                    </p>
                    <p className="text-xs text-gray-400">@{profile.username}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      @{profile.instagram}
                    </a>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-gray-700 transition-colors truncate"
                    >
                      {profile.website}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Specs */}
            {specsEntries.length > 0 && (
              <div className="border border-gray-100 rounded-xl p-4 bg-white">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Specs
                </p>
                <dl className="flex flex-col gap-2.5">
                  {specsEntries.map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-2 text-sm">
                      <dt className="text-gray-400 capitalize shrink-0">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="font-medium text-gray-900 text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Share */}
            <div className="border border-gray-100 rounded-xl p-4 bg-white">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Share this build
              </p>
              <p className="text-xs text-gray-400 break-all select-all">
                {process.env.NEXT_PUBLIC_SITE_URL}/builds/{build.slug}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

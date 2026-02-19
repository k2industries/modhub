import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getUserBuilds } from '@/lib/queries/users'

export const metadata = { title: 'My Builds' }

export default async function MyBuildsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const builds = await getUserBuilds(supabase, user.id)
  const published = builds.filter(b => b.status === 'published')
  const drafts = builds.filter(b => b.status === 'draft')

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Builds</h1>
        <Link
          href="/create"
          className="px-4 py-2 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition-colors"
        >
          + Add a Car
        </Link>
      </div>

      {builds.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 mb-4">You haven&apos;t added any builds yet.</p>
          <Link
            href="/create"
            className="px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:bg-brand-red-dark transition-colors"
          >
            Add Your First Car
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {published.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Published ({published.length})
              </h2>
              <div className="flex flex-col gap-3">
                {published.map(build => (
                  <BuildRow key={build.id} build={build} />
                ))}
              </div>
            </section>
          )}

          {drafts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Drafts ({drafts.length})
              </h2>
              <div className="flex flex-col gap-3">
                {drafts.map(build => (
                  <BuildRow key={build.id} build={build} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function BuildRow({ build }) {
  const primaryPhoto =
    build.build_photos?.find(p => p.is_primary) || build.build_photos?.[0]

  return (
    <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
      {/* Thumbnail */}
      <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden relative flex-none">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={build.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No photo
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{build.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {build.mod_count || 0} mods
          {build.chassis_code && ` · ${build.chassis_code}`}
        </p>
      </div>

      {/* Status badge */}
      <span className={`text-xs font-medium px-2 py-1 rounded-full flex-none ${
        build.status === 'published'
          ? 'bg-green-50 text-green-700'
          : 'bg-gray-100 text-gray-500'
      }`}>
        {build.status === 'published' ? 'Published' : 'Draft'}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-none">
        {build.status === 'published' && (
          <Link
            href={`/builds/${build.slug}`}
            className="text-xs text-gray-400 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            View
          </Link>
        )}
        <Link
          href={`/create?id=${build.id}`}
          className="text-xs font-medium text-brand-red hover:text-brand-red-dark px-3 py-1.5 rounded-md hover:bg-brand-red-light transition-colors"
        >
          Edit
        </Link>
      </div>
    </div>
  )
}

import Link from 'next/link'
import Image from 'next/image'

export default function BuildCard({ build }) {
  const primaryPhoto =
    build.build_photos?.find(p => p.is_primary) || build.build_photos?.[0]
  const builder = build.profile?.display_name || build.profile?.username || 'Unknown'

  return (
    <Link href={`/builds/${build.slug}`} className="group block">
      {/* Photo */}
      <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={build.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No photo
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 group-hover:text-brand-red transition-colors">
          {build.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
          {build.chassis_code && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
              {build.chassis_code}
            </span>
          )}
          <span>{build.mod_count || 0} mods</span>
          <span>·</span>
          <span>{builder}</span>
        </div>
      </div>
    </Link>
  )
}

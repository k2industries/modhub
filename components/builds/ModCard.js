const STATUS = {
  installed: { label: 'Installed', classes: 'bg-green-50 text-green-700' },
  planned:   { label: 'Planned',   classes: 'bg-yellow-50 text-yellow-700' },
  removed:   { label: 'Removed',   classes: 'bg-gray-100 text-gray-500' },
}

export default function ModCard({ mod }) {
  const shopUrl = mod.shop_url || mod.url
  const status = STATUS[mod.install_status] || STATUS.installed

  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
      {/* Product image */}
      {mod.image_url && (
        <img
          src={mod.image_url}
          alt={mod.name}
          className="w-14 h-14 object-cover rounded-md flex-none bg-gray-100"
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm leading-snug">{mod.name}</p>
            {mod.brand && (
              <p className="text-xs text-gray-400 mt-0.5">{mod.brand}</p>
            )}
          </div>
          {shopUrl && (
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-none px-3 py-1.5 bg-brand-red text-white text-xs font-semibold rounded-md hover:bg-brand-red-dark transition-colors"
            >
              Shop
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${status.classes}`}>
            {status.label}
          </span>
          {mod.would_install_again === true && (
            <span className="text-xs text-gray-400">👍 Would install again</span>
          )}
          {mod.would_install_again === false && (
            <span className="text-xs text-gray-400">👎 Would not install again</span>
          )}
        </div>

        {mod.install_notes && (
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{mod.install_notes}</p>
        )}
      </div>
    </div>
  )
}

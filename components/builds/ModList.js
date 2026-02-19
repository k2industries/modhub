import ModCard from './ModCard'
import { CATEGORY_COLORS } from '@/lib/constants/categories'

export default function ModList({ mods }) {
  if (!mods || mods.length === 0) {
    return (
      <div className="py-10 text-center text-gray-300 text-sm">
        No mods listed yet.
      </div>
    )
  }

  // Group mods by category, preserving order of first appearance
  const categories = []
  const byCategory = {}
  for (const mod of mods) {
    if (!byCategory[mod.category]) {
      byCategory[mod.category] = []
      categories.push(mod.category)
    }
    byCategory[mod.category].push(mod)
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.map(category => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-600'}`}>
              {category}
            </span>
            <span className="text-xs text-gray-400">
              {byCategory[category].length} mod{byCategory[category].length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-4">
            {byCategory[category].map(mod => (
              <ModCard key={mod.id} mod={mod} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

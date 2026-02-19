// Displays aggregated community consensus for a mod (used on mod detail page).
// Populated by Phase 1C auto-match. Shows empty state if no data yet.

function StarDisplay({ score }) {
  // score is 0–1 float, convert to 0–5
  const stars = score * 5
  const full = Math.floor(stars)
  const half = stars - full >= 0.5 ? 1 : 0
  const empty = 5 - full - half

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {half === 1 && (
        <svg width="18" height="18" viewBox="0 0 24 24" className="text-yellow-400">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" stroke="currentColor" strokeWidth="1" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

const CONFIDENCE_STYLES = {
  Low:    'bg-gray-100 text-gray-500',
  Medium: 'bg-yellow-50 text-yellow-700',
  High:   'bg-green-50 text-green-700',
}

export default function ConsensusScore({ score, confidence, summary, pros, cons }) {
  const hasData = score != null || summary || (pros?.length > 0) || (cons?.length > 0)

  if (!hasData) {
    return (
      <div className="border border-gray-100 rounded-xl p-6 bg-white">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Enthusiast Consensus</h2>
        <p className="text-sm text-gray-400">
          Not enough data yet. As more builders add this mod, a community consensus will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="border border-gray-100 rounded-xl p-6 bg-white">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Enthusiast Consensus</h2>
        {confidence && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CONFIDENCE_STYLES[confidence] || CONFIDENCE_STYLES.Low}`}>
            {confidence} confidence
          </span>
        )}
      </div>

      {score != null && (
        <div className="flex items-center gap-3 mb-4">
          <StarDisplay score={score} />
          <span className="text-lg font-bold text-gray-900">
            {(score * 5).toFixed(1)}
          </span>
          <span className="text-sm text-gray-400">/ 5</span>
        </div>
      )}

      {summary && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{summary}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pros?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pros</p>
            <ul className="flex flex-col gap-1.5">
              {pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-green-500 mt-0.5 flex-none">
                    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}

        {cons?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cons</p>
            <ul className="flex flex-col gap-1.5">
              {cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-400 mt-0.5 flex-none">
                    <circle cx="12" cy="12" r="10" fill="currentColor" className="opacity-20" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                  </svg>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

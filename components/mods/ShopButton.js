export default function ShopButton({ url, modName }) {
  const href = url || '#'

  return (
    <a
      href={href}
      target={href !== '#' ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="block w-full text-center py-3 bg-brand-red text-white font-semibold rounded-lg hover:bg-brand-red-dark transition-colors text-sm"
    >
      Shop This Part{modName ? ` — ${modName}` : ''}
    </a>
  )
}

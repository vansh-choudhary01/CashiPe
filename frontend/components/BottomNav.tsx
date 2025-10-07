import Link from 'next/link'

/**
 * Bottom navigation bar for quick access on mobile.
 */
export default function BottomNav() {
  const items = [
    { label: 'Home', path: '/' },
    { label: 'Sell', path: '/sell' },
    { label: 'Buy', path: '/refurbished' },
    { label: 'Orders', path: '/orders' },
    { label: 'Profile', path: '/profile' },
  ]
  return (
    <nav className="sticky bottom-0 z-40 border-t border-white/10 bg-neutral-900/80 backdrop-blur">
      <div className="mx-auto max-w-5xl grid grid-cols-5">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.path}
            className="h-14 flex flex-col items-center justify-center text-xs text-neutral-300 hover:text-white"
          >
            <span className="w-5 h-5 mb-0.5 rounded-full bg-neutral-800/80" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
import Link from 'next/link'
import { devicesByCategory } from '../../data/devices'

/**
 * Sell home page: prompts user to choose a gadget category.
 */
export default function SellHomePage() {
  const categories = Object.keys(devicesByCategory)
  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Choose your Gadget</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/sell/${cat}`}
            className="glass rounded-xl p-6 flex flex-col items-center hover:scale-105 transition"
          >
            <div className="text-lg capitalize font-medium">
              {cat.replace(/-/g, ' ')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
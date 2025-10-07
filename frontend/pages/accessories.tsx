import { useEffect, useState } from 'react'
import { AccessoriesAPI } from '../lib/api'

/**
 * Lists accessories for purchase. Users can add items to their cart.
 */
export default function AccessoriesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    AccessoriesAPI.list()
      .then((r) => setItems(r.items || []))
      .finally(() => setLoading(false))
  }, [])
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Accessories</h1>
      {loading && <div className="glass rounded-xl p-6">Loading...</div>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="glass rounded-xl p-4 hover:scale-[1.02] transition"
          >
            <div className="text-lg font-medium mb-1">{item.name}</div>
            <p className="text-sm text-neutral-300 mb-3">
              {item.description || 'Great accessory for your device.'}
            </p>
            <div className="font-semibold text-emerald-400 mb-3">
              ₹ {Number(item.price || 0).toLocaleString('en-IN')}
            </div>
            <button
              className="h-9 px-4 rounded-md bg-emerald-500 text-black font-medium w-full"
              onClick={() => alert('Added to cart! (cart API coming next)')}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
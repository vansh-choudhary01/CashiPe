import { useEffect, useState } from 'react'
import { AccessoriesAPI } from '../lib/api'
import { addToCart as addToLocalCart } from '../store/cart'
import toast from 'react-hot-toast'

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
          <AccessoryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

function AccessoryCard({ item }: { item: any }) {
  const [qty, setQty] = useState(1)
  const adding = false
  return (
    <div className="glass rounded-xl p-4 hover:scale-[1.02] transition">
      <div className="text-lg font-medium mb-1">{item.name}</div>
      <p className="text-sm text-neutral-300 mb-3">{item.description || 'Great accessory for your device.'}</p>
      <div className="font-semibold text-emerald-400 mb-3">₹ {Number(item.price || 0).toLocaleString('en-IN')}</div>
      <div className="flex items-center gap-2 mb-3">
        <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))} className="w-20 h-9 px-2 border rounded" />
        <button className="h-9 px-3 rounded-md bg-neutral-100 border" onClick={async () => {
          try {
            await AccessoriesAPI.addToCart(item.id, qty)
            addToLocalCart({ id: item.id, name: item.name, price: item.price, quantity: qty })
            toast.success('Added to cart')
          } catch (e:any) {
            toast.error(e?.message || 'Failed to add to cart')
          }
        }}>Add</button>
      </div>
    </div>
  )
}
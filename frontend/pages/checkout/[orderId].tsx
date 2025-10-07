import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { OrdersAPI, PickupAPI } from '../../lib/api'

/**
 * Checkout page: collects customer information and schedules pickup.
 */
export default function CheckoutPage() {
  const router = useRouter()
  const { orderId } = router.query
  const [order, setOrder] = useState<any | undefined>(undefined)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pickupAt, setPickupAt] = useState('')
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (typeof orderId !== 'string') return
      try {
        setLoading(true)
        const [o, s] = await Promise.all([
          OrdersAPI.get(orderId),
          PickupAPI.slots(),
        ])
        setOrder(o.order)
        setSlots(s.slots || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderId])

  if (!order && !loading) {
    return <div className="max-w-6xl mx-auto py-8">Order not found.</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      {order && (
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div className="text-sm">
          <div className="font-medium">
            {order.brand} {order.model}
          </div>
          <div className="text-neutral-300">
            {order.condition} • {order.storage}
          </div>
        </div>
        <div className="font-semibold text-emerald-400">
          ₹ {Number(order.price || 0).toLocaleString('en-IN')}
        </div>
      </div>
      )}
      <div className="glass rounded-xl p-6 grid gap-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full glass rounded-md h-10 px-3"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full glass rounded-md h-10 px-3"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full glass rounded-md px-3 py-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Pickup time</label>
          <select
            value={pickupAt}
            onChange={(e) => setPickupAt(e.target.value)}
            className="w-full glass rounded-md h-10 px-3"
          >
            <option value="">Select a slot</option>
            {slots.map((s) => (
              <option key={s} value={s}>{new Date(s).toLocaleString()}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            className="h-10 px-4 rounded-md bg-emerald-500 text-black font-medium"
            onClick={async () => {
              if (typeof orderId !== 'string') return
              if (!pickupAt || !address) return alert('Please select a slot and enter address')
              await OrdersAPI.schedule({ orderId, pickupAt, address })
              router.push('/orders')
            }}
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  )
}
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { OrdersAPI, PickupAPI, PaymentsAPI } from '../../lib/api'

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
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
        <div className="text-sm">
          <div className="font-medium">
            {order.brand} {order.model}
          </div>
          <div className="text-neutral-600">
            {order.condition} • {order.storage}
          </div>
        </div>
        <div className="font-semibold text-emerald-600">
          ₹ {Number(order.price || 0).toLocaleString('en-IN')}
        </div>
      </div>
      )}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 grid gap-4 shadow-sm">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-md px-3 py-2"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Pickup time</label>
          <select
            value={pickupAt}
            onChange={(e) => setPickupAt(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3"
          >
            <option value="">Select a slot</option>
            {slots.map((s) => (
              <option key={s} value={s}>{new Date(s).toLocaleString()}</option>
            ))}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Payout Method</label>
            <select id="payout-method" className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3">
              <option value="upi">UPI</option>
              <option value="bank">Bank Transfer</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>
          <div id="payout-details">
            <label className="block text-sm mb-1">UPI ID (or Bank/Wallet details)</label>
            <input id="payout-upi" className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3" placeholder="name@bank" />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            className="h-10 px-4 rounded-md bg-emerald-600 text-white font-medium"
            onClick={async () => {
              if (typeof orderId !== 'string') return
              if (!pickupAt || !address) return alert('Please select a slot and enter address')
              // Save payout method (simple: UPI only here for MVP)
              const methodSel = document.getElementById('payout-method') as HTMLSelectElement | null
              const upiInput = document.getElementById('payout-upi') as HTMLInputElement | null
              const method = methodSel?.value as 'upi'|'bank'|'wallet' | undefined
              const upi = upiInput?.value?.trim()
              if (method === 'upi' && !upi) return alert('Please enter your UPI ID')
              if (method) {
                try { await PaymentsAPI.savePayoutMethod(orderId, { method, upi }) } catch {}
              }
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
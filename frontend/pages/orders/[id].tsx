import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { OrdersAPI, OrderDetailAPI } from '../../lib/api'

export default function OrderDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [order, setOrder] = useState<any | null>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingInvoice, setCreatingInvoice] = useState(false)

  useEffect(() => {
    async function load() {
      if (typeof id !== 'string') return
      setLoading(true)
      try {
        const [o, t] = await Promise.all([
          OrdersAPI.get(id),
          OrderDetailAPI.timeline(id),
        ])
        setOrder(o.order || null)
        setTimeline(t.timeline || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (!loading && !order) {
    return <div className="max-w-6xl mx-auto py-8">Order not found.</div>
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Order Details</h1>
      {order && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="text-sm space-y-1">
              <div className="font-medium">{order.brand || order.type?.toUpperCase()} {order.model || ''}</div>
              <div className="text-neutral-600">
                {order.storage ? `${order.storage} • ` : ''}{order.condition || '-'}
              </div>
              <div className="text-xs text-neutral-600">
                <span>ID:</span> <span className="font-mono">{order._id || order.id}</span>
              </div>
              {order.payment?.orderId && (
                <div className="text-xs text-neutral-600">
                  Razorpay: <span className="font-mono">{order.payment.orderId}</span> ({order.payment?.status || 'created'})
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-emerald-600">₹ {Number(order.price || 0).toLocaleString('en-IN')}</div>
              <div className="text-xs text-neutral-600">Status: {order.status}</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Timeline</h2>
          <button
            onClick={async () => {
              if (typeof id !== 'string') return
              setCreatingInvoice(true)
              try { await OrderDetailAPI.createInvoice(id) } catch {}
              finally { setCreatingInvoice(false) }
            }}
            className="h-9 px-3 rounded-md bg-neutral-100 border border-neutral-200"
          >
            {creatingInvoice ? 'Creating…' : 'Create Invoice'}
          </button>
        </div>
        {timeline.length === 0 ? (
          <div className="text-sm text-neutral-600">No timeline entries yet.</div>
        ) : (
          <div className="space-y-3">
            {timeline.map((e, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
                <div>
                  <div className="text-sm font-medium">{e.status}</div>
                  <div className="text-xs text-neutral-600">{new Date(e.at).toLocaleString()} {e.note ? `• ${e.note}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-medium mb-3">Documents</h2>
        {Array.isArray(order?.documents) && order!.documents.length > 0 ? (
          <div className="space-y-2">
            {order!.documents.map((d: any, i: number) => (
              <a key={i} className="block text-sm text-emerald-700 underline" href={d.url} target="_blank" rel="noreferrer">
                {d.type.toUpperCase()} • {new Date(d.createdAt).toLocaleString()}
              </a>
            ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-600">No documents yet.</div>
        )}
      </div>
    </div>
  )
}

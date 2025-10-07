import { useEffect, useState } from 'react'
import { OrdersAPI } from '../lib/api'

/**
 * Orders page: lists all created orders stored in localStorage.
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [typeFilter, setTypeFilter] = useState<'all' | 'sell' | 'purchase'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'created' | 'scheduled' | 'picked_up' | 'inspected' | 'paid' | 'delivered' | 'cancelled'>('all')
  const [timeFilter, setTimeFilter] = useState<'all' | '7d' | '30d' | '90d'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount_desc' | 'amount_asc'>('newest')

  useEffect(() => {
    OrdersAPI.my().then((r) => setOrders(r.orders || [])).catch(() => setOrders([]))
  }, [])

  function applyFilters(list: any[]) {
    const now = Date.now()
    const inRange = (createdAt?: string) => {
      if (!createdAt || timeFilter === 'all') return true
      const t = new Date(createdAt).getTime()
      const days = timeFilter === '7d' ? 7 : timeFilter === '30d' ? 30 : 90
      return now - t <= days * 24 * 60 * 60 * 1000
    }
    let filtered = list.filter((o) =>
      (typeFilter === 'all' || o.type === typeFilter) &&
      (statusFilter === 'all' || o.status === statusFilter) &&
      inRange(o.createdAt)
    )
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      if (sortBy === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      const av = Number(a.price || a.total || 0)
      const bv = Number(b.price || b.total || 0)
      if (sortBy === 'amount_desc') return bv - av
      if (sortBy === 'amount_asc') return av - bv
      return 0
    })
    return filtered
  }

  const filtered = applyFilters(orders)
  const totalPaid = filtered
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + Number(o.price || 0), 0)
  const totalCreated = filtered
    .filter((o) => o.status === 'created')
    .reduce((sum, o) => sum + Number(o.price || 0), 0)

  const badge = (status?: string) => {
    const map: Record<string, string> = {
      created: 'bg-yellow-500/20 text-yellow-300',
      scheduled: 'bg-blue-500/20 text-blue-300',
      picked_up: 'bg-indigo-500/20 text-indigo-300',
      inspected: 'bg-purple-500/20 text-purple-300',
      paid: 'bg-emerald-500/20 text-emerald-300',
      delivered: 'bg-teal-500/20 text-teal-300',
      cancelled: 'bg-rose-500/20 text-rose-300',
    }
    const cls = map[status || ''] || 'bg-neutral-500/20 text-neutral-300'
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status || '-'}</span>
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-5">
      <h1 className="text-2xl font-semibold">My Orders</h1>

      {/* Filters */}
      <div className="glass rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Type</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-full bg-black/30 border border-white/10 rounded-md h-9 px-3">
            <option value="all">All</option>
            <option value="purchase">Purchase</option>
            <option value="sell">Sell</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full bg-black/30 border border-white/10 rounded-md h-9 px-3">
            <option value="all">All</option>
            <option value="created">Created</option>
            <option value="scheduled">Scheduled</option>
            <option value="picked_up">Picked up</option>
            <option value="inspected">Inspected</option>
            <option value="paid">Paid</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Time</label>
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} className="w-full bg-black/30 border border-white/10 rounded-md h-9 px-3">
            <option value="all">All time</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="w-full bg-black/30 border border-white/10 rounded-md h-9 px-3">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-neutral-400">Orders</div>
          <div className="text-xl font-semibold">{filtered.length}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-neutral-400">Total (Paid)</div>
          <div className="text-xl font-semibold">₹ {totalPaid.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-neutral-400">Total (Created)</div>
          <div className="text-xl font-semibold">₹ {totalCreated.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center text-neutral-300">
          No orders found for the selected filters.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((o) => (
            <div key={o._id || o.id} className="glass rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-white/10">{(o.type || 'order').toUpperCase()}</span>
                    {badge(o.status)}
                  </div>
                  {o.type === 'purchase' && Array.isArray(o.items) && o.items.length > 0 ? (
                    <div className="text-neutral-300">
                      {o.items.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.name} × {it.quantity}</span>
                          <span>₹ {Number(it.price).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-neutral-300">
                      {(o.brand || '-')}{o.model ? ` ${o.model}` : ''} {(o.storage ? `• ${o.storage}` : '')} {(o.condition ? `• ${o.condition}` : '')}
                    </div>
                  )}
                  <div className="text-xs text-neutral-400">
                    <span>Order ID:</span> <span className="font-mono">{o._id || o.id}</span>
                    {o.payment?.orderId ? <span> • RZP: <span className="font-mono">{o.payment.orderId}</span> ({o.payment?.status || 'created'})</span> : null}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Placed on {o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald-400 text-lg">₹ {Number(o.price || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
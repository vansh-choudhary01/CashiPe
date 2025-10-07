import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useMemo } from 'react'
import { CatalogAPI, QuoteAPI, OrdersAPI, hasToken } from '../../lib/api'

/**
 * Dynamic page to sell a specific gadget category.
 */
export default function SellCategoryPage() {
  const router = useRouter()
  const { category } = router.query
  // Ensure catSlug is string
  const catSlug = typeof category === 'string' ? category : ''

  const pretty = catSlug
    .replace(/-/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const [brands, setBrands] = useState<string[]>([])
  const [models, setModels] = useState<{ model: string; basePrice: number; storageOptions: string[] }[]>([])
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [condition, setCondition] = useState('Like New')
  const [storage, setStorage] = useState('128 GB')
  const [estimated, setEstimated] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false)

  // Load brands for category
  useEffect(() => {
    if (!catSlug) return
    setLoading(true)
    CatalogAPI.brands(catSlug)
      .then((r) => {
        const bs: string[] = r.brands || []
        setBrands(bs)
        if (bs.length) setBrand(bs[0])
      })
      .finally(() => setLoading(false))
  }, [catSlug])

  // Load models when brand changes
  useEffect(() => {
    if (!catSlug || !brand) return
    CatalogAPI.models(catSlug, brand).then((r) => {
      const list = (r.models || []).map((m: any) => ({ model: m.model, basePrice: m.basePrice, storageOptions: m.storageOptions || [] }))
      setModels(list)
      if (list.length) {
        setModel(list[0].model)
        if ((list[0].storageOptions || []).length) setStorage(list[0].storageOptions[0])
      }
    })
  }, [catSlug, brand])

  const basePrice = useMemo(() => models.find((m) => m.model === model)?.basePrice || 0, [models, model])

  // Live quote from backend
  useEffect(() => {
    if (!brand || !model || !storage || !condition || !hasToken()) { setEstimated(basePrice || 0); return }
    setQuoteLoading(true)
    QuoteAPI.create({ category: catSlug, brand, model, storage, condition })
      .then((r) => setEstimated(r.quote?.finalPrice || basePrice || 0))
      .catch(() => setEstimated(basePrice || 0))
      .finally(() => setQuoteLoading(false))
  }, [catSlug, brand, model, storage, condition, basePrice])

  const filteredModels = models

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sell {pretty}</h1>
        <Link href="/sell" className="text-sm text-neutral-300 hover:text-white">
          Back to categories
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="w-8 h-8 rounded bg-emerald-400/20 mb-3" />
          <div className="font-medium mb-1">Tell us about your device</div>
          <div className="text-sm text-neutral-300">Brand, model, condition</div>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="w-8 h-8 rounded bg-emerald-400/20 mb-3" />
          <div className="font-medium mb-1">Get instant quote</div>
          <div className="text-sm text-neutral-300">Transparent and best market price</div>
        </div>
        <div className="glass rounded-xl p-5">
          <div className="w-8 h-8 rounded bg-emerald-400/20 mb-3" />
          <div className="font-medium mb-1">Free pickup &amp; instant cash</div>
          <div className="text-sm text-neutral-300">Doorstep service, secure payment</div>
        </div>
      </div>
      <div className="glass rounded-2xl p-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1">Brand</label>
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value)
                setModel('')
              }}
              className="w-full glass rounded-md h-10 px-3"
            >
              {brands.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full glass rounded-md h-10 px-3"
            >
              {filteredModels.map((m) => (
                <option key={m.model}>{m.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full glass rounded-md h-10 px-3"
            >
              {['Like New','Good','Fair','Needs Repair'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Storage</label>
            <select
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              className="w-full glass rounded-md h-10 px-3"
            >
              {Array.from(new Set((filteredModels.find(m=>m.model===model)?.storageOptions || ['64 GB','128 GB','256 GB','512 GB']))).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-neutral-300">Estimated quote</div>
          <div className="text-2xl font-bold text-emerald-400">
            {quoteLoading ? 'Calculating…' : `₹ ${Number(estimated||0).toLocaleString('en-IN')}`}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            className="h-10 px-4 rounded-md bg-emerald-500 text-black font-medium"
            onClick={async () => {
              const resp = await OrdersAPI.createSell({ category: catSlug, brand, model, storage, condition, price: estimated })
              const orderId = resp.order?._id || resp.order?.id
              if (orderId) router.push(`/checkout/${orderId}`)
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect, useMemo } from 'react'
import { CatalogAPI, OrdersAPI, hasToken, PricingAPI } from '../../lib/api'

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
  const [breakdown, setBreakdown] = useState<any>(null)
  const [promo, setPromo] = useState<string>('')
  const [promoValid, setPromoValid] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [quoteLoading, setQuoteLoading] = useState<boolean>(false)
  const [imei, setImei] = useState('')
  const [questionnaire, setQuestionnaire] = useState<any>({ screenCracks: false, bodyDents: false, batteryHealth: 90, cameraIssue: false, faceIdIssue: false })

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
    PricingAPI.quote({
      category: catSlug,
      brand,
      model,
      storage,
      ageMonths: 0,
      condition: questionnaire,
      accessories: {},
      promoCode: promoValid?.promo?.code || undefined,
    })
      .then((r: any) => {
        setEstimated(r?.total || basePrice || 0)
        setBreakdown(r?.breakdown || null)
      })
      .catch(() => setEstimated(basePrice || 0))
      .finally(() => setQuoteLoading(false))
  }, [catSlug, brand, model, storage, condition, basePrice, questionnaire, promoValid])

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
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-emerald-100 mb-3" />
          <div className="font-medium mb-1">Tell us about your device</div>
          <div className="text-sm text-neutral-600">Brand, model, condition</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-emerald-100 mb-3" />
          <div className="font-medium mb-1">Get instant quote</div>
          <div className="text-sm text-neutral-600">Transparent and best market price</div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded bg-emerald-100 mb-3" />
          <div className="font-medium mb-1">Free pickup &amp; instant cash</div>
          <div className="text-sm text-neutral-600">Doorstep service, secure payment</div>
        </div>
      </div>
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1">Brand</label>
            <select
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value)
                setModel('')
              }}
              className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3"
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
              className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3"
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
              className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3"
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
              className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3"
            >
              {Array.from(new Set((filteredModels.find(m=>m.model===model)?.storageOptions || ['64 GB','128 GB','256 GB','512 GB']))).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-neutral-600">Estimated quote</div>
          <div className="text-2xl font-bold text-emerald-600">
            {quoteLoading ? 'Calculating…' : `₹ ${Number(estimated||0).toLocaleString('en-IN')}`}
          </div>
        </div>
          {breakdown && (
            <div className="mt-3 text-sm text-neutral-700">
              <div>Base: ₹ {Number(breakdown.base || 0).toLocaleString('en-IN')}</div>
              <div>Depreciated: ₹ {Number(breakdown.depreciated || 0).toLocaleString('en-IN')} (−₹ {Number(breakdown.depreciationAmount || 0).toLocaleString('en-IN')})</div>
              <div>Deductions: ₹ {Number(breakdown.deductions || 0).toLocaleString('en-IN')}</div>
              <div>Bonuses: ₹ {Number(breakdown.bonuses || 0).toLocaleString('en-IN')}</div>
              <div className="font-medium mt-1">Pre-promo total: ₹ {Number(breakdown.prePromoTotal || 0).toLocaleString('en-IN')}</div>
              {breakdown.promo && <div className="text-emerald-600">Promo {breakdown.promo.code}: −₹ {Number(breakdown.promo.discount || 0).toLocaleString('en-IN')}</div>}
            </div>
          )}
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Promo code</label>
              <div className="flex gap-2">
                <input value={promo} onChange={(e) => setPromo(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3" placeholder="Enter promo code" />
                <button className="h-10 px-3 rounded-md bg-neutral-100 border" onClick={async () => {
                  if (!promo) return alert('Enter promo code')
                  try {
                    const res = await (await import('../../lib/api')).PromosAPI.check(promo)
                    setPromoValid(res)
                    alert('Promo applied')
                  } catch (e:any) {
                    setPromoValid(null)
                    alert(e?.message || 'Invalid promo')
                  }
                }}>Apply</button>
              </div>
              {promoValid?.valid && <div className="text-sm text-emerald-600 mt-1">Applied: {promoValid.promo.code} • {promoValid.promo.type === 'percent' ? `${promoValid.promo.amount}% off` : `₹ ${promoValid.promo.amount} off`}</div>}
            </div>
          </div>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">IMEI / Serial</label>
              <div className="flex gap-2">
                <input value={imei} onChange={(e) => setImei(e.target.value)} className="w-full bg-white border border-neutral-200 rounded-md h-10 px-3" placeholder="Enter IMEI or serial" />
                <button className="h-10 px-3 rounded-md bg-neutral-100 border" onClick={async () => {
                  if (!imei) return alert('Enter IMEI or serial')
                  try {
                    const res = await PricingAPI.identify({ imei })
                    if (res?.brand) {
                      setBrand(res.brand)
                      const m = models.find((mm) => mm.model.includes(res.model || ''))
                      if (m) setModel(m.model)
                      alert(`Identified: ${res.brand} ${res.model}`)
                    } else alert('Could not identify')
                  } catch (e:any) { alert(e?.message || 'Identify failed') }
                }}>Identify</button>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Condition checklist</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={questionnaire.screenCracks} onChange={(e) => setQuestionnaire({ ...questionnaire, screenCracks: e.target.checked })} /> Screen cracks</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={questionnaire.bodyDents} onChange={(e) => setQuestionnaire({ ...questionnaire, bodyDents: e.target.checked })} /> Body dents</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={questionnaire.cameraIssue} onChange={(e) => setQuestionnaire({ ...questionnaire, cameraIssue: e.target.checked })} /> Camera issue</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={questionnaire.faceIdIssue} onChange={(e) => setQuestionnaire({ ...questionnaire, faceIdIssue: e.target.checked })} /> Face ID issue</label>
                <label className="flex items-center gap-2"><span className="text-xs">Battery %</span><input type="number" value={questionnaire.batteryHealth} onChange={(e) => setQuestionnaire({ ...questionnaire, batteryHealth: Number(e.target.value) })} className="w-16 ml-2 border rounded px-1" /></label>
              </div>
            </div>
          </div>
        <div className="mt-6 flex justify-end">
          <button
            className="h-10 px-4 rounded-md bg-emerald-600 text-white font-medium"
            onClick={async () => {
              const resp = await OrdersAPI.createSell({ category: catSlug, brand, model, storage, condition, price: estimated, promoCode: promoValid?.promo?.code, promoDiscount: promoValid?.promo ? (promoValid.promo.type === 'percent' ? Math.round((Number(estimated||0) * promoValid.promo.amount)/100) : promoValid.promo.amount) : 0 })
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
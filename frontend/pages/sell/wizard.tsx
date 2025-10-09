import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { devicesByCategory, type DeviceCategory } from '../../data/devices'
import { PricingAPI, OrdersAPI } from '../../lib/api'

export default function SellWizardPage() {
  const router = useRouter()
  const categories = Object.keys(devicesByCategory)

  const [step, setStep] = useState(1)
  const [category, setCategory] = useState<string>(categories[0] || '')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [storage, setStorage] = useState('128 GB')
  const [questionnaire, setQuestionnaire] = useState<any>({ screenCracks: false, bodyDents: false, batteryHealth: 90, cameraIssue: false, faceIdIssue: false })
  const [accessories, setAccessories] = useState<any>({ box: false, charger: false, earphones: false })
  const [promo, setPromo] = useState('')
  const [quote, setQuote] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // populate brand/model when category changes
  useEffect(() => {
    const cat = category as DeviceCategory
    const list = devicesByCategory[cat] || []
    if (list.length) {
      setBrand(list[0].brand)
      setModel(list[0].model)
      // some device definitions may not have storageOptions in this demo
      // @ts-ignore
      const so = (list[0] as any).storageOptions || ['64 GB','128 GB','256 GB']
      setStorage(so[0] || '128 GB')
    } else {
      setBrand('')
      setModel('')
    }
  }, [category])

  const models = useMemo(() => devicesByCategory[category as DeviceCategory] || [], [category])

  useEffect(() => {
    let cancelled = false
    async function fetchQuote() {
      if (!brand || !model) return
      setLoading(true)
      try {
        const res = await PricingAPI.quote({ category, brand, model, storage, ageMonths: 0, condition: questionnaire, accessories, promoCode: promo || undefined })
        if (!cancelled) setQuote(res)
      } catch (e) {
        if (!cancelled) setQuote(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchQuote()
    return () => { cancelled = true }
  }, [category, brand, model, storage, questionnaire, accessories, promo])

  async function submit() {
    try {
      const payload: any = { category, brand, model, storage, condition: JSON.stringify(questionnaire), price: quote?.total || 0 }
      // try to attach promo if present
      if (promo) payload.promoCode = promo
      const resp = await OrdersAPI.createSell(payload)
      const orderId = resp.order?._id || resp.order?.id
      if (orderId) router.push(`/checkout/${orderId}`)
    } catch (e:any) {
      alert(e?.message || 'Failed to create order')
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Sell Wizard</h1>
      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded ${step===1? 'bg-emerald-500 text-white' : 'bg-neutral-100'}`}>1</div>
          <div className={`px-3 py-1 rounded ${step===2? 'bg-emerald-500 text-white' : 'bg-neutral-100'}`}>2</div>
          <div className={`px-3 py-1 rounded ${step===3? 'bg-emerald-500 text-white' : 'bg-neutral-100'}`}>3</div>
          <div className={`px-3 py-1 rounded ${step===4? 'bg-emerald-500 text-white' : 'bg-neutral-100'}`}>4</div>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-sm mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded p-2">
              {categories.map((c) => <option key={c} value={c}>{c.replace(/-/g,' ')}</option>)}
            </select>

            <label className="block text-sm mb-1">Brand</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full border rounded p-2">
              {(models||[]).map((m:any)=> <option key={m.model} value={m.brand}>{m.brand}</option>)}
            </select>

            <label className="block text-sm mb-1">Model</label>
            <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full border rounded p-2">
              {(models||[]).map((m:any)=> <option key={m.model} value={m.model}>{m.model}</option>)}
            </select>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="text-sm">Condition checklist</div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={questionnaire.screenCracks} onChange={(e)=> setQuestionnaire({...questionnaire, screenCracks: e.target.checked})} /> Screen cracks</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={questionnaire.bodyDents} onChange={(e)=> setQuestionnaire({...questionnaire, bodyDents: e.target.checked})} /> Body dents</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={questionnaire.cameraIssue} onChange={(e)=> setQuestionnaire({...questionnaire, cameraIssue: e.target.checked})} /> Camera issue</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={questionnaire.faceIdIssue} onChange={(e)=> setQuestionnaire({...questionnaire, faceIdIssue: e.target.checked})} /> Face ID issue</label>
            <label className="flex items-center gap-2">Battery % <input type="number" value={questionnaire.batteryHealth} onChange={(e)=> setQuestionnaire({...questionnaire, batteryHealth: Number(e.target.value)})} className="w-20 ml-2 border rounded px-1" /></label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <div className="text-sm">Accessories</div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={accessories.box} onChange={(e)=> setAccessories({...accessories, box: e.target.checked})} /> Box</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={accessories.charger} onChange={(e)=> setAccessories({...accessories, charger: e.target.checked})} /> Charger</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={accessories.earphones} onChange={(e)=> setAccessories({...accessories, earphones: e.target.checked})} /> Earphones</label>
            <div>
              <label className="block text-sm mb-1">Promo code</label>
              <input value={promo} onChange={(e)=> setPromo(e.target.value)} className="w-full border rounded p-2" placeholder="Optional promo code" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="text-sm">Review</div>
            <div>Device: {brand} {model} {storage}</div>
            <div>Condition: {Object.entries(questionnaire).map(([k,v])=> `${k}:${v}`).join(', ')}</div>
            <div>Accessories: {Object.entries(accessories).filter(([,v])=>v).map(([k])=>k).join(', ') || 'None'}</div>
            <div className="mt-2">
              <div className="text-sm text-neutral-600">Estimated</div>
              <div className="text-2xl font-bold text-emerald-600">{loading ? 'Calculating…' : `₹ ${Number(quote?.total || 0).toLocaleString('en-IN')}`}</div>
              {quote?.breakdown && (
                <div className="mt-2 text-sm text-neutral-700">
                  <div>Pre-promo: ₹ {Number(quote.breakdown.prePromoTotal || 0).toLocaleString('en-IN')}</div>
                  {quote.breakdown.promo && <div className="text-emerald-600">Promo {quote.breakdown.promo.code}: −₹ {Number(quote.breakdown.promo.discount || 0).toLocaleString('en-IN')}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <div>
            {step > 1 && <button className="h-10 px-4 rounded-md bg-neutral-100" onClick={()=> setStep(step-1)}>Back</button>}
          </div>
          <div>
            {step < 4 && <button className="h-10 px-4 rounded-md bg-emerald-600 text-white" onClick={()=> setStep(step+1)}>Next</button>}
            {step === 4 && <button className="h-10 px-4 rounded-md bg-emerald-600 text-white" onClick={submit}>Place order</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

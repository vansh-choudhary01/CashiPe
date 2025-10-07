import { useState } from 'react'
import type { RefurbishedDevice, RefurbishedGrade } from '../data/refurbished'
import { refurbishedDevices } from '../data/refurbished'
import { addToCart } from '../store/cart'

/**
 * Lists refurbished devices with optional filtering by grade.
 */
export default function RefurbishedPage() {
  const [grade, setGrade] = useState<RefurbishedGrade | 'All'>('All')
  const filtered =
    grade === 'All'
      ? refurbishedDevices
      : refurbishedDevices.filter((d) => d.grade === grade)

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Refurbished Devices</h1>
      <div className="flex items-center gap-3">
        <label className="text-sm">Filter by grade:</label>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value as RefurbishedGrade | 'All')}
          className="glass rounded-md h-9 px-3"
        >
          <option value="All">All</option>
          <option value="Fair">Fair</option>
          <option value="Good">Good</option>
          <option value="Superb">Superb</option>
        </select>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((device) => (
          <RefurbishedCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  )
}


function RefurbishedCard({ device }: { device: RefurbishedDevice }) {
  return (
    <div className="glass rounded-xl p-4 space-y-2 hover:scale-[1.02] transition">
      <div className="text-lg font-medium">
        {device.brand} {device.model}
      </div>
      <div className="text-sm text-neutral-300">Grade: {device.grade}</div>
      <div className="text-sm text-neutral-300">Warranty: {device.warrantyMonths} months</div>
      <div className="font-semibold text-emerald-400">
        ₹ {device.price.toLocaleString('en-IN')}
      </div>
      {device.videoUrl && (
        <video
          src={device.videoUrl}
          controls
          className="w-full h-40 rounded-lg object-cover"
        />
      )}
      <button
        className="mt-2 h-9 px-4 rounded-md bg-emerald-500 text-black font-medium w-full"
        onClick={() => {
          addToCart({ id: device.id, name: `${device.brand} ${device.model}`, price: device.price, quantity: 1 })
          window.location.href = '/payment'
        }}
      >
        Buy Now
      </button>
    </div>
  )
}
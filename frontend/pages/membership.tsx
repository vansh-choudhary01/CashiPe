import { joinMembership, isMember } from '../store/membership'
import { useEffect, useState } from 'react'

/**
 * Describes membership benefits and lets user join Gold membership.
 */
export default function MembershipPage() {
  const [member, setMember] = useState(false)
  useEffect(() => {
    setMember(isMember())
  }, [])
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-semibold">CashPe Gold Membership</h1>
      <p className="text-sm text-neutral-300">
        Unlock exclusive benefits with our Gold Membership plan.
      </p>
      <ul className="list-disc list-inside space-y-2 text-neutral-300">
        <li>₹600 off on your first refurbished purchase</li>
        <li>5% off on subsequent purchases (up to ₹1000)</li>
        <li>No processing fees on orders</li>
        <li>10% off on accessories</li>
        <li>Extra ₹300 when you sell your device</li>
      </ul>
      {member ? (
        <p className="text-emerald-400">You are already a Gold member!</p>
      ) : (
        <button
          className="h-10 px-5 rounded-md bg-emerald-500 text-black font-medium"
          onClick={() => {
            joinMembership()
            setMember(true)
            alert('Welcome to Gold Membership!')
          }}
        >
          Join Gold Membership
        </button>
      )}
    </div>
  )
}
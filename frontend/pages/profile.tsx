import { useEffect, useState } from 'react'
import { AuthAPI, MembershipAPI } from '../lib/api'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [membership, setMembership] = useState<any>(null)

  // Editable fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [city, setCity] = useState('')
  const [pin, setPin] = useState('')

  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifySms, setNotifySms] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const u = await AuthAPI.me()
        setUser(u.user)
        setName(u.user?.name || '')
        setEmail(u.user?.email || '')
        setPhone(u.user?.phone || '')
      } catch {}
      try {
        const m = await MembershipAPI.status()
        setMembership(m)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  async function onSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // TODO: Hook up backend endpoint for profile updates
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    alert('Profile saved (placeholder).')
  }

  async function onSaveAddress(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // TODO: Hook up backend endpoint for address book
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    alert('Address saved (placeholder).')
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // TODO: Hook up backend endpoint for password change
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    alert('Password updated (placeholder).')
  }

  async function onSavePrefs(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // TODO: Hook up backend endpoint for preferences
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    alert('Preferences saved (placeholder).')
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10">
        <div className="bg-white border border-neutral-200 rounded-xl p-8 shadow-sm">Loading account...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Profile</h1>
      </div>

      {/* Profile */}
      <form onSubmit={onSaveProfile} className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Profile</h2>
          <button disabled={saving} className="h-9 px-4 rounded-md bg-emerald-600 text-white font-medium">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
        </div>
      </form>

      {/* Membership */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-sm">
        <h2 className="text-lg font-medium">Membership</h2>
        {membership?.tier ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Status: <span className="font-medium">{membership.tier.toUpperCase()}</span></div>
              <div className="text-xs text-neutral-600">Renewal: {membership.renewal || '-'}</div>
            </div>
            <button className="h-9 px-4 rounded-md bg-neutral-100 border border-neutral-200">Manage</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm">You are not enrolled in a membership.</div>
            <button className="h-9 px-4 rounded-md bg-emerald-600 text-white font-medium">Upgrade to Gold</button>
          </div>
        )}
      </div>

      {/* Addresses */}
      <form onSubmit={onSaveAddress} className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Addresses</h2>
          <button disabled={saving} className="h-9 px-4 rounded-md bg-emerald-600 text-white font-medium">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Address Line 1</label>
            <input value={address1} onChange={(e) => setAddress1(e.target.value)} className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Address Line 2</label>
            <input value={address2} onChange={(e) => setAddress2(e.target.value)} className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">PIN</label>
            <input value={pin} onChange={(e) => setPin(e.target.value)} className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
        </div>
        <div className="text-xs text-neutral-600">Multiple addresses and default selection will be supported later.</div>
      </form>

      {/* Security */}
      <form onSubmit={onChangePassword} className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Security</h2>
          <button disabled={saving} className="h-9 px-4 rounded-md bg-emerald-600 text-white font-medium">
            {saving ? 'Updating...' : 'Update'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Current Password</label>
            <input type="password" className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">New Password</label>
            <input type="password" className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
          <div>
            <label className="block text-xs text-neutral-600 mb-1">Confirm Password</label>
            <input type="password" className="w-full h-10 px-3 rounded-md bg-white border border-neutral-200" />
          </div>
        </div>
      </form>

      {/* Preferences */}
      <form onSubmit={onSavePrefs} className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Preferences</h2>
          <button disabled={saving} className="h-9 px-4 rounded-md bg-emerald-600 text-white font-medium">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
            <span>Email notifications</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} />
            <span>SMS notifications</span>
          </label>
        </div>
      </form>
    </div>
  )
}
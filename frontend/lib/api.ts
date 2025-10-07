const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Safe browser-only toast helper via dynamic import to avoid server-side import issues
async function toastError(message: string) {
  if (typeof window === 'undefined') return
  const mod = await import('react-hot-toast')
  mod.toast.error(message)
}

type Options = RequestInit & { auth?: boolean }

export function getToken() {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('cashpe-token') || ''
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('cashpe-token', token)
}

export function clearToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('cashpe-token')
}

export function hasToken() {
  return !!getToken()
}

export async function api(path: string, opts: Options = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  }
  if (opts.auth) {
    const t = getToken()
    if (t) headers['Authorization'] = `Bearer ${t}`
  }
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...opts,
      headers,
    })
  } catch (e) {
    await toastError('Network error. Please check your connection.')
    throw e
  }
  if (!res.ok) {
    // Try to extract a message from JSON, fallback to text, then status
    let msg = ''
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      try {
        const j: any = await res.json()
        msg = j?.message || j?.error || ''
      } catch {}
    }
    if (!msg) {
      try { msg = await res.text() } catch {}
    }
    // Normalize message to string
    if (typeof msg !== 'string') {
      try { msg = JSON.stringify(msg) } catch { msg = '' }
    }

    // Friendly hints for common cases
    let hint = typeof msg === 'string' ? msg.trim() : ''
    if (!hint) {
      if (res.status === 401 && path.includes('/auth/login')) hint = 'Invalid credentials'
      else if (res.status === 401) hint = 'Please sign in to continue'
      else if (res.status === 400) hint = 'Invalid request'
      else if (res.status >= 500) hint = 'Something went wrong. Please try again.'
      else hint = `Request failed (HTTP ${res.status})`
    }
    await toastError(hint)
    throw new Error(hint)
  }
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? res.json() : res.text()
}

export const AuthAPI = {
  register: async (email: string, password: string, name?: string) => {
    const r = await api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) })
    return r as { token: string; user: any }
  },
  login: async (email: string, password: string) => {
    const r = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    return r as { token: string; user: any }
  },
  me: async () => {
    const r = await api('/auth/me', { auth: true })
    return r as { user: any }
  },
  logout: async () => {
    try { await api('/auth/logout', { method: 'POST', auth: true }) } catch {}
    clearToken()
  }
}

export const CatalogAPI = {
  categories: () => api('/catalog/categories'),
  brands: (category?: string) => api(`/catalog/brands${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  models: (category: string, brand: string) => api(`/catalog/models?category=${encodeURIComponent(category)}&brand=${encodeURIComponent(brand)}`),
  search: (q: string) => api(`/catalog/search?q=${encodeURIComponent(q)}`),
}

export const QuoteAPI = {
  create: (payload: any) => api('/quotes', { method: 'POST', body: JSON.stringify(payload), auth: true }),
}

export const OrdersAPI = {
  createSell: (payload: any) => api('/orders/sell', { method: 'POST', body: JSON.stringify(payload), auth: true }),
  schedule: (payload: any) => api('/orders/schedule', { method: 'POST', body: JSON.stringify(payload), auth: true }),
  my: () => api('/orders/my', { auth: true }),
  get: (id: string) => api(`/orders/${id}`, { auth: true }),
}

export const PickupAPI = {
  slots: () => api('/pickup/slots'),
}

export const MembershipAPI = {
  status: () => api('/membership/status', { auth: true }),
  enroll: (tier: 'gold') => api('/membership/enroll', { method: 'POST', body: JSON.stringify({ tier }), auth: true }),
}

export const PaymentsAPI = {
  razorpayOrder: (amount: number, items: { id: string; name: string; price: number; quantity: number }[]) =>
    api('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ amount, currency: 'INR', items }),
      auth: true,
    }),
  razorpayVerify: (payload: { order_id: string; payment_id: string; signature: string }) =>
    api('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(payload) }),
}

export const AccessoriesAPI = {
  list: () => api('/accessories'),
  get: (id: string) => api(`/accessories/${id}`),
}

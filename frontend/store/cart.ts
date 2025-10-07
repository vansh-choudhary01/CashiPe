export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

const LS_KEY = 'cashpe-cart'

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]') as CartItem[]
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(items))
}

export function addToCart(item: CartItem): void {
  const current = loadCart()
  const existing = current.find((c) => c.id === item.id)
  let next: CartItem[] = []
  if (existing) {
    next = current.map((c) =>
      c.id === item.id ? { ...c, quantity: c.quantity + item.quantity } : c,
    )
  } else {
    next = [...current, item]
  }
  saveCart(next)
}

export function removeFromCart(id: string): void {
  const current = loadCart().filter((c) => c.id !== id)
  saveCart(current)
}

export function clearCart(): void {
  saveCart([])
}
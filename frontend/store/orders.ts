export type Order = {
  id: string
  category: string
  brand: string
  model: string
  storage: string
  condition: string
  price: number
  customer?: {
    name: string
    phone: string
    address: string
    pickupAt: string
  }
  createdAt: string
}

const LS_KEY = 'cashpe-orders'

export function loadOrders(): Order[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]') as Order[]
  } catch {
    return []
  }
}

export function saveOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(orders))
}

export function createOrder(partial: Omit<Order, 'id' | 'createdAt'>): Order {
  const order: Order = {
    ...partial,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
  }
  const next = [...loadOrders(), order]
  saveOrders(next)
  return order
}

export function getOrder(id: string): Order | undefined {
  return loadOrders().find((o) => o.id === id)
}

export function updateOrder(id: string, changes: Partial<Order>): Order | undefined {
  const orders = loadOrders()
  const idx = orders.findIndex((o) => o.id === id)
  if (idx === -1) return undefined
  orders[idx] = { ...orders[idx], ...changes }
  saveOrders(orders)
  return orders[idx]
}
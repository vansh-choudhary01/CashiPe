// Data definitions for accessories available for purchase.

export interface Accessory {
  id: string
  name: string
  description: string
  price: number
}

export const accessories: Accessory[] = [
  {
    id: 'acc1',
    name: 'Phone Case',
    description: 'Durable protective case for smartphones.',
    price: 599,
  },
  {
    id: 'acc2',
    name: 'Screen Protector',
    description: 'Tempered glass screen protector to prevent scratches.',
    price: 299,
  },
  {
    id: 'acc3',
    name: 'Type‑C Cable',
    description: 'Fast charging Type‑C cable.',
    price: 249,
  },
  {
    id: 'acc4',
    name: 'Wireless Earbuds',
    description: 'High‑quality wireless earbuds with noise cancellation.',
    price: 3999,
  },
]
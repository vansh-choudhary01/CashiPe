// Data definitions for refurbished devices
// In a real application these would come from an API or database.

export type RefurbishedGrade = 'Fair' | 'Good' | 'Superb'

export interface RefurbishedDevice {
  id: string
  brand: string
  model: string
  grade: RefurbishedGrade
  price: number
  warrantyMonths: number
  videoUrl?: string
}

export const refurbishedDevices: RefurbishedDevice[] = [
  {
    id: 'ref1',
    brand: 'Apple',
    model: 'iPhone 13',
    grade: 'Good',
    price: 35000,
    warrantyMonths: 6,
    videoUrl: 'https://example.com/videos/iphone13-good.mp4',
  },
  {
    id: 'ref2',
    brand: 'Samsung',
    model: 'Galaxy S21',
    grade: 'Superb',
    price: 32000,
    warrantyMonths: 12,
    videoUrl: 'https://example.com/videos/galaxys21-superb.mp4',
  },
  {
    id: 'ref3',
    brand: 'OnePlus',
    model: '9 Pro',
    grade: 'Fair',
    price: 25000,
    warrantyMonths: 6,
    videoUrl: 'https://example.com/videos/oneplus9-fair.mp4',
  },
]
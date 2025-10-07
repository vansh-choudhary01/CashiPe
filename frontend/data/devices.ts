export type DeviceCategory =
  | 'phone'
  | 'tablet'
  | 'laptop'
  | 'smartwatch'
  | 'earbuds'
  | 'gaming-console'
  | 'tv'
  | 'desktop'
  | 'camera'

export type DeviceModel = {
  brand: string
  model: string
  basePrice: number
}

export const devicesByCategory: Record<DeviceCategory, DeviceModel[]> = {
  phone: [
    { brand: 'Apple', model: 'iPhone 14 Pro', basePrice: 54000 },
    { brand: 'Apple', model: 'iPhone 13', basePrice: 30000 },
    { brand: 'Samsung', model: 'Galaxy S23', basePrice: 35000 },
    { brand: 'OnePlus', model: '11R', basePrice: 22000 },
  ],
  tablet: [
    { brand: 'Apple', model: 'iPad Pro 11"', basePrice: 40000 },
    { brand: 'Samsung', model: 'Tab S8', basePrice: 28000 },
  ],
  laptop: [
    { brand: 'Apple', model: 'MacBook Air M1', basePrice: 52000 },
    { brand: 'Dell', model: 'XPS 13', basePrice: 48000 },
  ],
  smartwatch: [
    { brand: 'Apple', model: 'Watch Series 8', basePrice: 15000 },
    { brand: 'Samsung', model: 'Watch 6', basePrice: 9000 },
  ],
  earbuds: [
    { brand: 'Apple', model: 'AirPods Pro 2', basePrice: 9000 },
    { brand: 'Sony', model: 'WF-1000XM4', basePrice: 7000 },
  ],
  'gaming-console': [
    { brand: 'Sony', model: 'PlayStation 5', basePrice: 30000 },
    { brand: 'Microsoft', model: 'Xbox Series X', basePrice: 26000 },
  ],
  tv: [
    { brand: 'Samsung', model: 'QLED 55"', basePrice: 25000 },
    { brand: 'LG', model: 'C2 OLED 48"', basePrice: 42000 },
  ],
  desktop: [
    { brand: 'Apple', model: 'iMac 24"', basePrice: 65000 },
    { brand: 'Custom', model: 'Ryzen 5 + 3060', basePrice: 40000 },
  ],
  camera: [
    { brand: 'Sony', model: 'A7 III', basePrice: 45000 },
    { brand: 'Canon', model: 'R10', basePrice: 38000 },
  ],
}

export const storageMultipliers: Record<string, number> = {
  '64 GB': 1,
  '128 GB': 1.08,
  '256 GB': 1.16,
  '512 GB': 1.25,
}

export const conditionMultipliers: Record<string, number> = {
  'Like New': 1,
  'Good': 0.9,
  'Fair': 0.78,
  'Needs Repair': 0.5,
}
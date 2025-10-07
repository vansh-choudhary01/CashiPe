import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadCart, removeFromCart } from '../store/cart'

/**
 * Cart page for listing items added from the accessories page. Users can
 * remove items and proceed to payment. If the cart is empty, a message is shown.
 */
export default function CartPage() {
  const [items, setItems] = useState(loadCart())

  useEffect(() => {
    setItems(loadCart())
  }, [])

  const handleRemove = (id: string) => {
    removeFromCart(id)
    setItems(loadCart())
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Your Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">
                    {item.name} × {item.quantity}
                  </p>
                  <p className="text-sm text-neutral-300">
                    ₹ {item.price.toLocaleString('en-IN')} each
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="h-8 px-3 rounded-md bg-red-500 text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6">
            <p className="text-lg font-semibold">
              Total: ₹ {total.toLocaleString('en-IN')}
            </p>
            <Link
              href="/payment"
              className="h-10 px-5 rounded-md bg-emerald-500 text-black font-medium flex items-center"
            >
              Proceed to Payment
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
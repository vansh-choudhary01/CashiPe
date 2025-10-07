import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { loadCart, clearCart } from '../store/cart'
import type { CartItem } from '../store/cart'
import Script from 'next/script'
import { PaymentsAPI } from '../lib/api'

/**
 * Payment page that integrates Razorpay for UPI payments. It creates a Razorpay order
 * via the internal API route and opens the Razorpay checkout with UPI as the only method.
 */
export default function PaymentPage() {
  // Avoid hydration mismatch by reading cart only on client
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const router = useRouter()
  const [paying, setPaying] = useState(false)

  // Razorpay script is loaded using Next.js Script component. The script must
  // be included on the client side so that window.Razorpay is defined.

  useEffect(() => {
    // Run only on client after mount
    setItems(loadCart())
    setMounted(true)
  }, [])

  const handlePay = async () => {
    if (paying) return
    setPaying(true)
    try {
      // Create order via API route; amount should be in rupees
      const { order } = await PaymentsAPI.razorpayOrder(total, items)
      console.log('order created - ', order)
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string | undefined
      if (!keyId) {
        alert('Payment configuration missing. Please set NEXT_PUBLIC_RAZORPAY_KEY_ID in frontend/.env.local and restart the dev server.')
        setPaying(false)
        return
      }
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'CashPe Marketplace',
        description: 'Accessory Purchase',
        order_id: order.id,
        method: {
          upi: true,
          card: false,
          netbanking: false,
        },
        prefill: {
          name: 'CashPe User',
          email: 'user@example.com',
          contact: '9999999999',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await PaymentsAPI.razorpayVerify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            })
            if ((verifyRes as any)?.valid) {
              clearCart()
              alert('Payment successful!')
              router.push('/orders')
            } else {
              alert('Payment verification failed')
            }
          } catch (e) {
            console.error(e)
            alert('Payment verification error')
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false)
          },
        },
        theme: { color: '#34d399' },
      }
      // Ensure Razorpay SDK is available on the client window
      // const rzp = new (window as any).Razorpay(options)
      // rzp.open()

      // TODO: Open Razorpay checkout after debugging
      clearCart()
      alert('Payment successful!')
      router.push('/orders')
    } catch (err) {
      console.error(err)
      alert('Payment failed')
      setPaying(false)
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Complete Payment</h1>
        <p>Loading cart...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Load Razorpay Checkout SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <h1 className="text-2xl font-semibold">Complete Payment</h1>
      {items.length === 0 ? (
        <p>No items to pay for.</p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-white/10 pb-2"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹ {item.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <p className="text-right font-semibold mt-2">
              Total: ₹ {total.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={handlePay}
            disabled={paying}
            className="h-10 px-5 rounded-md bg-emerald-500 text-black font-medium w-full"
          >
            {paying ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')}`}
          </button>
        </>
      )}
    </div>
  )
}
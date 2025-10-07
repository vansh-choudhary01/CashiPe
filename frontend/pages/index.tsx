import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto py-12 space-y-16 px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl p-10 sm:p-14 bg-gradient-to-br from-emerald-500 to-emerald-400 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <p className="text-lg font-semibold text-emerald-300 mb-3">Select Your Location</p>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6">
            Sell Your Tech Fast and Fair
          </h1>
          <p className="text-neutral-100 text-lg mb-6">Get an instant quote for your phone, laptop, tablet &amp; more.</p>
          <div className="mt-8 flex gap-6">
            <Link href="/sell" className="inline-flex h-14 px-6 rounded-full bg-emerald-600 text-white font-semibold items-center shadow-lg hover:bg-emerald-700 transition duration-300 ease-in-out">
              Start Selling
            </Link>
            <Link href="/refurbished" className="inline-flex h-14 px-6 rounded-full bg-transparent border-2 border-emerald-600 text-emerald-600 font-semibold items-center hover:bg-emerald-600 hover:text-white transition duration-300 ease-in-out">
              Buy Refurbished
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: "url('your-image-url.jpg')" }} />
      </section>

      {/* Trust bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: 'Free Pickup', sub: 'Doorstep service' },
          { label: 'Instant Payment', sub: 'UPI/Card/Cash' },
          { label: 'Best Prices', sub: 'Market-matched' },
          { label: 'Secure', sub: 'Verified partners' },
        ].map((it) => (
          <div key={it.label} className="bg-white/10 p-6 rounded-2xl shadow-xl text-center">
            <div className="text-lg font-semibold text-neutral-50">{it.label}</div>
            <div className="text-sm text-neutral-400">{it.sub}</div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-semibold text-center mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            'Phone', 'Tablet', 'Laptop', 'Smartwatch', 'Earbuds', 'Gaming Console', 'TV', 'Desktop', 'Camera',
          ].map((label, i) => {
            const slug = label.toLowerCase().replace(/\s+/g, '-')
            return (
              <Link key={i} href={`/sell/${slug}`} className="flex flex-col items-center bg-gradient-to-b from-neutral-900/60 to-neutral-900 rounded-xl p-6 transition transform hover:scale-105 hover:from-neutral-800/60">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 mb-4" />
                <div className="font-medium text-white">{label}</div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Highlights */}
      <section className="grid sm:grid-cols-3 gap-8">
        {[
          { title: 'Best Prices', desc: 'Get instant quote with market-best rates.' },
          { title: 'Free Pickup', desc: 'Doorstep collection, no hidden fees.' },
          { title: 'Secure & Trusted', desc: 'Verified partners and secure payments.' },
        ].map((it) => (
          <div key={it.title} className="bg-white/10 rounded-2xl p-8 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">{it.title}</h3>
            <p className="text-sm text-neutral-300">{it.desc}</p>
          </div>
        ))}
      </section>

      {/* Stats band */}
      <section className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {[
          {k:'1.2M+',v:'Devices Quoted'},
          {k:'4.8/5',v:'Avg. Rating'},
          {k:'250+',v:'Pickup Cities'},
          {k:'10k+',v:'Verified Buyers'},
        ].map(s => (
          <div key={s.k}>
            <div className="text-3xl font-extrabold">{s.k}</div>
            <div className="text-sm">{s.v}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-2xl font-semibold text-center mb-6">How it Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { t:'Tell us about your device', d:'Brand, model, condition' },
            { t:'Get instant quote', d:'Transparent and best market price' },
            { t:'Free pickup & instant cash', d:'Doorstep service, secure payment' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-8 bg-neutral-900 border border-white/10 text-center shadow-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 mb-4" />
              <div className="text-lg font-semibold text-white mb-2">{s.t}</div>
              <div className="text-sm text-neutral-300">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-neutral-800 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">Trusted for Safe and Hassle-Free Selling!</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-neutral-900 rounded-xl p-6 border border-white/10 text-center shadow-xl">
              <p className="text-sm text-neutral-300 mb-4">This app helped me sell my phone quickly and for a fair price. Highly recommend!</p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-700" />
                <div>
                  <p className="text-sm font-medium text-white">Customer {i}</p>
                  <p className="text-xs text-emerald-400">Selling iPhone 14 Pro</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-600 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
        <div>
          <h3 className="text-2xl font-semibold">Sell Your Devices Fast and Fair at <span className="text-emerald-400">cashiPe</span></h3>
          <p className="text-sm">Instant quotes • Free pickup • Secure payments</p>
        </div>
        <Link href="/sell" className="inline-flex h-12 px-8 rounded-full bg-emerald-500 text-black font-semibold items-center hover:bg-emerald-600 transition duration-300 ease-in-out">Get Started</Link>
      </section>
    </div>
  )
}

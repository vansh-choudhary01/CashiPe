import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl p-8 sm:p-10 glass">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm text-emerald-300/90 mb-2">Select your location</p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Sell Your Tech Fast and Fair
          </h1>
          <p className="text-neutral-300 max-w-xl">Get an instant quote for your phone, laptop, tablet &amp; more.</p>
          <div className="mt-6 flex gap-3">
            <Link href="/sell" className="inline-flex h-11 px-5 rounded-md bg-emerald-500 text-black font-medium items-center">Start Selling</Link>
            <Link href="/refurbished" className="inline-flex h-11 px-5 rounded-md glass items-center">Buy Refurbished</Link>
          </div>
        </div>
        <div className="absolute inset-0 -z-0" />
      </section>

      {/* Trust bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Free Pickup', sub: 'Doorstep service' },
          { label: 'Instant Payment', sub: 'UPI/Card/Cash' },
          { label: 'Best Prices', sub: 'Market-matched' },
          { label: 'Secure', sub: 'Verified partners' },
        ].map((it) => (
          <div key={it.label} className="glass rounded-xl p-3 sm:p-4 text-center">
            <div className="text-sm font-semibold">{it.label}</div>
            <div className="text-xs text-neutral-400">{it.sub}</div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            'Phone',
            'Tablet',
            'Laptop',
            'Smartwatch',
            'Earbuds',
            'Gaming Console',
            'Tv',
            'Desktop',
            'Camera',
          ].map((label, i) => {
            const slug = label.toLowerCase().replace(/\s+/g, '-')
            return (
              <Link key={i} href={`/sell/${slug}`} className="rounded-xl border border-white/10 bg-gradient-to-b from-neutral-900/60 to-neutral-900 p-4 hover:from-neutral-800/60 transition">
                <div className="w-8 h-8 rounded bg-emerald-400/20 mb-3" />
                <div className="font-medium">{label}</div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Highlights */}
      <section className="grid sm:grid-cols-3 gap-4">
        {[
          { title: 'Best Prices', desc: 'Get instant quote with market-best rates.' },
          { title: 'Free Pickup', desc: 'Doorstep collection, no hidden fees.' },
          { title: 'Secure & Trusted', desc: 'Verified partners and secure payments.' },
        ].map((it) => (
          <div key={it.title} className="glass rounded-2xl p-6">
            <div className="w-8 h-8 rounded bg-emerald-400/20 mb-3" />
            <h3 className="font-semibold mb-1">{it.title}</h3>
            <p className="text-sm text-neutral-300">{it.desc}</p>
          </div>
        ))}
      </section>

      {/* Stats band */}
      <section className="glass rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
        {[{k:'1.2M+',v:'Devices Quoted'},{k:'4.8/5',v:'Avg. Rating'},{k:'250+',v:'Pickup Cities'},{k:'10k+',v:'Verified Buyers'}].map(s=> (
          <div key={s.k}>
            <div className="text-2xl font-extrabold text-emerald-400">{s.k}</div>
            <div className="text-xs text-neutral-300">{s.v}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-xl font-semibold mb-4">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { t:'Tell us about your device', d:'Brand, model, condition' },
            { t:'Get instant quote', d:'Transparent and best market price' },
            { t:'Free pickup & instant cash', d:'Doorstep service, secure payment' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-6 bg-neutral-900 border border-white/10">
              <div className="w-8 h-8 rounded bg-emerald-400/20 mb-3" />
              <div className="font-medium mb-1">{s.t}</div>
              <div className="text-sm text-neutral-300">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-3">Trusted for safe and hassle-free selling!</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl p-4 bg-neutral-900 border border-white/10">
              <p className="text-sm text-neutral-300 mb-3">This app helped me sell my phone quickly and for a fair price. Highly recommend!</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-700" />
                <div>
                  <p className="text-sm font-medium">Customer {i}</p>
                  <p className="text-xs text-emerald-400">Selling iPhone 14 Pro</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-semibold">Sell Your Devices Fast and Fair at <span className="text-emerald-400">cashiPe</span></h3>
          <p className="text-sm text-neutral-300">Instant quotes • Free pickup • Secure payments</p>
        </div>
        <Link href="/sell" className="inline-flex h-10 px-4 rounded-md bg-emerald-500 text-black font-medium items-center">Get Started</Link>
      </section>
    </div>
  )
}
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const visualCategories = [
  {
    title: "Networking Switches",
    subtitle: "PoE+, Managed & 10G SFP+",
    href: "/products/networking",
    image: "/top-categories/networking.webp",
  },
  {
    title: "Laptops & Workstations",
    subtitle: "ThinkPad, MacBook Pro & Precision",
    href: "/products/laptops",
    image: "/top-categories/laptops.webp",
  },
  {
    title: "WiFi 7 Access Points",
    subtitle: "Ultra-Fast Enterprise Wireless",
    href: "/products/networking",
    image: "/top-categories/networking.webp",
  },
  {
    title: "Rack Servers & NAS",
    subtitle: "Synology, Dual Xeon & Storage",
    href: "/products/server-computers",
    image: "/top-categories/software.webp",
  },
  {
    title: "Monitors & Docks",
    subtitle: "4K Displays & Thunderbolt 4 Hubs",
    href: "/products/monitors",
    image: "/top-categories/monitors.webp",
  },
  {
    title: "Cables & Server Racks",
    subtitle: "Cat6A, Fiber Optic & 19\" Cabinets",
    href: "/products/networking",
    image: "/top-categories/gaming.webp",
  },
]

export default function TritechHomeHero() {
  return (
    <div className="bg-white text-slate-900">
      {/* 1. Cinematic Tech Hero Banner */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-center">
        {/* Real High-Tech Hero Image */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/tech-hero.jpg"
            alt="High-Performance Laptops and Enterprise Networking Devices"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Subtle gradient overlay to keep text ultra-readable while showcasing the photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-transparent sm:w-3/4 lg:w-3/5" />
          <div className="absolute inset-0 bg-slate-950/40" />
        </div>

        <div className="content-container py-16 sm:py-24 relative z-10">
          <div className="max-w-2xl space-y-6">

            {/* Minimalist Tech Chip */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              Enterprise Networking &amp; Pro Laptops
            </div>

            {/* Clean Punchy Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Next-Gen Tech. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Connected &amp; Built to Perform.
              </span>
            </h1>

            {/* Short 1-Sentence Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 max-w-lg leading-relaxed font-normal">
              Explore managed 10GbE switches, WiFi 7 access points, and mobile workstations engineered for peak reliability.
            </p>

            {/* Clear Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <LocalizedClientLink
                href="/products/networking"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all"
              >
                <span>Shop Networking</span>
                <span className="ml-2">&rarr;</span>
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/products/laptops"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-white/30 bg-white/10 px-6 text-xs sm:text-sm font-bold uppercase tracking-wider text-white backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                <span>Shop Laptops</span>
              </LocalizedClientLink>
            </div>

            {/* 4 Clean Micro-Pills */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">&bull;</span> Same-Day Dispatch
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-blue-400 font-bold">&bull;</span> Tier-1 Warranty
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">&bull;</span> WiFi 7 &amp; 10GbE Ready
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-indigo-400 font-bold">&bull;</span> B2B Volume Pricing
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Visual Hardware Categories (Clean, Image-First, No Text Walls) */}
      <section className="content-container py-12 sm:py-16" aria-label="Product Categories">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Browse by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select a hardware department to start shopping
            </p>
          </div>

          <LocalizedClientLink
            href="/shop"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
          >
            <span>View All</span>
            <span aria-hidden="true">&rarr;</span>
          </LocalizedClientLink>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {visualCategories.map((cat, idx) => (
            <LocalizedClientLink
              key={idx}
              href={cat.href}
              className="group bg-slate-50 hover:bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col items-center justify-between text-center transition-all duration-200 hover:shadow-lg hover:border-blue-300"
            >
              <div className="relative w-full h-24 sm:h-28 flex items-center justify-center mb-2">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="160px"
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              <div className="w-full pt-2 border-t border-slate-100">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {cat.title}
                </h3>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                  {cat.subtitle}
                </span>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      {/* 3. Simple B2B Quotation Banner */}
      <section className="content-container pb-10">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold block">
              B2B &amp; Project Procurement
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Planning an office network or bulk hardware purchase?
            </h3>
            <p className="text-xs text-slate-400">
              Submit your Bill of Materials (BOM) for fast volume discount pricing and delivery estimates.
            </p>
          </div>

          <LocalizedClientLink
            href="/it-solutions#request-quote"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-6 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-500 transition-colors shadow-sm"
          >
            <span>Request a Quote</span>
            <span className="ml-2">&rarr;</span>
          </LocalizedClientLink>
        </div>
      </section>
    </div>
  )
}

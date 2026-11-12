import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const departments = [
  { code: "01", title: "Laptops", detail: "Business, student and everyday computing", icon: "laptop" },
  { code: "02", title: "Smartphones", detail: "Stay connected wherever you go", icon: "phone" },
  { code: "03", title: "Networking", detail: "Routers, switches and Wi-Fi", icon: "network" },
  { code: "04", title: "Accessories", detail: "Essential tech for every setup", icon: "headphones" },
  { code: "05", title: "Tablets", detail: "Portable productivity and entertainment", icon: "tablet" },
  { code: "06", title: "Servers & storage", detail: "Infrastructure for growing teams", icon: "server" },
  { code: "07", title: "Wireless solutions", detail: "Reliable connectivity solutions", icon: "wifi" },
]

function CategoryIcon({ kind }: { kind: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 text-blue-700" aria-hidden="true" {...common}>
      {kind === "laptop" && <><rect x="13" y="10" width="38" height="31" rx="3" /><path d="M7 48h50l-5 6H12l-5-6Z" /></>}
      {kind === "phone" && <><rect x="19" y="5" width="26" height="54" rx="5" /><path d="M27 11h10M29 52h6" /></>}
      {kind === "network" && <><rect x="8" y="25" width="48" height="24" rx="5" /><path d="M18 25V13m28 12V13M13 38h3m8 0h3m8 0h3m8 0h3" /><circle cx="47" cy="43" r="1" fill="currentColor" /></>}
      {kind === "headphones" && <><path d="M12 35v-5a20 20 0 0 1 40 0v5" /><rect x="8" y="32" width="12" height="22" rx="5" /><rect x="44" y="32" width="12" height="22" rx="5" /></>}
      {kind === "tablet" && <><rect x="11" y="6" width="42" height="52" rx="5" /><circle cx="32" cy="51" r="1.5" fill="currentColor" /></>}
      {kind === "server" && <><rect x="13" y="6" width="38" height="52" rx="4" /><path d="M19 18h26M19 32h26M19 46h26" /><circle cx="43" cy="12" r="1.5" fill="currentColor" /><circle cx="43" cy="26" r="1.5" fill="currentColor" /><circle cx="43" cy="40" r="1.5" fill="currentColor" /></>}
      {kind === "wifi" && <><path d="M7 24a38 38 0 0 1 50 0M15 33a26 26 0 0 1 34 0M23 42a14 14 0 0 1 18 0" /><circle cx="32" cy="52" r="3" fill="currentColor" /></>}
    </svg>
  )
}

const assurances = [
  { title: "Genuine technology", detail: "Products you can trust", icon: "✓" },
  { title: "Secure shopping", detail: "A straightforward checkout", icon: "◇" },
  { title: "IT solutions", detail: "Support for business projects", icon: "⌘" },
  { title: "Talk to our team", detail: "Get help choosing the right tech", icon: "↗" },
]

export default function TritechHomeHero() {
  return (
    <main className="bg-white text-[#0B1B36]">
      <section className="relative isolate overflow-hidden bg-[#F3F7FF]">
        <div className="absolute -right-28 -top-32 -z-10 h-[34rem] w-[34rem] rounded-full bg-blue-200/60 blur-3xl" />
        <div className="absolute -bottom-36 left-[-7rem] -z-10 h-[25rem] w-[25rem] rounded-full bg-sky-100 blur-3xl" />
        <div className="content-container grid min-h-[470px] items-center gap-5 py-10 sm:py-14 lg:grid-cols-[.9fr_1.1fr] lg:py-12">
          <div className="relative z-10 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-blue-700 shadow-sm sm:text-[11px]">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Laptops · Networking · Technology
            </div>
            <h1 className="max-w-xl text-[2.65rem] font-extrabold leading-[1.04] tracking-[-.045em] text-[#07152E] sm:text-5xl lg:text-[3.8rem]">
              Tech that <span className="text-blue-600">powers</span> your world.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
              Discover reliable laptops, smart devices, networking equipment and accessories for work, business and everyday life.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <LocalizedClientLink href="/shop" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-blue-600 px-7 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
                Shop products <span className="ml-3 text-lg">→</span>
              </LocalizedClientLink>
              <LocalizedClientLink href="/it-solutions#request-quote" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-bold text-[#0B1B36] transition hover:border-blue-400 hover:text-blue-700">
                Request a quote
              </LocalizedClientLink>
            </div>
            <p className="mt-6 text-xs font-medium text-slate-500">Personal technology and business IT solutions, in one place.</p>
          </div>
          <div className="relative mx-auto w-full max-w-[690px] lg:ml-auto">
            <div className="absolute inset-x-10 bottom-5 h-12 rounded-full bg-blue-900/15 blur-2xl" />
            <Image
              src="/tritech-hero-devices.svg"
              alt="Laptop, smartphone, headphones, smartwatch and wireless speaker"
              width={1200}
              height={760}
              priority
              className="relative h-auto w-full drop-shadow-[0_24px_35px_rgba(22,55,105,0.13)]"
            />
            <div className="absolute bottom-5 left-2 hidden rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-xl sm:block">
              <p className="text-[9px] font-bold uppercase tracking-[.16em] text-blue-600">TRITECH</p>
              <p className="mt-0.5 text-xs font-bold text-[#0B1B36]">Technology that powers your world.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <div className="content-container grid grid-cols-2 gap-y-4 py-5 sm:grid-cols-4 sm:py-6">
          {assurances.map((item) => (
            <div key={item.title} className="flex items-center gap-3 px-2 sm:justify-center sm:border-r sm:border-slate-100 sm:last:border-r-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-700">{item.icon}</span>
              <span><span className="block text-xs font-bold text-[#0B1B36]">{item.title}</span><span className="mt-0.5 block text-[10px] text-slate-500 sm:text-[11px]">{item.detail}</span></span>
            </div>
          ))}
        </div>
      </section>

      <section className="content-container py-12 sm:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-600">Find what you need</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#07152E] sm:text-3xl">Shop by category</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">Explore the technology and equipment for your home, office or organisation.</p>
          </div>
          <LocalizedClientLink href="/categories" className="shrink-0 text-xs font-bold text-blue-700 hover:text-blue-900 sm:text-sm">View all <span aria-hidden="true">→</span></LocalizedClientLink>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {departments.map((item) => (
            <LocalizedClientLink key={item.code} href="/shop" className="group flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-[#F5F8FF] px-3 py-5 text-center transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5">
              <span className="mb-3 flex h-[76px] w-full items-center justify-center rounded-xl bg-[#EAF1FF] transition group-hover:bg-blue-100"><CategoryIcon kind={item.icon} /></span>
              <span className="text-xs font-bold text-[#0B1B36]">{item.title}</span>
              <span className="mt-1 hidden text-[10px] leading-4 text-slate-500 sm:block">{item.detail}</span>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      <section className="bg-[#F4F7FC] py-12 sm:py-16">
        <div className="content-container grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-blue-600">For businesses and organisations</p>
            <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-[#07152E] sm:text-3xl">More than a technology store.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">Planning a network installation, upgrading your infrastructure or sourcing equipment in bulk? TRITECH can help you scope the right technology for your project.</p>
            <LocalizedClientLink href="/it-solutions" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#07152E] px-6 text-sm font-bold text-white transition hover:bg-blue-700">Explore IT solutions <span className="ml-3">→</span></LocalizedClientLink>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["01", "Network design & installation"],
              ["02", "Structured and fibre cabling"],
              ["03", "Wireless connectivity"],
              ["04", "Servers, storage & support"],
            ].map(([number, title]) => (
              <div key={number} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="text-xs font-extrabold tracking-widest text-blue-600">{number}</span>
                <h3 className="mt-4 text-sm font-bold leading-5 text-[#0B1B36]">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

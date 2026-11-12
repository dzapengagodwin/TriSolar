import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const departments = [
  { code: "01", title: "Laptops & computers", detail: "Business, student, gaming and desktop systems" },
  { code: "02", title: "Networking equipment", detail: "Routers, switches and wireless access points" },
  { code: "03", title: "Network infrastructure", detail: "Racks, cabinets, cabling and fibre solutions" },
  { code: "04", title: "Computer accessories", detail: "Monitors, peripherals, storage and adapters" },
  { code: "05", title: "Servers & storage", detail: "Reliable infrastructure for growing organisations" },
  { code: "06", title: "Wireless solutions", detail: "Point-to-point links and outdoor connectivity" },
]

const services = [
  { number: "01", title: "Network design & installation", detail: "Plan and deploy secure, dependable networks for your premises." },
  { number: "02", title: "Structured & fibre cabling", detail: "Professional copper and fibre infrastructure built to scale." },
  { number: "03", title: "Servers & business infrastructure", detail: "Server, storage and infrastructure solutions for your organisation." },
  { number: "04", title: "Maintenance & support", detail: "Keep your technology reliable with ongoing technical support." },
]

export default function TritechHomeHero() {
  return (
    <main className="bg-white text-slate-900">
      <section className="relative isolate overflow-hidden bg-[#07152E]">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/hero-laptops.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07152E] via-[#07152E]/95 to-[#07152E]/55" />
          <div className="absolute -right-24 -top-32 h-[30rem] w-[30rem] rounded-full bg-blue-500/20 blur-3xl" />
        </div>
        <div className="content-container grid min-h-[520px] items-center gap-10 py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[.2em] text-blue-200">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Technology retail · IT solutions
            </div>
            <h1 className="max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Technology that powers your <span className="text-blue-400">world.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              Shop trusted technology for work and everyday life, or partner with our team to plan and deliver the IT infrastructure your organisation needs.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LocalizedClientLink href="/shop" className="inline-flex min-h-12 items-center justify-center rounded-md bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500">
                Explore products <span className="ml-3 text-lg">→</span>
              </LocalizedClientLink>
              <a href="#request-quote" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/35 bg-white/5 px-7 text-sm font-semibold text-white transition hover:border-blue-300 hover:bg-white/10">
                Request a quote <span className="ml-3 text-lg">↗</span>
              </a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-xs font-medium text-slate-300">
              <span>Technology for professionals</span>
              <span>Business-ready infrastructure</span>
              <span>One trusted partner</span>
            </div>
          </div>
          <div className="relative hidden min-h-[360px] lg:block">
            <div className="absolute right-0 top-1/2 h-[340px] w-[90%] -translate-y-1/2 rounded-2xl border border-white/10 bg-white/[.06] p-5 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-white"><span className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm">T.</span> TRITECH</div>
                <span className="text-[10px] uppercase tracking-[.18em] text-blue-200">Technology, connected</span>
              </div>
              <div className="relative mt-5 h-[245px] overflow-hidden rounded-xl bg-slate-900">
                <Image src="/hero-laptops.webp" alt="Professional laptops and computer technology" fill sizes="(min-width: 1024px) 40vw, 0px" className="object-contain p-3" />
              </div>
              <div className="absolute -bottom-5 -left-8 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Your technology partner</p>
                <p className="mt-1 text-sm font-bold text-slate-900">Products + IT solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-container py-16 sm:py-20">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Explore the store</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1B36] sm:text-4xl">Technology for every setup.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">From everyday computing to business-grade infrastructure, find the equipment that keeps you moving.</p>
          </div>
          <LocalizedClientLink href="/shop" className="text-sm font-semibold text-blue-700 transition hover:text-blue-500">View all products <span aria-hidden="true">→</span></LocalizedClientLink>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((item) => (
            <LocalizedClientLink key={item.code} href="/shop" className="group flex min-h-[150px] items-start gap-5 rounded-xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-sm font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">{item.code}</span>
              <span>
                <span className="block text-base font-bold text-[#0B1B36]">{item.title}</span>
                <span className="mt-2 block text-sm leading-6 text-slate-500">{item.detail}</span>
                <span className="mt-4 inline-block text-xs font-semibold text-blue-700">Explore department ↗</span>
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </section>

      <section className="bg-[#F4F7FC] py-16 sm:py-20" id="it-solutions">
        <div className="content-container">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Beyond the store</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#0B1B36] sm:text-4xl">The right technology. Properly delivered.</h2>
              <p className="mt-5 text-sm leading-7 text-slate-600">TRITECH works with businesses, schools and institutions to plan, supply and implement dependable technology environments. Tell us what you need and our team can help scope the project.</p>
              <a href="#request-quote" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-[#0B1B36] px-6 text-sm font-semibold text-white transition hover:bg-blue-700">Discuss your project <span className="ml-3">→</span></a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <div key={service.number} className="rounded-xl border border-slate-200 bg-white p-6">
                  <span className="text-xs font-bold tracking-widest text-blue-600">{service.number} / SERVICE</span>
                  <h3 className="mt-5 text-base font-bold text-[#0B1B36]">{service.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{service.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="request-quote" className="bg-[#07152E] py-14 sm:py-16">
        <div className="content-container flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-300">Have a project in mind?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">Let’s build the right solution for your business.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Tell us about your network, infrastructure or bulk technology requirements.</p>
          </div>
          <LocalizedClientLink href="/it-solutions#request-quote" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-md bg-blue-600 px-7 text-sm font-semibold text-white transition hover:bg-blue-500">Request a project quotation <span className="ml-3">↗</span></LocalizedClientLink>
        </div>
      </section>
    </main>
  )
}

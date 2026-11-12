import type { Metadata } from "next"
import QuoteRequestForm from "./quote-request-form"

export const metadata: Metadata = {
  title: "IT Solutions & Project Quotations | TRITECH",
  description: "Network design, structured cabling, fibre, wireless deployment, servers and business IT infrastructure. Request a TRITECH project quotation.",
}

const solutions = [
  { number: "01", title: "Network design & installation", description: "Plan and deploy secure wired and wireless networks for offices, campuses, schools and commercial sites." },
  { number: "02", title: "Structured & fibre cabling", description: "Build reliable connectivity with structured copper cabling, fibre links, patch panels and network cabinets." },
  { number: "03", title: "Wireless network deployment", description: "Improve coverage and connectivity with managed Wi-Fi, outdoor access points and point-to-point wireless links." },
  { number: "04", title: "Servers & storage", description: "Source and deploy server, NAS and storage infrastructure to support your organisation's systems and data." },
  { number: "05", title: "Network maintenance & support", description: "Keep your environment performing with troubleshooting, upgrades, maintenance and technical support." },
  { number: "06", title: "Business technology supply", description: "Request quotations for laptops, networking equipment, accessories and bulk IT hardware procurement." },
]

export default function ITSolutionsPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="relative overflow-hidden bg-[#07152E]">
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="content-container relative py-20 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-300">TRITECH business solutions</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">Technology infrastructure built around your business.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">From a new office network to a complete infrastructure project, TRITECH helps organisations plan, source and implement the technology they need to work with confidence.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#request-quote" className="inline-flex min-h-12 items-center justify-center rounded-md bg-blue-600 px-7 text-sm font-semibold text-white transition hover:bg-blue-500">Request a project quote <span className="ml-3">→</span></a>
            <a href="#our-services" className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/30 px-7 text-sm font-semibold text-white transition hover:bg-white/10">Explore our services</a>
          </div>
        </div>
      </section>

      <section id="our-services" className="content-container py-16 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">What we do</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1B36] sm:text-4xl">Practical IT solutions. One technology partner.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">We support businesses, schools, institutions and growing teams with technology procurement and infrastructure services.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => (
            <article key={solution.number} className="rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5">
              <span className="text-xs font-bold tracking-[.18em] text-blue-600">SERVICE {solution.number}</span>
              <h3 className="mt-5 text-lg font-bold text-[#0B1B36]">{solution.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{solution.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#F4F7FC] py-16 sm:py-20">
        <div className="content-container grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1B36]">A clear process from brief to delivery.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">Share your requirements and we can work with you to understand the scope, recommend an approach and prepare a quotation.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-5"><span className="text-xs font-bold text-blue-600">01 / DISCOVER</span><h3 className="mt-4 font-bold text-[#0B1B36]">Tell us what you need</h3><p className="mt-2 text-sm leading-6 text-slate-500">Share your goals, location and project requirements.</p></div>
            <div className="rounded-xl bg-white p-5"><span className="text-xs font-bold text-blue-600">02 / PLAN</span><h3 className="mt-4 font-bold text-[#0B1B36]">We scope the solution</h3><p className="mt-2 text-sm leading-6 text-slate-500">We review the brief and clarify the equipment and services involved.</p></div>
            <div className="rounded-xl bg-white p-5"><span className="text-xs font-bold text-blue-600">03 / QUOTE</span><h3 className="mt-4 font-bold text-[#0B1B36]">Receive a proposal</h3><p className="mt-2 text-sm leading-6 text-slate-500">Get a project quotation to review with your team.</p></div>
          </div>
        </div>
      </section>

      <section id="request-quote" className="content-container scroll-mt-24 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Start a conversation</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0B1B36] sm:text-4xl">Request a project quotation.</h2>
            <p className="mt-5 text-sm leading-7 text-slate-500">Give us a few details about your organisation and the work you have in mind. The more context you provide, the easier it is to understand your requirements.</p>
            <div className="mt-8 rounded-xl bg-[#07152E] p-6 text-white">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">For organisations</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">Need several products or a complete network installation? Use this form for project and bulk procurement enquiries rather than a standard shopping cart order.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <QuoteRequestForm destinationEmail={process.env.NEXT_PUBLIC_QUOTE_EMAIL} />
          </div>
        </div>
      </section>
    </main>
  )
}

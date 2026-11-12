import type { Metadata } from "next"
import { getPageSeo } from "@lib/data/seo"
import { generatePageMetadata } from "@lib/seo/page"

type Props = {
  params: Promise<{ countryCode: string }>
}

const CONTACT_EMAIL = "godwindzapenga06@gmail.com"
const WHATSAPP_URL =
  "https://wa.me/263784721912?text=Hello%20TRITECH%2C%20I%20would%20like%20to%20make%20an%20enquiry."

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const seo = await getPageSeo("contact")

  return generatePageMetadata(
    { path: "/contact" },
    params.countryCode,
    seo
  )
}

export default function ContactPage() {
  return (
    <main className="min-h-[70vh] bg-[#F5F8FC]">
      <section className="relative overflow-hidden bg-[#07152E]">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="content-container relative py-16 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-blue-300">We are here to help</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Let’s talk technology.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Need a laptop, networking equipment or a complete IT infrastructure solution? Contact TRITECH and tell us what you need.
          </p>
        </div>
      </section>

      <section className="content-container grid gap-6 py-12 sm:py-16 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Get in touch</p>
          <h2 className="mt-3 text-2xl font-bold text-[#0B1B36]">How can we help?</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Choose the contact method that works best for you. For project work, you can also send us a detailed quotation request.
          </p>

          <div className="mt-8 space-y-4">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-xl border border-green-200 bg-green-50 p-5 transition hover:border-green-400 hover:bg-green-100">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
                <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden="true"><path d="M16.02 3C8.85 3 3.02 8.79 3.02 15.92c0 2.28.6 4.5 1.74 6.45L3 29l6.83-1.78a13.1 13.1 0 0 0 6.18 1.55h.01c7.16 0 13-5.8 13-12.93A12.84 12.84 0 0 0 25.2 6.7 12.96 12.96 0 0 0 16.02 3Zm0 23.56h-.01a10.9 10.9 0 0 1-5.55-1.51l-.4-.24-4.05 1.06 1.08-3.92-.26-.4a10.7 10.7 0 0 1-1.66-5.63c0-5.95 4.88-10.8 10.88-10.8 2.9 0 5.63 1.12 7.68 3.16a10.7 10.7 0 0 1 3.18 7.64c0 5.95-4.88 10.8-10.89 10.8Z"/></svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-green-950">Chat with us on WhatsApp</span>
                <span className="mt-1 block text-sm text-green-800">078 472 1912</span>
              </span>
              <span className="text-lg text-green-700 transition group-hover:translate-x-1">→</span>
            </a>

            <a href={`mailto:${CONTACT_EMAIL}`} className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:bg-blue-50">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EAF1FF] text-blue-700">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#0B1B36]">Email our team</span>
                <span className="mt-1 block break-all text-sm text-slate-500">{CONTACT_EMAIL}</span>
              </span>
              <span className="text-lg text-blue-700 transition group-hover:translate-x-1">→</span>
            </a>
          </div>

          <div className="mt-8 rounded-xl bg-[#F5F8FC] p-5">
            <h3 className="text-sm font-bold text-[#0B1B36]">Need a project quotation?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">Tell us about your network installation, equipment supply or IT infrastructure requirements.</p>
            <a href="/it-solutions#request-quote" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-500">Request a quotation <span>↗</span></a>
          </div>
        </div>

        <aside className="flex flex-col justify-between rounded-2xl bg-[#0B1B36] p-7 text-white shadow-sm sm:p-9">
          <div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-lg font-extrabold">T.</span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-blue-300">TRITECH</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight">Technology that powers your world.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">Laptops. Networking. Technology. A technology retail and IT solutions partner for individuals and organisations.</p>
          </div>
          <div className="mt-12 border-t border-white/15 pt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Contact hours</p>
            <p className="mt-3 text-sm text-slate-200">Send us a WhatsApp message or email anytime. We’ll respond as soon as we can.</p>
          </div>
        </aside>
      </section>
    </main>
  )
}

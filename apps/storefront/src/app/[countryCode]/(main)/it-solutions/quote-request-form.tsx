"use client"

import { FormEvent, useState } from "react"

type QuoteRequestFormProps = {
  destinationEmail?: string
}

export default function QuoteRequestForm({ destinationEmail }: QuoteRequestFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    const form = event.currentTarget
    const data = new FormData(form)
    const fields = [
      ["Contact name", data.get("name")],
      ["Organisation", data.get("organisation")],
      ["Email", data.get("email")],
      ["Phone", data.get("phone")],
      ["Project type", data.get("projectType")],
      ["Project location", data.get("location")],
      ["Estimated budget", data.get("budget") || "Not specified"],
      ["Project requirements", data.get("requirements")],
      ["Preferred contact method", data.get("contactMethod")],
    ]
    const body = fields.map(([label, value]) => `${label}: ${String(value || "").trim()}`).join("\n\n")

    if (!destinationEmail) {
      setError("The quotation inbox has not been configured yet. Please contact the TRITECH team directly while we complete the email setup.")
      return
    }

    const subject = encodeURIComponent(`TRITECH project quotation request - ${String(data.get("organisation") || data.get("name"))}`)
    window.location.href = `mailto:${destinationEmail}?subject=${subject}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
    form.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitted && (
        <div role="status" className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
          Your email application has opened with the quotation details. Review the message and send it to complete your request.
        </div>
      )}
      {error && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</div>}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">Your name *
          <input name="name" required autoComplete="name" className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="Full name" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Company / organisation *
          <input name="organisation" required autoComplete="organization" className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="Organisation name" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Work email *
          <input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="name@company.com" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Phone number *
          <input name="phone" type="tel" required autoComplete="tel" className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="+263 ..." />
        </label>
        <label className="block text-sm font-medium text-slate-700">What do you need? *
          <select name="projectType" required defaultValue="" className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
            <option value="" disabled>Select a service</option>
            <option>Network design and installation</option>
            <option>Structured cabling</option>
            <option>Fibre optic networking</option>
            <option>Wireless network deployment</option>
            <option>Servers and storage</option>
            <option>Network maintenance and support</option>
            <option>Bulk IT hardware supply</option>
            <option>Other IT infrastructure project</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">Project location *
          <input name="location" required className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="City / town and site" />
        </label>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Estimated budget
          <select name="budget" defaultValue="" className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100">
            <option value="">Not sure yet</option>
            <option>Under US$500</option>
            <option>US$500 – US$2,000</option>
            <option>US$2,000 – US$5,000</option>
            <option>US$5,000 – US$10,000</option>
            <option>Above US$10,000</option>
            <option>Prefer to discuss</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Tell us about your project *
          <textarea name="requirements" required rows={6} className="mt-2 w-full resize-y rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100" placeholder="Describe your current setup, what you want to achieve, number of users or devices, and any important timelines." />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-slate-700">Preferred way to contact you</legend>
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-600">
            <label className="inline-flex items-center gap-2"><input type="radio" name="contactMethod" value="Email" defaultChecked className="accent-blue-600" /> Email</label>
            <label className="inline-flex items-center gap-2"><input type="radio" name="contactMethod" value="Phone call" className="accent-blue-600" /> Phone call</label>
            <label className="inline-flex items-center gap-2"><input type="radio" name="contactMethod" value="WhatsApp" className="accent-blue-600" /> WhatsApp</label>
          </div>
        </fieldset>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-5 text-slate-500">Submitting this enquiry prepares an email with your project details. We will only receive it once you send that email.</p>
        <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-md bg-blue-600 px-7 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2">Prepare quotation request <span className="ml-3">→</span></button>
      </div>
    </form>
  )
}

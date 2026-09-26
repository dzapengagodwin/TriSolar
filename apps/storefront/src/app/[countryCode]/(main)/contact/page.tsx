import { Metadata } from "next"
import ContactForm from "./contact-form"

export const metadata: Metadata = {
  title: "Contact Us | Laptopzone",
  description: "Get in touch with our customer support team for inquiries, orders, and tech assistance.",
}

export default async function ContactPage() {
  return (
    <div className="bg-white">
      {/* Top Map Banner */}
      <div className="w-full h-[360px] sm:h-[420px] bg-gray-100 border-b border-gray-200 relative overflow-hidden group">
        <iframe
          title="Laptopzone Store Location"
          src="https://maps.google.com/maps?q=-17.7789542,31.0952320&t=&z=16&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full grayscale-[15%] contrast-[105%]"
        />
        <a
          href="https://maps.app.goo.gl/T2r4LtMh7heTFDYN7?g_st=ic"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-gray-900 shadow-md border border-gray-200/80 px-3.5 py-2 rounded-lg text-xs font-medium inline-flex items-center gap-2 transition-all hover:shadow-lg backdrop-blur-sm"
        >
          <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          </svg>
          <span>Open in Google Maps</span>
        </a>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Leave us a Message */}
          <div className="lg:col-span-8">
            {/* Header with signature primary accent underline */}
            <div className="relative border-b border-gray-200 pb-3 mb-6">
              <h1 className="text-2xl sm:text-3xl font-medium text-gray-800 tracking-tight">
                Leave us a Message
              </h1>
              <span
                className="absolute -bottom-[1px] left-0 h-[2.5px] w-28 bg-primary"
                aria-hidden="true"
              />
            </div>

            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-8 max-w-2xl">
              Have questions about our laptops, technical specifications, or need assistance with your order?
              Fill out the form below and our team will get back to you promptly.
            </p>

            <ContactForm />
          </div>

          {/* Right Column: Our Store */}
          <div className="lg:col-span-4">
            {/* Header with signature primary accent underline */}
            <div className="relative border-b border-gray-200 pb-3 mb-6">
              <h2 className="text-2xl sm:text-3xl font-medium text-gray-800 tracking-tight">
                Our Store
              </h2>
              <span
                className="absolute -bottom-[1px] left-0 h-[2.5px] w-16 bg-primary"
                aria-hidden="true"
              />
            </div>

            {/* Address */}
            <div className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-8 space-y-1">
              <p className="font-semibold text-gray-900">Laptopzone Store</p>
              <p>64 Ridgeway, Borrowdale</p>
              <p>Harare, Zimbabwe</p>
              <div className="pt-1.5 pb-1">
                <a
                  href="https://maps.app.goo.gl/T2r4LtMh7heTFDYN7?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                  </svg>
                  <span>Get directions on Google Maps</span>
                </a>
              </div>
              <p className="pt-2 text-gray-600">
                <span className="font-medium text-gray-800">Phone: </span>
                <a href="tel:+2638612600600" className="hover:text-primary transition-colors">
                  +263 8612 600 600
                </a>
              </p>
              <p className="text-gray-600">
                <span className="font-medium text-gray-800">Support: </span>
                <a href="mailto:support@laptopzone.co.zw" className="hover:text-primary transition-colors">
                  support@laptopzone.co.zw
                </a>
              </p>
            </div>

            {/* Hours of Operation */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-3">
                Hours of Operation
              </h3>
              <div className="space-y-1.5 text-xs sm:text-sm text-gray-600">
                <p>Monday: 8:00 AM – 5:00 PM</p>
                <p>Tuesday: 8:00 AM – 5:00 PM</p>
                <p>Wednesday: 8:00 AM – 5:00 PM</p>
                <p>Thursday: 8:00 AM – 5:00 PM</p>
                <p>Friday: 8:00 AM – 5:00 PM</p>
                <p>Saturday: 9:00 AM – 1:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>

            {/* Careers */}
            <div>
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm mb-2">
                Careers
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                If you&apos;re interested in employment opportunities at Laptopzone, please email us:{" "}
                <a
                  href="mailto:contact@laptopzone.co.zw"
                  className="underline text-gray-800 hover:text-primary font-medium transition-colors"
                >
                  contact@laptopzone.co.zw
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

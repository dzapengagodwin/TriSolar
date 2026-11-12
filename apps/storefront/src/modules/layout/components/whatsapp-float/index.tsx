const WHATSAPP_URL =
  "https://wa.me/263784721912?text=Hello%20TRITECH%2C%20I%20would%20like%20to%20make%20an%20enquiry."

export default function WhatsAppFloat() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with TRITECH on WhatsApp"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-[#16A34A] px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-green-950/20 transition hover:-translate-y-1 hover:bg-[#15803D] focus:outline-none focus:ring-4 focus:ring-green-300"
    >
      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M16.02 3C8.85 3 3.02 8.79 3.02 15.92c0 2.28.6 4.5 1.74 6.45L3 29l6.83-1.78a13.1 13.1 0 0 0 6.18 1.55h.01c7.16 0 13-5.8 13-12.93A12.84 12.84 0 0 0 25.2 6.7 12.96 12.96 0 0 0 16.02 3Zm0 23.56h-.01a10.9 10.9 0 0 1-5.55-1.51l-.4-.24-4.05 1.06 1.08-3.92-.26-.4a10.7 10.7 0 0 1-1.66-5.63c0-5.95 4.88-10.8 10.88-10.8 2.9 0 5.63 1.12 7.68 3.16a10.7 10.7 0 0 1 3.18 7.64c0 5.95-4.88 10.8-10.89 10.8Zm5.97-8.1c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.74.16-.22.33-.85 1.06-1.04 1.28-.19.22-.38.25-.71.08-.33-.16-1.39-.51-2.65-1.63-.98-.87-1.64-1.94-1.83-2.27-.19-.33-.02-.5.14-.66.15-.14.33-.38.49-.57.16-.19.22-.33.33-.55.11-.22.06-.41-.03-.57-.08-.16-.74-1.77-1.01-2.43-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.57.08-.87.41-.3.33-1.14 1.11-1.14 2.7 0 1.59 1.17 3.13 1.33 3.35.16.22 2.3 3.49 5.57 4.9.78.34 1.39.54 1.86.69.78.25 1.49.21 2.05.13.63-.09 1.93-.79 2.2-1.56.27-.77.27-1.43.19-1.56-.08-.14-.3-.22-.63-.38Z" />
      </svg>
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  )
}

import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Laptopzone",
  description: "Find help with orders, delivery, returns, payments, and Laptopzone customer support.",
  alternates: { canonical: "/faq" },
}

const questions = [
  {
    question: "Where can I find delivery information?",
    answer: "See our delivery terms for current delivery and collection information.",
    href: "/delivery-terms",
    label: "Delivery terms",
  },
  {
    question: "Where can I read the returns policy?",
    answer: "Our returns and refunds page explains the current process and conditions.",
    href: "/returns-and-refunds",
    label: "Returns and refunds",
  },
  {
    question: "How do I get help with an order?",
    answer: "Use your account to review orders, or contact our support team for assistance.",
    href: "/customer-help",
    label: "Customer help",
  },
]

export default function FaqPage() {
  return (
    <main className="content-container py-12">
      <h1 className="text-3xl font-semibold text-gray-900">Frequently Asked Questions</h1>
      <div className="mt-8 max-w-3xl divide-y divide-gray-200">
        {questions.map((item) => (
          <section key={item.question} className="py-6">
            <h2 className="text-lg font-medium text-gray-900">{item.question}</h2>
            <p className="mt-2 text-gray-600">{item.answer}</p>
            <LocalizedClientLink href={item.href} className="mt-3 inline-block text-primary underline">
              {item.label}
            </LocalizedClientLink>
          </section>
        ))}
      </div>
    </main>
  )
}

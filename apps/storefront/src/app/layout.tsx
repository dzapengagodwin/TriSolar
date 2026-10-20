import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Montserrat } from "next/font/google"
import GoogleAnalytics from "@modules/analytics/components/google-analytics"
import PageViewTracker from "@modules/analytics/components/page-view-tracker"
import WhatsAppFAB from "@modules/common/components/whatsapp-fab"
// @ts-ignore -- Next.js handles this global CSS side-effect import.
import "../styles/globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: { url: "/favicon.png", type: "image/png" },
    shortcut: "/favicon.png",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={montserrat.variable} suppressHydrationWarning>
      <body className={`${montserrat.className} font-sans antialiased`} suppressHydrationWarning>
        <GoogleAnalytics />
        <PageViewTracker />
        <main className="relative">{props.children}</main>
        <WhatsAppFAB />
      </body>
    </html>
  )
}

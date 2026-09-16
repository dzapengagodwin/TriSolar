import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Inter } from "next/font/google"
import GoogleAnalytics from "@modules/analytics/components/google-analytics"
import PageViewTracker from "@modules/analytics/components/page-view-tracker"
import "styles/globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" data-mode="light" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`} suppressHydrationWarning>
        <GoogleAnalytics />
        <PageViewTracker />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}

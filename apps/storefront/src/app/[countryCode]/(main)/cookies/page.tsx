import { Metadata } from "next"
import PolicyPageLayout from "@modules/content/components/policy-page-layout"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Cookie Policy | Laptopzone",
  description:
    "Learn about the cookies and local storage technologies used on Laptopzone to provide shopping cart services, account security, and analytics.",
}

export default async function CookiesPage() {
  return (
    <PolicyPageLayout
      title="Cookie Policy"
      subtitle="This policy explains what cookies are, how we use them on Laptopzone, and how you can control your preferences."
      activePolicy="cookies"
      lastUpdated="September 2026"
    >
      {/* 1. What Are Cookies */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          1. What Are Cookies?
        </h2>
        <p>
          Cookies are small text files placed on your computer, smartphone, or tablet when you visit websites. They are widely used to make websites work efficiently, provide a smooth browsing experience, and deliver analytical information to site operators.
        </p>
        <p>
          In addition to cookies, Laptopzone may also use related web storage technologies (such as browser <span className="font-semibold text-gray-900">localStorage</span> and <span className="font-semibold text-gray-900">sessionStorage</span>) to temporarily store your preferences, such as your active shopping cart items and cookie consent choice.
        </p>
      </section>

      {/* 2. Categories of Cookies We Use */}
      <section className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          2. Categories of Cookies We Use
        </h2>

        <div className="space-y-4 pt-1">
          {/* A. Strictly Necessary */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                A. Strictly Necessary Cookies (Essential)
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-800 px-2 py-0.5 rounded-md">
                Always Active
              </span>
            </div>
            <p className="text-xs text-gray-600">
              These cookies are strictly necessary for the website to function. They allow you to browse our catalog, maintain items in your shopping bag as you navigate between pages, log in to your customer account, and proceed through checkout securely. Without these cookies, our e-commerce platform cannot operate.
            </p>
          </div>

          {/* B. Functional */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
              B. Functional &amp; Preference Cookies
            </h3>
            <p className="text-xs text-gray-600">
              These cookies enable the website to provide enhanced personalization. They remember your country and region selection, currency display settings, and preserve items saved in your Wishlist between sessions.
            </p>
          </div>

          {/* C. Performance & Analytics */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
              C. Performance &amp; Analytics Cookies
            </h3>
            <p className="text-xs text-gray-600">
              These cookies help us understand how visitors interact with our website by collecting aggregated, anonymous data (such as page visit counts, loading speeds, and search query trends). This allows us to optimize site performance and improve product discovery.
            </p>
          </div>

          {/* D. Marketing & Advertising */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
              D. Marketing &amp; Attribution Cookies
            </h3>
            <p className="text-xs text-gray-600">
              These cookies may be set through our site by advertising partners (such as Google or Meta) to measure the effectiveness of our marketing campaigns. They do not store directly personal information, but uniquely identify your browser and internet device.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Detailed Cookie Reference Table */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          3. Key Cookies Used on Laptopzone
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-200 rounded-2xl overflow-hidden">
            <thead className="bg-gray-100/70 text-gray-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3 border-b border-gray-200">Cookie / Storage Key</th>
                <th className="p-3 border-b border-gray-200">Category</th>
                <th className="p-3 border-b border-gray-200">Purpose</th>
                <th className="p-3 border-b border-gray-200">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-3 font-mono font-bold text-gray-900">_medusa_cart_id</td>
                <td className="p-3 text-gray-600">Essential</td>
                <td className="p-3 text-gray-600">Associates your session with your active shopping cart and checkout line items.</td>
                <td className="p-3 text-gray-600">30 Days</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="p-3 font-mono font-bold text-gray-900">_medusa_jwt</td>
                <td className="p-3 text-gray-600">Essential</td>
                <td className="p-3 text-gray-600">Stores secure customer authentication session token for account access.</td>
                <td className="p-3 text-gray-600">Session / 7 Days</td>
              </tr>
              <tr>
                <td className="p-3 font-mono font-bold text-gray-900">cookie-consent-accepted</td>
                <td className="p-3 text-gray-600">Functional</td>
                <td className="p-3 text-gray-600">Remembers whether you accepted or declined the cookie consent banner.</td>
                <td className="p-3 text-gray-600">1 Year (localStorage)</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="p-3 font-mono font-bold text-gray-900">medusa_region</td>
                <td className="p-3 text-gray-600">Functional</td>
                <td className="p-3 text-gray-600">Caches your current delivery region, currency, and tax configurations.</td>
                <td className="p-3 text-gray-600">1 Year</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Managing & Disabling Cookies */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          4. How Can You Control Cookies?
        </h2>
        <p>
          You have the right to accept or decline non-essential cookies. You can adjust your preferences via our on-site cookie banner or through your web browser settings.
        </p>
        <p>
          Most modern web browsers allow you to control cookie permissions through their settings menu:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li><span className="font-semibold text-gray-900">Google Chrome:</span> Settings &rarr; Privacy and security &rarr; Third-party cookies</li>
          <li><span className="font-semibold text-gray-900">Apple Safari:</span> Settings / Preferences &rarr; Privacy &rarr; Manage Website Data</li>
          <li><span className="font-semibold text-gray-900">Mozilla Firefox:</span> Settings &rarr; Privacy &amp; Security &rarr; Enhanced Tracking Protection</li>
          <li><span className="font-semibold text-gray-900">Microsoft Edge:</span> Settings &rarr; Cookies and site permissions</li>
        </ul>
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs space-y-1 text-amber-950">
          <p className="font-bold text-amber-900">Note on Disabling All Cookies</p>
          <p className="text-amber-800">
            If you choose to block all cookies in your browser (including essential cookies), key features of our website—such as adding laptops to your cart, user login, and completing payment—will no longer function.
          </p>
        </div>
      </section>

      {/* 5. Policy Updates */}
      <section className="space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          5. Updates to This Cookie Policy
        </h2>
        <p>
          We may update this Cookie Policy periodically to reflect technological changes, new operational cookies, or regulatory requirements. Any updates will be published on this page with an updated &quot;Last Updated&quot; date.
        </p>
        <p>
          For more information on how we handle your personal data, please review our{" "}
          <LocalizedClientLink href="/privacy-policy" className="text-primary font-semibold hover:underline">
            Privacy Policy
          </LocalizedClientLink>
          .
        </p>
      </section>
    </PolicyPageLayout>
  )
}


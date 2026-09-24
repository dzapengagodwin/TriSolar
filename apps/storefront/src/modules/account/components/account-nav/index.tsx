"use client"

import {
  ArrowRightOnRectangle,
  GridLayout,
  MapPin,
  ShoppingBag,
  User,
} from "@medusajs/icons"
import { clx } from "@modules/common/components/ui"
import { useParams, usePathname } from "next/navigation"

import { signout } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const navItems = [
  {
    label: "Overview",
    href: "/account",
    icon: GridLayout,
    testId: "overview-link",
    exact: true,
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: ShoppingBag,
    testId: "orders-link",
    exact: false,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
    testId: "addresses-link",
    exact: false,
  },
  {
    label: "Profile",
    href: "/account/profile",
    icon: User,
    testId: "profile-link",
    exact: false,
  },
]

const AccountNav = ({
  customer: _customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode)
  }

  const isItemActive = (href: string, exact: boolean) => {
    const fullPath = `/${countryCode}${href}`
    if (exact) {
      return route === fullPath
    }
    return route === fullPath || route?.startsWith(`${fullPath}/`)
  }

  return (
    <div>
      {/* Mobile Horizontal Tab Navigation */}
      <div className="md:hidden" data-testid="mobile-account-nav">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 border-b border-gray-100 mb-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isItemActive(item.href, item.exact)
            return (
              <LocalizedClientLink
                key={item.href}
                href={item.href}
                data-testid={item.testId}
                className={clx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150",
                  active
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-gray-50 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </LocalizedClientLink>
            )
          })}
          <button
            type="button"
            onClick={handleLogout}
            data-testid="logout-button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 text-gray-500 hover:text-red-600 hover:bg-red-50 ml-auto"
          >
            <ArrowRightOnRectangle className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* Desktop Vertical Sidebar Navigation */}
      <div className="hidden md:block" data-testid="account-nav">
        <div className="space-y-5">
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-3">
              Account
            </h3>
            <nav className="flex flex-col gap-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isItemActive(item.href, item.exact)
                return (
                  <LocalizedClientLink
                    key={item.href}
                    href={item.href}
                    data-testid={item.testId}
                    className={clx(
                      "flex items-center gap-x-3 py-2 px-3 rounded-lg transition-all duration-150 text-sm font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </LocalizedClientLink>
                )
              })}
            </nav>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleLogout}
              data-testid="logout-button"
              className="flex items-center gap-x-3 py-2 px-3 rounded-lg transition-all duration-150 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 w-full text-left"
            >
              <ArrowRightOnRectangle className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountNav

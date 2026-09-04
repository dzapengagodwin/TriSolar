"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark, BarsThree } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import { useState } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"


const SideMenuItems = {
  Account: "/account",
  Cart: "/cart",
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
  categories: HttpTypes.StoreProductCategory[]
}

type CategoryListProps = {
  categories: HttpTypes.StoreProductCategory[]
  allCategories: HttpTypes.StoreProductCategory[]
  close: () => void
  level?: number
}

const CategoryList = ({
  categories,
  allCategories,
  close,
  level = 0,
}: CategoryListProps) => {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({})

  return (
    <ul
      className={clx(
        "flex flex-col",
        level > 0 ? "mt-2 gap-2 border-l border-gray-100 pl-3" : "gap-3"
      )}
    >
      {categories.map((category) => {
        const children =
          category.category_children?.length
            ? category.category_children
            : allCategories.filter(
                (child) => child.parent_category_id === category.id
              )
        const isExpanded = expandedCategories[category.id]

        return (
          <li key={category.id}>
            <div className="flex items-center gap-2">
              <LocalizedClientLink
                href={`/categories/${category.handle}`}
                onClick={close}
                className={clx(
                  "flex-1 text-xl leading-8 hover:text-gray-900",
                  level > 0 && "py-1 text-base leading-7 text-gray-500 hover:text-gray-700"
                )}
              >
                {category.name}
              </LocalizedClientLink>
              {!!children.length && (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedCategories((previous) => ({
                      ...previous,
                      [category.id]: !previous[category.id],
                    }))
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} ${category.name}`}
                  aria-expanded={isExpanded}
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={isExpanded ? "M5 9l7 7 7-7" : "M9 5l7 7-7 7"}
                    />
                  </svg>
                </button>
              )}
            </div>
            {isExpanded && !!children.length && (
              <CategoryList
                categories={children}
                allCategories={allCategories}
                close={close}
                level={level + 1}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}

const SideMenu = ({
  regions,
  locales,
  currentLocale,
  categories,
}: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full items-center">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative flex items-center p-1.5 text-gray-800 hover:text-black focus:outline-none transition-colors"
                  aria-label="Open Navigation Menu"
                >
                  <BarsThree className="w-6 h-6 text-gray-900" />
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/30 pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0"
                enterTo="opacity-100 backdrop-blur-2xl"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 backdrop-blur-2xl"
                leaveTo="opacity-0"
              >
                <PopoverPanel className="fixed inset-y-0 left-0 z-[51] flex h-full w-[min(86vw,360px)] flex-col bg-white text-gray-900 shadow-2xl sm:w-1/3 2xl:w-1/4">
                  <div
                    data-testid="nav-menu-popup"
                    className="flex min-h-0 h-full flex-col"
                  >
                    <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4" id="xmark">
                      <span className="text-sm font-bold tracking-tight">Menu</span>
                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        aria-label="Close Navigation Menu"
                      >
                        <XMark className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                      <section aria-labelledby="mobile-categories-heading">
                        <h2
                          id="mobile-categories-heading"
                          className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-400"
                        >
                          Categories
                        </h2>
                        {categories.length ? (
                          <CategoryList
                            categories={
                              categories.filter(
                                (category) =>
                                  !category.parent_category_id &&
                                  !category.parent_category
                              ).length
                                ? categories.filter(
                                    (category) =>
                                      !category.parent_category_id &&
                                      !category.parent_category
                                  )
                                : categories
                            }
                            allCategories={categories}
                            close={close}
                          />
                        ) : (
                          <p className="text-sm text-gray-500">
                            No categories available.
                          </p>
                        )}
                      </section>

                      <section className="mt-8 border-t border-gray-100 pt-6" aria-labelledby="mobile-browse-heading">
                        <h2
                          id="mobile-browse-heading"
                          className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-400"
                        >
                          Browse
                        </h2>
                        <ul className="flex flex-col gap-3 text-sm text-gray-700">
                          {Object.entries(SideMenuItems).map(([name, href]) => {
                            return (
                              <li key={name}>
                                <LocalizedClientLink
                                  href={href}
                                  className="block py-1 hover:text-primary"
                                  onClick={close}
                                  data-testid={`${name.toLowerCase()}-link`}
                                >
                                  {name}
                                </LocalizedClientLink>
                              </li>
                            )
                          })}
                          <li>
                            <LocalizedClientLink
                              href="/contact"
                              className="block py-1 hover:text-primary"
                              onClick={close}
                              data-testid="customer-help-link"
                            >
                              Customer Help
                            </LocalizedClientLink>
                          </li>
                        </ul>
                      </section>

                      <section className="mt-8 border-t border-gray-100 pt-6" aria-labelledby="mobile-chat-heading">
                        <h2
                          id="mobile-chat-heading"
                          className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-400"
                        >
                          Want to chat?
                        </h2>
                        <a
                          href="tel:+2638612600600"
                          className="text-sm text-gray-700 hover:text-primary"
                        >
                          Call us +263 8612 600 600
                        </a>
                      </section>

                      <section className="mt-8 border-t border-gray-100 pt-6" aria-labelledby="mobile-social-heading">
                        <h2
                          id="mobile-social-heading"
                          className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-400"
                        >
                          Social
                        </h2>
                        <div className="flex flex-col gap-3 text-sm text-gray-700">
                          <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-primary">
                            Facebook
                          </a>
                          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-primary">
                            Twitter
                          </a>
                          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-primary">
                            Instagram
                          </a>
                        </div>
                      </section>
                    </div>

                    <div className="flex shrink-0 flex-col gap-y-4 border-t border-gray-100 bg-white px-5 py-4">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between text-sm text-gray-700"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between text-sm text-gray-700"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                   
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
